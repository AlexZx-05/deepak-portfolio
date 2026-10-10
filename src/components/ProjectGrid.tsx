"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProjectContent } from "../lib/content";

export default function ProjectGrid({ projects }: { projects: ProjectContent[] }) {
  const [activeTag, setActiveTag] = useState("All");
  const tags = useMemo(() => ["All", ...Array.from(new Set(projects.flatMap((project) => project.tags)))], [projects]);
  const visibleProjects = activeTag === "All" ? projects : projects.filter((project) => project.tags.includes(activeTag));

  return (
    <>
      <div className="project-filter" aria-label="Project filters">
        {tags.map((tag) => (
          <button
            className={tag === activeTag ? "is-active" : ""}
            type="button"
            key={tag}
            onClick={() => setActiveTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      <div className="project-grid">
        {visibleProjects.map((project, index) => (
          <article className="project-card" key={project.id}>
            {project.image ? (
              <div className="project-visual project-image-visual">
                <img src={project.image} alt={`${project.title} project preview`} loading="lazy" decoding="async" />
                <span className="project-visual-index">{String(index + 1).padStart(2, "0")}</span>
              </div>
            ) : (
              <ProjectVisual className={project.visualClass} index={index} />
            )}
            <div className="project-card-title"><h3>{project.title}</h3></div>
            <p>{project.description || project.tags.join(" / ")}</p>
            {project.tags.length ? (
              <div className="project-tech-stack">
                <span className="project-tech-stack-label">Tech stack</span>
                <ul className="project-tech-tags" aria-label={`${project.title} technology stack`}>
                  {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
                </ul>
              </div>
            ) : null}
            {(project.why || project.problem || project.impact) ? (
              <details className="project-case-study">
                <summary>View case study <span aria-hidden="true">↗</span></summary>
                <div>
                  {project.why ? <p><strong>Why</strong>{project.why}</p> : null}
                  {project.problem ? <p><strong>Problem</strong>{project.problem}</p> : null}
                  {project.impact ? <p><strong>Outcome</strong>{project.impact}</p> : null}
                </div>
              </details>
            ) : null}
            <div className="project-links">
              <Link className="project-detail-link" href={`/projects/${encodeURIComponent(project.id)}`}>View project <span aria-hidden="true">→</span></Link>
              {project.liveUrl ? <a href={project.liveUrl} target="_blank" rel="noreferrer">Live site ↗</a> : null}
              {project.githubUrl ? <a href={project.githubUrl} target="_blank" rel="noreferrer">Source code ↗</a> : null}
            </div>
          </article>
        ))}
      </div>
      {!visibleProjects.length ? (
        <p className="projects-empty-state">Projects are being curated. Please check back soon.</p>
      ) : null}
    </>
  );
}

function ProjectVisual({ className, index }: { className: string; index: number }) {
  const visualClass = className || ["dashboard-preview", "agency-preview", "product-preview", "social-preview"][index % 4];

  if (visualClass === "agency-preview") {
    return (
      <div className="project-visual agency-preview">
        <strong>Digital products<br />that earn trust</strong>
        <small>Strategy / Design / Engineering</small>
      </div>
    );
  }

  if (visualClass === "product-preview") {
    return <div className="project-visual product-preview"><span></span></div>;
  }

  if (visualClass === "social-preview") {
    return <div className="project-visual social-preview"><span></span><span></span></div>;
  }

  return <div className="project-visual dashboard-preview"><span></span><span></span><span></span><span></span></div>;
}
