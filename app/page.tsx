"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Offer = {
  qty: number;
  price: number;
  label: string;
};

type Order = {
  order_id: string;
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  payment_method: string;
  status: string;
  created_at?: string;
};

const OFFERS: Offer[] = [
  { qty: 1, price: 949, label: "BUY SINGLE" },
  { qty: 2, price: 1698, label: "BUY 2 KITS" },
];

const PRODUCTS = [
  {
    name: "HAND GRIPPER",
    image: "/images/hand-gripper.png",
    text: "Improve grip strength & forearm power",
  },
  {
    name: "RESISTANCE TUBE",
    image: "/images/resistance-tube.png",
    text: "Tone your arms & full body",
  },
  {
    name: "SKIPPING ROPE",
    image: "/images/skipping-rope.png",
    text: "Burn calories & improve stamina",
  },
  {
    name: "AB ROLLER",
    image: "/images/ab-roller.png",
    text: "Strengthen your core & build six pack",
  },
  {
    name: "COMPLETE KIT",
    image: "/images/fitness-kit.png",
    text: "Everything you need for home workouts",
  },
];

const STATUSES = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

function money(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function validPhone(phone: string) {
  return /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ""));
}

function validPincode(pin: string) {
  return /^\d{6}$/.test(pin);
}

function statusIndex(status: string) {
  return STATUSES.indexOf(status);
}

