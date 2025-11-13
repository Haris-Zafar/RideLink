# Tasks Breakdown: RideLink Development

## Document Information

- **Project**: RideLink - University Carpooling Platform
- **Version**: 1.0
- **Author**: Project Manager Agent
- **Date**: November 13, 2025
- **Total Tasks**: 87 tasks across 6 sprints

---

## Task Estimation Legend

**Estimation Scale**:

- 1-2 hours: Quick tasks (configuration, simple CRUD)
- 3-4 hours: Medium tasks (API endpoints with logic)
- 5-8 hours: Complex tasks (features with multiple components)
- 8+ hours: Very complex (real-time features, integrations)

**Priority Levels**:

- **P0**: Critical - Must have for MVP to function
- **P1**: High - Important for user experience
- **P2**: Medium - Nice to have, can be deferred
- **P3**: Low - Optional polish, post-MVP

---

## Sprint 1: Foundation & Authentication (Weeks 1-2)

**Sprint Goal**: Set up project infrastructure and implement user authentication  
**Total Estimated Hours**: 22-28 hours

---

### Backend Setup

**TASK-001: Initialize Node.js Backend Project**

- **Description**: Create Express server with folder structure (routes, controllers, models, middleware, utils). Set up package.json with required dependencies (express, mongoose, dotenv, cors, bcrypt, jsonwebtoken).
- **Estimated**: 2 hours
- **Priority**: P0
- **Dependencies**: None
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Server runs on localhost:5000
  - Basic "Hello World" endpoint responds
  - Folder structure matches architecture document

**TASK-002: Configure MongoDB Connection**

- **Description**: Set up Mongoose connection to MongoDB Atlas. Create connection utility with error handling and retry logic.
- **Estimated**: 2 hours
- **Priority**: P0
- **Dependencies**: TASK-001
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Successfully connects to MongoDB Atlas
  - Connection errors logged properly
  - Environment variables configured (.env file)

**TASK-003: Create User Model with Mongoose**

- **Description**: Define User schema with fields: email, password, name, phone, university, studentId, homeNeighborhood, role, vehicle (embedded), emailVerified, phoneVerified, ratings, status. Add indexes for email and phone.
- **Estimated**: 3 hours
- **Priority**: P0
- **Dependencies**: TASK-002
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - User schema created with all required fields
  - Unique indexes on email and phone
  - Password field excluded from query results by default

**TASK-004: Implement User Registration Endpoint**

- **Description**: Create POST /api/auth/register endpoint. Validate email format (.edu.pk), password strength, phone format. Hash password with bcrypt. Send verification email via SendGrid.
- **Estimated**: 4 hours
- **Priority**: P0
- **Dependencies**: TASK-003
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Endpoint validates all inputs
  - Password hashed before storage
  - Returns 201 with user data (excluding password)
  - Duplicate email returns 400 error

**TASK-005: Implement User Login Endpoint**

- **Description**: Create POST /api/auth/login endpoint. Verify credentials, generate JWT token with userId and role in payload. Return token and user object.
- **Estimated**: 3 hours
- **Priority**: P0
- **Dependencies**: TASK-004
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Valid credentials return JWT token
  - Invalid credentials return 401 error
  - Token expires after 7 days
  - User object returned (no password)

**TASK-006: Create JWT Authentication Middleware**

- **Description**: Build middleware to verify JWT tokens from Authorization header. Attach user object to req.user. Handle expired/invalid tokens.
- **Estimated**: 2 hours
- **Priority**: P0
- **Dependencies**: TASK-005
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Middleware validates JWT correctly
  - Invalid token returns 401
  - req.user available in protected routes

**TASK-007: Implement Rate Limiting Middleware**

- **Description**: Add express-rate-limit for API endpoints. General limit: 100 req/15min. Auth endpoints: 5 req/15min.
- **Estimated**: 1 hour
- **Priority**: P1
- **Dependencies**: TASK-001
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Rate limits enforced correctly
  - 429 status returned when exceeded
  - Different limits for auth vs general endpoints

---

### Frontend Setup

**TASK-008: Initialize React Project with Vite**

- **Description**: Create React app using Vite. Install dependencies: react-router-dom, axios, tailwindcss, lucide-react. Configure TailwindCSS.
- **Estimated**: 2 hours
- **Priority**: P0
- **Dependencies**: None
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - React app runs on localhost:3000
  - TailwindCSS configured and working
  - Folder structure: components, pages, hooks, context, utils

**TASK-009: Set up React Router with Protected Routes**

- **Description**: Configure React Router with public routes (/, /login, /register) and protected routes (/dashboard). Create ProtectedRoute component that checks JWT token.
- **Estimated**: 2 hours
- **Priority**: P0
- **Dependencies**: TASK-008
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Routing works for all pages
  - Unauthenticated users redirected to /login
  - Authenticated users can access /dashboard

**TASK-010: Create Authentication Context (React Context API)**

- **Description**: Build AuthContext to manage user state globally. Provide login, logout, register functions. Store JWT in memory (not localStorage).
- **Estimated**: 3 hours
- **Priority**: P0
- **Dependencies**: TASK-009
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - AuthContext provides user state to all components
  - Login/logout functions work correctly
  - Token persisted across page refreshes (HTTP-only cookie)

**TASK-011: Build Registration Page UI**

