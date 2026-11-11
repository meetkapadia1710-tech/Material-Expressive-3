import { ResumePage } from "@/components/resume/resume-page";
import { getCodingStats } from "@/lib/coding-stats";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: "/resume" },
  title: "Resume · Meet Kapadia",
  description: "Curriculum Vitae and Technical Experience of Meet Kapadia, Computer Science undergraduate at IIIT Vadodara.",
};

export default async function Page() {
  const codingStats = await getCodingStats();
  return <ResumePage codingStats={codingStats} />;
}
