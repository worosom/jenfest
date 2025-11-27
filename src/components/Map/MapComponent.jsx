import { useEffect, useState } from "react";
import {
  MapContainer,
  ImageOverlay,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",
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

// Component to handle centering the map on a specific location
const MapCenterController = ({ centerLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (centerLocation) {
      // Fly to the location with a nice animation
      map.flyTo([centerLocation.y, centerLocation.x], 1, {
        duration: 1.5,
      });
    }
  }, [centerLocation, map]);

  return null;
};

const MapComponent = ({
  mapImage,
  imageWidth = 1000,
  imageHeight = 1000,
  markers = [],
  onMapClick,
  isSelectionMode = false,
  centerLocation = null,
  className = "h-full w-full",
}) => {
  const [mapKey, setMapKey] = useState(0);

  // Define bounds based on image dimensions
  const bounds = [
    [0, 0],
    [imageHeight, imageWidth],
  ];
  const center = [imageHeight / 2, imageWidth / 2];

  // Force remount if image changes
  useEffect(() => {
    setMapKey((prev) => prev + 1);
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
      style={{ background: "#347941" }}
    >
      {mapImage && <ImageOverlay url={`${mapImage}?v=${mapKey}`} bounds={bounds} />}

      <LocationSelector
        onClick={onMapClick}
        isSelectionMode={isSelectionMode}
      />

      <MapCenterController centerLocation={centerLocation} />

      {markers.map((marker, index) => (
        <Marker
          key={marker.id || index}
          position={[marker.y, marker.x]}
          icon={marker.icon || L.Icon.Default.prototype}
        >
          {marker.popup && <Popup>{marker.popup}</Popup>}
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;