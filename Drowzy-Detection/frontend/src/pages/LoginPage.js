import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import Header from "../components/Header"
import { Mail, Lock, User, CheckCircle, Eye, EyeOff, AlertCircle } from "lucide-react"
import "./LoginPage.css"
import config from "../config"

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")

  const { login, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin" : "/dashboard", { replace: true })
    }
  }, [user, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    try {
      const res = await fetch(`${config.BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Login failed")

      login(data.user)
      navigate(data.user.role === "admin" ? "/admin" : "/dashboard")
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")
    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match!")
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch(`${config.BACKEND_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: registerData.name,
          email: registerData.email,
          password: registerData.password,
          contactNumber: "0000000000",
          vehicleNumber: "TEST-001"
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Registration failed")

      const loginRes = await fetch(`${config.BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password,
        }),
      })
      const loginDataRes = await loginRes.json()
      if (!loginRes.ok) throw new Error(loginDataRes.error || "Login after registration failed")
      login(loginDataRes.user)
      navigate(loginDataRes.user.role === "admin" ? "/admin" : "/dashboard")
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <Header showNavigation={false} />

      <main className="container auth-container">
        <div className="auth-box glass-panel animate-slide-up">

          <div className="auth-header text-center">
            <h1 className="auth-title mt-4">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to access your fatigue detection dashboard</p>
          </div>

          <div className="auth-tabs">
            <button
              className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
            <button
              className={`auth-tab ${activeTab === "register" ? "active" : ""}`}
              onClick={() => setActiveTab("register")}
            >
              Register
            </button>
          </div>

          <div className="auth-content mt-6">
            {error && (
              <div className="auth-error animate-fade-in">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {activeTab === "login" && (
              <form onSubmit={handleLogin} className="auth-form animate-fade-in">
                <div className="form-group">
                  <label htmlFor="email" className="label">Email Address</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="input with-icon"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="label">Password</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="input with-icon pr-10"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full mt-4" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            )}

            {activeTab === "register" && (
              <form onSubmit={handleRegister} className="auth-form animate-fade-in">
                <div className="form-group">
                  <label htmlFor="name" className="label">Full Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={18} />
                    <input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      className="input with-icon"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reg-email" className="label">Email Address</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input
                      id="reg-email"
                      type="email"
                      placeholder="Enter your email"
                      className="input with-icon"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid-cols-2">
                  <div className="form-group">
                    <label htmlFor="reg-password" className="label">Password</label>
                    <div className="input-wrapper">
                      <Lock className="input-icon" size={18} />
                      <input
                        id="reg-password"
                        type="password"
                        placeholder="Create password"
                        className="input with-icon"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirm-password" className="label">Confirm</label>
                    <div className="input-wrapper">
                      <CheckCircle className="input-icon" size={18} />
                      <input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm password"
                        className="input with-icon"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full mt-4" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default LoginPage