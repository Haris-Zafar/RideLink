# Database Schema Design: RideLink

## Document Information

- **Project**: RideLink - University Carpooling Platform
- **Version**: 1.0
- **Author**: Technical Architect Agent
- **Date**: November 13, 2025
- **Status**: Final - Ready for Implementation

---

## Schema Overview

**Database Type**: MongoDB (NoSQL Document Database)  
**ODM**: Mongoose 8.x  
**Total Collections**: 7  
**Estimated Storage (10K users)**: ~350 MB

### Collection Summary

| Collection        | Purpose                | Estimated Docs | Avg Size | Total Size  |
| ----------------- | ---------------------- | -------------- | -------- | ----------- |
| **users**         | User profiles & auth   | 10,000         | 2 KB     | 20 MB       |
| **rides**         | Posted ride listings   | 50,000         | 1.5 KB   | 75 MB       |
| **bookings**      | Ride booking records   | 100,000        | 0.8 KB   | 80 MB       |
| **messages**      | Chat messages          | 500,000        | 0.5 KB   | 250 MB      |
| **reviews**       | User ratings & reviews | 80,000         | 0.6 KB   | 48 MB       |
| **notifications** | In-app notifications   | 200,000        | 0.3 KB   | 60 MB       |
| **reports**       | User reports (admin)   | 500            | 1 KB     | 0.5 MB      |
| **Total**         | -                      | **940,500**    | -        | **~533 MB** |

**Note**: With indexing overhead, total ~600 MB (fits in MongoDB Atlas M0 free tier 512 MB for first 6 months)

---

## 1. Users Collection

**Collection Name**: `users`  
**Purpose**: Store user profiles, authentication, and vehicle information

### Schema Definition

```javascript
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const vehicleSchema = new mongoose.Schema(
  {
    make: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    model: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    color: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    licensePlate: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      match: /^[A-Z]{3}-[0-9]{4}$/, // Format: ABC-1234
    },
    year: {
      type: Number,
      min: 2000,
      max: new Date().getFullYear() + 1,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    // Authentication
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu\.pk$/, // Only .edu.pk emails
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // Don't return password in queries by default
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      match: /^\+92[0-9]{10}$/, // Format: +92XXXXXXXXXX
    },

    // Profile
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    profilePhoto: {
      type: String, // Cloudinary URL
      default: null,
    },
    bio: {
      type: String,
      maxlength: 200,
      trim: true,
    },

    // University Info
    university: {
      type: String,
      required: true,
      enum: ['LUMS', 'NUST', 'FAST', 'UET', 'GIKI', 'IBA', 'SZABIST', 'Other'],
    },
    studentId: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    department: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    // Location
    homeNeighborhood: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    city: {
      type: String,
      required: true,
      enum: [
        'Lahore',
        'Karachi',
        'Islamabad',
        'Rawalpindi',
        'Faisalabad',
        'Multan',
        'Other',
      ],
      default: 'Lahore',
    },

    // Role & Permissions
    role: {
      type: String,
      enum: ['passenger', 'driver', 'both', 'admin'],
      default: 'passenger',
    },

    // Vehicle (only for drivers)
    vehicle: {
      type: vehicleSchema,
      default: null,
      required: function () {
        return this.role === 'driver' || this.role === 'both';
      },
    },

    // Verification Status
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: function () {
        return this.emailVerified && this.phoneVerified && this.profilePhoto;
      },
    },

    // Ratings
    driverRating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    passengerRating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },

    // Activity Stats
    ridesOffered: { type: Number, default: 0 },
    ridesTaken: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 }, // Fuel cost recovered
    totalSavings: { type: Number, default: 0 }, // Money saved

    // Account Status
    status: {
      type: String,
      enum: ['active', 'suspended', 'banned'],
      default: 'active',
    },
    suspendedUntil: { type: Date, default: null },

    // Security
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    otpCode: { type: String, select: false },
    otpExpires: { type: Date, select: false },

    // Metadata
    lastLogin: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ university: 1, role: 1 });
userSchema.index({ homeNeighborhood: 1 });
userSchema.index({ status: 1 });
userSchema.index({ 'vehicle.licensePlate': 1 }, { sparse: true });

// Virtual: Full verification status
userSchema.virtual('fullyVerified').get(function () {
  return this.emailVerified && this.phoneVerified && this.profilePhoto !== null;
});

// Pre-save: Hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method: Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method: Update rating
userSchema.methods.updateRating = async function (type, newRating) {
  const ratingField = type === 'driver' ? 'driverRating' : 'passengerRating';
  const currentAvg = this[ratingField].average;
  const currentCount = this[ratingField].count;

  this[ratingField].count = currentCount + 1;
  this[ratingField].average =
    (currentAvg * currentCount + newRating) / (currentCount + 1);

  await this.save();
};

export default mongoose.model('User', userSchema);
```

