import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { ArrowRight } from "lucide-react"
import "./Footer.css"

function Footer() {
  const { user } = useAuth()

  if (user) return null

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content glass-panel">
          <div className="footer-text">
            <h3 className="footer-title">Ready to start monitoring?</h3>
            <p className="footer-description">Secure your drive with state-of-the-art AI fatigue detection.</p>
          </div>
          <Link to="/login">
            <button className="btn btn-primary btn-lg">
              <span>Get Started Now</span>
              <ArrowRight size={20} />
            </button>
          </Link>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Drowzy Guard. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
