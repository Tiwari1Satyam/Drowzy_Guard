from flask import Flask, request, jsonify, Response, make_response
from datetime import datetime
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
import bcrypt
import re
import certifi
from pymongo.server_api import ServerApi
from app import generate_frames

ca = certifi.where()

app = Flask(__name__)
CORS(app, supports_credentials=True)  # Enable CORS for the app

# cache control
def add_cache_control(response):
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

camera_active = False
camera_thread = None

# MongoDB setup
client = MongoClient('mongodb://localhost:27017/', server_api=ServerApi('1'))
db = client['user_db']
users_collection = db['users']
rides_collection = db['rides']

# Test connection
try:
    client.admin.command('ping')
    print("✓ MongoDB connected successfully!")
except Exception as e:
    print(f"✗ MongoDB connection failed: {e}")


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
    role = 'user' # Force role to user for public registration
    contact_number = data.get('contactNumber', '0000000000')
    vehicle_number = data.get('vehicleNumber', 'TEST-000')

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
        'role': role,
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
    email = data.get('email')
    password = data.get('password')

    print(f"Received login data: {data}")

    if not email or not password:
        print('Validation Error: Missing required fields')
        return {'error': 'Missing required fields'}

    user = users_collection.find_one({'email': email})
    if not user:
        return {'error': 'User Not registered'}

    if not bcrypt.checkpw(password.encode('utf-8'), user['password']):
        return {'error': 'Invalid password'}

    # Build the safe user object mapped to the React frontend
    safe_user = {
        'id': str(user['_id']),
        'name': user.get('username', 'Driver'),
        'email': user.get('email'),
        'role': user.get('role', 'user')
    }

    return {'message': 'Login successful', 'user': safe_user}

@app.after_request
def after_request(response):
    return add_cache_control(response)

# route for register
@app.route('/register', methods=['POST'])
def register():
    if request.is_json:
        data = request.get_json()
        result = validate_registration(data)
        if 'error' in result:
            return add_cache_control(jsonify(result)), 400
        else:
            return add_cache_control(jsonify(result)), 201
    else:
        return add_cache_control(jsonify({'error': 'Content-Type must be application/json'})), 415

# route for login
@app.route('/login', methods=['POST'])
def login():
    if request.is_json:
        data = request.get_json()
        result = validate_login(data)
        if 'error' in result:
            return add_cache_control(jsonify(result)), 401
        else:
            return add_cache_control(jsonify(result)), 200
    else:
        return add_cache_control(jsonify({'error': 'Content-Type must be application/json'})), 415

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
            "vehicleNumber": vehicleNumber,
            "role": "user"
        }))

