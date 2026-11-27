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
  const type = String(slide?.type || "")
  if ((!type.startsWith("employees") && type !== "payments-v1") || !rows?.length) return slide
  if (type === "payments-v1") {
    const payments = rows
      .filter((row) => row.paymentName || row.paymentAmount)
      .map((row) => ({
        name: row.paymentName || row.name,
        paymentAmount: row.paymentAmount,
        image: row.paymentImage || row.image || "",
      }))
    return payments.length ? { ...slide, employees: payments } : slide
  }
  const photos = new Map((slide.employees || []).map((person) => [String(person.name || "").trim().toLowerCase(), person.image || ""]))
  let employees = rows.map((row) => ({
    ...row,
    image: row.image || photos.get(String(row.name || "").trim().toLowerCase()) || "",
  }))
  if (type === "employees-v12") {
    const amount = (value) => {
      const number = Number(String(value ?? "").replace(/[^0-9.-]/g, ""))
      return Number.isFinite(number) ? number : 0
    }
    employees = employees.slice().sort((a, b) => amount(b.monthlyAchieved) - amount(a.monthlyAchieved))
  }
  return { ...slide, employees }
}
