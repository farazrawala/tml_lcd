import { useEffect, useRef } from "react"

const DEFAULT_VIDEO = "/videos/TML_Global_Sales_Performance_Pro.mp4"

export function SlideVideo({ slide, onEnded }) {
  const videoRef = useRef(null)
  const src = slide.images?.[0] ? `/videos/${slide.images[0]}` : DEFAULT_VIDEO

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined
    video.currentTime = 0
    const play = video.play()
    if (play) play.catch(() => {
      video.muted = true
      video.play().catch(() => {})
    })
    return undefined
  }, [src])

  return (
    <section className="h-full w-full bg-black">
      <video
        ref={videoRef}
        src={src}
        className="h-full w-full object-cover"
        autoPlay
        playsInline
        onEnded={onEnded}
      />
    </section>
  )
}
