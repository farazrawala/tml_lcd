import { useEffect, useState } from "react"
import { ChevronDown, ChevronUp, Copy, Plus, Trash2 } from "lucide-react"
import { slideImageUrl } from "../lib/slides"

const LAYOUTS = [
  ["fullscreen", "Full screen"],
  ["employees", "Employees"],
  ["employees-v1", "Employee V1"],
  ["employees-v2", "Employee V2"],
  ["employees-v3", "Employee V3"],
  ["employees-v4", "Employee V4"],
  ["employees-v5", "Employee layout 6"],
  ["employees-v6", "Employee layout 7"],
  ["employees-v7", "Employee layout 8"],
  ["employees-v8", "Layout 1 · 3 per slide"],
  ["employees-v9", "Layout 9"],
  ["employees-v11", "Layout 11"],
  ["employees-v12", "Version 1 · 1 profile"],
  ["payments-v1", "Payment received v1"],
  ["video", "Full video"],
]

const LEGACY = {
  welcome: "Welcome",
  featured: "Featured cars",
  latest: "Latest arrivals",
  offers: "Special offers",
  why: "Why choose us",
  brands: "Brands",
  contact: "Contact",
  gallery: "Image slide",
}

function emptyEmployee() {
  return { name: "", image: "", target: "", quarterly: "", achieved: "" }
}

function blankSlide(type = "fullscreen") {
  return {
    id: `${type}-${Date.now()}`,
    type,
    images: [],
    employees: String(type).startsWith("employees") || type === "payments-v1" ? [{ ...emptyEmployee(), paymentAmount: "" }] : [],
    kicker: "",
    title: String(type).startsWith("employees") ? "EMPLOYEES PERFORMANCE" : "",
    subtitle: "",
    supporting: "",
    cta: "",
    footer: "",
  }
}

function sessionAge(started) {
  const minutes = Math.max(0, Math.floor((Date.now() - Number(started || Date.now())) / 60000))
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  return `${hours} hr ${minutes % 60} min`
}

