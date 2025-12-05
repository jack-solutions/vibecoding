from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

# Association table for subscriptions
subscriptions = db.Table('subscriptions',
    db.Column('user_id', db.String(36), db.ForeignKey('user.user_id'), primary_key=True),
    db.Column('channel_id', db.String(36), db.ForeignKey('channel.creator_id'), primary_key=True)
)

# Association table for likes (User likes Video)
likes = db.Table('likes',
    db.Column('user_id', db.String(36), db.ForeignKey('user.user_id'), primary_key=True),
    db.Column('video_id', db.String(36), db.ForeignKey('video.video_id'), primary_key=True)
)

class User(db.Model):
    user_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='viewer')
    
    # Relationships
    channel = db.relationship('Channel', backref='owner', uselist=False, cascade="all, delete-orphan")
    comments = db.relationship('Comment', backref='author', lazy=True)
    # liked_videos relationship via secondary table
    liked_videos = db.relationship('Video', secondary=likes, backref=db.backref('liked_by', lazy=True))
    # subscribed_channels relationship via secondary table
    subscribed_channels = db.relationship('Channel', secondary=subscriptions, backref=db.backref('subscribers', lazy=True))

class Channel(db.Model):
    creator_id = db.Column(db.String(36), db.ForeignKey('user.user_id'), primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    description = db.Column(db.Text)
    
    videos = db.relationship('Video', backref='channel', lazy=True, cascade="all, delete-orphan")

class Video(db.Model):
    video_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    filename = db.Column(db.String(200), nullable=False)
    thumbnail = db.Column(db.String(200))
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    views = db.Column(db.Integer, default=0)
    
    creator_id = db.Column(db.String(36), db.ForeignKey('channel.creator_id'), nullable=False)
    
    comments = db.relationship('Comment', backref='video', lazy=True, cascade="all, delete-orphan")
    
    @property
    def likes_count(self):
        return len(self.liked_by)

class Comment(db.Model):
    comment_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    user_id = db.Column(db.String(36), db.ForeignKey('user.user_id'), nullable=False)
    video_id = db.Column(db.String(36), db.ForeignKey('video.video_id'), nullable=False)

class Ad(db.Model):
    ad_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(100))
    content = db.Column(db.Text)
    category = db.Column(db.String(50))
    owner_id = db.Column(db.String(36), db.ForeignKey('user.user_id'))
