import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import Header from "../components/Header"
import { Calendar, Clock, ShieldAlert, History, ArrowRight } from "lucide-react"
import config from "../config"

function RideHistoryPage() {
  const { user } = useAuth()
  const location = useLocation()
  const queryDriver = new URLSearchParams(location.search).get('driver')
  const targetUsername = queryDriver || user?.name
  const navigate = useNavigate()
  const [rides, setRides] = useState([])

  useEffect(() => {
    if (!targetUsername) return
    async function fetchRides() {
      try {
        const res = await fetch(`${config.BACKEND_URL}/get_all_rides?username=${encodeURIComponent(targetUsername)}`)
        if (res.ok) {
          const data = await res.json()
          setRides(data.rides || [])
        }
      } catch (e) {
        console.error("Failed to fetch history:", e)
      }
    }
    fetchRides()
  }, [targetUsername])

  return (
    <div className="dashboard-page">
      <Header showNavigation={true} />
      <main className="container main-content animate-fade-in">
        {queryDriver && (
          <div className="bg-warning text-black font-bold p-3 text-center text-sm w-full rounded-lg shadow-lg mb-6 flex items-center justify-center gap-2 max-w-[800px] mx-auto">
            <ShieldAlert size={18} /> ADMINISTRATOR SURVEILLANCE: Viewing Historical Logs for '{queryDriver}'
          </div>
        )}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Ride History</h1>
            <p className="dashboard-subtitle">Review all your previous secure telemetry sessions</p>
          </div>
        </div>

        <div className="dashboard-sidebar-section" style={{ marginTop: '2rem' }}>
          {rides.length === 0 ? (
            <div className="card glass-panel flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: '200px' }}>
              <History className="text-secondary opacity-50 mb-4" size={48} />
              <h3 className="text-xl font-bold text-white mb-2">No historical rides</h3>
              <p className="text-secondary">Start a ride from the dashboard to log events.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {rides.map(ride => (
                <div
                  key={ride._id}
                  className="card glass-panel p-6 animate-slide-up hover:border-primary transition-all duration-300 cursor-pointer"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onClick={() => navigate(`/dashboard?ride_id=${ride._id}${queryDriver ? `&driver=${queryDriver}` : ''}`)}
                >
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-white">
                      {ride.start_destination || "Unknown Origin"} <ArrowRight size={16} className="inline mx-2 text-secondary" /> {ride.end_destination || "Unknown Destination"}
                    </h3>
                    <p className="text-secondary mt-1"><Calendar size={16} className="inline mr-2" /> Start: {ride.start_time}</p>
                    <p className="text-secondary mt-1"><Clock size={16} className="inline mr-2" /> End: {ride.end_time || 'Ongoing'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-danger"><ShieldAlert size={16} className="inline mb-1 mr-1" /> {ride.episodes ? ride.episodes.length : 0} Events</p>
                    <div className="mt-2 flex items-center justify-end gap-3">
                      <span className={`badge ${ride.status === 'active' ? 'badge-success' : 'badge-default'}`}>
                        {ride.status.toUpperCase()}
                      </span>
                      <ArrowRight className="text-secondary" size={20} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default RideHistoryPage