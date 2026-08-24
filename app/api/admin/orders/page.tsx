"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

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

const statuses = ["Pending", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
const money = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setLoggedIn(!!session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (loggedIn) loadOrders(); }, [loggedIn]);

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoginLoading(true); setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoginLoading(false);
    if (authError) { setError(authError.message || "Login failed."); return; }
    setLoggedIn(true);
  }

  async function logout() {
    await supabase.auth.signOut();
    setOrders([]); setSelected(null); setLoggedIn(false);
  }

  async function loadOrders() {
    setLoading(true); setError("");
    const { data, error: dbError } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setLoading(false);
    if (dbError) { setError(dbError.message || "Orders could not be loaded. Check Supabase RLS."); return; }
    setOrders((data || []) as Order[]);
  }

  async function updateStatus(order: Order, newStatus: string) {
    if (!order.order_id || updatingId) return;
    setUpdatingId(order.order_id); setError("");
    const { data, error: dbError } = await supabase.from("orders").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("order_id", order.order_id).select("*").single();
    setUpdatingId("");
    if (dbError || !data) { setError(dbError?.message || "Status could not be updated."); return; }
    const updated = data as Order;
    setOrders(current => current.map(item => item.order_id === updated.order_id ? updated : item));
    setSelected(updated);
  }

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter(o => {
      const matchesStatus = statusFilter === "All" || o.status === statusFilter;
      const text = [o.order_id, o.customer_name, o.phone, o.city, o.state, o.pincode, o.product_name].join(" ").toLowerCase();
      return matchesStatus && (!q || text.includes(q));
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.status === "Pending").length,
    delivered: orders.filter(o => o.status === "Delivered").length,
    cancelled: orders.filter(o => o.status === "Cancelled").length,
    revenue: orders.filter(o => o.status !== "Cancelled").reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
  }), [orders]);

  if (!loggedIn) return (
    <main className="adminPage">
      <style jsx global>{`
        *{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#050505;color:#fff}button,input{font:inherit}button{cursor:pointer}
        .loginWrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;background:radial-gradient(circle at top,#193000 0,transparent 35%),#050505}
        .loginBox{width:min(430px,100%);background:#fff;color:#111;border-radius:24px;padding:30px;box-shadow:0 20px 70px #000}.logo{font-size:30px;font-weight:950}.green{color:#72ff00}.eyebrow{color:#5d9700;font-size:12px;font-weight:950;letter-spacing:4px}h1{font-size:42px;line-height:1;margin:10px 0 25px}
        .field{display:grid;gap:6px;margin-bottom:12px}.field label{font-size:12px;font-weight:900}.field input{width:100%;padding:14px;border:1px solid #ccc;border-radius:11px;outline:none}.btn{width:100%;border:0;border-radius:12px;padding:15px;background:#72ff00;color:#050505;font-weight:950}.error{background:#ffe5e5;color:#a00000;padding:11px;border-radius:10px;margin:12px 0;font-size:13px}.hint{color:#777;font-size:12px;line-height:1.5;margin-top:15px}
      `}</style>
      <div className="loginWrap"><div className="loginBox">
        <div className="logo">Fit<span className="green">Life</span></div><div className="eyebrow">ADMIN PANEL</div><h1>ORDER DASHBOARD</h1>
        <form onSubmit={login}>
          <div className="field"><label>ADMIN EMAIL</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@example.com" required /></div>
          <div className="field"><label>PASSWORD</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password" required /></div>
          {error && <div className="error">{error}</div>}
          <button className="btn" disabled={loginLoading}>{loginLoading ? "SIGNING IN..." : "SIGN IN"}</button>
        </form>
        <div className="hint">Use a Supabase Authentication user for the admin account. Never put a Supabase service-role key in this page.</div>
      </div></div>
    </main>
  );

  return (
    <main className="adminPage"><style jsx global>{`
      *{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#f4f4f4;color:#090909}button,input,select{font:inherit}button{cursor:pointer}
      .admin{min-height:100vh;padding-bottom:50px}.top{background:#050505;color:#fff;padding:18px 5%;display:flex;align-items:center;justify-content:space-between;gap:15px;position:sticky;top:0;z-index:20}.logo{font-size:27px;font-weight:950}.green{color:#72ff00}.sub{color:#aaa;font-size:9px;letter-spacing:4px;margin-top:3px}.logout{background:transparent;color:#fff;border:1px solid #666;border-radius:30px;padding:9px 15px;font-weight:900}
      .wrap{width:min(1400px,94%);margin:auto;padding:30px 0}.heading{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:22px}.eyebrow{color:#5d9700;font-size:12px;font-weight:950;letter-spacing:4px}h1{font-size:clamp(38px,5vw,64px);line-height:.95;margin:9px 0 0}.refresh{background:#72ff00;color:#050505;border:0;border-radius:12px;padding:12px 17px;font-weight:950}.error{background:#ffe5e5;color:#a00000;padding:12px;border-radius:12px;margin:15px 0;font-size:13px}
      .stats{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin:20px 0}.stat{background:#fff;border:1px solid #ddd;border-radius:16px;padding:18px}.stat small{color:#777;font-weight:900}.stat b{display:block;font-size:30px;margin-top:8px}.filters{display:grid;grid-template-columns:1fr 190px;gap:10px;margin:18px 0}.filters input,.filters select{width:100%;padding:13px;border:1px solid #ccc;border-radius:11px;background:#fff}
      .tableWrap{background:#fff;border:1px solid #ddd;border-radius:18px;overflow:auto}table{width:100%;border-collapse:collapse;min-width:850px}th,td{text-align:left;padding:14px;border-bottom:1px solid #eee;vertical-align:top}th{background:#fafafa;font-size:11px;letter-spacing:1px}td{font-size:13px}.orderId{font-weight:950}.customer{font-weight:900}.muted{color:#777;font-size:11px;margin-top:4px}.pill{display:inline-block;padding:7px 10px;border-radius:20px;background:#efffd9;color:#4d7d00;font-weight:900;font-size:11px;white-space:nowrap}.statusSelect{padding:8px;border:1px solid #ccc;border-radius:9px;background:#fff;max-width:160px;margin-top:5px}.view{background:#050505;color:#fff;border:0;border-radius:9px;padding:8px 11px;font-weight:900}.empty{text-align:center;padding:50px 20px;color:#777}
      .modal{position:fixed;inset:0;background:#000b;z-index:100;display:flex;align-items:center;justify-content:center;padding:15px}.modalBox{background:#fff;width:min(650px,100%);max-height:92vh;overflow:auto;border-radius:22px;padding:25px;position:relative}.close{position:absolute;right:12px;top:5px;border:0;background:transparent;font-size:34px}.detailGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}.detail{background:#f6f6f6;border-radius:12px;padding:12px}.detail.full{grid-column:1/-1}.detail small{display:block;color:#777;font-size:10px;font-weight:900;margin-bottom:5px}.detail b{font-size:14px;word-break:break-word}
      @media(max-width:800px){.stats{grid-template-columns:repeat(2,1fr)}.stats .stat:last-child{grid-column:1/-1}.heading{display:block}.refresh{margin-top:15px}.filters{grid-template-columns:1fr}.wrap{width:94%}}
      @media(max-width:500px){.top{padding:14px}.logo{font-size:22px}.sub{font-size:7px}.logout{font-size:11px}.stats{gap:6px}.stat{padding:12px}.stat b{font-size:23px}.detailGrid{grid-template-columns:1fr}.detail.full{grid-column:auto}}
    `}</style>
      <div className="admin">
        <header className="top"><div><div className="logo">Fit<span className="green">Life</span> ADMIN</div><div className="sub">ORDER MANAGEMENT PANEL</div></div><button className="logout" onClick={logout}>LOG OUT</button></header>
        <div className="wrap">
          <div className="heading"><div><div className="eyebrow">SUPABASE ORDERS</div><h1>ORDER DASHBOARD</h1></div><button className="refresh" onClick={loadOrders} disabled={loading}>{loading ? "LOADING..." : "↻ REFRESH ORDERS"}</button></div>
          {error && <div className="error">{error}</div>}
          <section className="stats"><div className="stat"><small>TOTAL ORDERS</small><b>{stats.total}</b></div><div className="stat"><small>PENDING</small><b>{stats.pending}</b></div><div className="stat"><small>DELIVERED</small><b>{stats.delivered}</b></div><div className="stat"><small>CANCELLED</small><b>{stats.cancelled}</b></div><div className="stat"><small>ORDER VALUE</small><b>{money(stats.revenue)}</b></div></section>
          <section className="filters"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Order ID, customer, phone, city, state..." /><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>All</option>{statuses.map(s=><option key={s}>{s}</option>)}</select></section>
          <div className="tableWrap">{loading ? <div className="empty">Loading orders...</div> : filteredOrders.length===0 ? <div className="empty">No orders found.</div> : <table><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>PRODUCT</th><th>AMOUNT</th><th>STATUS</th><th>DATE</th><th>ACTION</th></tr></thead><tbody>
            {filteredOrders.map(order=><tr key={order.order_id}><td><div className="orderId">{order.order_id}</div><div className="muted">Qty: {order.quantity}</div></td><td><div className="customer">{order.customer_name}</div><div className="muted">{order.phone}</div><div className="muted">{order.city}, {order.state}</div></td><td>{order.product_name}<div className="muted">{order.payment_method}</div></td><td><b>{money(order.total_amount)}</b></td><td><span className="pill">{order.status}</span><br/><select className="statusSelect" value={order.status} disabled={updatingId===order.order_id} onChange={e=>updateStatus(order,e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select></td><td>{new Date(order.created_at).toLocaleString("en-IN")}</td><td><button className="view" onClick={()=>setSelected(order)}>VIEW</button></td></tr>)}
          </tbody></table>}</div>
        </div>
      </div>
      {selected && <div className="modal"><div className="modalBox"><button className="close" onClick={()=>setSelected(null)}>×</button><div className="eyebrow">ORDER DETAILS</div><h2 style={{margin:"8px 0 4px",fontSize:32}}>{selected.order_id}</h2><span className="pill">{selected.status}</span>
        <div className="detailGrid"><div className="detail"><small>CUSTOMER NAME</small><b>{selected.customer_name}</b></div><div className="detail"><small>MOBILE</small><b>{selected.phone}</b></div><div className="detail full"><small>ADDRESS</small><b>{selected.address}<br/>{selected.city}, {selected.state} - {selected.pincode}{selected.landmark ? ` • Landmark: ${selected.landmark}` : ""}</b></div><div className="detail full"><small>PRODUCT</small><b>{selected.product_name}</b></div><div className="detail"><small>QUANTITY</small><b>{selected.quantity}</b></div><div className="detail"><small>UNIT PRICE</small><b>{money(selected.unit_price)}</b></div><div className="detail"><small>TOTAL</small><b>{money(selected.total_amount)}</b></div><div className="detail"><small>PAYMENT</small><b>{selected.payment_method}</b></div><div className="detail"><small>ORDER CREATED</small><b>{new Date(selected.created_at).toLocaleString("en-IN")}</b></div><div className="detail"><small>LAST UPDATED</small><b>{selected.updated_at ? new Date(selected.updated_at).toLocaleString("en-IN") : "Not updated"}</b></div></div>
      </div></div>}
    </main>
  );
}
