import type { SkillCategory, SkillItem } from "@/content/types";

export function groupSkillItems(category: SkillCategory) {
  const handsOn: SkillItem[] = [];
  const learningStudy: SkillItem[] = [];
  for (const item of category.items) {
    if (!item.name.trim()) continue;
    const normalized = { ...item, name: item.name.trim() };
    if (item.practice === "hands-on") handsOn.push(normalized);
    else learningStudy.push(normalized);
  }
  return { handsOn, learningStudy };
}
