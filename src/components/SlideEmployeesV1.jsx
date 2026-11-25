import { slideImageUrl } from "../lib/slides"
import { EmployeeFigures } from "./EmployeeFigures"

export function SlideEmployeesV1({ slide, perRow = 0 }) {
  const people = (slide.employees || []).filter((person) => person.name || person.image || person.target || person.quarterly || person.achieved)
  const columns = perRow || (people.length <= 1 ? 1 : people.length === 2 ? 2 : people.length <= 4 ? 2 : 4)

  return (
    <section className="relative flex h-full w-full flex-col overflow-hidden bg-[#070707] px-[2.5vw] pt-[3vh] pb-[11vh]">
      <img src="/tml-logo.svg" alt="TML Global" className="absolute top-[2vh] left-[2.5vw] h-[12vh] w-auto" />
      <p className="text-center font-heading text-[clamp(0.85rem,1.1vw,1.15rem)] font-bold tracking-[0.4em] text-[#FF5722]">TML GLOBAL</p>
      <h2 className="text-center font-heading text-[clamp(2rem,3.2vw,3.8rem)] leading-none font-extrabold">{slide.title || "EMPLOYEES"}</h2>
      {!people.length && <p className="m-auto text-2xl text-white/70">Add employees in the slide manager.</p>}
      {!!people.length && (
        <div className="mt-[2.5vh] grid min-h-0 flex-1 gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {people.map((person, index) => (
            <article key={`${person.name}-${index}`} className="flex h-full min-h-0 flex-col items-center overflow-hidden rounded-[1.6rem] border border-white/10 bg-gradient-to-b from-[#1b1b1b] to-[#101010] px-[1vw] py-[1.4vh]">
              <img
                src={person.image ? slideImageUrl(person.image) : "/default-employee.png"}
                alt={person.name || "Employee"}
                className="size-[clamp(4.5rem,11vh,8rem)] shrink-0 rounded-full border-4 border-[#FF5722] bg-white object-cover"
              />
              <h3 className="font-heading mt-[1vh] w-full truncate text-center text-[clamp(1.1rem,1.6vw,1.8rem)] font-extrabold uppercase">{person.name || "Employee"}</h3>
              <EmployeeFigures person={person} className="mt-auto" />
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
