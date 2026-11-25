import { useCallback, useEffect, useRef, useState } from "react"
import { SlideBrands } from "./SlideBrands"
import { SlideContact } from "./SlideContact"
import { SlideFeaturedCars } from "./SlideFeaturedCars"
import { SlideGallery } from "./SlideGallery"
import { SlideEmployees } from "./SlideEmployees"
import { SlideEmployeesV1 } from "./SlideEmployeesV1"
import { SlideEmployeesV2, SlideEmployeesV3, SlideEmployeesV4 } from "./SlideEmployeesVersions"
import { SlideEmployeesV5, SlideEmployeesV6, SlideEmployeesV7 } from "./SlideEmployeesPremium"
import { SlideEmployeesV9 } from "./SlideEmployeesV9"
import { SlideEmployeesV11 } from "./SlideEmployeesV11"
import { SlideEmployeesV12 } from "./SlideEmployeesV12"
import { SlideProgress } from "./SlideProgress"
import { SlideLatestArrivals } from "./SlideLatestArrivals"
import { SlideOffers } from "./SlideOffers"
import { SlideWelcome } from "./SlideWelcome"
import { SlideWhyChooseUs } from "./SlideWhyChooseUs"
import { useInventory } from "../lib/useInventory"
import { slideImageUrl, useSlidesConfig } from "../lib/slides"
import { vehicleImage } from "../lib/format"
import { applySheet, useSheetEmployees } from "../lib/sheet"

