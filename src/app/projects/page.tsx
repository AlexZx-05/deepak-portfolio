import Link from "next/link";
import Navbar from "../../components/Navbar";
import ProjectGrid from "../../components/ProjectGrid";
import { getPortfolioContent } from "../../lib/content";

export const metadata = {
  title: "Projects | Deepak Sharma"
};

export default async function ProjectsPage() {
  const { projects, siteContent } = await getPortfolioContent();

  return (
    <>
      <Navbar navigation={siteContent.navigation} sections={siteContent.sections} />
      <main className="projects-page">
        <section className="section projects-index-hero">
          <div className="container">
            <Link href="/#portfolio" className="back-link">← {siteContent.projectsArchive.backLabel}</Link>
            <p className="eyebrow">{siteContent.projectsArchive.eyebrow}</p>
            <h1>{siteContent.projectsArchive.title}</h1>
            <p className="section-intro">{siteContent.projectsArchive.intro}</p>
          </div>
        </section>
        <section className="section projects-index-grid">
          <div className="container"><ProjectGrid projects={projects} /></div>
        </section>
      </main>
    </>
  );
}
