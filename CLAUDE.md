# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RideLink is a MERN-based university carpooling platform for Pakistani university students. It enables students to share rides, reduce transportation costs, and build campus community through ride posting, seat booking, real-time chat, and ratings/reviews.

**Target Users:** University students at LUMS, NUST, FAST, UET, etc. (Lahore, Islamabad, Karachi)

**Key Value Proposition:** 50-70% cost reduction on transportation through ride-sharing with verified university students.

## Technology Stack

### Frontend
- **React 18.3** with **Vite 5.4** (fast dev server)
- **React Router v6** for routing
- **React Query** (server state) + **Zustand** (client state)
- **TailwindCSS 3.4** + Headless UI components
- **React Hook Form** + **Zod** validation
- **Google Maps** (@vis.gl wrapper)
- **Socket.io-client** for real-time features
- **Axios** for HTTP requests

### Backend
- **Node.js 20.18 LTS** + **Express.js 4.21**
- **Socket.io 4.8** for WebSocket communication
- **JWT** (jsonwebtoken) + bcryptjs for auth
- **Mongoose 8.8** (MongoDB ODM)
- **Zod** + express-validator for validation
- **Multer** + Sharp for image processing
- **SendGrid** (email), **Twilio** (SMS), **Cloudinary** (image hosting)
- **node-cron** for recurring ride scheduling
- **Pino** logging, **Sentry** error tracking

### Database
- **MongoDB Atlas** (M0 free tier)
- 8 collections: users, rides, bookings, messages, reviews, notifications, reports, recurringschedules

### Deployment
- **Frontend:** Vercel (git-based auto-deploy)
- **Backend:** Railway (git-based auto-deploy)
- **Database:** MongoDB Atlas M0
- **Total cost:** $0/month (free tiers)

## Architecture

### Pattern: Monolithic Three-Tier Architecture
```
React SPA (Frontend)
    ↓ HTTPS/WSS
Express.js + Socket.io (Backend)
    ↓ Mongoose
MongoDB Atlas (Database)
```

**Rationale:** Solo developer, 6-8 week MVP timeline, zero budget. Monolithic avoids microservices overhead while remaining scalable for 5,000-10,000 users on free tier.

### Key Design Decisions
- **Stateless JWT auth** (works with WebSocket, no session store)
- **MongoDB** for schema flexibility and generous free tier
- **Socket.io** for bidirectional real-time communication with auto-reconnect
- **HTTP-only cookies** for secure token storage
- **No exact addresses stored** (neighborhood-level only for privacy)

## Code Organization

### Backend Structure (`src/`)
```
config/          # MongoDB, Twilio, Cloudinary, SendGrid setup
models/          # Mongoose schemas (8 models)
controllers/     # Route handlers (auth, rides, bookings, messages, etc.)
services/        # Business logic layer (clean separation from controllers)
middleware/      # Auth, validation, error handling, rate limiting
routes/          # Express routers (/api/auth, /api/rides, /api/bookings, etc.)
socket/          # Socket.io event handlers (chat, notifications)
jobs/            # Cron jobs (recurring ride generation)
utils/           # JWT helpers, logger config, validators
app.js           # Express app setup with middleware
server.js        # Entry point (HTTP + WebSocket servers)
```

### Frontend Structure (`src/`)
```
api/             # Axios instance + API call wrappers
components/      # Reusable React components
pages/           # Route-level page components
store/           # Zustand stores (auth state, UI state)
hooks/           # Custom hooks (useAuth, useSocket, useQuery wrappers)
utils/           # Formatters, validators, helpers
App.jsx          # Root component with React Router setup
main.jsx         # Entry point
```

## Development Commands

### Frontend
```bash
# Setup
npm create vite@latest ridelink-frontend -- --template react
cd ridelink-frontend
npm install

# Development
npm run dev          # Start dev server on :3000
npm run build        # Production build
npm run lint         # ESLint check
npm run format       # Prettier formatting
```

