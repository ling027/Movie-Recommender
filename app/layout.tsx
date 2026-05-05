import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "Movie Recommender",
  description: "Your personal AI movie recommendation agent",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className={styles.header}>
          <Link href="/" className={styles.logo}>CoCine</Link>
          <nav className={styles.nav}>
            <Link href="/chat" className={styles.navLink}>Chat</Link>
            <Link href="/profile" className={styles.navLink}>My Profile</Link>
          </nav>
        </header>
        <main className={styles.main}>{children}</main>
      </body>
    </html>
  );
}
