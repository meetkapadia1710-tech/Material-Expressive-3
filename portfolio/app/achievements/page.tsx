import { AchievementsPage } from "@/components/achievements/achievements-page";
import { Suspense } from "react";
import { GitHubSection, GitHubSkeleton } from "@/components/achievements/github-section";
import { achievementsPageCopy } from "@/content/achievements";
import { buildAchievementsJsonLd, getCodingStats } from "@/lib/coding-stats";
import styles from "@/components/achievements/achievements-page.module.css";

export const revalidate = 3600;

export const metadata = {
  alternates: { canonical: "/achievements" },
  title: achievementsPageCopy.title,
  description: achievementsPageCopy.description,
};

export default async function Page() {
  const codingStats = await getCodingStats();
  const jsonLd = buildAchievementsJsonLd(codingStats);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AchievementsPage className={styles.page} codingStats={codingStats}>
        <Suspense fallback={<GitHubSkeleton />}>
          <GitHubSection codingStats={codingStats} />
        </Suspense>
      </AchievementsPage>
    </>
  );
}