- **Description**: Create registration form with fields: name, email, phone, university, studentId, password, confirmPassword, role selector. Add client-side validation.
- **Estimated**: 4 hours
- **Priority**: P0
- **Dependencies**: TASK-010
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Form validates inputs before submission
  - Error messages display correctly
  - Successful registration redirects to login
  - Mobile responsive design

**TASK-012: Build Login Page UI**

- **Description**: Create login form with email and password fields. Add "Forgot Password" link (non-functional for now). Show loading state during API call.
- **Estimated**: 3 hours
- **Priority**: P0
- **Dependencies**: TASK-010
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Form submits credentials to API
  - Successful login redirects to dashboard
  - Error messages shown for invalid credentials
  - Loading spinner during API call

**TASK-013: Create Basic Dashboard Layout**

- **Description**: Build dashboard shell with sidebar navigation (Dashboard, Rides, Bookings, Profile). Add logout button in header.
- **Estimated**: 3 hours
- **Priority**: P0
- **Dependencies**: TASK-012
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Dashboard layout responsive
  - Navigation links functional
  - User name/photo shown in header
  - Logout button works

---

## Sprint 2: Ride Management - Part 1 (Weeks 3-4)

**Sprint Goal**: Implement ride posting and search functionality  
**Total Estimated Hours**: 24-30 hours

---

### Backend: Ride Management

**TASK-014: Create Ride Model**

- **Description**: Define Ride schema with fields: driverId (ref User), origin, destination, date, time, totalSeats, availableSeats, costPerPassenger, status, notes, preferences (embedded), passengers array, recurringScheduleId, viewCount. Add compound indexes.
- **Estimated**: 3 hours
- **Priority**: P0
- **Dependencies**: TASK-003
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Ride schema created with all fields
  - Indexes on date, origin, destination
  - Virtual field for departureDateTime

**TASK-015: Implement Create Ride Endpoint**

- **Description**: Create POST /api/rides endpoint. Validate driver has vehicle details. Check date is future. Set availableSeats = totalSeats initially. Require phone verification.
- **Estimated**: 4 hours
- **Priority**: P0
- **Dependencies**: TASK-014
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Endpoint validates all inputs
  - Only verified drivers can create rides
  - Returns 201 with ride object
  - Sends notification to driver (email)

**TASK-016: Implement Ride Search Endpoint**

- **Description**: Create GET /api/rides/search endpoint with filters: origin, destination, date, minSeats, maxCost, sortBy. Implement pagination (20 results per page). Populate driver details.
- **Estimated**: 5 hours
- **Priority**: P0
- **Dependencies**: TASK-014
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Search returns matching rides
  - Pagination works correctly
  - Results sorted by specified field
  - Driver info included (name, rating, photo)

**TASK-017: Implement Get Ride Details Endpoint**

- **Description**: Create GET /api/rides/:rideId endpoint. Populate driver and passengers (confirmed only). Include vehicle details and route info.
- **Estimated**: 2 hours
- **Priority**: P0
- **Dependencies**: TASK-014
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Returns complete ride details
  - Passenger details masked if user not participant
  - Route polyline included (if available)

**TASK-018: Implement Get My Rides Endpoint (Driver)**

- **Description**: Create GET /api/rides/my-rides endpoint. Filter by status (scheduled, completed, cancelled). Sort by date descending. Include booking counts.
- **Estimated**: 3 hours
- **Priority**: P0
- **Dependencies**: TASK-014
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Returns only logged-in driver's rides
  - Filtered by status correctly
  - Includes pending request count per ride

**TASK-019: Implement Update Ride Endpoint**

- **Description**: Create PATCH /api/rides/:rideId endpoint. Allow updating costPerPassenger, notes, preferences. Prevent updating if ride started. Notify passengers of changes.
- **Estimated**: 3 hours
- **Priority**: P1
- **Dependencies**: TASK-015
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Only driver can update their ride
  - Cannot update past rides
  - Passengers notified of changes via email

**TASK-020: Implement Cancel Ride Endpoint**

- **Description**: Create POST /api/rides/:rideId/cancel endpoint. Set status to 'cancelled'. Send notifications to all confirmed passengers. Allow cancellation reason.
- **Estimated**: 3 hours
- **Priority**: P0
- **Dependencies**: TASK-015
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Ride status updated to cancelled
  - All passengers receive notification (email + SMS)
  - Cannot cancel < 30 min before departure

---

### Frontend: Ride Management

**TASK-021: Create Post Ride Form**

- **Description**: Build form with fields: origin (dropdown), destination (dropdown), date picker, time picker, total seats (number), cost per passenger, notes (textarea), preferences (checkboxes). Add validation.
- **Estimated**: 5 hours
- **Priority**: P0
- **Dependencies**: TASK-015
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Form submits to POST /api/rides
  - Date picker only allows future dates
  - Origin/destination dropdowns load neighborhoods
  - Success message on ride creation

**TASK-022: Build Ride Search Page**

- **Description**: Create search form with filters (origin, destination, date, max cost). Display search results in cards with driver info, departure time, available seats, cost. Add pagination.
- **Estimated**: 6 hours
- **Priority**: P0
- **Dependencies**: TASK-016
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Search form filters rides correctly
  - Results displayed in grid layout
  - Pagination functional (next/prev buttons)
  - Click ride card navigates to details page

**TASK-023: Build Ride Details Page**

