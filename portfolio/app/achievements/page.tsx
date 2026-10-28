import { AchievementsPage } from "@/components/achievements/achievements-page";
import { Suspense } from "react";
import { GitHubSection, GitHubSkeleton } from "@/components/achievements/github-section";
export const revalidate = 86400;
import { achievementsPageCopy } from "@/content/achievements";
import styles from "@/components/achievements/achievements-page.module.css";

export const metadata = { title: achievementsPageCopy.title, description: achievementsPageCopy.description };
export default function Page() { return <><AchievementsPage className={styles.page} /><Suspense fallback={<GitHubSkeleton />}><GitHubSection /></Suspense></>; }
