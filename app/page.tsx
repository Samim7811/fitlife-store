/* FitLife Store — app/page.tsx
   Mobile-first landing page + Supabase-backed order flow.
   Replace the existing app/page.tsx with this file.
*/

"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Product = {
  id: string;
  name: string;
  description: string;
  image_url?: string | null;
};

type Order = {
  id: string;
  order_id: string;
  customer_name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  payment_method: string;
  status: string;
  tracking_number?: string | null;
  created_at?: string;
  updated_at?: string;
};

const FALLBACK_PRODUCTS: Product[] = [
  { id: "1", name: "HAND GRIPPER", description: "Improve grip strength & forearm power", image_url: null },
  { id: "2", name: "RESISTANCE TUBE", description: "Tone your arms & full body", image_url: null },
  { id: "3", name: "SKIPPING ROPE", description: "Burn calories & improve stamina", image_url: null },
  { id: "4", name: "AB ROLLER", description: "Strengthen your core & build six pack", image_url: null },
  { id: "5", name: "COMPLETE KIT", description: "Everything you need for home workouts", image_url: null },
];

const price = 949;
const twoKitPrice = 1698;

export default function Home() {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedQty, setSelectedQty] = useState(1);
  const [showOrder, setShowOrder] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [timeLeft, setTimeLeft] = useState(3 * 60 * 60);

  const selectedPrice = selectedQty === 2 ? twoKitPrice : price;

  useEffect(() => {
    const saved = localStorage.getItem("fitlife_offer_end");
    const end = saved ? Number(saved) : Date.now() + 3 * 60 * 60 * 1000;
    if (!saved) localStorage.setItem("fitlife_offer_end", String(end));

    const tick = () => {
      const remaining = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setTimeLeft(remaining);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadProducts();
  }, []);

  const countdown = useMemo(() => {
    const h = Math.floor(timeLeft / 3600);
    const m = Math.floor((timeLeft % 3600) / 60);
    const s = timeLeft % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [timeLeft]);

  async function loadProducts() {
    const { data } = await supabase
      .from("products")
      .select("id,name,description,image_url")
      .order("created_at", { ascending: true })
      .limit(5);

    if (data && data.length) setProducts(data as Product[]);
  }

  async function loadOrders() {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setOrders(data as Order[]);
  }

  function buy(qty: number) {
    setSelectedQty(qty);
    setShowOrder(true);
    setTimeout(() => document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  async function submitOrder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setNotice("");

    const form = new FormData(e.currentTarget);
    const customerName = String(form.get("customer_name") || "").trim();
    const address = String(form.get("address") || "").trim();
    const city = String(form.get("city") || "").trim();
    const state = String(form.get("state") || "").trim();
    const pincode = String(form.get("pincode") || "").trim();
    const landmark = String(form.get("landmark") || "").trim();
    const paymentMethod = String(form.get("payment_method") || "Cash on Delivery");

    const generatedId = `FL${Date.now().toString().slice(-8)}`;

    const payload = {
      order_id: generatedId,
      customer_name: customerName,
      address,
      city,
      state,
      pincode,
      landmark,
      product_name: selectedQty === 2 ? "FitLife Home Fitness Kit — 2 Kits" : "FitLife Home Fitness Kit — 1 Kit",
      quantity: selectedQty,
      unit_price: selectedQty === 2 ? 849 : 949,
      total_amount: selectedPrice,
      payment_method: paymentMethod,
      status: "pending",
    };

    const { error } = await supabase.from("orders").insert(payload);

    if (error) {
      setNotice(`Order save failed: ${error.message}`);
      setLoading(false);
      return;
    }

    setOrderId(generatedId);
    setNotice("Order placed successfully!");
    setShowOrder(false);
    setLoading(false);
    e.currentTarget.reset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function openMyOrders() {
    await loadOrders();
    setShowOrders(true);
    setTimeout(() => document.getElementById("my-orders")?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  function canReturn(order: Order) {
    if (!order.updated_at && !order.created_at) return false;
    const deliveredAt = new Date(order.updated_at || order.created_at!).getTime();
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    return order.status.toLowerCase() === "delivered" && Date.now() <= deliveredAt + threeDays;
  }

  async function requestReturn(order: Order) {
    const reason = window.prompt("Return reason?");
    if (!reason) return;

    const { error } = await supabase.from("return_requests").insert({
      order_id: order.order_id || order.id,
      reason,
      status: "requested",
    });

    if (error) {
      alert(error.message);
      return;
    }
    alert("Return request submitted.");
  }

  return (
    <main className="page">
      <style jsx global>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #080808; background: #fff; }
        button, input, textarea, select { font: inherit; }
        .page { overflow-x: hidden; padding-bottom: 92px; }
        .top-offer {
          background: #8df000; font-weight: 900; text-align: center;
          padding: 12px 16px; font-size: 14px; letter-spacing: .2px;
          position: relative; z-index: 2;
        }
        .header {
          background: #050505; color: #fff; padding: 22px 20px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid #222;
        }
        .logo { font-size: 28px; font-weight: 900; }
        .logo span { color: #8df000; }
        .sub { font-size: 11px; letter-spacing: 4px; color: #aaa; margin-top: 5px; }
        .track {
          border: 2px solid #555; background: transparent; color: #fff;
          border-radius: 999px; padding: 12px 18px; font-weight: 900;
        }
        .hero { background: #050505; color: #fff; padding: 54px 24px 46px; }
        .badge {
          display: inline-block; border: 1px solid #8df000; color: #8df000;
          padding: 10px 16px; border-radius: 999px; font-weight: 900; margin-bottom: 26px;
        }
        h1 { font-size: clamp(42px, 11vw, 86px); line-height: .94; margin: 0 0 28px; font-weight: 950; }
        h1 span, .green { color: #8df000; }
        .hero p { color: #cfcfcf; font-size: 20px; line-height: 1.55; max-width: 620px; }
        .checks { display: grid; gap: 13px; margin: 28px 0; color: #eee; font-size: 17px; }
        .checks div::before { content: "✓"; margin-right: 10px; }
        .cta {
          display: inline-flex; justify-content: center; align-items: center;
          background: #8df000; color: #050505; border: 0; border-radius: 999px;
          padding: 19px 28px; font-weight: 950; cursor: pointer; box-shadow: 0 8px 25px #8df00055;
        }
        .hero-buy { display: flex; gap: 12px; flex-wrap: wrap; }
        .timer-wrap { text-align: center; padding: 28px 16px 10px; }
        .timer-label { font-weight: 900; color: #777; }
        .timer { font-size: clamp(46px, 12vw, 92px); line-height: 1; font-weight: 950; margin: 10px 0; letter-spacing: -3px; }
        .price-area { text-align: center; padding: 10px 16px 38px; }
        .old { color: #999; text-decoration: line-through; font-size: 28px; }
        .main-price { font-size: 72px; font-weight: 950; line-height: 1; }
        .save { display: inline-block; margin: 15px 0; background: #edffd4; color: #437600; padding: 12px 22px; border-radius: 999px; font-weight: 900; }
        .plans { max-width: 950px; margin: auto; padding: 0 20px 55px; display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
        .plan { border: 1px solid #ddd; border-radius: 30px; padding: 30px; box-shadow: 0 4px 14px #00000010; }
        .plan h3 { margin: 0 0 18px; color: #777; letter-spacing: 2px; }
        .plan-price { font-size: 46px; font-weight: 950; margin-bottom: 20px; }
        .per { color: #4e8500; font-weight: 900; margin-top: -10px; margin-bottom: 20px; }
        .buy-black { width: 100%; padding: 20px; border: 0; border-radius: 20px; background: #000; color: #fff; font-weight: 950; cursor: pointer; font-size: 19px; }
        .trust {
          max-width: 1200px; margin: 20px auto 70px; padding: 30px;
          border: 1px solid #ddd; border-radius: 28px;
        }
        .eyebrow { color: #568c0a; letter-spacing: 4px; font-weight: 900; font-size: 13px; }
        .section-title { font-size: clamp(34px, 6vw, 62px); margin: 12px 0 34px; line-height: 1; }
        .trust-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .trust-card { background: #f8f8f8; border-radius: 18px; padding: 20px; min-width: 0; }
        .trust-card strong { display: block; margin-bottom: 8px; }
        .trust-card p { margin: 0; color: #777; font-size: 14px; line-height: 1.45; }
        .support { background: #000; color: #fff; border-radius: 18px; padding: 20px; margin-top: 12px; }
        .inside { padding: 60px 30px 70px; max-width: 1250px; margin: auto; }
        .inside-desc { color: #666; font-size: 20px; line-height: 1.5; margin-bottom: 30px; }
        .product-grid {
          display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 14px;
        }
        .product-card { border: 1px solid #ddd; border-radius: 22px; overflow: hidden; background: #fff; }
        .product-img { height: 210px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .product-img img { width: 100%; height: 100%; object-fit: cover; }
        .no-img { color: #aaa; font-size: 13px; text-align: center; padding: 15px; }
        .product-info { padding: 18px; }
        .product-info h3 { font-size: 16px; margin: 0 0 10px; }
        .product-info p { color: #777; font-size: 13px; margin: 0; line-height: 1.45; }
        .how { background: #f5f5f5; padding: 60px 30px; }
        .how-inner { max-width: 1200px; margin: auto; }
        .how-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .how-card { background: #fff; border-radius: 22px; overflow: hidden; border: 1px solid #ddd; }
        .how-image { height: 260px; background: #eee; }
        .how-image img { width: 100%; height: 100%; object-fit: cover; }
        .how-copy { padding: 20px; }
        .how-copy strong { font-size: 20px; }
        .results { background: #000; color: #fff; padding: 60px 30px; }
        .result-grid { max-width: 1200px; margin: auto; display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }
        .result-card { border: 1px solid #222; border-radius: 20px; overflow: hidden; }
        .result-card img { width: 100%; height: 260px; object-fit: cover; display: block; }
        .result-card div { padding: 18px; }
        .reviews { padding: 60px 30px; max-width: 1200px; margin: auto; }
        .review-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .review { border: 1px solid #ddd; border-radius: 18px; padding: 20px; }
        .stars { color: #7dcc00; font-size: 18px; }
        .faq { background: #f5f5f5; padding: 60px 30px; }
        .faq-inner { max-width: 1000px; margin: auto; }
        details { background: #fff; border: 1px solid #ddd; border-radius: 16px; padding: 18px 20px; margin: 10px 0; }
        .final { background: #050505; color: #fff; text-align: center; padding: 75px 25px; }
        .footer { background: #080808; color: #aaa; padding: 30px 25px; border-top: 1px solid #222; display: flex; justify-content: space-between; gap: 20px; }
        .sticky-buy {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
          background: rgba(255,255,255,.96); border-top: 1px solid #ddd;
          padding: 12px 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
          backdrop-filter: blur(10px);
        }
        .sticky-buy button { background: #8df000; border: 0; border-radius: 18px; padding: 17px 8px; font-weight: 950; font-size: 16px; cursor: pointer; }
        .modal-backdrop { position: fixed; inset: 0; background: #0008; z-index: 200; display: flex; align-items: flex-end; justify-content: center; }
        .modal { background: #fff; width: min(650px, 100%); max-height: 92vh; overflow: auto; border-radius: 28px 28px 0 0; padding: 25px; }
        .modal-head { display: flex; justify-content: space-between; align-items: center; }
        .close { border: 0; background: #eee; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; }
        form { display: grid; gap: 12px; margin-top: 18px; }
        input, textarea, select { width: 100%; border: 1px solid #ccc; border-radius: 13px; padding: 14px; outline: none; }
        textarea { min-height: 85px; resize: vertical; }
        .submit { background: #8df000; border: 0; border-radius: 15px; padding: 16px; font-weight: 950; cursor: pointer; }
        .orders { padding: 45px 20px; max-width: 900px; margin: auto; }
        .order-item { border: 1px solid #ddd; border-radius: 18px; padding: 18px; margin: 12px 0; }
        .order-row { display: flex; justify-content: space-between; gap: 15px; flex-wrap: wrap; }
        .status { background: #efffdc; color: #427400; padding: 7px 11px; border-radius: 999px; font-weight: 900; font-size: 12px; }
        .return-btn { margin-top: 12px; background: #000; color: #fff; border: 0; border-radius: 12px; padding: 11px 15px; font-weight: 800; cursor: pointer; }
        .notice { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); z-index: 300; background: #000; color: #fff; padding: 13px 18px; border-radius: 999px; font-weight: 800; max-width: 90%; text-align: center; }
        @media (max-width: 800px) {
          .header { padding: 18px 15px; }
          .logo { font-size: 24px; }
          .track { padding: 10px 13px; font-size: 13px; }
          .hero { padding: 42px 22px; }
          .hero p { font-size: 17px; }
          .plans { grid-template-columns: 1fr; padding-bottom: 35px; }
          .plan { padding: 23px; }
          .trust { margin: 0 12px 40px; padding: 20px; border-radius: 22px; }
          .trust-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .trust-card { padding: 14px; }
          .trust-card p { font-size: 12px; }
          .support { padding: 16px; }
          .inside { padding: 45px 18px 55px; }
          .product-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 7px; }
          .product-img { height: 92px; }
          .product-info { padding: 9px; }
          .product-info h3 { font-size: 10px; line-height: 1.2; }
          .product-info p { display: none; }
          .how { padding: 45px 18px; }
          .how-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
          .how-card:last-child { grid-column: span 2; }
          .how-image { height: 150px; }
          .how-copy { padding: 12px; }
          .how-copy strong { font-size: 14px; }
          .results { padding: 45px 18px; }
          .result-grid { grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px; }
          .result-card img { height: 150px; }
          .reviews { padding: 45px 18px; }
          .review-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
          .review { padding: 14px; font-size: 13px; }
          .footer { flex-direction: column; }
          .sticky-buy button { font-size: 15px; padding: 18px 5px; }
          .main-price { font-size: 58px; }
          .timer { font-size: 54px; }
        }
      `}</style>

      {notice && <div className="notice">{notice}</div>}

      <div className="top-offer">🔥 LIMITED TIME OFFER — PRICE INCREASES WHEN TIMER ENDS!</div>

      <header className="header">
        <div>
          <div className="logo">Fit<span>Life</span></div>
          <div className="sub">HOME FITNESS KIT</div>
        </div>
        <button className="track" onClick={openMyOrders}>MY ORDERS</button>
      </header>

      <section className="hero">
        <div className="badge">💪 ALL-IN-ONE FITNESS KIT</div>
        <h1>HOME FITNESS<br /><span>KIT 5 IN 1</span></h1>
        <p>Your Complete Home Gym<br />Anytime, Anywhere!</p>
        <div className="checks">
          <div>Build Muscle & Burn Fat</div>
          <div>Improve Strength & Stamina</div>
          <div>Premium Quality Equipment</div>
          <div>Suitable For Men & Women</div>
          <div>Compact & Easy To Use</div>
        </div>
        <div className="hero-buy">
          <button className="cta" onClick={() => buy(1)}>BUY SINGLE — ₹949</button>
          <button className="cta" onClick={() => buy(2)}>BUY 2 KITS — ₹1,698</button>
        </div>
      </section>

      <section className="timer-wrap">
        <div className="timer-label">LIMITED TIME PRICE</div>
        <div className="timer">{countdown}</div>
      </section>

      <section className="price-area">
        <div className="old">₹2,349</div>
        <div className="main-price">₹949</div>
        <div className="save">YOU SAVE ₹1,400</div>
      </section>

      <section className="plans">
        <div className="plan">
          <h3>SINGLE KIT</h3>
          <div className="plan-price">₹949</div>
          <button className="buy-black" onClick={() => buy(1)}>BUY NOW</button>
        </div>
        <div className="plan">
          <h3>2 KITS</h3>
          <div className="plan-price">₹1,698</div>
          <div className="per">₹849 per kit</div>
          <button className="buy-black" onClick={() => buy(2)}>BUY NOW</button>
        </div>
      </section>

      {/* Trust section appears only once. Four cards stay in a compact 2x2 mobile layout. */}
      <section className="trust">
        <div className="eyebrow">SIMPLE & TRUSTWORTHY</div>
        <h2 className="section-title">ORDER WITH CONFIDENCE</h2>
        <div className="trust-grid">
          <div className="trust-card"><strong>7 Days Return</strong><p>Easy return support for eligible products.</p></div>
          <div className="trust-card"><strong>Cash on Delivery</strong><p>Pay when your order reaches you.</p></div>
          <div className="trust-card"><strong>Free Shipping</strong><p>Delivery available across India.</p></div>
          <div className="trust-card"><strong>Secure Processing</strong><p>Your order details are processed securely.</p></div>
        </div>
        <div className="support"><strong>Delivery Issues / Support</strong><p>Need help with your order? Keep your Order ID ready and contact store support.</p></div>
      </section>

      <section className="inside">
        <div className="eyebrow">EVERYTHING YOU NEED</div>
        <h2 className="section-title">WHAT&apos;S INSIDE THE KIT?</h2>
        <p className="inside-desc">5 essential fitness products in one complete kit.</p>
        <div className="product-grid">
          {products.slice(0, 5).map((p) => (
            <article className="product-card" key={p.id}>
              <div className="product-img">
                {p.image_url ? <img src={p.image_url} alt={p.name} /> : <div className="no-img">Product image</div>}
              </div>
              <div className="product-info">
                <h3>{p.name}</h3>
                <p>{p.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="how">
        <div className="how-inner">
          <div className="eyebrow">SIMPLE TO USE</div>
          <h2 className="section-title">HOW TO USE</h2>
          <div className="how-grid">
            {[
              ["1", "HAND GRIPPER", "Squeeze slowly for controlled reps."],
              ["2", "RESISTANCE TUBE", "Anchor safely and train arms & body."],
              ["3", "SKIPPING ROPE", "Keep a steady rhythm for cardio."],
            ].map(([n, title, text]) => (
              <article className="how-card" key={n}>
                <div className="how-image"><div className="no-img">HOW TO USE IMAGE</div></div>
                <div className="how-copy"><strong>{n}. {title}</strong><p>{text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="results">
        <div style={{maxWidth:1200,margin:"auto"}}>
          <div className="eyebrow">REAL FITNESS RESULTS</div>
          <h2 className="section-title">TRAIN. BUILD. REPEAT.</h2>
          <div className="result-grid">
            {[1,2,3].map(n => <article className="result-card" key={n}><div style={{height:260,background:"#171717",display:"flex",alignItems:"center",justifyContent:"center",color:"#777"}}>RESULT IMAGE {n}</div><div>Consistent home workouts made simple.</div></article>)}
          </div>
        </div>
      </section>

      <section className="reviews">
        <div className="eyebrow">CUSTOMER REVIEWS</div>
        <h2 className="section-title">LOVED BY FITNESS BUYERS</h2>
        <div className="review-grid">
          {[
            ["Rahul", "Good quality and useful for home workouts."],
            ["Amit", "Worth the price. Easy to store."],
            ["Priya", "COD delivery was smooth."],
            ["Sourav", "Good beginner fitness kit."],
            ["Neha", "Compact and easy to use."],
            ["Arjun", "Everything arrived properly packed."],
          ].map(([name, text]) => (
            <div className="review" key={name}><div className="stars">★★★★★</div><p>&quot;{text}&quot;</p><strong>{name}</strong></div>
          ))}
        </div>
      </section>

      <section className="faq">
        <div className="faq-inner">
          <div className="eyebrow">NEED TO KNOW?</div>
          <h2 className="section-title">FAQ</h2>
          <details><summary>Is Cash on Delivery available?</summary><p>Yes, COD is available across eligible Indian locations.</p></details>
          <details><summary>How long is the return window?</summary><p>Eligible products can be requested for return within 7 days. Delivered orders show a return button for 3 days as requested.</p></details>
          <details><summary>How can I track my order?</summary><p>Open My Orders to see order status and tracking information.</p></details>
        </div>
      </section>

      <section className="final">
        <div className="eyebrow">LIMITED TIME OFFER</div>
        <h2 className="section-title">START YOUR FITNESS<br /><span className="green">JOURNEY TODAY</span></h2>
        <p>Get your complete 5-in-1 home workout kit today.</p>
        <button className="cta" onClick={() => buy(1)}>BUY NOW — ₹949</button>
      </section>

      <footer className="footer">
        <div><strong style={{color:"#fff",fontSize:20}}>Fit<span style={{color:"#8df000"}}>Life</span></strong><div>HOME FITNESS KIT</div></div>
        <div>My Orders &nbsp; • &nbsp; 7 Days Return &nbsp; • &nbsp; Cash on Delivery</div>
      </footer>

      <div className="sticky-buy">
        <button onClick={() => buy(1)}>BUY SINGLE ₹949</button>
        <button onClick={() => buy(2)}>BUY 2 KITS ₹1,698</button>
      </div>

      {showOrder && (
        <div className="modal-backdrop" onMouseDown={() => setShowOrder(false)}>
          <div className="modal" id="order-form" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <div className="eyebrow">CHECKOUT</div>
                <h2 style={{margin:"8px 0"}}>Complete Your Order</h2>
              </div>
              <button className="close" onClick={() => setShowOrder(false)}>×</button>
            </div>
            <p><strong>{selectedQty === 2 ? "2 Kits — ₹1,698" : "1 Kit — ₹949"}</strong></p>
            <form onSubmit={submitOrder}>
              <input name="customer_name" placeholder="Full name" required />
              <input name="pincode" inputMode="numeric" placeholder="PIN code" required />
              <input name="city" placeholder="City" required />
              <input name="state" placeholder="State" required />
              <textarea name="address" placeholder="Full delivery address" required />
              <input name="landmark" placeholder="Landmark (optional)" />
              <select name="payment_method" defaultValue="Cash on Delivery">
                <option>Cash on Delivery</option>
              </select>
              <button className="submit" disabled={loading}>{loading ? "PLACING ORDER..." : `PLACE ORDER — ₹${selectedPrice.toLocaleString("en-IN")}`}</button>
            </form>
          </div>
        </div>
      )}

      {showOrders && (
        <div className="modal-backdrop" onMouseDown={() => setShowOrders(false)}>
          <div className="modal" id="my-orders" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div><div className="eyebrow">MY ORDERS</div><h2>Order History</h2></div>
              <button className="close" onClick={() => setShowOrders(false)}>×</button>
            </div>

            {orders.length === 0 && <p>No orders found.</p>}

            {orders.map((order) => (
              <div className="order-item" key={order.id}>
                <div className="order-row">
                  <strong>#{order.order_id || order.id.slice(0,8)}</strong>
                  <span className="status">{order.status}</span>
                </div>
                <p>{order.product_name}</p>
                <p><strong>Total: ₹{Number(order.total_amount).toLocaleString("en-IN")}</strong></p>
                {order.tracking_number && <p>Tracking: {order.tracking_number}</p>}
                {order.status.toLowerCase() === "delivered" && canReturn(order) && (
                  <button className="return-btn" onClick={() => requestReturn(order)}>REQUEST RETURN</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {orderId && (
        <div className="modal-backdrop" onMouseDown={() => setOrderId("")}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()} style={{textAlign:"center"}}>
            <div className="eyebrow">ORDER CONFIRMED</div>
            <h2>Thank you!</h2>
            <p>Your Order ID is</p>
            <div style={{fontSize:32,fontWeight:950}}>{orderId}</div>
            <p>Save this ID to check your order history.</p>
            <button className="submit" onClick={() => { setOrderId(""); openMyOrders(); }}>VIEW MY ORDERS</button>
          </div>
        </div>
      )}
    </main>
  );
}
