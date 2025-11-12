# User Stories: RideLink - University Carpooling Platform

## Epic 1: User Authentication & Profile Management

### US-001: Student Registration

**As a** university student  
**I want to** register using my university email address  
**So that** I can access RideLink as a verified student

**Acceptance Criteria:**

- User can register with .edu.pk email address only
- System sends email verification link upon registration
- User must verify email before accessing platform features
- Registration form includes: name, email, password, university selection, student ID
- Password must be minimum 8 characters with at least 1 uppercase, 1 lowercase, 1 number
- System displays error messages for invalid inputs (duplicate email, weak password)
- Upon successful registration, user is redirected to phone verification page

**Priority**: High | **Story Points**: 5

---

### US-002: Phone Number Verification

**As a** registered user  
**I want to** verify my phone number via SMS OTP  
**So that** other users can contact me for rides and my account is more trustworthy

**Acceptance Criteria:**

- User enters Pakistani phone number in format +92-XXX-XXXXXXX
- System sends 6-digit OTP via SMS within 30 seconds
- OTP is valid for 10 minutes
- User can request resend OTP after 60 seconds
- Maximum 3 OTP attempts per hour to prevent abuse
- Upon verification, user profile shows "Phone Verified" badge
- Unverified users can browse but cannot post/book rides

**Priority**: High | **Story Points**: 5

---

### US-003: Profile Setup

**As a** new user  
**I want to** complete my profile with photo and preferences  
**So that** other users can recognize me and trust me for carpooling

**Acceptance Criteria:**

- User can upload profile photo (JPG/PNG, max 5MB)
- Profile includes: full name, home neighborhood dropdown, bio (optional, 200 chars)
- User selects role: Driver, Passenger, or Both
- If "Driver" selected, user must add vehicle details: make, model, color, license plate
- All mandatory fields validated before profile is marked "complete"
- Incomplete profiles cannot post rides (can only browse)
- Profile photo compressed to 500px × 500px for storage efficiency

**Priority**: High | **Story Points**: 3

---

## Epic 2: Ride Posting & Management (Driver)

### US-004: Post a One-Time Ride

**As a** driver  
**I want to** post a ride from my home area to campus with date, time, and cost  
**So that** passengers can find and join my ride

**Acceptance Criteria:**

- Driver selects: origin neighborhood, destination (auto-filled as campus), date, time
- Driver specifies: available seats (1-4), cost per passenger (PKR 50-500)
- Driver can add optional notes (200 chars): "Non-smokers only", "AC available"
- System calculates estimated departure time based on traffic (Google Maps API)
- Ride is immediately visible in passenger search results
- Driver receives notification when first passenger requests to join
- Ride cannot be posted for past dates/times

**Priority**: High | **Story Points**: 5

---

### US-005: Create Recurring Ride Schedule

**As a** driver who commutes regularly  
**I want to** set up a weekly recurring ride schedule  
**So that** I don't have to post the same ride every day

**Acceptance Criteria:**

- Driver can select multiple days of the week (Mon-Sun checkboxes)
- Driver sets fixed time and route for recurring schedule
- System auto-creates ride instances for next 14 days
- Each instance appears as separate bookable ride
- Driver can edit/cancel individual instances without affecting entire schedule
- Driver can pause or delete entire recurring schedule
- Passengers see "Recurring Ride" badge on these rides

**Priority**: Medium | **Story Points**: 8

---

### US-006: Manage Ride Requests

**As a** driver with posted rides  
**I want to** view and approve/reject passenger join requests  
**So that** I can choose who rides with me

**Acceptance Criteria:**

- Driver sees list of pending requests with passenger profiles
- Each request shows: passenger name, photo, rating, university, optional message
- Driver can click "Accept" or "Reject" with optional reason
- Accepted passengers receive immediate notification
- Rejected passengers receive polite notification (no reason shown)
- Driver cannot accept more passengers than available seats
- Once ride is full, it's automatically hidden from search results

**Priority**: High | **Story Points**: 5

---

### US-007: Cancel a Ride

**As a** driver with an upcoming ride  
**I want to** cancel the ride if I'm unable to drive  
**So that** passengers are informed and can find alternative rides

**Acceptance Criteria:**

- Driver can cancel ride up to 30 minutes before departure time
- All confirmed passengers receive SMS + in-app notification immediately
- Cancellation within 2 hours of departure shows warning: "Late cancellation affects your rating"
- Driver must select cancellation reason: Vehicle issue, Personal emergency, Other
- Cancelled rides marked in driver's history (impacts rating if frequent)
- Passengers can leave review even for cancelled rides

**Priority**: Medium | **Story Points**: 3

---

## Epic 3: Ride Discovery & Booking (Passenger)

### US-008: Search for Available Rides

**As a** passenger  
**I want to** search for rides from my area to campus on a specific date  
**So that** I can find suitable carpool options

**Acceptance Criteria:**

