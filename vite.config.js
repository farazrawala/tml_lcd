import fs from "node:fs"
import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const imageDir = path.resolve("public/slides/images")
const videoDir = path.resolve("public/videos")
const slidesFile = path.resolve("public/slides/slides.json")
const screensFile = path.resolve("data/screens.json")
const allowed = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".mp4", ".webm"])
const videoExt = new Set([".mp4", ".webm"])
const slideTypes = new Set(["welcome", "featured", "latest", "offers", "why", "brands", "contact", "gallery", "fullscreen", "employees", "employees-v1", "employees-v2", "employees-v3", "employees-v4", "employees-v5", "employees-v6", "employees-v7", "employees-v8", "employees-v9", "employees-v11", "employees-v12", "video"])

function safeName(raw) {
  const base = path.basename(String(raw || "")).replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+/, "")
  const ext = path.extname(base).toLowerCase()
  const stem = path.basename(base, path.extname(base)).slice(0, 80) || `image-${Date.now()}`
  if (!allowed.has(ext)) return ""
  return `${stem}${ext}`
}

function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(body))
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on("data", (chunk) => {
      size += chunk.length
      if (size > limit) {
        reject(Object.assign(new Error("File is too large."), { status: 413 }))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on("end", () => resolve(Buffer.concat(chunks)))
    req.on("error", reject)
  })
}

function listImages() {
  fs.mkdirSync(imageDir, { recursive: true })
  return fs.readdirSync(imageDir).filter((name) => allowed.has(path.extname(name).toLowerCase())).sort()
}

function cleanConfig(body) {
  if (!body || !Array.isArray(body.slides)) throw Object.assign(new Error("Slides must be a list."), { status: 400 })
  const slides = body.slides.map((slide, index) => {
    if (!slideTypes.has(slide?.type)) throw Object.assign(new Error("Unknown slide type."), { status: 400 })
    const images = (Array.isArray(slide.images) ? slide.images : []).map((name) => safeName(name)).filter(Boolean)
    const employees = (Array.isArray(slide.employees) ? slide.employees : []).map((person) => ({
      name: String(person?.name || "").slice(0, 80),
      image: safeName(person?.image || ""),
      target: String(person?.target || "").slice(0, 40),
      quarterly: String(person?.quarterly || "").slice(0, 40),
      achieved: String(person?.achieved || "").slice(0, 40),
    })).filter((person) => person.name || person.image || person.target || person.quarterly || person.achieved)
    return {
      id: String(slide.id || `${slide.type}-${index + 1}`).replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 40),
      type: slide.type,
      images,
      employees,
      kicker: String(slide.kicker || ""),
      title: String(slide.title || ""),
      subtitle: String(slide.subtitle || ""),
      supporting: String(slide.supporting || ""),
      cta: String(slide.cta || ""),
      footer: String(slide.footer || ""),
      sheetUrl: String(slide.sheetUrl || "").trim().slice(0, 500),
    }
  })
  return {
    intervalMs: Math.min(120000, Math.max(3000, Number(body.intervalMs) || 12000)),
    imageMs: Math.min(60000, Math.max(1000, Number(body.imageMs) || 4000)),
    slides,
  }
}

