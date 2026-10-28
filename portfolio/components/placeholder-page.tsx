import Link from "next/link";
import type { PageCopy } from "@/content/types";
import { siteCopy } from "@/content/profile";
import { Icon } from "./icon";

export function PlaceholderPage({ copy }: { copy: PageCopy }) {
  return <section className="placeholder-page page-width">
    <p className="eyebrow"><span className="tiny-spark" aria-hidden="true">✳</span>{copy.eyebrow}</p>
    <h1>{copy.title}</h1>
    {copy.description ? <p className="section-description">{copy.description}</p> : null}
    <div className="placeholder-panel"><Icon name="spark" /><h2>{siteCopy.placeholder.label}</h2><p>{siteCopy.placeholder.description}</p><Link className="button button-primary" href="/">{siteCopy.placeholder.linkLabel}<Icon name="arrow-right" /></Link></div>
  </section>;
}
