import React, { useState } from "react";
import axios from "axios";

const Settings = () => {
  // State to hold the selected sensor and temperature threshold
  const [sensorId, setSensorId] = useState(1); // Default to Sensor 1
  const [temperatureThreshold, setTemperatureThreshold] = useState("");
  
  // State to handle loading, success, and errors
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      // Send the temperature threshold and sensorId to the server (MSSQL insert)
      const response = await axios.post("http://localhost:5000/api/set-threshold", {
        sensorId: sensorId,
        temperature: temperatureThreshold,
      });
      
      if (response.status === 200) {
        setSuccess(true);
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
        <div>
          <label>Temperature Threshold (°C): </label>
          <input
            type="number"
            value={temperatureThreshold}
            onChange={(e) => setTemperatureThreshold(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Temperature Threshold"}
        </button>
      </form>

      {success && <p>Temperature threshold saved successfully!</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Settings;
