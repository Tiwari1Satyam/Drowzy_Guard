"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/hooks/use-auth"
import { Users, AlertTriangle, TrendingUp, Shield, Search, Eye, Clock } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import React from "react"

const userData = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    status: "Active",
    fatigueEvents: 12,
    lastSession: "2024-01-22 15:30",
    alertScore: 85,
    totalSessions: 45,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    status: "Active",
    fatigueEvents: 8,
    lastSession: "2024-01-22 14:15",
    alertScore: 92,
    totalSessions: 38,
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    status: "Inactive",
    fatigueEvents: 15,
    lastSession: "2024-01-21 16:45",
    alertScore: 78,
    totalSessions: 52,
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah@example.com",
    status: "Active",
    fatigueEvents: 6,
    lastSession: "2024-01-22 13:20",
    alertScore: 95,
    totalSessions: 29,
  },
]

const fatigueByUser = [
  { name: "John Doe", events: 12 },
  { name: "Jane Smith", events: 8 },
  { name: "Mike Johnson", events: 15 },
  { name: "Sarah Wilson", events: 6 },
]

const severityData = [
  { name: "Low", value: 45, color: "#10b981" },
  { name: "Medium", value: 30, color: "#f59e0b" },
  { name: "High", value: 25, color: "#ef4444" },
]

