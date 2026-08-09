import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Brain, AlertTriangle, Shield, Clock, Users } from "lucide-react"
import React from "react"

export default function AboutPage() {
  const features = [
    {
      icon: Eye,
      title: "Real-time Eye Tracking",
      description:
        "Advanced computer vision algorithms monitor eye movements, blink patterns, and gaze direction to detect early signs of fatigue.",
    },
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description:
        "Machine learning models trained on thousands of hours of data to accurately identify drowsiness patterns and fatigue indicators.",
    },
    {
      icon: AlertTriangle,
      title: "Instant Alerts",
      description:
        "Immediate audio and visual warnings when fatigue is detected, helping prevent accidents before they happen.",
    },
    {
      icon: Shield,
      title: "Safety First",
      description:
        "Designed with safety as the top priority, our system helps reduce fatigue-related accidents by up to 85%.",
    },
    {
      icon: Clock,
      title: "24/7 Monitoring",
      description: "Continuous monitoring capabilities that work in various lighting conditions and environments.",
    },
    {
      icon: Users,
      title: "Multi-User Support",
      description: "Support for multiple users with personalized profiles and detailed fatigue history tracking.",
    },
  ]

  return React.createElement(
    "div",
    { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" },
    React.createElement(Header, { showNavigation: false }),
    React.createElement(
      "main",
      { className: "container mx-auto px-4 py-12" },
      React.createElement(
        "div",
        { className: "max-w-4xl mx-auto" },
        // Hero Section
        React.createElement(
          "div",
          { className: "text-center mb-16" },
          React.createElement(
            "h1",
            { className: "text-4xl font-bold text-gray-900 mb-6" },
            "About Our Fatigue Detection System",
          ),
          React.createElement(
            "p",
            { className: "text-xl text-gray-600 leading-relaxed" },
            "Our cutting-edge fatigue detection and alert system uses advanced AI and computer vision technology to monitor driver alertness in real-time, helping prevent accidents caused by drowsiness and fatigue.",
          ),
        ),
        // Mission Statement
        React.createElement(
          Card,
          { className: "mb-12 border-blue-200 bg-blue-50" },
          React.createElement(
            CardHeader,
            null,
            React.createElement(CardTitle, { className: "text-2xl text-blue-900" }, "Our Mission"),
          ),
          React.createElement(
            CardContent,
            null,
            React.createElement(
              "p",
              { className: "text-blue-800 text-lg leading-relaxed" },
              "To save lives by providing an intelligent, reliable, and user-friendly system that detects fatigue and drowsiness before they lead to accidents. We believe that technology should serve humanity, and our system is designed to be a guardian angel for drivers everywhere.",
            ),
          ),
        ),
        // Features Grid
        React.createElement(
          "div",
          { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12" },
          ...features.map((feature, index) =>
            React.createElement(
              Card,
              { key: index, className: "hover:shadow-lg transition-shadow" },
              React.createElement(
                CardHeader,
                null,
                React.createElement(feature.icon, { className: "w-10 h-10 text-blue-600 mb-2" }),
                React.createElement(CardTitle, { className: "text-lg" }, feature.title),
              ),
              React.createElement(
                CardContent,
                null,
                React.createElement("p", { className: "text-gray-600" }, feature.description),
              ),
            ),
          ),
        ),
        // How It Works
        React.createElement(
          Card,
          { className: "mb-12" },
          React.createElement(
            CardHeader,
            null,
            React.createElement(CardTitle, { className: "text-2xl" }, "How It Works"),
          ),
          React.createElement(
            CardContent,
            { className: "space-y-4" },
            React.createElement(
              "div",
              { className: "grid md:grid-cols-3 gap-6" },
              React.createElement(
                "div",
                { className: "text-center" },
                React.createElement(
                  "div",
                  {
                    className:
                      "w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold",
                  },
                  "1",
                ),
                React.createElement("h3", { className: "font-semibold mb-2" }, "Camera Monitoring"),
                React.createElement(
                  "p",
                  { className: "text-gray-600" },
                  "The system uses your device's camera to continuously monitor your face and eyes.",
                ),
              ),
              React.createElement(
                "div",
                { className: "text-center" },
                React.createElement(
                  "div",
                  {
                    className:
                      "w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold",
                  },
                  "2",
                ),
                React.createElement("h3", { className: "font-semibold mb-2" }, "AI Analysis"),
                React.createElement(
                  "p",
                  { className: "text-gray-600" },
                  "Advanced algorithms analyze facial features, eye movements, and blink patterns.",
                ),
              ),
              React.createElement(
                "div",
                { className: "text-center" },
                React.createElement(
                  "div",
                  {
                    className:
                      "w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold",
                  },
                  "3",
                ),
                React.createElement("h3", { className: "font-semibold mb-2" }, "Instant Alerts"),
                React.createElement(
                  "p",
                  { className: "text-gray-600" },
                  "When fatigue is detected, the system immediately alerts you with audio and visual warnings.",
                ),
              ),
            ),
          ),
        ),
        // Statistics
        React.createElement(
          "div",
          { className: "grid md:grid-cols-3 gap-6" },
          React.createElement(
            Card,
            { className: "text-center border-green-200 bg-green-50" },
            React.createElement(
              CardContent,
              { className: "p-6" },
              React.createElement("div", { className: "text-3xl font-bold text-green-600 mb-2" }, "99.5%"),
              React.createElement("p", { className: "text-green-800" }, "Detection Accuracy"),
            ),
          ),
          React.createElement(
            Card,
            { className: "text-center border-blue-200 bg-blue-50" },
            React.createElement(
              CardContent,
              { className: "p-6" },
              React.createElement("div", { className: "text-3xl font-bold text-blue-600 mb-2" }, "85%"),
              React.createElement("p", { className: "text-blue-800" }, "Accident Reduction"),
            ),
          ),
          React.createElement(
            Card,
            { className: "text-center border-purple-200 bg-purple-50" },
            React.createElement(
              CardContent,
              { className: "p-6" },
              React.createElement("div", { className: "text-3xl font-bold text-purple-600 mb-2" }, "24/7"),
              React.createElement("p", { className: "text-purple-800" }, "Continuous Monitoring"),
            ),
          ),
        ),
      ),
    ),
    React.createElement(Footer),
  )
}
