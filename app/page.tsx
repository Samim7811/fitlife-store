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
  landmark?: string | null;
  product_name: string;
  quantity: number;
  amount: number;
  payment_method: string;
  status: string;
  tracking_number?: string | null;
  admin_note?: string | null;
  created_at?: string;
  updated_at?: string;
};

const OFFERS: Offer[] = [
  { qty: 1, price: 949, label: "SINGLE KIT" },
  { qty: 2, price: 1698, label: "2 KITS" },
];

const STATUS_STEPS = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const REVIEWS = [
  ["Rahul S.", "★★★★★", "Good quality and fast delivery. The kit is useful for home workouts."],
  ["Amit K.", "★★★★★", "Value for money. Resistance tube and ab roller are my favourites."],
  ["Sourav D.", "★★★★★", "Packaging was good and COD made ordering easy."],
  ["Rakesh P.", "★★★★★", "Compact kit. I can exercise at home without taking much space."],
  ["Arjun M.", "★★★★★", "Received the product as shown. Happy with the purchase."],
  ["Vikas R.", "★★★★★", "Good beginner fitness kit. Delivery was smooth."],
  ["Imran A.", "★★★★★", "Nice kit for home training and warm-up."],
  ["Kunal S.", "★★★★★", "The hand gripper is surprisingly useful."],
  ["Deepak J.", "★★★★★", "Good overall quality for the price."],
  ["Ankit T.", "★★★★★", "Easy to store and use."],
  ["Rohit B.", "★★★★★", "Bought the 2-kit offer. Great value."],
  ["Manish G.", "★★★★★", "Everything arrived safely."],
  ["Sanjay P.", "★★★★★", "Useful for daily home workouts."],
  ["Naveen K.", "★★★★★", "Good product and simple ordering."],
  ["Aditya S.", "★★★★★", "Satisfied with the purchase."],
  ["Pritam D.", "★★★★★", "Good quality equipment."],
  ["Abhishek R.", "★★★★★", "Nice for beginners."],
  ["Sahil M.", "★★★★★", "Delivery and packaging were good."],
  ["Vivek N.", "★★★★★", "Good value."],
  ["Sumit C.", "★★★★★", "Would recommend for home workouts."],
  ["Rohan S.", "★★★★★", "The kit is compact and practical."],
  ["Tanmoy B.", "★★★★★", "Good experience."],
  ["Ayan D.", "★★★★★", "Useful equipment for daily exercise."],
  ["Suman P.", "★★★★★", "Nice quality."],
  ["Prakash K.", "★★★★★", "COD ordering was convenient."],
  ["Raj D.", "★★★★★", "Good beginner setup."],
  ["Sourav M.", "★★★★★", "Happy with the kit."],
  ["Nikhil S.", "★★★★★", "Good for small rooms."],
  ["Akash P.", "★★★★★", "Product matched the description."],
  ["Mohit R.", "★★★★★", "Nice purchase."],
  ["Sujit G.", "★★★★★", "Good home fitness option."],
  ["Bikash S.", "★★★★★", "Easy to use."],
  ["Karan J.", "★★★★★", "Worth considering."],
  ["Ravi K.", "★★★★★", "Good overall."],
  ["Sayan D.", "★★★★★", "Fast order process."],
  ["Amit S.", "★★★★★", "Good kit."],
  ["Partha R.", "★★★★★", "Useful products included."],
  ["Rajib M.", "★★★★★", "Satisfied."],
  ["Suman D.", "★★★★★", "Good value for money."],
  ["Tushar K.", "★★★★★", "Nice for home."],
  ["Bappa S.", "★★★★★", "Good quality."],
  ["Dip S.", "★★★★★", "Simple and useful."],
  ["Soumen P.", "★★★★★", "Happy with delivery."],
  ["Ratul D.", "★★★★★", "Good kit for beginners."],
  ["Sagnik R.", "★★★★★", "Worth the price."],
  ["Deb K.", "★★★★★", "Nice equipment."],
  ["Sourav S.", "★★★★★", "Good experience."],
  ["Rishi P.", "★★★★★", "Useful for daily workouts."],
  ["Nayan G.", "★★★★★", "Compact and easy to store."],
  ["Sayan M.", "★★★★★", "Good purchase."],
  ["Arindam D.", "★★★★★", "Good quality."],
  ["Joy S.", "★★★★★", "Satisfied."],
  ["Subhajit P.", "★★★★★", "Nice kit."],
  ["Aritra K.", "★★★★★", "Good for home."],
  ["Mukul S.", "★★★★★", "Good value."],
  ["Rakesh D.", "★★★★★", "Easy ordering."],
  ["Tapan M.", "★★★★★", "Useful kit."],
  ["Koushik R.", "★★★★★", "Good quality."],
  ["Suman K.", "★★★★★", "Happy with the product."],
  ["Anirban S.", "★★★★★", "Nice home workout kit."],
  ["Sourav K.", "★★★★★", "Good deal."],
  ["Pavel D.", "★★★★★", "Practical equipment."],
  ["Abhijit M.", "★★★★★", "Good product."],
  ["Rahul D.", "★★★★★", "Worth buying."],
  ["Rupam S.", "★★★★★", "Good quality and packing."],
  ["Siddharth K.", "★★★★★", "Useful for beginners."],
  ["Debashis P.", "★★★★★", "Nice experience."],
  ["Arnab S.", "★★★★★", "Good home setup."],
  ["Rony D.", "★★★★★", "Good value."],
  ["Suman R.", "★★★★★", "Happy with the purchase."],
  ["Biswajit K.", "★★★★★", "Good quality."],
  ["Soumik S.", "★★★★★", "Useful kit."],
  ["Abir D.", "★★★★★", "Nice product."],
  ["Tanmoy S.", "★★★★★", "Good for daily exercise."],
  ["Rohan K.", "★★★★★", "Easy to use."],
  ["Sagnik D.", "★★★★★", "Good deal."],
  ["Pradip S.", "★★★★★", "Satisfied."],
  ["Kunal D.", "★★★★★", "Good home workout option."],
  ["Rajat P.", "★★★★★", "Nice quality."],
  ["Debu S.", "★★★★★", "Good purchase."],
  ["Ayan K.", "★★★★★", "Useful."],
  ["Shubham R.", "★★★★★", "Good kit."],
  ["Manoj S.", "★★★★★", "Happy."],
  ["Rajesh K.", "★★★★★", "Good value for money."],
  ["Sourav P.", "★★★★★", "Nice equipment."],
  ["Amit D.", "★★★★★", "Good experience."],
  ["Rakesh S.", "★★★★★", "Worth it."],
  ["Vikram P.", "★★★★★", "Good quality."],
  ["Anup S.", "★★★★★", "Useful for home."],
  ["Kishan D.", "★★★★★", "Nice kit."],
  ["Parvez R.", "★★★★★", "Good delivery."],
  ["Sanjay M.", "★★★★★", "Satisfied."],
  ["Rohit K.", "★★★★★", "Good product."],
];

