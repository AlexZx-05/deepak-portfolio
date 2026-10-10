"use client";

import { useEffect } from "react";

export default function PortfolioNav() {
  useEffect(() => {
    const navToggle = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-nav]");
    const header = document.querySelector("[data-header]");

    const onToggle = () => {
      const isOpen = nav?.classList.toggle("is-open") ?? false;
      document.body.classList.toggle("nav-open", isOpen);
      navToggle?.setAttribute("aria-expanded", String(isOpen));
    };
    const onNavClick = (event: Event) => {
      if (event.target instanceof HTMLAnchorElement) {
        nav?.classList.remove("is-open");
        document.body.classList.remove("nav-open");
        navToggle?.setAttribute("aria-expanded", "false");
      }
    };
    const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 12);
    navToggle?.addEventListener("click", onToggle);
    nav?.addEventListener("click", onNavClick);
    window.addEventListener("scroll", onScroll);

    return () => {
      navToggle?.removeEventListener("click", onToggle);
      nav?.removeEventListener("click", onNavClick);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
