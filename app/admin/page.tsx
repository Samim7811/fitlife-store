"use client";

export default function AdminPage() {
  return (
    <main style={{padding:"20px",maxWidth:"1100px",margin:"auto"}}>
      <h1>FitLife Store</h1>
      <p>Admin Dashboard</p>

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(2,1fr)",
        gap:"14px",
        marginTop:"25px"
      }}>
        <div className="card">📦<br/><b>Total Orders</b><br/>0</div>
        <div className="card">⏳<br/><b>Pending</b><br/>0</div>
        <div className="card">🚚<br/><b>Shipped</b><br/>0</div>
        <div className="card">💰<br/><b>Revenue</b><br/>₹0</div>
      </div>

      <style jsx>{`
        .card {
          padding:20px;
          border:1px solid #e5e7eb;
          border-radius:16px;
          background:white;
          box-shadow:0 4px 15px rgba(0,0,0,.06);
          font-size:18px;
          line-height:1.8;
        }
      `}</style>
    </main>
  );
}
