# API Specification: RideLink

## Document Information

- **Project**: RideLink - University Carpooling Platform
- **Version**: 1.0
- **Author**: Technical Architect Agent
- **Date**: November 13, 2025
- **Status**: Final - Ready for Implementation

---

## API Overview

**Base URL**: `https://api.ridelink.com/api/v1`  
**Protocol**: HTTPS only  
**Authentication**: JWT Bearer Token  
**Content-Type**: `application/json`  
**Rate Limiting**: 100 requests per 15 minutes per IP

---

## Authentication Flow

### Headers

All authenticated endpoints require:

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Error Responses

All endpoints may return these error codes:

| Status Code | Meaning               | Example Response                          |
| ----------- | --------------------- | ----------------------------------------- |
| 400         | Bad Request           | `{ "error": "Invalid email format" }`     |
| 401         | Unauthorized          | `{ "error": "Invalid or expired token" }` |
| 403         | Forbidden             | `{ "error": "Insufficient permissions" }` |
| 404         | Not Found             | `{ "error": "Resource not found" }`       |
| 429         | Too Many Requests     | `{ "error": "Rate limit exceeded" }`      |
| 500         | Internal Server Error | `{ "error": "Server error" }`             |

---

## 1. Authentication Endpoints

### 1.1 Register User

**Endpoint**: `POST /auth/register`  
**Authentication**: None  
**Description**: Register a new user with university email

**Request Body**:

```json
{
  "email": "ali.ahmed@lums.edu.pk",
  "password": "SecurePass123",
  "name": "Ali Ahmed",
  "phone": "+923001234567",
  "university": "LUMS",
  "studentId": "25100123",
  "homeNeighborhood": "DHA Phase 5",
  "city": "Lahore",
  "role": "both"
}
```

**Validation Rules**:

- Email must be valid `.edu.pk` domain
- Password minimum 8 characters (1 uppercase, 1 lowercase, 1 number)
- Phone must be Pakistani format: `+92XXXXXXXXXX`
- Role: `passenger`, `driver`, or `both`

**Success Response** (201 Created):

```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "userId": "6554a1b2c3d4e5f6g7h8i9j0",
    "email": "ali.ahmed@lums.edu.pk",
    "emailVerified": false,
    "phoneVerified": false
  }
}
```

---

## 5. Review Endpoints

### 5.1 Submit Review

**Endpoint**: `POST /reviews`  
**Authentication**: Required  
**Description**: Rate and review a user after completing a ride

**Request Body**:

```json
{
  "rideId": "6554a1b2c3d4e5f6g7h8i9j1",
  "reviewedUserId": "6554a1b2c3d4e5f6g7h8i9j0",
  "reviewType": "driver",
  "rating": 5,
  "comment": "Great ride! Ali was on time and the car was clean.",
  "tags": ["on-time", "friendly", "clean-vehicle"]
}
```

**Validation Rules**:

- Can only review after ride is completed
- Cannot review yourself
- One review per ride per user
- Rating: 1-5 stars

**Success Response** (201 Created):

```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "id": "6554a1b2c3d4e5f6g7h8i9j5",
    "ride": "6554a1b2c3d4e5f6g7h8i9j1",
    "reviewedUser": "6554a1b2c3d4e5f6g7h8i9j0",
    "rating": 5,
    "comment": "Great ride! Ali was on time and the car was clean.",
    "tags": ["on-time", "friendly", "clean-vehicle"],
    "createdAt": "2025-11-15T10:00:00Z"
  }
}
```

**Error Responses**:

- `400`: Ride not completed yet
- `400`: Already reviewed this user for this ride

---

### 5.2 Get User Reviews

**Endpoint**: `GET /reviews/user/:userId`  
**Authentication**: Optional  
**Description**: Get all reviews for a specific user

**URL Parameters**:

- `userId`: User ID (string)

**Query Parameters**:

- `type` (string, optional): `driver` | `passenger`
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Results per page (default: 10)

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "6554a1b2c3d4e5f6g7h8i9j5",
        "reviewer": {
          "name": "Sara Khan",
          "profilePhoto": "https://cloudinary.com/..."
        },
        "reviewType": "driver",
        "rating": 5,
        "comment": "Great ride! Ali was on time and the car was clean.",
        "tags": ["on-time", "friendly", "clean-vehicle"],
        "createdAt": "2025-11-15T10:00:00Z"
      }
    ],
    "summary": {
      "averageRating": 4.7,
      "totalReviews": 23,
      "ratingDistribution": {
        "5": 15,
        "4": 6,
        "3": 2,
        "2": 0,
        "1": 0
      }
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalResults": 23
    }
  }
}
```

---

## 6. Message/Chat Endpoints

### 6.1 Get Ride Chat History

**Endpoint**: `GET /messages/ride/:rideId`  
**Authentication**: Required (ride participants only)  
**Description**: Get chat messages for a specific ride

**URL Parameters**:

- `rideId`: Ride ID (string)

**Query Parameters**:

- `before` (date, optional): Get messages before this timestamp
- `limit` (number, optional): Number of messages (default: 50)

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "6554a1b2c3d4e5f6g7h8i9j4",
        "sender": {
          "id": "6554a1b2c3d4e5f6g7h8i9j2",
          "name": "Sara Khan",
          "profilePhoto": "https://cloudinary.com/..."
        },
        "text": "Hi! What time will you be at the pickup point?",
        "read": true,
        "sentAt": "2025-11-13T09:00:00Z"
      },
      {
        "id": "6554a1b2c3d4e5f6g7h8i9j6",
        "sender": {
          "id": "6554a1b2c3d4e5f6g7h8i9j0",
          "name": "Ali Ahmed",
          "profilePhoto": "https://cloudinary.com/..."
        },
        "text": "I'll be there at 8:25 AM sharp!",
        "read": true,
        "sentAt": "2025-11-13T09:02:00Z"
      }
    ],
    "hasMore": false
  }
}
```

