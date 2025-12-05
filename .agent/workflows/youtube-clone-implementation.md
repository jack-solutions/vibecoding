---
description: Step-by-step workflow for implementing YouTube clone features
---

# YouTube Clone Implementation Workflow

This workflow provides executable steps to implement the YouTube clone project phase by phase.

---

## Prerequisites

Before starting, ensure you have:
- Node.js and pnpm installed
- Project dependencies installed: `pnpm install`
- Database configured and running

---

## Phase 1: Database Schema Setup

### Step 1.1: Design Database Schema

Review the comprehensive schema in `implementation_plan.md` and create the Prisma schema.

```bash
cd packages/db/prisma/schema
```

Create a new file `youtube.prisma` with all models (User extensions, Channel, Video, Comment, Subscription, Like, View, Playlist, etc.)

### Step 1.2: Generate and Push Schema

// turbo
```bash
cd d:\Projects\learning\vc-yt-clone
pnpm run db:push
```

### Step 1.3: Generate Prisma Client

// turbo
```bash
pnpm run db:generate
```

### Step 1.4: Verify Schema in Database Studio

// turbo
```bash
pnpm run db:studio
```

Open http://localhost:5555 and verify all tables exist.

---

## Phase 2: Authentication & Authorization

### Step 2.1: Extend User Model with Roles

Add role enum to the User model in Prisma schema:
- ADMIN
- CREATOR
- VIEWER
- ADVERTISER

### Step 2.2: Create Role Middleware

Create the following files in `packages/auth/src/middleware/`:
- `roleGuard.ts` - General role checking
- `creatorGuard.ts` - Creator-only protection
- `adminGuard.ts` - Admin-only protection

### Step 2.3: Update Auth Configuration

Modify `packages/auth` to support role selection during signup.

### Step 2.4: Test Authentication

// turbo
```bash
pnpm run dev
```

Test login, signup, and role assignment.

---

## Phase 3: Backend APIs - User & Channel

### Step 3.1: Create Database Repositories

Create repository files in `packages/db/src/repositories/`:
- `userRepository.ts`
- `channelRepository.ts`

### Step 3.2: Create User API Routes

Create `apps/server/src/routes/user.ts` with endpoints:
- GET /api/user/profile
- PATCH /api/user/profile
- POST /api/user/upgrade-creator

### Step 3.3: Create Channel API Routes

Create `apps/server/src/routes/channel.ts` with endpoints:
- POST /api/channel
- GET /api/channel/:id
- PATCH /api/channel/:id
- DELETE /api/channel/:id

### Step 3.4: Test User & Channel APIs

Use Postman, Insomnia, or curl to test all endpoints.

---

## Phase 4: Backend APIs - Video Management

### Step 4.1: Set Up File Upload Middleware

Create `apps/server/src/middleware/upload.ts` using Multer for handling video and thumbnail uploads.

### Step 4.2: Create Video Repository

Create `packages/db/src/repositories/videoRepository.ts`.

### Step 4.3: Create Storage Service

Create `packages/db/src/services/storage.ts` with abstraction for cloud storage (S3, Cloudinary, etc.).

### Step 4.4: Create Video API Routes

Create `apps/server/src/routes/video.ts` with endpoints:
- POST /api/video/upload
- POST /api/video/:id/metadata
- GET /api/video/:id
- PATCH /api/video/:id
- DELETE /api/video/:id
- GET /api/channel/:id/videos
- POST /api/video/:id/view

### Step 4.5: Test Video Upload Flow

Test complete video upload and retrieval flow.

---

## Phase 5: Backend APIs - Engagement

### Step 5.1: Create Engagement Repositories

Create in `packages/db/src/repositories/`:
- `commentRepository.ts`
- `likeRepository.ts`
- `subscriptionRepository.ts`

### Step 5.2: Create Engagement API Routes

Create `apps/server/src/routes/engagement.ts` with endpoints:
- Comment CRUD
- Like/Dislike
- Subscribe/Unsubscribe

### Step 5.3: Test Engagement Features

Test all engagement endpoints.

---

## Phase 6: Backend APIs - Search & Discovery

### Step 6.1: Implement Search Service

Create `apps/server/src/services/search.ts` with:
- Video search
- Channel search
- Filter capabilities

### Step 6.2: Implement Recommendation Service

Create `apps/server/src/services/recommendation.ts` with:
- Trending algorithm
- Personalized recommendations
- Related videos

### Step 6.3: Create Search API Routes

