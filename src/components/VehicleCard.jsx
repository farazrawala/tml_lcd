import { VehicleImage } from "./VehicleImage"
import { formatEngine, formatKm, formatLabel, formatPrice, stockNumber, vehicleImage } from "../lib/format"

export function VehicleCard({ car, badge, priority = false }) {
  const priced = Number(car.price) > 0
  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141414] shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
      <div className="relative min-h-0 flex-1 bg-[#0c0c0c]">
        <VehicleImage src={vehicleImage(car)} alt={car.title} priority={priority} />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
        {badge && (
          <span className="font-heading absolute top-4 left-4 rounded-full bg-[#FF5722] px-4 py-2 text-[clamp(0.85rem,1.1vw,1.15rem)] font-bold tracking-wide text-white uppercase">
            {badge}
          </span>
        )}
        <span className="font-heading absolute right-4 bottom-4 text-[clamp(0.9rem,1.2vw,1.2rem)] font-bold tracking-wide text-white">
          {car.status === "AVAILABLE" ? "In Stock" : formatLabel(car.status)}
        </span>
      </div>
      <div className="shrink-0 space-y-3 p-[clamp(0.85rem,1.3vw,1.4rem)]">
        <p className="font-heading text-[clamp(0.8rem,1vw,1.05rem)] font-bold tracking-[0.22em] text-[#FF5722] uppercase">{car.brand}</p>
        <h3 className="font-heading line-clamp-2 text-[clamp(1.25rem,1.8vw,2.1rem)] leading-tight font-extrabold uppercase">{car.model || car.title}</h3>
        <dl className="grid grid-cols-3 gap-x-3 gap-y-2 text-[clamp(0.85rem,1.05vw,1.15rem)] text-white/75">
          <div><dt className="text-white/40">Year</dt><dd className="font-semibold text-white">{car.year}</dd></div>
          <div><dt className="text-white/40">Mileage</dt><dd className="font-semibold text-white">{formatKm(car.mileage)}</dd></div>
          <div><dt className="text-white/40">Gearbox</dt><dd className="font-semibold text-white">{formatLabel(car.transmission)}</dd></div>
          <div><dt className="text-white/40">Fuel</dt><dd className="font-semibold text-white">{formatLabel(car.fuelType)}</dd></div>
          <div><dt className="text-white/40">Engine</dt><dd className="font-semibold text-white">{formatEngine(car.engineCapacity)}</dd></div>
          <div><dt className="text-white/40">Stock</dt><dd className="font-semibold text-white">#{stockNumber(car)}</dd></div>
        </dl>
        <p className={`font-heading text-[clamp(1.5rem,2.2vw,2.6rem)] font-extrabold ${priced ? "text-[#FF5722]" : "text-white"}`}>{formatPrice(car.price)}</p>
      </div>
    </article>
  )
}
