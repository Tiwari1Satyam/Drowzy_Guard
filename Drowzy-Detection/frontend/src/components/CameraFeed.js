import { useEffect, useState, useRef, useCallback } from "react"
import { useAuth } from "../contexts/AuthContext"
import Webcam from "react-webcam"
import { Camera, StopCircle, Focus, Info } from "lucide-react"
import "./CameraFeed.css"

import config from '../config';
const BACKEND_URL = config.BACKEND_URL;

function CameraFeed({ rideId, onEndRide }) {
  const { user } = useAuth()
  const [cameraOn, setCameraOn] = useState(false)
  const [error, setError] = useState(null)
  const [location, setLocation] = useState({ lat: null, lng: null })

  const webcamRef = useRef(null)
  const [processedImage, setProcessedImage] = useState(null)
  const [score, setScore] = useState(0)
  const [sosActive, setSosActive] = useState(false)
  const audioRef = useRef(null)

  const username = user?.name || "guest"

  // Audio alarm logic
  useEffect(() => {
    if (sosActive || score > 8) {
       if (audioRef.current && audioRef.current.paused) {
          audioRef.current.play().catch(e => console.log(e));
       }
    } else {
       if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
       }
    }
  }, [sosActive, score]);

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setCameraOn(true)
          setError(null)
        },
        (err) => {
          console.warn("Location error:", err)
          setCameraOn(true)
          setError("Location access denied. GPS tracking disabled.")
        }
      )
    } else {
      setCameraOn(true)
      setError(null)
    }
  }

  const stopCamera = () => {
    setCameraOn(false)
    setProcessedImage(null)
    setSosActive(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  useEffect(() => {
    let active = true;

    const loop = async () => {
      while (active && cameraOn) {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            try {
              const res = await fetch(`${BACKEND_URL}/process_frame`, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'bypass-tunnel-reminder': 'true'
                },
                body: JSON.stringify({
                  image: imageSrc,
                  username: username,
                  ride_id: rideId,
                  lat: location.lat,
                  lng: location.lng
                })
              });
              if (res.ok) {
                const data = await res.json();
                if (active) {
                  if (data.image) setProcessedImage(data.image);
                  if (data.score !== undefined) setScore(data.score);
                  if (data.sos !== undefined) setSosActive(data.sos);
                }
              }
            } catch (e) {
              console.warn("Frame processing network error", e);
            }
          }
        }
        
        // Wait 150ms before pulling the next frame
        if (active) await new Promise(r => setTimeout(r, 150));
      }
    };

    if (cameraOn) {
      loop();
    }

    return () => {
      active = false;
    };
  }, [cameraOn, username, rideId, location]);

  return (
    <div className={`camera-feed glass-panel ${sosActive ? 'sos-critical' : ''}`}>
      <audio ref={audioRef} src="/sound.wav" loop />

      {sosActive && (
        <div className="sos-overlay">
          <div className="sos-content">
            <h1>🚨 SOS ACTIVATED 🚨</h1>
            <p>EMERGENCY SERVICES NOTIFIED</p>
            <div className="sos-pulse"></div>
          </div>
        </div>
      )}

      <div className="camera-header">
        <h3 className="camera-title flex items-center gap-2">
          <Focus className={cameraOn ? "text-danger animate-pulse" : "text-primary"} size={20} />
          AI Vision Hub
        </h3>
        {cameraOn && (
          <div className="live-status-badge">
            <span className="live-dot"></span> LIVE
          </div>
        )}
      </div>

      <div className="camera-content">
        {error && (
          <div className="camera-error">
            <Info size={18} />
            {error}
          </div>
        )}

        <div className={`video-container ${cameraOn ? "active" : ""}`}>
          {cameraOn ? (
            <>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                screenshotQuality={0.8}
                videoConstraints={{ facingMode: "user", width: 640, height: 480 }}
                style={{ opacity: 0, position: 'absolute', zIndex: -1 }}
                onUserMediaError={(err) => {
                  console.error(err);
                  setError("Camera Error: " + err.message + " (Camera access requires HTTPS or localhost!)")
                }}
              />
              {processedImage ? (
                <img
                  src={processedImage}
                  alt="Drowsiness Detection Stream"
                  className="video-element"
                  onError={() => setError("Unable to load processed stream")}
                />
              ) : (
                <div className="loading-state flex items-center justify-center w-full h-full bg-black text-white" style={{ minHeight: '300px' }}>
                  Initializing Telemetry...
                </div>
              )}

              <div className="scanning-overlay"></div>
              <div className="crosshair crosshair-tl"></div>
              <div className="crosshair crosshair-tr"></div>
              <div className="crosshair crosshair-bl"></div>
              <div className="crosshair crosshair-br"></div>
            </>
          ) : (
            <div className="camera-standby">
              <div className="camera-icon-wrapper pulse-glow">
                <Camera size={48} className="text-secondary" />
              </div>
              <h4 className="standby-title">System Standby</h4>
              <p className="standby-text">Initialize visual monitoring to start detecting fatigue.</p>
            </div>
          )}
        </div>

        <div className="camera-actions" style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={cameraOn ? stopCamera : startCamera}
            className={`btn flex-1 ${cameraOn ? "btn-outline" : "btn-primary"}`}
          >
            {cameraOn ? (
              <><StopCircle size={18} /> Pause Feed</>
            ) : (
              <><Focus size={18} /> Initialize Feed</>
            )}
          </button>

          <button onClick={onEndRide} className="btn btn-destructive flex-1">
            <StopCircle size={18} /> End Ride
          </button>
        </div>

        <div className="camera-metadata">
          <div className="meta-item">
            <span className="meta-label">Engine</span>
            <span className="meta-value">MediaPipe / TF</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Metrics</span>
            <span className="meta-value">EAR / MAR Tracking</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Logging</span>
            <span className="meta-value">Encrypted Database</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CameraFeed
