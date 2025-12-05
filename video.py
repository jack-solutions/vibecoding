import os
import uuid
import datetime
from flask import Blueprint, request, jsonify, send_file, Response, current_app, send_from_directory
from models import db, Video, Channel, User, likes
from auth import token_required
from utils.video_utils import generate_thumbnail
import re

video_bp = Blueprint('video', __name__)

# Use absolute paths relative to the script execution directory
# app.py is run from c:\Users\...\youtube_clone
VIDEO_FOLDER = os.path.join(os.getcwd(), 'videos')
THUMBNAIL_FOLDER = os.path.join(os.getcwd(), 'thumbnails')

@video_bp.route('/upload', methods=['POST'])
@token_required
def upload_video(current_user):
    if current_user.role not in ['creator', 'admin', 'advertiser']: 
         return jsonify({'message': 'Permission denied'}), 403

    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400
        
    file = request.files['file']
    title = request.form.get('title')
    description = request.form.get('description', '')
    
    if file.filename == '' or not title:
        return jsonify({'message': 'No selected file or title missing'}), 400
        
    if not file.filename.lower().endswith('.mp4'):
         return jsonify({'message': 'Only MP4 allowed'}), 400

    video_id = str(uuid.uuid4())
    filename = f"{video_id}.mp4"
    file_path = os.path.join(VIDEO_FOLDER, filename)
    file.save(file_path)
    
    # Thumbnail
    thumbnail_filename = f"{video_id}.jpg"
    thumbnail_path = os.path.join(THUMBNAIL_FOLDER, thumbnail_filename)
    generate_thumbnail(file_path, thumbnail_path)
    
    new_video = Video(
        video_id=video_id,
        title=title,
        description=description,
        creator_id=current_user.user_id,
        filename=filename,
        thumbnail=thumbnail_filename
    )
    db.session.add(new_video)
    db.session.commit()
    
    return jsonify({'message': 'Video uploaded successfully', 'video_id': video_id}), 201

@video_bp.route('/video/<video_id>', methods=['GET'])
def get_video_details(video_id):
    video = Video.query.get(video_id)
    if not video:
        return jsonify({'message': 'Video not found'}), 404
        
    # Increment views
    video.views += 1
    db.session.commit()
    
    # Add to watch history logic is complex with strict models without a model for history yet
    # Assuming we skip history persistence for now or add it later if needed, or just simplistic:
    # See below for simple history tracking if we wanted:
    # if current_user:
    #    current_user_history.append(video)
    
    video_data = {
        "video_id": video.video_id,
        "title": video.title,
        "description": video.description,
        "creator_id": video.creator_id,
        "creator_name": video.channel.name,
        "filename": video.filename,
        "thumbnail": video.thumbnail,
        "views": video.views,
        "likes": len(video.liked_by),
        "upload_date": video.upload_date.isoformat()
    }

    return jsonify(video_data)

@video_bp.route('/stream/<video_id>', methods=['GET'])
def stream_video(video_id):
    video = Video.query.get(video_id)
    if not video:
        return jsonify({'message': 'Video not found'}), 404
    
    path = os.path.join(VIDEO_FOLDER, video.filename)
    if not os.path.exists(path):
         return jsonify({'message': 'File not found on server'}), 404

    range_header = request.headers.get('Range', None)
    if not range_header:
        return send_file(path)
        
    size = os.path.getsize(path)
    byte1, byte2 = 0, None
    
    m = re.search('(\d+)-(\d*)', range_header)
    g = m.groups()
    
    if g[0]: byte1 = int(g[0])
    if g[1]: byte2 = int(g[1])
    
    length = size - byte1
    if byte2 is not None:
        length = byte2 + 1 - byte1
    
    data = None
    with open(path, 'rb') as f:
        f.seek(byte1)
        data = f.read(length)
        
    rv = Response(data, 206, mimetype='video/mp4', direct_passthrough=True)
    rv.headers.add('Content-Range', 'bytes {0}-{1}/{2}'.format(byte1, byte1 + length - 1, size))
    return rv

@video_bp.route('/search', methods=['GET'])
def search_videos():
    query = request.args.get('q', '').lower()
    # Simple search
    videos = Video.query.filter(
        (Video.title.ilike(f'%{query}%')) | 
        (Video.description.ilike(f'%{query}%'))
    ).all()
    
    results = []
    for v in videos:
        results.append({
            "video_id": v.video_id,
            "title": v.title,
            "creator_name": v.channel.name,
            "thumbnail": v.thumbnail,
            "views": v.views
        })
            
    return jsonify(results)

@video_bp.route('/recommended/<video_id>', methods=['GET'])
def start_recommendations(video_id):
    # Recommend 5 random other videos
    videos = Video.query.filter(Video.video_id != video_id).limit(5).all()
    recs = []
    for v in videos:
        recs.append({
            "video_id": v.video_id,
            "title": v.title,
            "creator_name": v.channel.name,
            "thumbnail": v.thumbnail,
            "views": v.views
        })
    return jsonify(recs)

@video_bp.route('/thumbnail/<filename>')
def get_thumbnail(filename):
    return send_from_directory(THUMBNAIL_FOLDER, filename)

@video_bp.route('/like/<video_id>', methods=['POST'])
@token_required
def like_video(current_user, video_id):
    video = Video.query.get(video_id)
    if not video:
        return jsonify({'message': 'Video not found'}), 404
        
    if current_user in video.liked_by:
        video.liked_by.remove(current_user)
        msg = 'Unliked'
    else:
        video.liked_by.append(current_user)
        msg = 'Liked'
        
    db.session.commit()
    return jsonify({'message': msg, 'likes': len(video.liked_by)}), 200

