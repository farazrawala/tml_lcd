import { SlideImages } from "./SlideImages"

export function SlideGallery({ slide, imageMs, plain = false }) {
  return (
    <section className="relative h-full w-full overflow-hidden bg-[#070707]">
      <SlideImages images={slide.images} imageMs={imageMs} alt={slide.title || "Slide"} />
      {!plain && <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/30" />}
      {!plain && (slide.kicker || slide.title || slide.subtitle) && (
        <div className="relative flex h-full flex-col justify-end px-[5vw] pb-[14vh]">
          {slide.kicker && <p className="font-heading text-[clamp(0.95rem,1.4vw,1.5rem)] font-bold tracking-[0.42em] text-[#FF5722]">{slide.kicker}</p>}
          {slide.title && <h2 className="font-heading mt-3 max-w-[70vw] text-[clamp(2.8rem,5.4vw,6.4rem)] leading-[0.95] font-extrabold whitespace-pre-line">{slide.title}</h2>}
          {slide.subtitle && <p className="mt-5 max-w-[46vw] text-[clamp(1.2rem,1.8vw,2.1rem)] text-white/85">{slide.subtitle}</p>}
        </div>
      )}
    </section>
  )
}
