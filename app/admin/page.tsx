"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Category } from "@/lib/supabase";

type TabType = "style" | "medium" | "concept";

const TABS: { id: TabType; label: string }[] = [
  { id: "style",   label: "Styles" },
  { id: "medium",  label: "Mediums" },
  { id: "concept", label: "Concepts" },
];

const TAB_COLOR: Record<TabType, { bg: string; border: string; text: string }> = {
  style:   { bg: "rgba(232,98,58,0.15)",  border: "rgba(232,98,58,0.35)",  text: "#f0a07a" },
  medium:  { bg: "rgba(100,160,220,0.15)", border: "rgba(100,160,220,0.35)", text: "#94c4e8" },
  concept: { bg: "rgba(138,110,210,0.15)", border: "rgba(138,110,210,0.35)", text: "#c4b0f0" },
};

export default function AdminPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("style");
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (!profile || profile.role !== "admin") { router.push("/"); return; }
      setIsAdmin(true);
      await loadCategories();
      setLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCategories() {
    const { data } = await supabase.from("categories").select("*").order("name");
    if (data) setCategories(data as Category[]);
  }

  async function addCategory() {
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    setError(null);
    const { error: err } = await supabase.from("categories").insert({ type: activeTab, name });
    if (err) {
      setError(err.message.includes("unique") ? `"${name}" already exists in this category.` : err.message);
    } else {
      setNewName("");
      await loadCategories();
    }
    setAdding(false);
  }

  async function deleteCategory(id: string, name: string) {
    if (!confirm(`Remove "${name}"? This won't remove it from existing artist profiles.`)) return;
    await supabase.from("categories").delete().eq("id", id);
    setCategories(prev => prev.filter(c => c.id !== id));
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh" }}>
        <Nav />
        <div style={{ maxWidth: 760, margin: "3rem auto", padding: "0 1.25rem" }}>
          <div className="skeleton" style={{ height: 40, marginBottom: "1rem", borderRadius: 10 }} />
          <div className="skeleton" style={{ height: 300, borderRadius: 10 }} />
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const filtered = categories.filter(c => c.type === activeTab);
  const colors = TAB_COLOR[activeTab];

  return (
    <div style={{ minHeight: "100vh" }}>
      <Nav />

      {/* Header */}
      <div style={{ padding: "2.5rem 1.25rem 2rem", borderBottom: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,98,58,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative" }}>
          <p style={{ color: "var(--orange)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Admin Panel</p>
          <h1 style={{ color: "var(--text-1)", fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "clamp(1.7rem, 4vw, 2.5rem)", fontWeight: 700, letterSpacing: "-0.02em", margin: 0, marginBottom: "0.4rem" }}>
            Category Management
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: "0.92rem" }}>
            Add or remove styles, mediums, and concepts used to tag artists.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "2rem auto", padding: "0 1.25rem 5rem" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "0" }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setNewName(""); setError(null); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "0.65rem 1.25rem", fontSize: "0.88rem", fontWeight: 600,
                fontFamily: "inherit", letterSpacing: "-0.01em",
                color: activeTab === tab.id ? "var(--text-1)" : "var(--text-3)",
                borderBottom: activeTab === tab.id ? "2px solid var(--orange)" : "2px solid transparent",
                marginBottom: "-1px", transition: "color 0.15s",
              }}
            >
              {tab.label}
              <span style={{
                marginLeft: "0.4rem",
                background: activeTab === tab.id ? colors.bg : "rgba(255,255,255,0.05)",
                border: `1px solid ${activeTab === tab.id ? colors.border : "var(--border)"}`,
                color: activeTab === tab.id ? colors.text : "var(--text-3)",
                borderRadius: 20, padding: "0.05rem 0.45rem", fontSize: "0.7rem", fontWeight: 700,
              }}>
                {categories.filter(c => c.type === tab.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Add new */}
        <div style={{ marginBottom: "1.75rem" }}>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <input
              className="input-dark"
              type="text"
              placeholder={`Add a new ${activeTab}…`}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCategory(); } }}
              style={{ flex: 1 }}
            />
            <button
              className="btn-primary"
              onClick={addCategory}
              disabled={adding || !newName.trim()}
              style={{ flexShrink: 0, opacity: adding ? 0.7 : 1 }}
            >
              {adding ? "Adding…" : "+ Add"}
            </button>
          </div>
          {error && (
            <p style={{ color: "#f0a07a", fontSize: "0.82rem", marginTop: "0.5rem" }}>{error}</p>
          )}
        </div>

        {/* Category list */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-3)", fontSize: "0.9rem" }}>
            No {activeTab}s yet. Add one above.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {filtered.map(cat => (
              <div
                key={cat.id}
                className="glass"
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.7rem 1rem", borderRadius: 10 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span
                    style={{
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                      borderRadius: 6, padding: "0.15rem 0.55rem",
                      fontSize: "0.72rem", fontWeight: 700,
                      letterSpacing: "0.04em", textTransform: "uppercase",
                    }}
                  >
                    {cat.type}
                  </span>
                  <span style={{ color: "var(--text-1)", fontSize: "0.9rem" }}>{cat.name}</span>
                </div>
                <button
                  onClick={() => deleteCategory(cat.id, cat.name)}
                  style={{
                    background: "none", border: "1px solid var(--border)",
                    color: "var(--text-3)", cursor: "pointer",
                    borderRadius: 8, padding: "0.3rem 0.7rem",
                    fontSize: "0.75rem", fontFamily: "inherit",
                    transition: "border-color 0.15s, color 0.15s",
                  }}
                  onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = "rgba(232,98,58,0.5)"; (e.target as HTMLButtonElement).style.color = "#f0a07a"; }}
                  onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = "var(--border)"; (e.target as HTMLButtonElement).style.color = "var(--text-3)"; }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
