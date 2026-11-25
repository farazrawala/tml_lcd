import { useEffect, useState } from "react"

export function VehicleImage({ src, alt, priority = false, className = "" }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [src])
  const image = !src || failed ? "/vehicle-fallback.svg" : src
  return (
    <img
      src={image}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      className={`h-full w-full object-cover ${className}`}
    />
  )
}
