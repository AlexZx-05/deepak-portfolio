import type { SiteContent, SkillContent } from "../lib/content";

export default function WorkProcessSection({ skills, about }: { skills: SkillContent[]; about: SiteContent["about"] }) {
  const highlightedPhrase = "make software feel effortless.";
  const phraseStart = about.title.toLowerCase().lastIndexOf(highlightedPhrase);
  const title = phraseStart >= 0
    ? <>
        {about.title.slice(0, phraseStart)}
        <span className="work-process-heading-highlight">{about.title.slice(phraseStart)}</span>
      </>
    : about.title;

  return (
    <section className="section about-section work-process-section" id="about">
      <div className="container">
        <header className="work-process-heading">
          <p className="eyebrow">{about.eyebrow}</p>
          <h2>{title}</h2>
          <p>{about.copy}</p>
        </header>

        <div className="work-process-grid">
          {about.steps.map((step, index) => (
            <article className="work-process-step" key={`${step.title}-${index}`}>
              <div className={`process-illustration process-illustration-${["discover", "design", "build"][index] || "build"}`}>
                <img src={step.image} alt={step.imageAlt} loading="lazy" decoding="async" />
              </div>
              <div className="work-process-step-heading">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
              </div>
              <p>{step.description}</p>
            </article>
          ))}
        </div>

        <div className="work-process-cta">
          <a className="btn btn-primary" href={about.ctaHref}>{about.ctaLabel} <span aria-hidden="true">↗</span></a>
        </div>

        {skills.length ? (
          <div className="work-process-skills" aria-label="Areas of expertise">
            <span>Also bringing</span>
            {skills.map((skill) => <span className="work-process-skill" key={skill.id}>{skill.name}</span>)}
          </div>
        ) : null}
      </div>
    </section>
  );
}
