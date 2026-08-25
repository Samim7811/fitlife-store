export default function AdminPage() {
  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Admin Panel</h1>
      <p>Welcome to FitLife Store Admin Panel</p>

      <div style={{ marginTop: "30px" }}>
        <a href="/admin/orders">📦 Orders</a>
      </div>
    </main>
  );
}
