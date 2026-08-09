"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { CameraFeed } from "@/components/camera-feed"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { AlertTriangle, Clock, Eye, TrendingUp, Calendar, Camera } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import React from "react"

const fatigueData = [
  { time: "09:00", level: 2 },
  { time: "10:00", level: 1 },
  { time: "11:00", level: 3 },
  { time: "12:00", level: 4 },
  { time: "13:00", level: 2 },
  { time: "14:00", level: 5 },
  { time: "15:00", level: 3 },
  { time: "16:00", level: 2 },
]

const fatigueEvents = [
  {
    id: 1,
    timestamp: "2024-01-22 14:30:15",
    severity: "High",
    duration: "45 seconds",
    type: "Drowsiness Detected",
  },
  {
    id: 2,
    timestamp: "2024-01-22 11:15:30",
    severity: "Medium",
    duration: "20 seconds",
    type: "Eye Closure",
  },
  {
    id: 3,
    timestamp: "2024-01-21 16:45:22",
    severity: "Low",
    duration: "10 seconds",
    type: "Yawning Detected",
  },
  {
    id: 4,
    timestamp: "2024-01-21 13:20:18",
    severity: "High",
    duration: "60 seconds",
    type: "Head Nodding",
  },
]

export default function UserDashboard() {
  const { user } = useAuth()
  const [showCamera, setShowCamera] = useState(false)

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "High":
        return "destructive"
      case "Medium":
        return "default"
      case "Low":
        return "secondary"
      default:
        return "default"
    }
  }

  return React.createElement(
    "div",
    { className: "min-h-screen bg-gray-50" },
    React.createElement(Header, { showNavigation: false }),
    React.createElement(
      "main",
      { className: "container mx-auto px-4 py-8" },
      React.createElement(
        "div",
        { className: "mb-8" },
        React.createElement(
          "h1",
          { className: "text-3xl font-bold text-gray-900 mb-2" },
          `Welcome back, ${user?.name}!`,
        ),
        React.createElement("p", { className: "text-gray-600" }, "Monitor your fatigue levels and stay alert"),
      ),
      // Stats Cards
      React.createElement(
        "div",
        { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" },
        React.createElement(
          Card,
          null,
          React.createElement(
            CardHeader,
            { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
            React.createElement(CardTitle, { className: "text-sm font-medium" }, "Today's Sessions"),
            React.createElement(Clock, { className: "h-4 w-4 text-muted-foreground" }),
          ),
          React.createElement(
            CardContent,
            null,
            React.createElement("div", { className: "text-2xl font-bold" }, "3"),
            React.createElement("p", { className: "text-xs text-muted-foreground" }, "+2 from yesterday"),
          ),
        ),
        React.createElement(
          Card,
          null,
          React.createElement(
            CardHeader,
            { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
            React.createElement(CardTitle, { className: "text-sm font-medium" }, "Fatigue Events"),
            React.createElement(AlertTriangle, { className: "h-4 w-4 text-muted-foreground" }),
          ),
          React.createElement(
            CardContent,
            null,
            React.createElement("div", { className: "text-2xl font-bold" }, "4"),
            React.createElement("p", { className: "text-xs text-muted-foreground" }, "-1 from yesterday"),
          ),
        ),
        React.createElement(
          Card,
          null,
          React.createElement(
            CardHeader,
            { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
            React.createElement(CardTitle, { className: "text-sm font-medium" }, "Alert Score"),
            React.createElement(TrendingUp, { className: "h-4 w-4 text-muted-foreground" }),
          ),
          React.createElement(
            CardContent,
            null,
            React.createElement("div", { className: "text-2xl font-bold" }, "85%"),
            React.createElement("p", { className: "text-xs text-muted-foreground" }, "+5% from last week"),
          ),
        ),
        React.createElement(
          Card,
          null,
          React.createElement(
            CardHeader,
            { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
            React.createElement(CardTitle, { className: "text-sm font-medium" }, "Monitoring Time"),
            React.createElement(Eye, { className: "h-4 w-4 text-muted-foreground" }),
          ),
          React.createElement(
            CardContent,
            null,
            React.createElement("div", { className: "text-2xl font-bold" }, "6.5h"),
            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Today's total"),
          ),
        ),
      ),
      React.createElement(
        "div",
        { className: "grid lg:grid-cols-2 gap-8 mb-8" },
        // Fatigue Level Chart
        React.createElement(
          Card,
          null,
          React.createElement(
            CardHeader,
            null,
            React.createElement(CardTitle, null, "Fatigue Level Trend"),
            React.createElement(CardDescription, null, "Your fatigue levels throughout the day"),
          ),
          React.createElement(
            CardContent,
            null,
            React.createElement(
              ResponsiveContainer,
              { width: "100%", height: 300 },
              React.createElement(
                LineChart,
                { data: fatigueData },
                React.createElement(CartesianGrid, { strokeDasharray: "3 3" }),
                React.createElement(XAxis, { dataKey: "time" }),
                React.createElement(YAxis, { domain: [0, 5] }),
                React.createElement(Tooltip),
                React.createElement(Line, {
                  type: "monotone",
                  dataKey: "level",
                  stroke: "#3b82f6",
                  strokeWidth: 2,
                  dot: { fill: "#3b82f6" },
                }),
              ),
            ),
          ),
        ),
        // User Profile
        React.createElement(
          Card,
          null,
          React.createElement(
            CardHeader,
            null,
            React.createElement(CardTitle, null, "Profile Information"),
            React.createElement(CardDescription, null, "Your account details and preferences"),
          ),
          React.createElement(
            CardContent,
            { className: "space-y-4" },
            React.createElement(
              "div",
              { className: "flex items-center space-x-4" },
              React.createElement(
                "div",
                { className: "w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center" },
                React.createElement("span", { className: "text-2xl font-bold text-blue-600" }, user?.name?.charAt(0)),
              ),
              React.createElement(
                "div",
                null,
                React.createElement("h3", { className: "text-lg font-semibold" }, user?.name),
                React.createElement("p", { className: "text-gray-600" }, user?.email),
                React.createElement(
                  Badge,
                  { variant: "outline", className: "mt-1" },
                  user?.role === "admin" ? "Administrator" : "User",
                ),
              ),
            ),
            React.createElement(
              "div",
              { className: "grid grid-cols-2 gap-4 pt-4" },
              React.createElement(
                "div",
                null,
                React.createElement("p", { className: "text-sm text-gray-600" }, "Member Since"),
                React.createElement("p", { className: "font-semibold" }, "Jan 2024"),
              ),
              React.createElement(
                "div",
                null,
                React.createElement("p", { className: "text-sm text-gray-600" }, "Total Sessions"),
                React.createElement("p", { className: "font-semibold" }, "127"),
              ),
            ),
          ),
        ),
      ),
      // Recent Fatigue Events
      React.createElement(
        Card,
        { className: "mb-8" },
        React.createElement(
          CardHeader,
          null,
          React.createElement(
            CardTitle,
            { className: "flex items-center gap-2" },
            React.createElement(Calendar, { className: "w-5 h-5" }),
            "Recent Fatigue Events",
          ),
          React.createElement(CardDescription, null, "Your latest drowsiness and fatigue detection logs"),
        ),
        React.createElement(
          CardContent,
          null,
          React.createElement(
            "div",
            { className: "space-y-4" },
            ...fatigueEvents.map((event) =>
              React.createElement(
                "div",
                { key: event.id, className: "flex items-center justify-between p-4 border rounded-lg" },
                React.createElement(
                  "div",
                  { className: "flex items-center space-x-4" },
                  React.createElement(AlertTriangle, { className: "w-5 h-5 text-orange-500" }),
                  React.createElement(
                    "div",
                    null,
                    React.createElement("p", { className: "font-semibold" }, event.type),
                    React.createElement("p", { className: "text-sm text-gray-600" }, event.timestamp),
                  ),
                ),
                React.createElement(
                  "div",
                  { className: "flex items-center space-x-4" },
                  React.createElement(
                    "div",
                    { className: "text-right" },
                    React.createElement("p", { className: "text-sm text-gray-600" }, "Duration"),
                    React.createElement("p", { className: "font-semibold" }, event.duration),
                  ),
                  React.createElement(Badge, { variant: getSeverityColor(event.severity) }, event.severity),
                ),
              ),
            ),
          ),
        ),
      ),
      // Camera Section
      React.createElement(
        Card,
        null,
        React.createElement(
          CardHeader,
          null,
          React.createElement(
            CardTitle,
            { className: "flex items-center gap-2" },
            React.createElement(Camera, { className: "w-5 h-5" }),
            "Live Monitoring",
          ),
          React.createElement(CardDescription, null, "Start real-time fatigue detection monitoring"),
        ),
        React.createElement(
          CardContent,
          null,
          React.createElement(
            "div",
            { className: "space-y-4" },
            React.createElement(
              Button,
              { onClick: () => setShowCamera(!showCamera), className: "w-full", size: "lg" },
              React.createElement(Camera, { className: "w-5 h-5 mr-2" }),
              showCamera ? "Stop Monitoring" : "Start Monitoring",
            ),
            showCamera && React.createElement("div", { className: "mt-6" }, React.createElement(CameraFeed)),
          ),
        ),
      ),
    ),
  )
}
