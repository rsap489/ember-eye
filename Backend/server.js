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
    console.log('SQL server connected');

    // Get sensor parameter from frontend
    const sensor = req.query.sensor;

    // Validate sensor input (prevent SQL injection)
    if (sensor !== '1' && sensor !== '2') {
      return res.status(400).json({ error: 'Invalid sensor selection' });
    }

    // Choose the correct table based on the sensor value
    const tableName = `Sensor${sensor}`;
    const query = `SELECT * FROM ${tableName}`;

    // Execute the query
    const result = await sql.query(query);

    // Send the result back
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching data from database');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});