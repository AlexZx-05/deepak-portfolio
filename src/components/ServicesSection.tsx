import type { SiteContent } from "../lib/content";

export default function ServicesSection({ services }: { services: SiteContent["services"] }) {
  return (
    <section className="section" id="services">
      <div className="container">
        <div className="section-heading services-heading">
          <div>
            <p className="eyebrow">{services.eyebrow}</p>
            <h2>{services.title}</h2>
            <p className="services-intro">{services.intro}</p>
          </div>
          <a className="text-link" href={services.ctaHref}>
            {services.ctaLabel} <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="service-grid">
          {services.items.map((service, index) => (
            <article className="svc-card" key={`${service.title}-${index}`}>
              <div className="svc-card-heading">
                <span className="svc-index">{String(index + 1).padStart(2, "0")}</span>
                <div className="svc-art">
                  <img src={service.image} alt={service.imageAlt} loading="lazy" decoding="async" />
                </div>
              </div>
              <h3 className="svc-title">{service.title}</h3>
              <p className="svc-desc">{service.description}</p>
              <div className="svc-tags" aria-label={`${service.title} offerings`}>
                {service.offerings.map((offering) => (
                  <span className="svc-tag" key={offering}>{offering}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
