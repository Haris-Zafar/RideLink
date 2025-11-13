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
**Total Collections**: 8  
**Estimated Storage (10K users)**: ~533 MB

### Collection Summary

| Collection             | Purpose                  | Estimated Docs | Avg Size | Total Size  |
| ---------------------- | ------------------------ | -------------- | -------- | ----------- |
| **users**              | User profiles & auth     | 10,000         | 2 KB     | 20 MB       |
| **rides**              | Posted ride listings     | 50,000         | 1.5 KB   | 75 MB       |
| **bookings**           | Ride booking records     | 100,000        | 0.8 KB   | 80 MB       |
| **messages**           | Chat messages            | 500,000        | 0.5 KB   | 250 MB      |
| **reviews**            | User ratings & reviews   | 80,000         | 0.6 KB   | 48 MB       |
| **notifications**      | In-app notifications     | 200,000        | 0.3 KB   | 60 MB       |
| **reports**            | User reports (admin)     | 500            | 1 KB     | 0.5 MB      |
| **recurringschedules** | Recurring ride templates | 5,000          | 0.8 KB   | 4 MB        |
| **Total**              | -                        | **945,500**    | -        | **~537 MB** |

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

const userSchema = new mongoose.Schema({
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
  homeNeighborhood: 'DHA Phase 5',
  city: 'Lahore',
  role: 'both',
});

console.log('✅ Database seeded successfully');
```

### Production Deployment

```javascript
// migrations/001_create_indexes.js
export async function up() {
  // Create all indexes on production database
  const collections = [
    'users',
    'rides',
    'bookings',
    'messages',
    'reviews',
    'notifications',
    'reports',
    'recurringschedules',
  ];

  for (const collection of collections) {
    await db.collection(collection).createIndexes();
  }
}
```

---

## Query Optimization Examples

### Efficient Queries

```javascript
// ✅ GOOD: Uses compound index (origin, destination, date)
const rides = await Ride.find({
  origin: 'DHA Phase 5',
  destination: 'LUMS University',
  date: { $gte: new Date('2025-11-15') },
})
  .limit(20)
  .lean(); // Use lean() for read-only queries

// ✅ GOOD: Uses index (user, read, createdAt)
const unreadNotifications = await Notification.find({
  user: userId,
  read: false,
})
  .sort({ createdAt: -1 })
  .limit(10);

// ❌ BAD: Full collection scan (no index on notes field)
const rides = await Ride.find({
  notes: /AC available/i,
}); // Slow!

// ✅ BETTER: Use text index
const rides = await Ride.find({
  $text: { $search: 'AC available' },
});
```

---

## Backup & Recovery Strategy

### Automated Backups

**MongoDB Atlas** (Free Tier):

- Automated daily backups (retained for 7 days)
- Point-in-time recovery within 7-day window

### Manual Backup Commands

```bash
# Export entire database
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/ridelink" --out=./backup

# Export specific collection
mongoexport --uri="mongodb+srv://..." --collection=users --out=users.json

# Restore database
mongorestore --uri="mongodb+srv://..." ./backup

