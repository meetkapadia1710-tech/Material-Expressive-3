import { CopyEmail } from "@/components/interface-controls";
import { links } from "@/content/links";
import { PlaceholderPage } from "@/components/placeholder-page";
import { pageCopy } from "@/content/profile";
export const metadata = { title: pageCopy.contact.title };
export default function Page() { return <><PlaceholderPage copy={pageCopy.contact} /><div className="page-width">{links.email.value ? <><p><a className="text-link" href={links.email.href ?? undefined}>{links.email.value}</a></p><CopyEmail email={links.email.value} /></> : null}</div></>; }
