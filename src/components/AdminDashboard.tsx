"use client";

import { FormEvent, useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import SiteContentEditor from "./SiteContentEditor";
import GitHubProjectImporter, { portfolioProjectsUpdatedEvent } from "./GitHubProjectImporter";

type Item = Record<string, string | number | boolean | undefined> & { id?: string };

const sections = [
  { id: "site-content", label: "Site content" },
  { id: "hero", label: "Hero Text" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "availability", label: "Availability" },
  { id: "messages", label: "Messages" },
  { id: "testimonials", label: "Testimonials" },
  { id: "ai", label: "AI Prompt" },
  { id: "github", label: "GitHub" },
  { id: "socials", label: "Social profiles" },
  { id: "analytics", label: "Analytics" },
  { id: "resume", label: "Resume PDF" }
];

export default function AdminDashboard() {
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const syncActiveSection = () => {
      const section = window.location.hash.slice(1);
      if (sections.some((item) => item.id === section)) setActive(section);
    };
    syncActiveSection();
    window.addEventListener("hashchange", syncActiveSection);
    return () => window.removeEventListener("hashchange", syncActiveSection);
  }, []);

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/admin" aria-label="Portfolio Admin home">
          <span className="admin-brand-mark">DS</span>
          <span className="admin-brand-copy"><strong>Portfolio Admin</strong><small>Content workspace</small></span>
        </a>
        <p className="admin-nav-label">WORKSPACE</p>
        <nav className="admin-nav" aria-label="Admin sections">
          {sections.map((section) => (
            <a
              className={active === section.id ? "is-active" : ""}
              href={`#${section.id}`}
              key={section.id}
              aria-current={active === section.id ? "page" : undefined}
              onClick={() => setActive(section.id)}
            >
              {section.label}
            </a>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <a className="admin-view-site" href="/" target="_blank" rel="noreferrer">View portfolio <span aria-hidden="true">↗</span></a>
          <button className="admin-link-button" type="button" onClick={() => signOut({ callbackUrl: "/admin/login" })}>
            Sign out
          </button>
        </div>
      </aside>
      <section className="admin-main">
        <header className="admin-page-heading">
          <div>
            <p className="eyebrow">ADMIN WORKSPACE</p>
            <h1>Portfolio dashboard</h1>
            <p className="admin-muted">Manage your website content, projects, and incoming feedback.</p>
          </div>
          <span className="admin-session-badge"><span aria-hidden="true"></span> Admin session</span>
        </header>
        {active === "hero" ? <HeroEditor /> : null}
        {active === "site-content" ? <SiteContentEditor /> : null}
        {active === "projects" ? <><GitHubProjectImporter /><CollectionEditor type="projects" fields={["title", "description", "overview", "why", "problem", "solution", "impact", "features", "image", "tags", "liveUrl", "githubUrl", "docsUrl", "visualClass", "featured", "visible", "order"]} /></> : null}
        {active === "skills" ? <CollectionEditor type="skills" fields={["name", "level", "order"]} /> : null}
        {active === "experience" ? <CollectionEditor type="experience" fields={["role", "company", "period", "description", "order"]} /> : null}
        {active === "availability" ? <AvailabilityEditor /> : null}
        {active === "messages" ? <MessageInbox /> : null}
        {active === "testimonials" ? <TestimonialModeration /> : null}
        {active === "ai" ? <SettingEditor settingKey="aiPrompt" title="AI System Prompt" fields={["prompt"]} /> : null}
        {active === "github" ? <SettingEditor settingKey="github" title="GitHub Settings" fields={["username"]} /> : null}
        {active === "socials" ? <SettingEditor settingKey="socials" title="Social Profiles" fields={["github", "linkedin", "whatsapp", "instagram", "email"]} /> : null}
        {active === "analytics" ? <AnalyticsPanel /> : null}
        {active === "resume" ? <ResumeUpload /> : null}
      </section>
    </main>
  );
}

function TestimonialModeration() {
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadTestimonials() {
    const response = await fetch("/api/admin/testimonials");
    const result = await response.json();
    if (!response.ok) throw new Error(String(result.error || "Could not load testimonials."));
    setItems(result);
  }

  useEffect(() => {
    loadTestimonials()
      .catch((error: Error) => setStatus(error.message))
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(item: Item, nextStatus: "approved" | "rejected") {
    setStatus("");
    try {
      const response = await fetch("/api/admin/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, status: nextStatus })
      });
      const result = await response.json();
      if (!response.ok) {
        setStatus(String(result.error || "Could not update testimonial."));
        return;
      }

      setItems((current) => current.map((currentItem) => (
        currentItem.id === item.id ? { ...currentItem, status: nextStatus } : currentItem
      )));
      setStatus(nextStatus === "approved" ? "Testimonial approved and now public." : "Testimonial rejected and hidden.");
    } catch {
      setStatus("Could not update testimonial. Check your connection and try again.");
    }
  }

  async function remove(id?: string) {
    if (!id) return;
    try {
      const response = await fetch(`/api/admin/testimonials?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) {
        setStatus(String(result.error || "Could not delete testimonial."));
        return;
      }

      setItems((current) => current.filter((item) => item.id !== id));
      setStatus("Testimonial deleted.");
    } catch {
      setStatus("Could not delete testimonial. Check your connection and try again.");
    }
  }

  return (
    <section className="admin-section" id="testimonials">
      <div className="admin-section-heading">
        <div>
          <h2>Testimonials</h2>
          <p className="admin-muted">Review submissions before they appear publicly. Rejected testimonials stay private.</p>
        </div>
        <span className="admin-review-count">{items.filter((item) => item.status === "pending").length} awaiting review</span>
      </div>
      {loading ? <p className="admin-muted">Loading testimonials...</p> : null}
      {!loading && !items.length ? <p className="admin-muted">No testimonial submissions yet.</p> : null}
      {status ? <p className="admin-review-status" role="status">{status}</p> : null}
      <div className="admin-testimonial-list">
        {items.map((item) => (
          <article className="admin-testimonial-card" key={item.id}>
            <div className="admin-testimonial-top">
              <div>
                <strong>{String(item.name || "Unnamed")}</strong>
                {item.role ? <span>{String(item.role)}</span> : null}
              </div>
              <span className={`admin-testimonial-state is-${String(item.status || "pending")}`}>{String(item.status || "pending")}</span>
            </div>
            <div className="admin-testimonial-rating" aria-label={`${Number(item.rating) || 0} out of 5 stars`}>
              {"★".repeat(Math.max(0, Math.min(5, Number(item.rating) || 0)))}
            </div>
            <p>{String(item.content || "")}</p>
            <div className="admin-actions">
              {item.status !== "approved" ? <button className="btn btn-primary compact" type="button" onClick={() => updateStatus(item, "approved")}>Approve & publish</button> : null}
              {item.status !== "rejected" ? <button className="btn btn-secondary compact" type="button" onClick={() => updateStatus(item, "rejected")}>{item.status === "approved" ? "Hide" : "Reject"}</button> : null}
              <button className="btn btn-secondary compact" type="button" onClick={() => remove(item.id)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function HeroEditor() {
  const [status, setStatus] = useState("");
  const [hero, setHero] = useState<Item>({});

  useEffect(() => {
    fetch("/api/admin/hero").then((res) => res.json()).then(setHero).catch(() => setStatus("Could not load hero."));
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/admin/hero", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    setStatus(response.ok ? "Hero saved." : "Hero save failed.");
  }

  return (
    <section className="admin-section" id="hero">
      <h2>Hero Text</h2>
      <form className="admin-form admin-grid" onSubmit={onSubmit}>
        <label><span>Eyebrow</span><input name="eyebrow" defaultValue={String(hero.eyebrow ?? "Hello, I'm")} /></label>
        <label><span>Name</span><input name="name" defaultValue={String(hero.name ?? "Deepak Sharma")} /></label>
        <label><span>Role line</span><input name="role" defaultValue={String(hero.role ?? "Designer | Content Creator | Visual Storyteller")} /></label>
        <label><span>Primary CTA</span><input name="primaryCta" defaultValue={String(hero.primaryCta ?? "View My Work")} /></label>
        <label style={{ gridColumn: "1 / -1" }}><span>Intro copy</span><textarea name="copy" defaultValue={String(hero.copy ?? "")}></textarea></label>
        <div className="admin-actions"><button className="btn btn-primary" type="submit">Save Hero</button><span className="admin-muted">{status}</span></div>
      </form>
    </section>
  );
}

function AvailabilityEditor() {
  const [status, setStatus] = useState("");
  const [availability, setAvailability] = useState<Item>({});

  useEffect(() => {
    fetch("/api/admin/availability").then((res) => res.json()).then(setAvailability).catch(() => setStatus("Could not load availability."));
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/admin/availability", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, visible: data.visible === "on" })
    });
    setStatus(response.ok ? "Availability saved." : "Availability save failed.");
  }

  return (
    <section className="admin-section" id="availability">
      <h2>Availability Badge</h2>
      <form className="admin-form" onSubmit={onSubmit}>
        <label><span>Badge text</span><input name="text" defaultValue={String(availability.text ?? "Available for work")} /></label>
        <label><span>Status</span><select name="status" defaultValue={String(availability.status ?? "available")}><option value="available">Available</option><option value="busy">Busy</option><option value="hidden">Hidden</option></select></label>
        <label><span><input name="visible" type="checkbox" defaultChecked={availability.visible !== false} /> Show badge</span></label>
        <div className="admin-actions"><button className="btn btn-primary" type="submit">Save Availability</button><span className="admin-muted">{status}</span></div>
      </form>
    </section>
  );
}

function CollectionEditor({ type, fields }: { type: string; fields: string[] }) {
  const [items, setItems] = useState<Item[]>([]);
  const [editing, setEditing] = useState<Item | null>(null);
  const [status, setStatus] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  async function loadItems() {
    const response = await fetch(`/api/admin/${type}`);
    setItems(await response.json());
  }

  useEffect(() => {
    const refreshItems = () => {
      loadItems().catch(() => setStatus(`Could not load ${type}.`));
    };
    refreshItems();
    window.addEventListener(portfolioProjectsUpdatedEvent, refreshItems);
    return () => window.removeEventListener(portfolioProjectsUpdatedEvent, refreshItems);
  }, [type]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = Object.fromEntries(new FormData(form));
    delete formData.imageUrl;
    const payload = { ...formData, ...(type === "projects" ? { image: imageUrl } : {}), id: editing?.id };
    const response = await fetch(`/api/admin/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    setStatus(response.ok ? "Saved." : String(result.error || "Save failed."));
    if (response.ok) {
      form.reset();
      setEditing(null);
      setImageUrl("");
      await loadItems();
    }
  }

  async function uploadProjectImage(file?: File) {
    if (!file) return;
    setUploadingImage(true);
    setStatus("Uploading image...");

    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await fetch("/api/admin/project-image", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok) {
        setStatus(String(result.error || "Image upload failed."));
        return;
      }
      setImageUrl(String(result.url));
      setStatus("Image uploaded. Save the project to publish it.");
    } catch {
      setStatus("Image upload failed. Check your connection and try again.");
    } finally {
      setUploadingImage(false);
    }
  }

  function startEditing(item: Item) {
    setEditing(item);
    setImageUrl(String(item.image || ""));
    setStatus("");
  }

  function cancelEditing() {
    setEditing(null);
    setImageUrl("");
    setStatus("");
  }

  async function remove(id?: string) {
    if (!id) return;
    const response = await fetch(`/api/admin/${type}?id=${id}`, { method: "DELETE" });
    setStatus(response.ok ? "Deleted." : "Delete failed.");
    if (response.ok) await loadItems();
  }

  return (
    <section className="admin-section" id={type}>
      <h2>{type[0].toUpperCase() + type.slice(1)}</h2>
      {type === "projects" ? <p className="admin-muted">GitHub imports arrive as hidden drafts. Review the generated copy, add a cover image if needed, then use the GitHub controls above to publish or pin the project.</p> : null}
      <form className="admin-form admin-grid" onSubmit={onSubmit}>
        {fields.map((field) => field === "image" && type === "projects" ? (
          <div className="admin-image-field" key={`${editing?.id ?? "new"}-${field}`}>
            <label htmlFor="project-image-url">Project cover image URL</label>
            <input
              id="project-image-url"
              name="imageUrl"
              type="url"
              value={imageUrl.startsWith("data:") ? "" : imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://..."
            />
            <span className="admin-muted">Or upload a JPG, PNG, or WebP image (max 5 MB). Uploads require Cloudinary credentials in .env.local.</span>
            <label className="admin-upload-label">
              <span>{uploadingImage ? "Uploading..." : "Choose project image"}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploadingImage}
                onChange={(event) => {
                  void uploadProjectImage(event.target.files?.[0]);
                  event.currentTarget.value = "";
                }}
              />
            </label>
            {imageUrl ? <img className="admin-image-preview" src={imageUrl} alt="Project cover preview" /> : null}
          </div>
        ) : (
          <label key={`${editing?.id ?? "new"}-${field}`}>
            <span>{projectFieldLabel(field)}</span>
            {["description", "overview", "why", "problem", "solution", "impact"].includes(field) ? <textarea name={field} defaultValue={String(editing?.[field] ?? "")}></textarea> : null}
            {["featured", "visible"].includes(field) ? <><input type="hidden" name={field} value="false" /><input name={field} type="checkbox" value="true" defaultChecked={field === "featured" ? editing?.featured === true : editing?.visible !== false} /></> : null}
            {!(["description", "overview", "why", "problem", "solution", "impact", "featured", "visible"].includes(field)) ? <input name={field} defaultValue={Array.isArray(editing?.[field]) ? (editing?.[field] as string[]).join(", ") : String(editing?.[field] ?? "")} /> : null}
          </label>
        ))}
        <div className="admin-actions">
          <button className="btn btn-primary" type="submit">{editing ? "Update" : "Add"}</button>
          {editing ? <button className="btn btn-secondary" type="button" onClick={cancelEditing}>Cancel</button> : null}
          <span className="admin-muted">{status}</span>
        </div>
      </form>
      <div className={type === "projects" ? "admin-list admin-project-list" : "admin-list"}>
        {items.map((item) => (
          <article className={type === "projects" ? "admin-project-list-item" : ""} key={item.id}>
            {type === "projects" ? (
              <>
                {item.image ? <img className="admin-project-thumb" src={String(item.image)} alt="" /> : <div className="admin-project-thumb admin-project-thumb-empty" aria-hidden="true">PROJECT</div>}
                <div className="admin-project-list-content">
                  <div className="admin-project-list-title">
                    <strong>{String(item.title ?? "Untitled project")}</strong>
                    {item.visible === false ? <span className="github-import-state">Hidden draft</span> : <span className="admin-project-published">Published</span>}
                    {item.featured === true ? <span className="admin-project-featured">Homepage feature</span> : null}
                  </div>
                  <p className="admin-muted">{String(item.description ?? item.tags ?? "")}</p>
                  <div className="admin-project-list-meta">
                    {item.githubFullName ? <span>GitHub · {String(item.githubFullName)}</span> : <span>Manual project</span>}
                    {item.aiDrafted === true ? <span>AI-generated README draft</span> : null}
                    {Array.isArray(item.tags) ? <span>{(item.tags as string[]).slice(0, 3).join(" · ")}</span> : null}
                  </div>
                </div>
                <div className="admin-actions admin-project-list-actions">
                  <button className="btn btn-secondary compact" type="button" onClick={() => startEditing(item)}>Edit details</button>
                  <button className="btn btn-secondary compact" type="button" onClick={() => remove(item.id)}>Delete</button>
                </div>
              </>
            ) : (
              <>
                <strong>{String(item.title ?? item.name ?? item.role ?? "Untitled")}</strong>
                <p className="admin-muted">{String(item.description ?? item.company ?? item.tags ?? "")}</p>
                <div className="admin-actions">
                  <button className="btn btn-secondary compact" type="button" onClick={() => startEditing(item)}>Edit</button>
                  <button className="btn btn-secondary compact" type="button" onClick={() => remove(item.id)}>Delete</button>
                </div>
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function projectFieldLabel(field: string) {
  const labels: Record<string, string> = {
    title: "Project title",
    description: "Short project description",
    why: "Why did you build this?",
    problem: "Problem it solves",
    solution: "How the solution works",
    impact: "Outcome / impact",
    overview: "Full project overview",
    features: "Key features (comma separated)",
    tags: "Technology tags (comma separated)",
    docsUrl: "Documentation URL",
    liveUrl: "Live hosting URL",
    githubUrl: "GitHub repository URL",
    featured: "Pin to selected work"
  };
  return labels[field] || field;
}

function MessageInbox() {
  const [messages, setMessages] = useState<Item[]>([]);
  const [status, setStatus] = useState("");

  async function loadMessages() {
    const response = await fetch("/api/admin/messages");
    setMessages(await response.json());
  }

  useEffect(() => {
    loadMessages().catch(() => setStatus("Could not load messages."));
  }, []);

  async function toggleRead(message: Item) {
    const response = await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: message.id, read: !message.read })
    });
    setStatus(response.ok ? "Message updated." : "Update failed.");
    if (response.ok) await loadMessages();
  }

  async function remove(id?: string) {
    if (!id) return;
    const response = await fetch(`/api/admin/messages?id=${id}`, { method: "DELETE" });
    setStatus(response.ok ? "Message deleted." : "Delete failed.");
    if (response.ok) await loadMessages();
  }

  return (
    <section className="admin-section" id="messages">
      <h2>Messages</h2>
      <p className="admin-muted">{status}</p>
      <div className="admin-list">
        {messages.map((message) => (
          <article key={message.id}>
            <strong>{String(message.name ?? "Unknown")} {message.read ? "" : "(Unread)"}</strong>
            <p className="admin-muted">{String(message.email ?? "")}</p>
            <p>{String(message.message ?? "")}</p>
            <div className="admin-actions">
              <button className="btn btn-secondary compact" type="button" onClick={() => toggleRead(message)}>
                {message.read ? "Mark unread" : "Mark read"}
              </button>
              <button className="btn btn-secondary compact" type="button" onClick={() => remove(message.id)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SettingEditor({ settingKey, title, fields }: { settingKey: string; title: string; fields: string[] }) {
  const [setting, setSetting] = useState<Item>({});
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch(`/api/admin/settings?key=${settingKey}`).then((response) => response.json()).then(setSetting).catch(() => setStatus("Could not load settings."));
  }, [settingKey]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, key: settingKey })
    });
    setStatus(response.ok ? "Settings saved." : "Settings save failed.");
  }

  return (
    <section className="admin-section" id={settingKey}>
      <h2>{title}</h2>
      <form className="admin-form" onSubmit={onSubmit}>
        {fields.map((field) => (
          <label key={field}>
            <span>{field}</span>
            {field === "prompt" ? <textarea name={field} defaultValue={String(setting[field] ?? "")}></textarea> : <input name={field} defaultValue={String(setting[field] ?? "")} />}
          </label>
        ))}
        <div className="admin-actions"><button className="btn btn-primary" type="submit">Save Settings</button><span className="admin-muted">{status}</span></div>
      </form>
    </section>
  );
}

function AnalyticsPanel() {
  const [analytics, setAnalytics] = useState<{ totalVisits: number; topSections: Item[]; countries: Item[] } | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/admin/analytics").then((response) => response.json()).then(setAnalytics).catch(() => setStatus("Could not load analytics."));
  }, []);

  return (
    <section className="admin-section" id="analytics">
      <h2>Analytics</h2>
      <p className="admin-muted">{status}</p>
      <div className="admin-grid">
        <article>
          <h3>Total visits</h3>
          <strong>{analytics?.totalVisits ?? 0}</strong>
        </article>
        <article>
          <h3>Top sections</h3>
          <div className="admin-list">
            {(analytics?.topSections ?? []).map((section) => <p key={String(section.name)}>{String(section.name)}: {String(section.count)}</p>)}
          </div>
        </article>
        <article>
          <h3>Countries</h3>
          <div className="admin-list">
            {(analytics?.countries ?? []).map((country) => <p key={String(country.name)}>{String(country.name)}: {String(country.count)}</p>)}
          </div>
        </article>
      </div>
    </section>
  );
}

function ResumeUpload() {
  const [status, setStatus] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/resume", { method: "POST", body: formData });
    setStatus(response.ok ? "Resume uploaded." : "Resume upload failed.");
  }

  return (
    <section className="admin-section" id="resume">
      <h2>Resume PDF</h2>
      <form className="admin-form" onSubmit={onSubmit}>
        <label><span>PDF file</span><input name="resume" type="file" accept="application/pdf" required /></label>
        <div className="admin-actions"><button className="btn btn-primary" type="submit">Upload Resume</button><span className="admin-muted">{status}</span></div>
      </form>
    </section>
  );
}
