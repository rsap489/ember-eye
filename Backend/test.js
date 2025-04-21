import express from 'express'
import cors from 'cors'
import sql from 'mssql'

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

await sql.connect(sqlConfig);

const request = new sql.Request();
request.input('sensorId', sql.Int, 1);
request.input('temperature', sql.Int, 80);

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

// Execute the query
const result = await request.query(query);

console.log("Temperature threshold updated successfully for Sensor", 1);
console.log("Rows affected:", result.rowsAffected);