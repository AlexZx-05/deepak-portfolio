"use client";

import { useEffect, useRef, useState } from "react";

interface HeroProps {
  heroCtaHref: string;
  hero: {
    eyebrow: string;
    name: string;
    role: string;
    copy: string;
    primaryCta: string;
    image: string;
  };
  roleParts: string[];
  availability: {
    visible: boolean;
    status: string;
    text: string;
  };
  socials: {
    github: string;
    linkedin: string;
    whatsapp: string;
    instagram: string;
  };
}

export default function HeroSection({ hero, heroCtaHref, roleParts, availability, socials }: HeroProps) {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  // typewriter — only if multiple roles
  useEffect(() => {
    if (roleParts.length <= 1) return;
    const current = roleParts[roleIndex];
    let timer: ReturnType<typeof setTimeout>;
    if (!isDeleting && displayed.length < current.length) {
      timer = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 70);
    } else if (!isDeleting && displayed.length === current.length) {
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayed.length > 0) {
      timer = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 38);
    } else {
      setIsDeleting(false);
      setRoleIndex((p) => (p + 1) % roleParts.length);
    }
    return () => clearTimeout(timer);
  }, [displayed, isDeleting, roleIndex, roleParts]);

  // subtle mouse parallax on image only
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!imgRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 16;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      imgRef.current.style.transform = `scale(1.06) translate(${x}px, ${y}px)`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const roleText = roleParts.length > 1 ? displayed : (roleParts[0] || hero.role);
  const [firstName, ...lastName] = hero.name.trim().split(/\s+/);

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity:0; } to { opacity:1; }
        }
        @keyframes blink {
          0%,100% { opacity:1; } 50% { opacity:0; }
        }
        @keyframes badgeDrift {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-7px); }
        }
        @keyframes ringPulse {
          0%,100% { opacity:.22; transform:scale(1); }
          50%      { opacity:.4;  transform:scale(1.035); }
        }
        @keyframes dotPulse {
          0%,100% { opacity:1; box-shadow:0 0 0 0 #4ade8044; }
          50%      { opacity:.7; box-shadow:0 0 0 5px #4ade8000; }
        }
        @keyframes underlineGrow {
          from { width:0; } to { width:64px; }
        }

        /* ── wrapper ── */
        .h26 {
          position: relative;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1.05fr;
          overflow: hidden;
          background: #080808;
        }

        /* ── LEFT pane — image ── */
        .h26-imgpane {
          position: relative;
          overflow: hidden;
          background: #080808;
        }

        .h26-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 18%;
          transition: transform .1s linear;
          will-change: transform;
          transform: scale(1.06);
        }

        /* gradient overlay blending image into right pane — softer, no hard seam */
        .h26-imgpane::before {
          content:"";
          position:absolute;
          inset:0;
          background:
            linear-gradient(90deg, #080808 0%, rgba(8,8,8,.86) 7%, rgba(8,8,8,.38) 20%, transparent 34%),
            linear-gradient(to top, rgba(8,8,8,.38) 0%, transparent 20%),
            linear-gradient(to bottom, rgba(8,8,8,.20) 0%, transparent 14%);
          z-index:2;
          pointer-events:none;
        }

        /* gold ambient glow */
        .h26-imgpane::after {
          content:"";
          position:absolute;
          inset:0;
          background: radial-gradient(ellipse at 35% 30%, #f5a62310 0%, transparent 60%);
          z-index:3;
          pointer-events:none;
        }

        /* decorative ring — moved off the face, lower-left corner, behind/below subject */
        .h26-ring {
          position:absolute;
          bottom: -90px;
          left: -90px;
          width: 320px; height: 320px;
          border-radius:50%;
          border:1px solid #f5a62340;
          z-index:1;
          pointer-events:none;
          animation: ringPulse 5s ease-in-out infinite;
        }

        /* floating tech badges — moved up, clear of plant leaves, right-aligned over darker zone */
        .h26-badges {
          position:absolute;
          bottom: 2rem; right: 1.75rem;
          display:flex; flex-wrap:wrap;
          gap:.4rem;
          max-width: 230px;
          z-index:10;
          justify-content:flex-end;
          opacity:0;
          animation: fadeIn .7s ease forwards .9s;
        }
        .h26-badge {
          font-size:.6rem;
          font-weight:700;
          letter-spacing:.08em;
          text-transform:uppercase;
          color:#f5a623;
          background:#080808e6;
          border:1px solid #f5a62330;
          border-radius:4px;
          padding:3px 8px;
          backdrop-filter:blur(10px);
        }
        .h26-badge:nth-child(1){animation:badgeDrift 3.8s ease-in-out infinite;}
        .h26-badge:nth-child(2){animation:badgeDrift 4.3s ease-in-out infinite .4s;}
        .h26-badge:nth-child(3){animation:badgeDrift 3.6s ease-in-out infinite .2s;}
        .h26-badge:nth-child(4){animation:badgeDrift 4.1s ease-in-out infinite .6s;}
        .h26-badge:nth-child(5){animation:badgeDrift 3.9s ease-in-out infinite .8s;}
        .h26-badge:nth-child(6){animation:badgeDrift 4.4s ease-in-out infinite .1s;}

        /* ── RIGHT pane — content ── */
        .h26-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 8.5rem clamp(48px, 4vw, 80px) 5.5rem max(48px, calc((100vw - 1616px) / 2));
          background: #080808;
        }

        .h26-content::before {
          content:"";
          position:absolute; inset:0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: .02;
          pointer-events:none;
        }

        .h26-eyebrow {
          font-size:.7rem;
          font-weight:700;
          letter-spacing:.22em;
          text-transform:uppercase;
          color:#f5a623;
          margin:0 0 1.2rem;
          opacity:0;
        }
        .h26-eyebrow.go { animation: fadeUp .55s ease forwards .05s; }

        .h26-name {
          max-width: 680px;
          font-size: clamp(3.2rem, 5.15vw, 5.35rem);
          font-weight:900;
          line-height:1.0;
          letter-spacing:-.035em;
          margin:0 0 .72rem;
          color:#fff;
          opacity:0;
        }
        .h26-name.go { animation: fadeUp .6s ease forwards .15s; }
        .h26-name span { color: #f5a623; }

        .h26-underline {
          height:3px;
          width:0;
          background: linear-gradient(90deg,#f5a623,#f5a62300);
          border-radius:2px;
          margin-bottom:1.35rem;
        }
        .h26-underline.go { animation: underlineGrow .7s ease forwards .55s; }

        .h26-role {
          font-size: clamp(1.22rem, 1.65vw, 1.42rem);
          font-weight:700;
          color:#f0f0f0;
          margin:0 0 1.45rem;
          min-height:1.6em;
          display:flex;
          align-items:center;
          gap:4px;
          letter-spacing:-.01em;
          opacity:0;
        }
        .h26-role.go { animation: fadeUp .55s ease forwards .28s; }

        .h26-cursor {
          display:inline-block;
          width:2px; height:1em;
          background:#f5a623;
          vertical-align:middle;
          animation: blink 1s step-end infinite;
          flex-shrink:0;
        }

        .h26-copy {
          font-size:1rem;
          color:#969692;
          line-height:1.75;
          margin:0 0 1.8rem;
          max-width:500px;
          opacity:0;
        }
        .h26-copy.go { animation: fadeUp .55s ease forwards .42s; }

        .h26-avail {
          display:inline-flex;
          align-items:center;
          gap:.5rem;
          font-size:.72rem;
          font-weight:700;
          letter-spacing:.06em;
          color:#4ade80;
          background:#4ade8010;
          border:1px solid #4ade8022;
          border-radius:999px;
          padding:.3rem .9rem;
          margin-bottom:1.5rem;
          width: fit-content;
          opacity:0;
        }
        .h26-avail.go { animation: fadeUp .5s ease forwards .52s; }
        .h26-avail-dot {
          width:7px; height:7px;
          border-radius:50%;
          background:#4ade80;
          animation: dotPulse 2s ease-in-out infinite;
        }

        .h26-actions {
          display:flex;
          flex-wrap:wrap;
          gap:.75rem;
          margin-bottom:1.6rem;
          opacity:0;
        }
        .h26-actions.go { animation: fadeUp .55s ease forwards .6s; }

        .h26-btn-primary {
          position:relative;
          display:inline-flex; align-items:center;
          min-height: 52px;
          padding:.8rem 1.7rem;
          background:#f5a623;
          color:#080808;
          font-weight:800;
          font-size:.88rem;
          letter-spacing:.01em;
          border-radius:6px;
          text-decoration:none;
          overflow:hidden;
          transition: transform .18s ease, box-shadow .18s ease;
        }
        .h26-btn-primary::after {
          content:"";
          position:absolute; inset:0;
          background:linear-gradient(135deg,#ffe08a,#f5a623);
          opacity:0;
          transition:opacity .25s ease;
        }
        .h26-btn-primary:hover { transform:translateY(-2px); box-shadow:0 10px 30px #f5a62338; }
        .h26-btn-primary:hover::after { opacity:1; }
        .h26-btn-primary span { position:relative; z-index:1; }

        .h26-btn-secondary {
          display:inline-flex; align-items:center; gap:.45rem;
          min-height: 52px;
          padding:.8rem 1.7rem;
          background:transparent;
          color:#ccc;
          font-weight:600;
          font-size:.88rem;
          border:1px solid #2a2a2a;
          border-radius:6px;
          text-decoration:none;
          transition: border-color .2s, color .2s, transform .2s;
        }
        .h26-btn-secondary svg { width:15px; height:15px; stroke:currentColor; fill:none; stroke-width:2; transition:transform .2s; }
        .h26-btn-secondary:hover { border-color:#f5a623; color:#f5a623; transform:translateY(-2px); }
        .h26-btn-secondary:hover svg { transform:translateY(2px); }

        .h26-socials {
          display:flex; gap:.6rem;
          opacity:0;
        }
        .h26-socials.go { animation: fadeUp .5s ease forwards .75s; }

        .h26-social {
          width:40px; height:40px;
          display:inline-flex; align-items:center; justify-content:center;
          background:#111;
          border:1px solid #222;
          border-radius:8px;
          color:#666;
          text-decoration:none;
          transition: border-color .2s, color .2s, transform .2s, box-shadow .2s;
        }
        .h26-social svg { width:15px; height:15px; fill:none; stroke:currentColor; stroke-width:1.6; }
        .h26-social:hover { border-color:#f5a623; color:#f5a623; transform:translateY(-3px); box-shadow:0 6px 18px #f5a62322; }

        .h26-scroll {
          position:absolute;
          bottom:2.25rem; left:max(48px, calc((100vw - 1616px) / 2));
          display:flex; align-items:center; gap:.55rem;
          font-size:.65rem; font-weight:700;
          letter-spacing:.16em; text-transform:uppercase;
          color:#333; z-index:20;
          opacity:0;
          animation: fadeIn .6s ease forwards 1s;
        }
        .h26-scroll-line {
          width:28px; height:1px;
          background:linear-gradient(90deg, #f5a623, transparent);
        }

        @media (max-width:900px) {
          .h26 { grid-template-columns:1fr; }
          .h26-imgpane {
            position:absolute; inset:0;
            opacity:.16;
          }
          .h26-imgpane::before {
            background: linear-gradient(to bottom, #08080888 0%, #080808 100%);
          }
          .h26-content {
            padding: 6rem 1.5rem 4rem;
            min-height:100vh;
            background:transparent;
          }
          .h26-badges, .h26-ring { display:none; }
          .h26-name { font-size: clamp(2.7rem, 11vw, 3.8rem); }
        }

        @media (max-width:640px) {
          .h26 { min-height:760px; min-height:100svh; }
          .h26-content {
            justify-content:center;
            padding:7.25rem 1.5rem 2.25rem;
          }
          .h26-imgpane { opacity:.20; }
          .h26-img { object-position:62% 18%; transform:scale(1.02); }
          .h26-eyebrow { margin-bottom:1rem; font-size:.64rem; letter-spacing:.18em; }
          .h26-name { margin-bottom:.65rem; line-height:.98; }
          .h26-underline { margin-bottom:1.15rem; }
          .h26-role { margin-bottom:1.1rem; font-size:1.15rem; }
          .h26-copy { max-width:34rem; margin-bottom:1.55rem; font-size:.94rem; line-height:1.7; }
          .h26-actions { display:grid; grid-template-columns:1fr; width:min(100%, 21rem); margin-bottom:1.35rem; }
          .h26-btn-primary, .h26-btn-secondary { justify-content:center; width:100%; }
          .h26-social { width:42px; height:42px; }
          .h26-scroll { display:none; }
        }

        @media (prefers-reduced-motion:reduce) {
          .h26-eyebrow,.h26-name,.h26-role,.h26-copy,
          .h26-avail,.h26-actions,.h26-socials,
          .h26-badges,.h26-scroll,.h26-underline {
            animation:none !important; opacity:1 !important; width:64px !important;
          }
          .h26-badge,.h26-ring { animation:none !important; }
        }
      `}</style>

      <section className="h26" id="home" aria-label="Hero">

        {/* LEFT — content */}
        <div className="h26-content">
          <p className={`h26-eyebrow ${mounted ? "go" : ""}`}>
            {hero.eyebrow}
          </p>

          <h1 className={`h26-name ${mounted ? "go" : ""}`}>
            {firstName} {lastName.length ? <span>{lastName.join(" ")}</span> : null}
          </h1>

          <div className={`h26-underline ${mounted ? "go" : ""}`} aria-hidden="true" />

          <p className={`h26-role ${mounted ? "go" : ""}`}>
            {roleParts.length > 1 ? (
              <>
                {roleText}
                <span className="h26-cursor" aria-hidden="true" />
              </>
            ) : (
              roleText
            )}
          </p>

          <p className={`h26-copy ${mounted ? "go" : ""}`}>
            {hero.copy}
          </p>

          {availability.visible && (
            <div className={`h26-avail ${mounted ? "go" : ""}`}>
              <span className="h26-avail-dot" />
              {availability.text}
            </div>
          )}

          <div className={`h26-actions ${mounted ? "go" : ""}`}>
            <a className="h26-btn-primary" href={heroCtaHref}>
              <span>{hero.primaryCta}</span>
            </a>
            <a className="h26-btn-secondary" href="/api/resume" aria-label="Download CV">
              Download CV
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3v12m0 0 5-5m-5 5-5-5M5 21h14" />
              </svg>
            </a>
          </div>

          <div className={`h26-socials ${mounted ? "go" : ""}`} aria-label="Social links">
            <a className="h26-social" href={socials.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3.6 9h16.8M3.6 15h16.8M12 3c2.4 2.5 3.7 5.5 3.7 9s-1.3 6.5-3.7 9c-2.4-2.5-3.7-5.5-3.7-9S9.6 5.5 12 3Z"/></svg>
            </a>
            <a className="h26-social" href={socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24"><path d="M7.2 10.2V19M7.2 7.1v.1M11 19v-8.8M11 14.1c0-2.4 1.5-4 3.7-4 2 0 3.3 1.3 3.3 4V19"/><rect x="3" y="3" width="18" height="18" rx="4"/></svg>
            </a>
            <a className="h26-social" href={socials.github} target="_blank" rel="noreferrer" aria-label="GitHub">
              <svg viewBox="0 0 24 24"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg>
            </a>
            <a className="h26-social" href={socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r=".9" fill="currentColor" stroke="none"/></svg>
            </a>
          </div>
        </div>

        {/* RIGHT — photo */}
        <div className="h26-imgpane">
          <img
            ref={imgRef}
            className="h26-img"
            src={hero.image}
            alt="Deepak Sharma"
          />
          <div className="h26-ring" aria-hidden="true" />
        </div>

        <div className="h26-scroll" aria-hidden="true">
          <span className="h26-scroll-line" />
          Scroll
        </div>

      </section>
    </>
  );
}
