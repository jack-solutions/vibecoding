import uuid
import datetime
from flask import Blueprint, request, jsonify
from models import db, Comment, Video
from auth import token_required

comments_bp = Blueprint('comments', __name__)

@comments_bp.route('/comment/<video_id>', methods=['POST'])
@token_required
def add_comment(current_user, video_id):
    if not Video.query.get(video_id):
        return jsonify({'message': 'Video not found'}), 404
        
    data = request.get_json()
    text = data.get('text')
    if not text:
        return jsonify({'message': 'Comment text required'}), 400
        
    new_comment = Comment(
        text=text,
        user_id=current_user.user_id,
        video_id=video_id
    )
    db.session.add(new_comment)
    db.session.commit()
    
    return jsonify({'message': 'Comment added', 'comment': {
        'comment_id': new_comment.comment_id,
        'text': new_comment.text
    }}), 201

@comments_bp.route('/comment/<video_id>', methods=['GET'])
def get_comments(video_id):
    comments = Comment.query.filter_by(video_id=video_id).order_by(Comment.timestamp.desc()).all()
    results = []
    for c in comments:
        results.append({
            'comment_id': c.comment_id,
            'user_id': c.user_id,
            'username': c.author.username,
            'text': c.text,
            'timestamp': c.timestamp.isoformat()
        })
    return jsonify(results)

@comments_bp.route('/comment/<video_id>/<comment_id>', methods=['DELETE'])
@token_required
def delete_comment(current_user, video_id, comment_id):
    comment = Comment.query.get(comment_id)
            
    if not comment:
        return jsonify({'message': 'Comment not found'}), 404
        
    # Check permissions: Owner of comment or Admin
    if comment.user_id != current_user.user_id and current_user.role != 'admin':
        return jsonify({'message': 'Permission denied'}), 403
        
    db.session.delete(comment)
    db.session.commit()
    return jsonify({'message': 'Comment deleted'}), 200