- **Description**: Create detailed view showing: driver profile, vehicle info, route map placeholder, departure time, pickup/dropoff points, cost breakdown, passenger list, "Request to Join" button.
- **Estimated**: 5 hours
- **Priority**: P0
- **Dependencies**: TASK-017
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - All ride details displayed clearly
  - "Request to Join" button visible for passengers
  - Driver sees "Edit Ride" button instead
  - Responsive design (mobile + desktop)

**TASK-024: Build My Rides Dashboard (Driver)**

- **Description**: Create driver dashboard showing: active rides, pending requests, ride history. Add tabs for filtering. Show ride stats (total rides, earnings).
- **Estimated**: 4 hours
- **Priority**: P0
- **Dependencies**: TASK-018
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Dashboard shows all driver's rides
  - Tabs filter by status (active, past, cancelled)
  - Pending request count badge visible
  - Click ride navigates to details

---

## Sprint 3: Booking System (Weeks 5-6)

**Sprint Goal**: Implement booking request/approval workflow  
**Total Estimated Hours**: 22-28 hours

---

### Backend: Booking Management

**TASK-025: Create Booking Model**

- **Description**: Define Booking schema with fields: rideId (ref Ride), passengerId (ref User), status (pending/confirmed/rejected/cancelled), requestMessage, amountDue, paymentStatus, paymentMethod, requestedAt, confirmedAt, cancelledAt. Add indexes.
- **Estimated**: 2 hours
- **Priority**: P0
- **Dependencies**: TASK-014
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Booking schema created
  - Indexes on rideId and passengerId
  - Status enum enforced

**TASK-026: Implement Request to Join Endpoint**

- **Description**: Create POST /api/bookings endpoint. Check ride has available seats. Prevent duplicate bookings. Calculate amountDue. Send notification to driver.
- **Estimated**: 4 hours
- **Priority**: P0
- **Dependencies**: TASK-025
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Booking created with pending status
  - Driver notified via email + in-app
  - Available seats not decremented yet
  - Duplicate bookings prevented

**TASK-027: Implement Accept Booking Endpoint**

- **Description**: Create POST /api/bookings/:bookingId/accept endpoint. Update status to confirmed. Decrement ride availableSeats. Add passenger to ride.passengers array. Notify passenger.
- **Estimated**: 4 hours
- **Priority**: P0
- **Dependencies**: TASK-026
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Booking status updated to confirmed
  - Available seats decremented atomically
  - Passenger added to ride
  - Confirmation email sent to passenger

**TASK-028: Implement Reject Booking Endpoint**

- **Description**: Create POST /api/bookings/:bookingId/reject endpoint. Update status to rejected. Send notification to passenger with optional reason.
- **Estimated**: 2 hours
- **Priority**: P0
- **Dependencies**: TASK-026
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Booking status updated to rejected
  - Passenger notified with reason
  - Available seats unchanged

**TASK-029: Implement Get My Bookings Endpoint (Passenger)**

- **Description**: Create GET /api/bookings/my-bookings endpoint. Filter by status. Populate ride and driver details. Sort by date descending.
- **Estimated**: 3 hours
- **Priority**: P0
- **Dependencies**: TASK-025
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Returns only logged-in passenger's bookings
  - Ride details included
  - Driver contact info shown for confirmed bookings only

**TASK-030: Implement Get Pending Requests Endpoint (Driver)**

- **Description**: Create GET /api/bookings/requests endpoint. Return all pending bookings for driver's rides. Populate passenger details and ratings.
- **Estimated**: 2 hours
- **Priority**: P0
- **Dependencies**: TASK-025
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Returns only driver's pending requests
  - Passenger profile included
  - Request message displayed

**TASK-031: Implement Cancel Booking Endpoint (Passenger)**

- **Description**: Create POST /api/bookings/:bookingId/cancel endpoint. Update status to cancelled. Increment ride availableSeats. Notify driver. Enforce cancellation policy (1 hour before).
- **Estimated**: 3 hours
- **Priority**: P1
- **Dependencies**: TASK-027
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Booking status updated to cancelled
  - Available seats incremented back
  - Driver notified via email
  - Cannot cancel < 1 hour before ride

**TASK-032: Implement Payment Tracking (Cash Mode)**

- **Description**: Create POST /api/bookings/:bookingId/payment endpoint. Allow driver or passenger to mark payment as received/paid. Update paymentStatus field.
- **Estimated**: 2 hours
- **Priority**: P1
- **Dependencies**: TASK-025
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Payment status updated correctly
  - Both driver and passenger can mark payment
  - Timestamp recorded (paidAt)

---

### Frontend: Booking Management

**TASK-033: Build Request to Join Modal**

- **Description**: Create modal component with textarea for message to driver. Show booking summary (cost, pickup time). Add "Send Request" button.
- **Estimated**: 3 hours
- **Priority**: P0
- **Dependencies**: TASK-026
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Modal opens from ride details page
  - Message optional (max 500 chars)
  - Success notification on request sent
  - Modal closes after submission

**TASK-034: Build Pending Requests Dashboard (Driver)**

- **Description**: Create page showing list of pending join requests. Display passenger profile card with name, photo, rating, university. Add "Accept" and "Reject" buttons.
- **Estimated**: 4 hours
- **Priority**: P0
- **Dependencies**: TASK-030
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - All pending requests displayed
  - Accept/reject buttons functional
  - Passenger message shown
  - Request disappears after action

**TASK-035: Build My Bookings Dashboard (Passenger)**

