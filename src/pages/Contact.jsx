import { useState } from "react";
import { motion } from "framer-motion";
import { RiWhatsappLine } from '@remixicon/react';

function waLink(phone) {
  if (!phone) return "#";
  let w = phone.replace(/[^\d]/g, "");
  if (w.length === 10) w = "91" + w;
  return `https://wa.me/${w}`;
}

export default function Contact({ settings }) {
  const [status, setStatus] = useState("");
  const formUrl = settings?.formspreeUrl;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formUrl) {
      setStatus("Contact form isn't set up yet — email me directly for now.");
      return;
    }
    setStatus("Sending...");
    const form = e.target;
    try {
      const res = await fetch(formUrl, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("Message sent — thanks!");
        form.reset();
      } else {
        setStatus("Something went wrong. Try emailing directly instead.");
      }
    } catch {
      setStatus("Network error. Try emailing directly instead.");
    }
    setTimeout(() => setStatus(""), 5000);
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <div className="grid gap-10 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-5xl">
            {settings?.contactHeroTitle || "Let's build something great"}
          </h1>
          <p className="mt-3 text-muted">
            {settings?.contactHeroSub || "Reach out to discuss projects, collabs or just say hi."}
          </p>

          <div className="mt-8 rounded-2xl border border-line bg-card p-6">
            <h3 className="font-display text-xl text-crimson">Contact Details</h3>
            <p className="mt-4 font-semibold">{settings?.contactName || "Zaudin"}</p>
            {settings?.phone && (
              <p className="mt-1 text-sm text-muted">
                Phone / WhatsApp:{" "}
                <a href={`tel:${settings.phone}`} className="text-web hover:text-crimson">
                  {settings.phone}
                </a>
              </p>
            )}
            {settings?.email && (
              <p className="mt-1 text-sm text-muted">
                Email:{" "}
                <a href={`mailto:${settings.email}`} className="text-web hover:text-crimson">
                  {settings.email}
                </a>
              </p>
            )}
            {settings?.address && (
              <>
                <p className="mt-3 text-sm text-muted">Address:</p>
                <p className="text-sm">{settings.address}</p>
              </>
            )}
            {settings?.phone && (
              <a
                href={waLink(settings.whatsapp || settings.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex gap-2 rounded-lg bg-crimson px-5 py-2.5 font-semibold text-ink transition hover:bg-crimson-glow"
              >
               <RiWhatsappLine size={24} /> Open WhatsApp
              </a>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-line bg-card p-6"
        >
          <h3 className="font-display text-xl text-crimson">Send a message</h3>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
            <input
              name="name"
              placeholder="Your name"
              className="rounded-lg border border-line bg-ink-soft px-4 py-3 text-sm outline-none focus:border-crimson"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="Your email"
              className="rounded-lg border border-line bg-ink-soft px-4 py-3 text-sm outline-none focus:border-crimson"
            />
            <input
              name="phone"
              placeholder="Phone (optional)"
              className="rounded-lg border border-line bg-ink-soft px-4 py-3 text-sm outline-none focus:border-crimson"
            />
            <textarea
              name="message"
              rows={5}
              required
              placeholder="Your message"
              className="rounded-lg border border-line bg-ink-soft px-4 py-3 text-sm outline-none focus:border-crimson"
            />
            <button
              type="submit"
              className="mt-1 rounded-lg bg-crimson px-5 py-3 font-semibold text-ink transition hover:bg-crimson-glow"
            >
              Send
            </button>
            {status && <div className="text-sm text-muted">{status}</div>}
          </form>
        </motion.div>
      </div>
    </section>
  );
}
