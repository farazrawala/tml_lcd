import { slideImageUrl } from "../lib/slides"
import { EmployeeFigures } from "./EmployeeFigures"

export function SlideEmployees({ slide }) {
  const people = (slide.employees || []).filter((person) => person.name || person.image)
  const columns = people.length <= 1 ? 1 : people.length === 2 ? 2 : people.length <= 4 ? people.length : people.length <= 6 ? 3 : 4

  return (
    <section className="relative flex h-full w-full flex-col overflow-hidden bg-[#090909] px-[3vw] pt-[4vh] pb-[12vh]">
      <img src="/tml-logo.svg" alt="TML Global" className="absolute top-[1.5vh] left-[2.5vw] h-[17vh] w-auto" />
      <p className="text-center font-heading text-[clamp(0.9rem,1.2vw,1.3rem)] font-bold tracking-[0.35em] text-[#FF5722]">TML GLOBAL</p>
      <h2 className="text-center font-heading text-[clamp(2.2rem,3.8vw,4.4rem)] font-extrabold">{slide.title || "EMPLOYEES"}</h2>
      {!people.length && <p className="m-auto text-2xl text-white/70">Add employees in the slide manager.</p>}
      {!!people.length && (
        <div className="mt-[3vh] grid min-h-0 flex-1 gap-5" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {people.map((person, index) => (
            <article key={`${person.name}-${index}`} className="grid h-full min-h-0 overflow-hidden rounded-3xl border border-white/10 bg-[#141414]" style={{ gridTemplateRows: "minmax(0, 1fr) auto" }}>
              <div className="flex min-h-0 items-center justify-center overflow-hidden bg-[#111111] p-4">
                <img
                  src={person.image ? slideImageUrl(person.image) : "/default-employee.png"}
                  alt={person.name || "Employee"}
                  className={person.image ? "h-full w-full object-cover" : "aspect-square h-auto max-h-full w-auto max-w-[70%] object-contain"}
                />
              </div>
              <div className="relative z-10 bg-[#141414] px-[clamp(0.8rem,1.2vw,1.3rem)] py-[clamp(0.7rem,1.1vw,1.1rem)]">
                <h3 className="font-heading truncate text-[clamp(1.15rem,1.7vw,2rem)] font-extrabold uppercase">{person.name || "Employee"}</h3>
                <EmployeeFigures person={person} className="mt-2" />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