---

### 6.2 Send Message (via WebSocket)

**Protocol**: WebSocket  
**Event**: `send-message`  
**Authentication**: JWT token in handshake  
**Description**: Send real-time chat message

**Socket Event Payload**:

```json
{
  "rideId": "6554a1b2c3d4e5f6g7h8i9j1",
  "receiverId": "6554a1b2c3d4e5f6g7h8i9j0",
  "text": "Hi! What time will you be at the pickup point?"
}
```

**Socket Response Event**: `new-message`

```json
{
  "messageId": "6554a1b2c3d4e5f6g7h8i9j4",
  "senderId": "6554a1b2c3d4e5f6g7h8i9j2",
  "senderName": "Sara Khan",
  "text": "Hi! What time will you be at the pickup point?",
  "sentAt": "2025-11-13T09:00:00Z"
}
```

---

### 6.3 Mark Messages as Read

**Endpoint**: `POST /messages/read`  
**Authentication**: Required  
**Description**: Mark messages as read

**Request Body**:

```json
{
  "messageIds": ["6554a1b2c3d4e5f6g7h8i9j4", "6554a1b2c3d4e5f6g7h8i9j6"]
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Messages marked as read",
  "data": {
    "markedCount": 2
  }
}
```

---

## 7. Notification Endpoints

### 7.1 Get My Notifications

**Endpoint**: `GET /notifications`  
**Authentication**: Required  
**Description**: Get all notifications for logged-in user

**Query Parameters**:

- `unreadOnly` (boolean, optional): Only unread notifications (default: false)
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Results per page (default: 20)

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "6554a1b2c3d4e5f6g7h8i9j7",
        "type": "booking-confirmed",
        "title": "Booking Confirmed",
        "message": "Ali Ahmed confirmed your booking for Nov 15 at 8:30 AM",
        "relatedRide": "6554a1b2c3d4e5f6g7h8i9j1",
        "relatedUser": "6554a1b2c3d4e5f6g7h8i9j0",
        "read": false,
        "createdAt": "2025-11-13T09:00:00Z"
      }
    ],
    "unreadCount": 3,
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalResults": 25
    }
  }
}
```

---

### 7.2 Mark Notification as Read

**Endpoint**: `POST /notifications/:notificationId/read`  
**Authentication**: Required  
**Description**: Mark a notification as read

**URL Parameters**:

- `notificationId`: Notification ID (string)

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id": "6554a1b2c3d4e5f6g7h8i9j7",
    "read": true,
    "readAt": "2025-11-13T09:30:00Z"
  }
}
```

---

### 7.3 Mark All as Read

**Endpoint**: `POST /notifications/read-all`  
**Authentication**: Required  
**Description**: Mark all notifications as read

**Request Body**:

```json
{}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "markedCount": 15
  }
}
```

---

## 8. Recurring Rides Endpoints

### 8.1 Create Recurring Schedule

**Endpoint**: `POST /recurring-schedules`  
**Authentication**: Required (verified drivers only)  
**Description**: Create a recurring ride schedule

**Request Body**:

```json
{
  "origin": "DHA Phase 5",
  "destination": "LUMS University",
  "daysOfWeek": ["Monday", "Wednesday", "Friday"],
  "time": "08:30",
  "totalSeats": 3,
  "costPerPassenger": 150,
  "notes": "Regular morning commute",
  "preferences": {
    "nonSmoking": true,
    "acAvailable": true
  },
  "startDate": "2025-11-18",
  "endDate": "2025-12-31"
}
```

**Success Response** (201 Created):

```json
{
  "success": true,
  "message": "Recurring schedule created. Rides will be generated automatically.",
  "data": {
    "id": "6554a1b2c3d4e5f6g7h8i9j8",
    "origin": "DHA Phase 5",
    "destination": "LUMS University",
    "daysOfWeek": ["Monday", "Wednesday", "Friday"],
    "time": "08:30",
    "active": true,
    "generatedRidesCount": 6,
    "nextRideDate": "2025-11-18T08:30:00Z"
  }
}
```

---

### 8.2 Get My Recurring Schedules

**Endpoint**: `GET /recurring-schedules/my-schedules`  
**Authentication**: Required  
**Description**: Get all recurring schedules for logged-in driver

**Query Parameters**:

