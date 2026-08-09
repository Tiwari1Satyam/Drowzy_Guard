import base64
import requests
import cv2
import numpy as np

# Create a valid blank JPEG base64
frame = np.zeros((480, 640, 3), dtype=np.uint8)
_, buffer = cv2.imencode('.jpg', frame)
b64 = base64.b64encode(buffer).decode('utf-8')
data_uri = "data:image/jpeg;base64," + b64

r = requests.post('http://localhost:5001/process_frame', json={'image': data_uri})
print(r.status_code)
print(r.text[:200])
