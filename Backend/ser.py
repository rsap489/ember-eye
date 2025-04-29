import serial
import pyodbc

# Define serial connection
ser = serial.Serial(port="COM14", baudrate=115200)

# Define database connection
conn = pyodbc.connect(
    r'DRIVER={ODBC Driver 17 for SQL Server};'
    r'SERVER=DESKTOP-E13VDEA;'  # <-- change this
    r'DATABASE=EmberEye;'  # <-- change this
    r'Trusted_Connection=yes;'
)

cursor = conn.cursor()


try:
    while True:
        if ser.in_waiting > 0:  # Check if data is available
            data = ser.readline().decode("utf-8").strip()
            print(data)

            if data.startswith("Received: +RCV"):
                # Extract the number from the received data
                datasplit = data.split(",")
                temperature = float(datasplit[2].split(":")[1])
                pressure = float(datasplit[3].split(":")[1])
                pressure /= 100
                humidity = float(datasplit[4].split(":")[1])
                latitude = float(datasplit[5].split(":")[1])
                longitude = float(datasplit[6].split(":")[1])
                device_id = int(datasplit[7].split(":")[1])
                print(f"Temperature: {temperature} °C")
                print(f"Pressure: {pressure} hPa")
                print(f"Humidity: {humidity} %")
                print(f'device_id: {device_id}')

                
                # Check if latitude and longitude are not zero (i.e. GPS has a lock), otherwise do not update the SensorLoc database
                if latitude != 0 and longitude != 0:

                    cursor.execute('''
                        UPDATE SensorLoc
                        SET Latitude = ?, Longitude = ?
                        WHERE Sensor = ?
                    ''', (latitude, longitude, device_id))

                    conn.commit()

                    print("sucessfully inserted lat and long")

                if device_id == 1:
                        
                    # Insert bme data into the database
                    cursor.execute('''
                        INSERT INTO Sensor1 (Temperature, Humidity, Pressure)
                        VALUES (?, ?, ?)
                    ''', temperature, humidity, pressure)
                
                if device_id == 2:

                    cursor.execute('''
                        INSERT INTO Sensor2 (Temperature, Humidity, Pressure)
                        VALUES (?, ?, ?)
                    ''', temperature, humidity, pressure)

                    
                conn.commit()
                

except KeyboardInterrupt:
    print("\nClosing serial connection.")
    ser.close()



