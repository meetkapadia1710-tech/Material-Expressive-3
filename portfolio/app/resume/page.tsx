import { ResumePage } from "@/components/resume/resume-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume · Meet Kapadia",
  description: "Curriculum Vitae and Technical Experience of Meet Kapadia, Computer Science undergraduate at IIIT Vadodara.",
};

export default function Page() {
  return <ResumePage />;
}

