import { useCallback, useEffect, useState } from "react"
import { fetchBrands, fetchVehicles } from "./api"

const REFRESH_MS = 5 * 60 * 1000

const empty = {
  status: "loading",
  featured: [],
  usingStock: false,
  latest: [],
  offers: [],
  brands: [],
  error: "",
}

export function useInventory() {
  const [data, setData] = useState(empty)

  const load = useCallback(async () => {
    try {
      const [recommended, latest, offers, brands] = await Promise.all([
        fetchVehicles({ recommended: "1", hasImage: "1", sort: "updated" }),
        fetchVehicles({ sort: "newest", hasImage: "1" }),
        fetchVehicles({ clearance: "1", hasImage: "1" }),
        fetchBrands(),
      ])
      let featured = recommended
      let usingStock = false
      if (!featured.length) {
        featured = await fetchVehicles({ hasImage: "1", hasPrice: "1", sort: "updated" })
        usingStock = true
      }
      setData({ status: "ready", featured, usingStock, latest, offers, brands, error: "" })
    } catch {
      setData((current) => ({
        ...current,
        status: current.featured.length || current.latest.length ? "ready" : "error",
        error: "Inventory could not be refreshed.",
      }))
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(load, 0)
    const refresh = window.setInterval(load, REFRESH_MS)
    return () => {
      window.clearTimeout(timer)
      window.clearInterval(refresh)
    }
  }, [load])

  return data
}
