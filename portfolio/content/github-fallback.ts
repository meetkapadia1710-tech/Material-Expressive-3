import type { GitHubStats } from "@/lib/github";

export const githubFallbackStats: GitHubStats = {
  publicRepos: 18,
  followers: 4,
  languages: [
    ["TypeScript", 9],
    ["Python", 4],
    ["JavaScript", 3],
    ["Go", 2],
    ["HTML", 1],
    ["C++", 1],
  ],
  recent: [
    {
      name: "Hindsight",
      html_url: "https://github.com/meetkapadia1710-tech/Hindsight",
      language: "Python",
      updated_at: "2026-07-28T18:00:00Z",
      pushed_at: "2026-07-28T18:00:00Z",
    },
    {
      name: "Attendance-Manager",
      html_url: "https://github.com/meetkapadia1710-tech/Attendance-Manager",
      language: "TypeScript",
      updated_at: "2026-08-15T12:00:00Z",
      pushed_at: "2026-08-15T12:00:00Z",
    },
    {
      name: "BD_Buildcon",
      html_url: "https://github.com/meetkapadia1710-tech/BD_Buildcon",
      language: "TypeScript",
      updated_at: "2026-07-31T19:18:26Z",
      pushed_at: "2026-07-31T19:18:22Z",
    },
    {
      name: "PickleRage_Booking",
      html_url: "https://github.com/meetkapadia1710-tech/PickleRage_Booking",
      language: "TypeScript",
      updated_at: "2026-06-26T09:47:09Z",
      pushed_at: "2026-06-26T09:47:05Z",
    },
  ],
  activity: [
    ["2025-12", 2],
    ["2026-01", 3],
    ["2026-02", 5],
    ["2026-03", 4],
    ["2026-04", 6],
    ["2026-05", 8],
    ["2026-06", 12],
    ["2026-07", 19],
    ["2026-08", 14],
    ["2026-09", 11],
    ["2026-10", 17],
    ["2026-11", 7],
  ],
};
