const toRad = (degrees) => degrees * (Math.PI / 180);

/**
 * Calculates the distance in kilometres between two lat/lng points
 * using the Haversine formula.
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Finds the nearest Ward to a given coordinate pair.
 * @param {number} lat - Report latitude
 * @param {number} lng - Report longitude
 * @param {Array}  wards - Array of Ward documents from MongoDB
 * @returns {{ ward, distanceKm }}
 */
const findNearestWard = (lat, lng, wards) => {
  if (!wards || wards.length === 0) {
    throw new Error('No wards available for assignment');
  }

  let nearest = null;
  let minDistance = Infinity;

  for (const ward of wards) {
    const [wardLng, wardLat] = ward.centerCoordinates.coordinates;
    const distance = haversineDistance(lat, lng, wardLat, wardLng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = ward;
    }
  }

  return { ward: nearest, distanceKm: minDistance.toFixed(2) };
};

module.exports = { haversineDistance, findNearestWard };