"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import "./Header.css"

function Header({ showNavigation = false }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/")
    setShowDropdown(false)
  }

  return (
    <header className="header bg-white shadow-sm border-b">
      <div className="container">
        <div className="header-content flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="logo flex items-center gap-2">
            <span className="logo-icon">👁️</span>
            <span className="logo-text text-xl font-bold text-gray-900">Drowzy Guard</span>
          </Link>

          {/* Navigation (only on home page) */}
          {showNavigation && (
            <nav className="navigation hidden md:flex items-center gap-8">
              <Link to="/" className="nav-link text-gray-600 hover:text-blue-600 transition-colors">
                <span className="nav-icon">🏠</span>
                Home
              </Link>
              <Link to="/about" className="nav-link text-gray-600 hover:text-blue-600 transition-colors">
                <span className="nav-icon">ℹ️</span>
                About
              </Link>
            </nav>
          )}

          {/* User Menu or Login Button */}
          <div className="user-section flex items-center gap-4">
            {user ? (
              <div className="user-menu relative">
                <button
                  className="user-button btn btn-outline rounded-full"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="avatar bg-blue-100 text-blue-600">{user.name?.charAt(0)}</div>
                </button>

                {showDropdown && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header p-2">
                      <div className="user-info">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="dropdown-separator"></div>
                    <Link
                      to={user.role === "admin" ? "/admin" : "/dashboard"}
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      <span>👤</span>
                      Dashboard
                    </Link>
                    <button className="dropdown-item w-full text-left">
                      <span>⚙️</span>
                      Settings
                    </button>
                    <div className="dropdown-separator"></div>
                    <button className="dropdown-item w-full text-left" onClick={handleLogout}>
                      <span>🚪</span>
                      Log out
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
