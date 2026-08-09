from flask import Flask, Response, request, jsonify
from flask_cors import CORS
import cv2
import mediapipe as mp
import numpy as np
from pygame import mixer
from datetime import datetime
from pymongo import MongoClient
import os
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
import re
import bcrypt

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# cache control
def add_cache_control(response):
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

# MongoDB setup
client = MongoClient('mongodb://localhost:27017/')
db = client['user_db']
users_collection = db['Fatigue']
try:
    client.admin.command('ping')
    print("✓ MongoDB connected successfully!")
except Exception as e:
    print(f"✗ MongoDB connection failed: {e}")

mixer.init()
sound = mixer.Sound('sound.wav')

# MediaPipe Face Mesh initialization
import mediapipe as mp

# Some macOS mediapipe builds don't expose `mp.solutions`
try:
    mp_solutions = mp.solutions
except AttributeError:
    from mediapipe.python import solutions as mp_solutions

mp_face_mesh = mp_solutions.face_mesh

face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1,
                                  refine_landmarks=True,
                                  min_detection_confidence=0.5,
                                  min_tracking_confidence=0.5)

# EAR and MAR thresholds and consecutive frame count
EAR_THRESHOLD = 0.25
MAR_THRESHOLD = 0.5
CONSEC_FRAMES = 20

frame_counter = 0
drowsy_active = False
drowsy_start_time = None
alert_counter = 0
ALERT_FRAMES_THRESHOLD = 5  # Number of consecutive alert frames to confirm end of drowsy episode

# Landmark indices
LEFT_EYE_IDX = [33, 160, 158, 133, 153, 144]
RIGHT_EYE_IDX = [362, 385, 387, 263, 373, 380]
MOUTH_DRAW_IDX = MOUTH_DRAW_IDX = [
    # Outer upper lip
    61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291,
    # Outer lower lip
    146, 91, 181, 84, 17, 314, 405, 321, 375, 291,
    # Inner upper lip
    78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308,
    # Inner lower lip
    95, 88, 178, 87, 14, 317, 402, 318, 324, 308
]



def calculate_ear(eye_points):
    A = np.linalg.norm(eye_points[1] - eye_points[5])
    B = np.linalg.norm(eye_points[2] - eye_points[4])
    C = np.linalg.norm(eye_points[0] - eye_points[3])
    ear = (A + B) / (2.0 * C)
    return ear

# Updated MAR calculation using three vertical pairs and one horizontal
def calculate_mar(landmarks, width, height):
    A = np.linalg.norm(np.array([landmarks[13].x * width, landmarks[13].y * height]) -
                       np.array([landmarks[14].x * width, landmarks[14].y * height]))
    B = np.linalg.norm(np.array([landmarks[78].x * width, landmarks[78].y * height]) -
                       np.array([landmarks[308].x * width, landmarks[308].y * height]))
    C = np.linalg.norm(np.array([landmarks[87].x * width, landmarks[87].y * height]) -
                       np.array([landmarks[317].x * width, landmarks[317].y * height]))
    D = np.linalg.norm(np.array([landmarks[82].x * width, landmarks[82].y * height]) -
                       np.array([landmarks[312].x * width, landmarks[312].y * height]))

    horizontal = np.linalg.norm(np.array([landmarks[61].x * width, landmarks[61].y * height]) -
                                np.array([landmarks[291].x * width, landmarks[291].y * height]))

    mar = (A + B + C + D) / (4.0 * horizontal)
    return mar


def save_drowsy_time(username, drowsy_time):
    result = users_collection.update_one(
        {'name': username},
        {
            '$set': {'drowsyTime': drowsy_time},
            '$push': {'drowsyHistory': drowsy_time}
        }
    )
    return result.modified_count > 0

def save_drowsy_episode(username, start_time, end_time, duration):
    if duration < 4:
        return  # Do not store episodes shorter than 4 seconds
    episode = {
        'start': start_time.strftime("%Y-%m-%d %H:%M:%S"),
        'end': end_time.strftime("%Y-%m-%d %H:%M:%S"),
        'duration': duration
    }
    users_collection.update_one(
        {'name': username},
        {'$push': {'drowsyEpisodes': episode}}
    )

# Update generate_frames to accept username

