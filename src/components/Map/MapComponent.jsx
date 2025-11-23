import { useEffect, useState } from 'react';
import { MapContainer, ImageOverlay, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Component to handle map clicks
const LocationSelector = ({ onClick, isSelectionMode }) => {
  useMapEvents({
    click: (e) => {
      if (isSelectionMode && onClick) {
        const { lat: y, lng: x } = e.latlng;
        onClick({ x, y });
      }
    },
  });
  return null;
};

const MapComponent = ({ 
  mapImage, 
  imageWidth = 1000, 
  imageHeight = 1000,
  markers = [], 
  onMapClick,
  isSelectionMode = false,
  className = 'h-full w-full'
}) => {
  const [mapKey, setMapKey] = useState(0);

  // Define bounds based on image dimensions
  const bounds = [[0, 0], [imageHeight, imageWidth]];
  const center = [imageHeight / 2, imageWidth / 2];

  // Force remount if image changes
  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [mapImage]);

  return (
    <MapContainer
      key={mapKey}
      crs={L.CRS.Simple}
      bounds={bounds}
      center={center}
      zoom={0}
      minZoom={-2}
      maxZoom={2}
      className={className}
      style={{ background: '#1a1a1a' }}
    >
      {mapImage && (
        <ImageOverlay
          url={mapImage}
          bounds={bounds}
        />
      )}

      <LocationSelector 
        onClick={onMapClick} 
        isSelectionMode={isSelectionMode}
      />

      {markers.map((marker, index) => (
        <Marker 
          key={marker.id || index} 
          position={[marker.y, marker.x]}
          icon={marker.icon || L.Icon.Default.prototype}
        >
          {marker.popup && (
            <Popup>
              {marker.popup}
            </Popup>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