- `activeOnly` (boolean, optional): Only active schedules (default: false)

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "schedules": [
      {
        "id": "6554a1b2c3d4e5f6g7h8i9j8",
        "origin": "DHA Phase 5",
        "destination": "LUMS University",
        "daysOfWeek": ["Monday", "Wednesday", "Friday"],
        "time": "08:30",
        "totalSeats": 3,
        "costPerPassenger": 150,
        "active": true,
        "generatedRidesCount": 6,
        "nextRideDate": "2025-11-18T08:30:00Z",
        "createdAt": "2025-11-13T10:00:00Z"
      }
    ],
    "total": 2
  }
}
```

---

### 8.3 Update Recurring Schedule

**Endpoint**: `PATCH /recurring-schedules/:scheduleId`  
**Authentication**: Required (driver only)  
**Description**: Update recurring schedule

**URL Parameters**:

- `scheduleId`: Schedule ID (string)

**Request Body**:

```json
{
  "costPerPassenger": 175,
  "endDate": "2026-01-31"
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Recurring schedule updated",
  "data": {
    "id": "6554a1b2c3d4e5f6g7h8i9j8",
    "costPerPassenger": 175,
    "endDate": "2026-01-31T00:00:00Z"
  }
}
```

---

### 8.4 Pause/Resume Recurring Schedule

**Endpoint**: `POST /recurring-schedules/:scheduleId/toggle`  
**Authentication**: Required (driver only)  
**Description**: Pause or resume a recurring schedule

**URL Parameters**:

- `scheduleId`: Schedule ID (string)

**Request Body**:

```json
{
  "active": false
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Recurring schedule paused",
  "data": {
    "id": "6554a1b2c3d4e5f6g7h8i9j8",
    "active": false
  }
}
```

---

### 8.5 Delete Recurring Schedule

**Endpoint**: `DELETE /recurring-schedules/:scheduleId`  
**Authentication**: Required (driver only)  
**Description**: Delete a recurring schedule (future rides will not be generated)

**URL Parameters**:

- `scheduleId`: Schedule ID (string)

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Recurring schedule deleted. Existing rides not affected."
}
```

---

## 9. Report Endpoints

### 9.1 Submit Report

**Endpoint**: `POST /reports`  
**Authentication**: Required  
**Description**: Report a user for inappropriate behavior

**Request Body**:

```json
{
  "reportedUserId": "6554a1b2c3d4e5f6g7h8i9j0",
  "relatedRideId": "6554a1b2c3d4e5f6g7h8i9j1",
  "category": "no-show",
  "description": "Driver did not show up at pickup point and did not respond to messages.",
  "evidence": ["https://cloudinary.com/screenshot1.jpg"]
}
```

**Validation Rules**:

- Description minimum 50 characters
- Categories: `no-show`, `harassment`, `unsafe-driving`, `fake-profile`, `other`

**Success Response** (201 Created):

```json
{
  "success": true,
  "message": "Report submitted. Our team will review it within 48 hours.",
  "data": {
    "id": "6554a1b2c3d4e5f6g7h8i9j9",
    "caseId": "REPORT-2025-001234",
    "status": "open",
    "createdAt": "2025-11-13T10:00:00Z"
  }
}
```

---

## 10. Admin Endpoints

### 10.1 Get All Users (Admin)

**Endpoint**: `GET /admin/users`  
**Authentication**: Required (admin only)  
**Description**: Get list of all users

**Query Parameters**:

- `search` (string, optional): Search by name, email, or phone
- `university` (string, optional): Filter by university
- `status` (string, optional): Filter by status
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Results per page (default: 50)

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "6554a1b2c3d4e5f6g7h8i9j0",
        "name": "Ali Ahmed",
        "email": "ali.ahmed@lums.edu.pk",
        "phone": "+923001234567",
        "university": "LUMS",
        "role": "both",
        "status": "active",
        "emailVerified": true,
        "phoneVerified": true,
        "ridesOffered": 23,
        "ridesTaken": 15,
        "createdAt": "2025-09-01T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 200,
      "totalResults": 10000
    }
  }
}
```

---

### 10.2 Suspend User (Admin)

**Endpoint**: `POST /admin/users/:userId/suspend`  
**Authentication**: Required (admin only)  
**Description**: Suspend a user account

**URL Parameters**:

- `userId`: User ID (string)

**Request Body**:

```json
{
  "duration": 7,
  "reason": "Multiple reports of no-shows"
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "User suspended for 7 days",
  "data": {
    "userId": "6554a1b2c3d4e5f6g7h8i9j0",
    "status": "suspended",
    "suspendedUntil": "2025-11-20T10:00:00Z"
  }
}
```

---

### 10.3 Get All Reports (Admin)

**Endpoint**: `GET /admin/reports`  
**Authentication**: Required (admin only)  
**Description**: Get all user reports

**Query Parameters**:

- `status` (string, optional): Filter by status
- `priority` (string, optional): Filter by priority
- `page` (number, optional): Page number (default: 1)

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "6554a1b2c3d4e5f6g7h8i9j9",
        "caseId": "REPORT-2025-001234",
        "reporter": {
          "id": "6554a1b2c3d4e5f6g7h8i9j2",
          "name": "Sara Khan",
          "email": "sara@lums.edu.pk"
        },
        "reportedUser": {
          "id": "6554a1b2c3d4e5f6g7h8i9j0",
          "name": "Ali Ahmed",
          "email": "ali@lums.edu.pk"
        },
        "category": "no-show",
        "description": "Driver did not show up...",
        "status": "open",
        "priority": "medium",
        "createdAt": "2025-11-13T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalResults": 98
    }
  }
}
```

---

### 10.4 Resolve Report (Admin)

**Endpoint**: `POST /admin/reports/:reportId/resolve`  
**Authentication**: Required (admin only)  
**Description**: Resolve a user report

**URL Parameters**:

- `reportId`: Report ID (string)

**Request Body**:

```json
{
  "actionTaken": "warning",
  "adminNotes": "Issued warning to user. Monitoring for further incidents."
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Report resolved",
  "data": {
    "id": "6554a1b2c3d4e5f6g7h8i9j9",
    "status": "resolved",
    "actionTaken": "warning",
    "reviewedAt": "2025-11-13T11:00:00Z"
  }
}
```

---

### 10.5 Get Platform Analytics (Admin)

