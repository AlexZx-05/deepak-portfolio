"use client";

import { useCallback, useEffect, useState } from "react";

export const portfolioProjectsUpdatedEvent = "portfolio-projects-updated";

type ImportedState = { id: string; visible: boolean; featured: boolean; aiDrafted: boolean; importedAt: string };
type Repository = {
  id: number;
  name: string;
  fullName: string;
  url: string;
  description: string;
  homepage: string;
  stars: number;
  language: string;
  topics: string[];
  updatedAt: string;
  imported: ImportedState | null;
  selectedVisible: boolean;
  selectedFeatured: boolean;
};

type RepositoryResponse = { username: string; repositories: Array<Omit<Repository, "selectedVisible" | "selectedFeatured">> };

export default function GitHubProjectImporter() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "available" | "drafts" | "published">("all");

  const loadRepositories = useCallback(async () => {
    setLoading(true);
    setStatus("");
    try {
      const response = await fetch("/api/admin/github-projects", { cache: "no-store" });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message = result && typeof result === "object" && "error" in result ? String(result.error) : "Could not load GitHub repositories.";
        throw new Error(message);
      }
      const data = result as RepositoryResponse;
      setUsername(data.username);
      setRepositories(data.repositories.map((repository) => ({
        ...repository,
        selectedVisible: repository.imported?.visible ?? true,
        selectedFeatured: repository.imported?.featured ?? false
      })));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load GitHub repositories.");
    } finally {
      setLoading(false);
    }
  }, []);

  const importedCount = repositories.filter((repository) => repository.imported).length;
  const publishedCount = repositories.filter((repository) => repository.imported?.visible).length;
  const draftCount = importedCount - publishedCount;
  const visibleRepositories = repositories.filter((repository) => {
    const matchesSearch = `${repository.fullName} ${repository.description} ${repository.language} ${repository.topics.join(" ")}`
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    const matchesFilter = filter === "all"
      || (filter === "available" && !repository.imported)
      || (filter === "drafts" && repository.imported && !repository.imported.visible)
      || (filter === "published" && repository.imported?.visible);
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    void loadRepositories();
  }, [loadRepositories]);

  async function saveVisibility(repository: Repository, visible: boolean, featured: boolean) {
    setBusyId(repository.id);
    setStatus("");
    try {
      const response = await fetch("/api/admin/github-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "visibility", repoId: repository.id, visible, featured })
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message = result && typeof result === "object" && "error" in result ? String(result.error) : "Could not update project visibility.";
        throw new Error(message);
      }
      setRepositories((current) => current.map((item) => item.id === repository.id
        ? { ...item, selectedVisible: visible, selectedFeatured: visible && featured, imported: item.imported ? { ...item.imported, visible, featured: visible && featured } : null }
        : item));
      window.dispatchEvent(new Event(portfolioProjectsUpdatedEvent));
      setStatus(`Updated visibility for ${repository.name}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not update project visibility.");
    } finally {
      setBusyId(null);
    }
  }

  async function importRepository(repository: Repository) {
    setBusyId(repository.id);
    setStatus("");
    try {
      const response = await fetch("/api/admin/github-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "import",
          fullName: repository.fullName
        })
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message = result && typeof result === "object" && "error" in result ? String(result.error) : "Could not import repository.";
        throw new Error(message);
      }
      const imported = result as { id: string; aiDrafted: boolean; visible: boolean; featured: boolean; importedAt: string; summaryWarning?: string };
      setRepositories((current) => current.map((item) => item.id === repository.id
        ? { ...item, selectedVisible: imported.visible, selectedFeatured: imported.featured, imported: { id: imported.id, visible: imported.visible, featured: imported.featured, aiDrafted: imported.aiDrafted, importedAt: imported.importedAt } }
        : item));
      window.dispatchEvent(new Event(portfolioProjectsUpdatedEvent));
      setStatus(imported.summaryWarning
        ? `${repository.name} imported as a hidden draft. ${imported.summaryWarning} Review it in the Projects editor below.`
        : imported.aiDrafted
          ? `${repository.name} imported as a hidden draft with AI-generated project content. Review the fields in the Projects editor below before publishing.`
          : `${repository.name} imported as a hidden draft. Review it in the Projects editor below before publishing.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not import repository. Check the GitHub and Groq settings.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="admin-section github-project-importer" id="github-projects">
      <div className="github-manager-heading">
        <div>
          <p className="admin-section-kicker">PROJECT SOURCES</p>
          <h2>GitHub project manager</h2>
          <p className="admin-muted">Choose repositories to prepare for your portfolio. New imports stay private until you review and publish them.</p>
        </div>
        <div className="github-manager-actions">
          {username ? <span className="github-account-pill"><span aria-hidden="true">●</span> {username}</span> : null}
          <button className="btn btn-secondary compact" type="button" disabled={loading} onClick={() => void loadRepositories()}>
            {loading ? "Refreshing…" : "Refresh repositories"}
          </button>
        </div>
      </div>
      <div className="github-manager-summary">
        <div><span>Repositories</span><strong>{repositories.length}</strong></div>
        <div><span>Imported</span><strong>{importedCount}</strong></div>
        <div><span>Drafts to review</span><strong>{draftCount}</strong></div>
        <div><span>Published</span><strong>{publishedCount}</strong></div>
      </div>
      <div className="github-manager-toolbar">
        <label className="github-search">
          <span className="sr-only">Search repositories</span>
          <span aria-hidden="true">⌕</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search repositories, language, or topic" />
        </label>
        <div className="github-filter-tabs" aria-label="Filter repositories">
          {([
            ["all", "All"],
            ["available", "Not imported"],
            ["drafts", "Drafts"],
            ["published", "Published"]
          ] as const).map(([value, label]) => (
            <button type="button" className={filter === value ? "is-active" : ""} key={value} onClick={() => setFilter(value)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <p className="github-manager-hint">Import a repository to generate editable copy from its README. Check the preview in Projects, add a cover image if needed, then publish or feature it.</p>
      {status ? <p className="admin-review-status github-manager-status" role="status">{status}</p> : null}
      {loading ? <div className="github-manager-empty"><span className="admin-loading-dot"></span><p>Loading public repositories from GitHub…</p></div> : null}
      {!loading && !repositories.length && !status ? <div className="github-manager-empty"><strong>No public repositories found</strong><p>Check the account name in GitHub settings, then refresh the list.</p></div> : null}
      {!loading && repositories.length > 0 && !visibleRepositories.length ? <div className="github-manager-empty"><strong>No matching repositories</strong><p>Try another search or filter.</p></div> : null}
      <div className="github-import-list">
        {visibleRepositories.map((repository) => (
          <article className={`github-import-card${repository.imported?.visible ? " is-published" : repository.imported ? " is-draft" : ""}`} key={repository.id}>
            <div className="github-import-info">
              <div className="github-import-card-top">
                <div className="github-import-title">
                  <a href={repository.url} target="_blank" rel="noreferrer">{repository.name} <span aria-hidden="true">↗</span></a>
                  <span className="github-repo-owner">{repository.fullName.split("/")[0]}</span>
                </div>
                {repository.imported
                  ? <span className={`github-project-status${repository.imported.visible ? " is-published" : ""}`}><span aria-hidden="true"></span>{repository.imported.visible ? "Published" : "Draft · hidden"}</span>
                  : <span className="github-project-status is-available"><span aria-hidden="true"></span>Not imported</span>}
              </div>
              <p>{repository.description || "No repository description provided."}</p>
              <div className="github-import-meta">
                {repository.language ? <span><i className="github-meta-dot" />{repository.language}</span> : null}
                <span>★ {repository.stars} stars</span>
                <span>Updated {new Intl.DateTimeFormat(undefined, { month: "short", year: "numeric" }).format(new Date(repository.updatedAt))}</span>
                {repository.topics.slice(0, 4).map((topic) => <span key={topic}>{topic}</span>)}
              </div>
              {repository.imported ? (
                <div className="github-import-version">
                  <span>{repository.imported.aiDrafted ? "AI-generated README draft" : "GitHub metadata draft"}</span>
                  <span>Imported {new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(repository.imported.importedAt))}</span>
                  {repository.imported.featured ? <span>Homepage featured</span> : null}
                </div>
              ) : null}
            </div>
            <div className="github-import-controls">
              {repository.imported ? (
                <>
                  <label>
                    <input
                      type="checkbox"
                      checked={repository.selectedVisible}
                      disabled={busyId === repository.id}
                      onChange={(event) => void saveVisibility(repository, event.target.checked, event.target.checked && repository.selectedFeatured)}
                    />
                    <span>Show in projects</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={repository.selectedFeatured}
                      disabled={busyId === repository.id || !repository.selectedVisible}
                      onChange={(event) => void saveVisibility(repository, repository.selectedVisible, event.target.checked)}
                    />
                    <span>Pin to homepage</span>
                  </label>
                  <span className="github-control-caption">Changes save automatically</span>
                </>
              ) : (
                <>
                  <button className="btn btn-primary compact" type="button" disabled={busyId === repository.id} onClick={() => void importRepository(repository)}>
                    {busyId === repository.id ? "Preparing draft…" : "Import as draft"}
                  </button>
                  <span className="github-control-caption">Hidden until you publish</span>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
