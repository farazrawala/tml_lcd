import { mediaUrl } from "./api"

export function formatPrice(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return "ASK FOR PRICE"
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
}

export function formatKm(value) {
  return `${Number(value || 0).toLocaleString("en-US")} km`
}

export function formatEngine(value) {
  const raw = String(value || "").trim()
  if (!raw || /^0+(\s*cc)?$/i.test(raw)) return "—"
  return /cc/i.test(raw) ? raw.toUpperCase() : `${raw} cc`
}

export function formatLabel(value) {
  const raw = String(value || "").trim()
  if (!raw) return "—"
  return raw.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
}

export function stockNumber(car) {
  if (car?.legacyId) return String(car.legacyId)
  return "—"
}

export function vehicleImage(car) {
  return mediaUrl(car?.image) || "/showroom.jpg"
}

export function offerPricing(car) {
  const sale = Number(car?.price)
  const original = Number(car?.originalPrice)
  if (!(original > sale) || !(sale > 0)) return null
  const percent = Math.round((1 - sale / original) * 100)
  if (percent <= 0 || percent >= 100) return null
  return { original, sale, percent }
}

export function pageOf(items, count, rotation) {
  if (!items?.length || count < 1) return []
  const size = Math.min(count, items.length)
  const start = (rotation * size) % items.length
  return Array.from({ length: size }, (_, index) => items[(start + index) % items.length])
}
