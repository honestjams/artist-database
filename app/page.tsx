"use client";
import { useEffect, useState, useCallback } from "react";
import Nav from "@/components/Nav";
import ArtistCard from "@/components/ArtistCard";
import { supabase, Artist, Category } from "@/lib/supabase";

const SORT_OPTIONS = [
  { value: "name_asc",        label: "Name A–Z" },
  { value: "name_desc",       label: "Name Z–A" },
  { value: "birth_year_asc",  label: "Oldest first" },
  { value: "birth_year_desc", label: "Newest first" },
  { value: "created_at_desc", label: "Recently added" },
];

export default function HomePage() {
  const [artists, setArtists]               = useState<Artist[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [search, setSearch]                 = useState("");
  const [activeStyles, setActiveStyles]     = useState<string[]>([]);
  const [activeMediums, setActiveMediums]   = useState<string[]>([]);
  const [activeConcepts, setActiveConcepts] = useState<string[]>([]);
  const [sort, setSort]                     = useState("name_asc");
  const [total, setTotal]                   = useState(0);
  const [showFilters, setShowFilters]       = useState(false);

  const [allStyles, setAllStyles]     = useState<string[]>([]);
  const [allMediums, setAllMediums]   = useState<string[]>([]);
  const [allConcepts, setAllConcepts] = useState<string[]>([]);

  // Load categories from DB once
  useEffect(() => {
    supabase.from("categories").select("*").order("name").then(({ data }) => {
      if (!data) return;
      const cats = data as Category[];
      setAllStyles(cats.filter(c => c.type === "style").map(c => c.name));
      setAllMediums(cats.filter(c => c.type === "medium").map(c => c.name));
      setAllConcepts(cats.filter(c => c.type === "concept").map(c => c.name));
    });
  }, []);

  const fetchArtists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from("artists").select("*", { count: "exact" });

      if (search.trim()) {
        const term = search.trim();
        query = query.or(
          `name.ilike.%${term}%,bio.ilike.%${term}%,nationality.ilike.%${term}%`
        );
      }
      if (activeStyles.length > 0)   query = query.overlaps("art_styles", activeStyles);
      if (activeMediums.length > 0)  query = query.overlaps("mediums", activeMediums);
      if (activeConcepts.length > 0) query = query.overlaps("concepts", activeConcepts);

      const ascending = sort.endsWith("_asc");
      const sortField = sort.replace(/_asc$|_desc$/, "");
      query = query.order(sortField, { ascending, nullsFirst: false });

      const { data, error: fetchError, count } = await query.limit(100);
      if (fetchError) throw fetchError;
      setArtists((data as Artist[]) ?? []);
      setTotal(count ?? data?.length ?? 0);
    } catch (err) {
      console.error(err);
      setError("Failed to load artists. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [search, activeStyles, activeMediums, activeConcepts, sort]);

  useEffect(() => {
    const timer = setTimeout(fetchArtists, 300);
    return () => clearTimeout(timer);
  }, [fetchArtists]);

  const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>, val: string) =>
    setter(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);

  const clearFilters = () => {
    setActiveStyles([]);
    setActiveMediums([]);
    setActiveConcepts([]);
    setSearch("");
  };

  const activeCount = activeStyles.length + activeMediums.length + activeConcepts.length;
  const hasFilters  = activeCount > 0 || search.trim();

  return (
    <div style={{ minHeight: "100vh" }}>
      <Nav />

      {/* ── Hero ─────────────────────────────────────────── */}
      <div
        style={{
          padding: "clamp(2.5rem, 8vw, 5rem) 1.25rem 2rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute", top: -120, right: -100,
            width: 500, height: 500, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(232,98,58,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute", bottom: -60, left: "10%",
            width: 350, height: 350, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,168,67,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative" }}>
          <p style={{ color: "var(--orange)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "1rem" }}>
            Visual Artist Directory
          </p>
          <h1
            style={{
              fontSize: "clamp(2.6rem, 7vw, 5.5rem)", fontWeight: 800,
              letterSpacing: "-0.03em", lineHeight: 1.04,
              color: "var(--text-1)", margin: 0, marginBottom: "1rem",
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}
          >
            Discover<br />Artists
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: "1rem", maxWidth: 440, lineHeight: 1.7, margin: 0, marginBottom: "2.5rem" }}>
            Explore artists across history, movements, and mediums — from the
            Renaissance to the present day.
          </p>

          {/* Search */}
          <div style={{ maxWidth: 560, position: "relative" }}>
            <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none", lineHeight: 1, display: "flex" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
            <input
              className="input-dark"
              type="text"
              placeholder="Search artists, styles, or nationality…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "2.6rem", fontSize: "0.95rem", height: 48, borderRadius: 14 }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", fontSize: "1rem", lineHeight: 1, padding: "0.25rem", fontFamily: "inherit" }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Filter bar ───────────────────────────────────── */}
      <div
        style={{
          position: "sticky", top: 56, zIndex: 50,
          background: "rgba(13,12,16,0.88)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0.65rem 1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`pill ${showFilters || activeCount > 0 ? "active" : ""}`}
              style={{ flexShrink: 0 }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 3h10M3 6h6M5 9h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Filters
              {activeCount > 0 && (
                <span style={{ background: "rgba(255,255,255,0.3)", borderRadius: "50%", width: 16, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.62rem", fontWeight: 800 }}>
                  {activeCount}
                </span>
              )}
            </button>

            <div style={{ width: 1, height: 20, background: "var(--border)", flexShrink: 0 }} />

            <div className="scroll-x" style={{ display: "flex", gap: "0.35rem", flex: 1 }}>
              {allStyles.map((s) => (
                <button key={s} onClick={() => toggle(setActiveStyles, s)} className={`pill ${activeStyles.includes(s) ? "active" : ""}`}>
                  {s}
                </button>
              ))}
            </div>

            <div style={{ width: 1, height: 20, background: "var(--border)", flexShrink: 0 }} />

            <select
              className="input-dark"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{ width: "auto", padding: "0.3rem 2rem 0.3rem 0.7rem", fontSize: "0.78rem", height: 34, borderRadius: 8, flexShrink: 0 }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {showFilters && (
            <div style={{ marginTop: "0.65rem", paddingTop: "0.65rem", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {allMediums.length > 0 && (
                <div>
                  <p style={{ margin: "0 0 0.45rem", fontSize: "0.67rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)" }}>
                    Medium
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                    {allMediums.map((m) => (
                      <button key={m} onClick={() => toggle(setActiveMediums, m)} className={`pill ${activeMediums.includes(m) ? "active" : ""}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {allConcepts.length > 0 && (
                <div>
                  <p style={{ margin: "0 0 0.45rem", fontSize: "0.67rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)" }}>
                    Concept
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                    {allConcepts.map((c) => (
                      <button key={c} onClick={() => toggle(setActiveConcepts, c)} className={`pill ${activeConcepts.includes(c) ? "active" : ""}`}
                        style={activeConcepts.includes(c) ? { background: "rgba(138,110,210,0.25)", borderColor: "rgba(138,110,210,0.5)", color: "#c4b0f0" } : {}}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem" }}>
            <span style={{ fontSize: "0.73rem", color: "var(--text-3)" }}>
              {loading ? "Loading…" : `${total} artist${total !== 1 ? "s" : ""}`}
            </span>
            {hasFilters && (
              <button onClick={clearFilters} style={{ background: "none", border: "none", color: "var(--orange)", fontSize: "0.73rem", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.25rem 5rem" }}>
        {error ? (
          <div style={{ textAlign: "center", padding: "6rem 1rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.4 }}>⚠</div>
            <p style={{ color: "var(--text-2)", fontSize: "1rem", marginBottom: "1.5rem" }}>{error}</p>
            <button onClick={fetchArtists} className="btn-primary">Try again</button>
          </div>
        ) : loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: "1.25rem" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 380, animationDelay: `${i * 0.06}s` }} />
            ))}
          </div>
        ) : artists.length === 0 ? (
          <div style={{ textAlign: "center", padding: "6rem 1rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.2 }}>◈</div>
            <p style={{ color: "var(--text-2)", fontSize: "1.05rem", marginBottom: "0.5rem" }}>No artists found</p>
            <p style={{ color: "var(--text-3)", fontSize: "0.88rem" }}>Try adjusting your search or filters</p>
            {hasFilters && (
              <button onClick={clearFilters} className="btn-primary" style={{ marginTop: "1.5rem" }}>Clear filters</button>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: "1.25rem" }}>
            {artists.map((artist, i) => (
              <div key={artist.id} style={{ animation: `fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) ${Math.min(i * 0.04, 0.3)}s both` }}>
                <ArtistCard artist={artist} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
