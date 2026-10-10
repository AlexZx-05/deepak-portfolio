"use client";

import { useEffect, useState } from "react";

type NavigationLabels = { home: string; about: string; services: string; portfolio: string; testimonials: string; contact: string; cta: string; ctaHref: string };
type VisibleSections = { about: boolean; services: boolean; portfolio: boolean; testimonials: boolean; contact: boolean };

const defaultNavigation: NavigationLabels = {
  home: "Home",
  about: "How I work",
  services: "Services",
  portfolio: "Portfolio",
  testimonials: "Testimonials",
  contact: "Contact",
  cta: "Let's Work Together",
  ctaHref: "#contact"
};

export default function SiteHeader({ navigation = defaultNavigation, sections }: { navigation?: NavigationLabels; sections?: VisibleSections }) {
  const allNavItems = [
    { label: navigation.home, href: "#home" },
    { label: navigation.about, href: "#about", visible: sections?.about !== false },
    { label: navigation.services, href: "#services", visible: sections?.services !== false },
    { label: navigation.portfolio, href: "#portfolio", visible: sections?.portfolio !== false },
    { label: navigation.testimonials, href: "#testimonials", visible: sections?.testimonials !== false },
    { label: navigation.contact, href: "#contact", visible: sections?.contact !== false }
  ];
  const navItems = allNavItems.filter((item) => item.visible !== false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = ["#home", "#about", "#services", "#portfolio", "#testimonials", "#contact"]
      .map((href) => document.querySelector(href))
      .filter(Boolean) as Element[];
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <style>{`
        .sh {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 120;
          padding: 1.35rem 0;
          background: transparent;
          border-bottom: 1px solid transparent;
          transition: background .35s ease, padding .35s ease, border-color .35s ease, backdrop-filter .35s ease;
        }
        .sh-scrolled {
          padding: 0.85rem 0;
          background: #080808cc;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid #ffffff0f;
        }

        .sh-inner {
          width: min(calc(100% - 96px), 1616px);
          margin: 0 auto;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .sh-brand {
          font-size: 1.2rem;
          font-weight: 800;
          color: #fff;
          text-decoration: none;
          letter-spacing: -0.01em;
          transition: letter-spacing 0.3s ease, opacity 0.2s ease;
        }
        .sh-brand:hover { letter-spacing: 0.01em; opacity: .9; }
        .sh-brand span { color: #f5a623; margin-right: 0.35rem; }

        .sh-nav { display: flex; gap: 2.1rem; }
        .sh-nav a {
          position: relative;
          color: #bbb;
          text-decoration: none;
          font-size: 0.87rem;
          font-weight: 500;
          padding: 0.3rem 0;
          transition: color 0.25s ease;
        }
        .sh-nav a::after {
          content: "";
          position: absolute;
          left: 0; bottom: -3px;
          height: 2px; width: 0;
          background: #f5a623;
          border-radius: 2px;
          transition: width 0.3s ease;
        }
        .sh-nav a:hover { color: #fff; }
        .sh-nav a:hover::after { width: 100%; }
        .sh-nav a.active { color: #f5a623; }
        .sh-nav a.active::after { width: 100%; }

        .sh-cta {
          position: relative;
          display: inline-flex;
          align-items: center;
          padding: 0.6rem 1.4rem;
          border: 1px solid #f5a623;
          color: #f5a623;
          font-size: 0.82rem;
          font-weight: 700;
          border-radius: 6px;
          text-decoration: none;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.25s ease;
        }
        .sh-cta::before {
          content: "";
          position: absolute; inset: 0;
          background: #f5a623;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
          z-index: 0;
        }
        .sh-cta span { position: relative; z-index: 1; transition: color 0.25s ease; }
        .sh-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 22px #f5a62330; }
        .sh-cta:hover::before { transform: scaleX(1); }
        .sh-cta:hover span { color: #080808; }

        /* hamburger */
        .sh-toggle {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 5px;
          width: 40px; height: 40px;
          background: transparent;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          cursor: pointer;
        }
        .sh-toggle span {
          display: block;
          width: 16px; height: 1.6px;
          background: #eee;
          border-radius: 2px;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        .sh-toggle.open span:nth-child(1) { transform: translateY(6.6px) rotate(45deg); }
        .sh-toggle.open span:nth-child(2) { opacity: 0; }
        .sh-toggle.open span:nth-child(3) { transform: translateY(-6.6px) rotate(-45deg); }

        /* mobile backdrop */
        .sh-backdrop {
          position: fixed; inset: 0;
          background: #000000a0;
          z-index: 105;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.35s ease;
        }
        .sh-backdrop.open { opacity: 1; visibility: visible; }

        /* mobile slide panel */
        .sh-mobile {
          position: fixed;
          top: 0; right: 0;
          height: 100vh;
          width: min(78vw, 340px);
          background: #0a0a0af5;
          backdrop-filter: blur(20px);
          border-left: 1px solid #f5a62322;
          z-index: 106;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 1.5rem;
          padding: 2rem;
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(.4,0,.2,1);
        }
        .sh-mobile.open { transform: translateX(0); }

        .sh-mobile-nav { display: flex; flex-direction: column; gap: 1.15rem; }
        .sh-mobile-nav a {
          color: #ddd;
          font-size: 1.1rem;
          font-weight: 600;
          text-decoration: none;
          opacity: 0;
          transform: translateX(20px);
          transition: opacity 0.4s ease, transform 0.4s ease, color 0.25s ease;
        }
        .sh-mobile.open .sh-mobile-nav a { opacity: 1; transform: translateX(0); }
        .sh-mobile-nav a.active { color: #f5a623; }

        .sh-mobile-cta {
          margin-top: 0.6rem;
          text-align: center;
          padding: 0.8rem 1.4rem;
          background: #f5a623;
          color: #080808;
          font-weight: 800;
          font-size: 0.88rem;
          border-radius: 6px;
          text-decoration: none;
          opacity: 0;
          transform: translateX(20px);
          transition: opacity 0.4s ease 0.3s, transform 0.4s ease 0.3s;
        }
        .sh-mobile.open .sh-mobile-cta { opacity: 1; transform: translateX(0); }

        @media (max-width: 900px) {
          .sh-inner { width: calc(100% - 32px); }
          .sh-nav { display: none; }
          .sh-cta { display: none; }
          .sh-toggle { display: flex; }
        }
        @media (min-width: 901px) {
          .sh-mobile, .sh-backdrop { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sh, .sh-mobile, .sh-backdrop, .sh-nav a::after,
          .sh-mobile-nav a, .sh-mobile-cta, .sh-cta::before {
            transition: none !important;
          }
        }
      `}</style>

      <header className={`sh ${scrolled ? "sh-scrolled" : ""}`} data-header>
        <div className="sh-inner">
          <a className="sh-brand" href="#home" aria-label="Deepak Sharma home">
            <span>Deepak</span> Sharma
          </a>

          <nav className="sh-nav" aria-label="Primary">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={active === item.href.slice(1) ? "active" : ""}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <a className="sh-cta" href={navigation.ctaHref}>
            <span>{navigation.cta}</span>
          </a>

          <button
            className={`sh-toggle ${menuOpen ? "open" : ""}`}
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <div className={`sh-backdrop ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)} />

      <div className={`sh-mobile ${menuOpen ? "open" : ""}`}>
        <nav className="sh-mobile-nav" aria-label="Mobile">
          {navItems.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              style={{ transitionDelay: `${i * 0.05 + 0.1}s` }}
              className={active === item.href.slice(1) ? "active" : ""}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a className="sh-mobile-cta" href={navigation.ctaHref} onClick={() => setMenuOpen(false)}>
          {navigation.cta}
        </a>
      </div>
    </>
  );
}