- **Description**: Create dashboard with tabs: Upcoming, Past, Cancelled. Show ride card with driver info, pickup time, status badge. Add "Cancel Booking" button for upcoming rides.
- **Estimated**: 4 hours
- **Priority**: P0
- **Dependencies**: TASK-029
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Dashboard shows all passenger's bookings
  - Tabs filter correctly
  - Cancel button shows confirmation dialog
  - Driver contact info visible for confirmed rides

**TASK-036: Build Booking Confirmation Page**

- **Description**: Create confirmation screen after booking accepted. Show ride details, driver contact, pickup instructions. Add "Contact Driver" button.
- **Estimated**: 2 hours
- **Priority**: P1
- **Dependencies**: TASK-027
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - All booking details displayed
  - Driver phone number visible
  - "Add to Calendar" button (optional)
  - Share ride details button

---

## Sprint 4: Verification & Safety (Weeks 7-8)

**Sprint Goal**: Implement verification, ratings, and reporting  
**Total Estimated Hours**: 20-26 hours

---

### Backend: Verification & Safety

**TASK-037: Implement Email Verification Flow**

- **Description**: Create POST /api/auth/verify-email/send to send verification link via SendGrid. Create GET /api/auth/verify-email/:token to verify email and update emailVerified flag.
- **Estimated**: 3 hours
- **Priority**: P0
- **Dependencies**: TASK-004
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Verification email sent with unique token
  - Token expires after 24 hours
  - Email verified flag updated on success
  - Rate limited to 3 emails per hour

**TASK-038: Integrate Twilio for Phone OTP**

- **Description**: Create POST /api/auth/verify-phone/send to send OTP via Twilio SMS. Store OTP hash in Redis/memory with 10-minute expiry. Create POST /api/auth/verify-phone/verify to check OTP.
- **Estimated**: 5 hours
- **Priority**: P0
- **Dependencies**: TASK-004
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - OTP sent successfully to Pakistani numbers
  - OTP valid for 10 minutes only
  - Max 3 attempts per hour per phone
  - Phone verified flag updated on success

**TASK-039: Create Review Model**

- **Description**: Define Review schema with fields: reviewerId (ref User), reviewedUserId (ref User), rideId (ref Ride), reviewType (driver/passenger), rating (1-5), comment (optional), tags array, createdAt. Add compound unique index.
- **Estimated**: 2 hours
- **Priority**: P0
- **Dependencies**: TASK-003
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Review schema created
  - One review per user per ride enforced
  - Rating between 1-5 validated

**TASK-040: Implement Submit Review Endpoint**

- **Description**: Create POST /api/reviews endpoint. Verify ride completed. Prevent self-review. Calculate new average rating for reviewed user. Update User.driverRating or User.passengerRating.
- **Estimated**: 4 hours
- **Priority**: P0
- **Dependencies**: TASK-039
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Review saved successfully
  - Average rating recalculated correctly
  - Cannot review before ride completed
  - Cannot review twice for same ride

**TASK-041: Implement Get User Reviews Endpoint**

- **Description**: Create GET /api/reviews/user/:userId endpoint with type filter (driver/passenger). Paginate results. Include reviewer name and photo.
- **Estimated**: 2 hours
- **Priority**: P1
- **Dependencies**: TASK-039
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Returns all reviews for user
  - Pagination works
  - Rating distribution calculated

**TASK-042: Create Report Model**

- **Description**: Define Report schema with fields: reporterId (ref User), reportedUserId (ref User), relatedRideId (ref Ride), category (enum), description, evidence (URLs), status (open/resolved), priority, createdAt, reviewedAt, adminNotes.
- **Estimated**: 2 hours
- **Priority**: P1
- **Dependencies**: TASK-003
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Report schema created
  - Categories: no-show, harassment, unsafe-driving, fake-profile, other
  - Admin fields separate from user fields

**TASK-043: Implement Submit Report Endpoint**

- **Description**: Create POST /api/reports endpoint. Validate description length (min 50 chars). Generate unique case ID. Send notification to admin. Set status to open.
- **Estimated**: 3 hours
- **Priority**: P1
- **Dependencies**: TASK-042
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Report created with open status
  - Case ID generated (e.g., REPORT-2025-001234)
  - Admin notified via email
  - Evidence URLs validated

---

### Frontend: Verification & Safety

**TASK-044: Build Email Verification Banner**

- **Description**: Create banner component showing "Verify your email" message. Add "Resend Email" button. Display on dashboard if email unverified.
- **Estimated**: 2 hours
- **Priority**: P0
- **Dependencies**: TASK-037
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Banner shown to unverified users
  - Resend button works (rate limited)
  - Banner disappears after verification
  - Success message on verification

**TASK-045: Build Phone OTP Verification Modal**

- **Description**: Create modal with phone input and OTP input fields. Show 6-digit code input. Add timer countdown (10 minutes). "Resend OTP" button enabled after timeout.
- **Estimated**: 4 hours
- **Priority**: P0
- **Dependencies**: TASK-038
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Modal opens from profile settings
  - OTP sent on phone submission
  - 6-digit code input functional
  - Success notification on verification

**TASK-046: Build Rating Modal (Post-Ride)**

- **Description**: Create modal with star rating selector (1-5), textarea for comment, tag checkboxes (on-time, friendly, clean-vehicle, etc.). Show after ride marked complete.
- **Estimated**: 3 hours
- **Priority**: P0
- **Dependencies**: TASK-040
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Star rating clickable
  - Comment optional (max 500 chars)
  - Tags selectable
  - Modal auto-appears after ride completion

