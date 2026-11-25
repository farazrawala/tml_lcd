export const apiBase = "http://localhost/tml_website/admin/api"
export const websiteUrl = "https://thetml.com"

export const settings = {
  infoEmail: "cs@thetml.com",
  salesEmail: "talkto@thetml.com",
  contactNumber: "+818049875470",
  address: "Postal code 658-0025 Hyogo ken Kobe Shi Higashi nada ku Uozaki Minami machi 1-4-17-510",
  usaAddress: "3979 Bisley hills bend, Fulshear TX 77441",
}

export function mediaUrl(path) {
  if (!path) return ""
  if (/^https?:\/\//i.test(path)) return path
  return `http://localhost${path.startsWith("/") ? path : `/${path}`}`
}

async function getJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  const json = await res.json()
  if (!json?.ok) throw new Error(json?.error || "Request failed")
  return json
}

export function fetchVehicles(params) {
  const qs = new URLSearchParams({ page: "1", perPage: "18", ...params })
  return getJson(`${apiBase}/vehicles?${qs}`).then((json) => json.data || [])
}

export function fetchBrands() {
  return getJson(`${apiBase}/stock-brands`).then((json) => json.data || [])
}
