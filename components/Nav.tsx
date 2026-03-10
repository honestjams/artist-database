"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav
      className="nav-blur"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        height: 56,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 1.25rem",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: "linear-gradient(135deg, #e8623a 0%, #d4a843 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
              boxShadow: "0 2px 10px rgba(232,98,58,0.45)",
              flexShrink: 0,
            }}
          >
            ◈
          </div>
          <span
            style={{
              color: "var(--text-1)",
              fontSize: "0.95rem",
              fontWeight: 600,
              letterSpacing: "-0.015em",
            }}
          >
            Artist Database
          </span>
        </Link>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Link
            href="/"
            style={{
              color: pathname === "/" ? "var(--text-1)" : "var(--text-2)",
              fontSize: "0.85rem",
              fontWeight: 500,
              textDecoration: "none",
              padding: "0.45rem 0.9rem",
              borderRadius: 8,
              background: pathname === "/" ? "rgba(255,255,255,0.07)" : "transparent",
              transition: "background 0.15s ease, color 0.15s ease",
            }}
          >
            Browse
          </Link>
          <Link href="/add-artist" className="btn-primary">
            + Add Artist
          </Link>
        </div>
      </div>
    </nav>
  );
}
