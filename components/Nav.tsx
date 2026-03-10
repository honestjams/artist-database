"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoggedIn(false); setIsAdmin(false); return; }
      setLoggedIn(true);
      const { data } = await supabase
        .from("profiles").select("role").eq("id", user.id).single();
      setIsAdmin(data?.role === "admin");
    }

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="nav-blur" style={{ position: "sticky", top: 0, zIndex: 100, height: 56 }}>
      <div style={{
        maxWidth: 1280, margin: "0 auto", padding: "0 1.25rem",
        height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: "linear-gradient(135deg, #e8623a 0%, #d4a843 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.9rem", boxShadow: "0 2px 10px rgba(232,98,58,0.45)", flexShrink: 0,
          }}>◈</div>
          <span style={{ color: "var(--text-1)", fontSize: "0.95rem", fontWeight: 600, letterSpacing: "-0.015em" }}>
            Artist Database
          </span>
        </Link>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Link href="/" style={{
            color: pathname === "/" ? "var(--text-1)" : "var(--text-2)",
            fontSize: "0.85rem", fontWeight: 500, textDecoration: "none",
            padding: "0.45rem 0.9rem", borderRadius: 8,
            background: pathname === "/" ? "rgba(255,255,255,0.07)" : "transparent",
            transition: "background 0.15s ease, color 0.15s ease",
          }}>Browse</Link>

          {isAdmin && (
            <Link href="/add-artist" className="btn-ghost" style={{ fontSize: "0.82rem", padding: "0.4rem 0.85rem" }}>
              + Add Artist
            </Link>
          )}

          {loggedIn ? (
            <button
              onClick={handleLogout}
              className="btn-ghost"
              style={{ fontSize: "0.82rem", padding: "0.4rem 0.85rem" }}
            >
              Sign out
            </button>
          ) : (
            <Link href="/login" className="btn-primary" style={{ fontSize: "0.82rem", padding: "0.45rem 1rem" }}>
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
