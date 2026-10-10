"use client";

import { useEffect, useState } from "react";
import type { SiteContent } from "../lib/content";

type Service = SiteContent["services"]["items"][number];
type ProcessStep = SiteContent["about"]["steps"][number];
type DemoTestimonial = SiteContent["testimonials"]["demos"][number];

const visibilityOptions: Array<{ key: keyof SiteContent["sections"]; label: string }> = [
  { key: "highlights", label: "Professional highlights" },
  { key: "services", label: "Services" },
  { key: "portfolio", label: "Pinned projects" },
  { key: "github", label: "GitHub activity" },
  { key: "about", label: "About and process" },
  { key: "testimonials", label: "Testimonials" },
  { key: "contact", label: "Contact" }
];

const navigationFields = [
  ["home", "Home"],
  ["about", "How I work"],
  ["services", "Services"],
  ["portfolio", "Portfolio"],
  ["testimonials", "Testimonials"],
  ["contact", "Contact"],
  ["cta", "Navigation call to action"],
  ["ctaHref", "Navigation call to action link"]
] as const;

export default function SiteContentEditor() {
  const [content, setLoadedContent] = useState<SiteContent | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/site-content")
      .then(async (response) => {
        const result: unknown = await response.json();
        if (!response.ok) {
          const error = result && typeof result === "object" && "error" in result ? String(result.error) : "Could not load site content.";
          throw new Error(error);
        }
        setLoadedContent(result as SiteContent);
      })
      .catch((error: Error) => setStatus(error.message))
      .finally(() => setLoading(false));
  }, []);

  function setContent(updater: (current: SiteContent) => SiteContent) {
    setLoadedContent((current) => current ? updater(current) : current);
  }

  async function save() {
    if (!content) return;
    setSaving(true);
    setStatus("");
    try {
      const response = await fetch("/api/admin/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content)
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const error = result && typeof result === "object" && "error" in result ? String(result.error) : "Could not save site content.";
        throw new Error(error);
      }
      setStatus("All public site content saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save site content. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  function updateHero(key: keyof SiteContent["navigation"], value: string) {
    setContent((current) => ({ ...current, navigation: { ...current.navigation, [key]: value } }));
  }

  function updateService(index: number, patch: Partial<Service>) {
    setContent((current) => ({
      ...current,
      services: { ...current.services, items: current.services.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) }
    }));
  }

  function updateStep(index: number, patch: Partial<ProcessStep>) {
    setContent((current) => ({
      ...current,
      about: { ...current.about, steps: current.about.steps.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) }
    }));
  }

  function updateDemo(index: number, patch: Partial<DemoTestimonial>) {
    setContent((current) => ({
      ...current,
      testimonials: { ...current.testimonials, demos: current.testimonials.demos.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) }
    }));
  }

  return (
    <section className="admin-section site-content-editor" id="site-content">
      <div className="admin-section-heading">
        <div>
          <h2>Site content and appearance</h2>
          <p className="admin-muted">Manage public copy, images, links, and section visibility. Project descriptions and cover images are managed in Projects.</p>
        </div>
      </div>
      {loading ? <p className="admin-muted">Loading site content…</p> : null}
      {!loading && !content ? <p className="admin-review-status" role="alert">{status || "Site content could not be loaded. Try again after checking the database connection."}</p> : null}
      {!loading && content ? (
        <>
          <details className="site-content-group" open>
            <summary>Homepage visibility</summary>
            <div className="site-visibility-grid">
              {visibilityOptions.map(({ key, label }) => (
                <label className="site-visibility-option" key={key}>
                  <input
                    type="checkbox"
                    checked={content.sections[key]}
                    onChange={(event) => setContent((current) => ({ ...current, sections: { ...current.sections, [key]: event.target.checked } }))}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </details>

          <details className="site-content-group" open>
            <summary>Hero portrait and primary call to action</summary>
            <div className="admin-form admin-grid site-content-fields">
              <TextField label="Primary button link" value={content.heroCtaHref} onChange={(value) => setContent((current) => ({ ...current, heroCtaHref: value }))} />
              <ImageUrlField label="Hero portrait" value={content.heroImage} onChange={(value) => setContent((current) => ({ ...current, heroImage: value }))} />
            </div>
          </details>

          <details className="site-content-group" open>
            <summary>Navigation labels</summary>
            <div className="admin-form admin-grid site-content-fields">
              {navigationFields.map(([key, label]) => (
                <label key={key}><span>{label}</span><input value={content.navigation[key]} onChange={(event) => updateHero(key, event.target.value)} /></label>
              ))}
            </div>
          </details>

          <details className="site-content-group" open>
            <summary>Homepage highlights</summary>
            <div className="admin-form admin-grid site-content-fields">
              {content.highlights.map((highlight, index) => (
                <label key={index}><span>Highlight {String(index + 1).padStart(2, "0")}</span><input value={highlight} onChange={(event) => setContent((current) => ({ ...current, highlights: current.highlights.map((item, itemIndex) => itemIndex === index ? event.target.value : item) }))} /></label>
              ))}
            </div>
          </details>

          <details className="site-content-group">
            <summary>Services section and cards</summary>
            <div className="admin-form admin-grid site-content-fields">
              <TextField label="Section eyebrow" value={content.services.eyebrow} onChange={(value) => setContent((current) => ({ ...current, services: { ...current.services, eyebrow: value } }))} />
              <TextField label="Section title" value={content.services.title} onChange={(value) => setContent((current) => ({ ...current, services: { ...current.services, title: value } }))} />
              <TextField label="Introductory copy" multiline value={content.services.intro} onChange={(value) => setContent((current) => ({ ...current, services: { ...current.services, intro: value } }))} />
              <TextField label="Contact link label" value={content.services.ctaLabel} onChange={(value) => setContent((current) => ({ ...current, services: { ...current.services, ctaLabel: value } }))} />
              <TextField label="Contact link URL" value={content.services.ctaHref} onChange={(value) => setContent((current) => ({ ...current, services: { ...current.services, ctaHref: value } }))} />
            </div>
            {content.services.items.map((service, index) => (
              <article className="site-content-card" key={`service-${index}`}>
                <h3>Service {String(index + 1).padStart(2, "0")}</h3>
                <div className="admin-form admin-grid site-content-fields">
                  <TextField label="Title" value={service.title} onChange={(value) => updateService(index, { title: value })} />
                  <TextField label="Description" multiline value={service.description} onChange={(value) => updateService(index, { description: value })} />
                  <TextField label="Offerings (one per line)" multiline value={service.offerings.join("\n")} onChange={(value) => updateService(index, { offerings: splitLines(value) })} />
                  <TextField label="Image description (alt text)" value={service.imageAlt} onChange={(value) => updateService(index, { imageAlt: value })} />
                  <ImageUrlField label="Service image" value={service.image} onChange={(value) => updateService(index, { image: value })} />
                </div>
              </article>
            ))}
          </details>

          <details className="site-content-group">
            <summary>Pinned projects section</summary>
            <div className="admin-form admin-grid site-content-fields">
              <TextField label="Eyebrow" value={content.portfolio.eyebrow} onChange={(value) => setContent((current) => ({ ...current, portfolio: { ...current.portfolio, eyebrow: value } }))} />
              <TextField label="Heading" value={content.portfolio.title} onChange={(value) => setContent((current) => ({ ...current, portfolio: { ...current.portfolio, title: value } }))} />
              <TextField label="Description" multiline value={content.portfolio.intro} onChange={(value) => setContent((current) => ({ ...current, portfolio: { ...current.portfolio, intro: value } }))} />
              <TextField label="All projects link label" value={content.portfolio.allProjectsLabel} onChange={(value) => setContent((current) => ({ ...current, portfolio: { ...current.portfolio, allProjectsLabel: value } }))} />
            </div>
          </details>

          <details className="site-content-group">
            <summary>GitHub activity section</summary>
            <div className="admin-form admin-grid site-content-fields">
              <TextField label="Eyebrow" value={content.github.eyebrow} onChange={(value) => setContent((current) => ({ ...current, github: { ...current.github, eyebrow: value } }))} />
              <TextField label="Heading" value={content.github.title} onChange={(value) => setContent((current) => ({ ...current, github: { ...current.github, title: value } }))} />
              <TextField label="Profile link label" value={content.github.linkLabel} onChange={(value) => setContent((current) => ({ ...current, github: { ...current.github, linkLabel: value } }))} />
            </div>
          </details>

          <details className="site-content-group">
            <summary>About and process section</summary>
            <div className="admin-form admin-grid site-content-fields">
              <TextField label="Eyebrow" value={content.about.eyebrow} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, eyebrow: value } }))} />
              <TextField label="Heading" value={content.about.title} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, title: value } }))} />
              <TextField label="Introduction" multiline value={content.about.copy} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, copy: value } }))} />
              <TextField label="Contact button label" value={content.about.ctaLabel} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, ctaLabel: value } }))} />
              <TextField label="Contact button URL" value={content.about.ctaHref} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, ctaHref: value } }))} />
            </div>
            {content.about.steps.map((step, index) => (
              <article className="site-content-card" key={`process-${index}`}>
                <h3>Process step {String(index + 1).padStart(2, "0")}</h3>
                <div className="admin-form admin-grid site-content-fields">
                  <TextField label="Title" value={step.title} onChange={(value) => updateStep(index, { title: value })} />
                  <TextField label="Description" multiline value={step.description} onChange={(value) => updateStep(index, { description: value })} />
                  <TextField label="Image description (alt text)" value={step.imageAlt} onChange={(value) => updateStep(index, { imageAlt: value })} />
                  <ImageUrlField label="Process image" value={step.image} onChange={(value) => updateStep(index, { image: value })} />
                </div>
              </article>
            ))}
          </details>

          <details className="site-content-group">
            <summary>Testimonials and demo cards</summary>
            <p className="admin-muted">Demo cards appear only when there are no approved submissions. Visitor feedback stays private until approved.</p>
            <div className="admin-form admin-grid site-content-fields">
              <TextField label="Eyebrow" value={content.testimonials.eyebrow} onChange={(value) => setContent((current) => ({ ...current, testimonials: { ...current.testimonials, eyebrow: value } }))} />
              <TextField label="Heading" value={content.testimonials.title} onChange={(value) => setContent((current) => ({ ...current, testimonials: { ...current.testimonials, title: value } }))} />
              <TextField label="Approved feedback intro" multiline value={content.testimonials.intro} onChange={(value) => setContent((current) => ({ ...current, testimonials: { ...current.testimonials, intro: value } }))} />
              <TextField label="Demo cards intro" multiline value={content.testimonials.demoIntro} onChange={(value) => setContent((current) => ({ ...current, testimonials: { ...current.testimonials, demoIntro: value } }))} />
              <TextField label="Feedback prompt" value={content.testimonials.feedbackPrompt} onChange={(value) => setContent((current) => ({ ...current, testimonials: { ...current.testimonials, feedbackPrompt: value } }))} />
              <TextField label="Feedback button" value={content.testimonials.feedbackButton} onChange={(value) => setContent((current) => ({ ...current, testimonials: { ...current.testimonials, feedbackButton: value } }))} />
              <TextField label="Form eyebrow" value={content.testimonials.formEyebrow} onChange={(value) => setContent((current) => ({ ...current, testimonials: { ...current.testimonials, formEyebrow: value } }))} />
              <TextField label="Form heading" value={content.testimonials.formTitle} onChange={(value) => setContent((current) => ({ ...current, testimonials: { ...current.testimonials, formTitle: value } }))} />
              <TextField label="Form intro" multiline value={content.testimonials.formDescription} onChange={(value) => setContent((current) => ({ ...current, testimonials: { ...current.testimonials, formDescription: value } }))} />
            </div>
            {content.testimonials.demos.map((demo, index) => (
              <article className="site-content-card" key={`demo-${index}`}>
                <h3>Demo testimonial {index + 1}</h3>
                <div className="admin-form admin-grid site-content-fields">
                  <TextField label="Name" value={demo.name} onChange={(value) => updateDemo(index, { name: value })} />
                  <TextField label="Role (include Demo label)" value={demo.role} onChange={(value) => updateDemo(index, { role: value })} />
                  <TextField label="Quote" multiline value={demo.content} onChange={(value) => updateDemo(index, { content: value })} />
                </div>
              </article>
            ))}
          </details>

          <details className="site-content-group">
            <summary>Contact and footer</summary>
            <div className="admin-form admin-grid site-content-fields">
              <TextField label="Contact eyebrow" value={content.contact.eyebrow} onChange={(value) => setContent((current) => ({ ...current, contact: { ...current.contact, eyebrow: value } }))} />
              <TextField label="Contact heading" value={content.contact.title} onChange={(value) => setContent((current) => ({ ...current, contact: { ...current.contact, title: value } }))} />
              <TextField label="Contact description" multiline value={content.contact.description} onChange={(value) => setContent((current) => ({ ...current, contact: { ...current.contact, description: value } }))} />
              <TextField label="Footer name" value={content.footer.name} onChange={(value) => setContent((current) => ({ ...current, footer: { ...current.footer, name: value } }))} />
              <TextField label="Footer subtitle" value={content.footer.subtitle} onChange={(value) => setContent((current) => ({ ...current, footer: { ...current.footer, subtitle: value } }))} />
              <TextField label="Footer email link label" value={content.footer.emailLabel} onChange={(value) => setContent((current) => ({ ...current, footer: { ...current.footer, emailLabel: value } }))} />
              <TextField label="Footer GitHub link label" value={content.footer.githubLabel} onChange={(value) => setContent((current) => ({ ...current, footer: { ...current.footer, githubLabel: value } }))} />
              <TextField label="Footer LinkedIn link label" value={content.footer.linkedinLabel} onChange={(value) => setContent((current) => ({ ...current, footer: { ...current.footer, linkedinLabel: value } }))} />
              <TextField label="Footer Instagram link label" value={content.footer.instagramLabel} onChange={(value) => setContent((current) => ({ ...current, footer: { ...current.footer, instagramLabel: value } }))} />
            </div>
          </details>

          <details className="site-content-group">
            <summary>Search preview (SEO)</summary>
            <div className="admin-form admin-grid site-content-fields">
              <TextField label="Page title" value={content.seo.title} onChange={(value) => setContent((current) => ({ ...current, seo: { ...current.seo, title: value } }))} />
              <TextField label="Search description" multiline value={content.seo.description} onChange={(value) => setContent((current) => ({ ...current, seo: { ...current.seo, description: value } }))} />
            </div>
          </details>

          <details className="site-content-group">
            <summary>Projects archive page</summary>
            <div className="admin-form admin-grid site-content-fields">
              <TextField label="Eyebrow" value={content.projectsArchive.eyebrow} onChange={(value) => setContent((current) => ({ ...current, projectsArchive: { ...current.projectsArchive, eyebrow: value } }))} />
              <TextField label="Heading" value={content.projectsArchive.title} onChange={(value) => setContent((current) => ({ ...current, projectsArchive: { ...current.projectsArchive, title: value } }))} />
              <TextField label="Description" multiline value={content.projectsArchive.intro} onChange={(value) => setContent((current) => ({ ...current, projectsArchive: { ...current.projectsArchive, intro: value } }))} />
              <TextField label="Back link label" value={content.projectsArchive.backLabel} onChange={(value) => setContent((current) => ({ ...current, projectsArchive: { ...current.projectsArchive, backLabel: value } }))} />
            </div>
          </details>

          <details className="site-content-group">
            <summary>Project case study labels</summary>
            <div className="admin-form admin-grid site-content-fields">
              {(Object.keys(content.projectDetail) as Array<keyof SiteContent["projectDetail"]>).map((key) => (
                <TextField key={key} label={labelForKey(key)} value={content.projectDetail[key]} onChange={(value) => setContent((current) => ({ ...current, projectDetail: { ...current.projectDetail, [key]: value } }))} />
              ))}
            </div>
          </details>

          <div className="admin-actions site-content-save">
            <button className="btn btn-primary" type="button" disabled={saving} onClick={() => void save()}>{saving ? "Saving…" : "Save all site content"}</button>
            {status ? <span className="admin-review-status" role="status">{status}</span> : null}
          </div>
        </>
      ) : null}
    </section>
  );
}

