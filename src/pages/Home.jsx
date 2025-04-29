import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import "leaflet/dist/leaflet.css";

const Home = () => {
  const [sensors, setSensors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/sensors');
        if (!response.ok) {
          throw new Error('Failed to fetch sensors');
        }
        const data = await response.json();
        setSensors(data);
      } catch (error) {
        console.error('Error fetching sensor data:', error);
      }
    };

    fetchSensors(); // fetch once immediately

    const intervalId = setInterval(fetchSensors, 5000); // fetch every 5 seconds

    return () => clearInterval(intervalId); // clear the interval if component unmounts
  }, []);

  const handleMarkerClick = (sensorId) => {
    navigate(`/analytics?sensor=${sensorId}`);
  };

  return (
    <div>
      <h1>Sensor Map</h1>

      <MapContainer center={[39.5, -98.35]} zoom={4} style={{ height: "400px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {sensors.map(sensor => (
          <Marker
            key={sensor.id}
            position={[sensor.lat, sensor.lon]}
            eventHandlers={{ click: () => handleMarkerClick(sensor.id) }}
          >
            <Popup>Sensor {sensor.id}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Home;
