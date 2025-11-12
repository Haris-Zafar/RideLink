# Requirements Document: RideLink - University Carpooling Platform (Pakistan)

## Executive Summary

### Project Overview

RideLink is a web and mobile carpooling platform designed for university students across Pakistan to share daily commutes between home and campus. The platform facilitates cost-effective, eco-friendly transportation by connecting students traveling similar routes and enabling transparent fuel cost splitting.

### Business Objective

Create a portfolio-grade MERN stack application demonstrating full-stack development capabilities, real-time features, geolocation services, and payment integration—targeting employment opportunities in modern software companies.

### Key Value Propositions

- **For Students**: Reduce daily commute costs by 50-70% through shared rides
- **For Environment**: Decrease carbon emissions through reduced vehicle usage
- **For Community**: Build trusted university-specific carpooling networks

---

## Target Users & Personas

### Primary Persona 1: "Ali - The Regular Commuter"

- **Demographics**: 20-year-old Computer Science student, lives 15km from campus
- **Behavior**: Drives to university 4 days/week, car usually has 3 empty seats
- **Goals**: Offset fuel costs (PKR 500-800/day), find reliable passengers
- **Pain Points**: Empty seats waste money, difficulty finding trustworthy riders
- **Tech Savviness**: High - comfortable with mobile apps and digital payments

### Primary Persona 2: "Ayesha - The Cost-Conscious Passenger"

- **Demographics**: 19-year-old Business student, lives 10km from campus
- **Behavior**: Currently uses Uber/Careem (PKR 300-400/day) or public transport
- **Goals**: Reduce transportation costs, find safe and reliable rides
- **Pain Points**: Expensive ride-hailing apps, safety concerns with unknown drivers
- **Tech Savviness**: Medium - uses social media and basic apps daily

### Secondary Persona 3: "Admin - University Transport Coordinator"

- **Demographics**: 35-year-old staff member managing student services
- **Goals**: Monitor platform usage, ensure student safety, resolve disputes
- **Needs**: Dashboard for oversight, ability to verify students, handle reports

---

## Core Features (MVP - Phase 1)

### 1. User Authentication & Profile Management

- **Student Verification**: Registration via university .edu.pk email addresses
- **Phone Verification**: SMS OTP verification using local Pakistani gateways
- **Profile Components**:
  - Full name, student ID, university, department
  - Profile photo upload
  - Phone number (verified)
  - Home neighborhood/area (text-based, no exact address)
  - Vehicle details (for drivers): make, model, color, license plate
- **Role Selection**: Users can register as Driver, Passenger, or Both

### 2. Ride Posting & Discovery

- **Create Ride (Driver)**:
  - Route: Origin neighborhood → Destination (university campus)
  - Date & time (specific or recurring schedule)
  - Available seats (1-4)
  - Cost per passenger (driver-specified or auto-calculated)
  - Additional notes (e.g., "Non-smokers only", "AC available")
- **Recurring Rides**:
  - Set weekly patterns (e.g., "Every Mon, Wed, Fri at 8:00 AM")
  - Automatically create ride instances for next 2 weeks
- **Search & Filter (Passenger)**:
  - Filter by: date, time range, origin area, destination, available seats
  - Sort by: earliest departure, lowest cost, highest driver rating
  - View ride details: driver profile, vehicle info, route, cost

### 3. Booking & Ride Management

- **Request to Join**:
  - Passenger sends join request with optional message
  - Driver receives notification to approve/reject
  - Confirmed passengers see pickup point and driver contact
- **Ride Status Management**:
  - Driver can: accept/reject requests, cancel ride (with notice), mark ride as completed
  - Passenger can: cancel booking (with cancellation policy), contact driver
- **Real-Time Updates**:
  - Push notifications for ride confirmations, cancellations, upcoming rides (1 hour before)
  - SMS notifications for critical updates (ride cancelled, driver arrived)

### 4. Payment & Cost Splitting

- **Payment Methods**:
  - In-app digital: JazzCash, EasyPaisa integration (Phase 1B - optional for MVP demo)
  - Cash: Mark as "cash payment" - settled in-person (default for MVP)
- **Cost Calculation**:
  - Driver sets cost per passenger (flat rate)
  - Display: Total cost, cost per person, savings vs Uber/Careem estimate
- **Transaction Flow (Cash Mode)**:
  - System tracks "pending payment" status
  - After ride completion, driver marks payment as received
  - Passenger confirms payment made

### 5. Safety & Trust Features

- **User Ratings & Reviews**:
  - 5-star rating system (separate for drivers and passengers)
  - Written reviews (optional, 500 char limit)
  - Display: Average rating, total rides completed
- **Identity Verification**:
  - Verified badge for: email verified + phone verified + profile photo uploaded
  - University affiliation displayed on profile
- **Reporting System**:
  - Report user for: inappropriate behavior, no-show, safety concern
  - Admin review queue for reported incidents
- **Emergency Features**:
  - Share ride details (driver name, car details, route) with emergency contact
  - In-app button to share live ride details via SMS

### 6. Real-Time Communication

- **In-App Chat**:
  - Direct messaging between driver and confirmed passengers
  - Real-time updates using WebSocket (Socket.io)
  - Message history saved for 30 days
- **Notifications**:
  - Ride request received (driver)
  - Booking confirmed/rejected (passenger)
  - Ride starting in 1 hour (all participants)
  - Driver arriving at pickup (passenger)

### 7. Map & Location Services

- **Route Display**:
  - Show approximate route on map using Google Maps API
  - Pickup/dropoff points marked as neighborhoods (not exact addresses)
- **Location Input**:
  - Dropdown selection of major areas/neighborhoods per city
  - Autocomplete for area names
  - No precise GPS coordinates required (privacy-first approach)

### 8. User Dashboard

- **Driver Dashboard**:
  - Active rides, pending requests, ride history
  - Earnings tracker (total fuel cost recovered)
  - Upcoming scheduled rides
- **Passenger Dashboard**:
  - Booked rides (upcoming), ride history
  - Total money saved (vs estimated ride-hailing costs)
  - Frequent routes saved for quick search

### 9. Admin Panel (Basic)

- **User Management**:
  - View all users, verify/suspend accounts
  - Search users by email, phone, university
- **Ride Monitoring**:
  - View all active/completed rides
  - Flag suspicious rides (e.g., unusually high cost)
- **Reports & Disputes**:
  - Review user reports
  - Take action: warning, temporary ban, permanent ban
- **Platform Analytics**:
  - Total users, total rides completed
  - University-wise breakdown
  - Most active routes

---

## Future Enhancements (Post-MVP)

### Phase 2: Advanced Features

1. **Live GPS Tracking**: Real-time driver location sharing during active rides
2. **Smart Matching Algorithm**: AI-based route optimization and passenger suggestions
3. **In-App Wallet**: Escrow payment system with automatic cost splitting
4. **Gamification**: Badges, leaderboards for eco-friendly commuters
5. **Carbon Footprint Tracker**: Calculate and display CO2 savings per user
6. **Social Features**: Friend connections, ride with friends preferences
7. **Multi-Stop Routes**: Support for multiple pickup/dropoff points along route
8. **Ride Scheduling Assistant**: Suggest optimal departure times based on traffic data

### Phase 3: Scale & Business

1. **University Partnerships**: Official integrations with university transport departments
2. **Corporate Sponsorships**: Subsidized rides sponsored by local businesses
3. **Insurance Integration**: Optional ride insurance coverage
4. **Driver Incentives**: Rewards program for consistent, highly-rated drivers
5. **API for Third Parties**: Allow university apps to integrate carpooling features

---

## Non-Functional Requirements

### 1. Performance

- **Page Load Time**: < 2 seconds on 4G connection
- **API Response Time**: < 500ms for 95% of requests
- **Real-Time Latency**: Chat messages delivered within 1 second
- **Concurrent Users**: Support 500+ simultaneous users in MVP phase

### 2. Security

- **Authentication**: JWT-based authentication with HTTP-only cookies
- **Data Encryption**: HTTPS for all communications, bcrypt for password hashing
- **Input Validation**: Server-side validation for all user inputs
- **Rate Limiting**: Prevent brute-force attacks on login, OTP endpoints
- **Privacy**: No exact addresses stored, only neighborhood-level location data
- **GDPR/PDPA Compliance**: Right to data deletion, privacy policy, terms of service

### 3. Scalability

- **Database**: MongoDB with indexing on frequently queried fields (user email, ride date/time)
- **Caching**: Redis for session management and frequently accessed data
- **File Storage**: Cloud storage (AWS S3/Cloudinary) for profile photos, vehicle images
- **Horizontal Scaling**: Stateless API design to support load balancing in future

### 4. Usability

- **Responsive Design**: Mobile-first approach, works on 320px to 1920px screens
- **Accessibility**: WCAG 2.1 Level AA compliance (color contrast, keyboard navigation)
- **Language**: English (MVP), Urdu support in Phase 2
- **Offline Support**: PWA capabilities for basic navigation when offline

### 5. Reliability

- **Uptime**: 99% availability target
- **Data Backup**: Daily automated backups of MongoDB database
- **Error Handling**: Graceful degradation, user-friendly error messages
- **Monitoring**: Error tracking (Sentry), uptime monitoring (UptimeRobot)

### 6. Browser & Device Support

- **Web Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile OS**: iOS 13+, Android 8+ (via PWA or React Native)
- **Screen Sizes**: Optimized for mobile (375px), tablet (768px), desktop (1280px+)

---

## Success Metrics (KPIs)

### User Acquisition (Month 1-3)

- **Target**: 200+ registered users across 3 universities
- **Measurement**: New user signups per week

### Engagement

- **Target**: 30% weekly active users (WAU)
- **Measurement**: Users who post/book a ride within 7 days

### Transaction Volume

- **Target**: 50+ completed rides per week by Month 2
- **Measurement**: Rides marked as "completed" in system

### User Satisfaction

- **Target**: Average driver rating > 4.2/5.0, passenger rating > 4.0/5.0
- **Measurement**: Post-ride rating submissions

