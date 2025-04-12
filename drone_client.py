import os
import time
from datetime import datetime
from pymavlink import mavutil
import cv2

# === CONFIGURATION ===
SAVE_DIR = "/home/deepak/arweave_uav"
#UDP_ENDPOINT = 'udp:192.168.0.1:14570'  # or 'udp:127.0.0.1:14570' for localhost
UDP_ENDPOINT = 'udp:127.0.0.1:14570'


# === SETUP ===
os.makedirs(SAVE_DIR, exist_ok=True)

# Connect to UDP MAVLink stream
print(f"[🔗] Connecting to MAVLink at {UDP_ENDPOINT}...")
try:
    mav = mavutil.mavlink_connection(UDP_ENDPOINT)
    mav.wait_heartbeat()
    print("[✅] MAVLink heartbeat received!")
except Exception as e:
    print(f"❌ MAVLink connection failed: {e}")
    exit()

# Initialize camera
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("❌ Error: Could not open USB camera")
    exit()

print("[📸] Starting image capture every 2 seconds...")

try:
    while True:
        # Get GPS position from drone
        msg = mav.recv_match(type='GLOBAL_POSITION_INT', blocking=True, timeout=5)
        if msg and msg.lat != 0 and msg.lon != 0:
            lat = msg.lat / 1e7
            lon = msg.lon / 1e7
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

            ret, frame = cap.read()
            if ret:
                filename = f"{SAVE_DIR}/img_{timestamp}_{lat:.5f}_{lon:.5f}.png"
                cv2.imwrite(filename, frame)
                print(f"[✅] Saved: {filename}")
            else:
                print("⚠️ Camera frame not captured")

        else:
            print("📡 Waiting for GPS lock...")

        time.sleep(2)

except KeyboardInterrupt:
    print("\n[✋] Stopped by user")

finally:
    cap.release()