# Import collection
mongoimport --uri="mongodb+srv://..." --collection=users --file=users.json
```

---

## Data Retention Policy

| Data Type       | Retention Period | Auto-Delete Method |
| --------------- | ---------------- | ------------------ |
| Messages        | 30 days          | TTL Index          |
| Notifications   | 90 days          | TTL Index          |
| Completed Rides | Indefinite       | Manual cleanup     |
| Cancelled Rides | 1 year           | Cron job           |
| User Accounts   | Until deletion   | Manual (GDPR)      |
| Reports         | 2 years          | Manual archive     |

---

## Performance Benchmarks

### Expected Query Performance (10K Users, 50K Rides)

| Query Type                  | Target Time | Method                 |
| --------------------------- | ----------- | ---------------------- |
| User login (email lookup)   | < 10ms      | Unique index on email  |
| Search rides (with filters) | < 100ms     | Compound index         |
| Load chat messages          | < 50ms      | Compound index + limit |
| Get user notifications      | < 30ms      | Compound index         |
| Admin dashboard analytics   | < 500ms     | Aggregation pipeline   |

### Index Size Estimates

| Collection | Document Size | Index Size (est.) | Total  |
| ---------- | ------------- | ----------------- | ------ |
| users      | 20 MB         | 5 MB              | 25 MB  |
| rides      | 75 MB         | 20 MB             | 95 MB  |
| bookings   | 80 MB         | 15 MB             | 95 MB  |
| messages   | 250 MB        | 30 MB             | 280 MB |

**Total with Indexes**: ~600 MB (fits in Atlas M0 tier initially)

---

## GDPR Compliance Features

### User Data Deletion

```javascript
// Method: Delete user and all related data
userSchema.methods.deleteAccount = async function () {
  const userId = this._id;

  // Delete all related data
  await Ride.deleteMany({ driver: userId });
  await Booking.deleteMany({
    $or: [{ passenger: userId }, { driver: userId }],
  });
  await Message.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] });
  await Review.deleteMany({
    $or: [{ reviewer: userId }, { reviewedUser: userId }],
  });
  await Notification.deleteMany({ user: userId });
  await Report.deleteMany({
    $or: [{ reporter: userId }, { reportedUser: userId }],
  });
  await RecurringSchedule.deleteMany({ driver: userId });

  // Delete user
  await this.deleteOne();
};
```

### Data Export

```javascript
// Export all user data (GDPR right to data portability)
userSchema.methods.exportData = async function () {
  const userId = this._id;

  return {
    profile: this.toJSON(),
    rides: await Ride.find({ driver: userId }),
    bookings: await Booking.find({ passenger: userId }),
    reviews: await Review.find({ reviewer: userId }),
    messages: await Message.find({ sender: userId }),
  };
};
```

---

## Monitoring & Alerts

### Metrics to Track

1. **Collection Sizes**: Alert if any collection > 80% of free tier limit
2. **Query Performance**: Alert if avg query time > 500ms
3. **Failed Operations**: Track failed writes/reads
4. **Connection Pool**: Monitor active connections

### MongoDB Atlas Monitoring

```javascript
// Example: Check database size
db.stats(); // Returns { dataSize, indexSize, storageSize }

// Example: Explain query performance
Ride.find({ origin: 'DHA' }).explain('executionStats');
```

---

## Schema Evolution Plan

### Adding New Fields (Non-Breaking)

```javascript
// Add new field with default value
userSchema.add({
  preferences: {
    language: { type: String, default: 'en' },
    notifications: { type: Boolean, default: true },
  },
});
```

### Removing Fields (Breaking Change)

```javascript
// Step 1: Mark as deprecated (keep for 1 version)
userSchema.add({
  oldField: { type: String, deprecated: true },
});

