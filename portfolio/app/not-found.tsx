import Link from "next/link";
import { siteCopy } from "@/content/profile";
export default function NotFound() { return <section className="placeholder-page page-width"><p className="eyebrow">{siteCopy.notFound.eyebrow}</p><h1>{siteCopy.notFound.title}</h1><p className="section-description">{siteCopy.notFound.description}</p><Link className="button button-primary" href="/">{siteCopy.notFound.linkLabel}</Link></section>; }
