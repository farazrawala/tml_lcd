export function SlideBrands({ brands, status }) {
  const list = (brands || []).slice(0, 12)
  return (
    <section className="flex h-full w-full flex-col overflow-hidden bg-[#0c0c0c] px-[4vw] pt-[5vh] pb-[12vh]">
      <p className="font-heading text-[clamp(0.9rem,1.2vw,1.3rem)] font-bold tracking-[0.35em] text-[#FF5722]">INVENTORY</p>
      <h2 className="font-heading text-[clamp(2.4rem,4vw,4.6rem)] font-extrabold">AVAILABLE BRANDS</h2>
      {status === "loading" && <p className="m-auto text-2xl text-white/70">Loading brands…</p>}
      {status !== "loading" && !list.length && <p className="m-auto max-w-3xl text-center text-2xl text-white/70">Brand names will appear when the live inventory is available.</p>}
      {!!list.length && (
        <div className="mt-[3vh] grid min-h-0 flex-1 grid-cols-3 gap-4 min-[1600px]:grid-cols-4">
          {list.map((brand) => (
            <article key={brand.slug || brand.name} className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a1a1a] to-[#101010]">
              <h3 className="font-heading px-4 text-center text-[clamp(1.4rem,2vw,2.6rem)] font-extrabold tracking-wide uppercase">{brand.name}</h3>
              <p className="mt-2 text-[clamp(0.95rem,1.2vw,1.3rem)] text-white/50">{Number(brand.total).toLocaleString()} in stock</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
