const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.edu\.pk$/, 'Must be a valid .edu.pk email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+92\d{10}$/, 'Must be a valid Pakistani phone number (+92...)']
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  phoneOTP: {
    type: String,
    select: false
  },
  phoneOTPExpires: {
    type: Date,
    select: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  role: {
    type: String,
    enum: ['passenger', 'driver', 'both', 'admin'],
    default: 'passenger'
  },
  university: {
    type: String,
    required: [true, 'University is required'],
    enum: ['LUMS', 'NUST', 'FAST', 'UET', 'GIKI', 'IBA', 'Other']
  },
  department: {
    type: String,
    trim: true
  },
  studentId: {
    type: String,
    trim: true
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  homeArea: {
    type: String,
    trim: true
  },
  vehicle: {
    make: String,
    model: String,
    color: String,
    licensePlate: String,
    year: Number
  },
  driverRating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  passengerRating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  ridesAsDriver: {
    type: Number,
    default: 0
  },
  ridesAsPassenger: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'banned'],
    default: 'active'
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  }
}, {
  timestamps: true
});

// Index for search
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ university: 1, role: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
