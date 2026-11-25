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

export function SlideEmployeesV2({ slide }) {
  const people = peopleOf(slide)
  return (
    <section className="relative flex h-full w-full flex-col overflow-hidden bg-[#080808] px-[2.5vw] pt-[3vh] pb-[11vh]">
      <img src="/tml-logo.svg" alt="TML Global" className="absolute top-[2vh] left-[2.5vw] h-[11vh] w-auto" />
      <p className="text-center font-heading text-[clamp(0.8rem,1vw,1.1rem)] font-bold tracking-[0.35em] text-[#FF5722]">EMPLOYEE V2</p>
      <h2 className="text-center font-heading text-[clamp(1.8rem,3vw,3.4rem)] leading-none font-extrabold">{slide.title || "EMPLOYEES PERFORMANCE"}</h2>
      {!people.length && <p className="m-auto text-2xl text-white/70">Add employees in the slide manager.</p>}
      {!!people.length && (
        <div className="mt-[2vh] grid min-h-0 flex-1 grid-cols-2 gap-4">
          {people.map((person, index) => (
            <article key={`${person.name}-${index}`} className="flex min-h-0 items-center gap-4 overflow-hidden rounded-3xl border border-white/10 bg-[#151515] px-4">
              <Photo person={person} className="size-[clamp(4rem,12vh,7.5rem)] shrink-0 rounded-2xl bg-white object-cover" />
              <div className="min-w-0 flex-1">
                <h3 className="font-heading truncate text-[clamp(1.1rem,1.6vw,1.8rem)] font-extrabold uppercase">{person.name || "Employee"}</h3>
                <EmployeeFigures person={person} className="mt-2" />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export function SlideEmployeesV3({ slide }) {
  const people = peopleOf(slide)
  return (
    <section className="relative flex h-full w-full flex-col overflow-hidden bg-[#0c0c0c] px-[3vw] pt-[2.5vh] pb-[11vh]">
      <img src="/tml-logo.svg" alt="TML Global" className="absolute top-[2vh] left-[2.5vw] h-[10vh] w-auto" />
      <p className="text-center font-heading text-[clamp(0.8rem,1vw,1.1rem)] font-bold tracking-[0.35em] text-[#FF5722]">EMPLOYEE V3</p>
      <h2 className="text-center font-heading text-[clamp(1.8rem,3vw,3.4rem)] leading-none font-extrabold">{slide.title || "EMPLOYEES PERFORMANCE"}</h2>
      {!people.length && <p className="m-auto text-2xl text-white/70">Add employees in the slide manager.</p>}
      {!!people.length && (
        <div className="mt-[2vh] flex min-h-0 flex-1 flex-col gap-3">
          {people.map((person, index) => (
            <article key={`${person.name}-${index}`} className="grid min-h-0 flex-1 grid-cols-[auto_auto_1fr] items-center gap-4 rounded-2xl border border-white/10 bg-[#161616] px-4">
              <span className="font-heading w-12 text-center text-[clamp(1.4rem,2vw,2.4rem)] font-extrabold text-[#FF5722]">{String(index + 1).padStart(2, "0")}</span>
              <Photo person={person} className="size-[clamp(3rem,8vh,5.5rem)] rounded-full bg-white object-cover" />
              <h3 className="font-heading truncate text-[clamp(1.2rem,1.8vw,2.2rem)] font-extrabold uppercase">{person.name || "Employee"}</h3>
              <EmployeeFigures person={person} className="col-span-3" />
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export function SlideEmployeesV4({ slide }) {
  const people = peopleOf(slide)
  return (
    <section className="relative flex h-full w-full flex-col overflow-hidden bg-[#090909] px-[3vw] pt-[3vh] pb-[11vh]">
      <img src="/tml-logo.svg" alt="TML Global" className="absolute top-[2vh] left-[2.5vw] h-[11vh] w-auto" />
      <p className="text-center font-heading text-[clamp(0.8rem,1vw,1.1rem)] font-bold tracking-[0.35em] text-[#FF5722]">EMPLOYEE V4</p>
      <h2 className="text-center font-heading text-[clamp(1.8rem,3vw,3.4rem)] leading-none font-extrabold">{slide.title || "EMPLOYEES PERFORMANCE"}</h2>
      {!people.length && <p className="m-auto text-2xl text-white/70">Add employees in the slide manager.</p>}
      {!!people.length && (
        <div className="mt-[2vh] flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/10">
          <div className="grid grid-cols-[1.1fr_2fr] bg-[#FF5722] px-6 py-3 font-heading text-[clamp(0.9rem,1.2vw,1.3rem)] font-extrabold tracking-wide text-white">
            <span>EMPLOYEE</span><span>MONTHLY / QUARTERLY / YEARLY</span>
          </div>
          <div className="grid min-h-0 flex-1" style={{ gridTemplateRows: `repeat(${people.length}, minmax(0, 1fr))` }}>
            {people.map((person, index) => (
              <article key={`${person.name}-${index}`} className={`grid grid-cols-[1.1fr_2fr] items-center gap-4 px-6 ${index % 2 ? "bg-[#141414]" : "bg-[#101010]"}`}>
                <div className="flex min-w-0 items-center gap-4">
                  <Photo person={person} className="size-[clamp(2.8rem,7vh,4.5rem)] rounded-full bg-white object-cover" />
                  <h3 className="font-heading truncate text-[clamp(1.1rem,1.7vw,2rem)] font-extrabold uppercase">{person.name || "Employee"}</h3>
                </div>
                <EmployeeFigures person={person} />
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
