import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"
import { FullscreenControl } from "./FullscreenControl"
import { SlideProgress } from "./SlideProgress"

export function SlideControls({ index, total, paused, progress, onPrev, onNext, onTogglePause, onInteractStart, onInteractEnd }) {
  const label = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`
  return (
    <div className="absolute inset-x-0 bottom-0 z-30" onMouseEnter={onInteractStart} onMouseLeave={onInteractEnd} onFocus={onInteractStart} onBlur={onInteractEnd}>
      <SlideProgress progress={progress} />
      <div className="flex items-center justify-between bg-black/55 px-6 py-3 backdrop-blur-sm">
        <p className="font-heading text-[clamp(1rem,1.4vw,1.5rem)] font-bold tracking-[0.28em]">{label}</p>
        <div className="flex items-center gap-3">
          {paused && <span className="font-heading text-sm font-bold tracking-[0.25em] text-[#FF5722]">PAUSED</span>}
          <button type="button" aria-label="Previous slide" onClick={onPrev} className="flex size-12 items-center justify-center rounded-full border border-white/20 bg-black/50 hover:border-[#FF5722]"><ChevronLeft /></button>
          <button type="button" aria-label={paused ? "Resume slideshow" : "Pause slideshow"} onClick={onTogglePause} className="flex size-12 items-center justify-center rounded-full border border-white/20 bg-black/50 hover:border-[#FF5722]">{paused ? <Play /> : <Pause />}</button>
          <button type="button" aria-label="Next slide" onClick={onNext} className="flex size-12 items-center justify-center rounded-full border border-white/20 bg-black/50 hover:border-[#FF5722]"><ChevronRight /></button>
          <FullscreenControl />
        </div>
      </div>
    </div>
  )
}
