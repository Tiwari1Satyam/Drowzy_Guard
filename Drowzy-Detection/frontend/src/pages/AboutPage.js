import Header from "../components/Header"
import Footer from "../components/Footer"
import { Eye, Brain, BellRing, Shield, Clock, Users, ShieldAlert, Sparkles, TrendingDown } from "lucide-react"
import "./AboutPage.css"

function AboutPage() {
  const features = [
    {
      icon: <Eye size={28} className="text-primary" />,
      title: "Real-time Eye Tracking",
      description: "Advanced computer vision algorithms monitor eye movements, blink patterns, and gaze direction to detect early signs of fatigue.",
    },
    {
      icon: <Brain size={28} className="text-secondary" />,
      title: "AI-Powered Analysis",
      description: "Machine learning models trained on millions of frames to accurately identify drowsiness patterns and fatigue indicators.",
    },
    {
      icon: <BellRing size={28} className="text-danger" />,
      title: "Instant Alerts",
      description: "Immediate audio and visual warnings when fatigue is detected, jumping into action before accidents happen.",
    },
    {
      icon: <Shield size={28} className="text-success" />,
      title: "Safety First",
      description: "Designed with safety as the top priority, our system helps reduce fatigue-related accidents by up to 85%.",
    },
    {
      icon: <Clock size={28} className="text-warning" />,
      title: "24/7 Monitoring",
      description: "Continuous monitoring capabilities that work seamlessly across various lighting conditions, including night driving.",
    },
    {
      icon: <Users size={28} className="text-primary" />,
      title: "Multi-User Support",
      description: "Support for multiple drivers with personalized profiles, historical tracking, and fleet-management administrative reporting.",
    },
  ]

  return (
    <div className="about-page">
      <Header showNavigation={true} />

      <main className="container main-content animate-fade-in">
        <div className="about-content">
          {/* Hero Section */}
          <div className="about-hero text-center mb-16 animate-slide-up">
            <h1 className="about-title mb-6">
              Guardian of <span className="text-gradient">the Road</span>
            </h1>
            <p className="about-description mx-auto">
              Our cutting-edge fatigue detection system uses 
              advanced AI and computer vision technology to monitor driver alertness in real-time.
            </p>
          </div>

          {/* Mission Statement */}
          <div className="card glass-panel mb-16 animate-slide-up delay-100 mission-card">
            <div className="card-content">
              <div className="mission-icon">
                <Sparkles size={40} className="text-primary" />
              </div>
              <h2 className="mission-title">Our Mission</h2>
              <p className="mission-text">
                To eliminate driving tragedies by providing an intelligent, reliable, and user-friendly system that detects fatigue before it becomes dangerous. Technology should serve humanity, and our system acts as a guardian angel for drivers everywhere.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="features-grid mb-16">
            {features.map((feature, index) => (
              <div key={index} className="feature-card glass-panel animate-slide-up" style={{animationDelay: `${(index + 2) * 100}ms`}}>
                <div className="feature-icon-wrapper">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Statistics */}
          <div className="statistics-grid mb-16">
            <div className="stat-card glass-panel animate-slide-up delay-200">
              <ShieldAlert size={40} className="text-success mb-4" />
              <div className="stat-big-value text-success">99.5%</div>
              <p className="stat-label">Detection Accuracy</p>
            </div>
            <div className="stat-card glass-panel animate-slide-up delay-300">
              <TrendingDown size={40} className="text-primary mb-4" />
              <div className="stat-big-value text-primary">85%</div>
              <p className="stat-label">Accident Reduction</p>
            </div>
            <div className="stat-card glass-panel animate-slide-up delay-400">
              <Clock size={40} className="text-secondary mb-4" />
              <div className="stat-big-value text-secondary">24/7</div>
              <p className="stat-label">Continuous Operation</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default AboutPage
