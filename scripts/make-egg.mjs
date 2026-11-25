import fs from "node:fs"
import { GIFEncoder, quantize, applyPalette } from "gifenc/dist/gifenc.esm.js"

const W = 96
const H = 96

function frame(draw) {
  const data = new Uint8Array(W * H * 4)
  const set = (x, y, r, g, b, a = 255) => {
    x = Math.round(x)
    y = Math.round(y)
    if (x < 0 || y < 0 || x >= W || y >= H) return
    const i = (y * W + x) * 4
    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
    data[i + 3] = a
  }
  const egg = (cx, cy, rx, ry, color) => {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const nx = (x - cx) / rx
        const ny = (y - cy) / ry
        if (nx * nx + ny * ny <= 1) set(x, y, ...color)
      }
    }
  }
  draw(set, egg)
  return data
}

const shell = [245, 245, 240]
const shade = [210, 210, 205]
const yolk = [255, 196, 40]
const yolkDeep = [230, 140, 20]
const crack = [40, 40, 40]

const frames = [
  frame((set, egg) => {
    egg(48, 50, 28, 36, shell)
    egg(40, 46, 8, 10, shade)
  }),
  frame((set, egg) => {
    egg(48, 50, 28, 36, shell)
    for (let i = -18; i < 18; i++) set(48 + i * 0.3, 42 + Math.sin(i) * 3, ...crack)
  }),
  frame((set, egg) => {
    egg(34, 52, 20, 28, shell)
    egg(62, 52, 20, 28, shell)
    egg(48, 58, 10, 8, yolk)
  }),
  frame((set, egg) => {
    egg(28, 46, 18, 24, shell)
    egg(68, 46, 18, 24, shell)
    egg(48, 68, 12, 9, yolkDeep)
    egg(48, 66, 8, 6, yolk)
  }),
  frame((set, egg) => {
    egg(24, 40, 16, 20, shell)
    egg(72, 40, 16, 20, shell)
    egg(48, 74, 14, 10, yolkDeep)
    egg(48, 72, 9, 7, yolk)
  }),
]

const gif = GIFEncoder()
for (const rgba of frames) {
  const palette = quantize(rgba, 32, { format: "rgba4444" })
  const index = applyPalette(rgba, palette, "rgba4444")
  const transparentIndex = Math.max(0, palette.findIndex((color) => color[3] === 0))
  gif.writeFrame(index, W, H, { palette, delay: 700, transparent: true, transparentIndex })
}
gif.finish()
fs.writeFileSync("public/egg-broken.gif", Buffer.from(gif.bytes()))
console.log("wrote egg")
