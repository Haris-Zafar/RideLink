import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const vehicleSchema = new mongoose.Schema({
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
    uppercase: true,
    trim: true,
    match: /^[A-Z]{3}-[0-9]{4}$/,
  },
  year: {
    type: Number,
    min: 2000,
    max: new Date().getFullYear() + 1,
  },
}, { _id: false });

const userSchema = new mongoose.Schema({
  // Authentication
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu\.pk$/, 'Please provide a valid .edu.pk email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^\+92[0-9]{10}$/, 'Please provide a valid Pakistani phone number (+92XXXXXXXXXX)'],
  },

  // Profile
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  profilePhoto: {
    type: String,
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
    required: [true, 'University is required'],
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
    required: [true, 'Home neighborhood is required'],
    trim: true,
    maxlength: 100,
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    enum: ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Other'],
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
  totalEarnings: { type: Number, default: 0 },
  totalSavings: { type: Number, default: 0 },

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
  emailVerificationToken: { type: String, select: false },
  emailVerificationExpires: { type: Date, select: false },
  otpCode: { type: String, select: false },
  otpExpires: { type: Date, select: false },

  // Metadata
  lastLogin: { type: Date },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
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
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
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
  this[ratingField].average = (currentAvg * currentCount + newRating) / (currentCount + 1);

  await this.save();
};

// Method: Generate JWT token (helper - actual JWT creation in controller)
userSchema.methods.toAuthJSON = function() {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    role: this.role,
    university: this.university,
    profilePhoto: this.profilePhoto,
    emailVerified: this.emailVerified,
    phoneVerified: this.phoneVerified,
  };
};

const User = mongoose.model('User', userSchema);

export default User;