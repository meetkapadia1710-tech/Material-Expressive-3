import { ContactPage } from "@/components/contact/contact-page";
import { contactCopy } from "@/content/contact";

export const metadata = { title: contactCopy.title };

export default function Page() {
  return <ContactPage />;
}
