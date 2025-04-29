import React, { useState, useEffect } from "react";
import axios from "axios";

const Settings = () => {
  const [sensorId, setSensorId] = useState(1); // Default Sensor
  const [temperatureThreshold, setTemperatureThreshold] = useState(""); // Input for new threshold
  const [currentThreshold, setCurrentThreshold] = useState(null); // Stored latest threshold

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchThreshold = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/get-threshold?sensorId=${sensorId}`);
        if (response.status === 200 && response.data) {
          setCurrentThreshold(response.data.temperature);
        }
      } catch (err) {
        console.error("Failed to fetch current threshold", err);
        setCurrentThreshold(null);
      }
    };

    fetchThreshold();
  }, [sensorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/set-threshold", {
        sensorId: sensorId,
        temperature: temperatureThreshold,
      });

      if (response.status === 200) {
        setSuccess(true);
        setTemperatureThreshold(""); // Clear input
        // Refresh the displayed threshold after saving
        const newThreshold = await axios.get(`http://localhost:5000/api/get-threshold?sensorId=${sensorId}`);
        if (newThreshold.status === 200 && newThreshold.data) {
          setCurrentThreshold(newThreshold.data.temperature);
        }
      }
    } catch (err) {
      setError("Failed to save temperature threshold");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Settings Page</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Sensor: </label>
          <select
            value={sensorId}
            onChange={(e) => setSensorId(Number(e.target.value))}
          >
            <option value={1}>Sensor 1</option>
            <option value={2}>Sensor 2</option>
          </select>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <strong>Current Temperature Threshold:</strong> {currentThreshold !== null ? `${currentThreshold}°C` : "Loading..."}
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label>Set New Temperature Threshold (°C): </label>
          <input
            type="number"
            value={temperatureThreshold}
            onChange={(e) => setTemperatureThreshold(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading} style={{ marginTop: '1rem' }}>
          {loading ? "Saving..." : "Save Temperature Threshold"}
        </button>
      </form>

      {success && <p style={{ color: "green" }}>Temperature threshold saved successfully!</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Settings;