**Endpoint**: `GET /admin/analytics`  
**Authentication**: Required (admin only)  
**Description**: Get platform-wide analytics

**Query Parameters**:

- `period` (string, optional): `7days` | `30days` | `3months` | `all` (default: `30days`)

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "users": {
      "total": 10000,
      "newThisPeriod": 450,
      "activeUsers": 3500,
      "byUniversity": {
        "LUMS": 2500,
        "NUST": 2000,
        "FAST": 1800,
        "UET": 1500,
        "Other": 2200
      }
    },
    "rides": {
      "total": 50000,
      "scheduled": 500,
      "completed": 45000,
      "cancelled": 4500,
      "completionRate": 90.9,
      "avgCostPerPassenger": 165
    },
    "bookings": {
      "total": 100000,
      "confirmed": 85000,
      "pending": 2000,
      "rejected": 5000,
      "cancelled": 8000,
      "confirmationRate": 85
    },
    "financials": {
      "totalFuelCostRecovered": 7500000,
      "totalSavingsGenerated": 3000000,
      "avgSavingsPerRide": 200
    }
  }
}
```

---

## 11. Utility Endpoints

### 11.1 Get Neighborhoods

**Endpoint**: `GET /utils/neighborhoods`  
**Authentication**: None  
**Description**: Get list of neighborhoods for a city

**Query Parameters**:

- `city` (string, required): City name

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "city": "Lahore",
    "neighborhoods": [
      "DHA Phase 1",
      "DHA Phase 2",
      "DHA Phase 3",
      "DHA Phase 4",
      "DHA Phase 5",
      "DHA Phase 6",
      "Gulberg",
      "Johar Town",
      "Model Town",
      "Bahria Town"
    ]
  }
}
```

---

### 11.2 Get Universities

**Endpoint**: `GET /utils/universities`  
**Authentication**: None  
**Description**: Get list of supported universities

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "universities": [
      {
        "code": "LUMS",
        "name": "Lahore University of Management Sciences",
        "city": "Lahore"
      },
      {
        "code": "NUST",
        "name": "National University of Sciences and Technology",
        "city": "Islamabad"
      },
      {
        "code": "FAST",
        "name": "FAST National University",
        "city": "Lahore"
      }
    ]
  }
}
```

---

### 11.3 Get Route Details

**Endpoint**: `GET /utils/route`  
**Authentication**: Optional  
**Description**: Get route details from Google Maps API (proxied)

**Query Parameters**:

- `origin` (string, required): Origin neighborhood
- `destination` (string, required): Destination

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "origin": "DHA Phase 5, Lahore",
    "destination": "LUMS University, Lahore",
    "distance": 12.5,
    "duration": 25,
    "polyline": "encodedPolylineString...",
    "estimatedCost": {
      "uber": 350,
      "careem": 380
    }
  }
}
```

---

## 12. WebSocket Events

### Connection

**URL**: `wss://api.ridelink.com`  
**Authentication**: JWT token in handshake query parameter

```javascript
const socket = io('wss://api.ridelink.com', {
  auth: { token: jwtToken },
});
```

---

### Events (Client → Server)

| Event Name        | Payload                        | Description          |
| ----------------- | ------------------------------ | -------------------- |
| `send-message`    | `{ rideId, receiverId, text }` | Send chat message    |
| `join-ride-room`  | `{ rideId }`                   | Join ride chat room  |
| `leave-ride-room` | `{ rideId }`                   | Leave ride chat room |
| `typing`          | `{ rideId, isTyping }`         | Typing indicator     |

---

### Events (Server → Client)

| Event Name           | Payload                                   | Description                |
| -------------------- | ----------------------------------------- | -------------------------- |
| `new-message`        | `{ messageId, senderId, text, sentAt }`   | New chat message           |
| `booking-confirmed`  | `{ bookingId, rideId, driverId }`         | Booking confirmed          |
| `booking-rejected`   | `{ bookingId, rideId }`                   | Booking rejected           |
| `booking-cancelled`  | `{ bookingId, rideId, cancelledBy }`      | Booking cancelled          |
| `ride-cancelled`     | `{ rideId, cancelReason }`                | Ride cancelled             |
| `ride-starting-soon` | `{ rideId, minutesRemaining }`            | Ride reminder (1hr before) |
| `user-typing`        | `{ rideId, userId, isTyping }`            | Someone is typing          |
| `notification`       | `{ id, type, title, message, createdAt }` | New notification           |

---

## Rate Limiting

### Global Rate Limits

| Endpoint Type      | Limit        | Window |
| ------------------ | ------------ | ------ |
| **All Endpoints**  | 100 requests | 15 min |
| **Auth Endpoints** | 5 requests   | 15 min |
| **OTP Send**       | 3 requests   | 1 hour |
| **File Upload**    | 10 uploads   | 1 hour |
| **Search**         | 30 requests  | 1 min  |

### Rate Limit Headers

Response headers include:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699876543
```

---

## Pagination

All list endpoints support pagination:

**Query Parameters**:

- `page` (number): Page number (default: 1)
- `limit` (number): Results per page (default: 20, max: 100)

**Response Format**:

```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalResults": 98,
    "hasMore": true,
    "limit": 20
  }
}
```

---

## Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": {
      "field": "email",
      "reason": "Invalid format"
    }
  }
}
```

### Common Error Codes

