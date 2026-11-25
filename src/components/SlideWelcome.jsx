import { SlideImages } from "./SlideImages"

export function SlideWelcome({ slide, imageMs, onExplore }) {
  return (
    <section className="relative h-full w-full overflow-hidden bg-[#070707]">
      <SlideImages images={slide.images} imageMs={imageMs} className="animate-ken" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20" />
      <div className="relative flex h-full flex-col justify-between px-[5vw] pt-[6vh] pb-[12vh]">
        <img src="/tml-logo.svg" alt="TML Global" className="h-[9vh] w-auto" />
        <div className="animate-rise max-w-[78vw]">
          {slide.kicker && <p className="font-heading text-[clamp(0.95rem,1.4vw,1.5rem)] font-bold tracking-[0.42em] text-[#FF5722]">{slide.kicker}</p>}
          <h1 className="font-heading mt-4 text-[clamp(3.2rem,6.2vw,7.4rem)] leading-[0.92] font-extrabold whitespace-pre-line">{slide.title}</h1>
          {slide.subtitle && <p className="mt-6 text-[clamp(1.3rem,2.1vw,2.5rem)] text-white/90">{slide.subtitle}</p>}
          {slide.supporting && <p className="mt-4 text-[clamp(1rem,1.5vw,1.6rem)] tracking-[0.28em] text-white/65">{slide.supporting}</p>}
          {slide.cta && <button type="button" onClick={onExplore} className="font-heading mt-10 rounded-full bg-gradient-to-r from-[#F35938] to-[#FF6E24] px-10 py-4 text-[clamp(1rem,1.4vw,1.4rem)] font-extrabold tracking-wide text-white">{slide.cta}</button>}
        </div>
        <p className="text-[clamp(0.95rem,1.2vw,1.3rem)] tracking-wide text-white/50">{slide.footer}</p>
      </div>
    </section>
  )
}
