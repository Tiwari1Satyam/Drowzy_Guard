import React, { useState } from "react";
import config from "../config";

const BACKEND_URL = `${config.BACKEND_URL}/video_feed`;

function BackendCameraFeed() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="backend-camera-feed card max-w-4xl mx-auto">
      <div className="card-header">
        <h2 className="card-title flex items-center gap-2">
          <span role="img" aria-label="camera">📷</span>
          Fatigue Detection (Backend Stream)
        </h2>
      </div>
      <div className="card-content">
        {loading && !error && (
          <div className="loading-state text-center text-gray-600 py-4">Connecting to backend camera...</div>
        )}
        {error && (
          <div className="alert alert-destructive">Could not load backend video stream.</div>
        )}
        <div className="video-container relative bg-black rounded-lg overflow-hidden">
          <img
            src={BACKEND_URL}
            alt="Fatigue Detection Stream"
            className="video-element w-full h-auto object-cover"
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setError(true); }}
            style={{ display: loading || error ? 'none' : 'block' }}
          />
        </div>
        <div className="camera-info text-sm text-gray-600 mt-4">
          <p>• This video is processed by the backend and includes real-time fatigue detection overlays.</p>
          <p>• Make sure the backend is running and accessible at <code>{BACKEND_URL}</code>.</p>
        </div>
      </div>
    </div>
  );
}

export default BackendCameraFeed;