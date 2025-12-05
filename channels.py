from flask import Blueprint, request, jsonify
from models import db, Channel, User
from auth import token_required

channels_bp = Blueprint('channels', __name__)

@channels_bp.route('/subscribe/<channel_id>', methods=['POST'])
@token_required
def subscribe(current_user, channel_id):
    channel = Channel.query.get(channel_id)
    if not channel:
        return jsonify({'message': 'Channel not found'}), 404
        
    if channel.creator_id == current_user.user_id:
        return jsonify({'message': 'Cannot subscribe to yourself'}), 400
        
    if channel in current_user.subscribed_channels:
        current_user.subscribed_channels.remove(channel)
        msg = 'Unsubscribed'
    else:
        current_user.subscribed_channels.append(channel)
        msg = 'Subscribed'
        
    db.session.commit()
    return jsonify({'message': msg}), 200

@channels_bp.route('/channel/<creator_id>', methods=['GET'])
def get_channel(creator_id):
    chan = Channel.query.get(creator_id)
    if not chan:
        return jsonify({'message': 'Channel not found'}), 404
    
    response = {
        'name': chan.name,
        'description': chan.description,
        'subscriber_count': len(chan.subscribers),
        'videos': [v.video_id for v in chan.videos]
    }
    return jsonify(response)

@channels_bp.route('/subscriptions', methods=['GET'])
@token_required
def get_subscriptions(current_user):
    result = []
    for chan in current_user.subscribed_channels:
        result.append({'channel_id': chan.creator_id, 'name': chan.name})
    return jsonify(result)
