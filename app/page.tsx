"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Offer = { qty: number; total: number; unit: number; title: string };
type Order = {
  id?: string;
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
  unit_price: number;
  total_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  updated_at?: string;
};

const offers: Offer[] = [
  { qty: 1, total: 949, unit: 949, title: "SINGLE KIT" },
  { qty: 2, total: 1698, unit: 849, title: "2 KITS" },
];

const products = [
  ["HAND GRIPPER", "Improve grip strength & forearm power", "/images/hand-gripper.png"],
  ["RESISTANCE TUBE", "Tone your arms & full body", "/images/resistance-tube.png"],
  ["SKIPPING ROPE", "Burn calories & improve stamina", "/images/skipping-rope.png"],
  ["AB ROLLER", "Strengthen your core & build six pack", "/images/ab-roller.png"],
  ["COMPLETE KIT", "Everything you need for home workouts", "/images/fitness-kit.png"],
];

const reviews = [
  ["Rahul S.", "Great quality and very useful for home workouts."],
  ["Amit K.", "Good value for money. Delivery was quick."],
  ["Priya M.", "Compact kit and easy to use every day."],
  ["Arjun R.", "The resistance tube is excellent for home training."],
  ["Suman D.", "Everything arrived safely and was well packed."],
  ["Neha P.", "Perfect fitness kit for beginners."],
  ["Rohit A.", "Worth the price. I use it regularly."],
  ["Kunal B.", "Good product quality and useful accessories."],
  ["Anjali S.", "Very convenient when you cannot go to a gym."],
  ["Vikas M.", "The skipping rope and gripper are my favourites."],
  ["Sneha R.", "Nice kit for basic workouts at home."],
  ["Sourav K.", "Fast delivery and good packaging."],
  ["Pooja D.", "Easy to store and use."],
  ["Manish S.", "Good starter kit for fitness."],
  ["Riya P.", "Happy with the purchase."],
  ["Debashis G.", "Everything I needed in one kit."],
  ["Tanya M.", "Simple, compact and useful."],
  ["Imran A.", "Good value for a home workout setup."],
  ["Ayan B.", "Product was as expected."],
  ["Moumita S.", "Very handy for daily exercise."],
  ["Rakesh D.", "Good quality at this offer price."],
  ["Nandini P.", "Easy to use and store."],
  ["Sahil K.", "Satisfied with the purchase."],
  ["Kajal R.", "The kit is useful for full body exercise."],
  ["Partha S.", "COD experience was smooth."],
  ["Tushar M.", "Good beginner equipment."],
  ["Mita D.", "Nice compact home gym kit."],
  ["Sanjay P.", "Delivery was on time."],
  ["Ritu S.", "Good quality accessories."],
  ["Abhishek K.", "Would recommend for home workouts."],
];

const trust = [
  ["🚚", "FREE SHIPPING", "Across India"],
  ["💵", "CASH ON DELIVERY", "Pay when you receive"],
  ["↩️", "7 DAYS RETURN", "Hassle-free returns"],
  ["🔒", "SECURE PROCESSING", "Safe & secure order processing"],
];

const statuses = ["Pending", "Confirmed", "Shipped", "Out for Delivery", "Delivered"];

const money = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;
const phone10 = (v: string) => v.replace(/\D/g, "").slice(-10);

function newOrderId() {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `FIT-${date}-${Math.floor(100000 + Math.random() * 900000)}`;
}

function isReturnOpen(o: Order) {
  if (o.status !== "Delivered") return false;
  return Date.now() - new Date(o.updated_at || o.created_at).getTime() <= 3 * 86400000;
}

