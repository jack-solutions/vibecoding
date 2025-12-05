YouTube Clone Walkthrough
Overview
This MERN stack application replicates core YouTube functionality, including video uploading, playback, comments, likes, and subscriptions.

Features Verified
1. Authentication
Register: Users can sign up as Viewer, Creator, or Advertiser.
Login: JWT-based authentication with HttpOnly cookies.
Role-based Access: Only Creators can upload videos; only logged-in users can like/comment.
2. Video Management
Upload: Creators can upload video files (stored locally in backend/uploads).
Playback: HTML5 video player integration.
Feed: Home page lists all videos with search functionality.
3. Engagement
Likes/Dislikes: Toggle like status on videos.
Comments: Post and view comments in real-time.
Subscriptions: Subscribe to channels.
4. Creator Dashboard
Channel Management: (Stub) Dashboard infrastructure ready.
Uploads: Dedicated upload page with metadata fields.
How to Run
Backend
cd backend
npm install
npm start
# Server runs on http://localhost:5000
# MongoDB should be running locally
Frontend
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
Testing Steps
Register a new user account (select 'Creator' role).
Login with the new account.
Click the Camera Icon in the navbar to navigate to Upload page.
Upload a generic MP4 video.
Redirect to Home and click the video card.
Interact with the video (Like, Comment).