| Code                  | HTTP Status | Description              |
| --------------------- | ----------- | ------------------------ |
| `INVALID_INPUT`       | 400         | Validation failed        |
| `UNAUTHORIZED`        | 401         | Authentication required  |
| `FORBIDDEN`           | 403         | Insufficient permissions |
| `NOT_FOUND`           | 404         | Resource not found       |
| `DUPLICATE_ENTRY`     | 409         | Resource already exists  |
| `RATE_LIMIT_EXCEEDED` | 429         | Too many requests        |
| `INTERNAL_ERROR`      | 500         | Server error             |

---

## API Versioning

Current version: **v1**

**URL Structure**: `/api/v1/...`

Future versions will be accessible via:

- `/api/v2/...` (when v2 is released)

**Deprecation Policy**:

- Old versions supported for 6 months after new version release
- Deprecated endpoints return `Deprecation` header

---

## Security Headers

All responses include:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

---

## CORS Policy

**Allowed Origins** (Production):

- `https://ridelink.com`
- `https://www.ridelink.com`

**Allowed Methods**:

- GET, POST, PUT, PATCH, DELETE, OPTIONS

**Allowed Headers**:

- Authorization, Content-Type

---

## Testing

### Postman Collection

A complete Postman collection is available:

- **File**: `ridelink-api.postman_collection.json`
- **Environment**: `ridelink-dev.postman_environment.json`

### API Testing Endpoints

**Health Check**:

```
GET /health
Response: { "status": "ok", "version": "1.0.0" }
```

---

## Conclusion

This API specification defines:

- ✅ **46 REST Endpoints** across 11 functional areas
- ✅ **8 WebSocket Events** for real-time features
- ✅ **Complete Request/Response Examples** for all endpoints
- ✅ **Authentication & Authorization** requirements
- ✅ **Error Handling** standardization
- ✅ **Rate Limiting** policies
- ✅ **Pagination** support

**Approval Status**: ✅ **READY FOR DEVELOPMENT**

---

**Document Version**: 1.0  
**Last Updated**: November 13, 2025  
**Author**: Technical Architect Agent  
**Next Document**: system-architecture.mmd (Mermaid Diagram)

**Error Responses**:

- `400`: Email already registered, invalid email format
- `400`: Weak password, invalid phone number

---

### 1.2 Login

**Endpoint**: `POST /auth/login`  
**Authentication**: None  
**Description**: Login with email and password

**Request Body**:

```json
{
  "email": "ali.ahmed@lums.edu.pk",
  "password": "SecurePass123"
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "6554a1b2c3d4e5f6g7h8i9j0",
      "name": "Ali Ahmed",
      "email": "ali.ahmed@lums.edu.pk",
      "role": "both",
      "profilePhoto": "https://cloudinary.com/...",
      "emailVerified": true,
      "phoneVerified": true,
      "university": "LUMS"
    }
  }
}
```

**Error Responses**:

- `401`: Invalid credentials
- `403`: Account suspended or banned

---

### 1.3 Send Email Verification

**Endpoint**: `POST /auth/verify-email/send`  
**Authentication**: Required  
**Description**: Send email verification link

**Request Body**:

```json
{}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Verification email sent to ali.ahmed@lums.edu.pk"
}
```

**Error Responses**:

- `400`: Email already verified
- `429`: Too many requests (max 3 per hour)

---

### 1.4 Verify Email

**Endpoint**: `GET /auth/verify-email/:token`  
**Authentication**: None  
**Description**: Verify email using token from email link

**URL Parameters**:

- `token`: Email verification token (string)

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "emailVerified": true
  }
}
```

**Error Responses**:

- `400`: Invalid or expired token

---

### 1.5 Send Phone OTP

**Endpoint**: `POST /auth/verify-phone/send`  
**Authentication**: Required  
**Description**: Send SMS OTP to user's phone

**Request Body**:

```json
{
  "phone": "+923001234567"
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "OTP sent to +923001234567",
  "data": {
    "expiresIn": 600
  }
}
```

**Error Responses**:

- `400`: Phone already verified
- `429`: Too many requests (max 3 per hour)

---

### 1.6 Verify Phone OTP

**Endpoint**: `POST /auth/verify-phone/verify`  
**Authentication**: Required  
**Description**: Verify phone with OTP code

**Request Body**:

```json
{
  "phone": "+923001234567",
  "otp": "123456"
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Phone verified successfully",
  "data": {
    "phoneVerified": true
  }
}
```

**Error Responses**:

- `400`: Invalid or expired OTP
- `429`: Too many attempts (max 3 per hour)

---

### 1.7 Forgot Password

**Endpoint**: `POST /auth/forgot-password`  
**Authentication**: None  
**Description**: Request password reset link

**Request Body**:

```json
{
  "email": "ali.ahmed@lums.edu.pk"
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

---

### 1.8 Reset Password

**Endpoint**: `POST /auth/reset-password/:token`  
**Authentication**: None  
**Description**: Reset password using token from email

**URL Parameters**:

- `token`: Password reset token

**Request Body**:

```json
{
  "password": "NewSecurePass123"
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Password reset successful. Please login with new password."
}
```

---

## 2. User Profile Endpoints

### 2.1 Get Current User Profile

**Endpoint**: `GET /users/me`  
**Authentication**: Required  
**Description**: Get logged-in user's profile

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "6554a1b2c3d4e5f6g7h8i9j0",
    "name": "Ali Ahmed",
    "email": "ali.ahmed@lums.edu.pk",
    "phone": "+923001234567",
    "profilePhoto": "https://cloudinary.com/...",
    "bio": "CS major, prefer quiet rides",
    "university": "LUMS",
    "studentId": "25100123",
    "department": "Computer Science",
    "homeNeighborhood": "DHA Phase 5",
    "city": "Lahore",
    "role": "both",
    "vehicle": {
      "make": "Honda",
      "model": "Civic",
      "color": "Silver",
      "licensePlate": "LEA-1234",
      "year": 2020
    },
    "emailVerified": true,
    "phoneVerified": true,
    "driverRating": {
      "average": 4.7,
      "count": 23
    },
    "passengerRating": {
      "average": 4.9,
      "count": 15
    },
    "ridesOffered": 23,
    "ridesTaken": 15,
    "totalEarnings": 11500,
    "totalSavings": 4500,
    "status": "active",
    "createdAt": "2025-09-01T10:00:00Z"
  }
}
```

---

### 2.2 Update Profile

**Endpoint**: `PATCH /users/me`  
**Authentication**: Required  
**Description**: Update user profile

**Request Body** (partial update):

```json
{
  "name": "Ali Ahmed Khan",
  "bio": "Computer Science student, love carpooling!",
  "homeNeighborhood": "DHA Phase 6"
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "6554a1b2c3d4e5f6g7h8i9j0",
    "name": "Ali Ahmed Khan",
    "bio": "Computer Science student, love carpooling!",
    "homeNeighborhood": "DHA Phase 6"
  }
}
```

---

### 2.3 Upload Profile Photo

**Endpoint**: `POST /users/me/photo`  
**Authentication**: Required  
**Content-Type**: `multipart/form-data`  
**Description**: Upload profile photo

**Request Body**:

```
photo: [File] (max 5MB, JPG/PNG)
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Photo uploaded successfully",
  "data": {
    "profilePhoto": "https://res.cloudinary.com/ridelink/profiles/ali-12345.jpg"
  }
}
```

**Error Responses**:

- `400`: File too large (max 5MB)
- `400`: Invalid file type (only JPG/PNG)

---

### 2.4 Add/Update Vehicle

**Endpoint**: `PUT /users/me/vehicle`  
**Authentication**: Required  
**Description**: Add or update vehicle details (drivers only)

**Request Body**:

```json
{
  "make": "Honda",
  "model": "Civic",
  "color": "Silver",
  "licensePlate": "LEA-1234",
  "year": 2020
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Vehicle details updated",
  "data": {
    "vehicle": {
      "make": "Honda",
      "model": "Civic",
      "color": "Silver",
      "licensePlate": "LEA-1234",
      "year": 2020
    }
  }
}
```

---

### 2.5 Get User by ID

**Endpoint**: `GET /users/:userId`  
**Authentication**: Required  
**Description**: Get public profile of any user

**URL Parameters**:

- `userId`: User ID (string)

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "6554a1b2c3d4e5f6g7h8i9j0",
    "name": "Ali Ahmed",
    "profilePhoto": "https://cloudinary.com/...",
    "university": "LUMS",
    "role": "both",
    "vehicle": {
      "make": "Honda",
      "model": "Civic",
      "color": "Silver"
    },
    "driverRating": {
      "average": 4.7,
      "count": 23
    },
    "passengerRating": {
      "average": 4.9,
      "count": 15
    },
    "ridesOffered": 23,
    "ridesTaken": 15,
    "memberSince": "2025-09-01T10:00:00Z"
  }
}
```

**Note**: Email, phone, and exact address not included in public profile.

---

## 3. Ride Endpoints

### 3.1 Create Ride

**Endpoint**: `POST /rides`  
**Authentication**: Required (verified users only)  
**Description**: Post a new ride

**Request Body**:

```json
{
  "origin": "DHA Phase 5",
  "destination": "LUMS University",
  "date": "2025-11-15",
  "time": "08:30",
  "totalSeats": 3,
  "costPerPassenger": 150,
  "notes": "Will wait max 5 minutes at pickup",
  "preferences": {
    "nonSmoking": true,
    "acAvailable": true,
    "musicAllowed": true,
    "petsAllowed": false
  }
}
```

**Validation Rules**:

- Date must be in future
- Time in 24-hour format (HH:MM)
- totalSeats: 1-7
- costPerPassenger: 0-5000 PKR

**Success Response** (201 Created):

```json
{
  "success": true,
  "message": "Ride posted successfully",
  "data": {
    "id": "6554a1b2c3d4e5f6g7h8i9j1",
    "driver": {
      "id": "6554a1b2c3d4e5f6g7h8i9j0",
      "name": "Ali Ahmed",
      "profilePhoto": "https://cloudinary.com/...",
      "rating": 4.7
    },
    "origin": "DHA Phase 5",
    "destination": "LUMS University",
    "date": "2025-11-15T00:00:00Z",
    "time": "08:30",
    "departureDateTime": "2025-11-15T08:30:00Z",
    "availableSeats": 3,
    "totalSeats": 3,
    "costPerPassenger": 150,
    "status": "scheduled",
    "createdAt": "2025-11-13T08:00:00Z"
  }
}
```

---

### 3.2 Search Rides

**Endpoint**: `GET /rides/search`  
**Authentication**: Optional (public search)  
**Description**: Search for available rides

**Query Parameters**:

- `origin` (string, required): Origin neighborhood
- `destination` (string, optional): Destination (default: campus)
- `date` (date, required): Ride date (YYYY-MM-DD)
- `minSeats` (number, optional): Minimum available seats
- `maxCost` (number, optional): Maximum cost per passenger
- `sortBy` (string, optional): `time` | `cost` | `rating` (default: `time`)
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Results per page (default: 20, max: 50)

**Example Request**:

```
GET /rides/search?origin=DHA Phase 5&date=2025-11-15&maxCost=200&sortBy=time&page=1
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "rides": [
      {
        "id": "6554a1b2c3d4e5f6g7h8i9j1",
        "driver": {
          "id": "6554a1b2c3d4e5f6g7h8i9j0",
          "name": "Ali Ahmed",
          "profilePhoto": "https://cloudinary.com/...",
          "rating": 4.7,
          "ridesCompleted": 23
        },
        "vehicle": {
          "make": "Honda",
          "model": "Civic",
          "color": "Silver"
        },
        "origin": "DHA Phase 5",
        "destination": "LUMS University",
        "date": "2025-11-15T00:00:00Z",
        "time": "08:30",
        "availableSeats": 2,
        "totalSeats": 3,
        "costPerPassenger": 150,
        "preferences": {
          "nonSmoking": true,
          "acAvailable": true
        },
        "isRecurring": false
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalResults": 45,
      "hasMore": true
    }
  }
}
```

---

### 3.3 Get Ride Details

**Endpoint**: `GET /rides/:rideId`  
**Authentication**: Optional  
**Description**: Get detailed information about a ride

**URL Parameters**:

- `rideId`: Ride ID (string)

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "6554a1b2c3d4e5f6g7h8i9j1",
    "driver": {
      "id": "6554a1b2c3d4e5f6g7h8i9j0",
      "name": "Ali Ahmed",
      "profilePhoto": "https://cloudinary.com/...",
      "rating": 4.7,
      "ridesCompleted": 23,
      "university": "LUMS"
    },
    "vehicle": {
      "make": "Honda",
      "model": "Civic",
      "color": "Silver",
      "licensePlate": "LEA-1234"
    },
    "origin": "DHA Phase 5",
    "destination": "LUMS University",
    "routeDetails": {
      "distance": 12.5,
      "duration": 25,
      "polyline": "encodedPolylineString..."
    },
    "date": "2025-11-15T00:00:00Z",
    "time": "08:30",
    "departureDateTime": "2025-11-15T08:30:00Z",
    "availableSeats": 2,
    "totalSeats": 3,
    "costPerPassenger": 150,
    "notes": "Will wait max 5 minutes at pickup",
    "preferences": {
      "nonSmoking": true,
      "acAvailable": true,
      "musicAllowed": true,
      "petsAllowed": false
    },
    "passengers": [
      {
        "id": "6554a1b2c3d4e5f6g7h8i9j2",
        "name": "Sara Khan",
        "profilePhoto": "https://cloudinary.com/...",
        "rating": 4.8
      }
    ],
    "status": "scheduled",
    "isRecurring": false,
    "viewCount": 45,
    "createdAt": "2025-11-13T08:00:00Z"
  }
}
```

---

### 3.4 Get My Rides (Driver)

**Endpoint**: `GET /rides/my-rides`  
**Authentication**: Required  
**Description**: Get all rides posted by logged-in user

**Query Parameters**:

- `status` (string, optional): `scheduled` | `in-progress` | `completed` | `cancelled`
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Results per page (default: 20)

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "rides": [
      {
        "id": "6554a1b2c3d4e5f6g7h8i9j1",
        "origin": "DHA Phase 5",
        "destination": "LUMS University",
        "date": "2025-11-15T00:00:00Z",
        "time": "08:30",
        "availableSeats": 2,
        "totalSeats": 3,
        "costPerPassenger": 150,
        "status": "scheduled",
        "passengers": [
          {
            "id": "6554a1b2c3d4e5f6g7h8i9j2",
            "name": "Sara Khan",
            "profilePhoto": "https://cloudinary.com/..."
          }
        ],
        "pendingRequests": 2
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalResults": 23
    }
  }
}
```

---

### 3.5 Update Ride

**Endpoint**: `PATCH /rides/:rideId`  
**Authentication**: Required (driver only)  
**Description**: Update ride details

**URL Parameters**:

- `rideId`: Ride ID (string)

**Request Body** (partial update):

```json
{
  "costPerPassenger": 175,
  "notes": "Will wait 10 minutes at pickup"
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Ride updated successfully",
  "data": {
    "id": "6554a1b2c3d4e5f6g7h8i9j1",
    "costPerPassenger": 175,
    "notes": "Will wait 10 minutes at pickup"
  }
}
```

**Error Responses**:

- `403`: Not authorized (not the driver)
- `400`: Cannot update past ride

---

### 3.6 Cancel Ride

**Endpoint**: `POST /rides/:rideId/cancel`  
**Authentication**: Required (driver only)  
**Description**: Cancel a ride

**URL Parameters**:

- `rideId`: Ride ID (string)

**Request Body**:

```json
{
  "reason": "Vehicle breakdown"
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Ride cancelled. All passengers have been notified.",
  "data": {
    "id": "6554a1b2c3d4e5f6g7h8i9j1",
    "status": "cancelled",
    "cancelReason": "Vehicle breakdown"
  }
}
```

**Error Responses**:

- `403`: Not authorized
- `400`: Cannot cancel ride less than 30 minutes before departure

---

### 3.7 Mark Ride as Completed

**Endpoint**: `POST /rides/:rideId/complete`  
**Authentication**: Required (driver only)  
**Description**: Mark ride as completed

**URL Parameters**:

- `rideId`: Ride ID (string)

**Request Body**:

```json
{}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Ride marked as completed",
  "data": {
    "id": "6554a1b2c3d4e5f6g7h8i9j1",
    "status": "completed"
  }
}
```

---

## 4. Booking Endpoints

