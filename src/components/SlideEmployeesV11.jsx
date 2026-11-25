import { BarChart3, CalendarDays, TrendingUp, Trophy } from "lucide-react"
import { isZeroAchieved, money, slideImageUrl } from "../lib/slides"

const THEMES = [
  { border: "border-red-500", glow: "shadow-[0_0_22px_rgba(239,68,68,0.35)]", bar: "#ef4444", ring: "from-red-500 to-red-600" },
  { border: "border-orange-400/80", glow: "shadow-[0_0_22px_rgba(251,146,60,0.24)]", bar: "#fb923c", ring: "from-orange-300 to-amber-500" },
  { border: "border-green-500", glow: "shadow-[0_0_22px_rgba(34,197,94,0.35)]", bar: "#22c55e", ring: "from-green-400 to-green-600" },
]

function numberOf(value) {
  const amount = Number(String(value ?? "").replace(/[$,]/g, ""))
  return Number.isFinite(amount) ? amount : 0
}

function ratio(achieved, target) {
  if (target <= 0) return 0
  return Math.max(0, Math.min(100, (achieved / target) * 100))
}

function statsOf(person) {
  const rows = [
    ["Monthly", CalendarDays, numberOf(person.monthlyTarget ?? person.target), numberOf(person.monthlyAchieved), person.monthlyTarget || person.target, person.monthlyAchieved],
    ["Quarterly", Trophy, numberOf(person.quarterlyTarget ?? person.quarterly), numberOf(person.quarterlyAchieved ?? person.achieved), person.quarterlyTarget || person.quarterly, person.quarterlyAchieved ?? person.achieved],
    ["Yearly", TrendingUp, numberOf(person.yearlyTarget), numberOf(person.yearlyAchieved), person.yearlyTarget, person.yearlyAchieved],
  ]
  const totalTarget = rows.reduce((sum, row) => sum + row[2], 0)
  const totalAchieved = rows.reduce((sum, row) => sum + row[3], 0)
  return { rows, totalTarget, totalAchieved, percent: ratio(totalAchieved, totalTarget) }
}

function Ring({ percent, color }) {
  const radius = 16
  const length = 2 * Math.PI * radius
  const filled = (percent / 100) * length
  return (
    <svg viewBox="0 0 42 42" className="size-[clamp(2.3rem,5.4vh,3.4rem)] shrink-0 -rotate-90">
      <circle cx="21" cy="21" r={radius} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="4.5" />
      <circle cx="21" cy="21" r={radius} fill="none" stroke={color} strokeWidth="4.5" strokeLinecap="round" strokeDasharray={`${filled} ${length}`} />
    </svg>
  )
}

function DuckEgg() {
  return (
    <span className="relative inline-block h-[clamp(1.5rem,3vh,2.2rem)] w-[4.6rem] overflow-hidden align-bottom">
      <img src="/egg-broken.gif?v=6" alt="Achieved is zero" className="duck-egg absolute bottom-0 left-1/2 h-[clamp(1.15rem,2.6vh,1.7rem)] w-auto -translate-x-1/2" />
      <span className="duck-walk absolute bottom-0 text-[clamp(1.15rem,2.4vh,1.7rem)] leading-none" aria-hidden="true">🦆</span>
    </span>
  )
}

function Amount({ value, egg, className }) {
  if (egg && isZeroAchieved(value)) return <DuckEgg />
  return <p className={className}>{money(value)}</p>
}

