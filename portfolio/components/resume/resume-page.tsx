"use client";

import { useState } from "react";
import Link from "next/link";
import { profile } from "@/content/profile";
import { links } from "@/content/links";
import { experience, certifications, codingProfiles, leetCodeStats } from "@/content/achievements";
import { projects } from "@/content/projects";
import { skillCategories } from "@/content/skills";
import { Icon } from "@/components/icon";
import { useToast } from "@/components/interface-controls";
import { copyToClipboard } from "@/lib/clipboard";
import { playTactileSound } from "@/lib/sound-engine";
import styles from "./resume-page.module.css";

export function ResumePage() {
  const notify = useToast();
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = async () => {
    // Instant optimistic tactile & visual response (0ms)
    setCopied(true);
    playTactileSound("click");
    notify("Plain text resume copied to clipboard!");
    const textResume = `MEET KAPADIA
Ahmedabad, Gujarat, India | meetkapadia1710@gmail.com
GitHub: https://github.com/meetkapadia1710-tech | LinkedIn: https://www.linkedin.com/in/meet-kapadia17
LeetCode: https://leetcode.com/u/Code-Hacker_17/ (763+ solved, 337 Medium)

EDUCATION
Indian Institute of Information Technology Vadodara (IIIT Vadodara)
B.Tech in Computer Science and Engineering (2024 – 2028)
CGPA: 8.31 / 10.0

Cosmos Castle International School — HSC Class XII: 89.8% (2024)
Sanskar Vidhya Bhavan — SSC Class X: 92.33% (2022)

EXPERIENCE
Bhumi Developers / BD Buildcon LLP — Web Development Intern (May 2026 – July 2026)
• Built and deployed two production corporate web applications in Bharuch using Next.js, React, TypeScript, Tailwind CSS, and Framer Motion.
• Designed responsive layouts, optimized asset delivery, and ensured cross-browser reliability.

FLAGSHIP PROJECTS
RepoGrade (Next.js 15, TypeScript, Go, PostgreSQL, Drizzle, Upstash Redis, Auth.js, Inngest, tree-sitter)
• GitHub repository scoring engine and automated README generator grounded in actual codebase syntax trees.
• Monorepo architecture containing web application, browser extension, and GitHub Action.

Hindsight (FastAPI, Python, Supermemory Local, Ollama, pywin32, Pillow, SQLite)
• Solo build for Supermemory localhost:6767 hackathon (July 2026).
• 100% local, privacy-first photographic memory tool for Windows with Win32 screen capture, on-device OCR, and offline vector embeddings.

PlayHub / PickleRage (React 19, TypeScript, Capacitor Android, Tailwind CSS, Firebase, Leaflet)
• Multi-tier sports court booking platform for Cricket and Pickleball supporting customer, owner, and admin roles.

PROBLEM SOLVING & COMPETITIVE PROGRAMMING
• LeetCode: 763+ Solved (371 Easy, 337 Medium, 55 Hard). Focused on Dynamic Programming, Sliding Window, Graphs, and Monotonic Stacks.
• CodeChef: 1462 Rating (neat_otters_97).
• GeeksforGeeks: 111+ Solved, 327 Score (meetkapa9w1y).

CERTIFICATIONS
• NVIDIA Deep Learning Institute: Fundamentals of Deep Learning (Credential: iCYD7o4TQD2sk23TRgpwJA)
• Oracle: OCI 2025 Generative AI Professional
• Apna College: Delta Full Stack Web Development (MERN)

SKILLS
• Languages: C, C++, Java, Python, JavaScript, TypeScript, Go, SQL
• Frontend: React, Next.js, Tailwind CSS, Framer Motion
• Backend: Node.js, Express, FastAPI, Django, REST APIs, JWT, Socket.IO
• Databases: PostgreSQL, MySQL, MongoDB, Firebase, Drizzle, Prisma
• Systems & Tools: Git, GitHub Actions, Vercel, Turborepo, Linux/WSL`;

    const success = await copyToClipboard(textResume);
    if (!success) {
      setCopied(false);
      notify("Failed to copy resume text");
    } else {
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const flagshipProjects = projects.filter(
    (p) => p.slug === "repograde" || p.slug === "hindsight" || p.slug === "playhub"
  );

  return (
    <div className={`page-width ${styles.resumeContainer}`}>
      {/* Action Toolbar */}
      <div className={styles.actionToolbar}>
        <div className={styles.actionGroup}>
          <Link href="/" className={styles.actionButton}>
            <span style={{ transform: "rotate(180deg)", display: "inline-flex" }}>
              <Icon name="arrow-right" />
            </span>
            <span>Portfolio</span>
          </Link>
          <button
            type="button"
            onClick={handleCopyText}
            className={`${styles.actionButton} ${copied ? styles.actionButtonCopied : ""}`}
            aria-label={copied ? "Copied to Clipboard!" : "Copy ATS Text from resume"}
          >
            <Icon name={copied ? "check" : "copy"} />
            <span>{copied ? "Copied to Clipboard!" : "Copy ATS Text"}</span>
          </button>
        </div>
        <div className={styles.actionGroup}>
          <button type="button" onClick={handlePrint} className={`${styles.actionButton} ${styles.actionButtonPrimary}`}>
            <Icon name="file" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <article className={styles.sheet}>
        <header className={styles.resumeHeader}>
          <div className={styles.headerTop}>
            <h1 className={styles.name}>{profile.name}</h1>
            <span className={styles.headline}>Full-Stack Developer · Systems & Applied AI</span>
          </div>
          <div className={styles.contactBar}>
            <span className={styles.contactItem}>
              <Icon name="spark" />
              <span>{profile.location.label}</span>
            </span>
            <a href={links.email.href ?? "#"} className={styles.contactItem}>
              <Icon name="mail" />
              <span>{links.email.value}</span>
            </a>
            <a href={links.github.href ?? "#"} target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
              <Icon name="github" />
              <span>github.com/{links.github.value}</span>
            </a>
            <a href={links.linkedin.href ?? "#"} target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
              <Icon name="linkedin" />
              <span>linkedin.com/in/meet-kapadia17</span>
            </a>
          </div>
        </header>

        {/* Education */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Education</h2>
          <div className={styles.entry}>
            <div className={styles.entryHeader}>
              <span className={styles.entryTitle}>{profile.education.institution}</span>
              <span className={styles.entryDate}>{profile.education.startYear} – {profile.education.endYear}</span>
            </div>
            <div className={styles.entrySubtitle}>
              {profile.education.degree} in {profile.education.field} · <strong>CGPA: {profile.education.cgpa} / 10.0</strong>
            </div>
          </div>
          <div className={styles.entry}>
            <div className={styles.entryHeader}>
              <span className={styles.entryTitle}>Cosmos Castle International School & Sanskar Vidhya Bhavan</span>
              <span className={styles.entryDate}>2022 – 2024</span>
            </div>
            <div className={styles.entrySubtitle}>
              Higher Secondary (Class XII HSC): <strong>89.8%</strong> · Secondary (Class X SSC): <strong>92.33%</strong>
            </div>
          </div>
        </section>

        {/* Experience */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Work Experience</h2>
          {experience.map((item) => (
            <div key={item.id} className={styles.entry}>
              <div className={styles.entryHeader}>
                <span className={styles.entryTitle}>{item.title}</span>
                <span className={styles.entryDate}>{item.dateLabel}</span>
              </div>
              <div className={styles.entrySubtitle}>{item.organization}</div>
              <ul className={styles.entryList}>
                <li>Architected and shipped two production corporate web platforms in Bharuch, Gujarat.</li>
                <li>Engineered responsive, type-safe full-stack user interfaces with Next.js, React, TypeScript, Tailwind CSS, and Framer Motion.</li>
                <li>Collaborated on real-world industrial infrastructure web deployment and performance optimization.</li>
              </ul>
            </div>
          ))}
        </section>

        {/* Flagship Projects */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Flagship Engineering Projects</h2>
          {flagshipProjects.map((proj) => (
            <div key={proj.slug} className={styles.entry}>
              <div className={styles.entryHeader}>
                <span className={styles.entryTitle}>{proj.name}</span>
                <span className={styles.entryDate}>{proj.category}</span>
              </div>
              <p className={styles.entryDesc}>{proj.tagline}</p>
              {proj.features?.length ? (
                <ul className={styles.entryList}>
                  {proj.features.map((feat, idx) => (
                    <li key={idx}>{feat}</li>
                  ))}
                </ul>
              ) : null}
              {proj.stack?.length ? (
                <div className={styles.tagsRow}>
                  {proj.stack.slice(0, 8).map((tool) => (
                    <span key={tool} className={styles.tag}>{tool}</span>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </section>

        {/* Problem Solving & Competitive Programming */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Problem Solving & Competitive Programming</h2>
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <span className={styles.metricValue}>{leetCodeStats.total}+</span>
              <span className={styles.metricLabel}>LeetCode Solved ({leetCodeStats.medium.count} Medium, {leetCodeStats.hard.count} Hard)</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricValue}>{codingProfiles.find((p) => p.id === "codechef")?.rating ?? 1462}</span>
              <span className={styles.metricLabel}>CodeChef Peak Rating (neat_otters_97)</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricValue}>111+ / 327</span>
              <span className={styles.metricLabel}>GeeksforGeeks Solved / Score (meetkapa9w1y)</span>
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Professional Certifications</h2>
          <ul className={styles.entryList}>
            {certifications.map((cert) => (
              <li key={cert.id}>
                <strong>{cert.title}</strong> — {cert.organization} ({cert.dateLabel})
                {cert.credentialId ? <span> · Credential ID: {cert.credentialId}</span> : null}
              </li>
            ))}
          </ul>
        </section>

        {/* Technical Skills */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Technical Skills</h2>
          <div className={styles.skillsTable}>
            {skillCategories
              .filter((cat) => cat.id !== "learning" && cat.id !== "fundamentals")
              .map((cat) => (
                <div key={cat.id} className={styles.skillRow}>
                  <span className={styles.skillCategory}>{cat.name}:</span>
                  <span className={styles.skillValues}>
                    {cat.items.map((i) => i.name).join(", ")}
                  </span>
                </div>
              ))}
          </div>
        </section>
      </article>
    </div>
  );
}
