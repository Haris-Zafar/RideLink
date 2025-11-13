# System Architecture: RideLink - University Carpooling Platform

## Document Information

- **Project**: RideLink - University Carpooling Platform
- **Version**: 1.0
- **Author**: Technical Architect Agent
- **Date**: November 13, 2025
- **Status**: Final - Ready for Development

---

## Executive Summary

This document defines the system architecture for RideLink, a MERN-based university carpooling platform. The architecture follows a **monolithic three-tier pattern** optimized for rapid MVP development, cost-effectiveness, and future scalability.

**Key Architectural Decisions**:

- ✅ Monolithic MERN stack (not microservices)
- ✅ RESTful API with WebSocket layer for real-time features
- ✅ MongoDB document-based data model
- ✅ Stateless authentication (JWT)
- ✅ Cloud-native deployment on free tiers

---

## 1. Architecture Type: Monolithic Three-Tier

### Recommendation: **MONOLITHIC MERN ARCHITECTURE**

### Architecture Pattern

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT TIER                          │
│            (React SPA + Progressive Web App)            │
│  - React 18 Components                                  │
│  - TailwindCSS Styling                                  │
│  - Context API + React Query for State                  │
│  - Socket.io-client for Real-time                       │
└─────────────────────────────────────────────────────────┘
                            │
                    HTTPS/WSS Protocol
                            │
┌─────────────────────────────────────────────────────────┐
│                   APPLICATION TIER                       │
│            (Node.js + Express.js Server)                │
│  - RESTful API Endpoints                                │
│  - Socket.io Server (WebSocket)                         │
│  - JWT Authentication Middleware                        │
│  - Business Logic Layer                                 │
│  - Request Validation & Sanitization                    │
└─────────────────────────────────────────────────────────┘
                            │
                    Mongoose ODM
                            │
┌─────────────────────────────────────────────────────────┐
│                     DATA TIER                           │
│              (MongoDB Atlas Database)                   │
│  - Document Collections                                 │
│  - Indexes & Text Search                                │
│  - Aggregation Pipelines                                │
└─────────────────────────────────────────────────────────┘
```

### Why Monolithic Over Microservices?

| Factor                    | Monolithic                      | Microservices                   | Winner for RideLink              |
| ------------------------- | ------------------------------- | ------------------------------- | -------------------------------- |
| **Development Speed**     | Fast - single codebase          | Slow - multiple services        | ✅ Monolithic                    |
| **Deployment Complexity** | Simple - one deployment         | Complex - orchestration needed  | ✅ Monolithic                    |
| **Cost**                  | $0 (free tier possible)         | $20-50/month minimum            | ✅ Monolithic                    |
| **Team Size**             | 1-3 developers                  | 5+ developers                   | ✅ Monolithic                    |
| **Debugging**             | Easy - single log stream        | Hard - distributed tracing      | ✅ Monolithic                    |
| **Scalability**           | Vertical first, then horizontal | Horizontal per service          | ⚠️ Tie (MVP doesn't need either) |
| **Technology Lock-in**    | Flexible - can split later      | Committed to service boundaries | ✅ Monolithic                    |

**Verdict**: Monolithic architecture is the correct choice for:

- Solo/small team development (1 developer initially)
- MVP timeline (6-8 weeks)
- Budget constraint ($0)
- Uncertain service boundaries at this stage

**Migration Path**: If RideLink grows beyond 10,000+ active users, we can extract:

1. Real-time chat → Separate Socket.io service
2. Notifications → Message queue + worker service
3. Maps/geolocation → Dedicated microservice

But this is NOT needed for MVP or even first year of operation.

---

## 2. High-Level Component Architecture

### 2.1 Component Diagram

```mermaid
graph TB
    subgraph "Client Layer - Browser"
        A[React Application]
        A1[Public Pages]
        A2[Authenticated Pages]
        A3[Admin Dashboard]
        A --> A1
        A --> A2
        A --> A3
    end

    subgraph "API Gateway Layer"
        B[Express.js Server]
        B1[REST API Routes]
        B2[WebSocket Server]
        B3[Authentication Middleware]
        B --> B1
        B --> B2
        B --> B3
    end

    subgraph "Business Logic Layer"
        C1[User Service]
        C2[Ride Service]
        C3[Booking Service]
        C4[Chat Service]
        C5[Payment Service]
        C6[Notification Service]
    end

    subgraph "Data Access Layer"
        D[Mongoose ODM]
        D1[User Model]
        D2[Ride Model]
        D3[Booking Model]
        D4[Message Model]
        D5[Review Model]
    end

    subgraph "External Services"
        E1[MongoDB Atlas]
        E2[Google Maps API]
        E3[Twilio SMS]
        E4[SendGrid Email]
        E5[Cloudinary Storage]
    end

    A -->|HTTPS| B
    A -->|WSS| B2
    B1 --> C1
    B1 --> C2
    B1 --> C3
    B2 --> C4
    B1 --> C5
    B1 --> C6

    C1 --> D
    C2 --> D
    C3 --> D
    C4 --> D
    C5 --> D
    C6 --> D

    D --> E1
    C2 --> E2
    C6 --> E3
    C6 --> E4
    C1 --> E5
