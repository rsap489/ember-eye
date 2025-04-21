// Import dependencies
// const express = require('express');
import express from 'express'
import cors from 'cors'
import sql from 'mssql'
// const cors = require('cors');
// const sql = require('mssql');

// Create an Express app
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// SQL Server Configuration
const sqlConfig = {
  server: 'DESKTOP-E13VDEA',       
  user: 'sa',         
  password: 'admin',
  database: 'EmberEye', 
  port: 1433,
  options: {
    encrypt: false,           
    trustServerCertificate: true, 
  }
};


// Set up a route to fetch data from MSSQL
app.get('/api/data', async (req, res) => {
  try {
    await sql.connect(sqlConfig);
    // console.log('SQL server connected');

    // Get sensor parameter from frontend
    const sensor = req.query.sensor;

    // Validate sensor input (prevent SQL injection)
    if (sensor !== '1' && sensor !== '2') {
      return res.status(400).json({ error: 'Invalid sensor selection' });
    }

    // Choose the correct table based on the sensor value
    const tableName = `Sensor${sensor}`;
    const query = `SELECT * FROM ${tableName} ORDER BY Date ASC`;

    // Execute the query
    const result = await sql.query(query);

    // Send the result back
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching data from database');
  }
});

app.get('/api/temperature-alert', async (req, res) => {
  try {
    await sql.connect(sqlConfig);

    const sensor = req.query.sensor;

    const tableName = `Sensor${sensor}`;
    
    // Fetch latest temperature
    const tempQuery = `SELECT TOP 1 Temperature, Date FROM ${tableName} ORDER BY Date DESC`;
    const tempResult = await sql.query(tempQuery);
    if (tempResult.recordset.length === 0) {
      return res.status(404).json({ error: 'No data available for this sensor' });
    }
    const latestTemperature = tempResult.recordset[0].Temperature;
    const latestDate = tempResult.recordset[0].Date;

    // Fetch threshold from a separate table
    const thresholdQuery = `SELECT Value FROM Thresholds WHERE Sensor = ${sensor} AND Type = 'Temperature'`;
    const thresholdResult = await sql.query(thresholdQuery);
    if (thresholdResult.recordset.length === 0) {
      return res.status(404).json({ error: 'No threshold set for this sensor' });
    }
    const temperatureThreshold = thresholdResult.recordset[0].Value;

    // Compare values and send an alert if necessary
    const alertTriggered = latestTemperature > temperatureThreshold;
    res.json({
      sensor,
      latestTemperature,
      temperatureThreshold,
      alertTriggered,
      message: alertTriggered
        ? `⚠️ Alert: Temperature ${latestTemperature}°C exceeded threshold (${temperatureThreshold}°C)`
        : '✅',
      date: latestDate
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error checking temperature alert');
  }
});

app.post('/api/set-threshold', async (req, res) => {
  const { sensorId, temperature } = req.body;

  console.log("Received request to set threshold:", { sensorId, temperature });

  if (!sensorId || !temperature) {
    return res.status(400).json({ error: 'Sensor ID and Temperature threshold are required' });
  }

  try {
    // Connect to SQL Server
    await sql.connect(sqlConfig);

    const request = new sql.Request();
    request.input('sensorId', sql.Int, sensorId);
    request.input('temperature', sql.Int, temperature);

    // Insert or Update the temperature threshold for the given sensorId
    const query = `
      IF EXISTS (SELECT * FROM dbo.Thresholds WHERE Sensor = @sensorId AND Type = 'Temperature')
        BEGIN
            UPDATE dbo.Thresholds
            SET Value = @temperature
            WHERE Sensor = @sensorId AND Type = 'Temperature'
        END;
    `;

    console.log("Executing query:", query);

    // Execute the query with parameters
    const result = await request.query(query);

    console.log("Temperature threshold updated successfully for Sensor", sensorId);

    res.status(200).send(`Temperature threshold for Sensor ${sensorId} updated successfully`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving temperature threshold to database');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});