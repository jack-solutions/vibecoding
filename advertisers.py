from flask import Blueprint, request, jsonify
from models import db, Ad
from auth import token_required
import uuid

advertisers_bp = Blueprint('advertisers', __name__)

@advertisers_bp.route('/ads/upload', methods=['POST'])
@token_required
def upload_ad(current_user):
    if current_user.role not in ['advertiser', 'admin']:
        return jsonify({'message': 'Permission denied'}), 403
        
    data = request.get_json()
    title = data.get('title')
    content = data.get('content') # Could be a link or text
    category = data.get('category', 'general')
    
    new_ad = Ad(
        title=title,
        content=content,
        category=category,
        owner_id=current_user.user_id
    )
    db.session.add(new_ad)
    db.session.commit()
    
    return jsonify({'message': 'Ad uploaded', 'ad_id': new_ad.ad_id}), 201

@advertisers_bp.route('/ads/list', methods=['GET'])
@token_required
def list_ads(current_user):
    if current_user.role not in ['advertiser', 'admin']:
        return jsonify({'message': 'Permission denied'}), 403
        
    # Return all ads
    ads = Ad.query.all()
    results = []
    for ad in ads:
        results.append({
            'ad_id': ad.ad_id,
            'title': ad.title,
            'content': ad.content,
            'category': ad.category
        })
    return jsonify(results)
