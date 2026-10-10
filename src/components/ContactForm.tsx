"use client";

import { FormEvent, useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    setLoading(false);

    if (!response.ok) {
      setStatus("Message failed. Please try again.");
      return;
    }

    form.reset();
    setStatus("Message sent.");
  }

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <label>
        <span>Name</span>
        <input type="text" name="name" placeholder="Your name" required />
      </label>
      <label>
        <span>Email</span>
        <input type="email" name="email" placeholder="you@example.com" required />
      </label>
      <label>
        <span>Message</span>
        <textarea name="message" rows={4} placeholder="Tell me about your project" required></textarea>
      </label>
      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? "Sending..." : "Send Message"}
      </button>
      {status ? <p className="form-status">{status}</p> : null}
    </form>
  );
}
