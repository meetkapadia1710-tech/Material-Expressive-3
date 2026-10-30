"use client";

import { useState, type FormEvent } from "react";
import { CopyEmail, useToast } from "@/components/interface-controls";
import { Icon } from "@/components/icon";
import { HighlightText } from "@/components/ui/highlight-text";
import { links } from "@/content/links";
import { contactCopy as copy } from "@/content/contact";
import styles from "./contact-page.module.css";

type Field = "name" | "subject" | "message";
type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;

const fields: { name: Field; label: string; placeholder: string; maxLength: number; multiline?: boolean }[] = [
  { name: "name", label: copy.name, placeholder: copy.namePlaceholder, maxLength: 100 },
  { name: "subject", label: copy.subject, placeholder: copy.subjectPlaceholder, maxLength: 160 },
  { name: "message", label: copy.message, placeholder: copy.messagePlaceholder, maxLength: 5000, multiline: true },
];

function validate(values: Values): Errors {
  const errors: Errors = {};
  const name = values.name.trim();
  const subject = values.subject.trim();
  const message = values.message.trim();
  if (!name) errors.name = copy.errors.nameRequired;
  else if (name.length > 100) errors.name = copy.errors.nameTooLong;
  if (!subject) errors.subject = copy.errors.subjectRequired;
  else if (subject.length > 160) errors.subject = copy.errors.subjectTooLong;
  if (!message) errors.message = copy.errors.messageRequired;
  else if (message.length > 5000) errors.message = copy.errors.messageTooLong;
  return errors;
}

function ContactForm() {
  const [values, setValues] = useState<Values>({ name: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const notify = useToast();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    const firstInvalid = fields.find((field) => nextErrors[field.name]);
    if (firstInvalid) {
      (event.currentTarget.elements.namedItem(firstInvalid.name) as HTMLInputElement | HTMLTextAreaElement | null)?.focus();
      return;
    }

    const email = links.email.value;
    if (!email) return;
    const body = `Name: ${values.name.trim()}\n\n${values.message.trim()}`;
    const mailto = `mailto:${email}?subject=${encodeURIComponent(values.subject.trim())}&body=${encodeURIComponent(body)}`;
    notify(copy.opening);
    window.location.href = mailto;
  }

  return <form className={styles.form} onSubmit={submit} noValidate>
    <div className={styles.formHeading}>
      <span aria-hidden="true" className={styles.formIcon}><Icon name="mail" /></span>
      <div><h2>{copy.formTitle}</h2><p>{copy.formDescription}</p></div>
    </div>
    {fields.map((field) => {
      const error = errors[field.name];
      const id = `contact-${field.name}`;
      const errorId = `${id}-error`;
      return <div className={styles.field} key={field.name}>
        <label htmlFor={id}>{field.label}</label>
        {field.multiline
          ? <textarea id={id} name={field.name} rows={6} maxLength={field.maxLength} placeholder={field.placeholder} value={values[field.name]} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} onChange={(event) => { setValues((current) => ({ ...current, [field.name]: event.target.value })); if (error) setErrors((current) => ({ ...current, [field.name]: undefined })); }} />
          : <input id={id} name={field.name} type="text" autoComplete={field.name === "name" ? "name" : "off"} maxLength={field.maxLength} placeholder={field.placeholder} value={values[field.name]} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} onChange={(event) => { setValues((current) => ({ ...current, [field.name]: event.target.value })); if (error) setErrors((current) => ({ ...current, [field.name]: undefined })); }} />}
        {error ? <p className={styles.error} id={errorId} role="alert">{error}</p> : null}
      </div>;
    })}
    <button className="button button-primary" type="submit">{copy.submit}<Icon name="arrow-up-right" /></button>
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
      <aside className={styles.aside} aria-label="Contact details and social profiles">
        <div className={styles.emailCard}>
          <span className={styles.emailIcon} aria-hidden="true"><Icon name="mail" /></span>
          <p className={styles.cardLabel}>{links.email.label}</p>
          <a className={styles.emailAddress} href={links.email.href ?? undefined}>{links.email.value}</a>
          {links.email.value ? <CopyEmail email={links.email.value} /> : null}
        </div>
        <nav className={styles.socialCard} aria-label="Social profiles">
          <h2>{copy.socialTitle}</h2>
          <ul>{socialIds.map((id) => {
            const link = links[id];
            return link.href && link.verification === "provided" ? <li key={id}><a href={link.href} target="_blank" rel="noreferrer"><span>{link.label}</span><span className={styles.socialValue}>{link.value}</span><Icon name="arrow-up-right" /></a></li> : null;
          })}</ul>
        </nav>
      </aside>
      <ContactForm />
    </div>
  </article>;
}
