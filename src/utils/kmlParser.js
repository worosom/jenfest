/**
 * Parse KML coordinates string into lat/lng array
 * KML format: "lng,lat,alt lng,lat,alt ..."
 */
export const parseKMLCoordinates = (coordsString) => {
  return coordsString
    .trim()
    .split(/\s+/)
    .map((coord) => {
      const [lng, lat] = coord.split(',').map(Number);
      return { lat, lng };
    })
    .filter((coord) => !isNaN(coord.lat) && !isNaN(coord.lng));
};

/**
 * Parse the Remfest KML file
 * Returns festival boundary, camping areas, and points of interest
 */
export const parseRemfestKML = async () => {
  try {
    const response = await fetch('/Remfest.kml');
    const kmlText = await response.text();
    const parser = new DOMParser();
    const kmlDoc = parser.parseFromString(kmlText, 'text/xml');

    const placemarks = kmlDoc.getElementsByTagName('Placemark');
    
    const data = {
      boundary: null,
      campingAreas: [],
      pointsOfInterest: [],
    };

    for (let placemark of placemarks) {
      const name = placemark.getElementsByTagName('name')[0]?.textContent || '';
      const descriptionEl = placemark.getElementsByTagName('description')[0];
      const description = descriptionEl?.textContent || '';

      // Check if it's a polygon
      const polygon = placemark.getElementsByTagName('Polygon')[0];
      if (polygon) {
        const coordsEl = polygon.getElementsByTagName('coordinates')[0];
        if (coordsEl) {
          const coordinates = parseKMLCoordinates(coordsEl.textContent);
          
          const polygonData = {
            name,
            description,
            coordinates,
          };

          // Main festival boundary
          if (name.toLowerCase().includes('ranch') || 
              name.toLowerCase().includes('fairgrounds') ||
              name.toLowerCase().includes('jenfest')) {
            data.boundary = polygonData;
          } 
          // Camping areas
          else if (name.toLowerCase().includes('camping')) {
            data.campingAreas.push(polygonData);
          }
        }
      }

      // Check if it's a point
      const point = placemark.getElementsByTagName('Point')[0];
      if (point) {
        const coordsEl = point.getElementsByTagName('coordinates')[0];
        if (coordsEl) {
          const coords = coordsEl.textContent.trim().split(',');
          const [lng, lat] = coords.map(Number);
          
          data.pointsOfInterest.push({
            name,
            description,
            position: { lat, lng },
          });
        }
      }
    }

    return data;
  } catch (error) {
    console.error('Error parsing KML:', error);
    return {
      boundary: null,
      campingAreas: [],
      pointsOfInterest: [],
    };
  }
};

/**
 * Get center point of the festival
 */
export const getFestivalCenter = () => {
  // Center of Plackemeier ranch from KML LookAt
  return {
    lat: 30.14493241581053,
    lng: -97.01558175925695,
  };
};