# Route to create admin (Admin only)
@app.route('/create_admin', methods=['POST'])
def create_admin():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'error': 'Missing required fields'}), 400

    if users_collection.find_one({'email': email}):
        return jsonify({'error': 'Email already registered'}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    user_data = {
        'username': username,
        'email': email,
        'password': hashed_password,
        'role': 'admin',
        'contactNumber': 'N/A',
        'vehicleNumber': 'N/A'
    }

    try:
        users_collection.insert_one(user_data)
        return jsonify({'message': 'Admin created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
    user = users_collection.find_one({'username': username})
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

# route for camera feed
@app.route('/video_feed')
def video_feed():
    username = request.args.get('username')
    ride_id = request.args.get('ride_id')
    lat = request.args.get('lat')
    lng = request.args.get('lng')
    return Response(generate_frames(username, ride_id, lat, lng), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/stop_camera', methods=['POST'])
def stop_camera():
    import app as drowsiness_app
    drowsiness_app.feed_active = False
    return jsonify({"message": "Camera stopped"}), 200

@app.route('/get_drowsy_episodes', methods=['GET'])
def get_drowsy_episodes():
    username = request.args.get('username')
    if not username:
        return add_cache_control(jsonify({'error': 'Username required'})), 400
    
    user = users_collection.find_one({'username': username})
    if user and 'drowsyEpisodes' in user:
        return add_cache_control(jsonify({'drowsyEpisodes': user['drowsyEpisodes']})), 200
        
    return add_cache_control(jsonify({'drowsyEpisodes': []})), 200

# --- Ride Management Endpoints ---

@app.route('/start_ride', methods=['POST'])
def start_ride():
    data = request.json
    username = data.get('username')
    start_dest = data.get('start_destination', 'Unknown')
    end_dest = data.get('end_destination', 'Unknown')

    if not username: return jsonify({'error': 'Missing username'}), 400
    ride = {
        'username': username,
        'start_destination': start_dest,
        'end_destination': end_dest,
        'start_time': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        'end_time': None,
        'status': 'active',
        'episodes': []
    }
    result = rides_collection.insert_one(ride)
    return jsonify({'ride_id': str(result.inserted_id)})

@app.route('/end_ride', methods=['POST'])
def end_ride():
    data = request.json
    ride_id = data.get('ride_id')
    if not ride_id: return jsonify({'error': 'Missing ride_id'}), 400
    rides_collection.update_one(
        {'_id': ObjectId(ride_id)},
        {'$set': {'status': 'completed', 'end_time': datetime.now().strftime("%Y-%m-%d %H:%M:%S")}}
    )
    return jsonify({'success': True})

@app.route('/resume_ride', methods=['POST'])
def resume_ride():
    data = request.json
    ride_id = data.get('ride_id')
    if not ride_id: return jsonify({'error': 'Missing ride_id'}), 400
    rides_collection.update_one(
        {'_id': ObjectId(ride_id)},
        {'$set': {'status': 'active', 'end_time': None}}
    )
    return jsonify({'success': True})

@app.route('/get_active_ride', methods=['GET'])
def get_active_ride():
    username = request.args.get('username')
    if not username: return jsonify({'error': 'Missing username'}), 400
    ride = rides_collection.find_one({'username': username, 'status': 'active'})
    if ride:
        ride['_id'] = str(ride['_id'])
        return jsonify({'ride': ride})
    return jsonify({'ride': None})

@app.route('/get_all_rides', methods=['GET'])
def get_all_rides():
    username = request.args.get('username')
    if not username: return jsonify({'error': 'Missing username'}), 400
    rides = list(rides_collection.find({'username': username}).sort('start_time', -1))
    for r in rides: r['_id'] = str(r['_id'])
    return jsonify({'rides': rides})

@app.route('/get_ride_details', methods=['GET'])
def get_ride_details():
    ride_id = request.args.get('ride_id')
    if not ride_id: return jsonify({'error': 'Missing ride_id'}), 400
    ride = rides_collection.find_one({'_id': ObjectId(ride_id)})
    if ride:
        ride['_id'] = str(ride['_id'])
        return jsonify({'ride': ride})
    return jsonify({'error': 'Not found'}), 404

@app.route('/get_all_users', methods=['GET'])
def get_all_users():
    try:
        users = list(users_collection.find({}, {'_id': 0, 'password': 0}))
        for user in users:
            user_rides = list(rides_collection.find({"username": user.get("username")}))
            user["totalSessions"] = len(user_rides)
            total_events = sum(len(r.get("episodes", [])) for r in user_rides)
            user["fatigueEvents"] = total_events
            if len(user_rides) > 0:
                user["lastSession"] = user_rides[-1].get("start_time", "Unknown")
            else:
                user["lastSession"] = "Never"
            user["alertScore"] = 100 - min(total_events * 2, 80)
            user["status"] = "Active" if len(user_rides) > 0 else "Inactive"
            user["id"] = user.get("username")
            user["name"] = user.get("username", "Unknown")
            user["email"] = user.get("email", f"{user.get('username')}@example.com")
        return jsonify(users), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_todays_alerts', methods=['GET'])
def get_todays_alerts():
    try:
        today_str = datetime.now().strftime("%Y-%m-%d")
        todays_rides = list(rides_collection.find({"start_time": {"$regex": f"^{today_str}"}}))
        
        alerts = []
        for r in todays_rides:
            if "episodes" in r:
                for ep in r["episodes"]:
                    if ep.get("severity") == "Major":
                        alerts.append({
                            "ride_id": str(r["_id"]),
                            "username": r.get("username"),
                            "start": ep.get("start"),
                            "duration": ep.get("duration"),
                            "location": ep.get("location"),
                            "image_url": ep.get("image_url")
                        })
        alerts.sort(key=lambda x: x["start"], reverse=True)
        return jsonify(alerts), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5001)