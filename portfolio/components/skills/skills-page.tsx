import { skillCategories, skillsPageCopy } from "@/content/skills";
import type { SkillCategory } from "@/content/types";
import { groupSkillItems } from "@/lib/skill-groups";

export function SkillsPage({ categories = skillCategories, className = "" }: { categories?: readonly SkillCategory[]; className?: string }) {
  return <article className={`page-width ${className}`}>
    <header className="skills-page-header"><p className="eyebrow">{skillsPageCopy.eyebrow}</p><h1>{skillsPageCopy.title}</h1><p>{skillsPageCopy.description}</p></header>
    <div className="skills-category-list">{categories.map((category) => {
      const { handsOn, learningStudy } = groupSkillItems(category);
      if (!handsOn.length && !learningStudy.length) return null;
      return <section className="skills-category" key={category.id} aria-labelledby={`skills-${category.id}-heading`}>
        <h2 id={`skills-${category.id}-heading`}>{category.name}</h2>
        <div className="skills-category-content">
          <div className={`skills-practice-groups${handsOn.length && learningStudy.length ? " skills-practice-mixed" : ""}`}>
            {handsOn.length ? <div className="skills-practice" data-practice="hands-on"><h3>{skillsPageCopy.groupLabels.handsOn}</h3><ul>{handsOn.map((item, index) => <li key={`${item.name}-${index}`}>{item.name}</li>)}</ul></div> : null}
            {learningStudy.length ? <div className="skills-practice" data-practice="learning-study"><h3>{skillsPageCopy.groupLabels.learningStudy}</h3><ul>{learningStudy.map((item, index) => <li key={`${item.name}-${index}`}>{item.name}</li>)}</ul></div> : null}
          </div>
          {category.note?.trim() ? <p className="skills-category-note">{category.note}</p> : null}
        </div>
      </section>;
    })}</div>
  </article>;
}
