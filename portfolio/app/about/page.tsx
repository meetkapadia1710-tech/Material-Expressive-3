import { AboutPage } from "@/components/about/about-page";
import { aboutCopy, pageCopy } from "@/content/profile";
import styles from "@/components/about/about-page.module.css";

export const metadata = { title: pageCopy.about.title, description: aboutCopy.bio };
export default function Page() { return <AboutPage className={styles.page} />; }
