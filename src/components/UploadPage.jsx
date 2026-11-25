import { useState } from "react"

export function UploadPage() {
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function onFiles(list) {
    const files = [...list]
    if (!files.length) return
    setBusy(true)
    setError("")
    const saved = []
    try {
      for (const file of files) {
        const res = await fetch(`/api/upload?name=${encodeURIComponent(file.name)}`, {
          method: "POST",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        })
        const json = await res.json()
        if (!res.ok || !json.ok) throw new Error(json.error || "Upload failed")
        saved.push(json.file)
      }
      setItems((current) => [...saved, ...current])
    } catch (err) {
      setError(err.message || "Upload failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="h-full overflow-auto bg-[#0c0c0c] px-8 py-10 text-white">
      <p className="font-heading text-sm font-bold tracking-[0.35em] text-[#FF5722]">TML GLOBAL</p>
      <h1 className="font-heading mt-2 text-4xl font-extrabold">Upload slide images</h1>
      <p className="mt-3 max-w-2xl text-lg text-white/70">Files are saved into <code className="text-white">public/slides/images</code>. Add or remove slides and image names in <code className="text-white">public/slides/slides.json</code>.</p>
      <label className="mt-8 flex h-48 max-w-2xl cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/30 bg-white/5 text-lg hover:border-[#FF5722]">
        <span>{busy ? "Saving…" : "Choose images"}</span>
        <span className="mt-2 text-sm text-white/50">JPG, PNG, WEBP, GIF, or SVG</span>
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" multiple className="hidden" disabled={busy} onChange={(event) => { onFiles(event.target.files); event.target.value = "" }} />
      </label>
      {error && <p className="mt-4 text-red-400">{error}</p>}
      {!!items.length && (
        <div className="mt-8 max-w-2xl">
          <h2 className="font-heading text-xl font-bold">Saved files</h2>
          <p className="mt-1 text-white/60">Put these names in a slide <code>images</code> array.</p>
          <ul className="mt-4 space-y-2 font-mono text-lg">
            {items.map((file) => <li key={file} className="rounded-lg bg-white/5 px-4 py-3">{file}</li>)}
          </ul>
        </div>
      )}
    </main>
  )
}
