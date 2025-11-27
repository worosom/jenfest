/**
 * Convert image coordinates to real GPS coordinates
 * 
 * The festival is at Plackemeier ranch:
 * Center: lat 30.14493241581053, lng -97.01558175925695
 * 
 * Boundaries from KML:
 * SW: -97.02145317055779, 30.13827186478475
 * NE: -97.00731671730469, 30.15099251868937
 * 
 * Image dimensions: 1348 x 1102
 */

const FESTIVAL_BOUNDS = {
  north: 30.15099251868937,
  south: 30.13827186478475,
  east: -97.00731671730469,
  west: -97.02145317055779,
};

const IMAGE_DIMENSIONS = {
  width: 1348,
  height: 1102,
};

/**
 * Convert image x/y coordinates to GPS lat/lng
 * @param {number} x - X coordinate on image (0 to imageWidth)
 * @param {number} y - Y coordinate on image (0 to imageHeight)
 * @returns {{lat: number, lng: number}} GPS coordinates
 */
export const imageToGPS = (x, y) => {
  // Normalize to 0-1 range
  const normalizedX = x / IMAGE_DIMENSIONS.width;
  const normalizedY = y / IMAGE_DIMENSIONS.height;

  // Convert to lat/lng
  // X maps to longitude (west to east)
  const lng = FESTIVAL_BOUNDS.west + (FESTIVAL_BOUNDS.east - FESTIVAL_BOUNDS.west) * normalizedX;
  
  // Y maps to latitude (note: image Y goes down, but lat goes up)
  const lat = FESTIVAL_BOUNDS.north - (FESTIVAL_BOUNDS.north - FESTIVAL_BOUNDS.south) * normalizedY;

  return { lat, lng };
};

/**
 * Convert GPS lat/lng to image x/y coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {{x: number, y: number}} Image coordinates
 */
export const gpsToImage = (lat, lng) => {
  // Calculate position as fraction of bounds
  const xFraction = (lng - FESTIVAL_BOUNDS.west) / (FESTIVAL_BOUNDS.east - FESTIVAL_BOUNDS.west);
  const yFraction = (FESTIVAL_BOUNDS.north - lat) / (FESTIVAL_BOUNDS.north - FESTIVAL_BOUNDS.south);

  // Convert to image coordinates
  const x = xFraction * IMAGE_DIMENSIONS.width;
  const y = yFraction * IMAGE_DIMENSIONS.height;

  return { x, y };
};

/**
 * Check if coordinates are in lat/lng format (vs image x/y)
 * @param {object} coords - Coordinates to check
 * @returns {boolean} True if lat/lng format
 */
export const isGPSCoords = (coords) => {
  return coords && typeof coords.lat === 'number' && typeof coords.lng === 'number';
};

/**
 * Normalize coordinates to lat/lng format
 * Handles both old (x/y) and new (lat/lng) formats
 */
export const normalizeCoords = (coords) => {
  if (!coords) return null;
  
  if (isGPSCoords(coords)) {
    return { lat: coords.lat, lng: coords.lng };
  }
  
  if (typeof coords.x === 'number' && typeof coords.y === 'number') {
    return imageToGPS(coords.x, coords.y);
  }
  
  return null;
};
