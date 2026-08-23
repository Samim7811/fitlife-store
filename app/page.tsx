"use client";

import { useState } from "react";

const kitItems = [
  ["HAND GRIPPER", "/images/hand-gripper.png", "Improve grip strength & forearm power"],
  ["RESISTANCE TUBE", "/images/resistance-tube.png", "Tone your arms & full body"],
  ["SKIPPING ROPE", "/images/skipping-rope.png", "Burn calories & improve stamina"],
  ["AB ROLLER", "/images/ab-roller.png", "Strengthen your core & build six pack"],
  ["COMPLETE KIT", "/images/fitness-kit.png", "Everything you need for home workouts"],
];

export default function Home() {
  const [orderOpen, setOrderOpen] = useState(false);
  const [quantity, setQuantity] = useState<1 | 2>(1);
  const price = quantity === 1 ? 949 : 1698;

  const buy = (qty: 1 | 2) => {
    setQuantity(qty);
    setOrderOpen(true);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <div className="bg-lime-400 px-3 py-2 text-center text-xs font-black text-black">
        🔥 LIMITED TIME OFFER — PRICE INCREASES WHEN TIMER ENDS!
      </div>

      <header className="border-b border-zinc-800 bg-black">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <div className="text-2xl font-black">Fit<span className="text-lime-400">Life</span></div>
            <div className="text-[9px] font-bold tracking-[0.25em] text-zinc-500">HOME FITNESS KIT</div>
          </div>
          <button onClick={() => alert("Track Order")} className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-bold">
            MY ORDER
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-2 md:items-center md:py-20">
        <div>
          <div className="mb-5 inline-flex rounded-full border border-lime-400/30 bg-lime-400/10 px-4 py-2 text-xs font-bold text-lime-400">
            💪 ALL-IN-ONE FITNESS KIT
          </div>
          <h1 className="text-5xl font-black uppercase leading-[0.95] sm:text-6xl">
            HOME FITNESS<span className="block text-lime-400">KIT 5 IN 1</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-zinc-400">Your Complete Home Gym<br />Anytime, Anywhere!</p>
          <ul className="mt-6 space-y-2 text-sm text-zinc-300">
            <li>• Build Muscle & Burn Fat</li>
            <li>• Improve Strength & Stamina</li>
            <li>• Premium Quality Equipment</li>
            <li>• Suitable For Men & Women</li>
            <li>• Compact & Easy To Use</li>
          </ul>
          <button onClick={() => buy(1)} className="mt-7 rounded-xl bg-lime-400 px-6 py-4 font-black text-black">
            BUY SINGLE — ₹949
          </button>
        </div>
        <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
          <img src="/images/hero.jpg" alt="FitLife 5 in 1 Home Fitness Kit" className="aspect-square w-full object-cover" />
        </div>
      </section>

      <section className="border-y border-zinc-800 bg-zinc-950 px-5 py-12">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-black tracking-widest text-lime-400">LIMITED TIME PRICE</p>
          <div className="mt-3">
            <span className="mr-3 text-lg text-zinc-500 line-through">₹2,349</span>
            <span className="text-4xl font-black">₹949</span>
          </div>
          <p className="mt-2 font-bold text-lime-400">YOU SAVE ₹1,400</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <button onClick={() => buy(1)} className="rounded-2xl bg-lime-400 p-5 text-left font-black text-black">
              <span className="block text-sm">SINGLE KIT</span><span className="mt-1 block text-3xl">₹949</span>
              <span className="mt-2 block text-xs">BUY NOW →</span>
            </button>
            <button onClick={() => buy(2)} className="rounded-2xl bg-lime-400 p-5 text-left font-black text-black">
              <span className="block text-sm">2 KITS</span><span className="mt-1 block text-3xl">₹1,698</span>
              <span className="mt-2 block text-xs">₹849 PER KIT • BUY NOW →</span>
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-12 text-black">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-xs font-black tracking-widest text-zinc-500">EVERYTHING YOU NEED</p>
          <h2 className="mt-2 text-center text-3xl font-black uppercase">WHAT&apos;S INSIDE THE KIT?</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-zinc-500">5 essential fitness products in one complete kit.</p>
          <div className="mt-8 flex snap-x gap-4 overflow-x-auto pb-3">
            {kitItems.map(([name, image, description]) => (
              <article key={name} className="min-w-[240px] snap-start overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
                <img src={image} alt={name} className="h-52 w-full object-cover" />
                <div className="p-4"><h3 className="font-black">{name}</h3><p className="mt-2 text-sm text-zinc-500">{description}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["🚚", "FREE SHIPPING", "Across India"],
            ["💵", "CASH ON DELIVERY", "Pay when you receive"],
            ["🔒", "SECURE ORDER", "Safe & secure"],
            ["↩️", "7 DAYS RETURN", "Hassle-free returns"],
          ].map(([icon, title, text]) => (
            <div key={title} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center">
              <div className="text-2xl">{icon}</div><h3 className="mt-2 text-xs font-black">{title}</h3>
              <p className="mt-1 text-[10px] text-zinc-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-lime-400 px-5 py-14 text-center text-black">
        <p className="text-xs font-black tracking-widest">LIMITED TIME OFFER</p>
        <h2 className="mx-auto mt-2 max-w-xl text-4xl font-black uppercase leading-none">START YOUR FITNESS JOURNEY TODAY</h2>
        <p className="mx-auto mt-4 max-w-md text-sm font-medium">Get your complete 5-in-1 home workout kit today.</p>
        <button onClick={() => buy(1)} className="mt-7 rounded-full bg-black px-8 py-4 font-black text-white">BUY NOW — ₹949</button>
      </section>

      <footer className="px-5 py-10 text-center">
        <div className="text-xl font-black">Fit<span className="text-lime-400">Life</span></div>
        <p className="mt-1 text-[9px] font-bold tracking-[0.25em] text-zinc-500">HOME FITNESS KIT</p>
        <p className="mt-5 text-xs text-zinc-500">Track Order • Support • 7 Days Return • Cash on Delivery</p>
        <p className="mt-4 text-[10px] text-zinc-600">© 2026 FitLife. All rights reserved.</p>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-black/95 p-3 md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-2 gap-2">
          <button onClick={() => buy(1)} className="rounded-xl bg-lime-400 py-3 text-xs font-black text-black">BUY SINGLE<span className="block text-sm">₹949</span></button>
          <button onClick={() => buy(2)} className="rounded-xl bg-lime-400 py-3 text-xs font-black text-black">BUY 2 KITS<span className="block text-sm">₹1,698</span></button>
        </div>
      </div>

      {orderOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 p-3 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 text-black">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">COMPLETE YOUR ORDER</h2>
              <button onClick={() => setOrderOpen(false)} className="rounded-full bg-zinc-100 px-3 py-2 font-bold">✕</button>
            </div>
            <div className="mt-5 rounded-2xl bg-zinc-100 p-4">
              <p className="text-xs font-bold text-zinc-500">SELECTED OFFER</p>
              <p className="mt-1 font-black">{quantity === 1 ? "Single Kit — ₹949" : "2 Kits — ₹1,698"}</p>
            </div>
            <div className="mt-5 space-y-3">
              <input className="w-full rounded-xl border p-3" placeholder="Full Name" />
              <input className="w-full rounded-xl border p-3" placeholder="Mobile Number" />
              <textarea className="w-full rounded-xl border p-3" placeholder="Complete Address" rows={3} />
              <div className="grid grid-cols-2 gap-3">
                <input className="rounded-xl border p-3" placeholder="City" />
                <input className="rounded-xl border p-3" placeholder="State" />
              </div>
              <input className="w-full rounded-xl border p-3" placeholder="Pincode" />
              <input className="w-full rounded-xl border p-3" placeholder="Landmark (Optional)" />
            </div>
            <div className="mt-5 rounded-2xl bg-zinc-950 p-4 text-white">
              <div className="flex justify-between text-sm"><span>Quantity</span><span>{quantity}</span></div>
              <div className="mt-2 flex justify-between text-sm"><span>Delivery</span><span>FREE</span></div>
              <div className="mt-3 flex justify-between border-t border-zinc-700 pt-3 text-lg font-black"><span>Total</span><span>₹{price.toLocaleString("en-IN")}</span></div>
            </div>
            <button className="mt-5 w-full rounded-xl bg-lime-400 py-4 font-black">PLACE ORDER — ₹{price.toLocaleString("en-IN")}</button>
            <p className="mt-3 text-center text-xs text-zinc-500">Cash on Delivery • Secure Order Processing</p>
          </div>
        </div>
      )}
    </main>
  );
}
