from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
from functools import wraps
from models import db, User, Channel
from utils.jwt_utils import generate_token, decode_token

auth_bp = Blueprint('auth', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        payload = decode_token(token)
        if 'error' in payload:
            return jsonify({'message': payload['error']}), 401
        
        current_user = User.query.get(payload['user_id'])
        if not current_user:
             return jsonify({'message': 'User not found!'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Missing username or password'}), 400
    
    username = data.get('username')
    
    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'User already exists'}), 400
            
    hashed_password = generate_password_hash(data.get('password'))
    role = data.get('role', 'viewer')
    
    new_user = User(username=username, password=hashed_password, role=role)
    db.session.add(new_user)
    db.session.commit() # Commit to get ID generated if needed, but we use uuid default
    
    if role == 'creator':
        new_channel = Channel(creator_id=new_user.user_id, name=username, description=f"{username}'s channel")
        db.session.add(new_channel)
        db.session.commit()

    return jsonify({'message': 'User registered successfully', 'user_id': new_user.user_id}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Missing data'}), 400
        
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
            
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    if check_password_hash(user.password, password):
        token = generate_token(user.user_id, user.role)
        return jsonify({'token': token, 'user_id': user.user_id, 'role': user.role}), 200
        
    return jsonify({'message': 'Invalid password'}), 401

@auth_bp.route('/profile', methods=['GET'])
@token_required
def profile(current_user):
    return jsonify({
        'user_id': current_user.user_id,
        'username': current_user.username,
        'role': current_user.role
    })
