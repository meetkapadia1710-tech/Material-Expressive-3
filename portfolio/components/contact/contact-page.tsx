"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { CopyEmail, useToast } from "@/components/interface-controls";
import { Icon, type IconName } from "@/components/icon";
import { HighlightText } from "@/components/ui/highlight-text";
import { LiveStatusCard } from "./live-status-card";
import { links } from "@/content/links";
import { contactCopy as copy } from "@/content/contact";
import { contactLimits, normalizeContact, validateContact, type ContactErrors, type ContactField, type ContactValues } from "@/lib/contact-validation";
import styles from "./contact-page.module.css";

interface TopicOption {
  id: string;
  iconName: IconName;
  label: string;
  subject: string;
  placeholder: string;
}

const TOPICS: readonly TopicOption[] = [
  {
    id: "internship",
    iconName: "briefcase",
    label: "SDE / Internship Opportunity",
    subject: "SDE / Internship Opportunity Discussion",
    placeholder: "Tell me about the role, company/team, tech stack, and location (remote or on-site)...",
  },
  {
    id: "collaboration",
    iconName: "rocket",
    label: "Project Collaboration",
    subject: "Project Collaboration Proposal",
    placeholder: "Tell me about your project idea, goals, timeline, and how we could build it together...",
  },
  {
    id: "chat",
    iconName: "coffee",
    label: "Tech Chat / Coffee",
    subject: "Informal Tech Chat & Discussion",
    placeholder: "What topics would you like to explore? (e.g. system design, full-stack architectures, AI)...",
  },
  {
    id: "repograde",
    iconName: "lightbulb",
    label: "Feedback on RepoGrade",
    subject: "Feedback & Ideas for RepoGrade",
    placeholder: "Share your thoughts, suggestions, feature ideas, or issues with RepoGrade AST code scoring...",
  },
] as const;

const fields: { name: ContactField; label: string; placeholder: string; type?: string; multiline?: boolean }[] = [
  { name: "name", label: copy.name, placeholder: copy.namePlaceholder },
  { name: "email", label: "Your email", placeholder: "you@example.com", type: "email" },
  { name: "subject", label: copy.subject, placeholder: copy.subjectPlaceholder },
  { name: "message", label: copy.message, placeholder: copy.messagePlaceholder, multiline: true },
];