### Cost Savings (Value Proposition)

- **Target**: Average passenger saves PKR 150+ per ride vs ride-hailing
- **Measurement**: System-calculated savings displayed in dashboard

### Platform Health

- **Target**: < 5% ride cancellation rate
- **Measurement**: Cancelled rides / total booked rides

---

## Technical Constraints & Assumptions

### Constraints

1. **Budget**: **ZERO cost** for MVP - all services have free tiers:
   - MongoDB Atlas (512MB free)
   - Vercel/Netlify hosting (free)
   - Twilio SMS (free $15.25 trial credit)
   - Google Maps API (free $200/month credit)
   - SendGrid email (100 emails/day free)
2. **Timeline**: MVP completion ASAP (estimated 4-6 weeks for solo developer)
3. **Team Size**: Solo developer (full-stack)
4. **API Costs**: Google Maps API limited to free tier ($200/month credit)
5. **SMS Gateway**: Use low-cost Pakistani SMS provider (PKR 0.10-0.15/SMS)

### Assumptions

1. **Target Universities**: Initially Lahore-based universities (LUMS, UET, FAST, NUST Islamabad)
2. **User Trust**: Students prefer carpooling with verified fellow students over strangers
3. **Payment Preference**: Most students will use cash initially; digital payment adoption will grow
4. **Mobile Usage**: 70%+ of users will access via mobile devices
5. **Ride Patterns**: Peak usage during semester (Sep-Dec, Feb-May), low during breaks
6. **Internet Connectivity**: Users have reliable 3G/4G access in urban Pakistan
7. **Vehicle Availability**: 20-30% of students have access to personal vehicles
8. **Regulatory**: No special licensing required for peer-to-peer student carpooling in Pakistan

### Dependencies

1. **Google Maps API**: For route display and area autocomplete
2. **SMS Gateway**: Pakistani provider (e.g., Twilio, local SMS services)
3. **Payment Gateways**: JazzCash/EasyPaisa APIs (Phase 1B optional)
4. **Cloud Hosting**: Vercel (frontend), Railway/Render (backend), MongoDB Atlas (database)
5. **Email Service**: SendGrid/Mailgun for transactional emails (email verification)

---

## Out of Scope (Explicitly NOT Included in MVP)

1. ❌ Live GPS tracking during rides (Phase 2)
2. ❌ In-app digital wallet and escrow payments (Phase 1B optional)
3. ❌ iOS/Android native apps (PWA sufficient for MVP)
4. ❌ Multi-language support (English only in MVP)
5. ❌ Integration with university ERP systems
6. ❌ Ride insurance or liability coverage
7. ❌ Background checks or advanced identity verification (beyond email/phone)
8. ❌ Algorithmic pricing based on demand/supply
9. ❌ Corporate/commercial ride offerings (students only)
10. ❌ Multi-city route support (within-city only)

---

## Risk Assessment

| Risk                                | Impact | Probability | Mitigation                                                                   |
| ----------------------------------- | ------ | ----------- | ---------------------------------------------------------------------------- |
| Low user adoption                   | High   | Medium      | Launch with ambassador program at 2-3 universities, create demo data         |
| Safety incidents between users      | High   | Low         | Implement robust reporting, verification badges, share ride details feature  |
| Payment disputes (cash model)       | Medium | Medium      | Clear terms of service, rating system deters fraud, admin dispute resolution |
| API cost overruns (Maps, SMS)       | Medium | Low         | Monitor usage, implement rate limiting, use free-tier alternatives initially |
| Competitor entry (InDriver, Careem) | Medium | Low         | Focus on student-only trust network, university partnerships                 |
| Technical scalability issues        | Low    | Low         | Stateless architecture, MongoDB Atlas auto-scaling                           |

---

## Appendix: Technical Stack (Recommended)

### Frontend

- **Web**: React.js, TailwindCSS, Redux Toolkit/Context API
- **Mobile**: PWA (Progressive Web App) with React
- **Real-Time**: Socket.io-client
- **Maps**: Google Maps JavaScript API / Mapbox GL JS
- **Forms**: React Hook Form, Yup validation

### Backend

- **Server**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT, bcrypt
- **Real-Time**: Socket.io
- **File Upload**: Multer + Cloudinary/AWS S3
- **Email**: Nodemailer + SendGrid
- **SMS**: Twilio or local Pakistani SMS gateway

### DevOps & Infrastructure

- **Hosting**: Vercel (frontend), Railway/Render (backend)
- **Database**: MongoDB Atlas (free tier)
- **Version Control**: Git, GitHub
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry (error tracking), UptimeRobot

### Third-Party Services

- **Maps**: Google Maps Platform (free tier)
- **SMS**: Twilio or Pakistani provider (e.g., Veevotech)
- **Payments**: JazzCash API, EasyPaisa API (Phase 1B)
- **Analytics**: Google Analytics, Mixpanel (free tier)

---

**Document Version**: 1.0  
**Last Updated**: November 13, 2025  
**Next Review**: Upon Technical Architect feedback