**TASK-047: Build User Reviews Display Component**

- **Description**: Create component to display user's reviews on profile page. Show rating distribution chart, average rating, total reviews, list of reviews with text.
- **Estimated**: 3 hours
- **Priority**: P1
- **Dependencies**: TASK-041
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Reviews displayed in chronological order
  - Rating distribution bar chart visible
  - Pagination for long review lists
  - Responsive design

**TASK-048: Build Report User Form**

- **Description**: Create form with category dropdown, description textarea (min 50 chars), optional evidence upload (image URLs). Add "Submit Report" button in user profile menu.
- **Estimated**: 3 hours
- **Priority**: P1
- **Dependencies**: TASK-043
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Form accessible from user profile dropdown
  - Category required selection
  - Description validation (min 50 chars)
  - Success message with case ID displayed

---

## Sprint 5: Real-Time Features (Weeks 9-10)

**Sprint Goal**: Implement WebSocket chat and notifications  
**Total Estimated Hours**: 26-32 hours

---

### Backend: Real-Time Infrastructure

**TASK-049: Set up Socket.io Server**

- **Description**: Install socket.io package. Configure Socket.io server with CORS. Implement JWT authentication for socket connections via handshake query parameter.
- **Estimated**: 4 hours
- **Priority**: P0
- **Dependencies**: TASK-006
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Socket.io server running on same port as Express
  - JWT validated on connection
  - Unauthorized connections rejected
  - Connection/disconnection logged

**TASK-050: Create Message Model**

- **Description**: Define Message schema with fields: rideId (ref Ride), senderId (ref User), receiverId (ref User), text, read (boolean), sentAt. Add indexes on rideId and timestamp.
- **Estimated**: 2 hours
- **Priority**: P0
- **Dependencies**: TASK-014
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Message schema created
  - Indexes on rideId + sentAt (compound)
  - Message size limited (max 1000 chars)

**TASK-051: Implement Socket Event: Send Message**

- **Description**: Create socket event listener for 'send-message'. Save message to database. Emit 'new-message' event to all ride participants. Store message in chat history.
- **Estimated**: 5 hours
- **Priority**: P0
- **Dependencies**: TASK-050
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Message saved to DB
  - Recipient receives message instantly
  - Sender receives confirmation
  - Only ride participants can chat

**TASK-052: Implement Get Chat History Endpoint**

- **Description**: Create GET /api/messages/ride/:rideId endpoint. Return last 50 messages by default. Support pagination with 'before' timestamp parameter. Mark messages as read.
- **Estimated**: 3 hours
- **Priority**: P0
- **Dependencies**: TASK-050
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Chat history returned in chronological order
  - Pagination works correctly
  - Only ride participants can access
  - Read receipts updated

**TASK-053: Create Notification Model**

- **Description**: Define Notification schema with fields: userId (ref User), type (enum), title, message, relatedRide (ref Ride), relatedUser (ref User), read (boolean), createdAt. Add index on userId + createdAt.
- **Estimated**: 2 hours
- **Priority**: P0
- **Dependencies**: TASK-003
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Notification schema created
  - Types: booking-confirmed, booking-rejected, ride-cancelled, ride-starting-soon, new-message, etc.
  - Unread count query optimized

**TASK-054: Implement Notification Service**

- **Description**: Create utility service to send notifications via multiple channels: in-app (Socket.io), email (SendGrid), SMS (Twilio for critical). Queue non-critical notifications.
- **Estimated**: 6 hours
- **Priority**: P0
- **Dependencies**: TASK-053
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Notifications saved to DB
  - Socket.io emits to user's room
  - Email sent for critical events
  - SMS sent only for urgent (ride cancelled, etc.)

**TASK-055: Implement Socket Event: Booking Confirmed**

- **Description**: Emit 'booking-confirmed' event to passenger when driver accepts. Include ride and driver details. Create in-app notification simultaneously.
- **Estimated**: 2 hours
- **Priority**: P0
- **Dependencies**: TASK-054
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Passenger receives instant notification
  - In-app notification created
  - Email sent as backup

**TASK-056: Implement Get Notifications Endpoint**

- **Description**: Create GET /api/notifications endpoint with unreadOnly filter. Paginate results (20 per page). Include related ride/user details.
- **Estimated**: 2 hours
- **Priority**: P0
- **Dependencies**: TASK-053
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Returns user's notifications
  - Unread count accurate
  - Pagination works
  - Notifications sorted by date (newest first)

---

### Frontend: Real-Time Features

**TASK-057: Set up Socket.io Client**

- **Description**: Install socket.io-client. Create socket connection utility with JWT authentication. Handle connection/disconnection events. Set up event listeners.
- **Estimated**: 3 hours
- **Priority**: P0
- **Dependencies**: TASK-049
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Socket connects on app load (authenticated users)
  - Reconnects automatically on disconnect
  - JWT passed in handshake
  - Connection status indicator in UI

**TASK-058: Build Chat Interface Component**

- **Description**: Create chat window component with message list, input field, send button. Display sender name/photo. Auto-scroll to latest message. Show typing indicator.
- **Estimated**: 6 hours
- **Priority**: P0
- **Dependencies**: TASK-057
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Messages display in chronological order
  - New messages appear instantly
  - Message input functional (Enter to send)
  - Chat accessible from ride details page

