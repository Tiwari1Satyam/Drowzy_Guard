"use client"

import { useState } from "react"
import { Camera, Play, Users, Shield, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { CameraFeed } from "@/components/camera-feed"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import React from "react"

export default function HomePage() {
  const { user } = useAuth()
  const [showCamera, setShowCamera] = useState(false)

  return React.createElement(
    "div",
    { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" },
    React.createElement(Header, { showNavigation: true }),
    React.createElement(
      "main",
      { className: "container mx-auto px-4 py-8" },
      React.createElement(
        "div",
        { className: "grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]" },
        // Left side - Image
        React.createElement(
          "div",
          { className: "relative" },
          React.createElement(
            "div",
            { className: "aspect-square rounded-2xl overflow-hidden shadow-2xl" },
            React.createElement("img", {
              src: "/placeholder.svg?height=600&width=600",
              alt: "Fatigue Detection System",
              className: "w-full h-full object-cover",
            }),
          ),
          React.createElement(
            "div",
            { className: "absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg" },
            React.createElement(
              "div",
              { className: "flex items-center gap-2 text-green-600" },
              React.createElement(Eye, { className: "w-5 h-5" }),
              React.createElement("span", { className: "font-semibold" }, "Real-time Monitoring"),
            ),
          ),
        ),
        // Right side - Title and Content
        React.createElement(
          "div",
          { className: "space-y-8" },
          React.createElement(
            "div",
            { className: "space-y-4" },
            React.createElement(
              "h1",
              { className: "text-5xl font-bold text-gray-900 leading-tight" },
              "Fatigue Detection &",
              React.createElement("span", { className: "text-blue-600" }, " Alert System"),
            ),
            React.createElement(
              "p",
              { className: "text-xl text-gray-600 leading-relaxed" },
              "Advanced AI-powered system that monitors driver alertness in real-time, detecting signs of fatigue and drowsiness to prevent accidents and save lives.",
            ),
          ),
          React.createElement(
            "div",
            { className: "grid grid-cols-2 gap-4" },
            React.createElement(
              Card,
              { className: "border-blue-200 bg-blue-50" },
              React.createElement(
                CardContent,
                { className: "p-4 text-center" },
                React.createElement(Shield, { className: "w-8 h-8 text-blue-600 mx-auto mb-2" }),
                React.createElement("p", { className: "font-semibold text-blue-900" }, "99.5% Accuracy"),
              ),
            ),
            React.createElement(
              Card,
              { className: "border-green-200 bg-green-50" },
              React.createElement(
                CardContent,
                { className: "p-4 text-center" },
                React.createElement(Users, { className: "w-8 h-8 text-green-600 mx-auto mb-2" }),
                React.createElement("p", { className: "font-semibold text-green-900" }, "24/7 Monitoring"),
              ),
            ),
          ),
          React.createElement(
            "div",
            { className: "space-y-4" },
            React.createElement(
              Button,
              {
                onClick: () => setShowCamera(!showCamera),
                size: "lg",
                className: "w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg",
              },
              React.createElement(Camera, { className: "w-6 h-6 mr-2" }),
              showCamera ? "Stop Camera" : "Start Fatigue Detection",
            ),
            React.createElement(
              "div",
              { className: "flex gap-4" },
              React.createElement(
                Link,
                { href: "/about", className: "flex-1" },
                React.createElement(
                  Button,
                  { variant: "outline", size: "lg", className: "w-full py-4 bg-transparent" },
                  React.createElement(Play, { className: "w-5 h-5 mr-2" }),
                  "Learn More",
                ),
              ),
              user &&
                React.createElement(
                  Link,
                  { href: user.role === "admin" ? "/admin" : "/dashboard", className: "flex-1" },
                  React.createElement(
                    Button,
                    { variant: "outline", size: "lg", className: "w-full py-4 bg-transparent" },
                    "Go to Dashboard",
                  ),
                ),
            ),
          ),
        ),
      ),
      // Camera Feed
      showCamera && React.createElement("div", { className: "mt-12" }, React.createElement(CameraFeed)),
    ),
    React.createElement(Footer),
  )
}
