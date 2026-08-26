"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  customer_name?: string;
  customer_phone?: string;
  total_amount?: number;
  status?: string;
  created_at?: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/orders")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to load orders");
        }
        return res.json();
      })
      .then((data) => {
        setOrders(data.orders || data || []);
      })
      .catch((err) => {
        setError(err.message || "Something went wrong");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "28px", fontWeight: 700 }}>
        📦 Orders
      </h1>

      <p style={{ color: "#666", marginBottom: "24px" }}>
        FitLife Store order management
      </p>

      {loading && <p>Loading orders...</p>}

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {!loading && !error && orders.length === 0 && (
        <p>No orders found.</p>
      )}

      {!loading && !error && orders.length > 0 && (
        <div style={{ display: "grid", gap: "16px" }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <strong>Order ID: {order.id}</strong>

              <p>
                Customer: {order.customer_name || "N/A"}
              </p>

              <p>
                Phone: {order.customer_phone || "N/A"}
              </p>

              <p>
                Amount: ₹{order.total_amount || 0}
              </p>

              <p>
                Status: {order.status || "pending"}
              </p>

              <small>
                {order.created_at
                  ? new Date(order.created_at).toLocaleString()
                  : ""}
              </small>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