- Passenger selects: origin neighborhood, destination, date
- Optional filters: time range (morning/afternoon/evening), max cost, available seats
- Search results show: driver name/photo, rating, departure time, cost, available seats
- Results sorted by: earliest departure time (default), lowest cost, highest rating
- Each result card clickable to view full ride details
- "No results" state suggests expanding search criteria or posting ride request
- Search is available without login (login required to book)

**Priority**: High | **Story Points**: 5

---

### US-009: View Ride Details

**As a** passenger browsing rides  
**I want to** view complete details of a ride  
**So that** I can decide if it suits my needs

**Acceptance Criteria:**

- Ride detail page shows: full route on map, exact pickup point, departure time
- Driver information: name, photo, rating (X.X/5), total rides completed, vehicle details
- Cost per passenger clearly displayed with "vs Uber/Careem: Save PKR XXX" comparison
- Driver's additional notes visible (if any)
- Reviews from previous passengers (latest 5)
- "Request to Join" button (disabled if ride is full or if user not logged in)
- Share button to send ride details via WhatsApp/SMS

**Priority**: High | **Story Points**: 3

---

### US-010: Request to Join a Ride

**As a** passenger who found a suitable ride  
**I want to** send a join request to the driver  
**So that** I can book a seat in their vehicle

**Acceptance Criteria:**

- Passenger clicks "Request to Join" on ride detail page
- Optional message field (100 chars): "I'm also from XYZ society"
- System checks: user has verified phone, profile is complete
- Request sent to driver immediately with in-app + SMS notification
- Passenger sees "Request Pending" status on ride card
- Passenger can cancel request before driver responds
- Passenger cannot send duplicate requests for same ride
- Request expires after 24 hours if driver doesn't respond

**Priority**: High | **Story Points**: 5

---

### US-011: Cancel a Booking

**As a** passenger with a confirmed ride  
**I want to** cancel my booking if my plans change  
**So that** the driver can offer the seat to someone else

**Acceptance Criteria:**

- Passenger can cancel booking up to 1 hour before departure
- Cancellation within 2 hours shows warning: "Late cancellation affects your rating"
- Driver receives immediate notification about cancellation
- Seat becomes available again in search results
- Cancelled bookings appear in passenger's ride history
- Frequent cancellations (>3 in a month) flag account for review

**Priority**: Medium | **Story Points**: 3

---

## Epic 4: Communication & Real-Time Features

### US-012: Chat with Driver/Passengers

**As a** confirmed passenger or driver  
**I want to** send messages to ride participants  
**So that** I can coordinate pickup details and communicate changes

**Acceptance Criteria:**

- Chat available only after booking is confirmed
- Real-time message delivery using WebSocket (< 1 second latency)
- Chat interface shows: participant name, profile photo, online status
- Messages display timestamp (12-hour format)
- Unread message count badge shown on chat icon
- Chat history saved for 30 days after ride completion
- Users can report inappropriate messages
- No media attachments (text only, max 500 chars per message)

**Priority**: High | **Story Points**: 8

---

### US-013: Receive Ride Notifications

**As a** platform user  
**I want to** receive timely notifications about my rides  
**So that** I don't miss important updates

**Acceptance Criteria:**

- **Driver notifications**: Join request received, passenger cancelled, ride starting soon (1 hour before)
- **Passenger notifications**: Booking confirmed/rejected, driver cancelled, ride starting soon
- Notifications delivered via: In-app banner + SMS (for critical updates)
- User can customize notification preferences in settings
- Notification history accessible in "Notifications" page
- Unread count badge on notification bell icon
- SMS notifications: max 3 per day to avoid spam (only critical updates)

**Priority**: High | **Story Points**: 5

---

## Epic 5: Payment & Cost Settlement

### US-014: View Ride Cost Breakdown

**As a** passenger viewing a ride  
**I want to** see transparent cost breakdown  
**So that** I understand what I'm paying for

**Acceptance Criteria:**

- Ride detail page shows: Cost per passenger (e.g., PKR 150)
- Comparison: "Estimated Uber/Careem cost: PKR 350 | You save: PKR 200 (57%)"
- Tooltip explains: "Driver sets cost to cover fuel. Platform takes no commission."
- Cost displayed in Pakistani Rupees (PKR) only
- If driver hasn't set cost, shows "Driver will confirm cost after booking"

**Priority**: Low | **Story Points**: 2

---

### US-015: Mark Payment as Completed (Cash)

**As a** driver after completing a ride  
**I want to** mark passenger payment as received  
**So that** the transaction is recorded in the system

**Acceptance Criteria:**

- After marking ride as "Completed", driver sees list of passengers
- Driver checks box next to each passenger who paid cash
- Passenger receives notification: "Please confirm you paid PKR XXX to [Driver Name]"
- Passenger confirms payment in their app
- Both confirmations required to close transaction
- Unresolved payments flagged for admin review after 48 hours
- Payment history visible in driver's earnings tracker

**Priority**: Medium | **Story Points**: 5

---

## Epic 6: Safety & Trust

### US-016: Rate a User After Ride

