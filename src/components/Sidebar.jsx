import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Sidebar.css"; // Sidebar styles

const Sidebar = () => {
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [errorWeather, setErrorWeather] = useState(null);

  const [sensorStatus, setSensorStatus] = useState({});
  const [loadingSensors, setLoadingSensors] = useState(true);
  const [errorSensors, setErrorSensors] = useState(null);

  useEffect(() => {
    // Fetch Weather Data
    const fetchWeather = async () => {
      try {
        const latitude = 39.7456;
        const longitude = -97.0892;

        const pointRes = await axios.get(`https://api.weather.gov/points/${latitude},${longitude}`, {
          headers: { "User-Agent": "YourAppName (your@email.com)" },
        });

        const observationStationsUrl = pointRes.data.properties.observationStations;
        const stationRes = await axios.get(observationStationsUrl);
        const latestStation = stationRes.data.features[0].properties.stationIdentifier;

        const observationRes = await axios.get(`https://api.weather.gov/stations/${latestStation}/observations/latest`);
        const weatherData = observationRes.data.properties;

        setWeather({
          temperature: weatherData.temperature.value,
          temperatureUnit: "°C",
          humidity: Math.round(weatherData.relativeHumidity.value),
        });
      } catch (err) {
        setErrorWeather("Failed to load weather data");
      } finally {
        setLoadingWeather(false);
      }
    };

    // Fetch Sensor Status
    const fetchSensorStatus = async () => {
      try {
        const sensors = [1, 2]; // Both sensors
        const responses = await Promise.all(
          sensors.map(sensor => axios.get(`http://localhost:5000/api/temperature-alert?sensor=${sensor}`))
        );

        const statusData = {};
        responses.forEach((res, index) => {
          statusData[sensors[index]] = res.data.alertTriggered ? "⚠️ High Temperature" : "✅ Normal";
        });

        setSensorStatus(statusData);
      } catch (err) {
        setErrorSensors("Failed to load sensor status");
      } finally {
        setLoadingSensors(false);
      }
    };

    fetchWeather();
    fetchSensorStatus();
    const intervalId = setInterval(fetchSensorStatus, 10000); // Update sensor status every 10s

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="sidebar">
      <h2>Menu</h2>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/analytics">Analytics</Link></li>
        <li><Link to="/settings">Settings</Link></li>
      </ul>

    {/* Weather Section */}
    <div className="weather-section">
      <h3>Current Weather</h3>
      {loadingWeather && <p>Loading...</p>}
      {errorWeather && <p>{errorWeather}</p>}
      {weather && (
        <p>
          <strong>Temp:</strong> {weather.temperature} {weather.temperatureUnit}
          <br />
          <strong>Humidity:</strong> {weather.humidity}%
        </p>
      )}
    </div>

    {/* Sensor Status */}
    <div className="sensor-section">
      <h3>Sensor Status</h3>
      {loadingSensors && <p>Loading...</p>}
      {errorSensors && <p>{errorSensors}</p>}
      {!loadingSensors && !errorSensors && (
        <>
          <p><strong>Sensor 1:</strong> {sensorStatus[1]}</p>
          <p><strong>Sensor 2:</strong> {sensorStatus[2]}</p>
        </>
      )}
    </div>
  </div>
  );
};

export default Sidebar;
