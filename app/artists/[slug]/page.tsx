export const dynamic = "force-dynamic";

import { supabase, Artist } from "@/lib/supabase";
import { getProfile } from "@/lib/supabase-server";
import Nav from "@/components/Nav";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [{ data, error }, profile] = await Promise.all([
    supabase.from("artists").select("*").eq("slug", slug).single(),
    getProfile(),
  ]);

  if (error || !data) notFound();
  const isAdmin = profile?.role === "admin";
  const artist = data as Artist;

  const years =
    artist.birth_year && artist.death_year
      ? `${artist.birth_year}–${artist.death_year}`
      : artist.birth_year
      ? `b. ${artist.birth_year}`
      : null;

  return (
    <div style={{ minHeight: "100vh" }}>
      <Nav />

      {/* ── Hero ─────────────────────────────────────────── */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        {/* Blurred background from artist image */}
        {artist.image_url && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={artist.image_url}
              alt=""
              aria-hidden
              referrerPolicy="no-referrer"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top center",
                filter: "blur(40px) saturate(0.6) brightness(0.25)",
                transform: "scale(1.1)",
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to bottom, rgba(13,12,16,0.55) 0%, rgba(13,12,16,0.9) 100%)",
                zIndex: 1,
              }}
            />
          </>
        )}

        {!artist.image_url && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, rgba(232,98,58,0.08) 0%, rgba(13,12,16,0) 60%)",
              zIndex: 0,
            }}
          />
        )}

        {/* Hero content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 1100,
            margin: "0 auto",
            padding: "2rem 1.25rem 3rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <Link
              href="/"
              style={{
                color: "var(--text-3)",
                fontSize: "0.82rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                transition: "color 0.15s",
              }}
            >
              ← Back to Database
            </Link>
            {isAdmin && (
              <Link
                href={`/artists/${slug}/edit`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: "rgba(232,98,58,0.15)",
                  border: "1px solid rgba(232,98,58,0.3)",
                  color: "#f0a07a",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  padding: "0.4rem 0.85rem",
                  borderRadius: 8,
                  textDecoration: "none",
                  backdropFilter: "blur(8px)",
                  letterSpacing: "0.01em",
                }}
              >
                ✎ Edit Artist
              </Link>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: "2rem",
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            {/* Portrait */}
            <div
              style={{
                width: 160,
                height: 210,
                borderRadius: 14,
                overflow: "hidden",
                flexShrink: 0,
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
                background: "var(--surface-2)",
              }}
            >
              {artist.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={artist.image_url}
                  alt={artist.name}
                  referrerPolicy="no-referrer"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "top",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "3.5rem",
                    color: "rgba(240,237,232,0.1)",
                  }}
                >
                  ◈
                </div>
              )}
            </div>

            {/* Info */}
            <div className="artist-hero-inner" style={{ flex: 1, minWidth: 200 }}>
              {artist.is_user_submitted && (
                <span
                  style={{
                    background: "rgba(122,155,106,0.2)",
                    color: "#a0c890",
                    border: "1px solid rgba(122,155,106,0.3)",
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.55rem",
                    borderRadius: 6,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    display: "inline-block",
                    marginBottom: "0.75rem",
                  }}
                >
                  Community Submission
                </span>
              )}

              <h1
                style={{
                  color: "var(--text-1)",
                  fontSize: "clamp(1.9rem, 4.5vw, 3.2rem)",
                  margin: 0,
                  marginBottom: "0.4rem",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  lineHeight: 1.08,
                  letterSpacing: "-0.02em",
                  fontWeight: 700,
                }}
              >
                {artist.name}
              </h1>

              {(artist.nationality || years) && (
                <p
                  style={{
                    color: "var(--text-2)",
                    fontSize: "0.95rem",
                    margin: 0,
                    marginBottom: "1.25rem",
                    fontWeight: 400,
                  }}
                >
                  {[artist.nationality, years].filter(Boolean).join(" · ")}
                </p>
              )}

              {artist.art_styles?.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.35rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {artist.art_styles.map((s) => (
                    <span key={s} className="tag tag-style">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {artist.mediums?.length > 0 && (
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}
                >
                  {artist.mediums.map((m) => (
                    <span key={m} className="tag tag-medium">
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────── */}
      <div
        style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.25rem 5rem" }}
      >
        <div
          className="artist-detail-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
            gap: "3rem",
            alignItems: "start",
          }}
        >
          {/* ── Left column ──────────────────────────── */}
          <div>
            {artist.bio && (
              <section style={{ marginBottom: "3rem" }}>
                <h2
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--text-3)",
                    marginBottom: "1rem",
                  }}
                >
                  Biography
                </h2>
                <div
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontSize: "1.02rem",
                    lineHeight: 1.85,
                    color: "var(--text-2)",
                  }}
                >
                  {artist.bio.split("\n").map((para, i) => (
                    <p key={i} style={{ margin: 0, marginBottom: "1.1em" }}>
                      {para}
                    </p>
                  ))}
                </div>
              </section>
            )}

            {artist.notable_works?.length > 0 && (
              <section style={{ marginBottom: "3rem" }}>
                <h2
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--text-3)",
                    marginBottom: "1rem",
                  }}
                >
                  Notable Works
                </h2>
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {artist.notable_works.map((w, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: "0.65rem",
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        fontSize: "0.95rem",
                        lineHeight: 1.5,
                        color: "var(--text-2)",
                      }}
                    >
                      <span
                        style={{
                          flexShrink: 0,
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "var(--orange)",
                          marginTop: "0.45rem",
                          opacity: 0.7,
                        }}
                      />
                      {w}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Artwork gallery */}
            {artist.artwork_images?.length > 0 && (
              <section>
                <h2
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--text-3)",
                    marginBottom: "1rem",
                  }}
                >
                  Artwork
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "0.85rem",
                  }}
                >
                  {artist.artwork_images.map((url, i) => (
                    <div
                      key={i}
                      className="artwork-thumb"
                      style={{
                        aspectRatio: "4/3",
                        borderRadius: 12,
                        overflow: "hidden",
                        border: "1px solid var(--border)",
                        background: "var(--surface-2)",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`${artist.name} — artwork ${i + 1}`}
                        referrerPolicy="no-referrer"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── Right sidebar ─────────────────────────── */}
          <div className="artist-sidebar-sticky" style={{ position: "sticky", top: 80 }}>
            <div
              className="glass"
              style={{
                borderRadius: 16,
                padding: "1.5rem",
              }}
            >
              <h3
                style={{
                  fontSize: "0.67rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--text-3)",
                  margin: 0,
                  marginBottom: "1.25rem",
                }}
              >
                Artist Info
              </h3>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
              >
                {artist.nationality && (
                  <div className="info-row">
                    <span className="info-label">Nationality</span>
                    <span className="info-value">{artist.nationality}</span>
                  </div>
                )}

                {years && (
                  <div className="info-row">
                    <span className="info-label">Years</span>
                    <span className="info-value">{years}</span>
                  </div>
                )}

                {artist.art_styles?.length > 0 && (
                  <div className="info-row">
                    <span className="info-label">Styles</span>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.3rem",
                        marginTop: "0.3rem",
                      }}
                    >
                      {artist.art_styles.map((s) => (
                        <span key={s} className="tag tag-style">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {artist.mediums?.length > 0 && (
                  <div className="info-row">
                    <span className="info-label">Mediums</span>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.3rem",
                        marginTop: "0.3rem",
                      }}
                    >
                      {artist.mediums.map((m) => (
                        <span key={m} className="tag tag-medium">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {artist.keywords?.length > 0 && (
                  <div className="info-row">
                    <span className="info-label">Keywords</span>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.3rem",
                        marginTop: "0.3rem",
                      }}
                    >
                      {artist.keywords.map((k) => (
                        <span
                          key={k}
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            color: "var(--text-2)",
                            border: "1px solid var(--border)",
                            padding: "0.15rem 0.5rem",
                            borderRadius: 6,
                            fontSize: "0.7rem",
                            fontFamily: "inherit",
                          }}
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {artist.website && (
                  <div className="info-row">
                    <span className="info-label">Website</span>
                    <a
                      href={artist.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--orange)",
                        wordBreak: "break-all",
                        textDecoration: "none",
                        fontFamily: "inherit",
                      }}
                    >
                      {artist.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <Link
              href="/"
              className="btn-ghost"
              style={{
                marginTop: "0.85rem",
                width: "100%",
                justifyContent: "center",
              }}
            >
              ← Back to Database
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
