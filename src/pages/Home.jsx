import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import "leaflet/dist/leaflet.css";

const sensors = [
  { id: 1, name: 'Sensor 1', lat: 40.7128, lon: -74.0060 }, // Example: New York
  { id: 2, name: 'Sensor 2', lat: 34.0522, lon: -118.2437 } // Example: Los Angeles
];

const Home = () => {
  const navigate = useNavigate();

  const handleMarkerClick = (sensorId) => {
    navigate(`/analytics?sensor=${sensorId}`);
  };

  return (
    <div>
      <h1>Sensor Map</h1>

      {/* Map Display */}
      <MapContainer center={[39.5, -98.35]} zoom={4} style={{ height: "400px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Markers for Each Sensor */}
        {sensors.map(sensor => (
          <Marker
            key={sensor.id}
            position={[sensor.lat, sensor.lon]}
            eventHandlers={{ click: () => handleMarkerClick(sensor.id) }}
          >
            <Popup>{sensor.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Home;
