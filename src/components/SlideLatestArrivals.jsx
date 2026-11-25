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

export function SlideLatestArrivals({ cars, rotation, status }) {
  const count = useCardCount()
  const page = pageOf(cars, count, rotation)
  return (
    <section className="flex h-full w-full flex-col overflow-hidden bg-gradient-to-br from-[#101010] to-[#1a120e] px-[3vw] pt-[4vh] pb-[12vh]">
      <header className="mb-[2vh]">
        <p className="font-heading text-[clamp(0.85rem,1.1vw,1.15rem)] font-bold tracking-[0.35em] text-[#FF5722]">JUST LANDED</p>
        <h2 className="font-heading text-[clamp(2.2rem,3.6vw,4.2rem)] font-extrabold">LATEST ARRIVALS</h2>
      </header>
      {status === "loading" && <p className="m-auto text-2xl text-white/70">Loading latest arrivals…</p>}
      {status !== "loading" && !page.length && <p className="m-auto text-2xl text-white/70">New arrivals will appear here as soon as they are added.</p>}
      {!!page.length && (
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-5 min-[1600px]:grid-cols-3">
          {page.map((car) => <VehicleCard key={car.id} car={car} priority badge="Latest arrival" />)}
        </div>
      )}
    </section>
  )
}
