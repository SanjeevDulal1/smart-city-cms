const Ward = require('../models/Ward');

// Find ward by boundary first, fallback to nearest center
const findNearestWard = async (latitude, longitude) => {
  try {
    const point = {
      type: 'Point',
      coordinates: [longitude, latitude], // GeoJSON: [lng, lat]
    };

    // Method 1: Check if point falls inside a ward boundary polygon
    const wardByBoundary = await Ward.findOne({
      isActive: true,
      boundary: {
        $geoIntersects: {
          $geometry: point,
        },
      },
    });

    if (wardByBoundary) {
      console.log(`Ward assigned by boundary: Ward ${wardByBoundary.wardNumber} - ${wardByBoundary.name}`);
      return wardByBoundary;
    }

    // Method 2: Fallback to nearest center if no boundary match
    // (happens when boundaries aren't set up yet)
    console.log('No boundary match, falling back to nearest center...');
    const wardByCenter = await Ward.findOne({
      isActive: true,
      centerCoordinates: {
        $near: {
          $geometry: point,
          $maxDistance: 50000, // 50km max
        },
      },
    });

    if (wardByCenter) {
      console.log(`Ward assigned by center: Ward ${wardByCenter.wardNumber} - ${wardByCenter.name}`);
      return wardByCenter;
    }

    return null;
  } catch (error) {
    console.error('Ward assignment error:', error.message);
    return null;
  }
};

module.exports = { findNearestWard };