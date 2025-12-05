# Implementation Plan - MERN YouTube Clone

## 1. Backend Development
- [ ] Create missing Mongoose Models:
    - [ ] `Channel` (creator, name, description, videos)
    - [ ] `Comment` (text, user, video)
    - [ ] `Playlist` (creator, name, videos)
    - [ ] `AdCampaign` (campaign details)
- [ ] Update Models if needed:
    - [ ] Ensure `Video` and `User` align with new models.
- [ ] Implement Controllers:
    - [ ] `authController` (Register, Login, GetMe) - *Check existing*
    - [ ] `videoController` (Upload, Get, Like, Dislike, View)
    - [ ] `channelController` (Create, Get, Subscribe)
    - [ ] `commentController` (Add, Delete)
    - [ ] `playlistController` (Create, Add Video)
- [ ] Implement Routes:
    - [ ] `/api/auth`
    - [ ] `/api/videos`
    - [ ] `/api/channels`
    - [ ] `/api/comments`
    - [ ] `/api/playlists`

## 2. Frontend Development (React + Vite)
- [ ] Setup Global State (Context API):
    - [ ] `AuthContext` (User state, login/logout)
- [ ] Create Pages:
    - [ ] `HomePage` (Video feed)
    - [ ] `LoginPage` / `RegisterPage`
    - [ ] `VideoPage` (Video player, details, comments, related)
    - [ ] `UploadPage` (For Creators)
    - [ ] `ChannelPage` (Profile, videos,playlists)
- [ ] Create Components:
    - [ ] `Navbar` (Search, User menu)
    - [ ] `Sidebar` (Navigation)
    - [ ] `VideoCard` (Thumbnail, info)
    - [ ] `CommentSection`
- [ ] Integration:
    - [ ] Connect all features to Backend API.

## 3. Database & Configuration
- [ ] Ensure MongoDB is running or connection string is set (will use local or mock for now, preferably local if available or ENV).
- [ ] .env setup.