### 4.1 Request to Join Ride

**Endpoint**: `POST /bookings`  
**Authentication**: Required (verified users only)  
**Description**: Send join request to driver

**Request Body**:

```json
{
  "rideId": "6554a1b2c3d4e5f6g7h8i9j1",
  "message": "I'm from the same area, would love to join!"
}
```

**Success Response** (201 Created):

```json
{
  "success": true,
  "message": "Join request sent to driver",
  "data": {
    "id": "6554a1b2c3d4e5f6g7h8i9j3",
    "ride": "6554a1b2c3d4e5f6g7h8i9j1",
    "passenger": "6554a1b2c3d4e5f6g7h8i9j2",
    "status": "pending",
    "requestMessage": "I'm from the same area, would love to join!",
    "amountDue": 150,
    "requestedAt": "2025-11-13T08:45:00Z"
  }
}
```

**Error Responses**:

- `400`: Ride is full
- `400`: Already have pending/confirmed booking for this ride
- `400`: Cannot book your own ride

---

### 4.2 Get My Bookings (Passenger)

**Endpoint**: `GET /bookings/my-bookings`  
**Authentication**: Required  
**Description**: Get all bookings made by logged-in user

**Query Parameters**:

- `status` (string, optional): `pending` | `confirmed` | `rejected` | `cancelled`
- `page` (number, optional): Page number (default: 1)

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "6554a1b2c3d4e5f6g7h8i9j3",
        "ride": {
          "id": "6554a1b2c3d4e5f6g7h8i9j1",
          "origin": "DHA Phase 5",
          "destination": "LUMS University",
          "date": "2025-11-15T00:00:00Z",
          "time": "08:30",
          "driver": {
            "id": "6554a1b2c3d4e5f6g7h8i9j0",
            "name": "Ali Ahmed",
            "profilePhoto": "https://cloudinary.com/...",
            "phone": "+923001234567"
          }
        },
        "status": "confirmed",
        "amountDue": 150,
        "paymentStatus": "pending",
        "confirmedAt": "2025-11-13T09:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalResults": 5
    }
  }
}
```

---

### 4.3 Get Pending Requests (Driver)

**Endpoint**: `GET /bookings/requests`  
**Authentication**: Required (driver)  
**Description**: Get all pending join requests for driver's rides

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "6554a1b2c3d4e5f6g7h8i9j3",
        "ride": {
          "id": "6554a1b2c3d4e5f6g7h8i9j1",
          "origin": "DHA Phase 5",
          "destination": "LUMS University",
          "date": "2025-11-15T00:00:00Z",
          "time": "08:30"
        },
        "passenger": {
          "id": "6554a1b2c3d4e5f6g7h8i9j2",
          "name": "Sara Khan",
          "profilePhoto": "https://cloudinary.com/...",
          "university": "LUMS",
          "rating": 4.8,
          "ridesCompleted": 15
        },
        "requestMessage": "I'm from the same area, would love to join!",
        "requestedAt": "2025-11-13T08:45:00Z"
      }
    ],
    "total": 2
  }
}
```

---

### 4.4 Accept Booking Request

**Endpoint**: `POST /bookings/:bookingId/accept`  
**Authentication**: Required (driver only)  
**Description**: Accept a passenger's join request

**URL Parameters**:

- `bookingId`: Booking ID (string)

**Request Body**:

```json
{}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Booking confirmed. Passenger has been notified.",
  "data": {
    "id": "6554a1b2c3d4e5f6g7h8i9j3",
    "status": "confirmed",
    "confirmedAt": "2025-11-13T09:00:00Z"
  }
}
```

**Error Responses**:

- `403`: Not authorized (not the driver)
- `400`: Ride is full

---

### 4.5 Reject Booking Request

**Endpoint**: `POST /bookings/:bookingId/reject`  
**Authentication**: Required (driver only)  
**Description**: Reject a passenger's join request

**URL Parameters**:

- `bookingId`: Booking ID (string)

**Request Body**:

```json
{
  "reason": "Route changed"
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Booking rejected",
  "data": {
    "id": "6554a1b2c3d4e5f6g7h8i9j3",
    "status": "rejected",
    "rejectedAt": "2025-11-13T09:00:00Z"
  }
}
```

---

### 4.6 Cancel Booking (Passenger)

**Endpoint**: `POST /bookings/:bookingId/cancel`  
**Authentication**: Required (passenger only)  
**Description**: Cancel a confirmed booking

**URL Parameters**:

- `bookingId`: Booking ID (string)

**Request Body**:

```json
{}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Booking cancelled. Driver has been notified.",
  "data": {
    "id": "6554a1b2c3d4e5f6g7h8i9j3",
    "status": "cancelled",
    "cancelledBy": "passenger",
    "cancelledAt": "2025-11-13T09:00:00Z"
  }
}
```

**Error Responses**:

- `403`: Not authorized
- `400`: Cannot cancel less than 1 hour before departure

---

### 4.7 Mark Payment as Completed

**Endpoint**: `POST /bookings/:bookingId/payment`  
**Authentication**: Required (driver or passenger)  
**Description**: Mark cash payment as completed

**URL Parameters**:

- `bookingId`: Booking ID (string)

**Request Body**:

```json
{
  "paymentMethod": "cash"
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Payment marked as completed",
  "data": {
    "id": "6554a1b2c3d4e5f6g7h8i9j3",
    "paymentStatus": "paid",
    "paymentMethod": "cash",
    "paidAt": "2025-11-15T09:00:00Z"
  }
}
```
