"use client";

import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="admin-header">
        <b>🏋️ FitLife Admin</b>
        <nav>
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/orders">📦 Orders</Link>
        </nav>
      </header>

      {children}

      <style jsx global>{`
        .admin-header {
          height: 64px;
          padding: 0 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #111827;
          color: white;
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .admin-header b {
          font-size: 18px;
        }

        .admin-header nav {
          display: flex;
          gap: 18px;
        }

        .admin-header a {
          color: white;
          text-decoration: none;
          font-size: 14px;
        }

        @media (max-width: 600px) {
          .admin-header {
            height: 58px;
          }

          .admin-header b {
            font-size: 16px;
          }

          .admin-header nav {
            gap: 10px;
          }

          .admin-header a {
            font-size: 12px;
          }
        }
      `}</style>
    </>
  );
}
