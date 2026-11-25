import { isZeroAchieved, money, periodsOf } from "../lib/slides"

function Amount({ value, className, egg }) {
  if (!String(value ?? "").trim()) return <p className={className}>—</p>
  if (egg && isZeroAchieved(value)) {
    return <img src="/egg-broken.gif?v=6" alt="Achieved is zero" className="mx-auto h-[clamp(1.3rem,3vh,2.2rem)] w-auto" />
  }
  return <p className={className}>{money(value)}</p>
}

export function EmployeeFigures({ person, className = "" }) {
  return (
    <div className={`grid w-full grid-cols-3 gap-2 ${className}`}>
      {periodsOf(person).map(([label, target, achieved]) => (
        <div key={label} className="min-w-0 rounded-2xl bg-black/45 px-2 py-2 text-center">
          <p className="text-[clamp(0.6rem,0.75vw,0.85rem)] font-bold tracking-[0.14em] text-white/50 uppercase">{label}</p>
          <p className="mt-1 text-[clamp(0.55rem,0.65vw,0.72rem)] tracking-[0.12em] text-white/40">TARGET</p>
          <Amount value={target} className="font-heading text-[clamp(0.9rem,1.25vw,1.45rem)] leading-none font-extrabold text-[#FF5722]" />
          <p className="mt-1 text-[clamp(0.55rem,0.65vw,0.72rem)] tracking-[0.12em] text-white/40">ACHIEVED</p>
          <Amount value={achieved} egg className="font-heading text-[clamp(0.9rem,1.25vw,1.45rem)] leading-none font-extrabold text-emerald-400" />
        </div>
      ))}
    </div>
  )
}
