"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { SiteContent, TestimonialContent } from "../lib/content";

export default function TestimonialSection({ testimonials, content }: { testimonials: TestimonialContent[]; content: SiteContent["testimonials"] }) {
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFeedbackOpen) {
      feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isFeedbackOpen]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await response.json();

      if (!response.ok) {
        setStatus(String(result.error || "Could not submit your testimonial. Please try again."));
        return;
      }

      form.reset();
      setStatus("Thank you. Your testimonial is awaiting review and will appear here after approval.");
    } catch {
      setStatus("Could not submit your testimonial. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="section testimonial-section" id="testimonials">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{content.eyebrow}</p>
            <h2>{content.title}</h2>
            <p className="section-intro">
              {testimonials.length
                ? content.intro
                : content.demoIntro}
            </p>
          </div>
        </div>

        <div className="testimonial-content">
          <div className="testimonial-list" aria-live="polite">
            {testimonials.length ? testimonials.map((testimonial) => (
              <article className="testimonial-card" key={testimonial.id}>
                <div className="testimonial-rating" aria-label={`${testimonial.rating} out of 5 stars`}>
                  {"★".repeat(testimonial.rating)}
                  <span>{"☆".repeat(5 - testimonial.rating)}</span>
                </div>
                <blockquote>{testimonial.content}</blockquote>
                <div className="testimonial-author">
                  <strong>{testimonial.name}</strong>
                  {testimonial.role ? <span>{testimonial.role}</span> : null}
                </div>
              </article>
            )) : (
              content.demos.map((testimonial, index) => (
                <article className="testimonial-card testimonial-demo" key={`${testimonial.name}-${index}`}>
                  <div className="testimonial-demo-header">
                    <div className="testimonial-rating" aria-label="Demo five star rating">{"★".repeat(5)}</div>
                    <span className="testimonial-demo-label">Demo</span>
                  </div>
                  <blockquote>“{testimonial.content}”</blockquote>
                  <div className="testimonial-author">
                    <strong>{testimonial.name}</strong>
                    <span>{testimonial.role}</span>
                  </div>
                </article>
              ))
            )}
          </div>

          {!isFeedbackOpen ? (
            <div className="testimonial-feedback-cta">
              <p>{content.feedbackPrompt}</p>
              <button className="btn btn-primary" type="button" onClick={() => setIsFeedbackOpen(true)}>
                {content.feedbackButton} <span aria-hidden="true">↗</span>
              </button>
            </div>
          ) : (
            <div className="testimonial-feedback-panel" ref={feedbackRef} id="testimonial-feedback">
              <form className="testimonial-form" onSubmit={onSubmit}>
                <div className="testimonial-form-heading">
                  <div>
                    <p className="eyebrow">{content.formEyebrow}</p>
                    <h3>{content.formTitle}</h3>
                    <p>{content.formDescription}</p>
                  </div>
                  <button className="testimonial-form-close" type="button" onClick={() => setIsFeedbackOpen(false)} aria-label="Close feedback form">×</button>
                </div>
                <label>
                  <span>Your name</span>
                  <input name="name" type="text" minLength={2} maxLength={80} autoComplete="name" placeholder="e.g. Alex Morgan" required />
                </label>
                <label>
                  <span>Your role or company <small>(optional)</small></span>
                  <input name="role" type="text" maxLength={100} autoComplete="organization-title" placeholder="e.g. Founder, Acme Studio" />
                </label>
                <label>
                  <span>Your experience</span>
                  <textarea name="content" rows={5} minLength={20} maxLength={1200} placeholder="What was it like working together?" required />
                </label>
                <label>
                  <span>Overall rating</span>
                  <select name="rating" defaultValue="5" required>
                    <option value="5">5 — Excellent</option>
                    <option value="4">4 — Very good</option>
                    <option value="3">3 — Good</option>
                    <option value="2">2 — Fair</option>
                    <option value="1">1 — Needs improvement</option>
                  </select>
                </label>
                <label className="testimonial-honeypot" aria-hidden="true">
                  <span>Leave this field empty</span>
                  <input name="website" type="text" tabIndex={-1} autoComplete="off" />
                </label>
                <p className="testimonial-consent">By submitting, you agree that your name, role, rating, and feedback may be displayed if approved. No email address is required.</p>
                <div className="testimonial-form-actions">
                  <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit for review"} <span aria-hidden="true">↗</span>
                  </button>
                  <button className="testimonial-cancel" type="button" onClick={() => setIsFeedbackOpen(false)}>Cancel</button>
                </div>
                {status ? <p className="testimonial-form-status" role="status">{status}</p> : null}
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