**As a** driver or passenger after completing a ride  
**I want to** rate and review the other party  
**So that** the community maintains quality and trust

**Acceptance Criteria:**

- Rating prompt appears after ride is marked "Completed"
- 5-star rating system with tap-to-select stars
- Optional written review (500 chars max)
- Pre-filled tags: "On time", "Friendly", "Clean vehicle", "Good conversation"
- Both driver and passenger must rate within 7 days
- Ratings are anonymous (usernames not shown in reviews)
- Average rating displayed on user profile (minimum 3 rides to show rating)
- Reviews appear on profile page (latest 10 visible)

**Priority**: High | **Story Points**: 5

---

### US-017: Share Ride Details with Emergency Contact

**As a** passenger about to take a ride  
**I want to** share my ride details with a friend/family member  
**So that** someone knows my whereabouts for safety

**Acceptance Criteria:**

- "Share Ride Details" button visible on confirmed booking page
- Generates SMS/WhatsApp message with: Driver name, car details, route, expected arrival time
- Message includes: "Track my ride: [link to public tracking page]"
- Tracking page shows: ride status (En route / Arrived / Completed), last updated timestamp
- No login required to view tracking page
- Tracking page automatically expires 4 hours after ride completion
- Privacy: Does not show real-time GPS location (only status updates)

**Priority**: Medium | **Story Points**: 5

---

### US-018: Report a User

**As a** user who experienced inappropriate behavior  
**I want to** report another user  
**So that** the platform can take action to maintain safety

**Acceptance Criteria:**

- "Report User" option available on any user profile
- Report categories: No-show, Harassment, Unsafe driving, Fake profile, Other
- User must provide description (50 chars minimum)
- Option to upload evidence (screenshots, max 3 images)
- Report submitted anonymously to admin panel
- Reporter receives confirmation: "Your report is being reviewed. Case ID: XXX"
- Admin reviews report within 48 hours
- Serious reports (harassment, safety) escalated immediately

**Priority**: High | **Story Points**: 5

---

## Epic 7: User Dashboard & Analytics

### US-019: View My Ride History

**As a** regular user  
**I want to** see all my past rides  
**So that** I can track my carpooling activity and expenses

**Acceptance Criteria:**

- Separate tabs: "As Driver" and "As Passenger"
- Each ride card shows: date, route, participants, cost, rating given/received
- Filters: Date range, completed/cancelled rides
- **Driver view**: Total earnings (fuel recovered), total rides offered, average rating
- **Passenger view**: Total money saved, total rides taken, average rating
- Export ride history as CSV
- Click on ride to view full details and chat history

**Priority**: Medium | **Story Points**: 5

---

### US-020: View My Dashboard Statistics

**As a** user  
**I want to** see my carpooling impact statistics  
**So that** I feel motivated to continue using the platform

**Acceptance Criteria:**

- Dashboard cards show:
  - Total rides (driver + passenger)
  - Money saved (if passenger) or earned (if driver)
  - Eco-impact: "You've saved XX kg of CO2 emissions"
  - Current rating (stars + number)
- Visual graphs: Rides per month (bar chart), Cost savings trend (line chart)
- Achievements section: "10 Rides Completed", "5-Star Driver", "Eco Warrior"
- Upcoming rides (next 3) with countdown timer
- Quick actions: "Post New Ride", "Find a Ride"

**Priority**: Low | **Story Points**: 5

---

## Epic 8: Admin Panel

### US-021: Review Reported Users

**As an** admin  
**I want to** review user reports and take action  
**So that** the platform remains safe and trustworthy

**Acceptance Criteria:**

- Admin dashboard shows: Pending reports (count badge), high-priority reports (red flag)
- Each report card shows: Reporter details, reported user, category, description, evidence images
- Admin actions: Dismiss report, Send warning email, Suspend account (7/30/90 days), Permanent ban
- Reason required for all actions (audit trail)
- Reported user notified of action taken (excluding reporter identity)
- Report status: Open → Under Review → Resolved
- Analytics: Total reports this month, most common categories

**Priority**: Medium | **Story Points**: 8

---

### US-022: Monitor Platform Activity

**As an** admin  
**I want to** view platform-wide analytics  
**So that** I can track growth and identify issues

**Acceptance Criteria:**

- **User Metrics**: Total users, new signups this week, active users (posted/booked in last 7 days)
- **Ride Metrics**: Total rides completed, rides this week, cancellation rate
- **University Breakdown**: Table showing user count and ride count per university
- **Popular Routes**: Top 10 most traveled routes
- **Financial Overview**: Total cost savings generated for students
- Date range filter: Last 7 days / 30 days / 3 months / All time
- Export all data as Excel/CSV
- Auto-refresh every 5 minutes

**Priority**: Low | **Story Points**: 8

---

**Total User Stories**: 22  
**Total Story Points**: 110 (estimated 6-8 weeks for solo developer)  
**High Priority**: 13 stories | **Medium Priority**: 7 stories | **Low Priority**: 2 stories