export default function AdminDashboard() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredUsers = userData.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status) => {
    return status === "Active" ? "default" : "secondary"
  }

  const getAlertScoreColor = (score) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-yellow-600"
    return "text-red-600"
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
        React.createElement("h1", { className: "text-3xl font-bold text-gray-900 mb-2" }, "Admin Dashboard"),
        React.createElement(
          "p",
          { className: "text-gray-600" },
          "Monitor and manage all users and their fatigue detection data",
        ),
      ),
      // Admin Stats
      React.createElement(
        "div",
        { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" },
        React.createElement(
          Card,
          null,
          React.createElement(
            CardHeader,
            { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
            React.createElement(CardTitle, { className: "text-sm font-medium" }, "Total Users"),
            React.createElement(Users, { className: "h-4 w-4 text-muted-foreground" }),
          ),
          React.createElement(
            CardContent,
            null,
            React.createElement("div", { className: "text-2xl font-bold" }, userData.length.toString()),
            React.createElement("p", { className: "text-xs text-muted-foreground" }, "+2 new this week"),
          ),
        ),
        React.createElement(
          Card,
          null,
          React.createElement(
            CardHeader,
            { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
            React.createElement(CardTitle, { className: "text-sm font-medium" }, "Active Users"),
            React.createElement(Shield, { className: "h-4 w-4 text-muted-foreground" }),
          ),
          React.createElement(
            CardContent,
            null,
            React.createElement(
              "div",
              { className: "text-2xl font-bold" },
              userData.filter((u) => u.status === "Active").length.toString(),
            ),
            React.createElement("p", { className: "text-xs text-muted-foreground" }, "75% of total users"),
          ),
        ),
        React.createElement(
          Card,
          null,
          React.createElement(
            CardHeader,
            { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
            React.createElement(CardTitle, { className: "text-sm font-medium" }, "Total Events"),
            React.createElement(AlertTriangle, { className: "h-4 w-4 text-muted-foreground" }),
          ),
          React.createElement(
            CardContent,
            null,
            React.createElement(
              "div",
              { className: "text-2xl font-bold" },
              userData.reduce((sum, user) => sum + user.fatigueEvents, 0).toString(),
            ),
            React.createElement("p", { className: "text-xs text-muted-foreground" }, "This month"),
          ),
        ),
        React.createElement(
          Card,
          null,
          React.createElement(
            CardHeader,
            { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
            React.createElement(CardTitle, { className: "text-sm font-medium" }, "Avg Alert Score"),
            React.createElement(TrendingUp, { className: "h-4 w-4 text-muted-foreground" }),
          ),
          React.createElement(
            CardContent,
            null,
            React.createElement(
              "div",
              { className: "text-2xl font-bold" },
              `${Math.round(userData.reduce((sum, user) => sum + user.alertScore, 0) / userData.length)}%`,
            ),
            React.createElement("p", { className: "text-xs text-muted-foreground" }, "+3% from last month"),
          ),
        ),
      ),
      React.createElement(
        "div",
        { className: "grid lg:grid-cols-2 gap-8 mb-8" },
        // Fatigue Events by User
        React.createElement(
          Card,
          null,
          React.createElement(
            CardHeader,
            null,
            React.createElement(CardTitle, null, "Fatigue Events by User"),
            React.createElement(CardDescription, null, "Number of fatigue events detected per user"),
          ),
          React.createElement(
            CardContent,
            null,
            React.createElement(
              ResponsiveContainer,
              { width: "100%", height: 300 },
              React.createElement(
                BarChart,
                { data: fatigueByUser },
                React.createElement(CartesianGrid, { strokeDasharray: "3 3" }),
                React.createElement(XAxis, { dataKey: "name" }),
                React.createElement(YAxis),
                React.createElement(Tooltip),
                React.createElement(Bar, { dataKey: "events", fill: "#3b82f6" }),
              ),
            ),
          ),
        ),
        // Severity Distribution
        React.createElement(
          Card,
          null,
          React.createElement(
            CardHeader,
            null,
            React.createElement(CardTitle, null, "Event Severity Distribution"),
            React.createElement(CardDescription, null, "Breakdown of fatigue events by severity level"),
          ),
          React.createElement(
            CardContent,
            null,
            React.createElement(
              ResponsiveContainer,
              { width: "100%", height: 300 },
              React.createElement(
                PieChart,
                null,
                React.createElement(
                  Pie,
                  {
                    data: severityData,
                    cx: "50%",
                    cy: "50%",
                    labelLine: false,
                    label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`,
                    outerRadius: 80,
                    fill: "#8884d8",
                    dataKey: "value",
                  },
                  ...severityData.map((entry, index) =>
                    React.createElement(Cell, { key: `cell-${index}`, fill: entry.color }),
                  ),
                ),
                React.createElement(Tooltip),
              ),
            ),
          ),
        ),
      ),
      // Users Table
      React.createElement(
        Card,
        null,
        React.createElement(
          CardHeader,
          null,
          React.createElement(
            CardTitle,
            { className: "flex items-center gap-2" },
            React.createElement(Users, { className: "w-5 h-5" }),
            "User Management",
          ),
          React.createElement(CardDescription, null, "Manage users and view their fatigue detection statistics"),
          React.createElement(
            "div",
            { className: "flex items-center space-x-2" },
            React.createElement(Search, { className: "w-4 h-4 text-gray-400" }),
            React.createElement(Input, {
              placeholder: "Search users...",
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value),
              className: "max-w-sm",
            }),
          ),
        ),
        React.createElement(
          CardContent,
          null,
          React.createElement(
            Table,
            null,
            React.createElement(
              TableHeader,
              null,
              React.createElement(
                TableRow,
                null,
                React.createElement(TableHead, null, "User"),
                React.createElement(TableHead, null, "Status"),
                React.createElement(TableHead, null, "Fatigue Events"),
                React.createElement(TableHead, null, "Alert Score"),
                React.createElement(TableHead, null, "Total Sessions"),
                React.createElement(TableHead, null, "Last Session"),
                React.createElement(TableHead, null, "Actions"),
              ),
            ),
            React.createElement(
              TableBody,
              null,
              ...filteredUsers.map((user) =>
                React.createElement(
                  TableRow,
                  { key: user.id },
                  React.createElement(
                    TableCell,
                    null,
                    React.createElement(
                      "div",
                      null,
                      React.createElement("div", { className: "font-medium" }, user.name),
                      React.createElement("div", { className: "text-sm text-gray-600" }, user.email),
                    ),
                  ),
                  React.createElement(
                    TableCell,
                    null,
                    React.createElement(Badge, { variant: getStatusColor(user.status) }, user.status),
                  ),
                  React.createElement(
                    TableCell,
                    null,
                    React.createElement(
                      "div",
                      { className: "flex items-center gap-2" },
                      React.createElement(AlertTriangle, { className: "w-4 h-4 text-orange-500" }),
                      user.fatigueEvents.toString(),
                    ),
                  ),
                  React.createElement(
                    TableCell,
                    null,
                    React.createElement(
                      "span",
                      { className: `font-semibold ${getAlertScoreColor(user.alertScore)}` },
                      `${user.alertScore}%`,
                    ),
                  ),
                  React.createElement(
                    TableCell,
                    null,
                    React.createElement(
                      "div",
                      { className: "flex items-center gap-2" },
                      React.createElement(Clock, { className: "w-4 h-4 text-blue-500" }),
                      user.totalSessions.toString(),
                    ),
                  ),
                  React.createElement(TableCell, { className: "text-sm text-gray-600" }, user.lastSession),
                  React.createElement(
                    TableCell,
                    null,
                    React.createElement(
                      Button,
                      { variant: "outline", size: "sm" },
                      React.createElement(Eye, { className: "w-4 h-4 mr-1" }),
                      "View Details",
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  )
}
