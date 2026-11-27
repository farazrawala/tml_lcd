import { useEffect, useState } from "react"
import confetti from "canvas-confetti"
import { money, slideImageUrl } from "../lib/slides"

function amountOf(row) {
  return row.paymentAmount || row.monthlyAchieved || row.achieved || ""
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min
}

const countAudio = new Audio()
countAudio.preload = "auto"

function playCount(number) {
  countAudio.src = `/sounds/count-${number}.wav`
  countAudio.volume = 1
  countAudio.currentTime = 0
  return countAudio.play()
}

function playCelebration() {
  const audio = new Audio("/sounds/crowd-cheer.mp3")
  audio.volume = 1
  audio.play().catch(() => {})
  return audio
}

function celebrate() {
  const audio = playCelebration()
  confetti({
    angle: randomInRange(55, 125),
    spread: randomInRange(50, 70),
    particleCount: Math.floor(randomInRange(50, 100)),
    origin: { y: 0.6 },
    zIndex: 100,
  })
  const duration = 3500
  const end = Date.now() + duration
  const defaults = { startVelocity: 28, spread: 360, ticks: 40, zIndex: 100 }
  const timer = window.setInterval(() => {
    const timeLeft = end - Date.now()
    if (timeLeft <= 0) {
      window.clearInterval(timer)
      return
    }
    const particleCount = 24 * (timeLeft / duration)
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.15, 0.35), y: Math.random() - 0.2 } })
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.65, 0.85), y: Math.random() - 0.2 } })
  }, 450)
  return { timer, audio }
}

export function SlidePaymentsV1({ slide }) {
  const row = (slide.employees || []).find((item) => item.name || amountOf(item)) || {}
  const [count, setCount] = useState(3)
  const [needsTap, setNeedsTap] = useState(false)

  useEffect(() => {
    setCount(3)
    const ticks = [2, 1, 0]
    const timers = ticks.map((value, index) => window.setTimeout(() => setCount(value), (index + 1) * 1000))
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [slide.id, row.name])

  useEffect(() => {
    if (count < 1) return undefined
    let stopped = false
    playCount(count).then(() => {
      if (!stopped) setNeedsTap(false)
    }).catch(() => {
      if (!stopped) setNeedsTap(true)
    })
    return () => {
      stopped = true
    }
  }, [count])

  useEffect(() => {
    if (count !== 0) return undefined
    const { timer, audio } = celebrate()
    return () => {
      window.clearInterval(timer)
      confetti.reset()
      audio.pause()
    }
  }, [count])

  return (
    <section className="relative grid h-full w-full place-items-center overflow-hidden bg-[#071a3a] px-[4vw] text-white" style={{ backgroundImage: "url(/slides/images/payment-recived-bg.jpg-1795787515675.jpeg)", backgroundSize: "cover", backgroundPosition: "center" }}>
      <img src="/tml-logo.svg" alt="TML Global" className="absolute top-[3vh] left-[2vw] h-[clamp(13.5rem,30vh,21rem)] w-auto" />
      {needsTap && (
        <button type="button" className="absolute inset-0 z-20 bg-black/35 text-[clamp(1.5rem,3vw,3rem)] font-bold" onClick={() => { setNeedsTap(false); if (count > 0) playCount(count).catch(() => {}) }}>
          Tap once for sound
        </button>
      )}
      {count > 0 ? (
        <div key={count} className="relative grid place-items-center">
          <span className="count-ring absolute size-[min(46vh,28vw)] rounded-full border-[10px] border-[#ff9a3c]" />
          <span className="count-ring absolute size-[min(46vh,28vw)] rounded-full border-[6px] border-white/80 [animation-delay:120ms]" />
          <p className="count-pop font-heading relative text-[clamp(10rem,26vw,18rem)] leading-none font-extrabold text-[#ff9a3c] drop-shadow-[0_0_40px_rgba(255,154,60,0.85)]">{count}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          <img src={row.image ? slideImageUrl(row.image) : "/default-employee.png"} alt="" className="size-[min(42vh,22vw)] rounded-full border-[8px] border-white object-cover shadow-[0_20px_50px_rgba(0,0,0,0.35)]" />
          {/* <p className="mt-6 text-[clamp(1.1rem,1.6vw,1.8rem)] font-bold tracking-[0.28em] text-[#ff9a3c] uppercase">Payment received</p> */}
          <h2 className="font-heading mt-3 text-[clamp(3rem,6vw,7rem)] leading-none font-extrabold uppercase">{row.name || "Name"}</h2>
          <p className="font-heading mt-4 text-[clamp(3.5rem,7vw,8rem)] leading-none font-extrabold text-[#ff9a3c]">{money(amountOf(row))}</p>
        </div>
      )}
    </section>
  )
}
