# YouTube Clone

A full-stack YouTube clone application built with React, Node.js, and MySQL. This project mimics core YouTube functionalities including video uploading, playback, commenting, and subscriptions.

## Features

- **Video Playback**: Stream videos with a custom player interface.
- **Video Upload**: Upload video files and thumbnails (supports MP4, standard image formats).
- **User Roles**: 
  - **Admin/Creator**: Upload privileges.
  - **Viewer/Advertiser/Guest**: Consumption only.
  - **Role Switcher**: Built-in tool to toggle user roles for testing.
- **Interactions**:
  - **Comments**: Post comments on videos.
  - **Views**: Automatic view counting.
  - **Share**: Copy video link to clipboard.
- **Subscriptions**: Subscribe to channels and view a personalized feed.
- **Search**: Search functionality (Frontend/UI).
- **Responsive Design**: Dark mode UI built with raw CSS.

## Tech Stack

- **Frontend**: React (Vite), React Router, Axios, React Icons.
- **Backend**: Node.js, Express, Multer (file uploads).
- **Database**: MySQL (using `mysql2` driver).

## Prerequisites

- **Node.js**: v14+ installed.
- **MySQL**: Local MySQL server running.

## Setup & Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd youtube-clone
```

### 2. Backend Setup
Navigate to the server directory:
```bash
cd server
npm install
```

**Environment Variables:**
Create a `.env` file in the `server` directory:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=youtube_clone
```

**Database Initialization:**
Run the initialization script to create the database, tables, and seed default users:
```bash
npm run db:init
```

**Start the Server:**
```bash
npm run dev
```
Server will run on `http://localhost:5000`.

### 3. Frontend Setup
Open a new terminal and navigate to the client directory:
```bash
cd client
npm install
```

**Start the Client:**
```bash
npm run dev
```
Client will run on `http://localhost:5173`.

## Usage Guide

1.  **Home Page**: Browse uploaded videos.
2.  **Upload**: 
    - Switch role to **Admin** or **Creator** using the dropdown in the header.
    - Click the Video Camera icon to upload a `.mp4` video and a thumbnail.
3.  **Watch**: Click any video to watch.
    - **Subscribe**: Click the Subscribe button to follow the channel.
    - **Comment**: Leave a comment below the video.
4.  **Subscriptions**: Click "Subscriptions" in the sidebar to see videos from channels you follow.
