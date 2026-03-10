"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        background: "linear-gradient(90deg, #2c2416 0%, #4a3728 100%)",
        borderBottom: "2px solid rgba(196,98,58,0.4)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 16px rgba(44,36,22,0.3)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 60,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            textDecoration: "none",
          }}
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #c4623a, #c9922a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
              boxShadow: "0 2px 8px rgba(196,98,58,0.4)",
            }}
          >
            ◈
          </span>
          <span
            style={{
              color: "#fdf8ef",
              fontFamily: "Georgia, serif",
              fontSize: "1.1rem",
              letterSpacing: "0.01em",
            }}
          >
            Artist Database
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Link
            href="/"
            style={{
              color: pathname === "/" ? "#c9922a" : "rgba(253,248,239,0.65)",
              fontFamily: "Georgia, serif",
              fontSize: "0.9rem",
              textDecoration: "none",
              padding: "0.4rem 0.8rem",
              borderRadius: 4,
              transition: "all 0.15s",
            }}
          >
            Browse
          </Link>
          <Link
            href="/add-artist"
            className="btn-primary"
            style={{ fontSize: "0.85rem", padding: "0.45rem 1rem" }}
          >
            + Add Artist
          </Link>
        </div>
      </div>
    </nav>
  );
}
