const mongoose = require('mongoose');

const wardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ward name is required'],
    unique: true,
    trim: true,
  },
  wardNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  centerCoordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  city: {
    type: String,
    required: true,
    default: 'Kathmandu',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

wardSchema.index({ centerCoordinates: '2dsphere' });

module.exports = mongoose.model('Ward', wardSchema);