### Backend
```bash
# Setup
mkdir ridelink-backend && cd ridelink-backend
npm init -y
npm install

# Development
npm run dev          # Start with nodemon on :5000
npm run start        # Production start
npm run test         # Run vitest tests
npm run lint         # ESLint check
```

### Database Backup/Restore
```bash
# Backup
mongodump --uri="mongodb+srv://..." --out=./backup

# Restore
mongorestore --uri="mongodb+srv://..." ./backup
```

## Core Data Models

### User Model
- Authentication: email (university domain only), password (bcrypted), phone, OTP
- Profile: name, photo, bio, university, studentId
- Ratings: driverRating (avg/count), passengerRating (avg/count)
- Vehicle: make, model, color, licensePlate (drivers only)
- Status: active/suspended/banned

### Ride Model
- Route: origin, destination, distance, duration, polyline
- Schedule: date, time, departureDateTime
- Capacity: availableSeats, totalSeats
- Pricing: costPerPassenger
- Preferences: nonSmoking, acAvailable, musicAllowed, petsAllowed
- Passengers: array of confirmed user IDs
- Status: scheduled/in-progress/completed/cancelled
- Recurring: link to RecurringSchedule (if generated from template)

### Booking Model
- References: rideId, passengerId, driverId
- Status: pending/confirmed/rejected/cancelled
- Payment: amountDue, paymentStatus, paymentMethod (cash only)
- Timestamps: requestedAt, confirmedAt, rejectedAt, cancelledAt

### Message Model (TTL 30 days)
- References: rideId, senderId, receiverId
- Content: text (max 500 chars)
- Status: read/unread
- Auto-deletion: TTL index removes messages after 30 days

## API Structure

**Base URL:** `/api/v1`

**Main Endpoints (46 total):**
- `/auth` - Register, login, email verification, phone OTP, password reset (8 endpoints)
- `/users` - Profile CRUD, photo upload, vehicle management (5 endpoints)
- `/rides` - Create, search, update, cancel, complete, list my rides (7 endpoints)
- `/bookings` - Request, approve, reject, cancel, payment tracking (7 endpoints)
- `/reviews` - Submit review, get user reviews (2 endpoints)
- `/messages` - Chat history, send (via WebSocket), mark read (3 endpoints)
- `/notifications` - Get, mark read, mark all read (3 endpoints)
- `/recurring-schedules` - CRUD for recurring ride templates (5 endpoints)
- `/reports` - Submit user/ride reports (1 endpoint)
- `/admin` - User management, report handling, analytics (5 endpoints)

## Authentication Flow

1. **Registration:** POST `/api/auth/register` with email (university domain), password, phone
2. **Email Verification:** User clicks link sent to email
3. **Phone Verification:** POST `/api/auth/verify-phone` with OTP code
4. **Login:** POST `/api/auth/login` returns JWT in HTTP-only cookie
5. **Protected Routes:** Every request includes JWT in cookie, validated by `authMiddleware`
6. **Token Lifespan:** 7 days, refresh pattern available

## Real-Time Communication (Socket.io)

### Events (Backend)
- `send-message` - Send chat message to ride participants
- `booking-confirmed` - Notify passenger of booking approval
- `ride-starting-soon` - Alert all passengers 30 min before departure
- `user-typing` - Show typing indicator in chat

### Events (Frontend)
- `new-message` - Receive incoming chat message
- `booking-update` - Handle booking status changes
- `notification` - Display in-app notification

### Connection Pattern
```javascript
// Backend: Socket.io rooms per ride
socket.join(`ride-${rideId}`);
io.to(`ride-${rideId}`).emit('new-message', data);

// Frontend: Auto-reconnect with auth
const socket = io(API_URL, { auth: { token: getJWT() } });
useEffect(() => {
  socket.on('new-message', handleMessage);
  return () => socket.off('new-message');
}, []);
```