function ContactForm() {
  const [values, setValues] = useState<ContactValues>({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [botcheck, setBotcheck] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const notify = useToast();

  const handleSelectTopic = (topic: TopicOption) => {
    if (selectedTopic === topic.id) {
      setSelectedTopic(null);
    } else {
      setSelectedTopic(topic.id);
      setValues((prev) => ({
        ...prev,
        subject: topic.subject,
      }));
      setErrors((prev) => ({ ...prev, subject: undefined }));
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const topicParam = params.get("topic");
      const projectParam = params.get("project");
      if (topicParam) {
        const match = TOPICS.find((t) => t.id === topicParam.toLowerCase());
        if (match) {
          setSelectedTopic(match.id);
          setValues((prev) => ({ ...prev, subject: match.subject }));
        }
      } else if (projectParam && projectParam.toLowerCase() === "repograde") {
        const match = TOPICS.find((t) => t.id === "repograde");
        if (match) {
          setSelectedTopic(match.id);
          setValues((prev) => ({ ...prev, subject: match.subject }));
        }
      }
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const nextErrors = validateContact(values);
    setErrors(nextErrors);
    const firstInvalid = fields.find((field) => nextErrors[field.name]);
    if (firstInvalid) {
      (event.currentTarget.elements.namedItem(firstInvalid.name) as HTMLInputElement | HTMLTextAreaElement | null)?.focus();
      return;
    }

    setSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(12_000),
        body: JSON.stringify({
          ...normalizeContact(values),
          botcheck: botcheck || undefined,
        }),
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.success === true) {
        setSubmitted(true);
        notify("Message delivered directly to Meet's inbox!");
        setValues({ name: "", email: "", subject: "", message: "" });
      } else if (res.status === 503) {
        setServerError("Online delivery is currently unavailable. Your draft is still here. You can open it in your email app below.");
      } else {
        setServerError("Your message could not be sent. Try again or open your draft in your email app below.");
      }
    } catch {
      setServerError("Unable to connect. Your draft is still here. Try again or open it in your email app below.");
    } finally {
      setSubmitting(false);
    }
  }

  const email = links.email.value;
  const emailBody = `Name: ${values.name.trim()}\nEmail: ${values.email.trim()}\n\n${values.message.trim()}`;
  const draftLink = email
    ? `mailto:${email}?subject=${encodeURIComponent(values.subject.trim() || "Portfolio Inquiry")}&body=${encodeURIComponent(emailBody)}`
    : null;

  return <form className={styles.form} onSubmit={submit} noValidate>
    <div className={styles.formHeading}>
      <span aria-hidden="true" className={styles.formIcon}><Icon name="mail" /></span>
      <div><h2>{copy.formTitle}</h2><p>Send a direct message through web forms or prepare it in your mail client.</p></div>
    </div>

    {/* Honeypot field for bot suppression */}
    <input
      type="text"
      name="botcheck"
      value={botcheck}
      onChange={(e) => setBotcheck(e.target.value)}
      className={styles.honeypot}
      aria-hidden="true"
      tabIndex={-1}
      autoComplete="off"
    />

    {submitted ? (
      <div className={styles.successState}>
        <div className={styles.successIcon} aria-hidden="true">
          <Icon name="check" />
        </div>
        <h3>Message Sent Directly!</h3>
        <p>Thank you for reaching out. Your message has been routed to Meet&apos;s inbox and you&apos;ll receive a response shortly.</p>
        <button
          type="button"
          className="button button-secondary"
          onClick={() => setSubmitted(false)}
        >
          <span>Send Another Message</span>
        </button>
      </div>
    ) : (
      <>
        {/* Topic Selector in Material 3 Expressive 2x2 Grid */}
        <div className={styles.topicSection} role="group" aria-labelledby="topic-selector-label">
          <div className={styles.topicHeader}>
            <span id="topic-selector-label" className={styles.topicLabel}>
              What would you like to discuss?
            </span>
            <span className={styles.topicHelper}>
              Select a topic to auto-fill details, or leave unselected to write your own
            </span>
          </div>
          <div className={styles.topicGrid}>
            {TOPICS.map((topic) => {
              const isSelected = selectedTopic === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  className={`${styles.topicCard} ${isSelected ? styles.topicCardSelected : ""}`}
                  onClick={() => handleSelectTopic(topic)}
                  aria-pressed={isSelected}
                >
                  <span className={styles.topicIconTile} aria-hidden="true">
                    <Icon name={topic.iconName} />
                  </span>
                  <span className={styles.topicCardText}>{topic.label}</span>
                  {isSelected && (
                    <span className={styles.topicCheck} aria-hidden="true">
                      <Icon name="check" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {fields.map((field) => {
          const error = errors[field.name];
          const id = `contact-${field.name}`;
          const errorId = `${id}-error`;
          const activeTopic = TOPICS.find((t) => t.id === selectedTopic);
          const dynamicPlaceholder =
            field.name === "message"
              ? activeTopic?.placeholder ?? field.placeholder
              : field.name === "subject"
              ? activeTopic?.subject ?? field.placeholder
              : field.placeholder;

          return <div className={`${styles.field} ${field.multiline ? styles.fieldTextarea : ""}`} key={field.name}>
            <label htmlFor={id}>{field.label}</label>
            {field.multiline
              ? <>
                  <textarea id={id} name={field.name} rows={6} maxLength={contactLimits[field.name]} placeholder={dynamicPlaceholder} value={values[field.name]} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} onChange={(event) => { setValues((current) => ({ ...current, [field.name]: event.target.value })); if (error) setErrors((current) => ({ ...current, [field.name]: undefined })); }} />
                  <span className={styles.characterCounter} aria-live="polite">
                    {contactLimits[field.name] - values[field.name].length} characters left
                  </span>
                </>
              : <input id={id} name={field.name} type={field.type ?? "text"} autoComplete={field.name === "name" ? "name" : field.name === "email" ? "email" : "off"} maxLength={contactLimits[field.name]} placeholder={dynamicPlaceholder} value={values[field.name]} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} onChange={(event) => { setValues((current) => ({ ...current, [field.name]: event.target.value })); if (error) setErrors((current) => ({ ...current, [field.name]: undefined })); }} />}
            {error ? <p className={styles.error} id={errorId} role="alert">{error}</p> : null}
          </div>;
        })}
        {serverError ? <p className={styles.serverError} role="alert">{serverError}</p> : null}
        <div className={styles.submitRow}>
          <button className="button button-primary" type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span>Send Message</span>
                <Icon name="arrow-up-right" />
              </>
            )}
          </button>
          {draftLink ? <a
            href={draftLink}
            className={styles.mailtoFallbackButton}
            title="Open in your default email client"
          >
            <span>Or open email app</span>
            <Icon name="arrow-up-right" />
          </a> : null}
        </div>
      </>
    )}
  </form>;
}

const socialIds = ["github", "linkedin", "leetcode", "codechef"] as const;

export function ContactPage() {
  return <article className={`page-width ${styles.page}`}>
    <header className={styles.intro}>
      <p className="eyebrow"><span aria-hidden="true" className={styles.spark}>✳</span>{copy.eyebrow}</p>
      <h1>Have an <HighlightText text="Interesting Idea?" /></h1>
      <p className={styles.description}>{copy.description}</p>
    </header>
    <div className={styles.layout}>
      <ContactForm />
      <aside className={styles.aside} aria-label="Contact details and social profiles">
        <LiveStatusCard />
        <div className={styles.emailCard}>
          <span className={styles.emailIcon} aria-hidden="true"><Icon name="mail" /></span>
          <p className={styles.cardLabel}>{links.email.label}</p>
          <a className={styles.emailAddress} href={links.email.href ?? undefined}>{links.email.value}</a>
          {links.email.value ? <CopyEmail email={links.email.value} /> : null}
        </div>
        <div className={styles.resumeCard}>
          <span className={styles.resumeIcon} aria-hidden="true"><Icon name="file" /></span>
          <p className={styles.cardLabel}>Verified Resume</p>
          <p className={styles.resumeSummary}>Inspect verified coursework, credentials, competitive metrics, or print an ATS-ready copy.</p>
          <Link href="/resume" className={styles.resumeLink}>
            <span>View Digital Resume</span>
            <Icon name="arrow-right" />
          </Link>
        </div>
        <nav className={styles.socialCard} aria-label="Social profiles">
          <h2>{copy.socialTitle}</h2>
          <ul>{socialIds.map((id) => {
            const link = links[id];
            return link.href && link.verification === "provided" ? <li key={id}><a href={link.href} target="_blank" rel="noreferrer"><span>{link.label}</span><span className={styles.socialValue}>{link.value}</span><Icon name="arrow-up-right" /></a></li> : null;
          })}</ul>
        </nav>
      </aside>
    </div>
  </article>;
}
