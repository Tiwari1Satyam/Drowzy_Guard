"use client"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import "./Footer.css"

function Footer() {
  const { user } = useAuth()

  if (user) return null // Don't show footer if user is logged in

  return (
    <footer className="footer bg-white border-t">
      <div className="container py-6">
        <div className="footer-content flex flex-col md:flex-row items-center justify-between">
          <div className="footer-text text-center md:text-left mb-4 md:mb-0">
            <p className="text-gray-600">Ready to start monitoring your fatigue levels?</p>
          </div>
          <Link to="/login">
            <button className="btn btn-primary btn-lg">Get Started - Login</button>
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