const money = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function SafeImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-zinc-100 text-center text-xs font-bold text-zinc-500 ${className}`}>
        {alt}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default function Page() {
  const [selectedOffer, setSelectedOffer] = useState<Offer>(OFFERS[0]);
  const [orderOpen, setOrderOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [trackId, setTrackId] = useState("");
  const [trackPhone, setTrackPhone] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackingError, setTrackingError] = useState("");
  const [loading, setLoading] = useState(false);
  const [trackLoading, setTrackLoading] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [hours, setHours] = useState(3);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const key = "fitlife_offer_expiry_v3";
    let expiry = Number(localStorage.getItem(key) || 0);

    if (!expiry || expiry <= Date.now()) {
      expiry = Date.now() + 3 * 60 * 60 * 1000;
      localStorage.setItem(key, String(expiry));
    }

    const tick = () => {
      const left = Math.max(0, expiry - Date.now());
      const total = Math.floor(left / 1000);
      setHours(Math.floor(total / 3600));
      setMinutes(Math.floor((total % 3600) / 60));
      setSeconds(total % 60);
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const timer = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const openOrder = (offer: Offer) => {
    setSelectedOffer(offer);
    setOrderOpen(true);
  };

  const visibleReviews = showAllReviews ? REVIEWS : REVIEWS.slice(0, 7);

  async function submitOrder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    const form = new FormData(e.currentTarget);
    const customer_name = String(form.get("customer_name") || "").trim();
    const phone = String(form.get("phone") || "").replace(/\D/g, "");
    const address = String(form.get("address") || "").trim();
    const city = String(form.get("city") || "").trim();
    const state = String(form.get("state") || "").trim();
    const pincode = String(form.get("pincode") || "").replace(/\D/g, "");
    const landmark = String(form.get("landmark") || "").trim();

    if (customer_name.length < 2) return alert("Please enter your full name.");
    if (!/^[6-9]\d{9}$/.test(phone)) return alert("Please enter a valid 10-digit mobile number.");
    if (address.length < 8) return alert("Please enter your complete address.");
    if (!city || !state) return alert("Please enter city and state.");
    if (!/^\d{6}$/.test(pincode)) return alert("Please enter a valid 6-digit pincode.");

    setLoading(true);

    try {
      /*
       * This page intentionally sends the existing order fields used by
       * the FitLife project. The server/API route should generate the
       * human-readable order_id and insert the row into Supabase.
       */
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name,
          phone,
          address,
          city,
          state,
          pincode,
          landmark,
          product_name: "FitLife Home Fitness Kit 5-in-1",
          offer_type: selectedOffer.qty === 2 ? "2 KITS" : "SINGLE KIT",
          quantity: selectedOffer.qty,
          amount: selectedOffer.price,
          payment_method: "Cash on Delivery",
          status: "Pending",
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Could not place the order.");
      }

      const order = (data.order || data) as Order;
      setOrderOpen(false);
      setSuccessOrder(order);
      e.currentTarget.reset();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function trackOrder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (trackLoading) return;

    setTrackingError("");
    setTrackedOrder(null);

    const order_id = trackId.trim().toUpperCase();
    const phone = trackPhone.replace(/\D/g, "");

    if (!order_id) return setTrackingError("Enter your Order ID.");
    if (!/^[6-9]\d{9}$/.test(phone)) return setTrackingError("Enter a valid 10-digit mobile number.");

    setTrackLoading(true);

    try {
      const response = await fetch(
        `/api/orders/track?order_id=${encodeURIComponent(order_id)}&phone=${encodeURIComponent(phone)}`,
        { cache: "no-store" }
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.order) {
        throw new Error(data?.error || "Order not found. Check Order ID and mobile number.");
      }

      setTrackedOrder(data.order as Order);
    } catch (error) {
      setTrackingError(error instanceof Error ? error.message : "Order not found.");
    } finally {
      setTrackLoading(false);
    }
  }

  const currentStatusIndex = useMemo(
    () => STATUS_STEPS.indexOf(trackedOrder?.status || ""),
    [trackedOrder]
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-white pb-24 text-zinc-950">
      <style jsx global>{`
        html { scroll-behavior: smooth; }
        body { margin: 0; background: #fff; }
        * { box-sizing: border-box; }
      `}</style>

      {/* OFFER BAR */}
      <div className="bg-lime-400 px-4 py-3 text-center text-sm font-black tracking-wide text-black sm:text-base">
        🔥 LIMITED TIME OFFER — PRICE INCREASES WHEN TIMER ENDS!
      </div>

      {/* HEADER */}
      <header className="bg-black text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between border-b border-white/10 px-4 py-5 sm:px-6">
          <div>
            <div className="text-3xl font-black tracking-tight">
              Fit<span className="text-lime-400">Life</span>
            </div>
            <div className="mt-1 text-[10px] font-bold tracking-[0.28em] text-zinc-400">
              HOME FITNESS KIT
            </div>
          </div>

          <button
            onClick={() => setTrackOpen(true)}
            className="rounded-full border border-white/30 px-4 py-3 text-xs font-black hover:border-lime-400 hover:text-lime-400"
          >
            TRACK ORDER
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-black text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:py-16">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-lime-400/50 bg-lime-400/10 px-4 py-2 text-sm font-black text-lime-400">
              💪 ALL-IN-ONE FITNESS KIT
            </div>

            <h1 className="text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl">
              HOME FITNESS
              <br />
              <span className="text-lime-400">KIT 5 IN 1</span>
            </h1>

            <p className="mt-7 max-w-xl text-2xl leading-snug text-zinc-300 sm:text-3xl">
              Your Complete Home Gym
              <br />
              Anytime, Anywhere!
            </p>

            <ul className="mt-8 space-y-4 text-base font-semibold text-zinc-200 sm:text-lg">
              <li>✓ Build Muscle & Burn Fat</li>
              <li>✓ Improve Strength & Stamina</li>
              <li>✓ Premium Quality Equipment</li>
              <li>✓ Suitable For Men & Women</li>
              <li>✓ Compact & Easy To Use</li>
            </ul>

            <div className="mt-8 flex items-center gap-3 text-sm">
              <span className="text-yellow-300">★★★★★</span>
              <span className="text-zinc-400">1000+ Happy Customers</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-3 shadow-2xl">
            <SafeImage
              src="/images/hero.jpg"
              alt="FitLife Home Fitness Kit"
              className="h-auto max-h-[560px] w-full rounded-2xl object-contain"
            />

            <div className="mt-4 text-center">
              <div className="mb-3 text-xs font-black tracking-[0.2em] text-lime-400">
                🔥 LIMITED STOCK — ORDER NOW
              </div>
              <button
                onClick={() => openOrder(OFFERS[0])}
                className="w-full rounded-2xl bg-lime-400 px-6 py-5 text-lg font-black text-black shadow-[0_12px_40px_rgba(163,230,53,0.25)] transition hover:scale-[1.01]"
              >
                BUY NOW — ₹949
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* COUNTDOWN + PRICE */}
      <section className="border-b border-zinc-200 bg-white px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <div className="text-xs font-black tracking-[0.2em] text-lime-600">OFFER ENDS IN</div>
          <div className="mt-2 text-5xl font-black tracking-wider sm:text-6xl">{timer}</div>

          <div className="mx-auto mt-8 max-w-md">
            <div className="text-xs font-black text-zinc-500">LIMITED TIME PRICE</div>
            <div className="mt-2 text-lg text-zinc-400 line-through">₹2,349</div>
            <div className="text-5xl font-black">{money(949)}</div>
            <div className="mt-2 inline-block rounded-full bg-lime-100 px-4 py-2 text-sm font-black text-lime-800">
              YOU SAVE ₹1,400
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {OFFERS.map((offer) => (
              <div key={offer.qty} className="rounded-3xl border border-zinc-200 p-5 text-left shadow-sm">
                <div className="text-xs font-black tracking-widest text-zinc-500">{offer.label}</div>
                <div className="mt-2 text-3xl font-black">{money(offer.price)}</div>
                {offer.qty === 2 && (
                  <div className="mt-1 text-sm font-bold text-lime-700">₹849 per kit</div>
                )}
                <button
                  onClick={() => openOrder(offer)}
                  className="mt-5 w-full rounded-xl bg-black px-5 py-4 text-base font-black text-white transition hover:bg-zinc-800"
                >
                  BUY NOW
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST - ONE TIME ONLY */}
      <section className="border-b border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-6xl overflow-x-auto px-4 py-5 sm:px-6">
          <div className="flex min-w-max justify-center gap-3 sm:grid sm:min-w-0 sm:grid-cols-4">
            {[
              ["🚚", "FREE SHIPPING", "Across India"],
              ["💵", "CASH ON DELIVERY", "Pay when you receive"],
              ["🔒", "SECURE PAYMENT", "Safe & secure"],
              ["↩️", "7 DAYS RETURN", "Hassle-free returns"],
            ].map(([icon, title, text]) => (
              <div key={title} className="flex min-w-[190px] items-center gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm sm:min-w-0 sm:flex-col sm:text-center">
                <span className="text-2xl">{icon}</span>
                <div>
                  <div className="text-xs font-black">{title}</div>
                  <div className="mt-1 text-[11px] text-zinc-500">{text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT'S INSIDE */}
      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-xs font-black tracking-[0.2em] text-lime-600">EVERYTHING YOU NEED</div>
          <h2 className="mt-2 text-3xl font-black sm:text-5xl">WHAT&apos;S INSIDE THE KIT?</h2>
          <p className="mt-4 max-w-2xl text-zinc-600">5 essential fitness products in one complete kit.</p>

          <div className="mt-8 flex snap-x gap-4 overflow-x-auto pb-4">
            {[
              ["HAND GRIPPER", "/images/hand-gripper.png", "Improve grip strength & forearm power"],
              ["RESISTANCE TUBE", "/images/resistance-tube.png", "Tone your arms & full body"],
              ["SKIPPING ROPE", "/images/skipping-rope.png", "Burn calories & improve stamina"],
              ["AB ROLLER", "/images/ab-roller.png", "Strengthen your core & build six pack"],
              ["COMPLETE KIT", "/images/fitness-kit.png", "Everything you need for home workouts"],
            ].map(([title, src, description]) => (
              <article key={title} className="min-w-[78%] snap-start overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm sm:min-w-[230px] sm:flex-1">
                <SafeImage src={src} alt={title} className="h-48 w-full object-contain bg-zinc-50 p-4" />
                <div className="p-4">
                  <h3 className="text-sm font-black">{title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW TO USE */}
      <section className="bg-zinc-100 px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-xs font-black tracking-[0.2em] text-lime-700">SIMPLE TO USE</div>
          <h2 className="mt-2 text-3xl font-black sm:text-5xl">HOW TO USE</h2>
          <p className="mt-4 max-w-2xl text-zinc-600">Simple movements you can add to your home workout routine.</p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["01", "HAND GRIP", "/images/how-to-gripper.jpg", "Squeeze and release slowly for controlled grip training."],
              ["02", "RESISTANCE TUBE", "/images/how-to-resistance.jpg", "Anchor safely and perform controlled pulls and presses."],
              ["03", "SKIPPING", "/images/how-to-skipping.jpg", "Start slowly and build your pace as your stamina improves."],
              ["04", "AB ROLLER", "/images/how-to-ab-roller.jpg", "Roll only as far as you can control with good form."],
            ].map(([num, title, src, text]) => (
              <article key={num} className="overflow-hidden rounded-3xl border border-zinc-200 bg-white">
                <SafeImage src={src} alt={title} className="h-52 w-full object-cover bg-zinc-200" />
                <div className="p-5">
                  <div className="text-sm font-black text-lime-600">{num}</div>
                  <h3 className="mt-1 font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-xs font-black tracking-[0.2em] text-lime-600">YOUR PROGRESS</div>
          <h2 className="mt-2 text-3xl font-black sm:text-5xl">REAL WORKOUT RESULTS</h2>
          <p className="mt-4 text-zinc-600">Use this space for genuine customer result photos and progress stories.</p>

          <div className="mt-8 flex snap-x gap-4 overflow-x-auto pb-4">
            {[
              ["/images/result-1.jpg", "Progress Story 01"],
              ["/images/result-2.jpg", "Progress Story 02"],
              ["/images/result-3.jpg", "Progress Story 03"],
              ["/images/result-4.jpg", "Progress Story 04"],
            ].map(([src, title]) => (
              <div key={title} className="min-w-[82%] snap-start overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 sm:min-w-[260px]">
                <SafeImage src={src} alt={title} className="h-72 w-full object-cover bg-zinc-100" />
                <div className="p-4 text-sm font-black">{title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY FITLIFE */}
      <section className="bg-black px-4 py-14 text-white sm:px-6">
        <div className="mx-auto max-w-6xl text-center">
          <div className="text-xs font-black tracking-[0.2em] text-lime-400">WHY FITLIFE?</div>
          <h2 className="mt-3 text-4xl font-black sm:text-6xl">
            TRAIN BETTER.
            <br />
            <span className="text-lime-400">LIVE STRONGER.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-zinc-400">
            A compact 5-in-1 workout solution designed for home training, strength, stamina and everyday fitness.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["01", "FULL BODY", "Train multiple muscle groups at home."],
              ["02", "EASY STORAGE", "Compact equipment for small spaces."],
              ["03", "ANYTIME", "Workout whenever your schedule allows."],
            ].map(([num, title, text]) => (
              <div key={num} className="rounded-2xl border border-white/10 p-6 text-left">
                <div className="text-sm font-black text-lime-400">{num}</div>
                <div className="mt-2 font-black">{title}</div>
                <p className="mt-2 text-sm text-zinc-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-xs font-black tracking-[0.2em] text-lime-600">1000+ HAPPY CUSTOMERS</div>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="mt-2 text-3xl font-black sm:text-5xl">CUSTOMER REVIEWS</h2>
              <p className="mt-3 text-sm text-zinc-500">Real customer feedback section — add verified reviews as orders come in.</p>
            </div>
            <div className="text-2xl font-black text-yellow-500">★★★★★</div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleReviews.map(([name, stars, text]) => (
              <article key={`${name}-${text}`} className="rounded-2xl border border-zinc-200 p-5">
                <div className="text-sm text-yellow-500">{stars}</div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">“{text}”</p>
                <div className="mt-4 text-sm font-black">{name}</div>
              </article>
            ))}
          </div>

          <button
            onClick={() => setShowAllReviews((v) => !v)}
            className="mx-auto mt-8 block rounded-full bg-black px-7 py-4 text-sm font-black text-white"
          >
            {showAllReviews ? "SHOW LESS" : "VIEW ALL REVIEWS"}
          </button>
        </div>
      </section>

      {/* CONFIDENCE */}
      <section className="bg-zinc-50 px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-6xl rounded-3xl border border-zinc-200 bg-white p-6 sm:p-10">
          <div className="text-xs font-black tracking-[0.2em] text-zinc-500">SIMPLE & TRUSTWORTHY</div>
          <h2 className="mt-2 text-3xl font-black sm:text-5xl">ORDER WITH CONFIDENCE</h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              ["7 Days Return", "Easy return support for eligible products."],
              ["Cash on Delivery", "Pay when your order reaches you."],
              ["Free Shipping", "Delivery available across India."],
              ["Secure Processing", "Your order details are processed securely."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl bg-zinc-50 p-5">
                <div className="font-black">{title}</div>
                <div className="mt-2 text-sm text-zinc-500">{text}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl bg-black p-5 text-white">
            <div className="font-black">Delivery Issues / Support</div>
            <div className="mt-2 text-sm text-zinc-400">
              Need help with your order? Keep your Order ID ready and contact store support.
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-black px-4 py-16 text-center text-white sm:px-6">
        <div className="text-xs font-black tracking-[0.2em] text-lime-400">LIMITED TIME OFFER</div>
        <h2 className="mt-4 text-4xl font-black sm:text-6xl">
          START YOUR FITNESS
          <br />
          <span className="text-lime-400">JOURNEY TODAY</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm text-zinc-400">Get your complete 5-in-1 home workout kit today.</p>
        <button
          onClick={() => openOrder(OFFERS[0])}
          className="mt-8 rounded-full bg-lime-400 px-9 py-5 text-base font-black text-black"
        >
          BUY NOW — ₹949
        </button>
      </section>

      {/* FOOTER */}
      <footer className="bg-zinc-950 px-4 py-8 text-white sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xl font-black">Fit<span className="text-lime-400">Life</span></div>
            <div className="mt-1 text-[9px] tracking-[0.25em] text-zinc-500">HOME FITNESS KIT</div>
          </div>
          <div className="flex flex-wrap gap-4 text-xs font-bold text-zinc-400">
            <button onClick={() => setTrackOpen(true)}>Track Order</button>
            <span>Contact / Support</span>
            <span>7 Days Return</span>
            <span>Cash on Delivery</span>
          </div>
        </div>
        <div className="mx-auto mt-7 max-w-6xl border-t border-white/10 pt-5 text-xs text-zinc-600">
          © 2026 FitLife. All rights reserved.
        </div>
      </footer>

      {/* ONLY FLOATING ELEMENT: STICKY BOTTOM BUY BAR */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-300 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-2 sm:gap-3">
          <button
            onClick={() => openOrder(OFFERS[0])}
            className="min-h-14 rounded-xl bg-lime-400 px-2 py-4 text-sm font-black text-black sm:text-base"
          >
            BUY SINGLE ₹949
          </button>
          <button
            onClick={() => openOrder(OFFERS[1])}
            className="min-h-14 rounded-xl bg-lime-400 px-2 py-4 text-sm font-black text-black sm:text-base"
          >
            BUY 2 KITS ₹1,698
          </button>
        </div>
      </div>

      {/* ORDER MODAL */}
      {orderOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-5">
          <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-black tracking-[0.2em] text-lime-600">CASH ON DELIVERY</div>
                <h2 className="mt-1 text-2xl font-black">COMPLETE YOUR ORDER</h2>
              </div>
              <button onClick={() => setOrderOpen(false)} className="rounded-full bg-zinc-100 px-4 py-2 font-black">✕</button>
            </div>

            <div className="mt-5 rounded-2xl bg-zinc-950 p-5 text-white">
              <div className="text-xs font-bold text-zinc-400">SELECTED OFFER</div>
              <div className="mt-1 text-xl font-black">{selectedOffer.label}</div>
              <div className="mt-1 text-2xl font-black text-lime-400">{money(selectedOffer.price)}</div>
            </div>

            <form onSubmit={submitOrder} className="mt-6 space-y-4">
              {[
                ["customer_name", "Full Name", "text", "Your full name"],
                ["phone", "Mobile Number", "tel", "10-digit mobile number"],
                ["address", "Complete Address", "text", "House / road / area"],
                ["city", "City", "text", "City"],
                ["state", "State", "text", "State"],
                ["pincode", "Pincode", "tel", "6-digit pincode"],
                ["landmark", "Landmark (Optional)", "text", "Nearby landmark"],
              ].map(([name, label, type, placeholder]) => (
                <label key={name} className="block">
                  <span className="mb-1 block text-sm font-black">{label}</span>
                  <input
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    required={!name.includes("landmark")}
                    inputMode={name === "phone" || name === "pincode" ? "numeric" : undefined}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-4 outline-none focus:border-lime-500"
                  />
                </label>
              ))}

              <div className="rounded-2xl border border-zinc-200 p-5">
                <div className="text-sm font-black">ORDER SUMMARY</div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span>Product</span><b>FitLife Home Fitness Kit</b></div>
                  <div className="flex justify-between"><span>Quantity</span><b>{selectedOffer.qty}</b></div>
                  <div className="flex justify-between"><span>Price</span><b>{money(selectedOffer.price)}</b></div>
                  <div className="flex justify-between"><span>Delivery</span><b className="text-lime-700">FREE</b></div>
                  <div className="mt-3 flex justify-between border-t pt-3 text-lg"><span className="font-black">Total</span><b>{money(selectedOffer.price)}</b></div>
                </div>
              </div>

              <div className="rounded-xl bg-lime-50 p-4 text-sm font-bold">
                💵 Payment Method: CASH ON DELIVERY
              </div>

              <button
                disabled={loading}
                className="w-full rounded-2xl bg-lime-400 px-5 py-5 text-lg font-black text-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "PLACING ORDER..." : `PLACE ORDER — ${money(selectedOffer.price)}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TRACK MODAL */}
      {trackOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-5">
          <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl sm:p-7">
            <div className="flex justify-between">
              <div>
                <div className="text-xs font-black tracking-widest text-lime-600">MY ORDER</div>
                <h2 className="mt-1 text-2xl font-black">TRACK ORDER</h2>
              </div>
              <button onClick={() => setTrackOpen(false)} className="rounded-full bg-zinc-100 px-4 py-2 font-black">✕</button>
            </div>

            <form onSubmit={trackOrder} className="mt-6 space-y-4">
              <input
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                placeholder="Order ID e.g. FIT-2026-000001"
                className="w-full rounded-xl border border-zinc-300 px-4 py-4 uppercase outline-none focus:border-lime-500"
              />
              <input
                value={trackPhone}
                onChange={(e) => setTrackPhone(e.target.value)}
                placeholder="Mobile Number"
                inputMode="numeric"
                className="w-full rounded-xl border border-zinc-300 px-4 py-4 outline-none focus:border-lime-500"
              />
              {trackingError && <div className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">{trackingError}</div>}
              <button disabled={trackLoading} className="w-full rounded-xl bg-black px-5 py-4 font-black text-white disabled:opacity-60">
                {trackLoading ? "CHECKING..." : "TRACK ORDER"}
              </button>
            </form>

            {trackedOrder && (
              <div className="mt-7">
                <div className="rounded-2xl bg-zinc-950 p-5 text-white">
                  <div className="text-xs text-zinc-400">ORDER ID</div>
                  <div className="mt-1 text-xl font-black text-lime-400">{trackedOrder.order_id}</div>
                  <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                    <div>Customer: <b>{trackedOrder.customer_name}</b></div>
                    <div>Quantity: <b>{trackedOrder.quantity}</b></div>
                    <div>Total: <b>{money(trackedOrder.amount)}</b></div>
                    <div>Payment: <b>{trackedOrder.payment_method}</b></div>
                  </div>
                </div>

                {trackedOrder.status === "Cancelled" ? (
                  <div className="mt-6 rounded-2xl bg-red-50 p-5 font-black text-red-700">❌ Order Cancelled</div>
                ) : (
                  <div className="mt-7">
                    <div className="text-sm font-black">ORDER STATUS</div>
                    <div className="mt-5 space-y-4">
                      {STATUS_STEPS.map((step, index) => {
                        const done = currentStatusIndex >= index;
                        const current = trackedOrder.status === step;
                        return (
                          <div key={step} className="flex items-center gap-4">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${done ? "bg-lime-400 text-black" : "bg-zinc-100 text-zinc-400"}`}>
                              {done ? "✓" : index + 1}
                            </div>
                            <div>
                              <div className={`font-black ${current ? "text-lime-700" : ""}`}>{step}</div>
                              {current && <div className="text-xs text-zinc-500">Current order status</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-7 rounded-2xl bg-zinc-50 p-5 text-sm">
                  <div className="font-black">Delivery Information</div>
                  <div className="mt-2 text-zinc-600">
                    {trackedOrder.address}, {trackedOrder.city}, {trackedOrder.state} - {trackedOrder.pincode}
                    {trackedOrder.landmark ? ` • ${trackedOrder.landmark}` : ""}
                  </div>
                  {trackedOrder.admin_note && <div className="mt-3 font-bold">Note: {trackedOrder.admin_note}</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {successOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 text-center">
            <div className="text-5xl">🎉</div>
            <h2 className="mt-4 text-2xl font-black">ORDER PLACED SUCCESSFULLY!</h2>
            <p className="mt-2 text-sm text-zinc-500">Please save your Order ID to track your order.</p>

            <div className="mt-6 rounded-2xl bg-zinc-950 p-5 text-white">
              <div className="text-xs text-zinc-400">YOUR ORDER ID</div>
              <div className="mt-1 text-2xl font-black text-lime-400">{successOrder.order_id || "Generated by server"}</div>
              <div className="mt-4 text-sm">Amount: <b>{money(successOrder.amount || selectedOffer.price)}</b></div>
              <div className="mt-1 text-sm">Payment: <b>Cash on Delivery</b></div>
            </div>

            <div className="mt-5 grid gap-3">
              <button
                onClick={() => {
                  setSuccessOrder(null);
                  setTrackId(successOrder.order_id || "");
                  setTrackPhone(successOrder.phone || "");
                  setTrackOpen(true);
                }}
                className="rounded-xl bg-lime-400 px-5 py-4 font-black"
              >
                TRACK MY ORDER
              </button>
              <button onClick={() => setSuccessOrder(null)} className="rounded-xl bg-zinc-100 px-5 py-4 font-black">
                CONTINUE SHOPPING
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