function TextField({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  return (
    <label>
      <span>{label}</span>
      {multiline
        ? <textarea value={value} onChange={(event) => onChange(event.target.value)} />
        : <input value={value} onChange={(event) => onChange(event.target.value)} />}
    </label>
  );
}

function ImageUrlField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("image", file);
    formData.append("context", "site");
    try {
      const response = await fetch("/api/admin/project-image", { method: "POST", body: formData });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message = result && typeof result === "object" && "error" in result ? String(result.error) : "Image upload failed.";
        throw new Error(message);
      }
      if (!result || typeof result !== "object" || !("url" in result) || typeof result.url !== "string") {
        throw new Error("Image upload returned an invalid response.");
      }
      onChange(result.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="admin-image-field">
      <label>{label} URL</label>
      <input type="url" value={value} onChange={(event) => onChange(event.target.value)} placeholder="https://… or /assets/images/…" />
      <span className="admin-muted">Paste an image URL or upload a JPG, PNG, or WebP image (max 5 MB).</span>
      <label className="admin-upload-label">
        <span>{uploading ? "Uploading…" : `Upload ${label.toLowerCase()}`}</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(event) => { void upload(event.target.files?.[0]); event.currentTarget.value = ""; }} />
      </label>
      {error ? <span className="admin-review-status" role="alert">{error}</span> : null}
      {value ? <img className="admin-image-preview" src={value} alt={`${label} preview`} /> : null}
    </div>
  );
}

function splitLines(value: string) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

function labelForKey(key: keyof SiteContent["projectDetail"]) {
  return key.replace(/([A-Z])/g, " $1").replace(/Label|Title/g, (match) => ` ${match.toLowerCase()}`).trim();
}
