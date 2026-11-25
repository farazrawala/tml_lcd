import { useEffect, useState } from "react"
import { VehicleCard } from "./VehicleCard"
import { pageOf } from "../lib/format"

function useCardCount() {
  const [count, setCount] = useState(() => (window.innerWidth >= 1600 ? 3 : 2))
  useEffect(() => {
    const apply = () => setCount(window.innerWidth >= 1600 ? 3 : 2)
    window.addEventListener("resize", apply)
    return () => window.removeEventListener("resize", apply)
  }, [])
  return count
}

export function SlideFeaturedCars({ cars, rotation, status, usingStock }) {
  const count = useCardCount()
  const page = pageOf(cars, count, rotation)
  return (
    <section className="flex h-full w-full flex-col overflow-hidden bg-[#0b0b0b] px-[3vw] pt-[4vh] pb-[12vh]">
      <header className="mb-[2vh] flex items-end justify-between gap-6">
        <div>
          <p className="font-heading text-[clamp(0.85rem,1.1vw,1.15rem)] font-bold tracking-[0.35em] text-[#FF5722]">TML GLOBAL</p>
          <h2 className="font-heading text-[clamp(2.2rem,3.6vw,4.2rem)] font-extrabold">{usingStock ? "VEHICLES IN STOCK" : "FEATURED CARS"}</h2>
        </div>
        <p className="max-w-[28vw] text-right text-[clamp(1rem,1.3vw,1.4rem)] text-white/60">Selected from the live TML Global inventory.</p>
      </header>
      {status === "loading" && <p className="m-auto text-2xl text-white/70">Loading vehicles…</p>}
      {status === "error" && !page.length && <p className="m-auto text-2xl text-white/70">Inventory is temporarily unavailable.</p>}
      {status !== "loading" && !page.length && status !== "error" && <p className="m-auto text-2xl text-white/70">No vehicles are ready to display.</p>}
      {!!page.length && (
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-5 min-[1600px]:grid-cols-3">
          {page.map((car) => <VehicleCard key={car.id} car={car} priority badge={usingStock ? "In Stock" : "Featured"} />)}
        </div>
      )}
    </section>
  )
}