## Important Conventions

### Error Handling
- **Backend:** Use `asyncHandler` wrapper for all async route handlers
- **Frontend:** React Query handles loading/error/success states automatically
- **Global Error Middleware:** Catches all errors, returns consistent JSON format

### Validation Pattern
- **Shared Zod schemas** between frontend and backend for consistency
- **Frontend:** React Hook Form with Zod resolver
- **Backend:** express-validator middleware on routes

### Security Practices
- **Passwords:** bcryptjs with 12 salt rounds
- **Sensitive fields:** `select: false` in Mongoose (password, OTP, tokens)
- **Rate limiting:** 100 req/15min globally, 3 OTP attempts/hour per phone
- **CORS:** Whitelist only frontend domain
- **JWT:** HTTP-only cookie, 7-day expiry, HTTPS only in production
- **Input validation:** All endpoints use Zod + express-validator
- **Privacy:** No exact addresses stored, only neighborhood-level data

### Database Performance
```javascript
// Critical indexes for search performance
rideSchema.index({ origin: 1, destination: 1, date: 1 });
userSchema.index({ email: 1 }, { unique: true });
messageSchema.index({ sentAt: 1 }, { expireAfterSeconds: 2592000 }); // 30-day TTL
```

### Service Layer Pattern
Controllers delegate business logic to services:
```javascript
// Controller: Handle HTTP request/response
exports.createRide = asyncHandler(async (req, res) => {
  const ride = await RideService.createRide(req.user.id, req.body);
  res.status(201).json({ success: true, data: ride });
});

// Service: Pure business logic
class RideService {
  static async createRide(driverId, rideData) {
    // Validation, database operations, notifications
    return ride;
  }
}
```

## Environment Variables

### Backend `.env`
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ridelink
JWT_SECRET=<32-char-minimum>
JWT_EXPIRE=7d
GOOGLE_MAPS_API_KEY=AIzaSy...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
SENDGRID_API_KEY=SG...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SENTRY_DSN=https://...@sentry.io/...
FRONTEND_URL=https://ridelink.vercel.app
```

### Frontend `.env`
```env
VITE_API_URL=https://api.ridelink.com/api/v1
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
```

## Key Features

1. **University-Based Authentication:** Only .edu.pk email domains allowed
2. **Dual Role Support:** Users can be drivers, passengers, or both simultaneously
3. **Real-Time Chat:** WebSocket-based messaging with read receipts per ride
4. **Recurring Rides:** Cron job generates weekly rides from templates at midnight
5. **Rating System:** Separate driver/passenger ratings with tags (punctual, friendly, etc.)
6. **Verification Badges:** Email + phone verified status displayed on profiles
7. **Admin Panel:** User management, report handling, system analytics
8. **Cash Payment Tracking:** Mark payments complete (no actual payment processing)
9. **Ride Preferences:** Smoking, AC, music, pet policies set by driver
10. **In-App Notifications:** Booking confirmations, ride reminders, chat alerts

## Performance Targets

- **Frontend bundle:** < 300 KB gzipped
- **API response time:** < 500ms for most queries
- **Chat message latency:** < 1 second
- **Page load time:** < 2 seconds on 4G
- **Lighthouse scores:** Performance 95+, Accessibility 92+, Best Practices 95+

## Project Documentation

Complete project documentation is organized in `AGENT_OUTPUTS/`:
- `01_BUSINESS_ANALYST/` - Requirements, use cases, user stories
- `02_TECHNICAL_ARCHITECT/` - Architecture decisions, tech stack rationale
- `03_PROJECT_MANAGER/` - Timeline, milestones, risk management
- `04_DEVELOPER/` - Implementation details, API specs, database schema
- `05_QA_ENGINEER/` - Test plans, test cases, quality metrics
- `06_DOCUMENTATION/` - User guides, deployment instructions, maintenance guides