function sheetCsvUrl(value) {
  const text = String(value || "").trim()
  const match = text.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  const gid = text.match(/[?#&]gid=(\d+)/)
  if (match) {
    const tab = gid ? `&gid=${gid[1]}` : ""
    return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv${tab}`
  }
  if (/^https:\/\/docs\.google\.com\/spreadsheets\/d\/.+\/export/i.test(text)) return text
  return ""
}


function splitCsv(line) {
  const cells = []
  let current = ""
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"'
        i++
      } else quoted = !quoted
    } else if (char === "," && !quoted) {
      cells.push(current)
      current = ""
    } else current += char
  }
  cells.push(current)
  return cells
}

function parseSheet(csv) {
  const lines = String(csv || "").replace(/^\uFEFF/, "").trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []
  const headers = splitCsv(lines[0]).map((cell) => cell.trim().toLowerCase().replace(/\s+/g, " "))
  const column = (...names) => headers.findIndex((header) => names.includes(header))
  const cell = (cells, index) => (index >= 0 ? (cells[index] || "").trim() : "")
  const nameIndex = column("names", "name", "employee")
  const monthlyTarget = column("monthly target", "target")
  const monthlyAchieved = column("achieved monthly", "acheived monthly")
  const quarterlyTarget = column("quarterly target", "quaterly target", "quarterly", "quaterly")
  const quarterlyAchieved = column("achieved quarterly", "acheived quarterly", "achieved", "acheived")
  const yearlyTarget = column("yearly target")
  const yearlyAchieved = column("achieved yearly", "acheived yearly")
  const imageIndex = column("image path", "image", "photo", "picture")
  const percentIndex = column("achieve percent", "achieved percent", "achievement percent", "percent")
  const statusIndex = column("status")
  return lines.slice(1).map((line) => {
    const cells = splitCsv(line)
    const monthlyTargetValue = cell(cells, monthlyTarget)
    const quarterlyTargetValue = cell(cells, quarterlyTarget)
    const quarterlyAchievedValue = cell(cells, quarterlyAchieved)
    return {
      name: cell(cells, nameIndex),
      monthlyTarget: monthlyTargetValue,
      monthlyAchieved: cell(cells, monthlyAchieved),
      quarterlyTarget: quarterlyTargetValue,
      quarterlyAchieved: quarterlyAchievedValue,
      yearlyTarget: cell(cells, yearlyTarget),
      yearlyAchieved: cell(cells, yearlyAchieved),
      target: monthlyTargetValue,
      quarterly: quarterlyTargetValue,
      achieved: quarterlyAchievedValue,
      image: cell(cells, imageIndex),
      achievePercent: cell(cells, percentIndex),
      status: cell(cells, statusIndex),
    }
  }).filter((row) => row.name && (statusIndex < 0 || row.status.toLowerCase() === "active"))
}
function readScreens() {
  try {
    return JSON.parse(fs.readFileSync(screensFile, "utf8"))
  } catch {
    return {}
  }
}

function writeScreens(data) {
  fs.mkdirSync(path.dirname(screensFile), { recursive: true })
  fs.writeFileSync(screensFile, JSON.stringify(data))
}

function liveScreens(data) {
  const now = Date.now()
  return Object.values(data).filter((screen) => now - screen.seen < 12000).sort((a, b) => String(a.path).localeCompare(String(b.path)))
}

function slideUploadPlugin() {
  const handle = (req, res, next) => {
    const url = new URL(req.url || "/", "http://localhost")
    if (!url.pathname.startsWith("/api/")) {
      next()
      return
    }
    if (url.pathname === "/api/screens" && req.method === "GET") {
      sendJson(res, 200, { ok: true, screens: liveScreens(readScreens()) })
      return
    }
    if (url.pathname === "/api/screens" && req.method === "POST") {
      readBody(req, 10000).then((buffer) => {
        const body = JSON.parse(buffer.toString("utf8") || "{}")
        const id = String(body.id || "").replace(/[^a-zA-Z0-9-]/g, "").slice(0, 40)
        if (!id) {
          sendJson(res, 400, { ok: false })
          return
        }
        const data = readScreens()
        const reload = Boolean(data[id]?.reload)
        const started = Number(body.started) || data[id]?.started || Date.now()
        data[id] = {
          id,
          path: String(body.path || "/").slice(0, 80),
          url: String(body.url || "").slice(0, 200),
          browser: String(body.browser || "").slice(0, 80),
          screen: String(body.screen || "").slice(0, 20),
          viewport: String(body.viewport || "").slice(0, 20),
          started,
          seen: Date.now(),
          reload: false,
        }
        writeScreens(data)
        sendJson(res, 200, { ok: true, reload })
      }).catch(() => sendJson(res, 400, { ok: false }))
      return
    }
    if (url.pathname === "/api/screens/reload" && req.method === "POST") {
      readBody(req, 10000).then((buffer) => {
        const body = JSON.parse(buffer.toString("utf8") || "{}")
        const data = readScreens()
        if (body.all) Object.values(data).forEach((screen) => { screen.reload = true })
        else if (data[body.id]) data[body.id].reload = true
        writeScreens(data)
        sendJson(res, 200, { ok: true })
      }).catch(() => sendJson(res, 400, { ok: false }))
      return
    }
    if (url.pathname === "/api/sheet" && req.method === "GET") {
      const sheetCsv = sheetCsvUrl(url.searchParams.get("url"))
      if (!sheetCsv) {
        sendJson(res, 200, { ok: true, employees: [] })
        return
      }
      fetch(sheetCsv)
        .then((response) => {
          if (!response.ok) throw new Error("Google Sheet could not be read.")
          return response.text()
        })
        .then((csv) => sendJson(res, 200, { ok: true, employees: parseSheet(csv) }))
        .catch((error) => sendJson(res, 502, { ok: false, error: error.message || "Google Sheet could not be read." }))
      return
    }
    if (url.pathname === "/api/slides" && req.method === "GET") {
      const raw = fs.existsSync(slidesFile) ? fs.readFileSync(slidesFile, "utf8") : "{\"slides\":[]}"
      res.setHeader("Content-Type", "application/json")
      res.end(raw)
      return
    }
    if (url.pathname === "/api/slides" && req.method === "PUT") {
      readBody(req, 1024 * 1024)
        .then((buffer) => {
          const saved = cleanConfig(JSON.parse(buffer.toString("utf8") || "{}"))
          fs.mkdirSync(path.dirname(slidesFile), { recursive: true })
          fs.writeFileSync(slidesFile, `${JSON.stringify(saved, null, 2)}\n`)
          sendJson(res, 200, { ok: true })
        })
        .catch((error) => sendJson(res, error.status || 400, { ok: false, error: error.message || "Could not save slides." }))
      return
    }
    if (url.pathname === "/api/images" && req.method === "GET") {
      sendJson(res, 200, { ok: true, files: listImages() })
      return
    }
    if (url.pathname === "/api/images" && req.method === "DELETE") {
      const name = safeName(url.searchParams.get("name"))
      const target = name && path.join(imageDir, name)
      if (!name || !target || !fs.existsSync(target)) {
        sendJson(res, 404, { ok: false, error: "Image not found." })
        return
      }
      fs.unlinkSync(target)
      sendJson(res, 200, { ok: true })
      return
    }
    if (url.pathname !== "/api/upload" || req.method !== "POST") {
      next()
      return
    }
    const name = safeName(url.searchParams.get("name"))
    if (!name) {
      res.statusCode = 400
      res.setHeader("Content-Type", "application/json")
      res.end(JSON.stringify({ ok: false, error: "Use a jpg, png, webp, gif, or svg file." }))
      return
    }
    const ext = path.extname(name)
    const folder = videoExt.has(ext) ? videoDir : imageDir
    fs.mkdirSync(folder, { recursive: true })
    const file = `${path.basename(name, ext)}-${Date.now()}${ext}`
    const chunks = []
    let size = 0
    req.on("data", (chunk) => {
      size += chunk.length
      if (size > 80 * 1024 * 1024) {
        res.statusCode = 413
        res.setHeader("Content-Type", "application/json")
        res.end(JSON.stringify({ ok: false, error: "File must be 80 MB or smaller." }))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on("end", () => {
      if (res.writableEnded) return
      fs.writeFileSync(path.join(folder, file), Buffer.concat(chunks))
      res.setHeader("Content-Type", "application/json")
      res.end(JSON.stringify({ ok: true, file, folder: "public/slides/images" }))
    })
    req.on("error", () => {
      if (!res.writableEnded) {
        res.statusCode = 500
        res.end(JSON.stringify({ ok: false, error: "Upload failed." }))
      }
    })
  }

  return {
    name: "slide-upload",
    configureServer(server) {
      server.middlewares.use(handle)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handle)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), slideUploadPlugin()],
  server: {
    host: true,
    port: 5180,
  },
})