function Screens() {
  const [screens, setScreens] = useState([])

  useEffect(() => {
    let stopped = false
    const load = () => {
      fetch("/api/screens")
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (!stopped) setScreens(json?.screens || [])
        })
        .catch(() => {})
    }
    load()
    const timer = window.setInterval(load, 4000)
    return () => {
      stopped = true
      window.clearInterval(timer)
    }
  }, [])

  function reload(id) {
    fetch("/api/screens/reload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id ? { id } : { all: true }),
    }).catch(() => {})
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-extrabold">Active screens</h2>
        <button type="button" onClick={() => reload()} className="h-11 rounded-full bg-[#FF5722] px-5 font-semibold">Reload all</button>
      </div>
      {!screens.length && <p className="mt-3 text-white/60">No screens are open.</p>}
      <ul className="mt-3 flex flex-col gap-2">
        {screens.map((screen) => (
          <li key={screen.id} className="flex items-center justify-between gap-3 rounded-xl bg-black/40 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate font-semibold">{screen.url || screen.path || "/"}</p>
              <p className="mt-1 text-sm text-white/60">{screen.browser || "Browser"} · screen {screen.screen || "—"} · window {screen.viewport || "—"} · open {sessionAge(screen.started)}</p>
            </div>
            <button type="button" onClick={() => reload(screen.id)} className="h-10 shrink-0 rounded-full border border-white/20 px-4 font-semibold">Reload</button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function AdminPage() {
  const [config, setConfig] = useState(null)
  const [files, setFiles] = useState([])
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [addCount, setAddCount] = useState(1)
  const [saving, setSaving] = useState(false)

  async function load() {
    const [slidesRes, imagesRes] = await Promise.all([fetch("/api/slides"), fetch("/api/images")])
    const slides = await slidesRes.json()
    const images = await imagesRes.json()
    setConfig({
      intervalMs: Number(slides.intervalMs) || 12000,
      imageMs: Number(slides.imageMs) || 4000,
      slides: (Array.isArray(slides.slides) ? slides.slides : []).map((slide, index) => ({
        id: slide.id || `slide-${index + 1}`,
        type: slide.type,
        images: Array.isArray(slide.images) ? slide.images : [],
        employees: Array.isArray(slide.employees) ? slide.employees.map((person) => ({
          name: person.name || "",
          image: person.image || "",
          target: person.target || "",
          quarterly: person.quarterly || "",
          achieved: person.achieved || "",
        })) : [],
        kicker: slide.kicker || "",
        title: slide.title || "",
        subtitle: slide.subtitle || "",
        supporting: slide.supporting || "",
        cta: slide.cta || "",
        footer: slide.footer || "",
        sheetUrl: slide.sheetUrl || "",
      })),
    })
    setFiles(images.files || [])
  }

  useEffect(() => {
    load().catch(() => setError("Could not load slides."))
  }, [])

  function updateSlide(index, patch) {
    setConfig((current) => ({
      ...current,
      slides: current.slides.map((slide, i) => (i === index ? { ...slide, ...patch } : slide)),
    }))
  }

  function move(index, direction) {
    setConfig((current) => {
      const next = [...current.slides]
      const target = index + direction
      if (target < 0 || target >= next.length) return current
      const [item] = next.splice(index, 1)
      next.splice(target, 0, item)
      return { ...current, slides: next }
    })
  }

  function addEmployees(index, amount) {
    const count = Math.min(20, Math.max(1, Number(amount) || 1))
    setConfig((current) => ({
      ...current,
      slides: current.slides.map((slide, i) => (
        i === index
          ? { ...slide, employees: [...(slide.employees || []), ...Array.from({ length: count }, emptyEmployee)] }
          : slide
      )),
    }))
  }

  function updateEmployee(index, personIndex, patch) {
    setConfig((current) => ({
      ...current,
      slides: current.slides.map((slide, i) => {
        if (i !== index) return slide
        return {
          ...slide,
          employees: (slide.employees || []).map((person, n) => (n === personIndex ? { ...person, ...patch } : person)),
        }
      }),
    }))
  }

  async function storeFiles(list) {
    const names = []
    for (const file of list) {
      const res = await fetch(`/api/upload?name=${encodeURIComponent(file.name)}`, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || "Upload failed")
      names.push(json.file)
    }
    const images = names.filter((name) => !/\.(mp4|webm)$/i.test(name))
    setFiles((current) => [...new Set([...images, ...current])].sort())
    return names
  }

  async function upload(index, list, personIndex) {
    setError("")
    const names = await storeFiles(list)
    setConfig((current) => ({
      ...current,
      slides: current.slides.map((slide, i) => {
        if (i !== index) return slide
        if (personIndex == null) return { ...slide, images: slide.type === "video" ? names.slice(0, 1) : [...slide.images, ...names] }
        return {
          ...slide,
          employees: (slide.employees || []).map((person, n) => (n === personIndex ? { ...person, image: names[0] || person.image } : person)),
        }
      }),
    }))
  }

  async function save() {
    setSaving(true)
    setError("")
    setMessage("")
    try {
      const res = await fetch("/api/slides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || "Save failed")
      setMessage("Saved to public/slides/slides.json. The display picks this up within a few seconds.")
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteFile(name) {
    const res = await fetch(`/api/images?name=${encodeURIComponent(name)}`, { method: "DELETE" })
    const json = await res.json()
    if (!res.ok || !json.ok) {
      setError(json.error || "Could not delete image")
      return
    }
    setFiles((current) => current.filter((file) => file !== name))
    setConfig((current) => ({
      ...current,
      slides: current.slides.map((slide) => ({
        ...slide,
        images: slide.images.filter((image) => image !== name),
        employees: (slide.employees || []).map((person) => (person.image === name ? { ...person, image: "" } : person)),
      })),
    }))
  }

  if (!config) {
    return <main className="grid h-full place-items-center bg-[#0c0c0c] text-xl text-white">{error || "Loading slides…"}</main>
  }

  return (
    <main className="h-full overflow-y-auto bg-[#0c0c0c] text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-heading text-sm font-bold tracking-[0.35em] text-[#FF5722]">TML GLOBAL</p>
            <h1 className="font-heading text-4xl font-extrabold">Slide manager</h1>
          </div>
          <a href="/lcd-display" className="rounded-full bg-white/10 px-5 py-3 font-semibold hover:bg-white/20">Open display</a>
        </header>

        <Screens />

        <section className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:grid-cols-2">
          <label className="block text-sm text-white/70">Slide time (seconds)
            <input type="number" min="3" max="120" value={Math.round(config.intervalMs / 1000)} onChange={(event) => setConfig({ ...config, intervalMs: Number(event.target.value) * 1000 })} className="mt-2 h-12 w-full rounded-xl border border-white/15 bg-black px-4 text-lg text-white" />
          </label>
          <label className="block text-sm text-white/70">Image time inside a slide (seconds)
            <input type="number" min="1" max="60" value={Math.round(config.imageMs / 1000)} onChange={(event) => setConfig({ ...config, imageMs: Number(event.target.value) * 1000 })} className="mt-2 h-12 w-full rounded-xl border border-white/15 bg-black px-4 text-lg text-white" />
          </label>
        </section>

        {config.slides.map((slide, index) => (
          <article key={`${slide.id}-${index}`} className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-heading text-lg font-bold text-[#FF5722]">{String(index + 1).padStart(2, "0")}</span>
              <select value={slide.type} onChange={(event) => { const value = event.target.value; updateSlide(index, value.startsWith("employees") ? { type: value, employees: slide.employees?.length ? slide.employees : [emptyEmployee()] } : { type: value }) }} className="h-11 rounded-xl border border-white/15 bg-black px-3">
                {LAYOUTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                {LEGACY[slide.type] && <option value={slide.type}>{LEGACY[slide.type]}</option>}
              </select>
              <input value={slide.id} onChange={(event) => updateSlide(index, { id: event.target.value })} className="h-11 min-w-40 flex-1 rounded-xl border border-white/15 bg-black px-3" aria-label="Slide id" />
              <button type="button" aria-label="Move slide up" onClick={() => move(index, -1)} className="flex size-11 items-center justify-center rounded-full border border-white/15"><ChevronUp /></button>
              <button type="button" aria-label="Move slide down" onClick={() => move(index, 1)} className="flex size-11 items-center justify-center rounded-full border border-white/15"><ChevronDown /></button>
              <button type="button" aria-label="Remove slide" onClick={() => setConfig({ ...config, slides: config.slides.filter((_, i) => i !== index) })} className="flex size-11 items-center justify-center rounded-full border border-red-400/40 text-red-300"><Trash2 className="size-5" /></button>
            </div>

            {slide.type !== "video" && (
              <label className="mt-4 block text-sm text-white/60">This slide (seconds). Leave empty to use the shared slide time.
                <input type="number" min="3" max="300" value={slide.seconds || ""} placeholder={String(Math.round(config.intervalMs / 1000))} onChange={(event) => updateSlide(index, { seconds: Number(event.target.value) || 0 })} className="mt-1 h-11 w-40 rounded-xl border border-white/10 bg-black px-3 text-white" />
              </label>
            )}

            <label className="mt-4 block text-sm text-white/60">Google Sheet link
              <input value={slide.sheetUrl || ""} onChange={(event) => updateSlide(index, { sheetUrl: event.target.value })} placeholder="Open the tab, then paste that link (it includes gid=)" className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-white" />
            </label>

            {slide.type === "payments-v1" ? (
              <div className="mt-4 space-y-4">
                {(slide.employees || []).map((person, personIndex) => (
                  <div key={personIndex} className="grid gap-3 rounded-2xl border border-white/10 p-4 md:grid-cols-[160px_1fr_1fr_auto]">
                    <div>
                      <img src={person.image ? slideImageUrl(person.image) : "/default-employee.png"} alt="" className={`h-32 w-full rounded-xl bg-[#1a1a1a] ${person.image ? "object-cover" : "object-contain"}`} />
                      <label className="mt-2 block cursor-pointer text-center text-sm text-[#FF5722]">
                        Upload image
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" className="hidden" onChange={(event) => { upload(index, event.target.files, personIndex).catch((err) => setError(err.message)); event.target.value = "" }} />
                      </label>
                    </div>
                    <label className="text-sm text-white/60">Name
                      <input value={person.name} onChange={(event) => updateEmployee(index, personIndex, { name: event.target.value })} className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-white" />
                    </label>
                    <label className="text-sm text-white/60">Amount received
                      <input value={person.paymentAmount || ""} onChange={(event) => updateEmployee(index, personIndex, { paymentAmount: event.target.value })} className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-white" />
                    </label>
                    <div className="flex items-start">
                      <button type="button" aria-label="Remove payment" onClick={() => updateSlide(index, { employees: slide.employees.filter((_, i) => i !== personIndex) })} className="flex size-11 items-center justify-center rounded-full border border-red-400/40 text-red-300"><Trash2 className="size-5" /></button>
                    </div>
                    {!!files.length && (
                      <label className="text-sm text-white/60 md:col-span-4">Image already in the folder
                        <select value={person.image || ""} onChange={(event) => updateEmployee(index, personIndex, { image: event.target.value })} className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-white">
                          <option value="">No image</option>
                          {files.map((file) => <option key={file} value={file}>{file}</option>)}
                        </select>
                      </label>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => updateSlide(index, { employees: [...(slide.employees || []), { ...emptyEmployee(), paymentAmount: "" }] })} className="font-heading h-12 rounded-full bg-[#FF5722] px-6 font-bold">Add payment</button>
              </div>
            ) : String(slide.type).startsWith("employees") ? (
              <div className="mt-4 space-y-4">
                <label className="block text-sm text-white/60">Heading
                  <input value={slide.title || ""} onChange={(event) => updateSlide(index, { title: event.target.value })} className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-white" />
                </label>
                {(slide.employees || []).map((person, personIndex) => (
                  <div key={personIndex} className="grid gap-3 rounded-2xl border border-white/10 p-4 md:grid-cols-[140px_1fr_1fr_1fr_1fr_auto]">
                    <div>
                      <img src={person.image ? slideImageUrl(person.image) : "/default-employee.png"} alt="" className={`h-28 w-full rounded-xl bg-[#1a1a1a] ${person.image ? "object-cover" : "object-contain"}`} />
                      <label className="mt-2 block cursor-pointer text-center text-sm text-[#FF5722]">
                        Upload
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" className="hidden" onChange={(event) => { upload(index, event.target.files, personIndex).catch((err) => setError(err.message)); event.target.value = "" }} />
                      </label>
                    </div>
                    <label className="text-sm text-white/60">Employee
                      <input value={person.name} onChange={(event) => updateEmployee(index, personIndex, { name: event.target.value })} className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-white" />
                    </label>
                    <label className="text-sm text-white/60">Target
                      <input value={person.target} onChange={(event) => updateEmployee(index, personIndex, { target: event.target.value })} className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-white" />
                    </label>
                    <label className="text-sm text-white/60">Quarterly
                      <input value={person.quarterly} onChange={(event) => updateEmployee(index, personIndex, { quarterly: event.target.value })} className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-white" />
                    </label>
                    <label className="text-sm text-white/60">Achieved
                      <input value={person.achieved || ""} onChange={(event) => updateEmployee(index, personIndex, { achieved: event.target.value })} className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-white" />
                    </label>
                    <div className="flex flex-col items-center justify-between">
                      <button type="button" aria-label="Duplicate employee" onClick={() => updateSlide(index, { employees: slide.employees.flatMap((person, i) => (i === personIndex ? [person, { ...person }] : [person])) })} className="flex size-11 items-center justify-center rounded-full border border-white/20 text-white/80"><Copy className="size-5" /></button>
                      <button type="button" aria-label="Remove employee" onClick={() => updateSlide(index, { employees: slide.employees.filter((_, i) => i !== personIndex) })} className="flex size-11 items-center justify-center rounded-full border border-red-400/40 text-red-300"><Trash2 className="size-5" /></button>
                    </div>
                    {!!files.length && (
                      <label className="text-sm text-white/60 md:col-span-6">Image already in the folder
                        <select value={person.image} onChange={(event) => updateEmployee(index, personIndex, { image: event.target.value })} className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-white">
                          <option value="">Default photo</option>
                          {files.map((file) => <option key={file} value={file}>{file}</option>)}
                        </select>
                      </label>
                    )}
                  </div>
                ))}
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={() => addEmployees(index, 1)} className="font-heading h-12 rounded-full bg-[#FF5722] px-6 font-bold">Add employee</button>
                  <label className="flex items-center gap-2 text-sm text-white/70">Add multiple
                    <input type="number" min="1" max="20" value={addCount} onChange={(event) => setAddCount(event.target.value)} className="h-12 w-20 rounded-xl border border-white/15 bg-black px-3 text-white" />
                  </label>
                  <button type="button" onClick={() => addEmployees(index, addCount)} className="h-12 rounded-full border border-white/20 px-5 font-semibold">Add {Math.min(20, Math.max(1, Number(addCount) || 1))}</button>
                </div>
              </div>
            ) : (
            <>
            {slide.type !== "fullscreen" && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[["kicker", "Kicker"], ["title", "Title"], ["subtitle", "Subtitle"], ["supporting", "Supporting text"], ["cta", "Button"], ["footer", "Footer"]].map(([key, label]) => (
                <label key={key} className="block text-sm text-white/60">{label}
                  {key === "title" ? (
                    <textarea value={slide[key] || ""} rows={2} onChange={(event) => updateSlide(index, { [key]: event.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-white" />
                  ) : (
                    <input value={slide[key] || ""} onChange={(event) => updateSlide(index, { [key]: event.target.value })} className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-white" />
                  )}
                </label>
              ))}
            </div>
            )}

            {slide.type === "video" ? (
              <div className="mt-4">
                <label className="flex h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/25 text-sm text-white/70">
                  <Plus className="size-5" />
                  Upload video
                  <input type="file" accept="video/mp4,video/webm,.mp4,.webm" className="hidden" onChange={(event) => { upload(index, event.target.files).catch((err) => setError(err.message)); event.target.value = "" }} />
                </label>
                {!!slide.images[0] && <p className="mt-2 text-sm text-white/70">{slide.images[0]}</p>}
              </div>
            ) : (
            <>
            <div className="mt-4 flex flex-wrap gap-3">
              {slide.images.map((image) => (
                <figure key={image} className="w-36">
                  <img src={slideImageUrl(image)} alt="" className="h-24 w-full rounded-xl object-cover" />
                  <figcaption className="mt-1 truncate text-xs text-white/60">{image}</figcaption>
                  <button type="button" onClick={() => updateSlide(index, { images: slide.images.filter((name) => name !== image) })} className="mt-1 text-sm text-red-300">Remove</button>
                </figure>
              ))}
              <label className="flex h-24 w-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/25 text-sm text-white/70">
                <Plus className="size-5" />
                Upload
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" multiple className="hidden" onChange={(event) => { upload(index, event.target.files).catch((err) => setError(err.message)); event.target.value = "" }} />
              </label>
            </div>
            {!!files.length && (
              <label className="mt-3 block text-sm text-white/60">Add an image already in the folder
                <select defaultValue="" onChange={(event) => { if (event.target.value) updateSlide(index, { images: [...slide.images, event.target.value] }); event.target.value = "" }} className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-white">
                  <option value="">Choose a file</option>
                  {files.map((file) => <option key={file} value={file}>{file}</option>)}
                </select>
              </label>
            )}
            </>
            )}
            </>
            )}
          </article>
        ))}

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => setConfig({ ...config, slides: [...config.slides, blankSlide("fullscreen")] })} className="h-12 rounded-full border border-white/20 px-6 font-semibold">Add full screen slide</button>
          <button type="button" onClick={() => setConfig({ ...config, slides: [...config.slides, blankSlide("employees")] })} className="h-12 rounded-full border border-white/20 px-6 font-semibold">Add employees slide</button>
          <button type="button" onClick={() => setConfig({ ...config, slides: [...config.slides, blankSlide("employees-v1")] })} className="h-12 rounded-full border border-white/20 px-6 font-semibold">Add Employee V1</button>
          <button type="button" onClick={() => setConfig({ ...config, slides: [...config.slides, blankSlide("employees-v2")] })} className="h-12 rounded-full border border-white/20 px-6 font-semibold">Add Employee V2</button>
          <button type="button" onClick={() => setConfig({ ...config, slides: [...config.slides, blankSlide("employees-v3")] })} className="h-12 rounded-full border border-white/20 px-6 font-semibold">Add Employee V3</button>
          <button type="button" onClick={() => setConfig({ ...config, slides: [...config.slides, blankSlide("employees-v4")] })} className="h-12 rounded-full border border-white/20 px-6 font-semibold">Add Employee V4</button>
          <button type="button" onClick={() => setConfig({ ...config, slides: [...config.slides, blankSlide("employees-v5")] })} className="h-12 rounded-full border border-white/20 px-6 font-semibold">Add layout 6</button>
          <button type="button" onClick={() => setConfig({ ...config, slides: [...config.slides, blankSlide("employees-v6")] })} className="h-12 rounded-full border border-white/20 px-6 font-semibold">Add layout 7</button>
          <button type="button" onClick={() => setConfig({ ...config, slides: [...config.slides, blankSlide("employees-v7")] })} className="h-12 rounded-full border border-white/20 px-6 font-semibold">Add layout 8</button>
          <button type="button" onClick={() => setConfig({ ...config, slides: [...config.slides, blankSlide("employees-v8")] })} className="h-12 rounded-full border border-white/20 px-6 font-semibold">Add layout 1 · 3</button>
          <button type="button" onClick={() => setConfig({ ...config, slides: [...config.slides, blankSlide("employees-v9")] })} className="h-12 rounded-full border border-white/20 px-6 font-semibold">Add layout 9</button>
          <button type="button" onClick={() => setConfig({ ...config, slides: [...config.slides, blankSlide("employees-v11")] })} className="h-12 rounded-full border border-white/20 px-6 font-semibold">Add layout 11</button>
          <button type="button" onClick={() => setConfig({ ...config, slides: [...config.slides, blankSlide("employees-v12")] })} className="h-12 rounded-full border border-white/20 px-6 font-semibold">Add version 1 · 1 profile</button>
          <button type="button" onClick={() => setConfig({ ...config, slides: [...config.slides, blankSlide("payments-v1")] })} className="h-12 rounded-full border border-white/20 px-6 font-semibold">Add payment received v1</button>
          <button type="button" onClick={() => setConfig({ ...config, slides: [...config.slides, blankSlide("video")] })} className="h-12 rounded-full border border-white/20 px-6 font-semibold">Add full video</button>
        </div>

        <section className="rounded-2xl border border-white/10 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-xl font-bold">Image folder</h2>
              <p className="mt-1 text-white/60">Uploads are stored in public/slides/images. Deleting a file removes it from every slide when you save.</p>
            </div>
            <label className="cursor-pointer rounded-full bg-[#FF5722] px-5 py-3 font-semibold text-white">
              Upload images
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" multiple className="hidden" onChange={(event) => { storeFiles(event.target.files).catch((err) => setError(err.message)); event.target.value = "" }} />
            </label>
          </div>
          <ul className="mt-4 flex flex-wrap gap-3">
            {files.map((file) => (
              <li key={file} className="w-36">
                <img src={slideImageUrl(file)} alt="" className="h-20 w-full rounded-lg object-cover" />
                <p className="mt-1 truncate text-xs">{file}</p>
                <button type="button" onClick={() => navigator.clipboard.writeText(slideImageUrl(file)).then(() => setMessage(`Copied ${slideImageUrl(file)}`)).catch(() => setError("Could not copy the path."))} className="text-sm text-[#FF5722]">Copy path</button>
                <button type="button" onClick={() => deleteFile(file)} className="block text-sm text-red-300">Delete file</button>
              </li>
            ))}
          </ul>
        </section>

        {error && <p className="text-red-300">{error}</p>}
        {message && <p className="text-emerald-300">{message}</p>}
        <button type="button" disabled={saving} onClick={save} className="font-heading h-14 rounded-full bg-gradient-to-r from-[#F35938] to-[#FF6E24] text-lg font-extrabold disabled:opacity-60">{saving ? "Saving…" : "Save slides"}</button>
      </div>
    </main>
  )
}
