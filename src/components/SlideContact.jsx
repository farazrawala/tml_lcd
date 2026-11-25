import { useEffect, useState } from "react"
import QRCode from "qrcode"
import { Globe, Mail, MapPin, Phone } from "lucide-react"
import { settings, websiteUrl } from "../lib/api"
import { SlideImages } from "./SlideImages"

export function SlideContact({ slide, imageMs }) {
  const [qr, setQr] = useState("")

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(websiteUrl, { margin: 1, width: 420, color: { dark: "#111111", light: "#ffffff" } })
      .then((url) => {
        if (!cancelled) setQr(url)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="relative flex h-full w-full overflow-hidden bg-[#090909]">
      <SlideImages images={slide?.images} imageMs={imageMs} className="opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/88 to-black/70" />
      <div className="relative grid h-full w-full grid-cols-[1.4fr_0.8fr] items-center gap-10 px-[5vw] pb-[10vh]">
        <div>
          <img src="/tml-logo.svg" alt="TML Global" className="h-[8vh] w-auto" />
          <h2 className="font-heading mt-6 text-[clamp(2.6rem,4.6vw,5.4rem)] leading-[0.95] font-extrabold">LOOKING FOR<br />YOUR NEXT CAR?</h2>
          <p className="mt-5 max-w-[40vw] text-[clamp(1.15rem,1.6vw,1.8rem)] text-white/75">Visit TML Global and explore our latest collection.</p>
          <ul className="mt-8 space-y-4 text-[clamp(1.05rem,1.4vw,1.5rem)]">
            <li className="flex items-center gap-4"><Globe className="size-7 shrink-0 text-[#FF5722]" />{websiteUrl.replace("https://", "")}</li>
            <li className="flex items-center gap-4"><Phone className="size-7 shrink-0 text-[#FF5722]" />{settings.contactNumber}</li>
            <li className="flex items-center gap-4"><Mail className="size-7 shrink-0 text-[#FF5722]" />{settings.infoEmail}<span className="text-white/50">· {settings.salesEmail}</span></li>
            <li className="flex items-start gap-4"><MapPin className="mt-1 size-7 shrink-0 text-[#FF5722]" /><span>{settings.address}<br />{settings.usaAddress}</span></li>
          </ul>
        </div>
        <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-8 text-[#111]">
          {qr ? <img src={qr} alt={`QR code linking to ${websiteUrl}`} className="w-[min(28vw,360px)]" /> : <div className="size-64 bg-neutral-200" />}
          <p className="font-heading mt-4 text-center text-xl font-extrabold">SCAN TO VISIT</p>
          <p className="text-center text-neutral-600">thetml.com</p>
        </div>
      </div>
    </section>
  )
}
