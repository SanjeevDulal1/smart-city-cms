/**
 * Phase 1 → KMC bounding box check (O(1), no DB query)
 * Phase 2 → $geoIntersects polygon match (MongoDB geofencing, primary)
 * Phase 3 → Manual Haversine fallback (our own JS implementation below)
 */

const Ward    = require('../models/Ward');
const Setting = require('../models/Setting');

const EARTH_RADIUS_KM = 6371;

const KMC_BOUNDS = {
  minLat: 27.58,
  maxLat: 27.85,
  minLng: 85.17,
  maxLng: 85.45,
};

//  Haversine formula  ──────────────────────
const toRad = (deg) => (deg * Math.PI) / 180;

const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c; // distance in km
};

// ── KMC boundary check ─────────────────────────────────────────────────────
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
    const demoSetting = await Setting.findOne({ key: 'demo_mode' });
    const isDemoMode  = demoSetting?.value ?? true;

    if (isDemoMode) {
      console.log('Demo mode ON: Skipping KMC boundary check');
      return true;
    }

    const withinBounds = isWithinKathmanduCoords(latitude, longitude);
    if (!withinBounds) {
      console.log(`Outside KMC: (${latitude}, ${longitude})`);
    }
    return withinBounds;
  } catch (error) {
    console.error('Settings error:', error.message);
    return true;
  }
};

// ── Main ward assignment function ──────────────────────────────────────────
const findNearestWard = async (latitude, longitude) => {
  try {
    const withinKMC = await isWithinKathmandu(latitude, longitude);
    if (!withinKMC) return null;

    const point = {
      type:        'Point',
      coordinates: [longitude, latitude],
    };

    // Phase 2: MongoDB $geoIntersects (polygon boundary match)
    const wardByBoundary = await Ward.findOne({
      isActive: true,
      boundary: { $geoIntersects: { $geometry: point } },
    });

    if (wardByBoundary) {
      console.log(`Ward by boundary: Ward ${wardByBoundary.wardNumber} - ${wardByBoundary.name}`);
      return wardByBoundary;
    }

    // Phase 3: Manual Haversine 
    
    console.log('No boundary match — running manual Haversine fallback...');

    const allWards = await Ward.find({ isActive: true });

    if (allWards.length === 0) return null;

    let nearestWard = null;
    let minDistance = Infinity;

    for (const ward of allWards) {
      const [wardLng, wardLat] = ward.centerCoordinates.coordinates;
      const distanceKm = haversineDistance(latitude, longitude, wardLat, wardLng);

      console.log(`  Haversine: Ward ${ward.wardNumber} (${ward.name}) = ${distanceKm.toFixed(3)} km`);

      if (distanceKm < minDistance) {
        minDistance = distanceKm;
        nearestWard = ward;
      }
    }

    const MAX_DISTANCE_KM = 15;
    if (nearestWard && minDistance <= MAX_DISTANCE_KM) {
      console.log(`Nearest by Haversine: Ward ${nearestWard.wardNumber} - ${nearestWard.name} (${minDistance.toFixed(3)} km)`);
      return nearestWard;
    }

    console.log('No ward found within 15km radius');
    return null;
  } catch (error) {
    console.error('Ward assignment error:', error.message);
    return null;
  }
};

module.exports = { findNearestWard, isWithinKathmandu, haversineDistance };