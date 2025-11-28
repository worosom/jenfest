import { useState, useEffect, useCallback, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Polygon,
  InfoWindow,
} from "@react-google-maps/api";
import { parseRemfestKML, getFestivalCenter } from "../../utils/kmlParser";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const libraries = ["marker"];

const mapOptions = {
  mapTypeId: "hybrid",
  tilt: 0,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  disableDefaultUI: true,
  backgroundColor: "#3d2817",
  mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID", // Required for AdvancedMarkerElement
};

const GoogleMapComponent = ({
  markers = [],
  onMapClick,
  onMarkerClick,
  isSelectionMode = false,
  centerLocation = null,
  highlightMarkerId = null,
  className = "h-full w-full",
  onViewPost,
  onViewUserProfile,
}) => {
  const [kmlData, setKmlData] = useState(null);
  const [map, setMap] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const markersRef = useRef([]);
  const labelMarkersRef = useRef([]);
  const hasCenteredRef = useRef(false);
  const center = getFestivalCenter();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  // Load KML data
  useEffect(() => {
    parseRemfestKML().then(setKmlData);
  }, []);

  // Handle map click
  const handleMapClick = useCallback(
    (e) => {
      // Close any open marker popup
      setSelectedMarker(null);

      if (isSelectionMode && onMapClick) {
        onMapClick({
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
        });
      }
    },
    [isSelectionMode, onMapClick],
  );

  // Handle centering on location
  useEffect(() => {
    if (map && centerLocation) {
      map.panTo({ lat: centerLocation.lat, lng: centerLocation.lng });
      map.setZoom(18);
    }
  }, [map, centerLocation]);

  // Handle highlighting a specific marker by ID
  useEffect(() => {
    if (!highlightMarkerId || !markers || markers.length === 0 || !map) return;

    // Find the marker with the matching ID
    const markerToHighlight = markers.find((m) => m.id === highlightMarkerId);
    if (markerToHighlight) {
      setSelectedMarker(markerToHighlight);
      // Center on the marker
      map.panTo({ lat: markerToHighlight.y, lng: markerToHighlight.x });
      map.setZoom(18);
    }
  }, [highlightMarkerId, markers, map]);

  // Create AdvancedMarkerElements for POIs
  useEffect(() => {
    if (!map || !kmlData?.pointsOfInterest || !window.google?.maps?.marker)
      return;

    // Clean up existing markers
    markersRef.current.forEach((marker) => {
      if (marker && marker.map) {
        marker.map = null;
      }
    });
    markersRef.current = [];

    // Create new markers
    const newMarkers = kmlData.pointsOfInterest.map((poi) => {
      // Create a custom pin element
      const pinElement = document.createElement("div");
      pinElement.style.width = "16px";
      pinElement.style.height = "16px";
      pinElement.style.borderRadius = "50%";
      pinElement.style.border = "2px solid #FFFFFF";
      pinElement.style.backgroundColor = poi.name.includes("Med")
        ? "#c14a3a" // --color-sunset-red
        : poi.name.includes("Barn")
          ? "#8b4513" // --color-clay-dark
          : "#a0522d"; // --color-clay
      pinElement.style.cursor = "pointer";

      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        map,
        position: poi.position,
        content: pinElement,
        title: poi.name,
      });

      marker.addListener("click", () => {
        if (!isSelectionMode) {
          map.panTo(poi.position);
          setSelectedMarker(poi);
        }
      });

      return marker;
    });

    markersRef.current = newMarkers;

    return () => {
      newMarkers.forEach((marker) => {
        if (marker && marker.map) {
          marker.map = null;
        }
      });
    };
  }, [map, kmlData]);

  // Create AdvancedMarkerElements for custom markers
  useEffect(() => {
    if (!map || !window.google?.maps?.marker) {
      return;
    }

    // Always clean up existing custom markers first
    const customMarkers = markersRef.current.filter((m) => m.customMarker);
    customMarkers.forEach((marker) => {
      if (marker && marker.map) {
        marker.map = null;
      }
    });

    // If markers array is empty, just clear and return
    if (!markers || markers.length === 0) {
      markersRef.current = markersRef.current.filter((m) => !m.customMarker);
      return;
    }
    // Create new custom markers
    const newMarkers = markers.map((marker) => {
      // Create custom content based on icon
      const pinElement = document.createElement("div");

      if (marker.icon && typeof marker.icon === "object" && marker.icon.url) {
        // Use custom icon URL
        const img = document.createElement("img");
        img.src = marker.icon.url;
        img.style.width = marker.icon.scaledSize?.width
          ? `${marker.icon.scaledSize.width}px`
          : "32px";
        img.style.height = marker.icon.scaledSize?.height
          ? `${marker.icon.scaledSize.height}px`
          : "32px";
        pinElement.appendChild(img);
      } else {
        // Default marker style
        pinElement.style.width = "12px";
        pinElement.style.height = "12px";
        pinElement.style.borderRadius = "50%";
        pinElement.style.backgroundColor = "#1976D2";
        pinElement.style.border = "2px solid #FFFFFF";
      }

      pinElement.style.cursor = "pointer";

      const advancedMarker =
        new window.google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat: marker.y, lng: marker.x },
          content: pinElement,
          title: marker.title,
        });

      advancedMarker.customMarker = true;

      advancedMarker.addListener("click", () => {
        if (!isSelectionMode) {
          map.panTo({ lat: marker.y, lng: marker.x });
          setSelectedMarker(marker);
        }
      });

      return advancedMarker;
    });

    markersRef.current = [
      ...markersRef.current.filter((m) => !m.customMarker),
      ...newMarkers,
    ];

    // Don't clean up markers on unmount of this effect - let them persist
    // They'll be cleaned up when new markers are created or component unmounts
  }, [map, markers, isSelectionMode]);

  // Helper function to calculate polygon center
  const getPolygonCenter = (coordinates) => {
    let latSum = 0;
    let lngSum = 0;
    const count = coordinates.length;

    coordinates.forEach((coord) => {
      latSum += coord.lat;
      lngSum += coord.lng;
    });

    return {
      lat: latSum / count,
      lng: lngSum / count,
    };
  };

  // Create labels for polygons
  useEffect(() => {
    if (!map || !kmlData || !window.google?.maps?.marker) {
      return;
    }

    // Clean up existing labels
    labelMarkersRef.current.forEach((marker) => {
      if (marker && marker.map) {
        marker.map = null;
      }
    });
    labelMarkersRef.current = [];

    const newLabels = [];

    // Don't create label for boundary (removed)

    // Create labels for camping areas
    if (kmlData.campingAreas) {
      kmlData.campingAreas.forEach((area) => {
        const center = getPolygonCenter(area.coordinates);
        const labelDiv = document.createElement("div");
        labelDiv.textContent = area.name;

        // Color based on area type
        const bgColor = area.name.includes("Garden")
          ? "rgba(76, 175, 80, 0.9)"
          : area.name.includes("RV")
            ? "rgba(156, 39, 176, 0.9)"
            : "rgba(255, 152, 0, 0.9)";

        labelDiv.style.backgroundColor = bgColor;
        labelDiv.style.color = "white";
        labelDiv.style.padding = "6px 10px";
        labelDiv.style.borderRadius = "4px";
        labelDiv.style.fontWeight = "bold";
        labelDiv.style.fontSize = "12px";
        labelDiv.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
        labelDiv.style.whiteSpace = "nowrap";

        const labelMarker = new window.google.maps.marker.AdvancedMarkerElement(
          {
            map,
            position: center,
            content: labelDiv,
          },
        );

        newLabels.push(labelMarker);
      });
    }

    labelMarkersRef.current = newLabels;

    return () => {
      newLabels.forEach((marker) => {
        if (marker && marker.map) {
          marker.map = null;
        }
      });
    };
  }, [map, kmlData]);

  const onLoad = useCallback(
    (map) => {
      setMap(map);
      // Only set initial center if no centerLocation is provided
      if (!centerLocation) {
        map.setCenter(center);
        map.setZoom(16);
      }
    },
    [center, centerLocation],
  );

  const onUnmount = useCallback(() => {
    // Clean up markers
    markersRef.current.forEach((marker) => {
      if (marker && marker.map) {
        marker.map = null;
      }
    });
    markersRef.current = [];

    // Clean up label markers
    labelMarkersRef.current.forEach((marker) => {
      if (marker && marker.map) {
        marker.map = null;
      }
    });
    labelMarkersRef.current = [];

    setMap(null);
  }, []);

  if (!isLoaded) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading map...</p>
      </div>
    );
  }

  // Polygon styles
  const boundaryOptions = {
    fillColor: "#FF0000",
    fillOpacity: 0,
    strokeColor: "#FF0000",
    strokeOpacity: 1,
    strokeWeight: 3,
    clickable: !isSelectionMode,
  };

  const campingOptions = {
    fillColor: "#4CAF50",
    fillOpacity: 0.25,
    strokeColor: "#2E7D32",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    clickable: !isSelectionMode,
  };

  return (
    <div className={className}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={mapOptions}
      >
        {/* Festival Boundary Polygon */}
        {kmlData?.boundary && (
          <Polygon
            paths={kmlData.boundary.coordinates}
            options={boundaryOptions}
            onClick={() => setSelectedMarker(null)}
          />
        )}

        {/* Camping Area Polygons */}
        {kmlData?.campingAreas.map((area, index) => (
          <Polygon
            key={`camping-${index}`}
            paths={area.coordinates}
            options={{
              ...campingOptions,
              fillColor: area.name.includes("Garden")
                ? "#4CAF50"
                : area.name.includes("RV")
                  ? "#9C27B0"
                  : "#FF9800",
            }}
            onClick={() => setSelectedMarker(null)}
          />
        ))}

        {/* Markers are now created using AdvancedMarkerElement in useEffect hooks */}

        {/* Info Window for selected marker with popup */}
        {selectedMarker && selectedMarker.popup && (
          <InfoWindow
            position={
              selectedMarker.position || {
                lat: selectedMarker.y,
                lng: selectedMarker.x,
              }
            }
            onCloseClick={() => setSelectedMarker(null)}
            options={{
              pixelOffset: new window.google.maps.Size(0, -10),
            }}
          >
            <div
              style={{
                fontFamily: "inherit",
                maxWidth: "300px",
              }}
            >
              <div
                style={{
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (onMarkerClick) {
                    onMarkerClick(selectedMarker);
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.8";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                {selectedMarker.popup}
              </div>
            </div>
          </InfoWindow>
        )}

        {/* Info Window for POI */}
        {selectedMarker && selectedMarker.position && !selectedMarker.popup && (
          <InfoWindow
            position={selectedMarker.position}
            onCloseClick={() => setSelectedMarker(null)}
            options={{
              pixelOffset: new window.google.maps.Size(0, -10),
            }}
          >
            <div
              style={{
                fontFamily: "inherit",
                maxWidth: "250px",
              }}
            >
              <h3
                style={{
                  fontWeight: "bold",
                  color: "#3B2C28",
                  marginBottom: "4px",
                }}
              >
                {selectedMarker.name}
              </h3>
              {selectedMarker.description && (
                <p
                  style={{
                    fontSize: "14px",
                    color: "#5C4742",
                    marginTop: "4px",
                  }}
                >
                  {selectedMarker.description}
                </p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default GoogleMapComponent;