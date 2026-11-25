import { BarChart3, CalendarDays, TrendingUp, Trophy } from "lucide-react"
import { isZeroAchieved, money, slideImageUrl } from "../lib/slides"

const THEMES = [
  {
    card: "from-[#123a86] via-[#0c245c] to-[#07122e]",
    border: "border-sky-400/40",
    ring: "from-cyan-300 to-sky-500",
    bar: "from-emerald-400 to-green-600",
    progress: "#34d399",
  },
  {
    card: "from-[#d06a1c] via-[#8d3d0e] to-[#2a160c]",
    border: "border-orange-300/50",
    ring: "from-lime-300 to-emerald-400",
    bar: "from-orange-400 to-amber-600",
    progress: "#fb923c",
  },
  {
    card: "from-[#6d28a8] via-[#42146e] to-[#1a0b2e]",
    border: "border-fuchsia-300/45",
    ring: "from-fuchsia-300 to-violet-500",
    bar: "from-fuchsia-400 to-violet-600",
    progress: "#e879f9",
  },
]

function numberOf(value) {
  const amount = Number(String(value ?? "").replace(/[$,]/g, ""))
  return Number.isFinite(amount) ? amount : 0
}

function figures(person) {
  const monthly = numberOf(person.monthlyTarget ?? person.target)
  const quarterly = numberOf(person.quarterlyTarget ?? person.quarterly)
  const yearly = numberOf(person.yearlyTarget)
  const totalTarget = monthly + quarterly + yearly
  const totalAchieved = numberOf(person.monthlyAchieved) + numberOf(person.quarterlyAchieved ?? person.achieved) + numberOf(person.yearlyAchieved)
  const percent = totalTarget > 0 ? Math.min(100, (totalAchieved / totalTarget) * 100) : 0
  return { monthly, quarterly, yearly, totalTarget, totalAchieved, percent }
}

