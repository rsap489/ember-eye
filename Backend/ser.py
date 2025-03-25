import serial

ser = serial.Serial(port="COM11", baudrate=115200)


try:
    while True:
        if ser.in_waiting > 0:  # Check if data is available
            data = ser.readline().decode("utf-8").strip()
            print(f"Received: {data}")

except KeyboardInterrupt:
    print("\nClosing serial connection.")
    ser.close()



