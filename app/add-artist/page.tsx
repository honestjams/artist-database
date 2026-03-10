"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { supabase, Category } from "@/lib/supabase";
import Link from "next/link";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "0.5rem", fontFamily: "inherit" }}>
      {children}
    </label>
  );
}

export default function AddArtistPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [styleOptions, setStyleOptions]     = useState<string[]>([]);
  const [mediumOptions, setMediumOptions]   = useState<string[]>([]);
  const [conceptOptions, setConceptOptions] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: "", nationality: "", birth_year: "", death_year: "",
    bio: "", art_styles: [] as string[], mediums: [] as string[],
    concepts: [] as string[], keywords: "", website: "",
    image_url: "", notable_works: "",
  });

  useEffect(() => {
    supabase.from("categories").select("*").order("name").then(({ data }) => {
      if (!data) return;
      const cats = data as Category[];
      setStyleOptions(cats.filter(c => c.type === "style").map(c => c.name));
      setMediumOptions(cats.filter(c => c.type === "medium").map(c => c.name));
      setConceptOptions(cats.filter(c => c.type === "concept").map(c => c.name));
    });
  }, []);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const toggle = (field: "art_styles" | "mediums" | "concepts", val: string) =>
    setForm(f => ({
      ...f,
      [field]: f[field].includes(val) ? f[field].filter(x => x !== val) : [...f[field], val],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    setError(null);

    const slug = slugify(form.name);
    const keywords = form.keywords.split(",").map(k => k.trim()).filter(Boolean);
    const notable_works = form.notable_works.split("\n").map(w => w.trim()).filter(Boolean);

    const { data, error: err } = await supabase
      .from("artists")
      .insert({
        name: form.name.trim(), slug,
        nationality: form.nationality.trim() || null,
        birth_year: form.birth_year ? parseInt(form.birth_year) : null,
        death_year: form.death_year ? parseInt(form.death_year) : null,
        bio: form.bio.trim() || null,
        art_styles: form.art_styles,
        mediums: form.mediums,
        concepts: form.concepts,
        keywords,
        website: form.website.trim() || null,
        image_url: form.image_url.trim() || null,
        notable_works,
        artwork_images: [],
        is_user_submitted: true,
      })
      .select().single();

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
        <div style={{ maxWidth: 480, margin: "6rem auto", padding: "0 1.25rem", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(122,155,106,0.15)", border: "1px solid rgba(122,155,106,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", fontSize: "1.8rem" }}>✓</div>
          <h2 style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "var(--text-1)", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Artist added!</h2>
          <p style={{ color: "var(--text-2)", fontSize: "0.9rem" }}>Redirecting to their profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <Nav />

      <div style={{ padding: "2.5rem 1.25rem 2rem", borderBottom: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,98,58,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative" }}>
          <Link href="/" style={{ color: "var(--text-3)", fontSize: "0.82rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem", marginBottom: "1.25rem" }}>← Back</Link>
          <h1 style={{ color: "var(--text-1)", fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "clamp(1.7rem, 4vw, 2.5rem)", fontWeight: 700, letterSpacing: "-0.02em", margin: 0, marginBottom: "0.4rem" }}>Add an Artist</h1>
          <p style={{ color: "var(--text-2)", fontSize: "0.92rem" }}>Contribute to the database by adding an artist you love.</p>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "2rem auto 0", padding: "0 1.25rem 5rem" }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

            <div>
              <Label>Artist Name *</Label>
              <input className="input-dark" type="text" placeholder="e.g. Frida Kahlo" value={form.name} onChange={set("name")} required />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
              <div>
                <Label>Nationality</Label>
                <input className="input-dark" type="text" placeholder="e.g. Mexican" value={form.nationality} onChange={set("nationality")} />
              </div>
              <div>
                <Label>Birth Year</Label>
                <input className="input-dark" type="number" placeholder="e.g. 1907" value={form.birth_year} onChange={set("birth_year")} min={1000} max={2025} />
              </div>
              <div>
                <Label>Death Year</Label>
                <input className="input-dark" type="number" placeholder="Leave blank if living" value={form.death_year} onChange={set("death_year")} min={1000} max={2025} />
              </div>
            </div>

            <div>
              <Label>Biography</Label>
              <textarea className="input-dark" placeholder="Write about the artist — their life, influences, and legacy…" value={form.bio} onChange={set("bio")} style={{ minHeight: 150 }} />
            </div>

            {styleOptions.length > 0 && (
              <div>
                <Label>Art Styles / Movements</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {styleOptions.map(s => (
                    <button key={s} type="button" onClick={() => toggle("art_styles", s)} className={`pill ${form.art_styles.includes(s) ? "active" : ""}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {mediumOptions.length > 0 && (
              <div>
                <Label>Mediums</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {mediumOptions.map(m => (
                    <button key={m} type="button" onClick={() => toggle("mediums", m)} className={`pill ${form.mediums.includes(m) ? "active" : ""}`}>{m}</button>
                  ))}
                </div>
              </div>
            )}

            {conceptOptions.length > 0 && (
              <div>
                <Label>Concepts</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {conceptOptions.map(c => (
                    <button key={c} type="button" onClick={() => toggle("concepts", c)}
                      className={`pill ${form.concepts.includes(c) ? "active" : ""}`}
                      style={form.concepts.includes(c) ? { background: "rgba(138,110,210,0.25)", borderColor: "rgba(138,110,210,0.5)", color: "#c4b0f0" } : {}}
                    >{c}</button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label>Keywords</Label>
              <input className="input-dark" type="text" placeholder="Comma separated — e.g. feminism, self-portrait, Mexico" value={form.keywords} onChange={set("keywords")} />
            </div>

            <div>
              <Label>Notable Works</Label>
              <textarea className="input-dark" placeholder="One work per line — e.g. The Two Fridas (1939)" value={form.notable_works} onChange={set("notable_works")} style={{ minHeight: 110 }} />
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.5rem" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: "1.5rem" }}>Optional Links</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <Label>Portrait Image URL</Label>
                  <input className="input-dark" type="url" placeholder="https://upload.wikimedia.org/…" value={form.image_url} onChange={set("image_url")} />
                  <p style={{ fontSize: "0.73rem", color: "var(--text-3)", marginTop: "0.4rem" }}>Wikimedia Commons images work well</p>
                </div>
                <div>
                  <Label>Website</Label>
                  <input className="input-dark" type="url" placeholder="https://…" value={form.website} onChange={set("website")} />
                </div>
              </div>
            </div>

            {error && (
              <div style={{ background: "rgba(232,98,58,0.08)", border: "1px solid rgba(232,98,58,0.2)", borderRadius: 10, padding: "0.85rem 1rem", color: "#f0a07a", fontSize: "0.88rem" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="submit" className="btn-primary" disabled={submitting} style={{ opacity: submitting ? 0.65 : 1, padding: "0.7rem 1.75rem", fontSize: "0.92rem" }}>
                {submitting ? "Submitting…" : "Add to Database"}
              </button>
              <Link href="/" className="btn-ghost" style={{ padding: "0.7rem 1.25rem" }}>Cancel</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
