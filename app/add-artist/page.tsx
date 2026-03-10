"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const STYLE_OPTIONS = [
  "Impressionism", "Abstract", "Surrealism", "Expressionism",
  "Realism", "Pop Art", "Cubism", "Minimalism", "Baroque",
  "Renaissance", "Contemporary", "Street Art", "Photography",
  "Sculpture", "Installation", "Conceptual", "Figurative",
];

const MEDIUM_OPTIONS = [
  "Oil Paint", "Watercolour", "Acrylic", "Photography",
  "Sculpture", "Digital", "Mixed Media", "Printmaking",
  "Drawing", "Ceramics", "Textile", "Performance",
];

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AddArtistPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    nationality: "",
    birth_year: "",
    death_year: "",
    bio: "",
    art_styles: [] as string[],
    mediums: [] as string[],
    keywords: "",
    website: "",
    image_url: "",
    notable_works: "",
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const toggleStyle = (s: string) =>
    setForm((f) => ({
      ...f,
      art_styles: f.art_styles.includes(s)
        ? f.art_styles.filter((x) => x !== s)
        : [...f.art_styles, s],
    }));

  const toggleMedium = (m: string) =>
    setForm((f) => ({
      ...f,
      mediums: f.mediums.includes(m)
        ? f.mediums.filter((x) => x !== m)
        : [...f.mediums, m],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    setError(null);

    const slug = slugify(form.name);
    const keywords = form.keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    const notable_works = form.notable_works
      .split("\n")
      .map((w) => w.trim())
      .filter(Boolean);

    const { data, error: err } = await supabase.from("artists").insert({
      name: form.name.trim(),
      slug,
      nationality: form.nationality.trim() || null,
      birth_year: form.birth_year ? parseInt(form.birth_year) : null,
      death_year: form.death_year ? parseInt(form.death_year) : null,
      bio: form.bio.trim() || null,
      art_styles: form.art_styles,
      mediums: form.mediums,
      keywords,
      website: form.website.trim() || null,
      image_url: form.image_url.trim() || null,
      notable_works,
      artwork_images: [],
      is_user_submitted: true,
    }).select().single();

    if (err) {
      setError(err.message.includes("unique") ? "An artist with this name already exists." : err.message);
      setSubmitting(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.push(`/artists/${(data as { slug: string }).slug}`), 1500);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: "100vh" }}>
        <Nav />
        <div style={{ maxWidth: 600, margin: "5rem auto", padding: "0 1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✓</div>
          <h2 style={{ fontFamily: "Georgia, serif", color: "#2c2416", marginBottom: "0.5rem" }}>Artist added!</h2>
          <p style={{ color: "rgba(44,36,22,0.6)", fontFamily: "Georgia, serif" }}>Redirecting to their profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <Nav />

      <div
        style={{
          background: "linear-gradient(135deg, #2c2416 0%, #4a3728 100%)",
          padding: "2.5rem 1.5rem",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Link href="/" style={{ color: "rgba(253,248,239,0.5)", fontFamily: "sans-serif", fontSize: "0.8rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem", marginBottom: "1rem" }}>
            ← Back
          </Link>
          <h1 style={{ color: "#fdf8ef", fontFamily: "Georgia, serif", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", margin: 0 }}>
            Add an Artist
          </h1>
          <p style={{ color: "rgba(253,248,239,0.55)", fontFamily: "Georgia, serif", fontSize: "0.95rem", marginTop: "0.5rem" }}>
            Contribute to the database by adding an artist you love.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "2.5rem auto", padding: "0 1.5rem" }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}>

            {/* Name */}
            <div>
              <label style={{ display: "block", fontFamily: "sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,36,22,0.55)", marginBottom: "0.4rem" }}>
                Artist Name *
              </label>
              <input className="input-paper" type="text" placeholder="e.g. Frida Kahlo" value={form.name} onChange={set("name")} required />
            </div>

            {/* Nationality + Years */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontFamily: "sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,36,22,0.55)", marginBottom: "0.4rem" }}>
                  Nationality
                </label>
                <input className="input-paper" type="text" placeholder="e.g. Mexican" value={form.nationality} onChange={set("nationality")} />
              </div>
              <div>
                <label style={{ display: "block", fontFamily: "sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,36,22,0.55)", marginBottom: "0.4rem" }}>
                  Birth Year
                </label>
                <input className="input-paper" type="number" placeholder="e.g. 1907" value={form.birth_year} onChange={set("birth_year")} min={1000} max={2025} />
              </div>
              <div>
                <label style={{ display: "block", fontFamily: "sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,36,22,0.55)", marginBottom: "0.4rem" }}>
                  Death Year
                </label>
                <input className="input-paper" type="number" placeholder="Leave blank if living" value={form.death_year} onChange={set("death_year")} min={1000} max={2025} />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label style={{ display: "block", fontFamily: "sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,36,22,0.55)", marginBottom: "0.4rem" }}>
                Biography
              </label>
              <textarea className="input-paper" placeholder="Write a biography of the artist — their life, influences, and legacy…" value={form.bio} onChange={set("bio")} style={{ minHeight: 140 }} />
            </div>

            {/* Styles */}
            <div>
              <label style={{ display: "block", fontFamily: "sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,36,22,0.55)", marginBottom: "0.6rem" }}>
                Art Styles / Movements
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {STYLE_OPTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => toggleStyle(s)} className={`filter-pill ${form.art_styles.includes(s) ? "active" : ""}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Mediums */}
            <div>
              <label style={{ display: "block", fontFamily: "sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,36,22,0.55)", marginBottom: "0.6rem" }}>
                Mediums
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {MEDIUM_OPTIONS.map((m) => (
                  <button key={m} type="button" onClick={() => toggleMedium(m)} className={`filter-pill ${form.mediums.includes(m) ? "active" : ""}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div>
              <label style={{ display: "block", fontFamily: "sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,36,22,0.55)", marginBottom: "0.4rem" }}>
                Keywords
              </label>
              <input className="input-paper" type="text" placeholder="Comma separated — e.g. feminism, self-portrait, Mexico, colour" value={form.keywords} onChange={set("keywords")} />
            </div>

            {/* Notable works */}
            <div>
              <label style={{ display: "block", fontFamily: "sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,36,22,0.55)", marginBottom: "0.4rem" }}>
                Notable Works
              </label>
              <textarea className="input-paper" placeholder="One work per line — e.g. The Two Fridas (1939)" value={form.notable_works} onChange={set("notable_works")} style={{ minHeight: 100 }} />
            </div>

            {/* Portrait URL */}
            <div>
              <label style={{ display: "block", fontFamily: "sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,36,22,0.55)", marginBottom: "0.4rem" }}>
                Portrait Image URL
              </label>
              <input className="input-paper" type="url" placeholder="https://…" value={form.image_url} onChange={set("image_url")} />
            </div>

            {/* Website */}
            <div>
              <label style={{ display: "block", fontFamily: "sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,36,22,0.55)", marginBottom: "0.4rem" }}>
                Website
              </label>
              <input className="input-paper" type="url" placeholder="https://…" value={form.website} onChange={set("website")} />
            </div>

            {error && (
              <div style={{ background: "rgba(168,74,42,0.08)", border: "1px solid rgba(168,74,42,0.25)", borderRadius: 6, padding: "0.8rem 1rem", color: "#a84a2a", fontFamily: "Georgia, serif", fontSize: "0.9rem" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "1rem", paddingBottom: "3rem" }}>
              <button type="submit" className="btn-primary" disabled={submitting} style={{ opacity: submitting ? 0.7 : 1 }}>
                {submitting ? "Submitting…" : "Add to Database"}
              </button>
              <Link href="/" className="btn-secondary">
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