def generate_frames(username=None):
    global frame_counter, drowsy_active, drowsy_start_time, alert_counter
    cap = cv2.VideoCapture(0)
    font = cv2.FONT_HERSHEY_SIMPLEX
    thicc = 2
    path = os.getcwd()

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            height, width = frame.shape[:2]
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = face_mesh.process(rgb_frame)

            if results.multi_face_landmarks:
                landmarks = results.multi_face_landmarks[0].landmark

                # Convert to pixel coordinates
                coords = np.array([(int(lm.x * width), int(lm.y * height)) for lm in landmarks])
                left_eye = coords[LEFT_EYE_IDX]
                right_eye = coords[RIGHT_EYE_IDX]

                left_ear = calculate_ear(left_eye)
                right_ear = calculate_ear(right_eye)
                ear = (left_ear + right_ear) / 2.0

                mar = calculate_mar(landmarks, width, height)

                status = "Alert"
                if ear < EAR_THRESHOLD or mar > MAR_THRESHOLD:
                    frame_counter += 1
                    status = "Drowsy"
                    if not drowsy_active:
                        drowsy_start_time = datetime.now()
                        drowsy_active = True
                    alert_counter = 0  # Reset alert counter when drowsy
                else:
                    if drowsy_active:
                        alert_counter += 1
                        if alert_counter >= ALERT_FRAMES_THRESHOLD:
                            drowsy_end_time = datetime.now()
                            duration = (drowsy_end_time - drowsy_start_time).total_seconds()
                            if username:
                                save_drowsy_episode(username, drowsy_start_time, drowsy_end_time, duration)
                            drowsy_active = False
                            drowsy_start_time = None
                            alert_counter = 0
                    frame_counter = 5

                # Display EAR, MAR, status
                cv2.putText(frame, f"EAR: {ear:.2f} MAR: {mar:.2f}", (10, height - 60), font, 0.6, (255, 255, 255), 1)
                cv2.putText(frame, status, (10, height - 30), font, 1, (0, 0, 255) if status == "Drowsy" else (0, 255, 0), 2)

                if frame_counter >= CONSEC_FRAMES:
                    cv2.imwrite(os.path.join(path, 'drowsy.jpg'), frame)
                    try:
                        sound.play()
                        # No longer store timestamp here
                    except Exception as e:
                        print("Sound/DB error:", e)

                    if thicc < 16:
                        thicc += 2
                    else:
                        thicc -= 2
                        if thicc < 2:
                            thicc = 2
                    cv2.rectangle(frame, (0, 0), (width, height), (0, 0, 255), thicc)

                # Draw eye + mouth landmarks
                for point in np.concatenate((left_eye, right_eye)):
                    cv2.circle(frame, tuple(point), 2, (0, 255, 255), -1)
                for idx in MOUTH_DRAW_IDX:
                    px = int(landmarks[idx].x * width)
                    py = int(landmarks[idx].y * height)
                    cv2.circle(frame, (px, py), 2, (0, 255, 0), -1)

            ret, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    except Exception as e:
        print("Error:", e)
    finally:
        cap.release()
        cv2.destroyAllWindows()
        mixer.quit()

def is_valid_email(email):
    regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(regex, email)

def is_valid_contact_number(contact_number):
    regex = r'^\d{10}$|^\d{5} \d{5}$'
    return re.match(regex, contact_number)

def is_valid_vehicle_number(vehicle_number):
    regex = r'^[A-Za-z0-9-]+$'  # Adjust regex based on the actual format
    return re.match(regex, vehicle_number)

# validate registration
def validate_registration(data):
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    contact_number = data.get('contactNumber')
    vehicle_number = data.get('vehicleNumber')

    if not username or not email or not password:
        return {'error': 'Missing required fields'}, 400

    if len(username) < 3:
        return {'error': 'Username must be at least 3 characters long'}, 400

    if not is_valid_email(email):
        return {'error': 'Invalid email address'}, 400
    
    if not is_valid_contact_number(contact_number):
        return {'error': 'Invalid contact number format'}, 400
    
    if not is_valid_vehicle_number(vehicle_number):
        return {'error': 'Invalid vehicle number format'}, 400

    if len(password) < 6:
        return {'error': 'Password must be at least 6 characters long'}, 400

    if users_collection.find_one({'username': username}):
        return {'error': 'Username already exists'}, 400

    if users_collection.find_one({'email': email}):
        return {'error': 'Email already registered'}, 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    user_data = {
        'username': username,
        'email': email,
        'password': hashed_password,
        'contactNumber': contact_number,
        'vehicleNumber': vehicle_number
    }

    try:
        result = users_collection.insert_one(user_data)
        print(f"Inserted user data with id: {result.inserted_id}")
        return {'message': 'User registered successfully'}
    except Exception as e:
        print(f"Database insertion error: {e}")
        return {'error': 'Database error. Please try again later'}

# validate login
def validate_login(data):
    username = data.get('username')
    password = data.get('password')

    print(f"Received login data: {data}")

    if not username or not password:
        print('Validation Error: Missing required fields')
        return {'error': 'Missing required fields'}

    user = users_collection.find_one({'username': username})
    if not user:
        return {'error': 'User Not registered'}

    if not bcrypt.checkpw(password.encode('utf-8'), user['password']):
        return {'error': 'Invalid password'}

    return {'message': 'Login successful'}

@app.after_request
def after_request(response):
    return add_cache_control(response)