### Indexes Explanation

| Index                    | Type     | Purpose                  | Query Pattern                               |
| ------------------------ | -------- | ------------------------ | ------------------------------------------- |
| `email: 1`               | Unique   | Login, duplicate check   | `User.findOne({ email })`                   |
| `phone: 1`               | Unique   | Phone verification       | `User.findOne({ phone })`                   |
| `university: 1, role: 1` | Compound | Admin analytics          | `User.find({ university, role: 'driver' })` |
| `homeNeighborhood: 1`    | Single   | Match drivers/passengers | `User.find({ homeNeighborhood })`           |
| `status: 1`              | Single   | Filter active users      | `User.find({ status: 'active' })`           |

### Sample Document

```json
{
  "_id": "6554a1b2c3d4e5f6g7h8i9j0",
  "email": "ali.ahmed@lums.edu.pk",
  "password": "$2a$12$abcd...", // Hashed
  "phone": "+923001234567",
  "name": "Ali Ahmed",
  "profilePhoto": "https://res.cloudinary.com/ridelink/image/upload/v1234567890/profiles/ali.jpg",
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
  "isVerified": true,
  "driverRating": { "average": 4.7, "count": 23 },
  "passengerRating": { "average": 4.9, "count": 15 },
  "ridesOffered": 23,
  "ridesTaken": 15,
  "totalEarnings": 11500,
  "totalSavings": 4500,
  "status": "active",
  "lastLogin": "2025-11-13T08:30:00Z",
  "createdAt": "2025-09-01T10:00:00Z",
  "updatedAt": "2025-11-13T08:30:00Z"
}
```

---

## 2. Rides Collection

**Collection Name**: `rides`  
**Purpose**: Store ride postings (one-time and recurring instances)

### Schema Definition

```javascript
const rideSchema = new mongoose.Schema(
  {
    // Driver
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Route
    origin: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      default: 'University Campus',
    },
    routeDetails: {
      distance: { type: Number }, // in kilometers
      duration: { type: Number }, // in minutes
      polyline: { type: String }, // Encoded Google Maps polyline
    },

    // Schedule
    date: {
      type: Date,
      required: true,
      index: true,
    },
    time: {
      type: String, // Format: "08:30"
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    departureDateTime: {
      type: Date,
      required: true,
      index: true,
    },

    // Capacity
    availableSeats: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },

    // Pricing
    costPerPassenger: {
      type: Number,
      required: true,
      min: 0,
      max: 5000, // PKR
    },

    // Additional Info
    notes: {
      type: String,
      maxlength: 200,
      trim: true,
    },
    preferences: {
      nonSmoking: { type: Boolean, default: false },
      acAvailable: { type: Boolean, default: false },
      musicAllowed: { type: Boolean, default: true },
      petsAllowed: { type: Boolean, default: false },
    },

    // Recurring Ride Info
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringScheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecurringSchedule',
      default: null,
    },

    // Status
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    cancelReason: {
      type: String,
      maxlength: 200,
    },

    // Passengers
    passengers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        bookingId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Booking',
        },
        confirmedAt: Date,
      },
    ],

    // Metadata
    viewCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Compound Indexes for Search
rideSchema.index({ origin: 1, destination: 1, date: 1 });
rideSchema.index({ driver: 1, status: 1 });
rideSchema.index({ departureDateTime: 1, status: 1 });
rideSchema.index({ date: 1, time: 1, origin: 1 }); // Search optimization

// Text index for origin/destination search
rideSchema.index({ origin: 'text', destination: 'text' });

// Virtual: Is ride full
rideSchema.virtual('isFull').get(function () {
  return this.availableSeats === 0;
});

// Virtual: Can be cancelled (more than 30 mins before departure)
rideSchema.virtual('canCancel').get(function () {
  const now = new Date();
  const minutesUntilDeparture = (this.departureDateTime - now) / (1000 * 60);
  return minutesUntilDeparture > 30;
});

// Pre-save: Set departureDateTime from date + time
rideSchema.pre('save', function (next) {
  if (this.isModified('date') || this.isModified('time')) {
    const [hours, minutes] = this.time.split(':');
    this.departureDateTime = new Date(this.date);
    this.departureDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  }
  next();
});

// Method: Add passenger
rideSchema.methods.addPassenger = async function (userId, bookingId) {
  if (this.availableSeats <= 0) {
    throw new Error('No available seats');
  }

  this.passengers.push({
    user: userId,
    bookingId: bookingId,
    confirmedAt: new Date(),
  });
  this.availableSeats -= 1;

  await this.save();
};

// Method: Remove passenger
rideSchema.methods.removePassenger = async function (userId) {
  const index = this.passengers.findIndex(
    (p) => p.user.toString() === userId.toString()
  );
  if (index > -1) {
    this.passengers.splice(index, 1);
    this.availableSeats += 1;
    await this.save();
  }
};

export default mongoose.model('Ride', rideSchema);
```

