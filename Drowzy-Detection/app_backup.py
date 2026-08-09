from flask import request
import cv2
import os
import tensorflow as tf
from tensorflow import keras
import numpy as np
from pygame import mixer
from datetime import datetime
from pymongo import MongoClient
import certifi
import warnings
from pymongo.server_api import ServerApi
from bson.objectid import ObjectId
warnings.filterwarnings('ignore')

print("TensorFlow version:", tf.__version__)
ca = certifi.where()

# MongoDB setup
try:
    client = MongoClient('mongodb://localhost:27017/', server_api=ServerApi('1'))
    client.admin.command('ping')
    db = client['user_db']
    users_collection = db['users']
    rides_collection = db['rides']
    print("✓ MongoDB connected successfully!")
except Exception as e:
    print(f"✗ MongoDB connection failed: {e}")


def save_drowsy_episode(username, ride_id, start_time, end_time, duration, severity, image_url=None, location=None):
    if not ride_id: return False
    episode = {
        'start': start_time,
        'end': end_time,
        'duration': duration,
        'severity': severity
    }
    if image_url: episode['image_url'] = image_url
    if location: episode['location'] = location

    result = rides_collection.update_one(
        {'_id': ObjectId(ride_id)},
        {'$push': {'episodes': episode}}
    )
    return result.modified_count > 0

mixer.init()
sound = mixer.Sound('sound.wav')

face = cv2.CascadeClassifier('haarcascade-files/haarcascade_frontalface_alt.xml')
leye = cv2.CascadeClassifier('haarcascade-files/haarcascade_lefteye_2splits.xml')
reye = cv2.CascadeClassifier('haarcascade-files/haarcascade_righteye_2splits.xml')

lbl = ['Close', 'Open']

# Load the converted model
print("Loading model...")
try:
    model = keras.models.load_model('models/fatigue_Detection_eyes_v2.h5', compile=False)
    print("✓ Model loaded successfully!")
    print("\nModel expects input shape:", model.input_shape)
except Exception as e:
    print(f"✗ Could not load model: {e}")
    exit(1)

path = os.getcwd()
feed_active = True