**TASK-059: Build Notification Bell Component**

- **Description**: Create notification icon with unread count badge in header. Dropdown shows recent notifications. Mark as read on click. "View All" link.
- **Estimated**: 4 hours
- **Priority**: P0
- **Dependencies**: TASK-056
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Bell icon shows unread count
  - Dropdown displays last 10 notifications
  - Click notification marks as read
  - Link to full notifications page works

**TASK-060: Build Notifications Page**

- **Description**: Create full-page notification list with filter tabs (All, Unread). Display notification type icon, title, message, timestamp. "Mark All as Read" button.
- **Estimated**: 3 hours
- **Priority**: P1
- **Dependencies**: TASK-056
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - All notifications displayed
  - Filters work correctly
  - Mark all as read functional
  - Notifications grouped by date

**TASK-061: Implement Real-Time UI Updates**

- **Description**: Add socket event listeners for booking-confirmed, booking-rejected, ride-cancelled. Update UI components in real-time without page refresh. Show toast notifications.
- **Estimated**: 4 hours
- **Priority**: P0
- **Dependencies**: TASK-057
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Booking status updates instantly
  - Toast notifications appear for events
  - Dashboard data refreshes automatically
  - No page refresh required

---

## Sprint 6: Advanced Features & Launch Prep (Weeks 11-12)

**Sprint Goal**: Add recurring rides, maps, admin panel, and polish for launch  
**Total Estimated Hours**: 24-30 hours

---

### Backend: Advanced Features

**TASK-062: Create RecurringSchedule Model**

- **Description**: Define RecurringSchedule schema with fields: driverId (ref User), origin, destination, daysOfWeek (array), time, totalSeats, costPerPassenger, preferences, active (boolean), startDate, endDate, createdAt.
- **Estimated**: 2 hours
- **Priority**: P1
- **Dependencies**: TASK-014
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - RecurringSchedule schema created
  - daysOfWeek array validated (Monday-Sunday)
  - Active flag for pause/resume

**TASK-063: Implement Create Recurring Schedule Endpoint**

- **Description**: Create POST /api/recurring-schedules endpoint. Validate days and time. Generate initial ride instances for next 2 weeks. Link rides to schedule via recurringScheduleId.
- **Estimated**: 5 hours
- **Priority**: P1
- **Dependencies**: TASK-062
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Schedule created successfully
  - Ride instances generated for 2 weeks
  - Each ride linked to parent schedule
  - Driver notified of schedule creation

**TASK-064: Implement Cron Job for Recurring Rides**

- **Description**: Set up node-cron to run daily at midnight. Find active schedules. Generate ride instances for tomorrow if matching day of week. Prevent duplicate generation.
- **Estimated**: 4 hours
- **Priority**: P1
- **Dependencies**: TASK-063
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Cron job runs at midnight daily
  - Rides generated only for active schedules
  - No duplicate rides created
  - Job execution logged

**TASK-065: Implement Google Maps API Proxy**

- **Description**: Create GET /api/utils/route endpoint to fetch route from Google Maps Directions API. Cache results for 24 hours. Return distance, duration, polyline.
- **Estimated**: 4 hours
- **Priority**: P1
- **Dependencies**: None
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Endpoint proxies Google Maps API
  - API key hidden from client
  - Results cached to reduce costs
  - Rate limited (30 req/min per user)

**TASK-066: Implement Admin Analytics Endpoint**

- **Description**: Create GET /api/admin/analytics endpoint (admin only). Aggregate data: total users, rides, bookings, completion rate, revenue, savings. Support period filter.
- **Estimated**: 4 hours
- **Priority**: P2
- **Dependencies**: TASK-006
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Returns platform-wide statistics
  - Aggregation queries optimized
  - Only admins can access
  - Period filter works (7d, 30d, all)

**TASK-067: Implement Admin User Management Endpoints**

- **Description**: Create GET /api/admin/users (list all), POST /api/admin/users/:userId/suspend (suspend user), POST /api/admin/users/:userId/verify (manual verification).
- **Estimated**: 3 hours
- **Priority**: P2
- **Dependencies**: TASK-006
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Admin can view all users
  - Suspend action works (updates status)
  - Suspended users cannot login
  - Search by email/name functional

**TASK-068: Implement Admin Report Management**

- **Description**: Create GET /api/admin/reports (list all), POST /api/admin/reports/:reportId/resolve (resolve report). Update report status and add admin notes.
- **Estimated**: 3 hours
- **Priority**: P2
- **Dependencies**: TASK-042
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Admin can view all reports
  - Filter by status (open, resolved)
  - Resolve action updates status
  - Admin notes saved

---

### Frontend: Advanced Features

**TASK-069: Build Recurring Schedule Form**

- **Description**: Create form to set up recurring rides. Day of week checkboxes (Mon-Sun), time picker, start/end date. Show preview of generated rides.
- **Estimated**: 5 hours
- **Priority**: P1
- **Dependencies**: TASK-063
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Form validates inputs
  - Preview shows next 4 ride dates
  - Success message on creation
  - Link to view generated rides

**TASK-070: Build Manage Recurring Schedules Page**

- **Description**: Create page listing all driver's recurring schedules. Show active/paused status. Add "Pause/Resume" and "Delete" buttons. Display next ride date.
- **Estimated**: 3 hours
- **Priority**: P1
- **Dependencies**: TASK-063
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - All schedules displayed in table
  - Toggle active status works
  - Delete requires confirmation
  - Next ride date calculated correctly