export function Slideshow() {
  const inventory = useInventory()
  const config = useSlidesConfig()
  const sheet = useSheetEmployees(config.slides)
  const sheetEmployees = sheet.sheets
  const loading = !config.ready || !sheet.ready
  const slides = config.slides
  const displaySlides = slides.flatMap((raw) => {
    const slide = applySheet(raw, sheetEmployees)
    const pageSize = slide.type === "employees-v12" ? 1 : slide.type === "employees-v8" || slide.type === "employees-v9" || slide.type === "employees-v11" ? 3 : 0
    if (!pageSize) return [slide]
    const people = slide.employees || []
    if (people.length <= pageSize) return [slide]
    const pages = []
    for (let start = 0; start < people.length; start += pageSize) {
      pages.push({ ...slide, id: `${slide.id}-p${start / pageSize}`, employees: people.slice(start, start + pageSize) })
    }
    return pages
  })
  const count = Math.max(displaySlides.length, 1)
  const [index, setIndex] = useState(0)
  const [outgoing, setOutgoing] = useState(null)
  const [step, setStep] = useState(0)
  const [paused, setPaused] = useState(false)
  const [interacting, setInteracting] = useState(false)
  const [progress, setProgress] = useState(0)
  const indexRef = useRef(0)
  const elapsed = useRef(0)
  const resetElapsed = useRef(true)
  const countRef = useRef(count)
  countRef.current = count

  const goTo = useCallback((next) => {
    const total = countRef.current
    const normalized = ((next % total) + total) % total
    setOutgoing(indexRef.current)
    indexRef.current = normalized
    setIndex(normalized)
    setStep((value) => value + 1)
    resetElapsed.current = true
    elapsed.current = 0
    setProgress(0)
  }, [])

  useEffect(() => {
    if (indexRef.current < count) return
    goTo(0)
  }, [count, goTo])

  useEffect(() => {
    if (outgoing == null) return undefined
    const timer = window.setTimeout(() => setOutgoing(null), 750)
    return () => window.clearTimeout(timer)
  }, [outgoing, index])

  useEffect(() => {
    if (!slides.length) return undefined
    if (resetElapsed.current) {
      elapsed.current = 0
      resetElapsed.current = false
    }
    if (paused || interacting) return undefined
    const stamp = performance.now()
    let frame = 0
    const tick = (now) => {
      const ratio = Math.min(1, (elapsed.current + (now - stamp)) / config.intervalMs)
      setProgress(ratio)
      if (ratio >= 1) {
        goTo(indexRef.current + 1)
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      if (!resetElapsed.current) elapsed.current += performance.now() - stamp
      cancelAnimationFrame(frame)
    }
  }, [paused, interacting, index, goTo, slides.length, config.intervalMs])

  useEffect(() => {
    const timer = window.setTimeout(() => window.location.reload(), 30 * 60 * 1000)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault()
        goTo(indexRef.current + 1)
      } else if (event.key === "ArrowLeft") {
        event.preventDefault()
        goTo(indexRef.current - 1)
      } else if (event.key === " ") {
        event.preventDefault()
        setPaused((value) => !value)
      } else if (event.key === "Escape" && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [goTo])

  useEffect(() => {
    const upcoming = slides.flatMap((slide) => [
      ...slide.images.map(slideImageUrl),
      ...(slide.employees || []).map((person) => slideImageUrl(person.image)),
    ])
    ;[inventory.featured, inventory.latest, inventory.offers].flat().slice(0, 6).forEach((car) => upcoming.push(vehicleImage(car)))
    upcoming.forEach((src) => {
      if (!src) return
      const image = new Image()
      image.src = src
    })
  }, [slides, inventory.featured, inventory.latest, inventory.offers, index])

  const rotation = Math.floor(step / count)
  const views = displaySlides.map((slide) => {
    if (slide.type === "welcome") return <SlideWelcome key={slide.id} slide={slide} imageMs={config.imageMs} onExplore={() => goTo(indexRef.current + 1)} />
    if (slide.type === "featured") return <SlideFeaturedCars key={slide.id} cars={inventory.featured} rotation={rotation} status={inventory.status} usingStock={inventory.usingStock} />
    if (slide.type === "latest") return <SlideLatestArrivals key={slide.id} cars={inventory.latest} rotation={rotation} status={inventory.status} />
    if (slide.type === "offers") return <SlideOffers key={slide.id} cars={inventory.offers} rotation={rotation} slide={slide} imageMs={config.imageMs} />
    if (slide.type === "why") return <SlideWhyChooseUs key={slide.id} slide={slide} imageMs={config.imageMs} />
    if (slide.type === "brands") return <SlideBrands key={slide.id} brands={inventory.brands} status={inventory.status} />
    if (slide.type === "contact") return <SlideContact key={slide.id} slide={slide} imageMs={config.imageMs} />
    if (slide.type === "employees") return <SlideEmployees key={slide.id} slide={slide} />
    if (slide.type === "employees-v1") return <SlideEmployeesV1 key={slide.id} slide={slide} />
    if (slide.type === "employees-v2") return <SlideEmployeesV2 key={slide.id} slide={slide} />
    if (slide.type === "employees-v3") return <SlideEmployeesV3 key={slide.id} slide={slide} />
    if (slide.type === "employees-v4") return <SlideEmployeesV4 key={slide.id} slide={slide} />
    if (slide.type === "employees-v5") return <SlideEmployeesV5 key={slide.id} slide={slide} />
    if (slide.type === "employees-v6") return <SlideEmployeesV6 key={slide.id} slide={slide} />
    if (slide.type === "employees-v7") return <SlideEmployeesV7 key={slide.id} slide={slide} />
    if (slide.type === "employees-v8") return <SlideEmployeesV1 key={slide.id} slide={slide} perRow={3} />
    if (slide.type === "employees-v9") return <SlideEmployeesV9 key={slide.id} slide={slide} />
    if (slide.type === "employees-v11") return <SlideEmployeesV11 key={slide.id} slide={slide} />
    if (slide.type === "employees-v12") return <SlideEmployeesV12 key={slide.id} slide={slide} />
    return <SlideGallery key={slide.id} slide={slide} imageMs={config.imageMs} plain={slide.type === "fullscreen"} />
  })

  return (
    <main className="fixed inset-0 overflow-hidden bg-black text-white select-none">
      {loading && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-[#070707]">
          <div className="flex flex-col items-center gap-6">
            <img src="/tml-logo.svg" alt="TML Global" className="h-28 w-auto" />
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/15 border-t-[#FF5722]" />
          </div>
        </div>
      )}
      {!loading && !views.length && <p className="grid h-full place-items-center text-2xl text-white/70">Add slides in public/slides/slides.json</p>}
      {outgoing != null && outgoing !== index && views[outgoing] && (
        <div className="slide-out absolute inset-0">{views[outgoing]}</div>
      )}
      {views[index] && <div key={displaySlides[index]?.id || index} className="slide-in absolute inset-0">{views[index]}</div>}
      {!!views.length && (
        <div className="absolute inset-x-0 bottom-0 z-30">
          <SlideProgress progress={progress} />
        </div>
      )}
    </main>
  )
}
