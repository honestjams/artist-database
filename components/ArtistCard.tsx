"use client";
import Link from "next/link";
import { Artist } from "@/lib/supabase";

export default function ArtistCard({ artist }: { artist: Artist }) {
  const years =
    artist.birth_year && artist.death_year
      ? `${artist.birth_year}–${artist.death_year}`
      : artist.birth_year
      ? `b. ${artist.birth_year}`
      : null;

  return (
    <Link href={`/artists/${artist.slug}`} style={{ textDecoration: "none" }}>
      <div className="artist-card" style={{ height: "100%" }}>
        {/* Image area */}
        <div
          style={{
            height: 200,
            position: "relative",
            overflow: "hidden",
            background: "linear-gradient(145deg, #e8dcc8, #d8ccb4)",
          }}
        >
          {artist.image_url ? (
            <img
              src={artist.image_url}
              alt={artist.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top center",
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
                background:
                  "linear-gradient(145deg, #e8dcc8 0%, #c8b898 100%)",
                fontSize: "4rem",
                color: "rgba(44,36,22,0.2)",
              }}
            >
              ◈
            </div>
          )}
          {/* Gradient overlay at bottom */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 60,
              background:
                "linear-gradient(to top, rgba(44,36,22,0.6), transparent)",
            }}
          />
          {artist.is_user_submitted && (
            <div
              style={{ position: "absolute", top: 8, right: 8 }}
            >
              <span className="badge-user">Community</span>
            </div>
          )}
          {artist.nationality && (
            <div
              style={{
                position: "absolute",
                bottom: 8,
                left: 10,
                color: "rgba(253,248,239,0.9)",
                fontSize: "0.75rem",
                fontFamily: "sans-serif",
                letterSpacing: "0.03em",
              }}
            >
              {artist.nationality}
              {years && ` · ${years}`}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: "1rem 1rem 1.1rem" }}>
          <h3
            style={{
              margin: 0,
              marginBottom: "0.5rem",
              fontSize: "1.1rem",
              fontFamily: "Georgia, serif",
              color: "#2c2416",
              lineHeight: 1.2,
            }}
          >
            {artist.name}
          </h3>

          {/* Styles */}
          {artist.art_styles?.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.3rem",
                marginBottom: "0.6rem",
              }}
            >
              {artist.art_styles.slice(0, 3).map((s) => (
                <span key={s} className="tag tag-style">
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Bio snippet */}
          {artist.bio && (
            <p
              style={{
                margin: 0,
                fontSize: "0.82rem",
                color: "rgba(44,36,22,0.65)",
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                fontFamily: "Georgia, serif",
              }}
            >
              {artist.bio}
            </p>
          )}

          {/* Mediums */}
          {artist.mediums?.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.3rem",
                marginTop: "0.6rem",
              }}
            >
              {artist.mediums.slice(0, 2).map((m) => (
                <span key={m} className="tag tag-medium">
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
