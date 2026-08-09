"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import Header from "./Header"
import CameraFeed from "../components/CameraFeed"
import BackendCameraFeed from "../components/BackendCameraFeed"
import "./DashboardPage.css"

const fatigueData = [
  { time: "09:00", level: 2 },
  { time: "10:00", level: 1 },
  { time: "11:00", level: 3 },
  { time: "12:00", level: 4 },
  { time: "13:00", level: 2 },
  { time: "14:00", level: 5 },
  { time: "15:00", level: 3 },
  { time: "16:00", level: 2 },
]

const fatigueEvents = [
  {
    id: 1,
    timestamp: "2024-01-22 14:30:15",
    severity: "High",
    duration: "45 seconds",
    type: "Drowsiness Detected",
  },
  {
    id: 2,
    timestamp: "2024-01-22 11:15:30",
    severity: "Medium",
    duration: "20 seconds",
    type: "Eye Closure",
  },
  {
    id: 3,
    timestamp: "2024-01-21 16:45:22",
    severity: "Low",
    duration: "10 seconds",
    type: "Yawning Detected",
  },
  {
    id: 4,
    timestamp: "2024-01-21 13:20:18",
    severity: "High",
    duration: "60 seconds",
    type: "Head Nodding",
  },
]

function DashboardPage() {
  const { user } = useAuth()
  const [showCamera, setShowCamera] = useState(false)

  const getSeverityClass = (severity) => {
    switch (severity) {
      case "High":
        return "badge-destructive"
      case "Medium":
        return "badge-default"
      case "Low":
        return "badge-secondary"
      default:
        return "badge-default"
    }
  }

  return (
    <div className="dashboard-page bg-gray-50 min-h-screen">
      <Header showNavigation={false} />

      <main className="container py-8">
        <div className="dashboard-header mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600">Monitor your fatigue levels and stay alert</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card card">
            <div className="card-header flex justify-between items-center">
              <h3 className="card-title text-sm font-medium">Today's Sessions</h3>
              <span className="stat-icon">🕐</span>
            </div>
            <div className="card-content">
              <div className="stat-value text-2xl font-bold">3</div>
              <p className="stat-change text-sm text-gray-600">+2 from yesterday</p>
            </div>
          </div>

          <div className="stat-card card">
            <div className="card-header flex justify-between items-center">
              <h3 className="card-title text-sm font-medium">Fatigue Events</h3>
              <span className="stat-icon">⚠️</span>
            </div>
            <div className="card-content">
              <div className="stat-value text-2xl font-bold">4</div>
              <p className="stat-change text-sm text-gray-600">-1 from yesterday</p>
            </div>
          </div>

          <div className="stat-card card">
            <div className="card-header flex justify-between items-center">
              <h3 className="card-title text-sm font-medium">Alert Score</h3>
              <span className="stat-icon">📈</span>
            </div>
            <div className="card-content">
              <div className="stat-value text-2xl font-bold">85%</div>
              <p className="stat-change text-sm text-gray-600">+5% from last week</p>
            </div>
          </div>

          <div className="stat-card card">
            <div className="card-header flex justify-between items-center">
              <h3 className="card-title text-sm font-medium">Monitoring Time</h3>
              <span className="stat-icon">👁️</span>
            </div>
            <div className="card-content">
              <div className="stat-value text-2xl font-bold">6.5h</div>
              <p className="stat-change text-sm text-gray-600">Today's total</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content grid lg:grid-cols-2 gap-8 mb-8">
          {/* Fatigue Level Chart */}
          <div className="chart-card card">
            <div className="card-header">
              <h2 className="card-title">Fatigue Level Trend</h2>
              <p className="card-description">Your fatigue levels throughout the day</p>
            </div>
            <div className="card-content">
              <div className="chart-placeholder">
                <div className="chart-line">
                  {fatigueData.map((point, index) => (
                    <div
                      key={index}
                      className="chart-point"
                      style={{ left: `${(index / (fatigueData.length - 1)) * 100}%`, bottom: `${point.level * 20}%` }}
                    >
                      <div className="point-dot"></div>
                      <div className="point-label">{point.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* User Profile */}
          <div className="profile-card card">
            <div className="card-header">
              <h2 className="card-title">Profile Information</h2>
              <p className="card-description">Your account details and preferences</p>
            </div>
            <div className="card-content">
              <div className="profile-info flex items-center gap-4 mb-4">
                <div className="avatar bg-blue-100 text-blue-600">{user?.name?.charAt(0)}</div>
                <div>
                  <h3 className="text-lg font-semibold">{user?.name}</h3>
                  <p className="text-gray-600">{user?.email}</p>
                  <span className="badge badge-outline mt-1">{user?.role === "admin" ? "Administrator" : "User"}</span>
                </div>
              </div>

              <div className="profile-stats grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-semibold">Jan 2024</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Sessions</p>
                  <p className="font-semibold">127</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Fatigue Events */}
        <div className="events-card card mb-8">
          <div className="card-header">
            <h2 className="card-title flex items-center gap-2">
              <span>📅</span>
              Recent Fatigue Events
            </h2>
            <p className="card-description">Your latest drowsiness and fatigue detection logs</p>
          </div>
          <div className="card-content">
            <div className="events-list space-y-4">
              {fatigueEvents.map((event) => (
                <div key={event.id} className="event-item flex items-center justify-between p-4 border rounded-lg">
                  <div className="event-info flex items-center gap-4">
                    <span className="event-icon">⚠️</span>
                    <div>
                      <p className="font-semibold">{event.type}</p>
                      <p className="text-sm text-gray-600">{event.timestamp}</p>
                    </div>
                  </div>
                  <div className="event-details flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-semibold">{event.duration}</p>
                    </div>
                    <span className={`badge ${getSeverityClass(event.severity)}`}>{event.severity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Camera Section */}
        <div className="camera-card card">
          <div className="card-header">
            <h2 className="card-title flex items-center gap-2">
              <span>📷</span>
              Live Monitoring
            </h2>
            <p className="card-description">Start real-time fatigue detection monitoring</p>
          </div>
          <div className="card-content">
            <div className="camera-controls space-y-4">
              <button onClick={() => setShowCamera(!showCamera)} className="btn btn-primary btn-lg w-full">
                <span>📷</span>
                {showCamera ? "Stop Monitoring" : "Start Monitoring"}
              </button>

              {showCamera && (
                <div className="camera-feed-container mt-6">
                  <BackendCameraFeed />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