### Sample Document

```json
{
  "_id": "6554a1b2c3d4e5f6g7h8i9j1",
  "driver": "6554a1b2c3d4e5f6g7h8i9j0",
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
  "isRecurring": false,
  "recurringScheduleId": null,
  "status": "scheduled",
  "passengers": [
    {
      "user": "6554a1b2c3d4e5f6g7h8i9j2",
      "bookingId": "6554a1b2c3d4e5f6g7h8i9j3",
      "confirmedAt": "2025-11-13T09:00:00Z"
    }
  ],
  "viewCount": 45,
  "createdAt": "2025-11-13T08:00:00Z",
  "updatedAt": "2025-11-13T09:00:00Z"
}
```

---

## 3. Recurring Schedules Collection

**Collection Name**: `recurringschedules`  
**Purpose**: Store templates for recurring rides

### Schema Definition

```javascript
const recurringScheduleSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Route (same as Ride)
    origin: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      default: 'University Campus',
    },

    // Schedule Pattern
    daysOfWeek: [
      {
        type: String,
        enum: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
      },
    ],
    time: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },

    // Ride Details
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },
    costPerPassenger: {
      type: Number,
      required: true,
    },
    notes: String,
    preferences: {
      nonSmoking: Boolean,
      acAvailable: Boolean,
      musicAllowed: Boolean,
      petsAllowed: Boolean,
    },

    // Status
    active: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date, // null = indefinite
    },

    // Metadata
    generatedRides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ride',
      },
    ],
    lastGeneratedDate: Date,
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

recurringScheduleSchema.index({ driver: 1, active: 1 });

export default mongoose.model('RecurringSchedule', recurringScheduleSchema);
```

---

## 4. Bookings Collection

**Collection Name**: `bookings`  
**Purpose**: Track ride booking requests and confirmations

### Schema Definition

```javascript
const bookingSchema = new mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: true,
      index: true,
    },
    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Booking Status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'cancelled'],
      default: 'pending',
      index: true,
    },

    // Messages
    requestMessage: {
      type: String,
      maxlength: 100,
      trim: true,
    },
    rejectionReason: {
      type: String,
      maxlength: 200,
    },

    // Payment
    amountDue: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'disputed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'jazzcash', 'easypaisa'],
      default: 'cash',
    },
    paidAt: Date,

    // Timestamps
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    confirmedAt: Date,
    rejectedAt: Date,
    cancelledAt: Date,
    cancelledBy: {
      type: String,
      enum: ['passenger', 'driver', 'system'],
    },

    // Metadata
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
bookingSchema.index({ ride: 1, passenger: 1 }, { unique: true });
bookingSchema.index({ passenger: 1, status: 1 });
bookingSchema.index({ driver: 1, status: 1 });
bookingSchema.index({ requestedAt: -1 });

// Method: Confirm booking
bookingSchema.methods.confirm = async function () {
  this.status = 'confirmed';
  this.confirmedAt = new Date();
  await this.save();
};

// Method: Reject booking
bookingSchema.methods.reject = async function (reason) {
  this.status = 'rejected';
  this.rejectionReason = reason;
  this.rejectedAt = new Date();
  await this.save();
};

export default mongoose.model('Booking', bookingSchema);
```

