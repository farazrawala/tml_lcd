import { useEffect, useState } from "react"
import { Maximize, Minimize } from "lucide-react"

export function FullscreenControl() {
  const [active, setActive] = useState(Boolean(document.fullscreenElement))

  useEffect(() => {
    const sync = () => setActive(Boolean(document.fullscreenElement))
    document.addEventListener("fullscreenchange", sync)
    return () => document.removeEventListener("fullscreenchange", sync)
  }, [])

  async function toggle() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch {
      setActive(Boolean(document.fullscreenElement))
    }
  }

  const Icon = active ? Minimize : Maximize
  return (
    <button type="button" onClick={toggle} aria-label={active ? "Exit fullscreen" : "Enter fullscreen"} className="flex size-12 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white hover:border-[#FF5722] hover:text-[#FF5722]">
      <Icon className="size-5" />
    </button>
  )
}
