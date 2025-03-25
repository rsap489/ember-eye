import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get sensor ID from URL (default to Sensor 1)
  const sensor = searchParams.get('sensor') || '1';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/data?sensor=${sensor}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set an interval to fetch data every 15 seconds
    const intervalId = setInterval(() => {
      fetchData();
    }, 2000); // 15000ms = 15 seconds

    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, [sensor]); // Fetch data whenever the sensor changes

  const handleSensorChange = (event) => {
    const selectedSensor = event.target.value;
    setSearchParams({ sensor: selectedSensor }); // Update URL parameter
    navigate(`/analytics?sensor=${selectedSensor}`); // Navigate to new sensor
  };

  if (loading) return <div>Loading data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Analytics - Sensor {sensor}</h1>

      {/* Sensor Selection Dropdown */}
      <label>Select Sensor: </label>
      <select value={sensor} onChange={handleSensorChange}>
        <option value="1">Sensor 1</option>
        <option value="2">Sensor 2</option>
      </select>

      {/* Temperature Graph */}
      <h2>Temperature Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Date" tick={{ fontSize: 12 }} angle={-30} textAnchor="end" />
          <YAxis label={{ value: "°C", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Line type="monotone" dataKey="Temperature" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>

      {/* Humidity Graph */}
      <h2>Humidity Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Date" tick={{ fontSize: 12 }} angle={-30} textAnchor="end" />
          <YAxis label={{ value: "%", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Line type="monotone" dataKey="Humidity" stroke="#82ca9d" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Analytics;
