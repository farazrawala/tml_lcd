import { useEffect, useState } from "react"

export const IMAGE_DIR = "/slides/images"

export function money(value) {
  const raw = String(value ?? "").trim()
  if (!raw) return "—"
  const amount = Number(raw.replace(/[$,]/g, ""))
  if (Number.isFinite(amount)) return `$${amount.toLocaleString("en-US")}`
  return raw.startsWith("$") ? raw : `$${raw}`
}

export function periodsOf(person) {
  return [
    ["Monthly", person.monthlyTarget ?? person.target, person.monthlyAchieved],
    ["Quarterly", person.quarterlyTarget ?? person.quarterly, person.quarterlyAchieved ?? person.achieved],
    ["Yearly", person.yearlyTarget, person.yearlyAchieved],
  ]
}

export function isZeroAchieved(value) {
  const raw = String(value ?? "").trim().replace(/[$,]/g, "")
  if (!raw) return true
  const amount = Number(raw)
  return Number.isFinite(amount) && amount === 0
}
export function slideImageUrl(name) {
  const value = String(name || "").trim()
  if (!value) return ""
  if (/^https?:\/\//i.test(value) || value.startsWith("/")) return value
  return `${IMAGE_DIR}/${value}`
}

const TYPES = new Set(["welcome", "featured", "latest", "offers", "why", "brands", "contact", "gallery", "fullscreen", "employees", "employees-v1", "employees-v2", "employees-v3", "employees-v4", "employees-v5", "employees-v6", "employees-v7", "employees-v8", "employees-v9", "employees-v11", "employees-v12"])

export function normalizeSlides(json) {
  const slides = Array.isArray(json?.slides) ? json.slides : []
  const next = slides
    .filter((slide) => slide && TYPES.has(slide.type))
    .map((slide, index) => ({
      id: String(slide.id || `${slide.type}-${index}`),
      type: slide.type,
      images: (Array.isArray(slide.images) ? slide.images : []).map((name) => String(name).trim()).filter(Boolean),
      employees: (Array.isArray(slide.employees) ? slide.employees : []).map((person) => ({
        name: String(person?.name || ""),
        image: String(person?.image || ""),
        target: String(person?.target || ""),
        quarterly: String(person?.quarterly || ""),
        achieved: String(person?.achieved || ""),
      })),
      kicker: slide.kicker || "",
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      supporting: slide.supporting || "",
      cta: slide.cta || "",
      footer: slide.footer || "",
      sheetUrl: slide.sheetUrl || "",
    }))
  return {
    intervalMs: Number(json?.intervalMs) > 0 ? Number(json.intervalMs) : 12000,
    imageMs: Number(json?.imageMs) > 0 ? Number(json.imageMs) : 4000,
    slides: next,
  }
}

export function useSlidesConfig() {
  const [config, setConfig] = useState(() => normalizeSlides({ slides: [] }))
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = () => {
      fetch(`/slides/slides.json?t=${Date.now()}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (cancelled || !json) return
          const next = normalizeSlides(json)
          if (next.slides.length) setConfig(next)
          setReady(true)
        })
        .catch(() => {
          if (!cancelled) setReady(true)
        })
    }
    load()
    const timer = window.setInterval(load, 20000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  return { ...config, ready }
}