function Card({ person, theme }) {
  const stats = statsOf(person)
  return (
    <article className={`flex h-full min-h-0 flex-col rounded-[1.5rem] border-2 bg-[#0c1730]/95 px-[0.9vw] py-[1vh] ${theme.border} ${theme.glow}`}>
      <div className="flex flex-col items-center">
        <div className={`relative mt-[3.2vh] rounded-full bg-gradient-to-b p-[3px] ${theme.ring}`}>
          <img src={person.image ? slideImageUrl(person.image) : "/default-employee.png"} alt={person.name || "Employee"} className="size-[clamp(7.5rem,20vh,11.5rem)] rounded-full bg-[#0b1220] object-cover" />
          <span className="absolute right-0 bottom-0.5 size-3 rounded-full border-2 border-[#0c1730] bg-emerald-400" />
        </div>
        <h3 className="font-heading mt-1 w-full truncate text-center text-[clamp(1rem,1.45vw,1.55rem)] font-extrabold tracking-wide uppercase">{person.name || "Employee"}</h3>
        <p className="text-[clamp(0.5rem,0.6vw,0.68rem)] font-semibold tracking-[0.28em] text-white/55">PERFORMANCE SUMMARY</p>
      </div>
      <div className="mt-[0.8vh] flex min-h-0 flex-1 flex-col justify-center gap-[0.7vh]">
        {stats.rows.map(([label, Icon, targetNumber, achievedNumber, target, achieved]) => (
          <div key={label}>
            <p className="flex items-center gap-1.5 text-[clamp(0.55rem,0.68vw,0.78rem)] font-bold tracking-[0.16em] text-white/80">
              <Icon className="size-[clamp(0.8rem,1vw,1rem)]" /> {label}
            </p>
            <div className="mt-0.5 flex items-end justify-between gap-3">
              <div>
                <p className="text-[clamp(0.48rem,0.55vw,0.62rem)] tracking-[0.14em] text-white/40">TARGET</p>
                <p className="font-heading text-[clamp(0.95rem,1.25vw,1.4rem)] leading-none font-extrabold text-[#ff9a3c]">{money(target)}</p>
              </div>
              <div className="text-right">
                <p className="text-[clamp(0.48rem,0.55vw,0.62rem)] tracking-[0.14em] text-white/40">ACHIEVED</p>
                <Amount value={achieved} egg className="font-heading text-[clamp(0.95rem,1.25vw,1.4rem)] leading-none font-extrabold text-emerald-400" />
              </div>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full" style={{ width: `${ratio(achievedNumber, targetNumber)}%`, background: theme.bar }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-[0.8vh] grid grid-cols-[1.2fr_auto] items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-3 py-[0.7vh]">
        <div>
          <p className="text-[clamp(0.48rem,0.58vw,0.68rem)] font-bold tracking-[0.12em] text-white/50">TOTAL ACHIEVED AMOUNT</p>
          <Amount value={stats.totalAchieved} egg className="font-heading text-[clamp(1.3rem,1.9vw,2.2rem)] leading-none font-extrabold" />
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-[clamp(0.48rem,0.58vw,0.68rem)] font-bold tracking-[0.12em] text-white/50">OVERALL PROGRESS<br />PERCENTAGE</p>
            <p className="font-heading text-[clamp(1rem,1.4vw,1.5rem)] leading-none font-extrabold">{stats.percent.toFixed(1)}%</p>
          </div>
          <Ring percent={stats.percent} color={theme.bar} />
        </div>
      </div>
    </article>
  )
}

export function SlideEmployeesV11({ slide }) {
  const people = (slide.employees || []).filter((person) => person.name || person.image || person.monthlyTarget || person.target || person.quarterlyTarget || person.yearlyTarget)
  return (
    <section className="relative flex h-full w-full flex-col overflow-hidden bg-[#07111f] px-[1.4vw] pt-[0.7vh] pb-[2vh]">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[18vh] bg-gradient-to-t from-orange-500/25 to-transparent" />
      <header className="relative z-10 grid shrink-0 grid-cols-[auto_1fr_auto] items-center">
        <img src="/tml-logo.svg" alt="TML Global" className="h-[clamp(4.5rem,12vh,8rem)] w-auto" />
        <div className="text-center">
          <h2 className="font-heading my-[5vh] text-[clamp(1.25rem,2.5vw,2.7rem)] leading-none font-extrabold tracking-wide">EMPLOYEES PERFORMANCE</h2>
        </div>
        <div className="grid size-[clamp(2.1rem,4.6vh,3.1rem)] place-items-center rounded-xl border border-orange-400/30 bg-black/30">
          <BarChart3 className="size-[58%] text-orange-400" />
        </div>
      </header>
      {!people.length && <p className="relative z-10 m-auto text-2xl text-white/70">Add employees in the slide manager.</p>}
      {!!people.length && (
        <div className="relative z-10 mt-[0.8vh] grid min-h-0 flex-1 grid-cols-3 gap-[1vw]">
          {people.slice(0, 3).map((person, index) => <Card key={`${person.name}-${index}`} person={person} theme={THEMES[index % 3]} />)}
        </div>
      )}
    </section>
  )
}
