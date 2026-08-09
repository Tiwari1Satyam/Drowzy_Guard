import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Drowzy Guard - Fatigue Detection & Alert System",
  description:
    "Advanced AI-powered system that monitors driver alertness in real-time, detecting signs of fatigue and drowsiness to prevent accidents.",
}

export default function RootLayout({ children }) {
  return React.createElement(
    "html",
    { lang: "en" },
    React.createElement("body", { className: inter.className }, React.createElement(AuthProvider, null, children)),
  )
}
