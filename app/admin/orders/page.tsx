"use client";
import { useEffect,useState } from "react";

type Order={id:string;customer_name?:string;customer_phone?:string;product_name?:string;quantity?:number;total_amount?:number;amount?:number;status?:string;payment_method?:string;tracking_number?:string;created_at?:string};

export default function OrdersPage(){
 const [orders,setOrders]=useState<Order[]>([]);
 const [search,setSearch]=useState("");
 const [filter,setFilter]=useState("all");
 const [loading,setLoading]=useState(true);

 useEffect(()=>{fetch("/api/admin/orders").then(r=>r.json()).then(d=>setOrders(d.orders||[])).catch(()=>{}).finally(()=>setLoading(false))},[]);

 const list=orders.filter(o=>{
  const text=`${o.id} ${o.customer_name||""} ${o.customer_phone||""}`.toLowerCase();
  return text.includes(search.toLowerCase())&&(filter==="all"||(o.status||"pending").toLowerCase()===filter);
 });

 return <main className="page">
  <div className="top"><div><h1>📦 Orders</h1><p>FitLife Store order management</p></div><b>{orders.length} Orders</b></div>
  <div className="tools"><input placeholder="🔎 Search order, customer..." value={search} onChange={e=>setSearch(e.target.value)}/><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All Status</option><option>pending</option><option>confirmed</option><option>processing</option><option>shipped</option><option>delivered</option><option>cancelled</option></select></div>
  {loading?<p className="msg">Loading orders...</p>:list.length===0?<p className="msg">No orders found.</p>:
  <div className="list">{list.map(o=><div className="card" key={o.id}>
   <div className="row"><b>Order #{o.id.slice(0,8)}</b><span className={`status ${o.status||"pending"}`}>{o.status||"pending"}</span></div>
   <h3>{o.customer_name||"Customer"}</h3><p>📞 {o.customer_phone||"N/A"}</p>
   <p>🛍️ {o.product_name||"Product"} × {o.quantity||1}</p>
   <div className="bottom"><b>₹{o.total_amount??o.amount??0}</b><small>{o.created_at?new Date(o.created_at).toLocaleDateString():""}</small></div>
  </div>)}</div>}
  <style jsx>{`
   .page{max-width:900px;margin:auto;padding:22px 16px;font-family:Arial;color:#111827}
  
.top{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:20px}.top h1{margin:0;font-size:28px}.top p{color:#6b7280;margin:6px 0}.top b{background:#111827;color:white;padding:9px 12px;border-radius:10px;font-size:13px}
   .tools{display:flex;gap:10px;margin-bottom:18px}.tools input,.tools select{padding:13px;border:1px solid #ddd;border-radius:10px;font-size:14px}.tools input{flex:1}
   .list{display:grid;gap:12px}.card{border:1px solid #e5e7eb;border-radius:16px;padding:16px;box-shadow:0 3px 12px #0000000b}.row,.bottom{display:flex;justify-content:space-between;align-items:center}.card h3{margin:13px 0 6px}.card p{margin:6px 0;color:#6b7280;font-size:14px}.bottom{margin-top:14px;border-top:1px solid #eee;padding-top:12px}.bottom b{font-size:18px}.bottom small{color:#888}
.status{padding:5px 9px;border-radius:20px;background:#eee;font-size:12px}.pending{background:#fff3cd}.confirmed,.processing{background:#dbeafe}.shipped{background:#e0e7ff}.delivered{background:#dcfce7}.cancelled{background:#fee2e2}.msg{text-align:center;padding:45px;color:#777}
   @media(max-width:600px){.top h1{font-size:24px}.top b{font-size:11px}.tools{flex-direction:column}.tools input,.tools select{width:100%;box-sizing:border-box}}
  `}</style>
 </main>
}