```

### 2.2 Component Descriptions

#### Client Layer Components

| Component               | Responsibility                                    | Technology                           |
| ----------------------- | ------------------------------------------------- | ------------------------------------ |
| **Public Pages**        | Landing, login, registration, ride search (guest) | React components, React Router       |
| **Authenticated Pages** | Dashboard, ride posting, bookings, profile, chat  | Protected routes with JWT validation |
| **Admin Dashboard**     | User management, reports, analytics               | Role-based access (admin only)       |

#### API Gateway Layer

| Component            | Responsibility                               | Technology                       |
| -------------------- | -------------------------------------------- | -------------------------------- |
| **REST API Routes**  | Handle HTTP requests, route to services      | Express.js router                |
| **WebSocket Server** | Real-time bidirectional communication        | Socket.io 4.x                    |
| **Auth Middleware**  | JWT validation, role checking, rate limiting | jsonwebtoken, express-rate-limit |

#### Business Logic Layer (Services)

| Service                  | Key Functions                                    | Dependencies                   |
| ------------------------ | ------------------------------------------------ | ------------------------------ |
| **User Service**         | Registration, login, profile CRUD, verification  | Mongoose, bcrypt, Twilio       |
| **Ride Service**         | Post ride, search, recurring rides, cancel       | Mongoose, Google Maps API      |
| **Booking Service**      | Request to join, approve/reject, manage bookings | Mongoose, Notification Service |
| **Chat Service**         | Send/receive messages, message history           | Socket.io, Mongoose            |
| **Payment Service**      | Track cash payments, mark as paid                | Mongoose                       |
| **Notification Service** | In-app alerts, SMS, email notifications          | Twilio, SendGrid, Socket.io    |

#### Data Access Layer

| Model             | Collection Name | Key Fields                                          |
| ----------------- | --------------- | --------------------------------------------------- |
| **User Model**    | users           | email, password, phone, role, university, vehicle   |
| **Ride Model**    | rides           | driverId, origin, destination, date, seats, cost    |
| **Booking Model** | bookings        | rideId, passengerId, status, paymentStatus          |
| **Message Model** | messages        | rideId, senderId, receiverId, text, timestamp       |
| **Review Model**  | reviews         | reviewerId, reviewedUserId, rideId, rating, comment |

---

## 3. Data Flow Patterns

### 3.1 Synchronous Request Flow (REST API)

**Example: Passenger searches for rides**

```
1. User enters search criteria in React form
   ↓
2. React component dispatches API call (axios/fetch)
   ↓
3. Request hits Express.js: GET /api/rides/search?origin=DHA&date=2025-11-15
   ↓
4. Auth middleware validates JWT token (if logged in)
   ↓
5. Request validation middleware checks query parameters
   ↓
6. Ride Service executes business logic:
   - Parses search filters
   - Calls Mongoose query with indexes
   ↓
7. MongoDB returns matching documents
   ↓
8. Response formatted as JSON and sent back
   ↓
9. React receives data and updates UI (via React Query cache)
```

**Latency Target**: < 500ms (includes DB query)

---

### 3.2 Asynchronous Event Flow (WebSocket)

**Example: Driver accepts passenger's join request**

```
1. Driver clicks "Accept" button in React UI
   ↓
2. React emits Socket.io event: socket.emit('accept-booking', {bookingId})
   ↓
3. Socket.io server receives event
   ↓
4. Auth middleware validates socket connection JWT
   ↓
5. Booking Service updates database: booking.status = 'confirmed'
   ↓
6. Notification Service triggers:
   - Socket.io emits to passenger: socket.to(passengerId).emit('booking-confirmed')
   - SMS sent via Twilio (async, non-blocking)
   - In-app notification created in DB
   ↓
7. Passenger's browser receives Socket.io event instantly
   ↓
8. React UI updates in real-time (booking status changes)
```

**Latency Target**: < 1 second (real-time update)

---

### 3.3 Background Job Flow (Recurring Rides)

**Example: System generates recurring ride instances daily**

```
1. Cron job runs at 12:00 AM daily (node-cron)
   ↓