function Ring({ percent, color }) {
  const radius = 15
  const length = 2 * Math.PI * radius
  const filled = (Math.max(0, Math.min(100, percent)) / 100) * length
  return (
    <svg viewBox="0 0 40 40" className="size-[clamp(2.1rem,5vh,3.1rem)] shrink-0 -rotate-90">
      <circle cx="20" cy="20" r={radius} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="4" />
      <circle cx="20" cy="20" r={radius} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${filled} ${length}`} />
    </svg>
  )
}

function Figure({ label, value, tone, egg }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[clamp(0.5rem,0.58vw,0.68rem)] font-bold tracking-[0.1em] text-white/55 uppercase">{label}</p>
      {egg && isZeroAchieved(value) ? (
        <img src="/egg-broken.gif?v=6" alt="Achieved is zero" className="mt-0.5 h-[clamp(1.1rem,2.4vh,1.6rem)] w-auto" />
      ) : (
        <p className={`font-heading truncate text-[clamp(0.9rem,1.15vw,1.3rem)] leading-tight font-extrabold ${tone}`}>{money(value)}</p>
      )}
    </div>
  )
}

function Period({ icon: Icon, iconClass, title, target, achieved }) {
  return (
    <div className="grid min-w-0 grid-cols-[auto_1fr_1fr] items-center gap-2 rounded-2xl border border-white/10 bg-[#07101f]/55 px-2.5 py-[0.55vh]">
      <Icon className={`size-[clamp(0.95rem,1.35vw,1.3rem)] shrink-0 ${iconClass}`} strokeWidth={2.2} />
      <p className="col-span-2 truncate text-[clamp(0.5rem,0.58vw,0.68rem)] font-bold tracking-[0.12em] text-white/45 uppercase">{title}</p>
      <span />
      <Figure label="Target" value={target} tone="text-[#ffb24a]" />
      <Figure label="Achieved" value={achieved} tone="text-emerald-300" egg />
    </div>
  )
}

function Card({ person, theme }) {
  const stats = figures(person)
  return (
    <article className={`flex h-full min-h-0 flex-col rounded-[1.6rem] border bg-gradient-to-b px-[0.9vw] py-[1.1vh] shadow-[0_16px_40px_rgba(0,0,0,0.35)] ${theme.card} ${theme.border}`}>
      <div className="flex flex-col items-center">
        <div className={`relative rounded-full bg-gradient-to-b p-[3px] shadow-[0_0_18px_rgba(255,255,255,0.15)] ${theme.ring}`}>
          <img src={person.image ? slideImageUrl(person.image) : "/default-employee.png"} alt={person.name || "Employee"} className="size-[clamp(3.4rem,9vh,5.6rem)] rounded-full bg-[#0b1220] object-cover" />
          <span className="absolute right-0 bottom-1 size-3.5 rounded-full border-2 border-[#10203f] bg-emerald-400" />
        </div>
        <h3 className="font-heading mt-[0.6vh] w-full truncate text-center text-[clamp(1.05rem,1.55vw,1.7rem)] font-extrabold tracking-wide uppercase">{person.name || "Employee"}</h3>
        <p className="text-[clamp(0.52rem,0.64vw,0.72rem)] font-semibold tracking-[0.32em] text-white/70">PERFORMANCE SUMMARY</p>
      </div>
      <div className="mt-[0.8vh] grid min-h-0 flex-1 content-center gap-[0.6vh]">
        <Period icon={CalendarDays} iconClass="text-sky-300" title="Monthly" target={person.monthlyTarget || person.target} achieved={person.monthlyAchieved} />
        <Period icon={Trophy} iconClass="text-amber-300" title="Quarterly" target={person.quarterlyTarget || person.quarterly} achieved={person.quarterlyAchieved ?? person.achieved} />
        <Period icon={TrendingUp} iconClass="text-emerald-300" title="Yearly" target={person.yearlyTarget} achieved={person.yearlyAchieved} />
      </div>
      <div className={`mt-[1vh] flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r px-3 py-[0.8vh] text-white ${theme.bar}`}>
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-[clamp(0.55rem,0.68vw,0.75rem)] font-bold tracking-[0.16em]"><BarChart3 className="size-3.5" /> ACHIEVED</p>
          {isZeroAchieved(stats.totalAchieved) ? (
            <img src="/egg-broken.gif?v=6" alt="Achieved is zero" className="mt-1 h-[clamp(1.3rem,2.8vh,1.9rem)] w-auto" />
          ) : (
            <p className="font-heading mt-1 text-[clamp(1.15rem,1.7vw,1.9rem)] leading-none font-extrabold">{money(stats.totalAchieved)}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-[clamp(0.52rem,0.64vw,0.72rem)] font-bold tracking-[0.14em]">PROGRESS</p>
            <p className="font-heading text-[clamp(1rem,1.4vw,1.5rem)] leading-none font-extrabold">{stats.percent.toFixed(1)}%</p>
          </div>
          <Ring percent={stats.percent} color={theme.progress} />
        </div>
      </div>
    </article>
  )
}

export function SlideEmployeesV9({ slide }) {
  const people = (slide.employees || []).filter((person) => person.name || person.image || person.target || person.monthlyTarget || person.quarterlyTarget || person.yearlyTarget)
  const title = String(slide.title || "EMPLOYEES PERFORMANCE")
  const lead = title.replace(/performance/i, "").trim() || "EMPLOYEES"
  return (
    <section className="relative flex h-full w-full flex-col overflow-hidden bg-[#07101f] px-[1.5vw] pt-[0.8vh] pb-[10.5vh]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_10%,rgba(37,99,235,0.28),transparent_26%),radial-gradient(circle_at_92%_0%,rgba(124,58,237,0.22),transparent_24%),radial-gradient(ellipse_at_70%_110%,rgba(249,115,22,0.35),transparent_36%),radial-gradient(ellipse_at_10%_110%,rgba(14,165,233,0.22),transparent_32%)]" />
      <header className="relative z-10 grid shrink-0 grid-cols-[auto_1fr_auto] items-center">
        <img src="/tml-logo.svg" alt="TML Global" className="h-[clamp(2.6rem,7.5vh,5rem)] w-auto" />
        <div className="text-center">
          <p className="mx-auto w-fit rounded-full bg-gradient-to-r from-[#ff9d2e] to-[#ff5a1f] px-5 py-1 font-heading text-[clamp(0.62rem,0.78vw,0.88rem)] font-extrabold tracking-[0.22em] text-white shadow-[0_6px_16px_rgba(255,100,20,0.35)]">TML GLOBAL</p>
          <h2 className="font-heading mt-1 text-[clamp(1.45rem,2.9vw,3.2rem)] leading-none font-extrabold tracking-wide">
            {lead} <span className="bg-gradient-to-r from-[#ffb24a] to-[#ff5a1f] bg-clip-text text-transparent">PERFORMANCE</span>
          </h2>
          <p className="mt-1 flex items-center justify-center gap-3 text-[clamp(0.55rem,0.7vw,0.78rem)] font-semibold tracking-[0.38em] text-white/55">
            <span className="h-px w-10 bg-white/25" />
            PERFORMANCE OVERVIEW
            <span className="h-px w-10 bg-white/25" />
          </p>
        </div>
        <div className="grid size-[clamp(2.3rem,5vh,3.4rem)] place-items-center rounded-2xl border border-orange-400/30 bg-[#1a120c] shadow-[0_0_16px_rgba(255,140,40,0.25)]">
          <BarChart3 className="size-[58%] text-orange-400" />
        </div>
      </header>
      {!people.length && <p className="relative z-10 m-auto text-2xl text-white/70">Add employees in the slide manager.</p>}
      {!!people.length && (
        <div className="relative z-10 mt-[1vh] grid min-h-0 flex-1 grid-cols-3 gap-[1.1vw]">
          {people.slice(0, 3).map((person, index) => <Card key={`${person.name}-${index}`} person={person} theme={THEMES[index % 3]} />)}
        </div>
      )}
    </section>
  )
}
