import { useEffect, useState } from "react"
import { VehicleImage } from "./VehicleImage"
import { SlideImages } from "./SlideImages"
import { formatPrice, offerPricing, pageOf, stockNumber, vehicleImage } from "../lib/format"

function useCardCount() {
  const [count, setCount] = useState(() => (window.innerWidth >= 1600 ? 3 : 2))
  useEffect(() => {
    const apply = () => setCount(window.innerWidth >= 1600 ? 3 : 2)
    window.addEventListener("resize", apply)
    return () => window.removeEventListener("resize", apply)
  }, [])
  return count
}

export function SlideOffers({ cars, rotation, slide, imageMs }) {
  const count = useCardCount()
  const priced = cars.filter((car) => offerPricing(car))
  const page = pageOf(priced.length ? priced : cars, count, rotation)
  const showDiscount = priced.length > 0

  if (!page.length) {
    return (
      <section className="relative h-full w-full overflow-hidden bg-[#090909]">
        <SlideImages images={slide?.images} imageMs={imageMs} className="opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />
        <div className="relative flex h-full flex-col justify-center px-[6vw] pb-[10vh]">
          <p className="font-heading text-[clamp(0.95rem,1.4vw,1.4rem)] font-bold tracking-[0.4em] text-[#FF5722]">SPECIAL OFFERS</p>
          <h2 className="font-heading mt-4 text-[clamp(3rem,5.5vw,6.5rem)] leading-[0.95] font-extrabold whitespace-pre-line">{slide?.title || "EXCLUSIVE\nVEHICLE DEALS"}</h2>
          <p className="mt-6 max-w-[46vw] text-[clamp(1.3rem,2vw,2.3rem)] text-white/85">{slide?.subtitle || "DRIVE HOME YOUR DREAM CAR"}</p>
          <p className="mt-6 max-w-[40vw] text-[clamp(1.05rem,1.4vw,1.5rem)] leading-relaxed text-white/65">No discounted vehicles are published right now. Every car on display is offered at its current stock price.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="flex h-full w-full flex-col overflow-hidden bg-[#100c0a] px-[3vw] pt-[4vh] pb-[12vh]">
      <header className="mb-[2vh]">
        <p className="font-heading text-[clamp(0.85rem,1.1vw,1.15rem)] font-bold tracking-[0.35em] text-[#FF5722]">SPECIAL OFFERS</p>
        <h2 className="font-heading text-[clamp(2.2rem,3.6vw,4.2rem)] font-extrabold">EXCLUSIVE VEHICLE DEALS</h2>
        <p className="text-[clamp(1.1rem,1.5vw,1.7rem)] text-white/70">DRIVE HOME YOUR DREAM CAR</p>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-5 min-[1600px]:grid-cols-3">
        {page.map((car) => {
          const deal = offerPricing(car)
          return (
            <article key={car.id} className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[#FF5722]/30 bg-[#161210]">
              <div className="relative min-h-0 flex-1">
                <VehicleImage src={vehicleImage(car)} alt={car.title} priority />
                {deal && <span className="font-heading absolute top-4 left-4 rounded-full bg-[#FF5722] px-4 py-2 text-xl font-extrabold">-{deal.percent}%</span>}
              </div>
              <div className="shrink-0 p-5">
                <h3 className="font-heading text-[clamp(1.2rem,1.7vw,2rem)] font-extrabold uppercase">{car.title}</h3>
                <p className="mt-1 text-lg text-white/60">Stock #{stockNumber(car)}</p>
                {deal ? (
                  <div className="mt-3 flex items-end gap-4">
                    <p className="text-2xl text-white/40 line-through">{formatPrice(deal.original)}</p>
                    <p className="font-heading text-[clamp(1.8rem,2.4vw,2.8rem)] font-extrabold text-[#FF5722]">{formatPrice(deal.sale)}</p>
                  </div>
                ) : (
                  <p className="font-heading mt-3 text-[clamp(1.8rem,2.4vw,2.8rem)] font-extrabold text-[#FF5722]">{formatPrice(car.price)}</p>
                )}
              </div>
            </article>
          )
        })}
      </div>
      {!showDiscount && <p className="sr-only">Clearance vehicles are shown at their published price. No separate discount is stored.</p>}
    </section>
  )
}
