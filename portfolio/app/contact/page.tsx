import { ContactPage } from "@/components/contact/contact-page";
import { contactCopy } from "@/content/contact";

export const metadata = { alternates: { canonical: "/contact" }, title: contactCopy.title, description: contactCopy.description };

export default function Page() {
  return <ContactPage />;
}
