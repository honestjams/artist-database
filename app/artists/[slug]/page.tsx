export const dynamic = "force-dynamic";

import { supabase, Artist } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) notFound();
  const artist = data as Artist;

  const years = artist.birth_year && artist.death_year
    ? `${artist.birth_year}–${artist.death_year}`
    : artist.birth_year
    ? `b. ${artist.birth_year}`
    : null;

  return (
    <div style={{ minHeight: "100vh" }}>
      <Nav />

      {/* Header */}
      <div
        className="gradient-hero"
        style={{ padding: "3rem 1.5rem", position: "relative", overflow: "hidden" }}
      >
        <div style={{ position: "absolute", top: -80, right: -80, width: 380, height: 380, borderRadius: "50%", background: "rgba(201,146,42,0.1)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          <Link
            href="/"
            style={{ color: "rgba(253,248,239,0.55)", fontFamily: "sans-serif", fontSize: "0.8rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem", marginBottom: "1.2rem" }}
          >
            ← Back to Database
          </Link>

          <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Portrait */}
            <div
              style={{
                width: 160,
                height: 200,
                borderRadius: 8,
                overflow: "hidden",
                flexShrink: 0,
                border: "3px solid rgba(253,248,239,0.15)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                background: "linear-gradient(145deg, #4a3728, #2c2416)",
              }}
            >
              {artist.image_url ? (
                <img src={artist.image_url} alt={artist.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", color: "rgba(253,248,239,0.2)" }}>◈</div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              {artist.is_user_submitted && (
                <span className="badge-user" style={{ marginBottom: "0.6rem", display: "inline-block" }}>Community Submission</span>
              )}
              <h1 style={{ color: "#fdf8ef", fontSize: "clamp(1.8rem, 4vw, 3rem)", margin: 0, marginBottom: "0.4rem", fontFamily: "Georgia, serif", lineHeight: 1.1 }}>
                {artist.name}
              </h1>
              {(artist.nationality || years) && (
                <p style={{ color: "rgba(253,248,239,0.6)", fontFamily: "sans-serif", fontSize: "0.9rem", margin: 0, marginBottom: "1rem" }}>
                  {[artist.nationality, years].filter(Boolean).join(" · ")}
                </p>
              )}

              {artist.art_styles?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.6rem" }}>
                  {artist.art_styles.map((s) => (
                    <span key={s} style={{ background: "rgba(196,98,58,0.25)", color: "#f5c4a0", border: "1px solid rgba(196,98,58,0.35)", padding: "0.2rem 0.55rem", borderRadius: 3, fontSize: "0.72rem", letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "sans-serif", fontWeight: 600 }}>
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {artist.mediums?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {artist.mediums.map((m) => (
                    <span key={m} style={{ background: "rgba(107,124,92,0.25)", color: "#b8d0a0", border: "1px solid rgba(107,124,92,0.35)", padding: "0.2rem 0.55rem", borderRadius: 3, fontSize: "0.72rem", letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "sans-serif", fontWeight: 600 }}>
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: "3rem", alignItems: "start" }}>

          {/* Left column */}
          <div>
            {artist.bio && (
              <section style={{ marginBottom: "2.5rem" }}>
                <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem", color: "#2c2416", borderBottom: "2px solid rgba(196,98,58,0.25)", paddingBottom: "0.5rem" }}>
                  Biography
                </h2>
                <div style={{ fontFamily: "Georgia, serif", fontSize: "1rem", lineHeight: 1.8, color: "rgba(44,36,22,0.85)" }}>
                  {artist.bio.split("\n").map((para, i) => (
                    <p key={i} style={{ margin: 0, marginBottom: "1em" }}>{para}</p>
                  ))}
                </div>
              </section>
            )}

            {artist.notable_works?.length > 0 && (
              <section style={{ marginBottom: "2.5rem" }}>
                <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem", color: "#2c2416", borderBottom: "2px solid rgba(196,98,58,0.25)", paddingBottom: "0.5rem" }}>
                  Notable Works
                </h2>
                <ul style={{ margin: 0, padding: "0 0 0 1.2rem", fontFamily: "Georgia, serif", fontSize: "0.95rem", lineHeight: 1.9, color: "rgba(44,36,22,0.8)" }}>
                  {artist.notable_works.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Artwork gallery */}
            {artist.artwork_images?.length > 0 && (
              <section>
                <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem", color: "#2c2416", borderBottom: "2px solid rgba(196,98,58,0.25)", paddingBottom: "0.5rem" }}>
                  Artwork
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                  {artist.artwork_images.map((url, i) => (
                    <div
                      key={i}
                      style={{
                        aspectRatio: "4/3",
                        borderRadius: 6,
                        overflow: "hidden",
                        border: "1px solid rgba(44,36,22,0.1)",
                        boxShadow: "0 4px 12px rgba(44,36,22,0.1)",
                      }}
                    >
                      <img src={url} alt={`${artist.name} artwork ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right sidebar */}
          <div>
            <div
              style={{
                background: "linear-gradient(145deg, #fdf8ef, #f0e8d8)",
                border: "1px solid rgba(44,36,22,0.1)",
                borderRadius: 8,
                padding: "1.5rem",
                boxShadow: "0 4px 16px rgba(44,36,22,0.08)",
              }}
            >
              <h3 style={{ fontSize: "0.75rem", fontFamily: "sans-serif", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(44,36,22,0.45)", margin: 0, marginBottom: "1rem" }}>
                Artist Info
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                {artist.nationality && (
                  <div>
                    <p style={{ margin: 0, fontSize: "0.72rem", fontFamily: "sans-serif", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(44,36,22,0.4)", marginBottom: "0.2rem" }}>Nationality</p>
                    <p style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "0.95rem", color: "#2c2416" }}>{artist.nationality}</p>
                  </div>
                )}
                {years && (
                  <div>
                    <p style={{ margin: 0, fontSize: "0.72rem", fontFamily: "sans-serif", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(44,36,22,0.4)", marginBottom: "0.2rem" }}>Years</p>
                    <p style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "0.95rem", color: "#2c2416" }}>{years}</p>
                  </div>
                )}
                {artist.art_styles?.length > 0 && (
                  <div>
                    <p style={{ margin: 0, fontSize: "0.72rem", fontFamily: "sans-serif", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(44,36,22,0.4)", marginBottom: "0.4rem" }}>Styles</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                      {artist.art_styles.map((s) => <span key={s} className="tag tag-style">{s}</span>)}
                    </div>
                  </div>
                )}
                {artist.mediums?.length > 0 && (
                  <div>
                    <p style={{ margin: 0, fontSize: "0.72rem", fontFamily: "sans-serif", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(44,36,22,0.4)", marginBottom: "0.4rem" }}>Mediums</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                      {artist.mediums.map((m) => <span key={m} className="tag tag-medium">{m}</span>)}
                    </div>
                  </div>
                )}
                {artist.keywords?.length > 0 && (
                  <div>
                    <p style={{ margin: 0, fontSize: "0.72rem", fontFamily: "sans-serif", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(44,36,22,0.4)", marginBottom: "0.4rem" }}>Keywords</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                      {artist.keywords.map((k) => (
                        <span key={k} style={{ background: "rgba(44,36,22,0.06)", color: "rgba(44,36,22,0.65)", border: "1px solid rgba(44,36,22,0.12)", padding: "0.18rem 0.5rem", borderRadius: 3, fontSize: "0.7rem", letterSpacing: "0.03em", fontFamily: "sans-serif" }}>
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {artist.website && (
                  <div>
                    <p style={{ margin: 0, fontSize: "0.72rem", fontFamily: "sans-serif", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(44,36,22,0.4)", marginBottom: "0.2rem" }}>Website</p>
                    <a href={artist.website} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "sans-serif", fontSize: "0.85rem", color: "#a84a2a", wordBreak: "break-all" }}>
                      {artist.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <Link href="/" className="btn-secondary" style={{ marginTop: "1.2rem", justifyContent: "center", width: "100%" }}>
              ← Back to Database
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
