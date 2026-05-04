import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Movie Recommender",
  description: "Your personal AI movie recommendation agent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header
          style={{
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            padding: "0 24px",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <Link
            href="/"
            style={{
              color: "var(--foreground)",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "18px",
              letterSpacing: "-0.5px",
            }}
          >
            🎬 CineMatch
          </Link>
          <nav style={{ display: "flex", gap: "24px" }}>
            <Link
              href="/chat"
              style={{
                color: "var(--muted)",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Chat
            </Link>
            <Link
              href="/profile"
              style={{
                color: "var(--muted)",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              My Profile
            </Link>
          </nav>
        </header>
        <main style={{ minHeight: "calc(100vh - 56px)" }}>{children}</main>
      </body>
    </html>
  );
}