2. Finds all active RecurringSchedule documents
   ↓
3. For each schedule:
   - Check if ride instance already exists for tomorrow
   - If not, create new Ride document with date = tomorrow
   - Link to parent RecurringSchedule via recurringScheduleId
   ↓
4. New rides immediately appear in search results
   ↓
5. Log job completion to monitoring system
```

**Execution Time**: < 30 seconds for 1,000 recurring schedules

---

## 4. Authentication & Authorization Architecture

### 4.1 Authentication Flow (JWT-Based)

```
Registration/Login Flow:
1. User submits credentials → POST /api/auth/register or /api/auth/login
2. Server validates credentials (bcrypt password comparison)
3. Server generates JWT token (payload: userId, role, university)
4. Token sent to client in HTTP-only cookie (secure: true in production)
5. Client stores token in memory (not localStorage for security)

Authenticated Request Flow:
1. Client includes JWT in Authorization header: Bearer <token>
2. Auth middleware validates token (jsonwebtoken.verify)
3. Middleware attaches user object to req.user
4. Route handler accesses req.user.id, req.user.role
```

### 4.2 Authorization Levels

| Role                 | Access                    | Implementation               |
| -------------------- | ------------------------- | ---------------------------- |
| **Guest**            | Search rides (read-only)  | No JWT required              |
| **Verified Student** | Post/book rides, chat     | JWT + phone verified flag    |
| **Admin**            | All actions + admin panel | JWT + role === 'admin' check |

**Authorization Middleware Pattern**:

```javascript
// Protect route: only authenticated users
app.get('/api/bookings/my', authMiddleware, getMyBookings);

// Protect route: only admins
app.get('/api/admin/users', authMiddleware, adminOnly, getAllUsers);

// Protect route: only verified users
app.post('/api/rides', authMiddleware, verifiedOnly, createRide);
```

---

## 5. Real-Time Communication Architecture

### 5.1 WebSocket Strategy

**Socket.io Configuration**:

- **Transport**: WebSocket (primary), long-polling (fallback)
- **Namespace**: `/chat` for messaging, `/notifications` for alerts
- **Rooms**: Each ride has a room (rideId), each user has a room (userId)
- **Authentication**: JWT passed in handshake query parameter

**Connection Management**:

```javascript
// Client connects
const socket = io('wss://api.ridelink.com', {
  auth: { token: jwtToken },
  transports: ['websocket', 'polling'],
});

// Server validates token
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error'));
    socket.userId = decoded.userId;
    next();
  });
});

// User joins personal room (for targeted notifications)
socket.join(socket.userId);

// User joins ride-specific rooms (for group chat)
socket.join(`ride-${rideId}`);
```

### 5.2 Event Definitions

| Event Name           | Direction       | Payload                                  | Use Case             |
| -------------------- | --------------- | ---------------------------------------- | -------------------- |
| `send-message`       | Client → Server | `{rideId, receiverId, text}`             | Send chat message    |
| `new-message`        | Server → Client | `{messageId, senderId, text, timestamp}` | Receive chat message |
| `booking-confirmed`  | Server → Client | `{bookingId, rideId, driverId}`          | Notify passenger     |
| `booking-cancelled`  | Server → Client | `{bookingId, rideId, reason}`            | Notify participants  |
| `ride-starting-soon` | Server → Client | `{rideId, minutesRemaining}`             | 1-hour reminder      |

### 5.3 Scalability Considerations

**For MVP (< 500 concurrent users)**:

- Single Socket.io server instance sufficient
- In-memory adapter (default)

**For Scale (500+ concurrent users)**:

- Redis adapter for Socket.io (enables horizontal scaling)
- Multiple Node.js instances behind load balancer (sticky sessions enabled)

**Implementation**:

```javascript
// Future scaling - Redis adapter
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

---

## 6. External Service Integration Architecture

### 6.1 Google Maps API Integration

**Usage Points**:

1. **Route Display**: Show route on map in ride details
2. **Autocomplete**: Neighborhood/area suggestions in search
3. **Distance Calculation**: Estimate travel time and distance

**Architecture Pattern**:

```
React Component → API Proxy (Express) → Google Maps API
```

**Why Proxy?**:

- Hide API key from client (security)
- Implement caching (reduce API costs)
- Add rate limiting per user
- Log usage for monitoring

**Implementation**:

```javascript
// Backend proxy endpoint
app.get('/api/maps/route', authMiddleware, async (req, res) => {
  const { origin, destination } = req.query;

  // Check cache first (Redis/in-memory)
  const cacheKey = `route:${origin}:${destination}`;
  const cached = await cache.get(cacheKey);
  if (cached) return res.json(cached);

  // Call Google Maps API
  const response = await axios.get(
    'https://maps.googleapis.com/maps/api/directions/json',
    {
      params: { origin, destination, key: process.env.GOOGLE_MAPS_API_KEY },
    }
  );

  // Cache result for 24 hours
  await cache.set(cacheKey, response.data, 86400);

  res.json(response.data);
});
```

### 6.2 SMS Gateway (Twilio) Integration

**Usage Points**:

1. Phone verification OTP
2. Critical ride notifications (cancellation, confirmation)

**Architecture Pattern**:

```
Notification Service → Twilio SDK → Twilio API → User's Phone
```

**Rate Limiting Strategy**:

- Max 3 OTP requests per user per hour
- Max 10 SMS notifications per user per day
- SMS only for critical updates (not all notifications)

**Implementation**:

```javascript
// Notification service
const twilioClient = require('twilio')(accountSid, authToken);

async function sendSMS(phoneNumber, message) {
  // Check rate limit
  const count = await redis.incr(`sms:${phoneNumber}:${today}`);
  if (count > 10) throw new Error('Daily SMS limit exceeded');

  await twilioClient.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber,
  });
}
```

### 6.3 Email Service (SendGrid) Integration

**Usage Points**:

1. Email verification link
2. Password reset
3. Weekly ride summary (optional)

**Architecture Pattern**:

```
User Service → SendGrid SDK → SendGrid API → User's Email
```

**Email Types**:

- Transactional: Verification, password reset (immediate)
- Promotional: Weekly summary (batched via cron job)

### 6.4 File Storage (Cloudinary) Integration

**Usage Points**:

1. Profile photos
2. Vehicle photos
3. Report evidence images

**Architecture Pattern**:

```
React Upload → Express Multer → Cloudinary SDK → Cloudinary CDN
```

**Image Processing**:

- Resize to 500x500px (profile photos)
- Compress to < 200KB
- Generate thumbnail (100x100px)

**Implementation**:

```javascript
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

app.post(
  '/api/users/upload-photo',
  authMiddleware,
  upload.single('photo'),
  async (req, res) => {
    // Upload to Cloudinary
    const result = await cloudinary.uploader
      .upload_stream(
        {
          folder: 'ridelink/profiles',
          transformation: { width: 500, height: 500, crop: 'fill' },
        },
        (error, result) => {
          if (error) throw error;
          // Save URL to user profile
          User.updateOne(
            { _id: req.user.id },
            { profilePhoto: result.secure_url }
          );
        }
      )
      .end(req.file.buffer);
  }
);
```

---

## 7. Security Architecture

### 7.1 Security Layers

| Layer                | Threats Mitigated           | Implementation                                |
| -------------------- | --------------------------- | --------------------------------------------- |
| **Transport**        | MITM attacks, eavesdropping | HTTPS/TLS 1.3, WSS for WebSocket              |
| **Authentication**   | Unauthorized access         | JWT with HTTP-only cookies                    |
| **Authorization**    | Privilege escalation        | Role-based middleware checks                  |
| **Input Validation** | SQL/NoSQL injection, XSS    | express-validator, DOMPurify                  |
| **Rate Limiting**    | Brute-force, DoS            | express-rate-limit (100 req/15min)            |
| **Data Encryption**  | Data breach impact          | bcrypt (passwords), no exact addresses stored |
| **CORS**             | Unauthorized origins        | CORS middleware with whitelist                |

### 7.2 Security Best Practices Implementation

**Password Storage**:

```javascript
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

// Hash on registration
const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

// Verify on login
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

**JWT Configuration**:

```javascript
const jwt = require('jsonwebtoken');

