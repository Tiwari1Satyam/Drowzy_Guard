import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import Header from "../components/Header"
import { Users, ShieldCheck, AlertTriangle, TrendingUp, Search, Eye, MapPin, Clock, Image as ImageIcon, UserPlus, Edit2, Key, X, AlertCircle } from "lucide-react"
import "./AdminPage.css"
import config from "../config"

function AdminPage() {
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [userData, setUserData] = useState([])
  const [todaysAlerts, setTodaysAlerts] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)

  // Modals state
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const [showEditName, setShowEditName] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Form states
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" })
  const [formError, setFormError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchUsers = () => {
    fetch(`${config.BACKEND_URL}/get_all_users`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUserData(data)
      })
      .catch(e => console.error(e))
  }

  useEffect(() => {
    fetchUsers()

    fetch(`${config.BACKEND_URL}/get_todays_alerts`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTodaysAlerts(data)
      })
      .catch(e => console.error(e))
  }, [])

  const filteredUsers = userData.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    setFormError("")
    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match")
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch(`${config.BACKEND_URL}/create_admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.name,
          email: formData.email,
          password: formData.password
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create admin")
      setShowCreateAdmin(false)
      setFormData({ name: "", email: "", password: "", confirmPassword: "" })
      fetchUsers()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateName = async (e) => {
    e.preventDefault()
    setFormError("")
    setIsSubmitting(true)
    try {
      const res = await fetch(`${config.BACKEND_URL}/users/${selectedUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: formData.name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update name")
      setShowEditName(false)
      fetchUsers()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setFormError("")
    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match")
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch(`${config.BACKEND_URL}/users/${selectedUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: formData.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to reset password")
      setShowResetPassword(false)
      setFormData({ name: "", email: "", password: "", confirmPassword: "" })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusClass = (status) => status === "Active" ? "badge-success" : "badge-secondary"
  const getAlertScoreClass = (score) => {
    if (score >= 90) return "text-success"
    if (score >= 80) return "text-warning"
    return "text-danger"
  }

  return (
    <div className="admin-page">
      <Header showNavigation={false} />

      <main className="container main-content animate-fade-in">
        <div className="admin-header flex-col md:flex-row gap-4">
          <div>
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">Monitor and manage drivers and fatigue incidents across the network.</p>
          </div>
          <div className="admin-actions">
            <button className="btn btn-primary action-btn" onClick={() => { setShowCreateAdmin(true); setFormError("") }}>
              <UserPlus size={18} />
              Create Admin
            </button>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card glass-panel animate-slide-up">
            <div className="stat-header">
              <span className="stat-title">Total Users</span>
              <Users className="stat-icon text-primary" size={20} />
            </div>
            <div className="stat-value">{userData.length}</div>
            <p className="stat-trend text-primary">Fleet Scale</p>
          </div>

          <div className="admin-stat-card glass-panel animate-slide-up delay-100">
            <div className="stat-header">
              <span className="stat-title">Active Drivers</span>
              <ShieldCheck className="stat-icon text-success" size={20} />
            </div>
            <div className="stat-value">
              {userData.filter((u) => u.status === "Active").length}
            </div>
            <p className="stat-trend text-success">Recently Monitored</p>
          </div>

          <div className="admin-stat-card glass-panel animate-slide-up delay-200">
            <div className="stat-header">
              <span className="stat-title">Critical Alerts Today</span>
              <AlertTriangle className="stat-icon text-danger" size={20} />
            </div>
            <div className="stat-value text-danger">
              {todaysAlerts.length}
            </div>
            <p className="stat-trend text-danger">Major Severity</p>
          </div>

          <div className="admin-stat-card glass-panel animate-slide-up delay-300">
            <div className="stat-header">
              <span className="stat-title">Avg Fleet Alertness</span>
              <TrendingUp className="stat-icon text-primary" size={20} />
            </div>
            <div className="stat-value">
              {userData.length > 0 ? Math.round(userData.reduce((sum, user) => sum + user.alertScore, 0) / userData.length) : 0}%
            </div>
            <p className="stat-trend text-primary">Network Stability</p>
          </div>
        </div>

        {/* Today's Critical Alerts */}
        <div className="card glass-panel mt-6 animate-slide-up delay-100">
          <div className="card-header border-b border-glass pb-4">
            <h2 className="card-title text-danger flex items-center gap-2"><AlertTriangle size={20} /> Today's Critical Alerts</h2>
            <p className="card-description">Real-time major severity tracking across the fleet</p>
          </div>
          <div className="card-content pt-4 overflow-x-auto">
            {todaysAlerts.length === 0 ? (
              <div className="text-secondary text-center py-8">No major incidents detected today across the fleet.</div>
            ) : (
              <div className="flex gap-4 pb-4" style={{ overflowX: 'auto' }}>
                {todaysAlerts.map((alert, idx) => (
                  <div key={idx} className="glass-panel p-4 outline outline-1 outline-danger" style={{ minWidth: '280px', borderRadius: '1rem' }}>
                    {alert.image_url ? (
                      <img src={`${config.BACKEND_URL}${alert.image_url}`} alt="Event" className="w-full h-32 object-cover rounded-md mb-3 border border-glass cursor-pointer hover:border-danger transition-all" onClick={() => setSelectedImage(`${config.BACKEND_URL}${alert.image_url}`)} />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center bg-black bg-opacity-40 rounded-md mb-3 text-secondary"><ImageIcon size={32} /></div>
                    )}
                    <h4 className="font-bold text-white mb-1">Driver: {alert.username}</h4>
                    <div className="text-sm text-secondary flex items-center gap-1 mb-1"><MapPin size={14} /> {alert.location?.lat.toFixed(4) || "N/A"}, {alert.location?.lng.toFixed(4) || "N/A"}</div>
                    <div className="text-sm text-secondary flex items-center gap-1 mb-3"><Clock size={14} /> {alert.start} ({alert.duration})</div>
                    <button onClick={() => navigate(`/dashboard?ride_id=${alert.ride_id}&driver=${alert.username}`)} className="btn btn-sm btn-outline btn-block text-danger border-danger hover:bg-danger hover:text-white transition-colors">
                      View Ride Session <Eye size={14} className="ml-1 inline" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="card glass-panel mt-6 animate-slide-up delay-400">
          <div className="card-header flex-col md:flex-row border-b border-glass pb-4">
            <div>
              <h2 className="card-title flex items-center gap-2">
                <Users className="text-primary" size={20} />
                User Management
              </h2>
              <p className="card-description">Manage users and view their statistics</p>
            </div>
            <div className="search-box mt-4 md:mt-0">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input with-icon search-input"
              />
            </div>
          </div>
          <div className="card-content pt-4 overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Driver Details</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Alertness</th>
                  <th>Last Session</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id || u._id} className="table-row hover-bg">
                    <td>
                      <div className="driver-info">
                        <div className="driver-avatar">{(u.name || (u.username || "U")).charAt(0)}</div>
                        <div>
                          <div className="driver-name">{u.name || u.username}</div>
                          <div className="driver-email">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>{u.role || 'user'}</span></td>
                    <td>
                      <span className={`badge ${getStatusClass(u.status)}`}>{u.status}</span>
                    </td>
                    <td>
                      <span className={`font-bold ${getAlertScoreClass(u.alertScore)}`}>
                        {u.alertScore}%
                      </span>
                    </td>
                    <td className="text-secondary text-sm">{u.lastSession}</td>
                    <td>
                      <div className="btn-group">
                        <button onClick={() => navigate(`/history?driver=${u.username}`)} className="btn btn-outline btn-sm action-btn" title="View History">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => { setSelectedUser(u); setFormData({ name: u.name || u.username }); setShowEditName(true); setFormError("") }} className="btn btn-outline btn-sm action-btn" title="Edit Name">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => { setSelectedUser(u); setFormData({ password: "", confirmPassword: "" }); setShowResetPassword(true); setFormError("") }} className="btn btn-outline btn-sm action-btn" title="Reset Password">
                          <Key size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="empty-table text-center py-8 text-secondary">
                No users matched your search.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {showCreateAdmin && (
        <div className="modal-overlay" onClick={() => setShowCreateAdmin(false)}>
          <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Admin</h2>
              <button className="close-btn" onClick={() => setShowCreateAdmin(false)}><X size={20} /></button>
            </div>
            {formError && <div className="form-error"><AlertCircle size={16} /> {formError}</div>}
            <form onSubmit={handleCreateAdmin}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input type="text" className="input" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input type="email" className="input" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Password</label>
                <input type="password" minLength={6} className="input" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <input type="password" minLength={6} className="input" required value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateAdmin(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Admin"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditName && (
        <div className="modal-overlay" onClick={() => setShowEditName(false)}>
          <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit User Name</h2>
              <button className="close-btn" onClick={() => setShowEditName(false)}><X size={20} /></button>
            </div>
            {formError && <div className="form-error"><AlertCircle size={16} /> {formError}</div>}
            <form onSubmit={handleUpdateName}>
              <div className="input-group">
                <label className="input-label">New Full Name</label>
                <input type="text" className="input" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowEditName(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? "Updating..." : "Update Name"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResetPassword && (
        <div className="modal-overlay" onClick={() => setShowResetPassword(false)}>
          <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Reset Password</h2>
              <button className="close-btn" onClick={() => setShowResetPassword(false)}><X size={20} /></button>
            </div>
            <p className="text-secondary mb-4">Resetting password for <strong>{selectedUser?.name || selectedUser?.username}</strong></p>
            {formError && <div className="form-error"><AlertCircle size={16} /> {formError}</div>}
            <form onSubmit={handleResetPassword}>
              <div className="input-group">
                <label className="input-label">New Password</label>
                <input type="password" minLength={6} className="input" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Confirm New Password</label>
                <input type="password" minLength={6} className="input" required value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowResetPassword(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? "Resetting..." : "Reset Password"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="image-modal-overlay" onClick={() => setSelectedImage(null)} style={{ zIndex: 9999 }}>
          <button className="modal-close-btn" onClick={() => setSelectedImage(null)}>✕</button>
          <img src={selectedImage} alt="Event Fullscreen" className="image-modal-content" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

export default AdminPage