import { useEffect, useState } from "react"

export function useSheetEmployees(slides) {
  const links = [...new Set((slides || []).map((slide) => String(slide.sheetUrl || "").trim()).filter(Boolean))]
  const key = links.join("\n")
  const [sheets, setSheets] = useState({})
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!links.length) {
      setReady(true)
      return undefined
    }
    setReady(false)
    const load = () => {
      Promise.all(links.map((link) => (
        fetch(`/api/sheet?url=${encodeURIComponent(link)}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((json) => [link, Array.isArray(json?.employees) ? json.employees : []])
          .catch(() => [link, []])
      ))).then((entries) => {
        if (cancelled) return
        setSheets(Object.fromEntries(entries))
        setReady(true)
      })
    }
    load()
    const timer = window.setInterval(load, 30000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [key])

  return { sheets, ready }
}

export function applySheet(slide, sheets) {
  const rows = sheets?.[String(slide?.sheetUrl || "").trim()]
  if (!String(slide?.type || "").startsWith("employees") || !rows?.length) return slide
  const photos = new Map((slide.employees || []).map((person) => [String(person.name || "").trim().toLowerCase(), person.image || ""]))
  return {
    ...slide,
    employees: rows.map((row) => ({
      ...row,
      image: row.image || photos.get(String(row.name || "").trim().toLowerCase()) || "",
    })),
  }
}