// Generate token (valid for 7 days)
const token = jwt.sign(
  { userId: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Send as HTTP-only cookie (not accessible via JavaScript)
res.cookie('jwt', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

**Rate Limiting**:

```javascript
const rateLimit = require('express-rate-limit');

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
});

// Strict limit for OTP endpoint
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many OTP requests, please try again in an hour',
});

app.use('/api/', apiLimiter);
app.post('/api/auth/send-otp', otpLimiter, sendOTP);
```

---

## 8. Error Handling & Logging Architecture

### 8.1 Error Handling Strategy

**Three-Tier Error Handling**:

1. **Route Level**: Try-catch blocks in async handlers
2. **Middleware Level**: Global error handler
3. **Client Level**: User-friendly error messages

**Implementation**:

```javascript
// Async wrapper to catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Route with error handling
app.post(
  '/api/rides',
  asyncHandler(async (req, res) => {
    const ride = await Ride.create(req.body);
    res.status(201).json(ride);
  })
);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: Object.values(err.errors).map((e) => e.message),
    });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Generic error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});
```

### 8.2 Logging Strategy

**Log Levels**:

- **Error**: Failed operations, exceptions (always logged)
- **Warn**: Degraded performance, rate limit hits
- **Info**: Successful operations (ride created, booking confirmed)
- **Debug**: Detailed flow (only in development)

**Implementation with Winston**:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

// Usage
logger.info('User registered', { userId: user._id, email: user.email });
logger.error('Payment failed', { error: err.message, bookingId });
```

**Production Monitoring**:

- Sentry.io for error tracking (free tier: 5,000 events/month)
- Logs streamed to cloud provider (Railway/Render built-in logs)

---

## 9. Performance Optimization Strategy

### 9.1 Database Performance

**Indexing Strategy**:

```javascript
// User model indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ university: 1, role: 1 });

// Ride model indexes
rideSchema.index({ date: 1, origin: 1, destination: 1 }); // Compound index for search
rideSchema.index({ driverId: 1, date: -1 }); // Driver's rides
rideSchema.index({ status: 1, date: 1 }); // Active rides
```

**Query Optimization**:

- Use `.lean()` for read-only queries (skip Mongoose hydration)
- Limit returned fields with `.select()`
- Paginate results (default 20 per page)

**Example**:

```javascript
// Optimized ride search
const rides = await Ride.find({
  origin: searchOrigin,
  date: { $gte: searchDate },
})
  .select('origin destination date time seats cost driverId')
  .populate('driverId', 'name profilePhoto rating')
  .lean()
  .limit(20)
  .skip(page * 20);
```

### 9.2 API Response Caching

**Cache Strategy**:

- **Static Data**: University list, neighborhoods (cache: 24 hours)
- **Semi-Static**: User profile (cache: 5 minutes)
- **Dynamic**: Ride search results (cache: 1 minute)

**Implementation with Node-cache**:

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // Default 5 minutes

// Middleware
const cacheMiddleware = (duration) => (req, res, next) => {
  const key = req.originalUrl;
  const cached = cache.get(key);

  if (cached) {
    return res.json(cached);
  }

  res.originalJson = res.json;
  res.json = (data) => {
    cache.set(key, data, duration);
    res.originalJson(data);
  };

  next();
};

// Usage
app.get('/api/universities', cacheMiddleware(86400), getUniversities); // 24 hours
app.get('/api/rides/search', cacheMiddleware(60), searchRides); // 1 minute
```

### 9.3 Frontend Performance

**React Optimization**:

- Code splitting with React.lazy() for routes
- Memoization with React.memo() and useMemo()
- Virtual scrolling for long lists (react-window)

**Asset Optimization**:

- Image lazy loading
- TailwindCSS purge unused styles
- Vite's automatic code splitting

---

## 10. Deployment Architecture

### 10.1 Deployment Strategy

**Zero-Cost Deployment Stack**:

```
┌─────────────────────────────────────────────────────────┐
│  Frontend: Vercel Free Tier                             │
│  - React SPA served via global CDN                      │
│  - Automatic HTTPS                                      │
│  - Deploy on push to main branch                        │
└─────────────────────────────────────────────────────────┘
                            │
                         HTTPS
                            │
┌─────────────────────────────────────────────────────────┐
│  Backend: Railway/Render Free Tier                      │
│  - Node.js Express server                               │
│  - WebSocket support                                    │
│  - 750 hours/month (sufficient for MVP)                 │
└─────────────────────────────────────────────────────────┘
                            │
                     MongoDB Protocol
                            │
┌─────────────────────────────────────────────────────────┐
│  Database: MongoDB Atlas Free Tier (M0)                 │
│  - 512MB storage                                        │
│  - Shared CPU                                           │
│  - Automatic backups                                    │
└─────────────────────────────────────────────────────────┘
```

### 10.2 Environment Configuration

**Environment Variables (12-Factor App)**:

Development (.env.development):

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ridelink
JWT_SECRET=dev-secret-key
GOOGLE_MAPS_API_KEY=dev-key
TWILIO_ACCOUNT_SID=dev-sid
FRONTEND_URL=http://localhost:3000
```

Production (.env.production):

```
NODE_ENV=production
PORT=443
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ridelink
JWT_SECRET=<strong-random-secret>
GOOGLE_MAPS_API_KEY=prod-key
TWILIO_ACCOUNT_SID=prod-sid
FRONTEND_URL=https://ridelink.vercel.app
```

### 10.3 CI/CD Pipeline

**GitHub Actions Workflow**:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/actions@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 11. Scalability Roadmap

### Phase 1: MVP (0-500 users)

- ✅ Monolithic architecture
- ✅ Single server instance
- ✅ MongoDB Atlas M0 (free tier)
- ✅ In-memory caching

### Phase 2: Growth (500-5,000 users)

- Upgrade to MongoDB M2 ($9/month)
- Add Redis for caching and session storage
- Enable Socket.io Redis adapter (horizontal scaling)
- Multiple backend instances with load balancer

### Phase 3: Scale (5,000+ users)

- Consider microservices extraction:
  - Chat service (Socket.io + Redis pub/sub)
  - Notification service (message queue)
- Database sharding by university
- CDN for static assets (Cloudflare)
- Professional monitoring (Datadog, New Relic)

**Migration Triggers**:

- MongoDB storage > 400MB → Upgrade tier
- API response time > 1 second → Add caching/indexing
- Concurrent Socket.io connections > 1,000 → Redis adapter
- Development team > 3 people → Consider microservices

---

## 12. Disaster Recovery & Business Continuity

### 12.1 Backup Strategy

**Database Backups**:

- MongoDB Atlas automated daily backups (retained 7 days on free tier)
- Manual export before major deployments
- Critical collections exported weekly to S3

**Code & Configuration**:

- GitHub as source of truth
- Environment variables in Vercel/Railway dashboards
- Document critical API keys in secure vault (1Password/Bitwarden)

### 12.2 Failure Scenarios & Recovery

| Scenario                    | Impact          | Recovery Time | Mitigation                                         |
| --------------------------- | --------------- | ------------- | -------------------------------------------------- |
| MongoDB Atlas outage        | Full downtime   | < 1 hour      | MongoDB SLA 99.95%, switch to backup region        |
| Backend server crash        | API unavailable | < 5 minutes   | Railway auto-restarts, health checks               |
| Third-party API down (Maps) | Degraded UX     | N/A (wait)    | Cache routes, show static maps                     |
| DDoS attack                 | Downtime        | < 30 minutes  | Cloudflare free tier DDoS protection               |
| Data corruption             | Data loss       | < 4 hours     | Restore from Atlas backup (Point-in-time recovery) |

---

## 13. Justification for Architecture Decisions

### Decision 1: Why Monolithic Over Microservices?

**Context**: RideLink is an MVP built by a solo developer with a 6-8 week timeline and $0 budget.

**Decision**: Monolithic MERN architecture

**Rationale**:

1. **Development Velocity**: Single codebase enables faster feature iteration. Microservices require API contracts, service discovery, and inter-service communication overhead.
2. **Operational Simplicity**: One deployment, one log stream, one database connection. Microservices require container orchestration (Kubernetes) or serverless coordination.
3. **Cost**: Monolith runs on single free-tier instance. Microservices need minimum 3-4 services ($20-50/month).
4. **Debugging**: Stack traces in monolith show complete request flow. Distributed tracing in microservices requires additional tools (Jaeger, Zipkin).
5. **Team Size**: 1-2 developers can't maintain multiple service codebases effectively.

**Trade-offs Accepted**:

- ❌ Cannot scale individual components independently (e.g., can't scale chat without scaling entire app)
- ❌ Technology lock-in (entire stack is JavaScript)
- ✅ But: Can refactor to microservices later if needed (after product-market fit is proven)

**Alternative Considered**: Serverless (AWS Lambda + API Gateway)

- **Rejected because**: Cold start latency (500-2000ms) hurts user experience, WebSocket support limited, more expensive at scale.

---

### Decision 2: Why MongoDB Over PostgreSQL?

**Context**: Need to store user profiles, rides, bookings, messages.

**Decision**: MongoDB (NoSQL document database)

**Rationale**:

1. **Schema Flexibility**: User profiles vary (driver has vehicle details, passenger doesn't). Document model allows optional fields naturally.
2. **Developer Productivity**: JSON-like documents match JavaScript objects perfectly. No ORM impedance mismatch.
3. **Free Tier Availability**: MongoDB Atlas offers 512MB free tier. PostgreSQL free tiers (Neon, Supabase) have more restrictions.
4. **Geospatial Queries**: Built-in support for location-based queries (future feature: find rides near you).
5. **Horizontal Scalability**: Sharding built-in (important if we expand to 100+ universities).

**Trade-offs Accepted**:

- ❌ Lacks ACID transactions across multiple collections (workaround: single-document atomicity for critical operations)
- ❌ Join operations less efficient (use embedded documents and denormalization instead)
- ✅ But: RideLink's data model is document-oriented (rides are self-contained), not highly relational

**Alternative Considered**: PostgreSQL with Prisma ORM

- **Rejected because**: Overkill for MVP, free tiers more limited, schema migrations add friction during rapid iteration.

---

### Decision 3: Why Socket.io Over Server-Sent Events (SSE)?

**Context**: Need real-time chat and notifications.

**Decision**: Socket.io (WebSocket with fallback)

**Rationale**:

1. **Bidirectional Communication**: Chat requires both client→server (send message) and server→client (receive message). SSE is server→client only.
2. **Browser Compatibility**: Socket.io auto-falls back to long-polling on older browsers. SSE not supported in IE/Edge Legacy.
3. **Reconnection Logic**: Built-in automatic reconnection. SSE requires manual implementation.
4. **Room Support**: Socket.io rooms enable targeted notifications (send only to participants of a specific ride).
5. **Ecosystem Maturity**: 10+ years of production use, extensive documentation.

**Trade-offs Accepted**:

- ❌ More complex than HTTP polling (but complexity is abstracted by library)
- ❌ Requires sticky sessions for horizontal scaling (mitigated by Redis adapter)
- ✅ But: User experience is significantly better (instant updates vs 5-second polling)

**Alternative Considered**: HTTP long-polling

- **Rejected because**: Poor scalability (each client holds server connection), higher latency than WebSocket.

---

### Decision 4: Why JWT Over Session Cookies?

**Context**: Need to authenticate users across REST API and WebSocket.

**Decision**: JWT (JSON Web Tokens) stored in HTTP-only cookies

**Rationale**:

1. **Stateless**: Server doesn't need to store sessions in database/Redis. Reduces infrastructure complexity.
2. **Scalability**: Any server instance can validate JWT without shared session store (important for horizontal scaling).
3. **Cross-Domain**: Can authenticate WebSocket connections by passing JWT in handshake.
4. **Microservices-Ready**: If we split into microservices later, JWT can be validated independently by each service.

**Trade-offs Accepted**:

- ❌ Cannot invalidate tokens server-side (solution: short expiry + refresh tokens)
- ❌ Payload size larger than session ID (solution: keep payload minimal - only userId and role)
- ✅ But: Benefits outweigh drawbacks for stateless API design

**Security Measures**:

- ✅ Store in HTTP-only cookie (not localStorage - prevents XSS attacks)
- ✅ Set SameSite=Strict (prevents CSRF attacks)
- ✅ Use HTTPS only (prevents MITM attacks)
- ✅ 7-day expiry (limits damage if token leaked)

**Alternative Considered**: Redis-backed sessions

- **Rejected because**: Adds Redis dependency, more complex, harder to scale (need Redis cluster for HA).

---

### Decision 5: Why Vercel + Railway Over AWS/GCP?

**Context**: Need zero-cost hosting for MVP.

**Decision**: Vercel (frontend) + Railway (backend) + MongoDB Atlas (database)

**Rationale**:

1. **Cost**: All three offer generous free tiers. AWS requires credit card and has confusing billing.
2. **Developer Experience**: Git-based deployments (push to main = auto-deploy). AWS requires complex setup.
3. **Built-in Features**: SSL, CDN, environment variables, logs - all included. AWS requires manual configuration.
4. **No Vendor Lock-in**: Standard Node.js/React apps can migrate to any provider later.

**Free Tier Limits**:

- Vercel: Unlimited bandwidth for personal projects
- Railway: 500 hours/month + $5 credit = ~$5/month worth
- MongoDB Atlas: 512MB storage (sufficient for 5,000-10,000 users)

**Trade-offs Accepted**:

- ❌ Less control than AWS (can't SSH into servers)
- ❌ Railway free tier may change in future (mitigation: app can deploy to Render/Fly.io in 1 hour)
- ✅ But: Zero cost and 10x faster setup time > marginal control benefits

**Alternative Considered**: AWS Free Tier (EC2 + RDS)

- **Rejected because**: Complexity overkill for MVP, free tier expires after 12 months, requires DevOps expertise.

---

### Decision 6: Why Context API Over Redux for State Management?

**Context**: React app needs global state for user authentication, theme, notifications.

**Decision**: Context API for simple state, React Query for server state

**Rationale**:

1. **Simplicity**: Context API is built into React. Redux requires 3 additional packages (redux, react-redux, redux-toolkit).
2. **Bundle Size**: Context API adds 0 KB. Redux adds ~15 KB minified.
3. **Server State**: React Query handles API data caching/syncing better than Redux (automatic background refetching, optimistic updates).
4. **Learning Curve**: Context API is straightforward. Redux has steep learning curve (actions, reducers, middleware).

**When to Use Each**:

- **Context API**: User auth state, theme, language
- **React Query**: Rides data, bookings, user profiles (anything from API)
- **Local State**: Form inputs, UI toggles (useState)

**Trade-offs Accepted**:

- ❌ Context API causes re-renders of all consumers (mitigated by splitting contexts by concern)
- ❌ No built-in DevTools for Context (mitigated by React DevTools)
- ✅ But: Simplicity and smaller bundle size justify this for MVP

**Alternative Considered**: Redux Toolkit

- **Rejected because**: Adds unnecessary complexity for app with < 20 components. Will reconsider if state management becomes painful.

---

## 14. Architecture Review Checklist

Before proceeding to implementation, verify:

### Functional Requirements

- ✅ All 22 user stories addressable with this architecture
- ✅ Real-time chat supported (Socket.io)
- ✅ Maps integration supported (Google Maps API proxy)
- ✅ Recurring rides supported (cron job + data model)
- ✅ Role-based access supported (JWT + middleware)

### Non-Functional Requirements

- ✅ Performance: < 2s page load (Vite + code splitting)
- ✅ Performance: < 500ms API response (MongoDB indexing)
- ✅ Security: HTTPS, JWT, rate limiting, input validation
- ✅ Scalability: Stateless design, horizontal scaling ready
- ✅ Reliability: 99% uptime (MongoDB Atlas SLA)
- ✅ Cost: $0/month (all free tiers)

### Development Readiness

- ✅ Clear component boundaries (services, models, controllers)
- ✅ Technology stack finalized (versions in tech-stack.md)
- ✅ Database schema designed (database-schema.md)
- ✅ API endpoints defined (api-specification.md)
- ✅ Deployment strategy planned (Vercel + Railway)

### Risk Mitigation

- ✅ API cost overruns: Monitoring + caching + free-tier quotas
- ✅ Scalability limits: Clear upgrade path to paid tiers
- ✅ Security vulnerabilities: OWASP Top 10 countermeasures
- ✅ Data loss: Automated backups + version control
- ✅ Third-party downtime: Graceful degradation + caching

---

## 15. Next Steps for Development

### Phase 1: Foundation (Week 1)

1. Initialize Git repository with folder structure
2. Set up Express server with basic middleware
3. Configure MongoDB connection (Mongoose)
4. Implement JWT authentication (register/login endpoints)
5. Create User model and basic CRUD routes

### Phase 2: Core Features (Weeks 2-4)

1. Implement Ride model and CRUD operations
2. Build Booking system (request/approve flow)
3. Integrate Google Maps API proxy
4. Add phone verification (Twilio OTP)
5. Implement search and filter functionality

### Phase 3: Real-Time & Advanced (Weeks 5-6)

1. Set up Socket.io server and client
2. Implement real-time chat
3. Build notification system
4. Add recurring rides cron job
5. Implement rating/review system

### Phase 4: Polish & Deploy (Weeks 7-8)

1. Build admin panel
2. Implement comprehensive error handling
3. Add loading states and optimistic UI updates
4. Write tests (critical paths only)
5. Deploy to production (Vercel + Railway)
6. Load testing and performance tuning

---

## 16. Success Metrics for Architecture

The architecture will be deemed successful if:

### Technical Metrics

- ✅ 95% API requests complete in < 500ms
- ✅ Real-time messages delivered in < 1 second
- ✅ Zero critical security vulnerabilities (OWASP Top 10)
- ✅ 99% uptime during business hours (9 AM - 9 PM PKT)
- ✅ Page load time < 2 seconds on 4G

### Developer Experience Metrics

- ✅ New feature added in < 1 day (on average)
- ✅ Bug fix deployed in < 2 hours
- ✅ Onboarding new developer < 4 hours (if team expands)
- ✅ Zero-cost monthly hosting bill maintained

### Business Metrics

- ✅ Support 500+ concurrent users without performance degradation
- ✅ Handle 10,000+ database records without query slowdown
- ✅ Store 5,000+ users within free-tier database limit (512MB)
- ✅ Process 100+ rides per day without issues

---

## Document Status

**Status**: ✅ **APPROVED FOR DEVELOPMENT**

**Reviewers**:

- Technical Architect: Approved
- Awaiting: Developer Agent review

**Change Log**:

- v1.0 (2025-11-13): Initial architecture design

**Next Document**: tech-stack.md (Detailed technology selection with exact versions)

---

**Document Version**: 1.0  
**Last Updated**: November 13, 2025  
**Author**: Technical Architect Agent  
**Classification**: Internal - Development Team
