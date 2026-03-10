"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (err) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.25rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(232,98,58,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", maxWidth: 400, position: "relative" }}>
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            justifyContent: "center",
            marginBottom: "2.5rem",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              background: "linear-gradient(135deg, #e8623a 0%, #d4a843 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              boxShadow: "0 4px 14px rgba(232,98,58,0.4)",
            }}
          >
            ◈
          </div>
          <span
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--text-1)",
              letterSpacing: "-0.02em",
            }}
          >
            Artist Database
          </span>
        </div>

        {/* Card */}
        <div
          className="glass"
          style={{ borderRadius: 20, padding: "2rem" }}
        >
          <h1
            style={{
              fontSize: "1.35rem",
              fontWeight: 700,
              color: "var(--text-1)",
              marginBottom: "0.35rem",
              letterSpacing: "-0.02em",
            }}
          >
            Sign in
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginBottom: "1.75rem" }}>
            Admin access only
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--text-3)",
                    marginBottom: "0.45rem",
                  }}
                >
                  Email
                </label>
                <input
                  className="input-dark"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--text-3)",
                    marginBottom: "0.45rem",
                  }}
                >
                  Password
                </label>
                <input
                  className="input-dark"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div
                  style={{
                    background: "rgba(232,98,58,0.08)",
                    border: "1px solid rgba(232,98,58,0.2)",
                    borderRadius: 10,
                    padding: "0.75rem 1rem",
                    color: "#f0a07a",
                    fontSize: "0.85rem",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "0.75rem",
                  fontSize: "0.92rem",
                  opacity: loading ? 0.7 : 1,
                  marginTop: "0.25rem",
                }}
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </div>
          </form>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link
            href="/"
            style={{ color: "var(--text-3)", fontSize: "0.83rem", textDecoration: "none" }}
          >
            ← Back to Database
          </Link>
        </div>
      </div>
    </div>
  );
}