# route for register
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'user')
    if not all([name, email, password]):
        return jsonify({'error': 'Missing fields'}), 400
    if users_collection.find_one({'email': email}):
        return jsonify({'error': 'Email already registered'}), 400
    hashed_pw = generate_password_hash(password)
    user = {'name': name, 'email': email, 'password': hashed_pw, 'role': role}
    users_collection.insert_one(user)
    return jsonify({'message': 'User registered successfully'})

# route for login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = users_collection.find_one({'email': email})
    if not user or not check_password_hash(user['password'], password):
        return jsonify({'error': 'Invalid credentials'}), 401
    user_info = {'id': str(user['_id']), 'name': user['name'], 'email': user['email'], 'role': user.get('role', 'user')}
    return jsonify({'user': user_info})

@app.route('/users', methods=['POST', 'GET'])
def data():
    if request.method == 'POST':
        body = request.json
        username = body['username']
        email = body['email']
        password = body['password']
        contactNumber = body['contactNumber']
        vehicleNumber = body['vehicleNumber']
        

        if users_collection.find_one({'email': email}):
            return add_cache_control(jsonify({'error': 'Email already registered'})), 400

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        db['users'].insert_one({
            "username": username,
            "email": email,
            "password": hashed_password,
            "contactNumber": contactNumber,
            "vehicleNumber": vehicleNumber
        })

        return add_cache_control(jsonify({
            'status': 'User added to MongoDB',
            "username": username,
            "email": email,
            "contactNumber": contactNumber,
            "vehicleNumber": vehicleNumber
        }))

    if request.method == 'GET':
        allData = db['users'].find()
        dataJson = []
        for data in allData:
            data['_id'] = str(data['_id'])
            del data['password']
            dataJson.append(data)
        return add_cache_control(jsonify(dataJson))
    
# route to get user by username
@app.route('/users/<string:username>', methods=['GET'])
def get_user(username):
    user = users_collection.find_one({'name': username})
    if user:
        user['_id'] = str(user['_id'])
        del user['password']
        return add_cache_control(jsonify(user))
    else:
        return add_cache_control(jsonify({'error': 'User not found'})), 404

# route to get user by id
@app.route('/users/<string:id>', methods=['GET', 'PUT', 'DELETE'])
def user_detail(id):
    if request.method == 'GET':
        user = db['users'].find_one({"_id": ObjectId(id)})
        if user:
            user['_id'] = str(user['_id'])
            del user['password']
            return add_cache_control(jsonify(user))
        else:
            return add_cache_control(jsonify({'error': 'User not found'})), 404

    if request.method == 'PUT':
        body = request.json
        username = body.get('username')
        email = body.get('email')
        password = body.get('password')
        drowsyTime = body.get('drowsyTime')

        updated_data = {}
        if username:
            updated_data['username'] = username
        if email:
            updated_data['email'] = email
        if password:
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            updated_data['password'] = hashed_password
        if drowsyTime is not None:
            updated_data['drowsyTime'] = drowsyTime

        result = db['users'].update_one({"_id": ObjectId(id)}, {"$set": updated_data})

        if result.modified_count > 0:
            return add_cache_control(jsonify({'status': 'User updated'}))
        else:
            return add_cache_control(jsonify({'error': 'User not found or no new data to update'})), 404

    if request.method == 'DELETE':
        result = db['users'].delete_one({"_id": ObjectId(id)})

        if result.deleted_count > 0:
            return add_cache_control(jsonify({'status': 'User deleted'}))
        else:
            return add_cache_control(jsonify({'error': 'User not found'})), 404

# route for logout
@app.route('/logout', methods=['POST'])
def logout():
    # This is a placeholder for logout functionality. Implement as needed.
    # For example, if using sessions or tokens, handle their invalidation here.
    return add_cache_control(jsonify({'message': 'Logged out successfully'})), 200


@app.route('/video_feed')
def video_feed():
    username = request.args.get('username')
    return Response(generate_frames(username), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/get_drowsy_time')
def get_drowsy_time():
    username = request.args.get('username')
    user = users_collection.find_one({'name': username})
    return {'drowsyTime': user.get('drowsyTime', '') if user else ''}

@app.route('/get_drowsy_history')
def get_drowsy_history():
    username = request.args.get('username')
    user = users_collection.find_one({'name': username})
    history = user.get('drowsyHistory', []) if user else []
    return jsonify({'drowsyHistory': history})

@app.route('/get_drowsy_episodes')
def get_drowsy_episodes():
    username = request.args.get('username')
    user = users_collection.find_one({'name': username})
    episodes = user.get('drowsyEpisodes', []) if user else []
    return jsonify({'drowsyEpisodes': episodes})

@app.route('/stop_camera', methods=['POST'])
def stop_camera():
    return jsonify({"message": "Camera stopped"}), 200


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)

