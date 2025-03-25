import { useState, useEffect } from "react";
import axios from "axios";

const useWeather = (latitude, longitude) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Get grid location
        const pointRes = await axios.get(`https://api.weather.gov/points/${latitude},${longitude}`);
        const forecastUrl = pointRes.data.properties.forecast;
        
        // Get forecast
        const forecastRes = await axios.get(forecastUrl);
        setWeather(forecastRes.data.properties.periods);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [latitude, longitude]);

  return { weather, loading, error };
};

export default useWeather;