### Sample Document

```json
{
  "_id": "6554a1b2c3d4e5f6g7h8i9j3",
  "ride": "6554a1b2c3d4e5f6g7h8i9j1",
  "passenger": "6554a1b2c3d4e5f6g7h8i9j2",
  "driver": "6554a1b2c3d4e5f6g7h8i9j0",
  "status": "confirmed",
  "requestMessage": "I'm from the same area, would love to join!",
  "amountDue": 150,
  "paymentStatus": "paid",
  "paymentMethod": "cash",
  "paidAt": "2025-11-15T09:00:00Z",
  "requestedAt": "2025-11-13T08:45:00Z",
  "confirmedAt": "2025-11-13T09:00:00Z",
  "createdAt": "2025-11-13T08:45:00Z",
  "updatedAt": "2025-11-15T09:00:00Z"
}
```

---

## 5. Messages Collection

**Collection Name**: `messages`  
**Purpose**: Store chat messages between ride participants

### Schema Definition

```javascript
const messageSchema = new mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Message Content
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    // Status
    read: {
      type: Boolean,
      default: false,
    },
    readAt: Date,

    // Metadata
    sentAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Compound indexes for chat queries
messageSchema.index({ ride: 1, sentAt: -1 });
messageSchema.index({ sender: 1, receiver: 1, sentAt: -1 });
messageSchema.index({ receiver: 1, read: 1 }); // Unread messages

// TTL Index: Auto-delete messages after 30 days
messageSchema.index({ sentAt: 1 }, { expireAfterSeconds: 2592000 });

export default mongoose.model('Message', messageSchema);
```

### Sample Document

```json
{
  "_id": "6554a1b2c3d4e5f6g7h8i9j4",
  "ride": "6554a1b2c3d4e5f6g7h8i9j1",
  "sender": "6554a1b2c3d4e5f6g7h8i9j2",
  "receiver": "6554a1b2c3d4e5f6g7h8i9j0",
  "text": "Hi! What time will you be at the pickup point?",
  "read": true,
  "readAt": "2025-11-13T09:05:00Z",
  "sentAt": "2025-11-13T09:00:00Z"
}
```

---

## 6. Reviews Collection

**Collection Name**: `reviews`  
**Purpose**: Store ratings and reviews between users

### Schema Definition

```javascript
const reviewSchema = new mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reviewType: {
      type: String,
      enum: ['driver', 'passenger'],
      required: true,
    },

    // Rating
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // Review Content
    comment: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    tags: [
      {
        type: String,
        enum: [
          'on-time',
          'friendly',
          'clean-vehicle',
          'good-conversation',
          'safe-driver',
          'punctual',
          'respectful',
          'quiet',
          'professional',
        ],
      },
    ],

    // Response (optional)
    response: {
      type: String,
      maxlength: 300,
    },
    respondedAt: Date,

    // Metadata
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Compound index: One review per ride per reviewer
reviewSchema.index({ ride: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ reviewedUser: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });

export default mongoose.model('Review', reviewSchema);
```

### Sample Document

```json
{
  "_id": "6554a1b2c3d4e5f6g7h8i9j5",
  "ride": "6554a1b2c3d4e5f6g7h8i9j1",
  "reviewer": "6554a1b2c3d4e5f6g7h8i9j2",
  "reviewedUser": "6554a1b2c3d4e5f6g7h8i9j0",
  "reviewType": "driver",
  "rating": 5,
  "comment": "Great ride! Ali was on time and the car was clean.",
  "tags": ["on-time", "friendly", "clean-vehicle"],
  "createdAt": "2025-11-15T10:00:00Z"
}
```

---

## 7. Notifications Collection

**Collection Name**: `notifications`  
**Purpose**: Store in-app notifications

### Schema Definition

```javascript
const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Notification Content
  type: {
    type: String,
    enum: ['booking-request', 'booking-confirmed', 'booking-rejected',
           'ride-cancelled', 'ride-reminder', 'message', 'review', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 300
  },

  // Related Data
  relatedRide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride'
  },
  relatedBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref
```
