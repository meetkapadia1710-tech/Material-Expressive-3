import type { ContentLink, LinkId } from "./types";

// "provided" means supplied by Meet, not independently verified or scraped.
export const links: Record<LinkId, ContentLink> = {
  email: { id: "email", label: "Email", value: "meetkapadia1710@gmail.com", href: "mailto:meetkapadia1710@gmail.com", verification: "provided" },
  github: { id: "github", label: "GitHub", value: "meetkapadia1710-tech", href: "https://github.com/meetkapadia1710-tech", verification: "provided" },
  linkedin: { id: "linkedin", label: "LinkedIn", value: "Meet Kapadia", href: "https://www.linkedin.com/in/meet-kapadia17", verification: "provided" },
  leetcode: { id: "leetcode", label: "LeetCode", value: "Code-Hacker_17", href: "https://leetcode.com/u/Code-Hacker_17/", verification: "provided" },
  codechef: { id: "codechef", label: "CodeChef", value: "neat_otters_97", href: "https://www.codechef.com/users/neat_otters_97", verification: "provided" },
  codolio: { id: "codolio", label: "Codolio", value: "Lucifer_17", href: "https://codolio.com/profile/Lucifer_17", verification: "provided" },
  geeksforgeeks: { id: "geeksforgeeks", label: "GeeksforGeeks", value: "meetkapa9w1y", href: "https://www.geeksforgeeks.org/profile/meetkapa9w1y", verification: "unverified" },
  resume: { id: "resume", label: "Resume", value: null, href: "https://miniresumemeet.vercel.app", verification: "unverified" },
};

export const footerLinkIds = ["github", "linkedin", "email"] as const satisfies readonly LinkId[];
