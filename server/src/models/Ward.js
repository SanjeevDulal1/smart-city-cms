const mongoose = require('mongoose');

const wardSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  wardNumber:  { type: Number, required: true, unique: true },
  city:        { type: String, default: 'Kathmandu' },
  isActive:    { type: Boolean, default: true },

  // Ward center point for fallback
  centerCoordinates: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },

  // Ward boundary polygon for accurate assignment
  boundary: {
    type:        { type: String, enum: ['Polygon'], default: 'Polygon' },
    coordinates: { type: [[[Number]]] }, // GeoJSON Polygon
  },
}, { timestamps: true });

// Index for geospatial queries
wardSchema.index({ centerCoordinates: '2dsphere' });
wardSchema.index({ boundary: '2dsphere' });

module.exports = mongoose.model('Ward', wardSchema);