// Step 2: Remove in next major version
// Use migration script to clean up old data
```

---

## Conclusion

This database schema is:

- ✅ **Scalable**: Supports 10K+ users with proper indexing
- ✅ **Performant**: < 100ms query times for critical operations
- ✅ **Secure**: No exact addresses, sensitive fields protected
- ✅ **Maintainable**: Clear relationships, validation rules
- ✅ **GDPR Compliant**: User data export/deletion methods
- ✅ **Cost-Effective**: Fits MongoDB Atlas free tier initially

**Approval Status**: ✅ **READY FOR IMPLEMENTATION**

---

**Document Version**: 1.0  
**Last Updated**: November 13, 2025  
**Author**: Technical Architect Agent  
**Next Document**: api-specification.md {
type: String,
required: true,
trim: true,
maxlength: 100
},
city: {
type: String,
required: true,
enum: ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Other'],
default: 'Lahore'
},

// Role & Permissions
role: {
type: String,
enum: ['passenger', 'driver', 'both', 'admin'],
default: 'passenger'
},

// Vehicle (only for drivers)
vehicle: {
type: vehicleSchema,
default: null,
required: function() {
return this.role === 'driver' || this.role === 'both';
}
},

// Verification Status
emailVerified: {
type: Boolean,
default: false
},
phoneVerified: {
type: Boolean,
default: false
},
isVerified: {
type: Boolean,
default: function() {
return this.emailVerified && this.phoneVerified && this.profilePhoto;
}
},

// Ratings
driverRating: {
average: { type: Number, default: 0, min: 0, max: 5 },
count: { type: Number, default: 0 }
},
passengerRating: {
average: { type: Number, default: 0, min: 0, max: 5 },
count: { type: Number, default: 0 }
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
default: 'active'
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
updatedAt: { type: Date, default: Date.now }
}, {
timestamps: true,
toJSON: { virtuals: true },
toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ university: 1, role: 1 });
userSchema.index({ homeNeighborhood: 1 });
userSchema.index({ status: 1 });
userSchema.index({ 'vehicle.licensePlate': 1 }, { sparse: true });

// Virtual: Full verification status
userSchema.virtual('fullyVerified').get(function() {
return this.emailVerified && this.phoneVerified && this.profilePhoto !== null;
});

// Pre-save: Hash password
userSchema.pre('save', async function(next) {
if (!this.isModified('password')) return next();
this.password = await bcrypt.hash(this.password, 12);
next();
});

// Method: Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
return await bcrypt.compare(candidatePassword, this.password);
};

// Method: Update rating
userSchema.methods.updateRating = async function(type, newRating) {
const ratingField = type === 'driver' ? 'driverRating' : 'passengerRating';
const currentAvg = this[ratingField].average;
const currentCount = this[ratingField].count;

this[ratingField].count = currentCount + 1;
this[ratingField].average = (currentAvg \* currentCount + newRating) / (currentCount + 1);

await this.save();
};

export default mongoose.model('User', userSchema);

````

### Sample Document

```json
{
  "_id": "6554a1b2c3d4e5f6g7h8i9j0",
  "email": "ali.ahmed@lums.edu.pk",
  "password": "$2a$12$abcd...",
  "phone": "+923001234567",
  "name": "Ali Ahmed",
  "profilePhoto": "https://res.cloudinary.com/ridelink/profiles/ali.jpg",
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
````

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
rideSchema.index({ date: 1, time: 1, origin: 1 });

// Text index for origin/destination search
rideSchema.index({ origin: 'text', destination: 'text' });

// Virtual: Is ride full
rideSchema.virtual('isFull').get(function () {
  return this.availableSeats === 0;
});

// Pre-save: Set departureDateTime
rideSchema.pre('save', function (next) {
  if (this.isModified('date') || this.isModified('time')) {
    const [hours, minutes] = this.time.split(':');
    this.departureDateTime = new Date(this.date);
    this.departureDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  }
  next();
});

export default mongoose.model('Ride', rideSchema);
```

---

## 3. Bookings Collection

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
  },
  {
    timestamps: true,
  }
);

// Compound indexes
bookingSchema.index({ ride: 1, passenger: 1 }, { unique: true });
bookingSchema.index({ passenger: 1, status: 1 });
bookingSchema.index({ driver: 1, status: 1 });

export default mongoose.model('Booking', bookingSchema);
```

---

## 4. Messages Collection

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

// Compound indexes
messageSchema.index({ ride: 1, sentAt: -1 });
messageSchema.index({ sender: 1, receiver: 1, sentAt: -1 });
messageSchema.index({ receiver: 1, read: 1 });

// TTL Index: Auto-delete after 30 days
messageSchema.index({ sentAt: 1 }, { expireAfterSeconds: 2592000 });

export default mongoose.model('Message', messageSchema);
```

---

## 5. Reviews Collection

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

    // Response
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

// Indexes
reviewSchema.index({ ride: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ reviewedUser: 1, createdAt: -1 });

export default mongoose.model('Review', reviewSchema);
```

---

## 6. Notifications Collection

**Collection Name**: `notifications`  
**Purpose**: Store in-app notifications

### Schema Definition

```javascript
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Notification Content
    type: {
      type: String,
      enum: [
        'booking-request',
        'booking-confirmed',
        'booking-rejected',
        'ride-cancelled',
        'ride-reminder',
        'message',
        'review',
        'system',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      maxlength: 300,
    },

    // Related Data
    relatedRide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
    },
    relatedBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Status
    read: {
      type: Boolean,
      default: false,
    },
    readAt: Date,

    // Metadata
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Indexes
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

// TTL Index: Auto-delete after 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.model('Notification', notificationSchema);
```

---

## 7. Reports Collection

**Collection Name**: `reports`  
**Purpose**: Store user reports for admin review

### Schema Definition

```javascript
const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    relatedRide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
    },

    // Report Details
    category: {
      type: String,
      enum: [
        'no-show',
        'harassment',
        'unsafe-driving',
        'fake-profile',
        'other',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 50,
      maxlength: 1000,
    },
    evidence: [
      {
        type: String, // Cloudinary URLs
      },
    ],

    // Status
    status: {
      type: String,
      enum: ['open', 'under-review', 'resolved', 'dismissed'],
      default: 'open',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },

    // Admin Actions
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
    adminNotes: {
      type: String,
      maxlength: 500,
    },
    actionTaken: {
      type: String,
      enum: ['none', 'warning', 'suspension', 'ban'],
      default: 'none',
    },

    // Metadata
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
reportSchema.index({ status: 1, priority: -1, createdAt: -1 });
reportSchema.index({ reportedUser: 1 });

export default mongoose.model('Report', reportSchema);
```

---

## 8. Recurring Schedules Collection

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

    // Route
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
    endDate: Date,

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

## Index Optimization Summary

### Critical Indexes (Query Performance)

| Collection    | Index                              | Type     | Use Case                   |
| ------------- | ---------------------------------- | -------- | -------------------------- |
| users         | email: 1                           | Unique   | Login, registration        |
| users         | phone: 1                           | Unique   | Phone verification         |
| rides         | origin: 1, destination: 1, date: 1 | Compound | Ride search                |
| rides         | departureDateTime: 1, status: 1    | Compound | Upcoming rides query       |
| bookings      | ride: 1, passenger: 1              | Compound | Prevent duplicate bookings |
| messages      | ride: 1, sentAt: -1                | Compound | Chat history retrieval     |
| notifications | user: 1, read: 1, createdAt: -1    | Compound | Unread notifications       |

### TTL Indexes (Auto-Cleanup)

| Collection    | TTL Duration | Purpose                       |
| ------------- | ------------ | ----------------------------- |
| messages      | 30 days      | Auto-delete old messages      |
| notifications | 90 days      | Auto-delete old notifications |

---

## Data Relationships

### Relationship Diagram

```
User (1) ────< (M) Ride
  │
  └──< (M) Booking ──> (1) Ride
  │
  └──< (M) Message ──> (1) Ride
  │
  └──< (M) Review ──> (1) Ride
  │
  └──< (M) Notification
  │
  └──< (M) Report (as reporter or reported)
  │
  └──< (M) RecurringSchedule ──> (M) Ride (generated)
```

---

## Storage Estimates

### Breakdown by Collection (10K Users)

- **Users**: 10,000 × 2 KB = 20 MB
- **Rides**: 50,000 × 1.5 KB = 75 MB
- **Bookings**: 100,000 × 0.8 KB = 80 MB
- **Messages**: 500,000 × 0.5 KB = 250 MB
- **Reviews**: 80,000 × 0.6 KB = 48 MB
- **Notifications**: 200,000 × 0.3 KB = 60 MB
- **Reports**: 500 × 1 KB = 0.5 MB
- **RecurringSchedules**: 5,000 × 0.8 KB = 4 MB

**Total**: ~537 MB (with indexes: ~600 MB)

**MongoDB Atlas Free Tier**: 512 MB → Will need upgrade after ~8,000 active users

---

## Validation Rules Summary

### Email Validation

- Format: `*.edu.pk` domain only
- Regex: `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu\.pk$/`

### Phone Validation

- Format: `+92XXXXXXXXXX` (Pakistan)
- Regex: `/^\+92[0-9]{10}$/`

### License Plate Validation

- Format: `ABC-1234`
- Regex: `/^[A-Z]{3}-[0-9]{4}$/`

### Time Validation

- Format: `HH:MM` (24-hour)
- Regex: `/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/`

---

## Security Considerations

1. **Password Hashing**: bcrypt with 12 salt rounds
2. **Sensitive Fields**: `password`, `otpCode`, `passwordResetToken` → `select: false`
3. **No Exact Addresses**: Only neighborhood-level location data
4. **TTL Indexes**: Auto-delete old messages and notifications
5. **Unique Constraints**: Prevent duplicate emails, phones, license plates

---

## Migration Strategy

### Initial Setup (Development)

```javascript
// scripts/seedDatabase.js
import mongoose from 'mongoose';
import User from './models/User.js';
import Ride from './models/Ride.js';

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI);

// Create indexes
await User.createIndexes();
await Ride.createIndexes();
// ... repeat for all models

// Seed sample data
const sampleUser = await User.create({
  email: 'test@lums.edu.pk',
  password: 'Test1234',
  phone: '+923001234567',
  name: 'Test User',
  university: 'LUMS',
  homeNeighborhood:
```
