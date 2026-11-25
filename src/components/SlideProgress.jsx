export function SlideProgress({ progress }) {
  return (
    <div className="h-1.5 w-full bg-white/10" aria-hidden="true">
      <div className="h-full bg-gradient-to-r from-[#F35938] to-[#FF6E24]" style={{ width: `${Math.min(100, progress * 100)}%` }} />
    </div>
  )
}
