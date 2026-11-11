import { HomePage } from "@/components/home/home-page";
import { getCodingStats } from "@/lib/coding-stats";

export const revalidate = 3600;
export const metadata = { alternates: { canonical: "/" } };

export default async function Page() {
  const codingStats = await getCodingStats();
  return <HomePage leetCodeStats={codingStats.leetcode} />;
}
