# Barrio Base

A peer-to-peer marketplace where users can buy, sell, and barter items locally.

## Tech Stack

**Backend** — Node.js, Express 5, TypeScript, Prisma ORM, PostgreSQL (NeonDB), Socket.IO, AWS S3 + CloudFront, JWT auth

**Frontend** — React 19, TypeScript, Vite, Tailwind CSS v4, React Router, Socket.IO client

## Getting Started

### Prerequisites

- Node.js 20+
- A [NeonDB](https://neon.tech) PostgreSQL database
- An AWS S3 bucket + CloudFront distribution (for image uploads)

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
DATABASE_URL=your_neondb_connection_string

JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=your_bucket
CLOUDFRONT_URL=https://your-distribution.cloudfront.net
```

Run migrations and seed the database:

```bash
npx prisma migrate dev
npx prisma db seed
```

Start the dev server:

```bash
npm run dev
```

API runs at `http://localhost:3000`. Test users after seeding: `alice@example.com`, `bob@example.com`, `carlos@example.com` — all with password `password123`.

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev
```

App runs at `http://localhost:5173`.

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register |
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/refresh` | — | Refresh tokens |
| GET | `/api/auth/me` | ✓ | Current user |
| GET | `/api/listings` | — | Search & filter listings |
| GET | `/api/listings/recent` | — | Recent for-sale & barter |
| GET | `/api/listings/:id` | — | Listing detail |
| POST | `/api/listings` | ✓ | Create listing |
| PATCH | `/api/listings/:id` | ✓ | Edit listing |
| DELETE | `/api/listings/:id` | ✓ | Delete listing |
| POST | `/api/listings/:id/images/presign` | ✓ | Get S3 upload URL |
| POST | `/api/listings/:id/images` | ✓ | Save image record |
| DELETE | `/api/listings/:id/images/:imageId` | ✓ | Delete image |
| GET | `/api/users/:userId` | — | Public profile |
| GET | `/api/users/listings` | ✓ | My listings |
| POST | `/api/users/photo/presign` | ✓ | Profile photo upload URL |
| GET | `/api/conversations` | ✓ | My conversations |
| POST | `/api/conversations` | ✓ | Start conversation |
| GET | `/api/conversations/:id/messages` | ✓ | Messages in thread |
| POST | `/api/conversations/:id/messages` | ✓ | Send message |
| GET | `/api/users/:userId/reviews` | — | Reviews for a user |
| POST | `/api/reviews` | ✓ | Leave a review |

Authenticated routes require `Authorization: Bearer <accessToken>`.

## Real-time Messaging

Socket.IO is used for live message delivery. The client connects on login using the JWT access token. Rooms follow the pattern `conversation:<id>` for message delivery and `user:<id>` for conversation-list updates.

## Image Uploads

Images are uploaded directly to S3 via presigned URLs — the backend never handles the file bytes. Flow:
1. Request a presigned URL from the API
2. PUT the file directly to S3
3. POST the resulting CloudFront URL back to the API to save the record

## Deployment

### Backend (Render Web Service)

- **Root Directory:** `backend`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run start`
- Set all variables from `.env` in the Render environment dashboard

### Frontend (Render Static Site)

- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Environment variable:** `VITE_API_URL=https://your-backend.onrender.com`
- **Redirects/Rewrites:** add a rewrite rule `/* → /index.html` (required for client-side routing)
