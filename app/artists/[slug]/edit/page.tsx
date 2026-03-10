"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Artist } from "@/lib/supabase";

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

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{
      display: "block", fontSize: "0.7rem", fontWeight: 700,
      letterSpacing: "0.1em", textTransform: "uppercase",
      color: "var(--text-3)", marginBottom: "0.5rem",
    }}>
      {children}{required && <span style={{ color: "var(--orange)", marginLeft: 2 }}>*</span>}
    </label>
  );
}

export default function EditArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const portraitInputRef = useRef<HTMLInputElement>(null);
  const artworkInputRef = useRef<HTMLInputElement>(null);

  const [slug, setSlug] = useState("");
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadingPortrait, setUploadingPortrait] = useState(false);
  const [uploadingArtwork, setUploadingArtwork] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "", nationality: "", birth_year: "", death_year: "",
    bio: "", art_styles: [] as string[], mediums: [] as string[],
    keywords: "", website: "", image_url: "", notable_works: "",
    artwork_images: [] as string[],
  });

  useEffect(() => {
    params.then(({ slug: s }) => {
      setSlug(s);
      init(s);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function init(artistSlug: string) {
    // Check admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).single();

    if (!profile || profile.role !== "admin") {
      router.push("/"); return;
    }
    setIsAdmin(true);

    // Load artist
    const { data, error: fetchErr } = await supabase
      .from("artists").select("*").eq("slug", artistSlug).single();

    if (fetchErr || !data) { setError("Artist not found."); setLoading(false); return; }

    const a = data as Artist;
    setArtist(a);
    setForm({
      name: a.name,
      nationality: a.nationality ?? "",
      birth_year: a.birth_year?.toString() ?? "",
      death_year: a.death_year?.toString() ?? "",
      bio: a.bio ?? "",
      art_styles: a.art_styles ?? [],
      mediums: a.mediums ?? [],
      keywords: (a.keywords ?? []).join(", "),
      website: a.website ?? "",
      image_url: a.image_url ?? "",
      notable_works: (a.notable_works ?? []).join("\n"),
      artwork_images: a.artwork_images ?? [],
    });
    setLoading(false);
  }

  const set = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));

  const toggle = (field: "art_styles" | "mediums", val: string) =>
    setForm(f => ({
      ...f,
      [field]: f[field].includes(val)
        ? f[field].filter(x => x !== val)
        : [...f[field], val],
    }));

  // Upload portrait image to Supabase Storage
  async function uploadPortrait(file: File) {
    setUploadingPortrait(true);
    const ext = file.name.split(".").pop();
    const path = `portraits/${slug}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("artist-images").upload(path, file, { upsert: true });

    if (upErr) { setError(`Upload failed: ${upErr.message}`); setUploadingPortrait(false); return; }

    const { data: { publicUrl } } = supabase.storage
      .from("artist-images").getPublicUrl(path);

    setForm(f => ({ ...f, image_url: publicUrl }));
    setUploadingPortrait(false);
  }

  // Upload artwork image
  async function uploadArtwork(file: File) {
    setUploadingArtwork(true);
    const ext = file.name.split(".").pop();
    const path = `artworks/${slug}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("artist-images").upload(path, file, { upsert: true });

    if (upErr) { setError(`Upload failed: ${upErr.message}`); setUploadingArtwork(false); return; }

    const { data: { publicUrl } } = supabase.storage
      .from("artist-images").getPublicUrl(path);

    setForm(f => ({ ...f, artwork_images: [...f.artwork_images, publicUrl] }));
    setUploadingArtwork(false);
  }

  function removeArtwork(idx: number) {
    setForm(f => ({ ...f, artwork_images: f.artwork_images.filter((_, i) => i !== idx) }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!artist) return;
    setSaving(true);
    setError(null);

    const { error: saveErr } = await supabase
      .from("artists")
      .update({
        name: form.name.trim(),
        nationality: form.nationality.trim() || null,
        birth_year: form.birth_year ? parseInt(form.birth_year) : null,
        death_year: form.death_year ? parseInt(form.death_year) : null,
        bio: form.bio.trim() || null,
        art_styles: form.art_styles,
        mediums: form.mediums,
        keywords: form.keywords.split(",").map(k => k.trim()).filter(Boolean),
        website: form.website.trim() || null,
        image_url: form.image_url.trim() || null,
        notable_works: form.notable_works.split("\n").map(w => w.trim()).filter(Boolean),
        artwork_images: form.artwork_images,
      })
      .eq("id", artist.id);

    if (saveErr) {
      setError(saveErr.message);
      setSaving(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.push(`/artists/${slug}`), 1200);
    }
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

  if (!isAdmin || !artist) {
    return (
      <div style={{ minHeight: "100vh" }}>
        <Nav />
        <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
          <p style={{ color: "var(--text-2)" }}>{error ?? "Access denied."}</p>
          <Link href="/" className="btn-primary" style={{ marginTop: "1.5rem", display: "inline-flex" }}>Back</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <Nav />

      {/* Header */}
      <div style={{
        padding: "2rem 1.25rem 1.5rem",
        borderBottom: "1px solid var(--border)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Link href={`/artists/${slug}`} style={{
            color: "var(--text-3)", fontSize: "0.82rem", textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: "0.4rem", marginBottom: "1rem",
          }}>
            ← Back to profile
          </Link>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <p style={{ color: "var(--orange)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                Admin · Edit
              </p>
              <h1 style={{
                color: "var(--text-1)", fontFamily: "Georgia, serif",
                fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700,
                letterSpacing: "-0.02em",
              }}>
                {artist.name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ maxWidth: 760, margin: "2rem auto 0", padding: "0 1.25rem 5rem" }}>
        {success && (
          <div style={{
            background: "rgba(122,155,106,0.12)", border: "1px solid rgba(122,155,106,0.3)",
            borderRadius: 12, padding: "0.9rem 1.1rem", color: "#a0c890",
            fontSize: "0.88rem", marginBottom: "1.5rem",
          }}>
            ✓ Saved! Redirecting…
          </div>
        )}
        {error && (
          <div style={{
            background: "rgba(232,98,58,0.08)", border: "1px solid rgba(232,98,58,0.2)",
            borderRadius: 12, padding: "0.9rem 1.1rem", color: "#f0a07a",
            fontSize: "0.88rem", marginBottom: "1.5rem",
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

            {/* Portrait image */}
            <div>
              <Label>Portrait Image</Label>
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                {/* Preview */}
                <div style={{
                  width: 100, height: 130, borderRadius: 12, overflow: "hidden",
                  border: "1px solid var(--border)", background: "var(--surface-2)",
                  flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {form.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.image_url} alt="Portrait" referrerPolicy="no-referrer"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  ) : (
                    <span style={{ color: "var(--text-3)", fontSize: "2rem" }}>◈</span>
                  )}
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.6rem", minWidth: 200 }}>
                  {/* Upload button */}
                  <input ref={portraitInputRef} type="file" accept="image/*"
                    style={{ display: "none" }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadPortrait(f); }} />
                  <button type="button" className="btn-ghost"
                    onClick={() => portraitInputRef.current?.click()}
                    disabled={uploadingPortrait}
                    style={{ width: "100%", justifyContent: "center" }}>
                    {uploadingPortrait ? "Uploading…" : "↑ Upload image"}
                  </button>
                  {/* Or paste URL */}
                  <input className="input-dark" type="url"
                    placeholder="Or paste image URL…"
                    value={form.image_url}
                    onChange={set("image_url")} />
                </div>
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid var(--border)" }} />

            {/* Name */}
            <div>
              <Label required>Artist Name</Label>
              <input className="input-dark" type="text" value={form.name} onChange={set("name")} required />
            </div>

            {/* Nationality + Years */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
              <div>
                <Label>Nationality</Label>
                <input className="input-dark" type="text" placeholder="e.g. French" value={form.nationality} onChange={set("nationality")} />
              </div>
              <div>
                <Label>Birth Year</Label>
                <input className="input-dark" type="number" min={1000} max={2025} value={form.birth_year} onChange={set("birth_year")} />
              </div>
              <div>
                <Label>Death Year</Label>
                <input className="input-dark" type="number" min={1000} max={2025} placeholder="Leave blank if living" value={form.death_year} onChange={set("death_year")} />
              </div>
            </div>

            {/* Bio */}
            <div>
              <Label>Biography</Label>
              <textarea className="input-dark" value={form.bio} onChange={set("bio")} style={{ minHeight: 160 }} />
            </div>

            {/* Art Styles */}
            <div>
              <Label>Art Styles / Movements</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {STYLE_OPTIONS.map(s => (
                  <button key={s} type="button" onClick={() => toggle("art_styles", s)}
                    className={`pill ${form.art_styles.includes(s) ? "active" : ""}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Mediums */}
            <div>
              <Label>Mediums</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {MEDIUM_OPTIONS.map(m => (
                  <button key={m} type="button" onClick={() => toggle("mediums", m)}
                    className={`pill ${form.mediums.includes(m) ? "active" : ""}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div>
              <Label>Keywords</Label>
              <input className="input-dark" type="text" placeholder="Comma separated" value={form.keywords} onChange={set("keywords")} />
            </div>

            {/* Notable works */}
            <div>
              <Label>Notable Works</Label>
              <textarea className="input-dark" placeholder="One per line" value={form.notable_works} onChange={set("notable_works")} style={{ minHeight: 110 }} />
            </div>

            {/* Website */}
            <div>
              <Label>Website</Label>
              <input className="input-dark" type="url" placeholder="https://…" value={form.website} onChange={set("website")} />
            </div>

            <hr style={{ border: "none", borderTop: "1px solid var(--border)" }} />

            {/* Artwork gallery */}
            <div>
              <Label>Artwork Gallery</Label>

              {/* Existing artwork images */}
              {form.artwork_images.length > 0 && (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                  gap: "0.75rem", marginBottom: "1rem",
                }}>
                  {form.artwork_images.map((url, i) => (
                    <div key={i} style={{ position: "relative", aspectRatio: "4/3", borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)", background: "var(--surface-2)" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Artwork ${i + 1}`} referrerPolicy="no-referrer"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      <button
                        type="button"
                        onClick={() => removeArtwork(i)}
                        style={{
                          position: "absolute", top: 6, right: 6,
                          background: "rgba(0,0,0,0.7)", border: "none",
                          borderRadius: "50%", width: 24, height: 24,
                          color: "#fff", fontSize: "0.75rem", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          lineHeight: 1,
                        }}
                        title="Remove"
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload new artwork */}
              <input ref={artworkInputRef} type="file" accept="image/*"
                style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadArtwork(f); }} />
              <button type="button" className="btn-ghost"
                onClick={() => artworkInputRef.current?.click()}
                disabled={uploadingArtwork}
                style={{ width: "100%", justifyContent: "center" }}>
                {uploadingArtwork ? "Uploading…" : "↑ Upload artwork image"}
              </button>
            </div>

            {/* Save */}
            <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
              <button type="submit" className="btn-primary"
                disabled={saving || success}
                style={{ padding: "0.7rem 2rem", fontSize: "0.92rem", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <Link href={`/artists/${slug}`} className="btn-ghost" style={{ padding: "0.7rem 1.25rem" }}>
                Cancel
              </Link>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
