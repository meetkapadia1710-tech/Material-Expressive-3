import { AboutPage } from "@/components/about/about-page";
import { aboutCopy, pageCopy } from "@/content/profile";
import { getCodingStats } from "@/lib/coding-stats";
import styles from "@/components/about/about-page.module.css";

export const revalidate = 3600;

export const metadata = {
  alternates: { canonical: "/about" },
  title: pageCopy.about.title,
  description: aboutCopy.bio,
};

export default async function Page() {
  const codingStats = await getCodingStats();
  return <AboutPage className={styles.page} leetCodeStats={codingStats.leetcode} />;
}
