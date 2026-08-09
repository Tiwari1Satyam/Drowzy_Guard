import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { Shield, Eye, Activity, Play, ChevronRight, Camera, Focus, AlertTriangle, History } from "lucide-react"
import "./HomePage.css"

function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="home-page min-h-screen">
      <Header showNavigation={true} />

      <main className="container main-content">
        <div className="hero-section">
          
          {/* Left side - Title and Content */}
          <div className="hero-content animate-slide-up">
            <h1 className="hero-title">
              Detect Driver <span className="text-gradient">Fatigue</span> <br />in Real-Time
            </h1>
            <p className="hero-description text-secondary">
              Our advanced AI-powered system monitors driver alertness precisely, 
              detecting signs of drowsiness to prevent accidents and save lives.
            </p>

            <div className="stats-grid">
              <div className="stat-card glass-panel flex-center">
                <Shield className="stat-icon" size={32} />
                <p className="stat-text">99.5% Accuracy</p>
              </div>
              <div className="stat-card glass-panel flex-center">
                <Activity className="stat-icon" size={32} />
                <p className="stat-text">24/7 Monitoring</p>
              </div>
            </div>

            <div className="action-buttons">
              <button 
                onClick={() => navigate(user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login')} 
                className="btn btn-primary btn-lg action-btn"
              >
                <Camera size={20} />
                Start Live Detection
              </button>

              <div className="secondary-buttons">
                <Link to="/about" className="link-wrapper">
                  <button className="btn btn-secondary btn-lg btn-block">
                    <Play size={20} />
                    <span>Learn More</span>
                  </button>
                </Link>
                {user && (
                  <Link to={user.role === "admin" ? "/admin" : "/dashboard"} className="link-wrapper">
                    <button className="btn btn-outline btn-lg btn-block">
                      <span>Dashboard</span>
                      <ChevronRight size={20} />
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Right side - 3D Globe Visuals */}
          <div className="hero-visual animate-fade-in delay-200" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="globe-container">
              <div className="hollow-globe">
                <div className="globe-ring"></div>
                <div className="globe-ring"></div>
                <div className="globe-ring"></div>
                <div className="globe-ring"></div>
                <div className="globe-ring-horiz horiz-1"></div>
                <div className="globe-ring-horiz horiz-2"></div>
                <div className="globe-ring-horiz horiz-3"></div>
              </div>
              <div className="glow-effect globe-glow"></div>
              <div className="status-badge glass-panel" style={{ zIndex: 20 }}>
                <div className="status-badge-inner">
                  <div className="pulse-dot"></div>
                  <Activity className="text-primary" size={20} />
                  <span>Real-time AI Vision Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Extender / Features Section */}
        <section className="features-section">
          <div className="text-center animate-slide-up">
            <h2 className="hero-title" style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>Why Drowzy Guard?</h2>
            <p className="hero-description text-secondary" style={{margin: '0 auto'}}>Powered by cutting-edge neural networks to ensure comprehensive driver safety.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card glass-panel animate-slide-up delay-100">
              <div className="icon-wrapper bg-primary-10">
                <Focus size={32} className="text-primary" />
              </div>
              <h3 className="stat-text mt-4">Precision Eye Tracking</h3>
              <p className="text-secondary mt-2 leading-relaxed">
                Monitors Eye Aspect Ratio (EAR) and pupil dynamics with true 99.5% accuracy to instantly catch microsleeps.
              </p>
            </div>
            <div className="feature-card glass-panel animate-slide-up delay-200">
              <div className="icon-wrapper bg-warning-10">
                <AlertTriangle size={32} className="text-warning" />
              </div>
              <h3 className="stat-text mt-4">Zero-Latency Alarms</h3>
              <p className="text-secondary mt-2 leading-relaxed">
                Triggers acoustic stimuli the exact millisecond driver fatigue breaches safe operational thresholds.
              </p>
            </div>
            <div className="feature-card glass-panel animate-slide-up delay-300">
              <div className="icon-wrapper bg-success-10">
                <History size={32} className="text-success" />
              </div>
              <h3 className="stat-text mt-4">Automated Logging</h3>
              <p className="text-secondary mt-2 leading-relaxed">
                Securely syncs all documented drowsy episodes to your personalized dashboard for detailed trend analysis.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default HomePage
