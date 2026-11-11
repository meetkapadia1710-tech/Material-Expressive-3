import { SkillsPage } from "@/components/skills/skills-page";
import { skillsPageCopy } from "@/content/skills";
import { getCodingStats } from "@/lib/coding-stats";
import styles from "@/components/skills/skills-page.module.css";

export const revalidate = 3600;

export const metadata = {
  alternates: { canonical: "/skills" },
  title: skillsPageCopy.title,
  description: skillsPageCopy.description,
};

export default async function Page() {
  const codingStats = await getCodingStats();
  return <SkillsPage className={styles.page} leetCodeStats={codingStats.leetcode} />;
}
