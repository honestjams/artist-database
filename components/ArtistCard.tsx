"use client";
import Link from "next/link";
import { useState } from "react";
import { Artist } from "@/lib/supabase";

export default function ArtistCard({ artist }: { artist: Artist }) {
  const [imgError, setImgError] = useState(false);

  const years =
    artist.birth_year && artist.death_year
      ? `${artist.birth_year}–${artist.death_year}`
      : artist.birth_year
      ? `b. ${artist.birth_year}`
      : null;

  return (
    <Link href={`/artists/${artist.slug}`} className="card fade-up">
      {/* Image section */}
      <div className="card-img">
        {artist.image_url && !imgError ? (
          <img
            src={artist.image_url}
            alt={artist.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="card-img-fallback">◈</div>
        )}
        <div className="card-img-overlay" />

        {/* Community badge */}
        {artist.is_user_submitted && (
          <div style={{ position: "absolute", top: 12, right: 12 }}>
            <span
              style={{
                background: "rgba(122,155,106,0.85)",
                backdropFilter: "blur(8px)",
                color: "#fff",
                fontSize: "0.6rem",
                fontWeight: 700,
                padding: "0.2rem 0.5rem",
                borderRadius: 6,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
              }}
            >
              Community
            </span>
          </div>
        )}

        {/* Name + nationality overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "1rem 1rem 0.9rem",
          }}
        >
          {artist.art_styles?.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.25rem",
                marginBottom: "0.4rem",
              }}
            >
              {artist.art_styles.slice(0, 2).map((s) => (
                <span
                  key={s}
                  style={{
                    background: "rgba(232,98,58,0.25)",
                    backdropFilter: "blur(4px)",
                    color: "#ffc4a8",
                    border: "1px solid rgba(232,98,58,0.3)",
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    padding: "0.15rem 0.45rem",
                    borderRadius: 5,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}
          <h3
            style={{
              fontSize: "1.08rem",
              fontWeight: 700,
              letterSpacing: "-0.015em",
              color: "#fff",
              margin: 0,
              lineHeight: 1.2,
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}
          >
            {artist.name}
          </h3>
          {(artist.nationality || years) && (
            <p
              style={{
                margin: 0,
                marginTop: "0.2rem",
                fontSize: "0.73rem",
                color: "rgba(255,255,255,0.55)",
                fontWeight: 500,
              }}
            >
              {[artist.nationality, years].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>

      {/* Content below image */}
      <div style={{ padding: "0.85rem 1rem 1rem" }}>
        {artist.bio && (
          <p
            style={{
              margin: 0,
              fontSize: "0.8rem",
              color: "var(--text-2)",
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              marginBottom: artist.mediums?.length > 0 ? "0.6rem" : 0,
            }}
          >
            {artist.bio}
          </p>
        )}

        {artist.mediums?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
            {artist.mediums.slice(0, 3).map((m) => (
              <span key={m} className="tag tag-medium">
                {m}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
