"use client";
import { useEffect, useState, useCallback } from "react";
import Nav from "@/components/Nav";
import ArtistCard from "@/components/ArtistCard";
import { supabase, Artist } from "@/lib/supabase";

const ALL_STYLES = [
  "Impressionism", "Abstract", "Surrealism", "Expressionism",
  "Realism", "Pop Art", "Cubism", "Minimalism", "Baroque",
  "Renaissance", "Contemporary", "Street Art", "Photography",
  "Sculpture", "Installation",
];

const ALL_MEDIUMS = [
  "Oil Paint", "Watercolour", "Acrylic", "Photography",
  "Sculpture", "Digital", "Mixed Media", "Printmaking",
  "Drawing", "Ceramics",
];

const SORT_OPTIONS = [
  { value: "name_asc", label: "Name A–Z" },
  { value: "name_desc", label: "Name Z–A" },
  { value: "birth_year_asc", label: "Oldest First" },
  { value: "birth_year_desc", label: "Newest First" },
  { value: "created_at_desc", label: "Recently Added" },
];

export default function HomePage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeStyles, setActiveStyles] = useState<string[]>([]);
  const [activeMediums, setActiveMediums] = useState<string[]>([]);
  const [sort, setSort] = useState("name_asc");
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const fetchArtists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from("artists").select("*", { count: "exact" });

      if (search.trim()) {
        const term = search.trim();
        query = query.or(`name.ilike.%${term}%,bio.ilike.%${term}%,nationality.ilike.%${term}%`);
      }
      if (activeStyles.length > 0) {
        query = query.overlaps("art_styles", activeStyles);
      }
      if (activeMediums.length > 0) {
        query = query.overlaps("mediums", activeMediums);
      }

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
  }, [search, activeStyles, activeMediums, sort]);

  useEffect(() => {
    const timer = setTimeout(fetchArtists, 300);
    return () => clearTimeout(timer);
  }, [fetchArtists]);

  const toggleStyle = (s: string) =>
    setActiveStyles((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const toggleMedium = (m: string) =>
    setActiveMediums((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );

  const clearFilters = () => {
    setActiveStyles([]);
    setActiveMediums([]);
    setSearch("");
  };

  const hasFilters = activeStyles.length > 0 || activeMediums.length > 0 || search.trim();

  return (
    <div style={{ minHeight: "100vh" }}>
      <Nav />

      {/* Hero */}
      <div
        className="gradient-hero"
        style={{ padding: "4rem 1.5rem 3.5rem", position: "relative", overflow: "hidden" }}
      >
        <div style={{ position: "absolute", top: -60, right: -60, width: 320, height: 320, borderRadius: "50%", background: "rgba(201,146,42,0.12)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: "20%", width: 200, height: 200, borderRadius: "50%", background: "rgba(196,98,58,0.1)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative" }}>
          <p style={{ color: "rgba(253,248,239,0.55)", fontFamily: "sans-serif", fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.8rem" }}>
            Visual Artist Directory
          </p>
          <h1 className="display-title" style={{ color: "#fdf8ef", margin: 0, marginBottom: "0.5rem" }}>
            Discover Artists
          </h1>
          <p style={{ color: "rgba(253,248,239,0.6)", fontFamily: "Georgia, serif", fontSize: "1.05rem", maxWidth: 480, lineHeight: 1.6, margin: 0, marginBottom: "2rem" }}>
            Search by name, nationality, or biography. Filter by style and medium.
          </p>

          <div style={{ maxWidth: 600, position: "relative" }}>
            <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "rgba(44,36,22,0.4)", fontSize: "1.1rem", pointerEvents: "none" }}>
              ⌕
            </span>
            <input
              className="input-paper"
              type="text"
              placeholder="Search by name, nationality, bio…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "2.4rem", fontSize: "1rem", boxShadow: "0 4px 20px rgba(0,0,0,0.2), inset 0 2px 5px rgba(44,36,22,0.06)" }}
            />
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ background: "linear-gradient(90deg, #f0e8d8, #e8dcc8)", borderBottom: "1px solid rgba(44,36,22,0.1)", padding: "0.9rem 1.5rem", position: "sticky", top: 60, zIndex: 50, boxShadow: "0 2px 8px rgba(44,36,22,0.08)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              background: showFilters ? "linear-gradient(145deg, #c4623a, #a84a2a)" : "linear-gradient(145deg, #e8dcc8, #d8ccb4)",
              color: showFilters ? "white" : "#2c2416",
              border: "1px solid rgba(44,36,22,0.15)",
              borderRadius: 4, padding: "0.35rem 0.85rem",
              fontFamily: "Georgia, serif", fontSize: "0.85rem", cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
              display: "flex", alignItems: "center", gap: "0.3rem",
            }}
          >
            ⧗ Filters
            {(activeStyles.length > 0 || activeMediums.length > 0) && (
              <span style={{ background: "rgba(255,255,255,0.3)", borderRadius: "50%", width: 18, height: 18, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontFamily: "sans-serif", fontWeight: 700 }}>
                {activeStyles.length + activeMediums.length}
              </span>
            )}
          </button>

          <div style={{ width: 1, height: 24, background: "rgba(44,36,22,0.15)" }} />

          <select className="input-paper" value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: "auto", padding: "0.35rem 2.2rem 0.35rem 0.7rem", fontSize: "0.85rem" }}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            {hasFilters && (
              <button onClick={clearFilters} style={{ background: "none", border: "none", color: "#a84a2a", fontFamily: "Georgia, serif", fontSize: "0.82rem", cursor: "pointer", textDecoration: "underline", padding: 0 }}>
                Clear all
              </button>
            )}
            <span style={{ fontFamily: "sans-serif", fontSize: "0.8rem", color: "rgba(44,36,22,0.5)" }}>
              {loading ? "Loading…" : `${total} artist${total !== 1 ? "s" : ""}`}
            </span>
          </div>
        </div>

        {showFilters && (
          <div style={{ maxWidth: 1280, margin: "0.9rem auto 0", paddingTop: "0.9rem", borderTop: "1px solid rgba(44,36,22,0.1)" }}>
            <div style={{ marginBottom: "0.7rem" }}>
              <p style={{ margin: "0 0 0.4rem", fontSize: "0.72rem", fontFamily: "sans-serif", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,36,22,0.5)" }}>
                Style / Movement
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {ALL_STYLES.map((s) => (
                  <button key={s} onClick={() => toggleStyle(s)} className={`filter-pill ${activeStyles.includes(s) ? "active" : ""}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p style={{ margin: "0 0 0.4rem", fontSize: "0.72rem", fontFamily: "sans-serif", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,36,22,0.5)" }}>
                Medium
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {ALL_MEDIUMS.map((m) => (
                  <button key={m} onClick={() => toggleMedium(m)} className={`filter-pill ${activeMediums.includes(m) ? "active" : ""}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {error ? (
          <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠</div>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "1.1rem", color: "#a84a2a" }}>{error}</p>
            <button onClick={fetchArtists} className="btn-primary" style={{ marginTop: "1.2rem" }}>
              Try again
            </button>
          </div>
        ) : loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.5rem" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ height: 340, borderRadius: 8, background: "linear-gradient(145deg, #f0e8d8, #e8dcc8)", opacity: 0.7 }} />
            ))}
          </div>
        ) : artists.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 1rem", color: "rgba(44,36,22,0.4)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>◈</div>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "1.1rem" }}>No artists found</p>
            <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>Try adjusting your search or filters</p>
            {hasFilters && (
              <button onClick={clearFilters} className="btn-primary" style={{ marginTop: "1.2rem" }}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.5rem" }}>
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
