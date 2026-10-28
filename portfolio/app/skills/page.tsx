import { SkillsPage } from "@/components/skills/skills-page";
import { skillsPageCopy } from "@/content/skills";
import styles from "@/components/skills/skills-page.module.css";

export const metadata = { title: skillsPageCopy.title, description: skillsPageCopy.description };
export default function Page() { return <SkillsPage className={styles.page} />; }
