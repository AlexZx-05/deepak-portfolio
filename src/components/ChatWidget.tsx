"use client";

import { FormEvent, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "Hi, I can answer questions about Deepak's work and services." }
  ]);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const text = String(formData.get("message") || "").trim();

    if (!text) return;

    setMessages((current) => [...current, { role: "user", text }]);
    form.reset();
    setLoading(true);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    const data = await response.json();

    setLoading(false);
    setMessages((current) => [...current, { role: "assistant", text: data.reply || data.error || "Chat failed." }]);
  }

  return (
    <div className="chat-widget">
      {open ? (
        <section className="chat-panel" aria-label="AI chat">
          <div className="chat-header">
            <strong>Ask Deepak AI</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">x</button>
          </div>
          <div className="chat-messages">
            {messages.map((message, index) => (
              <p className={message.role} key={`${message.role}-${index}`}>{message.text}</p>
            ))}
            {loading ? <p className="assistant">Thinking...</p> : null}
          </div>
          <form className="chat-form" onSubmit={onSubmit}>
            <input name="message" placeholder="Ask about projects..." autoComplete="off" />
            <button type="submit">Send</button>
          </form>
        </section>
      ) : null}
      <button className="chat-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-label="Open chat">
        Chat
      </button>
    </div>
  );
}