def generate_frames(username=None, ride_id=None, lat=None, lng=None):
    global feed_active
    feed_active = True
    alarm_on = False
    episode_start_time = None
    major_event_logged = False
    captured_image_path = None
    cap = cv2.VideoCapture(0)
    font = cv2.FONT_HERSHEY_COMPLEX_SMALL
    count = 0
    score = 0
    thicc = 2

    rpred_class = 1
    lpred_class = 1

    try:
        while feed_active:
            ret, frame = cap.read()
            if not ret:
                print("Failed to capture image")
                break

            height, width = frame.shape[:2]
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

            faces = face.detectMultiScale(gray, minNeighbors=5, scaleFactor=1.1, minSize=(25, 25))
            
            # If the driver's face is completely lost from the frame, reset predictors to Alert 
            # to prevent false-positive alarm locks when they move away.
            if len(faces) == 0:
                rpred_class = 1
                lpred_class = 1
            left_eye = leye.detectMultiScale(gray)
            right_eye = reye.detectMultiScale(gray)

            cv2.rectangle(frame, (0, height-50), (200, height), (0, 0, 0), thickness=cv2.FILLED)

            for (x, y, w, h) in faces:
                cv2.rectangle(frame, (x, y), (x+w, y+h), (100, 100, 100), 1)

            # Process RIGHT eye
            for (x, y, w, h) in right_eye:
                r_eye = frame[y:y+h, x:x+w]
                # Resize to 64x64 (model expects this size)
                r_eye = cv2.resize(r_eye, (64, 64))
                # Normalize
                r_eye = r_eye / 255.0
                # Expand dimensions: (64, 64, 3) -> (1, 64, 64, 3)
                r_eye = np.expand_dims(r_eye, axis=0)
                # Predict using fast batch inference to prevent type-casting crashes
                rpred = model.predict_on_batch(r_eye)
                rpred_class = np.argmax(rpred)
                break

            # Process LEFT eye
            for (x, y, w, h) in left_eye:
                l_eye = frame[y:y+h, x:x+w]
                # Resize to 64x64 (model expects this size)
                l_eye = cv2.resize(l_eye, (64, 64))
                # Normalize
                l_eye = l_eye / 255.0
                # Expand dimensions: (64, 64, 3) -> (1, 64, 64, 3)
                l_eye = np.expand_dims(l_eye, axis=0)
                # Predict using fast batch inference to prevent type-casting crashes
                lpred = model.predict_on_batch(l_eye)
                lpred_class = np.argmax(lpred)
                break

            # Check if both eyes are closed (class 0)
            if rpred_class == 0 and lpred_class == 0:
                score += 1
                if score > 15:
                    score = 15
                cv2.putText(frame, "Sleepy!", (10, height-20), font, 1, (255, 255, 255), 1, cv2.LINE_AA)
            else:
                score -= 1
                cv2.putText(frame, "Alert", (10, height-20), font, 1, (255, 255, 255), 1, cv2.LINE_AA)

            if score < 0:
                score = 0

            cv2.putText(frame, 'Score:' + str(score), (100, height-20), font, 1, (255, 255, 255), 1, cv2.LINE_AA)
            
            # Alert if drowsy (score > 8)
            if score > 8:
                cv2.imwrite(os.path.join(path, 'image.jpg'), frame)
                
                # Check if alarm state just changed
                if not alarm_on:
                    alarm_on = True
                    episode_start_time = datetime.now()
                    major_event_logged = False
                    captured_image_path = None
                    try:
                        sound.play(-1)  # Loop indefinitely
                        print("⚠️  Drowsiness detected at:", episode_start_time.strftime("%Y-%m-%d %H:%M:%S"))
                    except Exception as e:
                        print(f"Error playing sound: {e}")
                
                # Check for Major 15-second event milestone
                if alarm_on and episode_start_time and not major_event_logged:
                    current_duration = (datetime.now() - episode_start_time).total_seconds()
                    if current_duration >= 15:
                        major_event_logged = True
                        timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
                        image_filename = f"drowsy_{username}_{timestamp_str}.jpg"
                        snapshot_dir = os.path.join(path, 'frontend', 'public', 'snapshots')
                        os.makedirs(snapshot_dir, exist_ok=True)
                        cv2.imwrite(os.path.join(snapshot_dir, image_filename), frame)
                        captured_image_path = f"/snapshots/{image_filename}"
                        print(f"📸 Major incident snapshot saved: {image_filename}")
                
                # Red rectangle flash effect
                if thicc < 16:
                    thicc += 2
                else:
                    thicc -= 2
                    if thicc < 2:
                        thicc = 2
                cv2.rectangle(frame, (0, 0), (width, height), (0, 0, 255), thicc)
                
            else:
                if alarm_on:
                    alarm_on = False
                    try:
                        sound.stop()
                    except:
                        pass
                    
                    if episode_start_time and username:
                        end_time = datetime.now()
                        duration = round((end_time - episode_start_time).total_seconds(), 1)
                        severity = 'Major' if duration >= 15 else ('Intermediate' if duration >= 10 else 'Minor')
                        
                        img_to_save = captured_image_path if severity == 'Major' else None
                        loc_to_save = {'lat': float(lat), 'lng': float(lng)} if lat and lng else None

                        save_drowsy_episode(
                            username,
                            ride_id,
                            episode_start_time.strftime("%Y-%m-%d %H:%M:%S"),
                            end_time.strftime("%Y-%m-%d %H:%M:%S"),
                            f"{duration}s",
                            severity,
                            img_to_save,
                            loc_to_save
                        )
                        print(f"   Saved {severity} episode to database for user: {username}, ride: {ride_id}")
                        episode_start_time = None
                        major_event_logged = False
                        captured_image_path = None

            # Encode frame for streaming
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    except Exception as e:
        print(f"An error has occurred: {e}")
        import traceback
        traceback.print_exc()

    finally:
        cap.release()
        cv2.destroyAllWindows()
        try:
            sound.stop()
        except:
            pass
        if alarm_on and episode_start_time and username:
            end_time = datetime.now()
            duration = round((end_time - episode_start_time).total_seconds(), 1)
            severity = 'Major' if duration >= 15 else ('Intermediate' if duration >= 10 else 'Minor')
            
            img_to_save = captured_image_path if severity == 'Major' else None
            loc_to_save = {'lat': float(lat), 'lng': float(lng)} if lat and lng else None

            save_drowsy_episode(
                username,
                ride_id,
                episode_start_time.strftime("%Y-%m-%d %H:%M:%S"),
                end_time.strftime("%Y-%m-%d %H:%M:%S"),
                f"{duration}s",
                severity,
                img_to_save,
                loc_to_save
            )
            print(f"   Saved {severity} episode to database on stop for user: {username}, ride: {ride_id}")