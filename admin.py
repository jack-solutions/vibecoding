from flask import Blueprint, jsonify
from models import db, Video, Comment
from auth import token_required
import os

admin_bp = Blueprint('admin', __name__)

LOGS = []

def log_action(action):
    LOGS.append(action)
    if len(LOGS) > 100:
        LOGS.pop(0)

@admin_bp.route('/admin/delete_video/<video_id>', methods=['DELETE'])
@token_required
def delete_video(current_user, video_id):
    if current_user.role != 'admin':
        return jsonify({'message': 'Permission denied'}), 403
        
    video = Video.query.get(video_id)
    if video:
        # Delete file if exists
        if video.filename:
            try:
                os.remove(os.path.join(os.getcwd(), 'youtube_clone', 'videos', video.filename))
            except:
                pass
        db.session.delete(video)
        db.session.commit()
        log_action(f"Admin {current_user.username} deleted video {video_id}")
        return jsonify({'message': 'Video deleted'}), 200
    return jsonify({'message': 'Video not found'}), 404

@admin_bp.route('/admin/delete_comment/<video_id>/<comment_id>', methods=['DELETE'])
@token_required
def admin_delete_comment(current_user, video_id, comment_id):
    if current_user.role != 'admin':
        return jsonify({'message': 'Permission denied'}), 403
        
    comment = Comment.query.get(comment_id)
    if comment:
        db.session.delete(comment)
        db.session.commit()
        log_action(f"Admin {current_user.username} deleted comment {comment_id}")
        return jsonify({'message': 'Comment deleted'}), 200
                
    return jsonify({'message': 'Comment not found'}), 404

@admin_bp.route('/admin/logs', methods=['GET'])
@token_required
def get_logs(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Permission denied'}), 403
    return jsonify(LOGS)
