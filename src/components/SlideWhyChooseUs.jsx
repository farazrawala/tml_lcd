import { BadgeCheck, BadgeJapaneseYen, ShieldCheck, Smile } from "lucide-react"
import { SlideImages } from "./SlideImages"

const POINTS = [
  { icon: BadgeCheck, title: "Quality Japanese Vehicles", text: "Hand-selected used cars from Japan, prepared for export." },
  { icon: ShieldCheck, title: "Trusted Vehicle Inspection", text: "Every listing is checked so you know the car you are buying." },
  { icon: BadgeJapaneseYen, title: "Competitive Pricing", text: "Clear stock prices with no invented discounts." },
  { icon: Smile, title: "Customer Satisfaction", text: "A buying experience built on quality, trust, and reliability." },
]

export function SlideWhyChooseUs({ slide, imageMs }) {
  return (
    <section className="relative h-full w-full overflow-hidden bg-[#090909]">
      <SlideImages images={slide?.images} imageMs={imageMs} className="opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black" />
      <div className="relative flex h-full flex-col px-[4vw] pt-[5vh] pb-[12vh]">
        <p className="font-heading text-[clamp(0.9rem,1.2vw,1.3rem)] font-bold tracking-[0.35em] text-[#FF5722]">TML GLOBAL</p>
        <h2 className="font-heading mt-2 text-[clamp(2.4rem,4vw,4.6rem)] font-extrabold">{slide?.title || "WHY CHOOSE TML GLOBAL?"}</h2>
        <div className="mt-[4vh] grid min-h-0 flex-1 grid-cols-2 gap-5 min-[1600px]:grid-cols-4">
          {POINTS.map((point) => {
            const Icon = point.icon
            return (
              <article key={point.title} className="flex flex-col justify-center rounded-3xl border border-white/10 bg-black/55 p-[clamp(1.2rem,2vw,2.2rem)]">
                <span className="flex size-16 items-center justify-center rounded-2xl bg-[#FF5722] text-white"><Icon className="size-8" /></span>
                <h3 className="font-heading mt-6 text-[clamp(1.3rem,1.7vw,2rem)] leading-tight font-extrabold">{point.title}</h3>
                <p className="mt-3 text-[clamp(1rem,1.25vw,1.35rem)] leading-relaxed text-white/70">{point.text}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
