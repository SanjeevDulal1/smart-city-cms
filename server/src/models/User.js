const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  phone: {
    type: String,
    trim: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  lastComplaintAt: {
    type: Date,
    default: null,
  },
  totalComplaints: {
    type: Number,
    default: 0,
  },
  avatar: {
    type: String,
    default: null,
  },
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.canSubmitComplaint = function() {
  if (process.env.NODE_ENV === 'development') return true; // No cooldown in dev
  if (!this.lastComplaintAt) return true;
  const cooldownHours = parseInt(process.env.COMPLAINT_COOLDOWN_HOURS) || 1;
  const cooldownMs = cooldownHours * 60 * 60 * 1000;
  return Date.now() - this.lastComplaintAt.getTime() > cooldownMs;
};

module.exports = mongoose.model('User', userSchema);