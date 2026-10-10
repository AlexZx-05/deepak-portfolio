import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { getPortfolioContent, getPortfolioProject } from "../../../lib/content";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ siteContent }, project] = await Promise.all([
    getPortfolioContent(),
    getPortfolioProject(decodeURIComponent(id))
  ]);
  const labels = siteContent.projectDetail;

  if (!project) notFound();

  return (
    <>
      <Navbar navigation={siteContent.navigation} sections={siteContent.sections} />
      <main className="project-detail-page">
        <section className="project-detail-hero">
          <div className="container">
            <Link href="/projects" className="back-link">← {labels.backLabel}</Link>
            <div className="project-detail-hero-grid">
              <div>
                {project.featured ? <p className="project-pin">{labels.pinnedLabel}</p> : null}
                <p className="eyebrow">{labels.caseStudyLabel}</p>
                <h1>{project.title}</h1>
                <p className="project-detail-lead">{project.description}</p>
                <div className="project-detail-actions">
                  {project.liveUrl ? <a className="btn btn-primary" href={project.liveUrl} target="_blank" rel="noreferrer">{labels.liveLabel} ↗</a> : null}
                  {project.githubUrl ? <a className="btn btn-secondary" href={project.githubUrl} target="_blank" rel="noreferrer">{labels.sourceLabel} ↗</a> : null}
                  {project.docsUrl ? <a className="btn btn-secondary" href={project.docsUrl} target="_blank" rel="noreferrer">{labels.docsLabel} ↗</a> : null}
                </div>
              </div>
              {project.image ? <img className="project-detail-image" src={project.image} alt={`${project.title} preview`} /> : <div className={`project-detail-art ${project.visualClass}`} aria-hidden="true"><span /><span /><span /></div>}
            </div>
          </div>
        </section>

        <section className="section project-story">
          <div className="container project-story-grid">
            <aside className="project-story-meta"><p>{labels.snapshotLabel}</p><div>{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></aside>
            <div className="project-story-content">
              {project.overview ? <article><p className="eyebrow">{labels.overviewLabel}</p><h2>{labels.overviewTitle}</h2><p>{project.overview}</p></article> : null}
              {project.why ? <article><p className="eyebrow">{labels.reasonLabel}</p><h2>{labels.reasonTitle}</h2><p>{project.why}</p></article> : null}
              {project.problem ? <article><p className="eyebrow">{labels.challengeLabel}</p><h2>{labels.challengeTitle}</h2><p>{project.problem}</p></article> : null}
              {project.solution ? <article><p className="eyebrow">{labels.approachLabel}</p><h2>{labels.approachTitle}</h2><p>{project.solution}</p></article> : null}
              {project.features.length ? <article><p className="eyebrow">{labels.capabilitiesLabel}</p><h2>{labels.capabilitiesTitle}</h2><ul className="project-feature-list">{project.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></article> : null}
              {project.impact ? <article><p className="eyebrow">{labels.resultLabel}</p><h2>{labels.resultTitle}</h2><p>{project.impact}</p></article> : null}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
