import { BadgeDollarSign, CalendarDays, Trophy, UserRound } from "lucide-react"
import { isZeroAchieved, money, slideImageUrl } from "../lib/slides"

function percentLabel(value) {
  const raw = String(value ?? "").trim()
  if (!raw || raw === "-") return "—"
  if (raw.includes("%")) return raw
  const amount = Number(raw.replace(/,/g, ""))
  return Number.isFinite(amount) ? `${amount}%` : raw
}

export function SlideEmployeesV12({ slide }) {
  const person = (slide.employees || []).find((item) => item.name || item.image || item.monthlyTarget || item.target) || {}
  const stats = [
    [CalendarDays, "Monthly target", person.monthlyTarget || person.target, "Achieved", person.monthlyAchieved],
    [Trophy, "Quarterly target", person.quarterlyTarget || person.quarterly, "Achieved", person.quarterlyAchieved ?? person.achieved],
    [BadgeDollarSign, "Yearly target", person.yearlyTarget, "Achieved", person.yearlyAchieved],
  ]
  return (
    <section className="relative grid h-full w-full grid-cols-[1.05fr_0.95fr] items-center gap-[2vw] overflow-hidden bg-[#071a3a] bg-cover bg-center px-[4vw] py-[4vh] text-white" style={{ backgroundImage: "url(/profile-bg.jpg)" }}>
      <div className="relative z-10 min-w-0">
        <div className="flex items-center justify-between gap-6">
          <img src="/tml-logo.svg" alt="TML Global" className="h-[clamp(7rem,16vh,11rem)] w-auto" />
          <div className="translate-x-[6vw] text-right">
            <p className="text-[clamp(0.9rem,1.2vw,1.4rem)] font-bold tracking-[0.22em] text-white">ACHIEVE PERCENT</p>
            <p className="font-heading text-[clamp(3rem,5.5vw,6.5rem)] leading-none font-extrabold text-emerald-300">{percentLabel(person.achievePercent)}</p>
          </div>
        </div>
        <h2 className="font-heading mt-4 max-w-[14ch] text-[clamp(2.4rem,4.4vw,5rem)] leading-[0.95] font-extrabold">{slide.title || "Meet Your Sales Representative"}</h2>
        {!!slide.supporting && <p className="mt-5 max-w-xl text-[clamp(1rem,1.3vw,1.35rem)] leading-relaxed text-white/75">{slide.supporting}</p>}
        <div className="mt-[5vh] grid grid-cols-3 gap-x-10 gap-y-4">
          {stats.map(([Icon, label, target, achievedLabel, achieved]) => (
            <div key={label}>
              <Icon className="size-[clamp(1.6rem,2vw,2.2rem)] text-cyan-300" />
              <p className="mt-2 text-[clamp(1rem,1.25vw,1.55rem)] font-bold tracking-[0.06em] text-white uppercase">{label}</p>
              <p className="font-heading text-[clamp(2.4rem,3.3vw,4.2rem)] leading-none font-extrabold text-[#ff9a3c]">{money(target)}</p>
              <p className="mt-3 text-[clamp(1.15rem,1.55vw,1.9rem)] font-bold tracking-[0.12em] text-white uppercase">{achievedLabel}</p>
              {isZeroAchieved(achieved) && String(achieved ?? "").trim() !== "" ? (
                <img src="/egg-broken.gif?v=6" alt="Achieved is zero" className="mt-1 h-[clamp(1.6rem,3vh,2.2rem)] w-auto" />
              ) : (
                <p className="font-heading text-[clamp(2.4rem,3.3vw,4.2rem)] leading-none font-extrabold text-emerald-300">{money(achieved)}</p>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <img
          src={person.image ? slideImageUrl(person.image) : "/default-employee.png"}
          alt={person.name || "Employee"}
          className="size-[min(70vh,38vw)] rounded-full border-[10px] border-white/90 object-cover shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
        />
        <div className="mt-[-2.5rem] w-[min(22vw,320px)] rounded-2xl bg-black px-6 py-4 text-center shadow-xl">
          <p className="font-heading truncate text-[clamp(1.3rem,1.8vw,2rem)] font-extrabold">{person.name || "Employee"}</p>
          <p className="mt-1 flex items-center justify-center gap-2 text-sm text-white/60"><UserRound className="size-4" /> Sales representative</p>
        </div>
      </div>
    </section>
  )
}