Create `apps/server/src/routes/search.ts` with endpoints:
- GET /api/search
- GET /api/trending
- GET /api/recommendations

### Step 6.4: Test Search & Recommendations

Upload test videos and verify search and recommendation results.

---

## Phase 7: Backend APIs - Playlists

### Step 7.1: Create Playlist Repository

Create `packages/db/src/repositories/playlistRepository.ts`.

### Step 7.2: Create Playlist API Routes

Create `apps/server/src/routes/playlist.ts`.


---

## Phase 8: Backend APIs - Analytics

### Step 8.1: Create Analytics Repository

Create `packages/db/src/repositories/analyticsRepository.ts`.

### Step 8.2: Create Analytics Service

Create `apps/server/src/services/analytics.ts` for aggregating metrics.

### Step 8.3: Create Analytics API Routes

Create `apps/server/src/routes/analytics.ts`.

### Step 8.4: Test Analytics Dashboard

Verify analytics data is tracked and displayed correctly.

---

## Phase 9: Backend APIs - Admin

### Step 9.1: Create Report Repository

Create `packages/db/src/repositories/reportRepository.ts`.

### Step 9.2: Create Admin API Routes

Create `apps/server/src/routes/admin.ts`.

### Step 9.3: Test Admin Features

Test content moderation and user management.

---

## Phase 10: Frontend - Shared Components

### Step 10.1: Create Video Components

Create in `apps/web/src/components/video/`:
- VideoCard.tsx
- VideoGrid.tsx
- VideoPlayer.tsx
- VideoUploader.tsx

### Step 10.2: Create Channel Components

Create in `apps/web/src/components/channel/`:
- ChannelCard.tsx
- ChannelHeader.tsx
- SubscribeButton.tsx

### Step 10.3: Create Engagement Components

Create in `apps/web/src/components/engagement/`:
- LikeDislikeButtons.tsx
- CommentSection.tsx
- CommentForm.tsx
- ShareButton.tsx

### Step 10.4: Create Navigation Components

Create in `apps/web/src/components/layout/`:
- Navbar.tsx
- Sidebar.tsx
- SearchBar.tsx
- UserMenu.tsx

---

## Phase 11: Frontend - Home & Video Pages

### Step 11.1: Create Home Page

Create `apps/web/src/app/page.tsx` with recommended videos.

### Step 11.2: Create Video Watch Page

Create `apps/web/src/app/watch/[id]/page.tsx` with:
- Video player
- Like/Dislike buttons
- Comments section
- Related videos

### Step 11.3: Create Search Results Page

Create `apps/web/src/app/search/page.tsx`.

### Step 11.4: Create Trending Page

Create `apps/web/src/app/trending/page.tsx`.

### Step 11.5: Test Navigation Flow

// turbo
```bash
pnpm run dev:web
```

Navigate through all pages and verify functionality.

---

## Phase 12: Frontend - Channel Pages

### Step 12.1: Create Channel Page

Create `apps/web/src/app/channel/[id]/page.tsx`.

### Step 12.2: Test Channel Features

Test viewing channels, subscribing, and browsing videos.

---

## Phase 13: Frontend - Creator Studio

### Step 13.1: Create Creator Studio Layout

Create `apps/web/src/app/studio/layout.tsx`.

### Step 13.2: Create Upload Page

Create `apps/web/src/app/studio/upload/page.tsx`.

### Step 13.3: Create Video Management Page

Create `apps/web/src/app/studio/videos/page.tsx`.

### Step 13.4: Create Analytics Dashboard

Create `apps/web/src/app/studio/analytics/page.tsx`.

### Step 13.5: Test Creator Workflow

Test complete creator workflow from upload to analytics.

---

## Phase 14: Frontend - User Features

### Step 14.1: Create User Pages

Create:
- `apps/web/src/app/subscriptions/page.tsx`
- `apps/web/src/app/history/page.tsx`
- `apps/web/src/app/liked/page.tsx`
- `apps/web/src/app/playlists/page.tsx`

### Step 14.2: Test User Features

Test all user-specific features.

---

## Phase 15: Frontend - Admin Dashboard

### Step 15.1: Create Admin Layout

Create `apps/web/src/app/admin/layout.tsx`.

### Step 15.2: Create Admin Pages

Create admin pages for moderation, users, and analytics.

### Step 15.3: Test Admin Functions

Test content moderation workflow.


## Notes

- This workflow should be executed sequentially, phase by phase
- Each phase should be tested before moving to the next
- Adjust based on your specific requirements and priorities
- Consider starting with an MVP (Phases 1-11) before adding advanced features