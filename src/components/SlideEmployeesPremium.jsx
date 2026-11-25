import { TrendingUp } from "lucide-react"
import { slideImageUrl } from "../lib/slides"
import { EmployeeFigures } from "./EmployeeFigures"

function peopleOf(slide) {
  return (slide.employees || []).filter((person) => person.name || person.image || person.target || person.quarterly || person.achieved)
}

function Photo({ person, className }) {
  return (
    <img
      src={person.image ? slideImageUrl(person.image) : "/default-employee.png"}
      alt={person.name || "Employee"}
      className={className}
    />
  )
}

function Shell({ slide, badge, children }) {
  const title = slide.title || "EMPLOYEES PERFORMANCE"
  const split = title.toUpperCase().includes("PERFORMANCE")
    ? [title.replace(/performance/i, "").trim() || "EMPLOYEES", "PERFORMANCE"]
    : [title, ""]
  return (
    <section className="relative flex h-full w-full flex-col overflow-hidden bg-[#070b14] px-[1.6vw] pt-[1.2vh] pb-[11vh]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(255,120,40,0.18),transparent_32%),radial-gradient(circle_at_85%_10%,rgba(40,90,180,0.22),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#ff8a00] to-transparent" />
      <header className="relative z-10 grid grid-cols-[auto_1fr_auto] items-center gap-4">
        <img src="/tml-logo.svg" alt="TML Global" className="h-[clamp(3.2rem,9vh,6.2rem)] w-auto" />
        <div className="text-center">
          <p className="mx-auto w-fit rounded-full bg-gradient-to-r from-[#ff9a3c] to-[#ff5722] px-4 py-1 font-heading text-[clamp(0.65rem,0.8vw,0.9rem)] font-extrabold tracking-[0.28em] text-white shadow-[0_0_18px_rgba(255,120,40,0.55)]">TML GLOBAL</p>
          <h2 className="font-heading text-[clamp(1.5rem,3.1vw,3.5rem)] leading-none font-extrabold tracking-wide text-white">
            {split[0]} {split[1] && <span className="bg-gradient-to-r from-[#ffd27a] to-[#ff6a1a] bg-clip-text text-transparent">{split[1]}</span>}
          </h2>
          <p className="mt-1 text-[clamp(0.6rem,0.7vw,0.8rem)] font-bold tracking-[0.42em] text-orange-200/70">{badge}</p>
        </div>
        <TrendingUp className="size-[clamp(2.4rem,4.5vw,4.2rem)] text-orange-400 drop-shadow-[0_0_14px_rgba(255,140,40,0.85)]" strokeWidth={2.4} />
      </header>
      <div className="relative z-10 mt-[1.4vh] min-h-0 flex-1">{children}</div>
    </section>
  )
}

function Card({ person, wide }) {
  return (
    <article className={`flex h-full min-h-0 overflow-hidden rounded-3xl border border-orange-400/45 bg-gradient-to-b from-[#1b2a4a] via-[#121c33] to-[#0b1222] shadow-[0_0_22px_rgba(255,120,40,0.16),inset_0_1px_0_rgba(255,255,255,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(255,120,40,0.28)] ${wide ? "flex-row items-center gap-4 px-4" : "flex-col items-center px-3 py-[1.2vh]"}`}>
      <div className={`shrink-0 rounded-full bg-gradient-to-b from-[#ffd27a] to-[#ff5722] p-[3px] shadow-[0_0_16px_rgba(255,120,40,0.75)] ${wide ? "" : ""}`}>
        <Photo person={person} className={`${wide ? "size-[clamp(4rem,10vh,6.5rem)]" : "size-[clamp(3.2rem,8vh,5.4rem)]"} rounded-full bg-[#0c1424] object-cover`} />
      </div>
      <div className={wide ? "min-w-0 flex-1" : "flex w-full min-h-0 flex-1 flex-col"}>
        <h3 className={`truncate text-center font-heading font-extrabold tracking-wide uppercase ${wide ? "text-left text-[clamp(1.1rem,1.6vw,1.8rem)]" : "mt-2 rounded-lg bg-black/35 px-2 py-1 text-[clamp(0.8rem,1vw,1.15rem)]"}`}>{person.name || "Employee"}</h3>
        <EmployeeFigures person={person} className={wide ? "mt-3" : "mt-auto pt-2"} />
      </div>
    </article>
  )
}

function Grid({ people, columns, wide }) {
  if (!people.length) return <p className="grid h-full place-items-center text-2xl text-white/70">Add employees in the slide manager.</p>
  return (
    <div className="grid h-full min-h-0 gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gridAutoRows: "minmax(0, 1fr)" }}>
      {people.map((person, index) => <Card key={`${person.name}-${index}`} person={person} wide={wide} />)}
    </div>
  )
}

export function SlideEmployeesV5({ slide }) {
  const people = peopleOf(slide)
  const columns = people.length <= 1 ? 1 : people.length === 2 ? 2 : people.length <= 3 ? 3 : 4
  return <Shell slide={slide} badge="LAYOUT 06"><Grid people={people} columns={columns} /></Shell>
}

export function SlideEmployeesV6({ slide }) {
  const people = peopleOf(slide)
  const columns = people.length <= 1 ? 1 : people.length === 2 ? 2 : 3
  return <Shell slide={slide} badge="LAYOUT 07"><Grid people={people} columns={columns} /></Shell>
}

export function SlideEmployeesV7({ slide }) {
  const people = peopleOf(slide)
  const columns = people.length <= 1 ? 1 : 2
  return <Shell slide={slide} badge="LAYOUT 08"><Grid people={people} columns={columns} wide /></Shell>
}
