# YouTube Clone Platform

A full-featured YouTube-style video platform built with Next.js 14 App Router, MongoDB, Mongoose, and JWT authentication. This project implements a multi-role system supporting users, content creators, and administrators.

## 🚀 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- Modern CSS (no framework dependencies)

### Backend
- **Next.js API Routes**
- **MongoDB** (Database)
- **Mongoose** (ODM)
- **JWT** (Authentication)
- **bcryptjs** (Password Hashing)

### Architecture
- Server-side rendering (SSR)
- API route handlers
- Middleware-based authentication
- Type-safe development with TypeScript

## 📁 Project Structure

```
vibecoding-youtube-clone/
├── app/                          # Next.js App Router directory
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── logout/
│   │   │   └── refresh/
│   │   ├── users/                # User management
│   │   │   ├── [id]/
│   │   │   └── route.ts
│   │   ├── videos/               # Video CRUD operations
│   │   │   ├── [id]/
│   │   │   │   ├── like/
│   │   │   │   └── view/
│   │   │   └── route.ts
│   │   ├── comments/             # Comment system
│   │   │   ├── [id]/
│   │   │   └── route.ts
│   │   ├── channels/             # Channel management
│   │   │   ├── [id]/
│   │   │   └── route.ts
│   │   ├── subscriptions/        # Subscription system
│   │   │   └── [id]/
│   │   └── ads/                  # Advertisement system
│   │       ├── [id]/
│   │       └── route.ts
│   ├── home/                     # Home page route
│   ├── watch/                    # Video watch page
│   ├── upload/                   # Video upload page
│   ├── channel/[id]/             # Channel page
│   ├── search/                   # Search results page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Root page (redirects to /home)
│   └── globals.css               # Global styles
│
├── models/                       # Mongoose schemas
│   ├── User.ts
│   ├── Video.ts
│   ├── Comment.ts
│   ├── Channel.ts
│   ├── Subscription.ts
│   └── Ad.ts
│
├── lib/                          # Utility libraries
│   ├── db/
│   │   └── connect.ts            # MongoDB connection with caching
│   ├── auth/
│   │   ├── jwt.ts                # JWT token utilities
│   │   ├── password.ts           # Password hashing
│   │   └── session.ts            # Session management
│   └── utils/
│       ├── api-response.ts       # API response helpers
│       ├── validation.ts         # Input validation
│       ├── upload.ts             # File upload utilities
│       └── helpers.ts            # General helpers
│
├── middleware/                   # API middleware
│   ├── auth.ts                   # Authentication middleware
│   ├── authorization.ts          # Role-based authorization
│   ├── rate-limiter.ts           # Rate limiting
│   └── error-handler.ts          # Error handling
│
├── types/                        # TypeScript type definitions
│   ├── user.ts
│   ├── video.ts
│   ├── comment.ts
│   ├── channel.ts
│   ├── subscription.ts
│   ├── ad.ts
│   ├── api.ts
│   └── index.ts
│
├── env/
│   └── example.env               # Environment variables template
│
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 Features (Planned)

### Phase 1: Project Setup ✅
- ✅ Enterprise-level folder structure
- ✅ Next.js 14 App Router setup
- ✅ MongoDB connection with global caching
- ✅ TypeScript configuration with path aliases
- ✅ Placeholder files for all routes and components

### Phase 2: Authentication & Users (Coming Next)
- JWT-based authentication (access & refresh tokens)
- User registration and login
- Password hashing with bcrypt
- Role-based access control (User, Creator, Admin)
- Session management

### Phase 3: Video Management
- Video upload and storage
- Video CRUD operations
- Video playback
- View count tracking
- Like/dislike functionality
- Video metadata (title, description, tags, category)

### Phase 4: Channel System
- Channel creation and management
- Channel customization
- Channel analytics
- Channel videos listing

### Phase 5: Engagement Features
- Comment system with nested replies
- Like/dislike on comments
- Subscription system
- Notification system

### Phase 6: Search & Discovery
- Video search functionality
- Filters and sorting
- Recommended videos
- Trending videos

### Phase 7: Advertisement System
- Ad placement and display
- Ad analytics
- Ad targeting (future)

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ installed
- MongoDB installed locally OR MongoDB Atlas account
- npm or yarn package manager

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd vibecoding-youtube-clone
```

### Step 2: Install Dependencies
```bash
npm install
# or
yarn install
```

### Step 3: Environment Variables Setup
1. Copy the example environment file:
   ```bash
   cp env/example.env .env.local
   ```

2. Update `.env.local` with your values:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/youtube-clone
   # Or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/youtube-clone

   # JWT Secrets (CHANGE THESE!)
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d

   # Application
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   NODE_ENV=development
   ```

### Step 4: Start MongoDB
**Local MongoDB:**
```bash
mongod
```

**MongoDB Atlas:**
- Create a cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string and add it to `.env.local`

### Step 5: Run the Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/youtube-clone` |
| `JWT_SECRET` | Secret key for access tokens | `your-secret-key` |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens | `your-refresh-secret` |
| `JWT_EXPIRES_IN` | Access token expiration | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `7d` |
| `NEXT_PUBLIC_BASE_URL` | Application base URL | `http://localhost:3000` |
| `NODE_ENV` | Environment mode | `development` or `production` |

## 🏗️ What's Included in Phase 1

### ✅ Complete Folder Structure
- Organized `/app` directory with API routes and pages
- `/models` folder for Mongoose schemas
- `/lib` folder with database, auth, and utility functions
- `/middleware` folder for request processing
- `/types` folder for TypeScript definitions

### ✅ Configuration Files
- `package.json` with all required dependencies
- `tsconfig.json` with path aliases (`@/app`, `@/lib`, etc.)
- `next.config.js` for Next.js configuration
- `.gitignore` for version control
- `env/example.env` with comprehensive environment variables

### ✅ Database Connection
- **Complete MongoDB connection file** (`lib/db/connect.ts`)
- Global connection caching for Next.js hot reload
- Prevents connection pool exhaustion during development
- Error handling and logging

### ✅ Placeholder Files
All route files and utilities have placeholder comments:
- API routes: `// TODO: implement [feature]`
- Frontend pages: Basic placeholder components
- Models, middleware, and utilities: Ready for implementation

## 🚦 Next Steps (Phase 2)

1. **Implement Mongoose Schemas**
   - Define User, Video, Comment, Channel, Subscription, and Ad models
   - Add proper field validation and indexes

2. **Build Authentication System**
   - Implement JWT token generation and verification
   - Create login/register/logout endpoints
   - Add authentication middleware

3. **Create User Management**
   - User CRUD operations
   - Profile management
   - Role-based authorization

## 📚 Development Guidelines

### Code Organization
- Keep API routes focused and single-purpose
- Use middleware for cross-cutting concerns (auth, validation, error handling)
- Centralize database models in `/models`
- Use TypeScript types from `/types` directory

### Best Practices
- Always validate user input
- Use environment variables for sensitive data
- Implement proper error handling
- Add logging for debugging
- Write clean, documented code

### Path Aliases
The project uses TypeScript path aliases:
```typescript
import connectDB from '@/lib/db/connect';
import { User } from '@/models/User';
import { ApiResponse } from '@/types/api';
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is for educational purposes.

## 👤 Author

Built by VibeCoding

---

**Phase 1 Status:** ✅ Complete - Project structure and skeleton ready for development
