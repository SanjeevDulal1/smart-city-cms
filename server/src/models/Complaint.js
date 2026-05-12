const mongoose = require('mongoose');

const CATEGORY_WEIGHTS = {
  'live_wire':       10,
  'gas_leak':        10,
  'road_collapse':    9,
  'sewage_overflow':  8,
  'flood':            8,
  'pothole':          6,
  'broken_light':     5,
  'garbage':          5,
  'broken_footpath':  4,
  'noise':            3,
  'other':            2,
};

const complaintSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ward',
    required: true,
  },
  assignedAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [20, 'Please provide more detail (min 20 characters)'],
    maxlength: 1000,
  },
  category: {
    type: String,
    required: true,
    enum: Object.keys(CATEGORY_WEIGHTS),
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
    address: {
      type: String,
      default: '',
    },
  },
  photos: [{
    url: String,
    filename: String,
    uploadedAt: { type: Date, default: Date.now },
  }],
  status: {
    type: String,
    enum: ['pending', 'under_review', 'in_progress', 'resolved', 'rejected'],
    default: 'pending',
  },
  priority: {
    score: { type: Number, default: 0 },
    categoryWeight: { type: Number, default: 0 },
    lastCalculated: { type: Date, default: Date.now },
  },
  statusHistory: [{
    status: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    changedAt: { type: Date, default: Date.now },
    note: String,
  }],
  adminNote: {
    type: String,
    default: '',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true });

complaintSchema.index({ location: '2dsphere' });
complaintSchema.index({ status: 1, ward: 1 });
complaintSchema.index({ 'priority.score': -1 });
complaintSchema.index({ user: 1, createdAt: -1 });

complaintSchema.statics.CATEGORY_WEIGHTS = CATEGORY_WEIGHTS;

module.exports = mongoose.model('Complaint', complaintSchema);