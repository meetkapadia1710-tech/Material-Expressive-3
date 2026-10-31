import { CopyEmail } from "./interface-controls";
import { footerLinkIds, links } from "@/content/links";
import { profile, siteCopy } from "@/content/profile";
import { Icon } from "./icon";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div><p className="footer-name">{profile.name}<span aria-hidden="true"> ✳</span></p><p className="footer-note">{siteCopy.footerNote}</p></div>
      <nav className="footer-links" aria-label={siteCopy.footerLabel}>
        {footerLinkIds.map((id) => {
          const link = links[id];
          return link.href ? <a key={id} href={link.href} className="text-link">{link.label}<Icon name="arrow-up-right" />{link.verification === "unverified" ? <span className="verification-label">{siteCopy.unverified}</span> : null}</a> : null;
        })}
      {links.email.value ? <CopyEmail email={links.email.value} /> : null}</nav>
    </footer>
  );
}
