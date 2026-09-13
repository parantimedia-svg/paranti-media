"use client";

import { useRef, useState } from "react";
import {
  BUDGET_RANGES,
  FORM,
  PROJECT_TYPES,
  SITE,
  isFormWired,
} from "@/data/site";
import { IS_DEV } from "@/lib/env";
import ContactWorld from "./ContactWorld";
import Signoff from "./Signoff";

const FIELDS = [
  { name: "name", label: "NAME", type: "text", required: true, autoComplete: "name" },
  { name: "company", label: "COMPANY", type: "text", autoComplete: "organization" },
  { name: "email", label: "EMAIL", type: "email", required: true, autoComplete: "email" },
  { name: "phone", label: "PHONE", type: "tel", autoComplete: "tel" },
];

export default function Contact() {
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error | fallback
  const [message, setMessage] = useState("");
  /* Drives the environment, not the form. `data-sent` on the section is what
     puts the recording light out; the sign-off card plays over the top. Held
     separately from `status` so the success message stays on screen after the
     card has finished and removed itself. */
  const [signoff, setSignoff] = useState(false);
  // Once a send has failed, the next press hands over to the visitor's mail
  // app rather than silently retrying a service that is clearly not answering.
  const sendFailed = useRef(false);

  const wired = isFormWired();

  /* Last-resort path: if no endpoint is configured, hand the enquiry to the
     visitor's mail client fully pre-filled so it is never silently lost. */
  const mailtoFallback = (data) => {
    const body = [
      `Name: ${data.name || "-"}`,
      `Company: ${data.company || "-"}`,
      `Email: ${data.email || "-"}`,
      `Phone: ${data.phone || "-"}`,
      `Project type: ${data.projectType || "-"}`,
      `Budget: ${data.budget || "-"}`,
      "",
      "Message:",
      data.message || "-",
    ].join("\n");

    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(
      `New project enquiry — ${data.name || "Website"}`
    )}&body=${encodeURIComponent(body)}`;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const data = {
      name: fd.get("name")?.toString().trim(),
      company: fd.get("company")?.toString().trim(),
      email: fd.get("email")?.toString().trim(),
      phone: fd.get("phone")?.toString().trim(),
      projectType: fd.get("projectType")?.toString(),
      budget: fd.get("budget")?.toString(),
      message: fd.get("message")?.toString().trim(),
    };

    // Honeypot — silently accept and drop obvious bots. No sign-off: nothing
    // was actually sent, and a bot does not need the end card.
    if (fd.get("_website")) {
      setStatus("sent");
      return;
    }

    if (!wired || sendFailed.current) {
      setStatus("fallback");
      setMessage(
        IS_DEV && !wired
          ? "Opening your email app with the enquiry pre-filled. (Site owner: add a Web3Forms key or Formspree endpoint in data/site.js to receive these directly.)"
          : "Opening your email app with your enquiry ready to send."
      );
      mailtoFallback(data);
      return;
    }

    setStatus("sending");

    try {
      let res;

      if (FORM.formspreeEndpoint) {
        res = await fetch(FORM.formspreeEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            ...data,
            _subject: `New project enquiry — ${data.name}`,
          }),
        });
      } else {
        res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: FORM.web3formsAccessKey,
            subject: `New project enquiry — ${data.name}`,
            from_name: "Paranti Media website",
            ...data,
          }),
        });
      }

      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      sendFailed.current = false;
      setStatus("sent");
      setMessage("Thank you — your enquiry has landed. We'll be in touch shortly.");
      form.reset();
      setSignoff(true);
    } catch (err) {
      sendFailed.current = true;
      setStatus("error");
      setMessage(
        "Something went wrong sending that. Press send again to open your mail app with the enquiry ready, or write to us directly at " +
          SITE.email +
          "."
      );
    }
  };

  return (
    <section
      className="section on-ink contact"
      id="contact"
      /* The take is over: this is what puts the recording light out. */
      data-sent={status === "sent" ? "true" : "false"}
    >
      <ContactWorld />
      <Signoff active={signoff} onDone={() => setSignoff(false)} />
      <div className="inner">
        <div className="contact__cta">
          <p className="label reveal">CONTACT</p>
          <h2 className="h-section contact__title">
            <span className="line-mask reveal">
              <span>LET&apos;S CREATE</span>
            </span>
            <span className="line-mask reveal" data-reveal-delay="90">
              <span>SOMETHING WORTH</span>
            </span>
            <span className="line-mask reveal" data-reveal-delay="180">
              <span className="accent">REMEMBERING.</span>
            </span>
          </h2>
          <p className="lead reveal" data-reveal-delay="220">
            Have a project in mind? Let&apos;s talk.
          </p>

          <div className="contact__actions reveal" data-reveal-delay="280">
            <a href="#contact-form" className="btn btn--solid" data-cursor="EXPLORE">
              <span>START A PROJECT</span>
              <span className="arrow" aria-hidden="true">→</span>
            </a>
            <a
              href={SITE.whatsapp}
              className="btn"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="EXPLORE"
            >
              <span>WHATSAPP</span>
              <span className="arrow" aria-hidden="true">→</span>
            </a>
            <a href={`mailto:${SITE.email}`} className="btn" data-cursor="EXPLORE">
              <span>EMAIL</span>
              <span className="arrow" aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="contact__grid">
          <aside className="contact__details">
            <dl>
              <div>
                <dt className="mono">EMAIL</dt>
                <dd>
                  <a className="link-u" href={`mailto:${SITE.email}`}>
                    {SITE.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="mono">PHONE</dt>
                <dd>
                  <a className="link-u" href={`tel:${SITE.phoneHref}`}>
                    {SITE.phoneDisplay}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="mono">INSTAGRAM</dt>
                <dd>
                  <a
                    className="link-u"
                    href={SITE.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {SITE.instagramHandle}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="mono">WHATSAPP</dt>
                <dd>
                  <a
                    className="link-u"
                    href={SITE.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {SITE.phoneDisplay}
                  </a>
                </dd>
              </div>
            </dl>
          </aside>

          <form className="contact__form" id="contact-form" onSubmit={onSubmit} noValidate={false}>
            <div className="contact__rows">
              {FIELDS.map((f) => (
                <p className="field" key={f.name}>
                  <label className="mono" htmlFor={`f-${f.name}`}>
                    {f.label}
                    {f.required && <em aria-hidden="true"> *</em>}
                  </label>
                  <input
                    id={`f-${f.name}`}
                    name={f.name}
                    type={f.type}
                    required={f.required}
                    autoComplete={f.autoComplete}
                  />
                </p>
              ))}

              <p className="field">
                <label className="mono" htmlFor="f-projectType">
                  PROJECT TYPE
                </label>
                <select id="f-projectType" name="projectType" defaultValue="">
                  <option value="" disabled>
                    SELECT…
                  </option>
                  {PROJECT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </p>

              <p className="field">
                <label className="mono" htmlFor="f-budget">
                  BUDGET
                </label>
                <select id="f-budget" name="budget" defaultValue="">
                  <option value="" disabled>
                    SELECT…
                  </option>
                  {BUDGET_RANGES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </p>

              <p className="field field--full">
                <label className="mono" htmlFor="f-message">
                  MESSAGE <em aria-hidden="true">*</em>
                </label>
                <textarea id="f-message" name="message" rows={5} required />
              </p>
            </div>

            {/* Honeypot: hidden from people, catnip for bots. */}
            <input
              type="text"
              name="_website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="contact__hp"
            />

            <div className="contact__submit">
              <button
                type="submit"
                className="btn btn--solid"
                disabled={status === "sending"}
                data-cursor="EXPLORE"
              >
                <span>{status === "sending" ? "SENDING…" : "SEND ENQUIRY"}</span>
                <span className="arrow" aria-hidden="true">→</span>
              </button>

              <p
                className={`contact__status mono contact__status--${status}`}
                role="status"
                aria-live="polite"
              >
                {message}
              </p>
            </div>

            {!wired && IS_DEV && (
              <p className="contact__wire mono">
                SITE OWNER: paste a Web3Forms key or Formspree endpoint into
                <code> data/site.js → FORM </code> to receive these enquiries at{" "}
                {SITE.email}. Until then the form opens the visitor&apos;s mail app
                pre-filled.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