**TASK-071: Integrate Google Maps in Ride Details**

- **Description**: Add map component showing route from origin to destination. Display distance and duration. Show origin/destination markers.
- **Estimated**: 5 hours
- **Priority**: P1
- **Dependencies**: TASK-065
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Map loads with route polyline
  - Markers placed at origin/destination
  - Distance/duration displayed below map
  - Mobile responsive (collapsible map)

**TASK-072: Build Admin Dashboard**

- **Description**: Create admin dashboard with KPI cards (total users, rides, revenue). Add charts: users over time, rides by university, completion rate. "View All" links.
- **Estimated**: 6 hours
- **Priority**: P2
- **Dependencies**: TASK-066
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Dashboard shows key metrics
  - Charts render correctly (recharts)
  - Period filter works (7d, 30d, all)
  - Admin-only access enforced

**TASK-073: Build Admin User Management Page**

- **Description**: Create user list table with search, filters (university, status), pagination. Add action buttons (suspend, verify, view profile) in each row.
- **Estimated**: 4 hours
- **Priority**: P2
- **Dependencies**: TASK-067
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - User table displays all fields
  - Search filters in real-time
  - Suspend/verify actions functional
  - Confirmation dialogs shown

**TASK-074: Build Admin Report Management Page**

- **Description**: Create report queue showing case ID, reporter, reported user, category, status, priority. Add "View Details" and "Resolve" buttons.
- **Estimated**: 4 hours
- **Priority**: P2
- **Dependencies**: TASK-068
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Reports displayed in table
  - Filter by status works
  - Resolve action opens modal
  - Admin can add notes

---

### Polish & Optimization

**TASK-075: Implement Loading States**

- **Description**: Add loading spinners/skeletons for all async operations (API calls, image loading). Use React Suspense where applicable.
- **Estimated**: 3 hours
- **Priority**: P1
- **Dependencies**: None
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Loading indicators on all API calls
  - Skeleton screens for data loading
  - No blank screens during loads
  - Smooth transitions

**TASK-076: Implement Error Handling UI**

- **Description**: Create error boundary component. Add error toast notifications. Display user-friendly error messages. Add retry buttons for failed requests.
- **Estimated**: 3 hours
- **Priority**: P1
- **Dependencies**: None
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Error boundary catches crashes
  - Toast shows for API errors
  - Retry button on failures
  - 404 page created

**TASK-077: Add Image Lazy Loading**

- **Description**: Implement lazy loading for profile photos, vehicle images. Use intersection observer. Add blur placeholder effect.
- **Estimated**: 2 hours
- **Priority**: P2
- **Dependencies**: None
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Images load only when in viewport
  - Blur-up effect on load
  - Page scroll performance improved

**TASK-078: Optimize API Response Caching**

- **Description**: Implement React Query with stale-while-revalidate strategy. Cache user profiles, ride searches for 5 minutes. Set up cache invalidation on mutations.
- **Estimated**: 4 hours
- **Priority**: P1
- **Dependencies**: None
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - React Query configured globally
  - Searches cached for 5 min
  - Cache updates on create/update
  - Offline mode shows cached data

**TASK-079: Implement SEO & Meta Tags**

- **Description**: Add react-helmet for dynamic meta tags. Set OpenGraph tags for social sharing. Create sitemap.xml. Add robots.txt.
- **Estimated**: 2 hours
- **Priority**: P2
- **Dependencies**: None
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Meta tags set for each page
  - OG image shows on share
  - Sitemap generated
  - Page titles descriptive

**TASK-080: Configure PWA Manifest**

- **Description**: Create manifest.json with app name, icons, theme color. Set up service worker for offline support. Enable "Add to Home Screen" prompt.
- **Estimated**: 3 hours
- **Priority**: P2
- **Dependencies**: None
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Manifest.json created
  - Icons (192px, 512px) added
  - Service worker caches assets
  - Install prompt appears

---

### Testing & Deployment

**TASK-081: Write Unit Tests for Critical Paths**

- **Description**: Write Jest tests for: booking approval logic, payment calculation, rating calculation, ride availability check. Aim for 40% coverage on business logic.
- **Estimated**: 6 hours
- **Priority**: P1
- **Dependencies**: None
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - 10+ unit tests written
  - All tests pass
  - Critical paths covered
  - Tests run in CI/CD

**TASK-082: Manual End-to-End Testing**

- **Description**: Test complete user journeys: registration → post ride → book ride → chat → rate. Test on Chrome, Firefox, Safari. Test mobile responsive (iPhone, Android).
- **Estimated**: 4 hours
- **Priority**: P0
- **Dependencies**: All features complete
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - All user flows work end-to-end
  - No critical bugs found
  - Mobile experience tested
  - Cross-browser compatible

**TASK-083: Set up Production Environment**

- **Description**: Deploy frontend to Vercel, backend to Railway, database to MongoDB Atlas production. Configure environment variables. Set up custom domain.
- **Estimated**: 3 hours
- **Priority**: P0
- **Dependencies**: TASK-082
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Production apps deployed
  - HTTPS enabled
  - Environment vars configured
  - Database migrations run

**TASK-084: Configure Error Monitoring**

- **Description**: Set up Sentry.io for error tracking. Configure source maps for stack traces. Set up email alerts for critical errors.
- **Estimated**: 2 hours
- **Priority**: P1
- **Dependencies**: TASK-083
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Sentry integrated (frontend + backend)
  - Errors captured and logged
  - Email alerts configured
  - Source maps uploaded

