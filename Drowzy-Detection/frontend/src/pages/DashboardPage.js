import { useState, useEffect } from "react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import Header from "../components/Header"
import CameraFeed from "../components/CameraFeed"
import { Activity, AlertTriangle, Calendar, Clock, TrendingUp, History, ShieldAlert, MapPin, Image as ImageIcon, X, ArrowRight } from "lucide-react"
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import "./DashboardPage.css"
import config from "../config"

function DashboardPage() {
  const { user } = useAuth()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const queryRideId = searchParams.get('ride_id')
  const queryDriver = searchParams.get('driver')
  const targetUsername = queryDriver || user?.name
  const isHistoricalView = !!queryRideId

  const [activeRideId, setActiveRideId] = useState(queryRideId || null)
  const [recentRides, setRecentRides] = useState([])
  const [activeRoute, setActiveRoute] = useState(null)
  const [startDest, setStartDest] = useState("")
  const [endDest, setEndDest] = useState("")
  const navigate = useNavigate()
  const [fatigueEvents, setFatigueEvents] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)

  // Configure map icon securely via CDN to prevent Webpack bundling errors
  const customMarker = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const generateChartData = () => {
    if (fatigueEvents.length === 0) {
      return [
        { time: "--:--", level: 0 },
        { time: "Now", level: 0 }
      ]
    }

    const recentEvents = fatigueEvents.slice(0, 8).reverse()

    return recentEvents.map(event => {
      let level = 1
      if (event.severity === "Intermediate") level = 3
      if (event.severity === "Major") level = 5

      let timeLabel = event.timestamp
      if (event.timestamp.includes(" ")) {
        timeLabel = event.timestamp.split(" ")[1].substring(0, 5)
      }

      return { time: timeLabel, level }
    })
  }

  const dynamicChartData = generateChartData()

  useEffect(() => {
    if (!user) return
    async function checkActiveRide() {
      try {
        if (isHistoricalView) {
          const res = await fetch(`${config.BACKEND_URL}/get_ride_details?ride_id=${activeRideId}`)
          if (res.ok) {
            const data = await res.json()
            if (data.ride) {
              setActiveRoute({ start: data.ride.start_destination, end: data.ride.end_destination })
              if (data.ride.episodes) {
                setFatigueEvents(
                  data.ride.episodes.slice().reverse().map((ep) => ({
                    id: ep.start, timestamp: ep.start, end: ep.end, duration: ep.duration,
                    severity: ep.severity || "Unknown", type: "Drowsiness Detected",
                    imageUrl: ep.image_url, location: ep.location
                  }))
                )
              }
            }
          }
        } else {
          const res = await fetch(`${config.BACKEND_URL}/get_active_ride?username=${encodeURIComponent(targetUsername)}`)
          if (res.ok) {
            const data = await res.json()
            if (data.ride) {
              setActiveRideId(data.ride._id)
              setActiveRoute({ start: data.ride.start_destination, end: data.ride.end_destination })
              if (data.ride.episodes) {
                setFatigueEvents(
                  data.ride.episodes.slice().reverse().map((ep) => ({
                    id: ep.start, timestamp: ep.start, end: ep.end, duration: ep.duration,
                    severity: ep.severity || "Unknown", type: "Drowsiness Detected",
                    imageUrl: ep.image_url, location: ep.location
                  }))
                )
              }
            } else {
              const histRes = await fetch(`${config.BACKEND_URL}/get_all_rides?username=${encodeURIComponent(targetUsername)}`)
              if (histRes.ok) {
                const histData = await histRes.json()
                setRecentRides((histData.rides || []).slice(0, 3))
              }
            }
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
    checkActiveRide()
  }, [user, isHistoricalView, activeRideId])

  useEffect(() => {
    if (!user || !activeRideId || isHistoricalView) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${config.BACKEND_URL}/get_ride_details?ride_id=${activeRideId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.ride && Array.isArray(data.ride.episodes)) {
            setFatigueEvents(
              data.ride.episodes.slice().reverse().map((ep) => ({
                id: ep.start,
                timestamp: ep.start,
                end: ep.end,
                duration: ep.duration,
                severity: ep.severity || "Unknown",
                type: "Drowsiness Detected",
                imageUrl: ep.image_url,
                location: ep.location
              }))
            )
          }
        }
      } catch (e) {
        console.error(e)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [user, activeRideId])

  const handleStartNewRide = async () => {
    if (!startDest.trim() || !endDest.trim()) {
      return
    }
    try {
      const res = await fetch(`${config.BACKEND_URL}/start_ride`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: targetUsername,
          start_destination: startDest,
          end_destination: endDest
        })
      })
      const data = await res.json()
      setActiveRideId(data.ride_id)
      setActiveRoute({ start: startDest, end: endDest })
      setFatigueEvents([])
    } catch (e) { console.error("Could not start ride", e) }
  }

  const handleEndRide = async () => {
    try {
      await fetch(`${config.BACKEND_URL}/end_ride`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ride_id: activeRideId })
      })
      fetch(`${config.BACKEND_URL}/stop_camera`, { method: 'POST' }).catch(() => { })
      setActiveRideId(null)
      setActiveRoute(null)
      setStartDest("")
      setEndDest("")
      setFatigueEvents([])
    } catch (e) { console.error("Could not end ride", e) }
  }

  const getSeverityClass = (severity) => {
    switch (severity) {
      case "Major": return "badge-destructive"
      case "Intermediate": return "badge-warning"
      case "Minor": return "badge-success"
      default: return "badge-default"
    }
  }

  return (
    <div className="dashboard-page">
      <Header showNavigation={true} />

      <main className="container main-content animate-fade-in">
        {queryDriver && (
          <div className="bg-warning text-black font-bold p-3 text-center text-sm w-full rounded-lg shadow-lg mb-6 flex items-center justify-center gap-2 max-w-[800px] mx-auto">
            <ShieldAlert size={18} /> ADMINISTRATOR SURVEILLANCE: Live Monitoring '{queryDriver}'
          </div>
        )}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Welcome back, <span className="text-gradient">{user?.name || "Driver"}</span>!</h1>
            <p className="dashboard-subtitle">Monitor your fatigue levels and stay alert</p>
          </div>
          <div className="current-status glass-panel">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <div>
                <span className={`status-indicator ${activeRideId && !isHistoricalView ? 'active' : ''}`}></span>
                {isHistoricalView ? 'Historical Route Archive' : (activeRideId ? 'Session Active' : 'System Standby')}
              </div>
              {activeRoute && (
                <div className="text-sm font-semibold text-secondary mt-1 whitespace-nowrap">
                  {activeRoute.start} <ArrowRight size={14} className="inline mx-1" /> {activeRoute.end}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="dashboard-stat-card glass-panel animate-slide-up">
            <div className="stat-header">
              <span className="stat-title">Total Monitoring Time</span>
              <Clock className="stat-icon text-primary" size={20} />
            </div>
            <div className="stat-value">14.2<span className="text-sm text-secondary">hrs</span></div>
            <p className="stat-trend text-success"><TrendingUp size={16} /> +2.4h this week</p>
          </div>
          <div className="dashboard-stat-card glass-panel animate-slide-up delay-100">
            <div className="stat-header">
              <span className="stat-title">Drowsy Events</span>
              <ShieldAlert className="stat-icon text-danger" size={20} />
            </div>
            <div className="stat-value">{fatigueEvents.length}</div>
            <p className="stat-trend text-danger"><TrendingUp size={16} /> Last 7 days</p>
          </div>
          <div className="dashboard-stat-card glass-panel animate-slide-up delay-200">
            <div className="stat-header">
              <span className="stat-title">Average Alertness</span>
              <Activity className="stat-icon text-success" size={20} />
            </div>
            <div className="stat-value">94%</div>
            <p className="stat-trend text-success"><TrendingUp size={16} /> +1% this week</p>
          </div>
          <div className="dashboard-stat-card glass-panel animate-slide-up delay-300">
            <div className="stat-header">
              <span className="stat-title">Miles Driven</span>
              <Activity className="stat-icon text-primary" size={20} />
            </div>
            <div className="stat-value">420<span className="text-sm text-secondary">mi</span></div>
            <p className="stat-trend text-primary"><Calendar size={16} /> This Month</p>
          </div>
        </div>

        {/* Compute derived map data */}
        {(() => {
          if (!activeRideId) {
            return (
              <div className="dashboard-main-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2rem', gap: '2rem' }}>
                <div className="card glass-panel flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: '450px', width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Activity size={56} className="text-secondary opacity-50 mb-4" />
                  <h2 className="text-3xl font-bold text-white mb-2 mt-4">Configure Your Route</h2>
                  <p className="text-secondary mb-8 max-w-md text-lg">Enter your driving destinations to initialize a secure telemetry session and launch the AI tracking engine.</p>

                  <div className="route-form-container">
                    <div className="mb-4">
                      <label className="route-label">Starting Destination</label>
                      <input
                        type="text"
                        className="form-input route-input"
                        placeholder="e.g. Kathmandu, Office"
                        value={startDest}
                        onChange={(e) => setStartDest(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="route-label">Ending Destination</label>
                      <input
                        type="text"
                        className="form-input route-input"
                        placeholder="e.g. Pokhara, Home"
                        value={endDest}
                        onChange={(e) => setEndDest(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    className="btn btn-primary flex items-center gap-2 px-8 py-3 text-lg transition-all"
                    onClick={handleStartNewRide}
                    disabled={!startDest.trim() || !endDest.trim()}
                    style={{ opacity: (!startDest.trim() || !endDest.trim()) ? 0.5 : 1 }}
                  >
                    <Activity size={24} /> Initialize Session
                  </button>
                </div>

                <div className="w-full" style={{ maxWidth: '800px', marginBottom: '4rem' }}>
                  <div className="flex justify-between items-center mb-4 px-2">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><History size={20} /> Recent Sessions</h3>
                    <Link to={`/history${queryDriver ? `?driver=${queryDriver}` : ''}`} className="text-primary hover:text-white transition-colors flex items-center gap-1 text-sm font-semibold">View All <ArrowRight size={14} /></Link>
                  </div>
                  {recentRides.length === 0 ? (
                    <div className="card glass-panel p-6 text-center text-secondary">
                      No previous sessions found. Start a new ride above!
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {recentRides.map(ride => (
                        <div key={ride._id} onClick={() => navigate(`/dashboard?ride_id=${ride._id}${queryDriver ? `&driver=${queryDriver}` : ''}`)} className="card glass-panel p-5 animate-slide-up hover:border-primary transition-all duration-300 cursor-pointer flex justify-between items-center">
                          <div>
                            <h4 className="text-lg font-bold text-white">
                              {ride.start_destination || "Unknown Origin"} <ArrowRight size={14} className="inline mx-2 text-secondary" /> {ride.end_destination || "Unknown Destination"}
                            </h4>
                            <p className="text-sm text-secondary mt-1"><Calendar size={14} className="inline mr-2" /> {ride.start_time}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-md font-bold text-danger"><ShieldAlert size={14} className="inline mb-1 mr-1" /> {ride.episodes ? ride.episodes.length : 0} Events</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          }

          const mapEvents = fatigueEvents.filter(ep => ep.location && ep.location.lat && ep.location.lng)
          const mapCenter = mapEvents.length > 0
            ? [mapEvents[0].location.lat, mapEvents[0].location.lng]
            : [27.7172, 85.3240]

          return (
            <div className={`dashboard-content mt-6 ${isHistoricalView ? 'history-mode' : ''}`}>
              {/* Main Action - Camera Feed */}
              {!isHistoricalView && (
                <div className="dashboard-main-section mb-6">
                  <CameraFeed rideId={activeRideId} onEndRide={handleEndRide} />
                </div>
              )}

              <div className={isHistoricalView ? "dashboard-full-section" : "dashboard-sidebar-section"}>
                {/* Trend Chart */}
                <div className="card glass-panel mb-6">
                  <div className="card-header">
                    <h2 className="card-title flex items-center gap-2">
                      <Activity className="text-primary" size={20} /> Level Trend
                    </h2>
                    <p className="card-description">Fatigue history over time</p>
                  </div>
                  <div className="card-content pt-4">
                    <div className="chart-placeholder glass-panel" style={{ position: 'relative' }}>
                      <div className="chart-line">
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
                          <polyline
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.4)"
                            strokeWidth="1.5"
                            vectorEffect="non-scaling-stroke"
                            points={dynamicChartData.map((p, i) => {
                              const x = dynamicChartData.length > 1 ? (i / (dynamicChartData.length - 1)) * 90 + 5 : 50;
                              const y = 100 - (p.level * 15 + 10);
                              return `${x},${y}`;
                            }).join(' ')}
                          />
                        </svg>
                        {dynamicChartData.map((point, index) => (
                          <div
                            key={index}
                            className="chart-point"
                            style={{
                              left: dynamicChartData.length > 1 ? `${(index / (dynamicChartData.length - 1)) * 90 + 5}%` : '50%',
                              bottom: `${point.level * 15 + 10}%`
                            }}
                          >
                            <div
                              className="point-dot pulse"
                              style={{
                                backgroundColor: point.level >= 5 ? 'var(--danger)' : point.level >= 3 ? 'var(--warning)' : point.level > 0 ? 'var(--success)' : 'var(--text-muted)',
                                boxShadow: point.level >= 5 ? '0 0 10px var(--danger)' : point.level >= 3 ? '0 0 10px var(--warning)' : point.level > 0 ? '0 0 10px var(--success)' : 'none'
                              }}
                            ></div>
                            <div className="point-label">{point.time}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Fatigue Map */}
                <div className="card glass-panel mb-6">
                  <div className="card-header">
                    <h2 className="card-title flex items-center gap-2">
                      <MapPin className="text-secondary" size={20} /> Global Incident Tracking
                    </h2>
                    <p className="card-description">Live mapping of all recorded fatigue stages</p>
                  </div>
                  <div className="card-content pt-4">
                    <div className="fatigue-map-container">
                      <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                          attribution='&copy; <a href="https://carto.com/">CartoDB</a> contributors'
                          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                        {mapEvents.map((event, idx) => (
                          <Marker key={idx} position={[event.location.lat, event.location.lng]} icon={customMarker}>
                            <Popup>
                              <strong className={event.severity === 'Major' ? 'text-danger' : event.severity === 'Intermediate' ? 'text-warning' : 'text-success'}>
                                {event.severity} Incident
                              </strong>
                              <br />
                              Time: {event.timestamp.split(" ")[1] || event.timestamp}<br />
                              Duration: {event.duration}
                            </Popup>
                          </Marker>
                        ))}
                      </MapContainer>
                    </div>
                  </div>
                </div>

                {/* Fatigue Events Timeline */}
                <div className="card glass-panel">
                  <div className="card-header">
                    <h2 className="card-title flex items-center gap-2">
                      <History className="text-warning" size={20} /> Incident Timeline
                    </h2>
                    <p className="card-description">Chronological history of your driving alerts</p>
                  </div>
                  <div className="card-content pt-4">
                    {fatigueEvents.length === 0 ? (
                      <div className="empty-state text-center p-6 text-secondary">
                        <ShieldAlert className="mx-auto mb-2 opacity-50" size={32} />
                        <p>No recent drowsiness events.</p>
                      </div>
                    ) : (
                      <div className="timeline-container">
                        {fatigueEvents.map((event, index) => (
                          <div key={event.id} className="timeline-item">
                            <div className="timeline-marker">
                              <div className={`timeline-dot ${event.severity === 'Major' ? 'bg-danger' : event.severity === 'Intermediate' ? 'bg-warning' : 'bg-success'}`}></div>
                              {index !== fatigueEvents.length - 1 && <div className="timeline-line"></div>}
                            </div>
                            <div className="timeline-content">
                              <div className="timeline-header">
                                <div>
                                  <p className="timeline-title">{event.type} <span className={`badge ${getSeverityClass(event.severity)} ml-2`}>{event.severity}</span></p>
                                  <p className="timeline-time">{event.timestamp.split(" ")[1] || event.timestamp} - {event.end ? event.end.split(" ")[1] : "Ongoing"}</p>
                                </div>
                                <p className="text-sm text-secondary mt-1">Duration: {event.duration}</p>
                              </div>

                              {/* Major Incident Rich Telemetry */}
                              {event.severity === "Major" && (event.imageUrl || event.location) && (
                                <div className="event-telemetry-panel glass-panel">
                                  <h4 className="telemetry-title">
                                    <ShieldAlert size={16} className="text-danger" /> Major Incident Telemetry
                                  </h4>
                                  <div className="telemetry-body">
                                    {event.imageUrl && (
                                      <div className="telemetry-snapshot" onClick={() => setSelectedImage(event.imageUrl)} style={{ cursor: 'pointer' }}>
                                        <div className="snapshot-hover-overlay">
                                          <ImageIcon size={24} className="text-white" />
                                        </div>
                                        <img src={event.imageUrl} alt="Fatigue Snapshot" className="snapshot-img" />
                                      </div>
                                    )}
                                    {event.location && (
                                      <div className="telemetry-location">
                                        <p className="location-label">
                                          <MapPin size={16} /> GPS Coordinates Captured:
                                        </p>
                                        <code className="location-box">
                                          {parseFloat(event.location.lat).toFixed(6)}, {parseFloat(event.location.lng).toFixed(6)}
                                        </code>
                                        <a
                                          href={`https://maps.google.com/?q=${event.location.lat},${event.location.lng}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="btn btn-outline btn-sm w-full flex-center gap-2"
                                        >
                                          View on Maps
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </main>

      {/* Fullscreen Image Overlay */}
      {selectedImage && (
        <div className="image-modal-overlay" onClick={() => setSelectedImage(null)}>
          <button className="modal-close-btn" onClick={() => setSelectedImage(null)}>
            <X size={24} />
          </button>
          <img src={selectedImage} alt="Expanded Snapshot" className="image-modal-content" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

export default DashboardPage