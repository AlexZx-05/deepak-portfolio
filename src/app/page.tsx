import PortfolioNav from "../components/PortfolioNav";
import ProjectGrid from "../components/ProjectGrid";
import ContactForm from "../components/ContactForm";
import ChatWidget from "../components/ChatWidget";
import AnalyticsTracker from "../components/AnalyticsTracker";
import GitHubActivity from "../components/GitHubActivity";
import ServicesSection from "../components/ServicesSection";
import HeroSection from "../components/HeroSection";
import Navbar from "../components/Navbar";
import TestimonialSection from "../components/TestimonialSection";
import WorkProcessSection from "../components/WorkProcessSection";
import { getPortfolioContent } from "../lib/content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { hero, projects, skills, availability, socials, testimonials, siteContent } = await getPortfolioContent();
  const roleParts = hero.role.split("|").map((part: string) => part.trim()).filter(Boolean);
  const featuredProjects = projects.filter((project: any) => project.featured);

  return (
    <>
      <AnalyticsTracker />
      <PortfolioNav />
      <Navbar navigation={siteContent.navigation} sections={siteContent.sections} />
      <main>

        <HeroSection
          hero={{ ...hero, image: siteContent.heroImage }}
          heroCtaHref={siteContent.heroCtaHref}
          roleParts={roleParts}
          availability={availability}
          socials={socials}
        />

        {siteContent.sections.highlights ? <section className="proof-strip" aria-label="Professional highlights">
          <div className="container proof-grid">
            {siteContent.highlights.map((highlight, index) => <p key={`${highlight}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span>{highlight}</p>)}
          </div>
        </section> : null}

        {siteContent.sections.services ? <ServicesSection services={siteContent.services} /> : null}

        {siteContent.sections.portfolio ? <section className="section section-tight" id="portfolio">
          <div className="container">
            <div className="section-heading"><div><p className="eyebrow">{siteContent.portfolio.eyebrow}</p><h2>{siteContent.portfolio.title}</h2><p className="section-intro">{siteContent.portfolio.intro}</p></div><a className="text-link" href="/projects">{siteContent.portfolio.allProjectsLabel} <span aria-hidden="true">↗</span></a></div>
            <ProjectGrid projects={featuredProjects} />
          </div>
        </section> : null}
        {siteContent.sections.github ? <GitHubActivity content={siteContent.github} /> : null}
        {siteContent.sections.about ? <WorkProcessSection skills={skills} about={siteContent.about} /> : null}
        {siteContent.sections.testimonials ? <TestimonialSection testimonials={testimonials} content={siteContent.testimonials} /> : null}
        {siteContent.sections.contact ? <section className="section contact-section" id="contact"><div className="container contact-grid"><div><p className="eyebrow">{siteContent.contact.eyebrow}</p><h2>{siteContent.contact.title}</h2><p>{siteContent.contact.description}</p><div className="contact-socials" aria-label="Contact links"><SocialButton href={socials.github} label="GitHub" icon="github" /><SocialButton href={socials.linkedin} label="LinkedIn" icon="linkedin" /><SocialButton href={socials.whatsapp} label="WhatsApp" icon="whatsapp" /><SocialButton href={socials.instagram} label="Instagram" icon="instagram" /><SocialButton href={socials.email} label="Email me" icon="email" /></div></div><ContactForm /></div></section> : null}
      </main>
      <footer className="site-footer">
        <div className="container">
          <div className="site-footer-main">
            <a className="site-footer-brand" href="/#home">
              <span className="site-footer-monogram" aria-hidden="true">DS</span>
              <span>{siteContent.footer.name}<small>{siteContent.footer.subtitle}</small></span>
            </a>
            <nav className="site-footer-links" aria-label="Footer links">
              <a href={socials.email}>{siteContent.footer.emailLabel}<span aria-hidden="true">↗</span></a>
              <a href={socials.github} target="_blank" rel="noreferrer">{siteContent.footer.githubLabel}<span aria-hidden="true">↗</span></a>
              <a href={socials.linkedin} target="_blank" rel="noreferrer">{siteContent.footer.linkedinLabel}<span aria-hidden="true">↗</span></a>
              <a href={socials.instagram} target="_blank" rel="noreferrer">{siteContent.footer.instagramLabel}<span aria-hidden="true">↗</span></a>
            </nav>
          </div>
          <div className="site-footer-bottom">
            <p>{siteContent.footer.name} <span>© {new Date().getFullYear()}</span></p>
            <a href="#home">Back to top <span aria-hidden="true">↑</span></a>
          </div>
        </div>
      </footer>
      <ChatWidget />
    </>
  );
}

function SocialButton({ href, label, icon }: { href: string; label: string; icon: "github" | "linkedin" | "whatsapp" | "instagram" | "email" }) {
  const external = !href.startsWith("mailto:");
  return <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}><SocialIcon icon={icon} /><span>{label}</span><b aria-hidden="true">↗</b></a>;
}

function SocialIcon({ icon }: { icon: "github" | "linkedin" | "whatsapp" | "instagram" | "email" }) {
  if (icon === "github") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" /></svg>;
  if (icon === "linkedin") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10v7M8 7v.01M12 17v-7m0 3.5c0-2.3 1.3-3.5 3.2-3.5 1.9 0 2.8 1.2 2.8 3.5V17" /></svg>;
  if (icon === "whatsapp") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.7a8.4 8.4 0 0 1-12.4 7.4L3.5 20.5l1.4-4.4a8.4 8.4 0 1 1 15.6-4.4Z" /><path d="M8.5 8.3c.2-.5.4-.5.7-.5h.4c.2 0 .4.1.5.4l.7 1.5c.1.3.1.5-.1.7l-.5.6c.5 1 1.3 1.8 2.3 2.3l.6-.5c.2-.2.4-.2.7-.1l1.5.7c.3.1.4.3.4.5v.4c0 .3 0 .5-.5.7-.5.2-1.2.4-2 .1-2.8-1.1-4.6-2.9-5.7-5.7-.3-.8-.1-1.5.1-2Z" /></svg>;
  if (icon === "instagram") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.4" cy="6.6" r=".9" fill="currentColor" stroke="none" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>;
}