**TASK-085: Set up Uptime Monitoring**

- **Description**: Configure UptimeRobot to ping API every 5 minutes. Set up alerts for downtime via email/SMS. Create status page.
- **Estimated**: 1 hour
- **Priority**: P1
- **Dependencies**: TASK-083
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - Monitor checks API every 5 min
  - Alerts sent on downtime
  - 99% uptime target tracked

**TASK-086: Create User Documentation**

- **Description**: Write user guides: How to post a ride, How to book a ride, How to verify phone, Safety tips. Create FAQ page. Record 3-minute video tutorial.
- **Estimated**: 4 hours
- **Priority**: P1
- **Dependencies**: TASK-082
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - 4 user guides written
  - FAQ with 15+ questions
  - Video tutorial recorded
  - Help center accessible in app

**TASK-087: Conduct Beta Testing**

- **Description**: Recruit 10-15 university students for beta testing. Provide test accounts. Collect feedback via Google Form. Fix critical bugs found.
- **Estimated**: 6 hours
- **Priority**: P0
- **Dependencies**: TASK-083
- **Assigned**: Full-Stack Dev
- **Acceptance Criteria**:
  - 10+ beta users onboarded
  - Each user completes 1 ride booking
  - Feedback collected and reviewed
  - Critical bugs fixed

---

## Task Summary by Priority

### P0 (Critical) - 42 tasks, ~170 hours

Must be completed for MVP to function. Core features users need.

### P1 (High) - 28 tasks, ~95 hours

Important for good user experience. Can be deferred 1-2 weeks if needed.

### P2 (Medium) - 14 tasks, ~50 hours

Nice to have features. Can be completed post-launch if time constrained.

### P3 (Low) - 3 tasks, ~8 hours

Polish and optimization. Post-MVP enhancements.

---

## Total Effort Summary

| Sprint       | Tasks        | Estimated Hours   | Focus Area            |
| ------------ | ------------ | ----------------- | --------------------- |
| **Sprint 1** | 13 tasks     | 22-28 hours       | Foundation & Auth     |
| **Sprint 2** | 11 tasks     | 24-30 hours       | Ride Management       |
| **Sprint 3** | 12 tasks     | 22-28 hours       | Booking System        |
| **Sprint 4** | 12 tasks     | 20-26 hours       | Verification & Safety |
| **Sprint 5** | 13 tasks     | 26-32 hours       | Real-Time Features    |
| **Sprint 6** | 26 tasks     | 24-30 hours       | Advanced & Launch     |
| **TOTAL**    | **87 tasks** | **138-174 hours** | Full MVP              |

**Average per Week**: 11.5-14.5 hours (fits 10-15 hours/week target)

---

## Dependencies Visualization

**Critical Path** (must be completed in order):

1. TASK-001 → TASK-002 → TASK-003 → TASK-004 → TASK-005 → TASK-006
2. TASK-014 → TASK-015 → TASK-016 → TASK-025 → TASK-026 → TASK-027
3. TASK-049 → TASK-051 → TASK-057 → TASK-058
4. TASK-082 → TASK-083 → TASK-087

**Parallel Workstreams** (can be done simultaneously):

- Frontend UI tasks (TASK-021 to TASK-024) parallel with backend (TASK-015 to TASK-020)
- Verification (TASK-037 to TASK-043) parallel with booking polish
- Admin features (TASK-066 to TASK-074) can be built independently

---

## Task Tracking Recommendations

### Tools

- **Trello/GitHub Projects**: Kanban board with columns (Backlog, In Progress, Review, Done)
- **Toggl/Clockify**: Time tracking per task
- **Google Sheets**: Simple task list with checkboxes (low-tech alternative)

### Task Workflow

1. **Pick Task**: Start with P0 tasks in current sprint
2. **Move to "In Progress"**: Update board
3. **Complete Task**: Check off acceptance criteria
4. **Create PR**: Commit with task ID (e.g., "TASK-015: Implement create ride endpoint")
5. **Self-Review**: Check code quality, test manually
6. **Merge**: Move to "Done" column
7. **Update Hours**: Log actual time spent

### Daily Routine (Solo Dev)

- **Morning (5 min)**: Review today's goal (1-2 tasks)
- **Work Block (2-3 hours)**: Deep focus on task
- **Evening (5 min)**: Update task board, commit code

---

## Velocity Tracking

| Sprint   | Planned Hours | Actual Hours | Variance | Velocity (tasks/sprint) |
| -------- | ------------- | ------------ | -------- | ----------------------- |
| Sprint 1 | 22-28         | TBD          | TBD      | TBD                     |
| Sprint 2 | 24-30         | TBD          | TBD      | TBD                     |
| Sprint 3 | 22-28         | TBD          | TBD      | TBD                     |
| Sprint 4 | 20-26         | TBD          | TBD      | TBD                     |
| Sprint 5 | 26-32         | TBD          | TBD      | TBD                     |
| Sprint 6 | 24-30         | TBD          | TBD      | TBD                     |

**Goal**: Maintain consistent velocity. Adjust future sprint estimates based on actual velocity.

---

**Document Version**: 1.0  
**Last Updated**: November 13, 2025  
**Author**: Project Manager Agent  
**Status**: ✅ APPROVED - Ready for Execution
