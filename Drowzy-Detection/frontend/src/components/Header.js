import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Eye, Home, Info, User, LayoutDashboard, Settings, LogOut } from "lucide-react"
import "./Header.css"

function Header({ showNavigation = false }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showDropdown, setShowDropdown] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate("/")
    setShowDropdown(false)
  }

  const isActive = (path) => location.pathname === path

  return (
    <header className={`header ${scrolled ? "glass-panel scrolled" : ""}`}>
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <div className="logo-icon-wrapper">
              <Eye className="logo-icon" size={28} />
            </div>
            <span className="logo-text text-gradient">Drowzy Guard</span>
          </Link>

          {/* Navigation */}
          {showNavigation && (
            <nav className="navigation hidden md:flex">
              <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                <Home size={18} />
                <span>Home</span>
              </Link>
              <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>
                <Info size={18} />
                <span>About</span>
              </Link>
            </nav>
          )}

          {/* User Menu or Login Button */}
          <div className="user-section">
            {user ? (
              <div className="user-menu">
                <button
                  className="user-button"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="avatar">{user.name?.charAt(0) || 'U'}</div>
                </button>

                {showDropdown && (
                  <div className="dropdown-menu glass-panel animate-slide-up">
                    <div className="dropdown-header">
                      <div className="user-info">
                        <p className="user-name">{user.name}</p>
                        <p className="user-email">{user.email}</p>
                      </div>
                    </div>
                    <div className="dropdown-separator"></div>
                    <Link
                      to={user.role === "admin" ? "/admin" : "/dashboard"}
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      <LayoutDashboard size={16} />
                      <span>Dashboard</span>
                    </Link>
                    <button className="dropdown-item">
                      <Settings size={16} />
                      <span>Settings</span>
                    </button>
                    <div className="dropdown-separator"></div>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <LogOut size={16} />
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <button className="btn btn-primary">Login</button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
