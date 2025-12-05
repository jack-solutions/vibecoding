from flask import Flask, render_template, send_from_directory, request
from auth import auth_bp
from video import video_bp
from comments import comments_bp
from channels import channels_bp
from admin import admin_bp
from advertisers import advertisers_bp
from models import db, Video
import os

app = Flask(__name__, template_folder='templates', static_folder='static')
app.secret_key = 'dev-secret-key'

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///youtube.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(video_bp)
app.register_blueprint(comments_bp)
app.register_blueprint(channels_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(advertisers_bp)

with app.app_context():
    db.create_all()

@app.route('/')
def home():
    # Pass videos to template for server-side rendering of the list
    videos = Video.query.all()
    return render_template('index.html', videos=videos)

@app.route('/login_page')
def login_page():
    return render_template('login.html')

@app.route('/register_page')
def register_page():
    return render_template('register.html')

@app.route('/upload_page')
def upload_page():
    return render_template('upload.html')

# We can use the same route as the API or different. 
# The API /video/<id> returns JSON.
# So we use /watch/<id> for the page.
@app.route('/watch/<video_id>')
def watch_page(video_id):
    video = Video.query.get(video_id)
    if not video:
        return "Video not found", 404
        
    # Increment views
    video.views += 1
    db.session.commit()
        
    # We pass the token in frontend usually, but for history we might want 
    # server side tracking if we decoded token in middleware.
    # For now, simplistic view.
    
    video_data = {
        "video_id": video.video_id,
        "title": video.title,
        "description": video.description,
        "creator_id": video.creator_id,
        "creator_name": video.channel.name,
        "filename": video.filename,
        "views": video.views,
        "likes": len(video.liked_by),
        "upload_date": video.upload_date.strftime('%Y-%m-%d')
    }
    return render_template('watch.html', video=video_data)

@app.route('/results')
def search_results():
    query = request.args.get('q', '').lower()
    if not query:
        return render_template('search.html', videos=[], query=query)
        
    videos = Video.query.filter(
        (Video.title.ilike(f'%{query}%')) | 
        (Video.description.ilike(f'%{query}%'))
    ).all()
    
    return render_template('search.html', videos=videos, query=query)

@app.route('/history')
def history_page():
    return render_template('history.html')

@app.route('/channel_page/<creator_id>')
def channel_page(creator_id):
    # We can fetch channel data here or let the page do it.
    # We'll pass the ID and let the page setup.
    return render_template('channel.html', creator_id=creator_id)

if __name__ == '__main__':
    # Ensure directories exist
    os.makedirs('videos', exist_ok=True)
    os.makedirs('thumbnails', exist_ok=True)
    app.run(debug=True, port=5000)
