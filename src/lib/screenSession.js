import { useEffect } from "react"
import { useLocation } from "react-router-dom"

export function ScreenSession() {
  const location = useLocation()

  useEffect(() => {
    const key = "lcd-screen"
    let id = sessionStorage.getItem(key)
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem(key, id)
    }
    let stopped = false
    const beat = () => {
      fetch("/api/screens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, path: location.pathname }),
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
