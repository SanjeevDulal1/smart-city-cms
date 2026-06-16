const Ward    = require('../models/Ward');
const Setting = require('../models/Setting');

const KMC_BOUNDS = {
  minLat: 27.6200,
  maxLat: 27.8100,
  minLng: 85.2300,
  maxLng: 85.4200,
};

const isWithinKathmanduCoords = (latitude, longitude) => {
  return (
    latitude  >= KMC_BOUNDS.minLat &&
    latitude  <= KMC_BOUNDS.maxLat &&
    longitude >= KMC_BOUNDS.minLng &&
    longitude <= KMC_BOUNDS.maxLng
  );
};

const isWithinKathmandu = async (latitude, longitude) => {
  try {
    // Check demo mode from database
    const demoSetting = await Setting.findOne({ key: 'demo_mode' });
    const isDemoMode  = demoSetting?.value ?? true;

    if (isDemoMode) {
      console.log('🎮 Demo mode ON: Skipping KMC boundary check');
      return true;
    }

    const withinBounds = isWithinKathmanduCoords(latitude, longitude);
    if (!withinBounds) {
      console.log(`❌ Outside KMC: (${latitude}, ${longitude})`);
    }
    return withinBounds;
  } catch (error) {
    console.error('Settings error:', error.message);
    return true; // Default to allow if settings fail
  }
};

const findNearestWard = async (latitude, longitude) => {
  try {
    const withinKMC = await isWithinKathmandu(latitude, longitude);
    if (!withinKMC) return null;

    const point = {
      type:        'Point',
      coordinates: [longitude, latitude],
    };

    const wardByBoundary = await Ward.findOne({
      isActive: true,
      boundary: { $geoIntersects: { $geometry: point } },
    });

    if (wardByBoundary) {
      console.log(`✅ Ward by boundary: Ward ${wardByBoundary.wardNumber} - ${wardByBoundary.name}`);
      return wardByBoundary;
    }

    console.log('📍 No boundary match, trying nearest center...');
    const wardByCenter = await Ward.findOne({
      isActive: true,
      centerCoordinates: {
        $near: {
          $geometry:    point,
          $maxDistance: 15000,
        },
      },
    });

    if (wardByCenter) {
      console.log(`📍 Ward by center: Ward ${wardByCenter.wardNumber} - ${wardByCenter.name}`);
      return wardByCenter;
    }

    return null;
  } catch (error) {
    console.error('Ward assignment error:', error.message);
    return null;
  }
};

module.exports = { findNearestWard, isWithinKathmandu };