import { contactCopy as copy } from "@/content/contact";

export const contactLimits = { name: 100, email: 120, subject: 160, message: 5000 } as const;
export type ContactField = keyof typeof contactLimits;
export type ContactValues = Record<ContactField, string>;
export type ContactErrors = Partial<Record<ContactField, string>>;

export function normalizeContact({ name, email, subject, message }: ContactValues): ContactValues {
  return { name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() };
}

export function validateContact(values: ContactValues): ContactErrors {
  const { name, email, subject, message } = normalizeContact(values);
  const errors: ContactErrors = {};
  if (!name) errors.name = copy.errors.nameRequired;
  else if (name.length > contactLimits.name) errors.name = copy.errors.nameTooLong;
  if (!email) errors.email = "Enter your email address.";
  else if (email.length > contactLimits.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
  if (!subject) errors.subject = copy.errors.subjectRequired;
  else if (subject.length > contactLimits.subject) errors.subject = copy.errors.subjectTooLong;
  if (!message) errors.message = copy.errors.messageRequired;
  else if (message.length > contactLimits.message) errors.message = copy.errors.messageTooLong;
  return errors;
}