export default function Home() {
  const [time, setTime] = useState(3 * 3600);
  const [offer, setOffer] = useState<Offer>(offers[0]);
  const [checkout, setCheckout] = useState(false);
  const [success, setSuccess] = useState<Order | null>(null);
  const [myOrders, setMyOrders] = useState(false);
  const [trackId, setTrackId] = useState("");
  const [trackPhone, setTrackPhone] = useState("");
  const [historyPhone, setHistoryPhone] = useState("");
  const [history, setHistory] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trackLoading, setTrackLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [returnMessage, setReturnMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("fitlife_offer_end");
    const end = saved ? Number(saved) : Date.now() + 3 * 3600000;
    if (!saved) localStorage.setItem("fitlife_offer_end", String(end));
    const tick = () => setTime(Math.max(0, Math.floor((end - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const timer = useMemo(() => {
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = time % 60;
    return [h, m, s].map(v => String(v).padStart(2, "0")).join(":");
  }, [time]);

  function buy(qty: number) {
    setOffer(offers.find(x => x.qty === qty) || offers[0]);
    setError("");
    setCheckout(true);
  }

  async function placeOrder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    const f = new FormData(e.currentTarget);
    const customer_name = String(f.get("name") || "").trim();
    const phone = phone10(String(f.get("phone") || ""));
    const address = String(f.get("address") || "").trim();
    const city = String(f.get("city") || "").trim();
    const state = String(f.get("state") || "").trim();
    const pincode = String(f.get("pincode") || "").trim();
    const landmark = String(f.get("landmark") || "").trim();

    if (!customer_name || !address || !city || !state) {
      setError("Please fill every required field.");
      setLoading(false);
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      setLoading(false);
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      setError("Please enter a valid 6-digit pincode.");
      setLoading(false);
      return;
    }

    const payload = {
      order_id: newOrderId(),
      customer_name,
      phone,
      address,
      city,
      state,
      pincode,
      landmark: landmark || null,
      product_name: "FitLife Home Fitness Kit 5 in 1",
      quantity: offer.qty,
      unit_price: offer.unit,
      total_amount: offer.total,
      payment_method: "Cash on Delivery",
      status: "Pending",
    };

    const { data, error: dbError } = await supabase
      .from("orders")
      .insert(payload)
      .select("*")
      .single();

    setLoading(false);

    if (dbError || !data) {
      setError(dbError?.message || "Order could not be placed. Please try again.");
      return;
    }

    setCheckout(false);
    setSuccess(data as Order);
  }

  async function trackOrder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTrackLoading(true);
    setHistoryError("");
    setSelectedOrder(null);

    const id = trackId.trim();
    const phone = phone10(trackPhone);

    if (!id || !/^[6-9]\d{9}$/.test(phone)) {
      setHistoryError("Enter a valid Order ID and 10-digit mobile number.");
      setTrackLoading(false);
      return;
    }

    const { data, error: dbError } = await supabase
      .from("orders")
      .select("*")
      .eq("order_id", id)
      .eq("phone", phone)
      .maybeSingle();

    setTrackLoading(false);

    if (dbError || !data) {
      setHistoryError("Order not found. Please check the Order ID and mobile number.");
      return;
    }
    setSelectedOrder(data as Order);
  }

  async function loadHistory(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHistoryLoading(true);
    setHistoryError("");
    setHistory([]);

    const phone = phone10(historyPhone);
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setHistoryError("Enter the same 10-digit mobile number used for your orders.");
      setHistoryLoading(false);
      return;
    }

    const { data, error: dbError } = await supabase
      .from("orders")
      .select("*")
      .eq("phone", phone)
      .order("created_at", { ascending: false });

    setHistoryLoading(false);

    if (dbError) {
      setHistoryError(dbError.message || "Could not load order history.");
      return;
    }
    setHistory(data as Order[]);
  }

  async function requestReturn() {
    if (!selectedOrder || !isReturnOpen(selectedOrder)) return;
    setReturnMessage("Return request noted. Please contact store support with your Order ID.");
  }

  function statusIndex(status: string) {
    return statuses.indexOf(status);
  }

  return (
    <main className="page">
      <style jsx global>{`
        *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#fff;color:#080808}
        button,input,textarea{font:inherit}button{cursor:pointer}.page{padding-bottom:100px;overflow:hidden}
        .top{background:#9cff00;color:#050505;text-align:center;font-weight:950;padding:10px 12px;font-size:13px}
        .header{background:#050505;color:#fff;padding:20px 6%;display:flex;justify-content:space-between;align-items:center}.logo{font-size:28px;font-weight:950}.green{color:#9cff00}.sub{letter-spacing:4px;font-size:9px;color:#aaa;margin-top:4px}
        .track{background:transparent;color:#fff;border:1px solid #666;border-radius:30px;padding:11px 18px;font-weight:900}
        .hero{background:#050505;color:#fff;padding:55px 7% 65px}.badge{display:inline-block;border:1px solid #649600;color:#9cff00;border-radius:30px;padding:10px 16px;font-weight:900}
        h1{font-size:clamp(45px,7vw,82px);line-height:.94;margin:24px 0;max-width:900px}.hero p{color:#bbb;font-size:21px;line-height:1.4}.checks{display:grid;gap:10px;color:#ddd;font-size:16px;margin:25px 0}
        .heroImage{width:min(800px,100%);height:420px;background:#111;border-radius:24px;overflow:hidden;margin:30px auto}.heroImage img{width:100%;height:100%;object-fit:contain}.heroBtns{display:flex;gap:12px;flex-wrap:wrap}
        .buy{background:#9cff00;color:#050505;border:0;border-radius:15px;padding:17px 25px;font-weight:950}.countLabel{text-align:center;color:#666;font-weight:900;letter-spacing:3px;margin-top:25px}.count{text-align:center;font-size:clamp(52px,9vw,86px);font-weight:950}
        .offer{text-align:center;padding:15px 20px 55px}.old{text-decoration:line-through;color:#999;font-size:27px}.price{font-size:72px;font-weight:950}.save{display:inline-block;background:#efffd9;color:#4d8100;border-radius:30px;padding:10px 20px;font-weight:900}
        .plans{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;max-width:1000px;margin:0 auto 55px;padding:0 25px}.plan{border:1px solid #ddd;border-radius:22px;padding:28px;box-shadow:0 3px 12px #ddd}.plan h3{color:#777;letter-spacing:2px}.amount{font-size:45px;font-weight:950;margin:12px 0}.blackBtn{width:100%;background:#050505;color:#fff;border:0;border-radius:15px;padding:17px;font-weight:950;font-size:18px;margin-top:14px}
        .trust{max-width:1150px;margin:auto;padding:0 25px 60px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.trustCard{border:1px solid #e5e5e5;border-radius:16px;padding:17px}.trustIcon{font-size:23px}.trustTitle{font-size:12px;font-weight:950;margin-top:6px}.trustText{font-size:11px;color:#777;margin-top:4px}
        .section{padding:65px 5%}.alt{background:#f6f6f6}.eyebrow{color:#609800;letter-spacing:4px;font-weight:950}h2{font-size:clamp(38px,6vw,67px);line-height:.98;margin:12px 0 20px}.lead{color:#666;font-size:19px;line-height:1.5}
        .products{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:30px}.product{border:1px solid #ddd;border-radius:16px;overflow:hidden;background:#fff}.product img{width:100%;aspect-ratio:1;object-fit:cover;display:block;background:#eee}.productInfo{padding:12px}.productInfo b{display:block;font-size:13px}.productInfo small{display:block;color:#777;line-height:1.35;margin-top:5px}
        .howGrid,.resultGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:28px}.how,.result{border:1px solid #ddd;border-radius:17px;overflow:hidden;background:#fff}.how img,.result img{width:100%;aspect-ratio:16/10;object-fit:cover;display:block}.how div{padding:13px}
        .reviewGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.review{border:1px solid #ddd;border-radius:16px;padding:16px;background:#fff}.stars{color:#6a9f00;font-weight:950}.review p{color:#555;line-height:1.4}.viewAll{margin-top:20px;background:#050505;color:#fff;border:0;border-radius:30px;padding:12px 20px;font-weight:900}
        .confidence{max-width:1150px;margin:0 auto 55px;padding:45px 5%;border:1px solid #ddd;border-radius:25px}.confidenceGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.confidenceCard{background:#f7f7f7;border-radius:14px;padding:16px}.confidenceCard small{display:block;color:#777;margin-top:6px}.support{background:#050505;color:#fff;border-radius:14px;padding:18px;margin-top:12px}.support small{display:block;color:#aaa;margin-top:5px}
        .cta{background:#050505;color:#fff;text-align:center;padding:75px 20px}.cta h2{font-size:clamp(40px,7vw,78px)}footer{background:#050505;color:#777;border-top:1px solid #222;padding:28px 6%;display:flex;justify-content:space-between;gap:20px}
        .sticky{position:fixed;left:0;right:0;bottom:0;z-index:50;background:#fff;padding:9px 15px;display:grid;grid-template-columns:1fr 1fr;gap:10px;box-shadow:0 -4px 18px #bbb}.sticky button{background:#9cff00;border:0;border-radius:15px;padding:16px 3px;font-weight:950;font-size:16px}
        .modal{position:fixed;inset:0;background:#000b;z-index:200;display:flex;align-items:center;justify-content:center;padding:14px}.modalBox{background:#fff;width:min(680px,100%);max-height:93vh;overflow:auto;border-radius:24px;padding:25px;position:relative}.close{position:absolute;right:12px;top:6px;border:0;background:transparent;font-size:34px}
        .selected{background:#efffd9;border:1px solid #9cff00;border-radius:12px;padding:13px;font-weight:900;margin:14px 0}.formGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.field{display:grid;gap:5px}.full{grid-column:1/-1}.field label{font-size:11px;font-weight:950}.field input,.field textarea{width:100%;padding:12px;border:1px solid #ccc;border-radius:10px}.field textarea{min-height:80px}
        .summary{background:#f6f6f6;border-radius:13px;padding:13px;margin:14px 0}.row{display:flex;justify-content:space-between;padding:5px 0}.total{border-top:1px solid #ddd;margin-top:5px;padding-top:10px;font-size:20px;font-weight:950}.error{background:#ffe5e5;color:#a00000;padding:10px;border-radius:10px;margin:10px 0;font-size:13px}
        .success{text-align:center}.orderId{background:#efffd9;border-radius:12px;padding:14px;font-size:23px;font-weight:950;margin:15px 0}.successActions{display:grid;gap:10px}
        .trackForm{display:grid;gap:9px}.trackForm input{padding:13px;border:1px solid #ccc;border-radius:10px}.orderCard{border:1px solid #ddd;border-radius:16px;padding:16px;margin-top:16px}.orderTop{display:flex;justify-content:space-between;gap:10px}.pill{background:#efffd9;color:#4c7d00;padding:7px 11px;border-radius:20px;font-weight:900;font-size:12px}
        .historyItem{border:1px solid #ddd;border-radius:13px;padding:13px;margin-top:9px;display:flex;justify-content:space-between;gap:10px;align-items:center}.timeline{margin-top:18px}.step{display:flex;gap:10px;align-items:flex-start;min-height:42px}.dot{width:23px;height:23px;border:2px solid #ccc;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:none;font-size:11px}.done .dot{background:#9cff00;border-color:#9cff00}.line{border-left:2px solid #ddd;height:19px;margin-left:10px}.cancelled{color:#b00000;font-weight:950}.returnBtn{background:#050505;color:#fff;border:0;border-radius:10px;padding:12px 16px;font-weight:900;margin-top:10px}.note{color:#777;font-size:12px;margin-top:6px}
        @media(max-width:700px){
          .top{font-size:10px}.header{padding:16px 18px}.logo{font-size:23px}.track{font-size:11px;padding:9px 12px}.hero{padding:43px 20px 50px}h1{font-size:46px}.hero p{font-size:18px}.heroImage{height:280px}.heroBtns{display:grid}.heroBtns .buy{width:100%}
          .count{font-size:52px}.price{font-size:60px}.plans{grid-template-columns:1fr;padding:0 15px}.trust{grid-template-columns:repeat(4,1fr);padding:0 10px 45px;gap:5px}.trustCard{padding:9px 3px;text-align:center}.trustIcon{font-size:18px}.trustTitle{font-size:7px}.trustText{font-size:6px}
          .section{padding:45px 18px}h2{font-size:39px}.lead{font-size:16px}.products{grid-template-columns:repeat(5,minmax(0,1fr));gap:4px}.product{border-radius:8px}.productInfo{padding:5px}.productInfo b{font-size:7px;white-space:nowrap;overflow:hidden}.productInfo small{display:none}
          .howGrid,.resultGrid{grid-template-columns:repeat(3,1fr);gap:5px}.how{border-radius:8px}.how div{padding:6px;font-size:8px}.reviewGrid{grid-template-columns:1fr 1fr;gap:7px}.review{padding:10px;font-size:11px}.confidence{margin:0 12px 45px;padding:30px 15px}.confidenceGrid{grid-template-columns:repeat(4,1fr);gap:5px}.confidenceCard{padding:9px 4px}.confidenceCard b{font-size:8px}.confidenceCard small{font-size:6px}
          .formGrid{grid-template-columns:1fr}.full{grid-column:auto}.historyItem{font-size:12px}.sticky button{font-size:12px}
          footer{display:block;font-size:10px}
        }
      `}</style>

      <div className="top">🔥 LIMITED TIME OFFER — PRICE INCREASES WHEN TIMER ENDS!</div>

      <header className="header">
        <div><div className="logo">Fit<span>Life</span></div><div className="sub">HOME FITNESS KIT</div></div>
        <button className="track" onClick={() => { setMyOrders(true); setSelectedOrder(null); }}>MY ORDERS</button>
      </header>

      <section className="hero">
        <div className="badge">💪 ALL-IN-ONE FITNESS KIT</div>
        <h1>HOME FITNESS <span className="green">KIT 5 IN 1</span></h1>
        <p>Your Complete Home Gym<br/>Anytime, Anywhere!</p>
        <div className="checks">
          <div>✓ Build Muscle & Burn Fat</div><div>✓ Improve Strength & Stamina</div><div>✓ Premium Quality Equipment</div><div>✓ Suitable For Men & Women</div><div>✓ Compact & Easy To Use</div>
        </div>
        <div className="heroImage"><img src="/images/hero.jpg" alt="FitLife Home Fitness Kit"/></div>
        <div className="heroBtns"><button className="buy" onClick={() => buy(1)}>BUY SINGLE — ₹949</button><button className="buy" onClick={() => buy(2)}>BUY 2 KITS — ₹1,698</button></div>
      </section>

      <div className="countLabel">⏰ OFFER ENDS IN</div><div className="count">{timer}</div>

      <section className="offer"><div className="eyebrow">LIMITED TIME PRICE</div><div className="old">₹2,349</div><div className="price">₹949</div><div className="save">YOU SAVE ₹1,400</div></section>

      <section className="trust">{trust.map(([i,t,d]) => <div className="trustCard" key={t}><div className="trustIcon">{i}</div><div className="trustTitle">{t}</div><div className="trustText">{d}</div></div>)}</section>

      <section className="section alt">
  <div className="eyebrow">SIMPLE TO USE</div>
  <h2>HOW TO USE</h2>
  <p className="lead">
    Follow the simple instructions for every product in your FitLife Home Fitness Kit.
  </p>

  <div className="howLongImage">
    <img
      src="/images/how-to-use.png"
      alt="How to use FitLife Home Fitness Kit"
    />
  </div>
</section>

<section className="section">
        <div className="eyebrow">RESULTS</div><h2>TRAIN. IMPROVE. REPEAT.</h2>
        <div className="resultGrid">{[1,2,3].map(n => <div className="result" key={n}><img src={`/result-${n}.jpg`} alt={`Fitness result ${n}`}/></div>)}</div>
      </section>

      <section className="section alt">
        <div className="eyebrow">REAL CUSTOMER FEEDBACK</div><h2>WHAT CUSTOMERS SAY</h2><p className="lead">★★★★★ 4.9/5 • 90+ happy customers</p>
        <div className="reviewGrid">{reviews.slice(0, reviewsOpen ? reviews.length : 6).map(([name,text],i) => <div className="review" key={`${name}-${i}`}><div className="stars">★★★★★</div><b>{name}</b><p>“{text}”</p><small>✓ Verified Purchase</small></div>)}</div>
        <button className="viewAll" onClick={() => setReviewsOpen(v => !v)}>{reviewsOpen ? "SHOW LESS" : "VIEW ALL REVIEWS"}</button>
      </section>

      <section className="confidence">
        <div className="eyebrow">SIMPLE & TRUSTWORTHY</div><h2>ORDER WITH CONFIDENCE</h2>
        <div className="confidenceGrid">{[["7 Days Return","Hassle-free returns"],["Cash on Delivery","Pay when you receive"],["Free Shipping","Across India"],["Secure Processing","Safe order processing"]].map(([a,b]) => <div className="confidenceCard" key={a}><b>{a}</b><small>{b}</small></div>)}</div>
        <div className="support"><b>Delivery Issues / Support</b><small>Keep your Order ID ready when contacting support.</small></div>
      </section>

      <section className="cta"><div className="eyebrow">LIMITED TIME OFFER</div><h2>START YOUR FITNESS <span className="green">JOURNEY TODAY</span></h2><p>Get your complete 5-in-1 home workout kit today.</p><button className="buy" onClick={() => buy(1)}>BUY NOW — ₹949</button></section>

      <footer><div><b>Fit<span className="green">Life</span></b><div className="sub">HOME FITNESS KIT</div></div><div>My Orders • Contact / Support • 7 Days Return • Cash on Delivery</div></footer>

      <div className="sticky"><button onClick={() => buy(1)}>BUY SINGLE ₹949</button><button onClick={() => buy(2)}>BUY 2 KITS ₹1,698</button></div>

      {checkout && <div className="modal"><div className="modalBox">
        <button className="close" onClick={() => setCheckout(false)}>×</button><div className="eyebrow">CHECKOUT</div><h2>COMPLETE YOUR ORDER</h2>
        <div className="selected">{offer.title} • Qty {offer.qty} • {money(offer.total)} • FREE DELIVERY</div>
        <form onSubmit={placeOrder}>
          <div className="formGrid">
            <div className="field full"><label>FULL NAME *</label><input name="name" required placeholder="Your full name"/></div>
            <div className="field"><label>MOBILE NUMBER *</label><input name="phone" required inputMode="numeric" maxLength={10} placeholder="10 digit number"/></div>
            <div className="field"><label>PINCODE *</label><input name="pincode" required inputMode="numeric" maxLength={6} placeholder="6 digit pincode"/></div>
            <div className="field full"><label>COMPLETE ADDRESS *</label><textarea name="address" required placeholder="House no, street, area"/></div>
            <div className="field"><label>CITY *</label><input name="city" required/></div><div className="field"><label>STATE *</label><input name="state" required/></div>
            <div className="field full"><label>LANDMARK (OPTIONAL)</label><input name="landmark" placeholder="Nearby landmark"/></div>
          </div>
          <div className="summary"><div className="row"><span>Product</span><b>FitLife Home Fitness Kit 5 in 1</b></div><div className="row"><span>Quantity</span><b>{offer.qty}</b></div><div className="row"><span>Delivery</span><b>FREE</b></div><div className="row"><span>Payment</span><b>Cash on Delivery</b></div><div className="row total"><span>Total</span><b>{money(offer.total)}</b></div></div>
          {error && <div className="error">{error}</div>}<button className="buy" style={{width:"100%"}} disabled={loading}>{loading ? "PLACING ORDER..." : `PLACE ORDER — ${money(offer.total)}`}</button>
        </form>
      </div></div>}

      {success && <div className="modal"><div className="modalBox" style={{textAlign:"center"}}>
        <button className="close" onClick={() => setSuccess(null)}>×</button><div style={{fontSize:55}}>🎉</div><div className="eyebrow">SUCCESS</div><h2>ORDER PLACED SUCCESSFULLY!</h2><div className="orderId">{success.order_id}</div><p><b>Amount:</b> {money(success.total_amount)}<br/><b>Payment:</b> Cash on Delivery</p><p>Please save your Order ID to track your order.</p>
        <div className="successActions"><button className="buy" onClick={() => {setSuccess(null);setMyOrders(true)}}>MY ORDERS</button><button className="blackBtn" onClick={() => setSuccess(null)}>CONTINUE SHOPPING</button></div>
      </div></div>}

      {myOrders && <div className="modal"><div className="modalBox">
        <button className="close" onClick={() => setMyOrders(false)}>×</button><div className="eyebrow">ORDER HISTORY</div><h2>MY ORDERS</h2>
        <p className="lead" style={{fontSize:14}}>For privacy, enter the mobile number used for your orders.</p>
        <form className="trackForm" onSubmit={loadHistory}><input value={historyPhone} onChange={e => setHistoryPhone(e.target.value)} inputMode="numeric" maxLength={10} placeholder="Mobile number"/><button className="buy" disabled={historyLoading}>{historyLoading ? "LOADING..." : "VIEW ORDER HISTORY"}</button></form>
        {historyError && <div className="error">{historyError}</div>}
        {history.length > 0 && history.map(o => <div className="historyItem" key={o.order_id}><div><b>{o.order_id}</b><br/>{o.product_name}<br/>{money(Number(o.total_amount))}</div><div><span className="pill">{o.status}</span><br/><button className="viewAll" style={{padding:"7px 11px",marginTop:6}} onClick={() => setSelectedOrder(o)}>VIEW</button></div></div>)}
        {selectedOrder && <div className="orderCard">
          <div className="orderTop"><b>{selectedOrder.order_id}</b><span className="pill">{selectedOrder.status}</span></div>
          <p><b>{selectedOrder.customer_name}</b><br/>{selectedOrder.product_name}<br/>Qty: {selectedOrder.quantity}<br/>Total: {money(Number(selectedOrder.total_amount))}<br/>Payment: {selectedOrder.payment_method}<br/>Order date: {new Date(selectedOrder.created_at).toLocaleString("en-IN")}</p>
          {selectedOrder.status === "Cancelled" ? <div className="cancelled">❌ Cancelled</div> : <div className="timeline">{statuses.map((st,i) => <div key={st}><div className={`step ${i <= statusIndex(selectedOrder.status) ? "done" : ""}`}><div className="dot">{i <= statusIndex(selectedOrder.status) ? "✓" : ""}</div><div><b>{st === "Pending" ? "Order Placed" : st}</b></div></div>{i < statuses.length-1 && <div className="line"/>}</div>)}</div>}
          {isReturnOpen(selectedOrder) && <><button className="returnBtn" onClick={requestReturn}>REQUEST RETURN</button><div className="note">Return button is available for 3 days after delivery.</div></>}
          {selectedOrder.status === "Delivered" && !isReturnOpen(selectedOrder) && <div className="note">The 3-day return window has ended.</div>}
          {returnMessage && <div className="selected">{returnMessage}</div>}
        </div>}
        <hr style={{margin:"25px 0"}}/><div className="eyebrow">TRACK A SPECIFIC ORDER</div>
        <form className="trackForm" onSubmit={trackOrder}><input value={trackId} onChange={e => setTrackId(e.target.value)} placeholder="Order ID e.g. FIT-20260824-123456"/><input value={trackPhone} onChange={e => setTrackPhone(e.target.value)} inputMode="numeric" maxLength={10} placeholder="Mobile number"/><button className="blackBtn" disabled={trackLoading}>{trackLoading ? "CHECKING..." : "TRACK ORDER"}</button></form>
        {historyError && !history.length && <div className="error">{historyError}</div>}
        {selectedOrder && <div className="note">Status shown above is the latest value returned by Supabase.</div>}
      </div></div>}
    </main>
  );
}
