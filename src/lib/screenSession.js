import { useEffect } from "react"
import { useLocation } from "react-router-dom"

function browserLabel() {
  const ua = navigator.userAgent
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser"
  const os = /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "Mac" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Linux/.test(ua) ? "Linux" : ""
  return os ? `${browser} on ${os}` : browser
}

export function ScreenSession() {
  const location = useLocation()

  useEffect(() => {
    const key = "lcd-screen"
    let id = sessionStorage.getItem(key)
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem(key, id)
    }
    const startedKey = "lcd-screen-started"
    let started = Number(sessionStorage.getItem(startedKey))
    if (!started) {
      started = Date.now()
      sessionStorage.setItem(startedKey, String(started))
    }
    const slides = location.pathname === "/" || location.pathname === "/lcd-display"
    const url = slides ? `${window.location.origin}/` : `${window.location.origin}${location.pathname}`
    let stopped = false
    const beat = () => {
      fetch("/api/screens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          path: location.pathname,
          url,
          browser: browserLabel(),
          started,
          screen: `${window.screen.width}×${window.screen.height}`,
          viewport: `${window.innerWidth}×${window.innerHeight}`,
        }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (!stopped && json?.reload) window.location.reload()
        })
        .catch(() => {})
    }
    beat()
    const timer = window.setInterval(beat, 4000)
    return () => {
      stopped = true
      window.clearInterval(timer)
    }
  }, [location.pathname])

  return null
}