export default function Home() {
  const [offer, setOffer] = useState<Offer>(OFFERS[0]);
  const [showOrder, setShowOrder] = useState(false);
  const [showTrack, setShowTrack] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState("");
  const [trackError, setTrackError] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [trackResult, setTrackResult] = useState<Order | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });

  const [trackForm, setTrackForm] = useState({
    orderId: "",
    phone: "",
  });

  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Keep the offer expiry stable across refreshes.
    // Change this value to your desired campaign expiry.
    const key = "fitlife_offer_expiry";
    const saved = localStorage.getItem(key);
    const fallback = Date.now() + 24 * 60 * 60 * 1000;
    const expiry = saved ? Number(saved) : fallback;

    if (!saved) localStorage.setItem(key, String(fallback));

    const tick = () => setTimeLeft(Math.max(0, expiry - Date.now()));
    tick();

    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const countdown = useMemo(() => {
    const total = Math.floor(timeLeft / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
  }, [timeLeft]);

  function openOrder(selected: Offer) {
    setOffer(selected);
    setError("");
    setShowOrder(true);
  }

  function closeAll() {
    if (loading || tracking) return;
    setShowOrder(false);
    setShowTrack(false);
    setShowSuccess(false);
  }

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const phone = form.phone.replace(/\D/g, "");

    if (!form.name.trim() || !form.address.trim() || !form.city.trim() || !form.state.trim()) {
      setError("Please fill all required fields.");
      return;
    }

    if (!validPhone(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (!validPincode(form.pincode)) {
      setError("Enter a valid 6-digit pincode.");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.name.trim(),
          phone,
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode,
          landmark: form.landmark.trim(),
          product_name: "FitLife Home Fitness Kit 5-in-1",
          quantity: offer.qty,
          unit_price: offer.qty === 2 ? 849 : 949,
          total_amount: offer.price,
          payment_method: "Cash on Delivery",
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Unable to place order right now.");
      }

      const created = data.order as Order;
      setOrder(created);
      setShowOrder(false);
      setShowSuccess(true);
      setForm({
        name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        landmark: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to place order right now.");
    } finally {
      setLoading(false);
    }
  }

  async function trackOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTrackError("");
    setTrackResult(null);

    const phone = trackForm.phone.replace(/\D/g, "");

    if (!trackForm.orderId.trim() || !validPhone(phone)) {
      setTrackError("Enter a valid Order ID and 10-digit mobile number.");
      return;
    }

    setTracking(true);

    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: trackForm.orderId.trim(),
          phone,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Order not found.");
      }

      setTrackResult(data.order as Order);
    } catch (err) {
      setTrackError(err instanceof Error ? err.message : "Order not found.");
    } finally {
      setTracking(false);
    }
  }

  const successTotal = order?.total_amount ?? offer.price;

  return (
    <main className="min-h-screen overflow-x-hidden bg-white pb-24 text-zinc-950">
      <div className="bg-lime-400 px-3 py-2 text-center text-[11px] font-black uppercase tracking-wide text-black sm:text-sm">
        🔥 LIMITED TIME OFFER — PRICE INCREASES WHEN TIMER ENDS!
      </div>

      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-black text-white shadow-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <div className="text-xl font-black leading-none tracking-tight">
              Fit<span className="text-lime-400">Life</span>
            </div>
            <div className="mt-1 text-[9px] font-bold tracking-[0.24em] text-zinc-400">
              HOME FITNESS KIT
            </div>
          </div>

          <div className="hidden text-center sm:block">
            <div className="font-mono text-lg font-black text-lime-400">{countdown}</div>
            <div className="text-[9px] font-bold uppercase text-zinc-400">Offer Timer</div>
          </div>

          <div className="hidden text-right sm:block">
            <div className="text-xs text-lime-400">★★★★★</div>
            <div className="text-[10px] font-bold text-zinc-300">1000+ Happy Customers</div>
          </div>

          <button
            onClick={() => setShowTrack(true)}
            className="rounded-full border border-zinc-600 px-3 py-2 text-[10px] font-black uppercase hover:border-lime-400 hover:text-lime-400"
          >
            Track Order
          </button>
        </div>
      </header>

      <section className="bg-black px-4 pb-12 pt-10 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-lime-400/50 bg-lime-400/10 px-3 py-2 text-[10px] font-black tracking-wide text-lime-400">
              💪 ALL-IN-ONE FITNESS KIT
            </div>

            <h1 className="text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl">
              HOME FITNESS
              <span className="block text-lime-400">KIT 5 IN 1</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">
              Your Complete Home Gym
              <br />
              Anytime, Anywhere!
            </p>

            <ul className="mt-6 space-y-2 text-sm text-zinc-200">
              <li>✓ Build Muscle & Burn Fat</li>
              <li>✓ Improve Strength & Stamina</li>
              <li>✓ Premium Quality Equipment</li>
              <li>✓ Suitable For Men & Women</li>
              <li>✓ Compact & Easy To Use</li>
            </ul>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => openOrder(OFFERS[0])}
                className="rounded-full bg-lime-400 px-7 py-4 text-sm font-black text-black shadow-lg shadow-lime-400/20 transition hover:scale-[1.02]"
              >
                BUY SINGLE — ₹949
              </button>
              <button
                onClick={() => openOrder(OFFERS[1])}
                className="rounded-full bg-lime-400 px-7 py-4 text-sm font-black text-black shadow-lg shadow-lime-400/20 transition hover:scale-[1.02]"
              >
                BUY 2 KITS — ₹1,698
              </button>
            </div>

            <p className="mt-4 text-xs font-black uppercase tracking-wide text-lime-400">
              🔥 LIMITED STOCK — ORDER NOW
            </p>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
            <img
              src="/images/hero.jpg"
              alt="FitLife Home Fitness Kit"
              className="h-[320px] w-full object-cover sm:h-[460px]"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 to-transparent">
              <div className="mt-auto w-full p-5">
                <div className="inline-block rounded-full bg-lime-400 px-3 py-1 text-[10px] font-black text-black">
                  5-IN-1 COMPLETE KIT
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-white px-4 py-10">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
            LIMITED TIME PRICE
          </p>
          <div className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
            <span className="text-zinc-400 line-through">₹2,349</span>
            <span className="ml-3 text-black">₹949</span>
          </div>
          <div className="mx-auto mt-3 inline-flex rounded-full bg-lime-100 px-4 py-2 text-sm font-black text-lime-700">
            YOU SAVE ₹1,400
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {OFFERS.map((item) => (
              <div key={item.qty} className="rounded-2xl border-2 border-zinc-200 p-5">
                <div className="text-xs font-black uppercase text-zinc-500">
                  {item.qty === 1 ? "SINGLE KIT" : "2 KITS"}
                </div>
                <div className="mt-1 text-3xl font-black">{money(item.price)}</div>
                {item.qty === 2 && (
                  <div className="mt-1 text-xs font-bold text-zinc-500">₹849 per kit</div>
                )}
                <button
                  onClick={() => openOrder(item)}
                  className="mt-5 w-full rounded-xl bg-black px-5 py-4 text-sm font-black text-lime-400 transition hover:bg-zinc-800"
                >
                  {item.label}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zinc-50 px-4 py-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["🚚", "FREE SHIPPING", "Across India"],
            ["💵", "CASH ON DELIVERY", "Pay when you receive"],
            ["🔒", "SECURE PAYMENT", "Safe & Secure"],
            ["↩️", "7 DAYS RETURN", "Hassle-free returns"],
          ].map(([icon, title, text]) => (
            <div key={title} className="rounded-2xl bg-white p-4 text-center shadow-sm">
              <div className="text-2xl">{icon}</div>
              <div className="mt-2 text-[11px] font-black">{title}</div>
              <div className="mt-1 text-[10px] text-zinc-500">{text}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="kit" className="px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
            EVERYTHING YOU NEED
          </p>
          <h2 className="mt-2 text-3xl font-black uppercase sm:text-4xl">
            WHAT&apos;S INSIDE THE KIT?
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">
            5 essential fitness products in one complete kit.
          </p>

          <div className="mt-7 flex snap-x gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-5 md:overflow-visible">
            {PRODUCTS.map((product) => (
              <article
                key={product.name}
                className="min-w-[245px] snap-start overflow-hidden rounded-2xl border border-zinc-200 bg-white md:min-w-0"
              >
                <div className="flex h-48 items-center justify-center bg-zinc-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain p-4"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-black">{product.name}</h3>
                  <p className="mt-2 text-xs leading-5 text-zinc-500">{product.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-4 py-12 text-white">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
            WHY FITLIFE?
          </p>
          <h2 className="mt-3 text-3xl font-black uppercase sm:text-5xl">
            TRAIN BETTER.
            <span className="block text-lime-400">LIVE STRONGER.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-400">
            A compact 5-in-1 workout solution designed for home training,
            strength, stamina and everyday fitness.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["01", "FULL BODY", "Train multiple muscle groups at home."],
              ["02", "EASY STORAGE", "Compact equipment for small spaces."],
              ["03", "ANYTIME", "Workout whenever your schedule allows."],
            ].map(([number, title, text]) => (
              <div key={number} className="rounded-2xl border border-zinc-800 p-5 text-left">
                <div className="text-sm font-black text-lime-400">{number}</div>
                <div className="mt-3 font-black">{title}</div>
                <div className="mt-2 text-xs leading-5 text-zinc-400">{text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-9">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
              SIMPLE & TRUSTWORTHY
            </p>
            <h2 className="mt-2 text-3xl font-black uppercase">ORDER WITH CONFIDENCE</h2>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {[
                ["7 Days Return", "Easy return support for eligible products."],
                ["Cash on Delivery", "Pay when your order reaches you."],
                ["Free Shipping", "Delivery available across India."],
                ["Secure Processing", "Your order details are processed securely."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl bg-zinc-50 p-5">
                  <div className="font-black">{title}</div>
                  <div className="mt-2 text-sm leading-6 text-zinc-600">{text}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-zinc-950 p-5 text-white">
              <div className="font-black">Delivery Issues / Support</div>
              <p className="mt-2 text-sm text-zinc-400">
                Need help with your order? Keep your Order ID ready and contact your store support.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black px-4 py-14 text-center text-white">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
          LIMITED TIME OFFER
        </p>
        <h2 className="mt-3 text-4xl font-black uppercase leading-tight sm:text-6xl">
          START YOUR FITNESS
          <span className="block text-lime-400">JOURNEY TODAY</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-zinc-400">
          Get your complete 5-in-1 home workout kit today.
        </p>
        <button
          onClick={() => openOrder(OFFERS[0])}
          className="mt-7 rounded-full bg-lime-400 px-9 py-4 text-sm font-black text-black"
        >
          BUY NOW — ₹949
        </button>
      </section>

      <footer className="bg-zinc-950 px-4 py-9 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xl font-black">
              Fit<span className="text-lime-400">Life</span>
            </div>
            <div className="mt-1 text-[9px] font-bold tracking-[0.24em] text-zinc-500">
              HOME FITNESS KIT
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-xs font-bold text-zinc-400">
            <button onClick={() => setShowTrack(true)} className="hover:text-lime-400">
              Track Order
            </button>
            <span>Contact / Support</span>
            <span>7 Days Return</span>
            <span>Cash on Delivery</span>
          </div>
        </div>
        <div className="mx-auto mt-7 max-w-7xl border-t border-zinc-800 pt-5 text-[10px] text-zinc-600">
          © 2026 FitLife. All rights reserved.
        </div>
      </footer>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-black/95 p-2 shadow-2xl backdrop-blur sm:p-3">
        <div className="mx-auto flex max-w-4xl gap-2">
          <button
            onClick={() => openOrder(OFFERS[0])}
            className="flex-1 rounded-xl bg-lime-400 px-2 py-3 text-[11px] font-black text-black sm:text-sm"
          >
            BUY SINGLE
            <span className="ml-1">₹949</span>
          </button>
          <button
            onClick={() => openOrder(OFFERS[1])}
            className="flex-1 rounded-xl bg-lime-400 px-2 py-3 text-[11px] font-black text-black sm:text-sm"
          >
            BUY 2 KITS
            <span className="ml-1">₹1,698</span>
          </button>
        </div>
      </div>

      {showOrder && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4">
          <div className="max-h-[94vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                  SECURE CHECKOUT
                </p>
                <h2 className="mt-1 text-2xl font-black">COMPLETE YOUR ORDER</h2>
              </div>
              <button
                onClick={closeAll}
                className="rounded-full bg-zinc-100 px-3 py-2 font-bold"
              >
                ×
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-zinc-950 p-4 text-white">
              <div className="text-xs font-bold text-lime-400">SELECTED OFFER</div>
              <div className="mt-1 flex items-center justify-between">
                <span className="font-black">
                  {offer.qty === 1 ? "Single Kit" : "2 Kits"}
                </span>
                <span className="text-xl font-black">{money(offer.price)}</span>
              </div>
            </div>

            <form onSubmit={placeOrder} className="mt-5 space-y-3">
              {[
                ["name", "Full Name", "text"],
                ["phone", "Mobile Number", "tel"],
                ["address", "Complete Address", "text"],
                ["city", "City", "text"],
                ["state", "State", "text"],
                ["pincode", "Pincode", "tel"],
                ["landmark", "Landmark (Optional)", "text"],
              ].map(([key, label, type]) => (
                <label key={key} className="block">
                  <span className="mb-1 block text-xs font-black">{label}</span>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    required={!["landmark"].includes(key)}
                    inputMode={key === "phone" || key === "pincode" ? "numeric" : undefined}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
                  />
                </label>
              ))}

              <div className="rounded-2xl border border-zinc-200 p-4">
                <div className="text-xs font-black uppercase text-zinc-500">Payment Method</div>
                <div className="mt-2 font-black">💵 CASH ON DELIVERY</div>
              </div>

              <div className="rounded-2xl bg-zinc-50 p-4 text-sm">
                <div className="flex justify-between">
                  <span>Product</span>
                  <b>FitLife 5-in-1</b>
                </div>
                <div className="mt-2 flex justify-between">
                  <span>Quantity</span>
                  <b>{offer.qty}</b>
                </div>
                <div className="mt-2 flex justify-between">
                  <span>Delivery</span>
                  <b className="text-green-600">FREE</b>
                </div>
                <div className="mt-3 flex justify-between border-t pt-3 text-lg font-black">
                  <span>Total</span>
                  <span>{money(offer.price)}</span>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-xs font-bold text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-lime-400 px-5 py-4 text-sm font-black text-black disabled:opacity-50"
              >
                {loading ? "PLACING ORDER..." : `PLACE ORDER — ${money(offer.price)}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 text-center">
            <div className="text-4xl">🎉</div>
            <h2 className="mt-3 text-2xl font-black">ORDER PLACED SUCCESSFULLY!</h2>
            <p className="mt-2 text-sm text-zinc-500">Please save your Order ID to track your order.</p>

            <div className="mt-5 rounded-2xl bg-zinc-950 p-5 text-white">
              <div className="text-xs text-zinc-400">YOUR ORDER ID</div>
              <div className="mt-1 text-xl font-black text-lime-400">
                {order?.order_id || "GENERATING..."}
              </div>
              <div className="mt-4 flex justify-between text-sm">
                <span>Amount</span>
                <b>{money(successTotal)}</b>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span>Payment</span>
                <b>Cash on Delivery</b>
              </div>
            </div>

            <div className="mt-5 grid gap-2">
              <button
                onClick={() => {
                  setShowSuccess(false);
                  setShowTrack(true);
                  setTrackForm({
                    orderId: order?.order_id || "",
                    phone: order?.phone || "",
                  });
                }}
                className="rounded-xl bg-black px-5 py-4 text-sm font-black text-lime-400"
              >
                TRACK MY ORDER
              </button>
              <button
                onClick={() => setShowSuccess(false)}
                className="rounded-xl border border-zinc-300 px-5 py-4 text-sm font-black"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          </div>
        </div>
      )}

      {showTrack && (
        <div className="fixed inset-0 z-[75] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl sm:p-7">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                  MY ORDER
                </p>
                <h2 className="mt-1 text-2xl font-black">TRACK ORDER</h2>
              </div>
              <button onClick={closeAll} className="rounded-full bg-zinc-100 px-3 py-2 font-bold">
                ×
              </button>
            </div>

            <form onSubmit={trackOrder} className="mt-5 space-y-3">
              <input
                placeholder="Order ID e.g. FIT-2026-000001"
                value={trackForm.orderId}
                onChange={(e) => setTrackForm({ ...trackForm, orderId: e.target.value })}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
              />
              <input
                placeholder="10-digit mobile number"
                inputMode="numeric"
                value={trackForm.phone}
                onChange={(e) => setTrackForm({ ...trackForm, phone: e.target.value })}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
              />
              {trackError && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-xs font-bold text-red-600">
                  {trackError}
                </div>
              )}
              <button
                disabled={tracking}
                className="w-full rounded-xl bg-black px-5 py-4 text-sm font-black text-lime-400 disabled:opacity-50"
              >
                {tracking ? "CHECKING..." : "TRACK ORDER"}
              </button>
            </form>

            {trackResult && (
              <div className="mt-6">
                <div className="rounded-2xl bg-zinc-950 p-5 text-white">
                  <div className="text-xs text-zinc-400">ORDER ID</div>
                  <div className="mt-1 font-black text-lime-400">{trackResult.order_id}</div>
                  <div className="mt-4 text-sm font-bold">{trackResult.customer_name}</div>
                  <div className="mt-1 text-xs text-zinc-400">
                    {trackResult.product_name} · Qty {trackResult.quantity}
                  </div>
                  <div className="mt-4 text-lg font-black">{money(trackResult.total_amount)}</div>
                  <div className="mt-1 text-xs text-zinc-400">{trackResult.payment_method}</div>
                </div>

                <div className="mt-5 space-y-0">
                  {trackResult.status === "Cancelled" ? (
                    <div className="rounded-2xl bg-red-50 p-4 font-black text-red-600">❌ Cancelled</div>
                  ) : (
                    STATUSES.map((status, index) => {
                      const current = statusIndex(trackResult.status);
                      const complete = current >= index;
                      const active = current === index;

                      return (
                        <div key={status} className="relative flex gap-3 pb-5">
                          {index < STATUSES.length - 1 && (
                            <div
                              className={`absolute left-[10px] top-6 h-full w-px ${
                                complete ? "bg-lime-400" : "bg-zinc-200"
                              }`}
                            />
                          )}
                          <div
                            className={`relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-black ${
                              complete ? "bg-lime-400 text-black" : "bg-zinc-200 text-zinc-500"
                            }`}
                          >
                            {complete ? "✓" : ""}
                          </div>
                          <div>
                            <div className={`text-sm font-black ${active ? "text-black" : "text-zinc-500"}`}>
                              {status}
                            </div>
                            {active && (
                              <div className="mt-1 text-xs text-zinc-500">
                                Your order is currently {status.toLowerCase()}.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="rounded-2xl bg-zinc-50 p-4 text-xs leading-6 text-zinc-600">
                  <b className="text-zinc-950">Delivery information</b>
                  <br />
                  {trackResult.address}, {trackResult.city}, {trackResult.state} -{" "}
                  {trackResult.pincode}
                  {trackResult.landmark ? ` · ${trackResult.landmark}` : ""}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
