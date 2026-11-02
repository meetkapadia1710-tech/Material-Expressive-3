import { skillCategories, skillsPageCopy } from "@/content/skills";
import type { SkillCategory } from "@/content/types";
import { SkillsInteractiveView } from "./skills-interactive-view";
import { CodeCraftsmanshipShowcase } from "./code-craftsmanship-showcase";
import { LearningRoadmap } from "./learning-roadmap";

export function SkillsPage({
  categories = skillCategories,
  className = "",
}: {
  categories?: readonly SkillCategory[];
  className?: string;
}) {
  const isCustomCategories = categories !== skillCategories;

  return (
    <article className={`page-width ${className}`}>
      <header className="skills-page-header">
        <p className="eyebrow">{skillsPageCopy.eyebrow}</p>
        <h1>{skillsPageCopy.title}</h1>
        <p>{skillsPageCopy.description}</p>
      </header>

      {/* Main Interactive Skills Explorer */}
      <SkillsInteractiveView
        categories={categories}
        groupLabels={skillsPageCopy.groupLabels}
      />

      {/* When viewing the full portfolio, render Code Craftsmanship and Systems Roadmap */}
      {!isCustomCategories ? (
        <>
          <CodeCraftsmanshipShowcase />
          <LearningRoadmap />
        </>
      ) : null}
    </article>
  );
}
