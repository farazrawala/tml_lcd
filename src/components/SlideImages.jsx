import { useEffect, useState } from "react"
import { slideImageUrl } from "../lib/slides"

export function SlideImages({ images, imageMs = 4000, className = "", alt = "" }) {
  const sources = (images || []).map(slideImageUrl).filter(Boolean)
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    setFrame(0)
    if (sources.length < 2) return undefined
    const timer = window.setInterval(() => setFrame((value) => (value + 1) % sources.length), imageMs)
    return () => window.clearInterval(timer)
  }, [sources.join("|"), imageMs])

  if (!sources.length) return null

  return (
    <div className={`absolute inset-0 ${className}`}>
      {sources.map((src, index) => (
        <img
          key={src}
          src={src}
          alt={index === frame ? alt : ""}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === frame ? "opacity-100" : "opacity-0"}`}
        />
      ))}
    </div>
  )
}
