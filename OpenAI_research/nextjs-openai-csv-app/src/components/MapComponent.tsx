import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface MapComponentProps {
  setSelectedLocation: (location: string) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ setSelectedLocation }) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const mapRef = useRef<L.Map | null>(null);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.length > 2) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
        );
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching location suggestions:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (lat: number, lon: number, displayName: string) => {
    setPosition([lat, lon]);
    setSelectedLocation(displayName);
    setSuggestions([]);

    // Center the map on the selected location
    if (mapRef.current) {
      mapRef.current.setView([lat, lon], 13);
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`
        )
          .then((response) => response.json())
          .then((data) => {
            if (data && data.display_name) {
              setSelectedLocation(data.display_name);
            }
          });
      },
    });

    return position === null ? null : <Marker position={position}></Marker>;
  };

  // Custom component to dynamically center the map
  const MapCenterUpdater = ({ center }: { center: [number, number] | null }) => {
    const map = useMap();
    useEffect(() => {
      if (center) {
        map.setView(center, 13); // Update the map's center
      }
    }, [center, map]);
    return null;
  };

  return (
    <div style={{ marginTop: '20px', width: '100%' }}>
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Search for a location..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
          }}
        />
        {suggestions.length > 0 && (
          <ul
            style={{
              listStyleType: 'none',
              padding: '0',
              margin: '10px 0',
              border: '1px solid #ccc',
              borderRadius: '5px',
              maxHeight: '150px',
              overflowY: 'auto',
              backgroundColor: '#fff',
            }}
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() =>
                  handleSuggestionClick(
                    parseFloat(suggestion.lat),
                    parseFloat(suggestion.lon),
                    suggestion.display_name
                  )
                }
                style={{
                  padding: '10px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                }}
              >
                {suggestion.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={{ height: '400px', width: '100%' }}>
        <MapContainer
          center={position || [51.505, -0.09]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          whenCreated={(mapInstance) => (mapRef.current = mapInstance)} // Store the map instance
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <MapCenterUpdater center={position} />
          <LocationMarker />
          {position && <Marker position={position} />}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapComponent;