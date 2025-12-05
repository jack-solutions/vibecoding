import unittest
import json
import os
import shutil
from app import app
from models import db, User, Video, Comment, Channel

class YouTubeCloneTestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:' # Use in-memory DB for tests
        self.app = app.test_client()
        
        with app.app_context():
            db.create_all()
        
        # Create dummy video file
        os.makedirs('youtube_clone/videos', exist_ok=True)
        os.makedirs('youtube_clone/thumbnails', exist_ok=True)
        with open('youtube_clone/videos/test.mp4', 'wb') as f:
            f.write(b'dummy video content')

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def register(self, username, password, role):
        return self.app.post('/register', json={
            'username': username,
            'password': password,
            'role': role
        })

    def login(self, username, password):
        return self.app.post('/login', json={
            'username': username,
            'password': password
        })

    def test_full_flow(self):
        # 1. Register Creator
        res = self.register('creator1', 'pass', 'creator')
        self.assertEqual(res.status_code, 201)
        
        # 2. Login Creator
        res = self.login('creator1', 'pass')
        self.assertEqual(res.status_code, 200)
        token = res.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        
        # 3. Upload Video
        data = {
            'title': 'Test Video',
            'description': 'Description',
            'file': (open('youtube_clone/videos/test.mp4', 'rb'), 'test.mp4')
        }
        res = self.app.post('/upload', data=data, headers=headers, content_type='multipart/form-data')
        self.assertEqual(res.status_code, 201)
        video_id = res.get_json()['video_id']
        
        # 4. Register Viewer
        self.register('viewer1', 'pass', 'viewer')
        res = self.login('viewer1', 'pass')
        viewer_token = res.get_json()['token']
        viewer_headers = {'Authorization': f'Bearer {viewer_token}'}
        viewer_id = res.get_json()['user_id']
        
        # 5. Access Video
        res = self.app.get(f'/video/{video_id}')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()['title'], 'Test Video')
        
        # 6. Like Video
        res = self.app.post(f'/like/{video_id}', headers=viewer_headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()['likes'], 1)
        
        # 7. Comment
        res = self.app.post(f'/comment/{video_id}', json={'text': 'Great video!'}, headers=viewer_headers)
        self.assertEqual(res.status_code, 201)
        
        # 8. List Comments
        res = self.app.get(f'/comment/{video_id}')
        self.assertEqual(len(res.get_json()), 1)
        
        # 9. Subscribe
        with app.app_context():
            video = Video.query.get(video_id)
            creator_id = video.creator_id
            
        res = self.app.post(f'/subscribe/{creator_id}', headers=viewer_headers)
        self.assertEqual(res.status_code, 200)
        
        # 10. Check Subscriptions
        res = self.app.get('/subscriptions', headers=viewer_headers)
        self.assertEqual(len(res.get_json()), 1)
        self.assertEqual(res.get_json()[0]['name'], 'creator1')

if __name__ == '__main__':
    unittest.main()
