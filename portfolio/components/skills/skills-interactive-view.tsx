"use client";

import { useState, useId, useMemo, useEffect, useRef, useLayoutEffect, useCallback } from "react";
import Link from "next/link";
import type { SkillCategory, SkillItem } from "@/content/types";
import { groupSkillItems } from "@/lib/skill-groups";
import { getSkillDetail, type SkillDetail } from "@/lib/skill-projects";
import { MorphingShape } from "@/components/motion/morphing-shape";

interface SkillsInteractiveViewProps {
  categories: readonly SkillCategory[];
  groupLabels: {
    handsOn: string;
    learningStudy: string;
  };
}

type ViewMode = "all" | "hands-on" | "study";

const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: "all", label: "All Skills" },
  { value: "hands-on", label: "Production Stacks" },
  { value: "study", label: "Theoretical Foundations" },
];

export function SkillsInteractiveView({ categories, groupLabels }: SkillsInteractiveViewProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [activeSkill, setActiveSkill] = useState<SkillDetail | null>(null);

  // Sliding indicator for view-mode segmented group
  const [vmIndicator, setVmIndicator] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const vmGroupRef = useRef<HTMLDivElement>(null);
  const vmButtonRefs = useRef<Map<ViewMode, HTMLButtonElement>>(new Map());

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputId = useId();

  // Update sliding indicator position
  const updateVmIndicator = useCallback(() => {
    const btn = vmButtonRefs.current.get(viewMode);
    const container = vmGroupRef.current;
    if (!btn || !container) return;
    setVmIndicator({ left: btn.offsetLeft, width: btn.offsetWidth });
  }, [viewMode]);

  useLayoutEffect(() => {
    updateVmIndicator();
  }, [updateVmIndicator]);

  useEffect(() => {
    const ro = new ResizeObserver(() => updateVmIndicator());
    if (vmGroupRef.current) ro.observe(vmGroupRef.current);
    return () => ro.disconnect();
  }, [updateVmIndicator]);

  // Read initial filter values from URL query parameters on mount
  const hasHydratedUrl = useRef(false);
  const isSyncingFromUrl = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get("q");
    const catParam = params.get("category");
    const typeParam = params.get("type");

    if (qParam || catParam || (typeParam && typeParam !== "all")) {
      isSyncingFromUrl.current = true;
      if (qParam) setQuery(qParam);
      if (catParam) setSelectedCategory(catParam);
      if (typeParam === "all" || typeParam === "hands-on" || typeParam === "study") {
        setViewMode(typeParam as ViewMode);
      }
    }
    hasHydratedUrl.current = true;
  }, []);

  // Sync state changes to URL query parameters via replaceState (no page reload)
  useEffect(() => {
    if (!hasHydratedUrl.current) return;
    if (isSyncingFromUrl.current) {
      isSyncingFromUrl.current = false;
      return;
    }
    if (typeof window === "undefined") return;

    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (viewMode !== "all") params.set("type", viewMode);

    const qs = params.toString();
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    const currentQs = window.location.search.replace(/^\?/, "");
    if (currentQs !== qs) {
      window.history.replaceState(null, "", newUrl);
    }
  }, [query, selectedCategory, viewMode]);

  // Normalize search query
  const cleanQuery = query.trim().toLowerCase();

  // Filter categories and items based on search and viewMode
  const filteredCategories = useMemo(() => {
    return categories
      .map((category) => {
        // Category filter check
        if (selectedCategory !== "all" && category.id !== selectedCategory) {
          return null;
        }

        const { handsOn, learningStudy } = groupSkillItems(category);

        const filterItems = (items: readonly SkillItem[]) => {
          return items.filter((item) => {
            // ViewMode check
            if (viewMode === "hands-on" && item.practice !== "hands-on") return false;
            if (viewMode === "study" && item.practice === "hands-on") return false;

            // Search query check
            if (!cleanQuery) return true;
            const matchesName = item.name.toLowerCase().includes(cleanQuery);
            const matchesCategory = category.name.toLowerCase().includes(cleanQuery);
            const detail = getSkillDetail(item.name);
            const matchesRole = detail?.role.toLowerCase().includes(cleanQuery) ?? false;
            const matchesProjects = detail?.projects.some((p) => p.name.toLowerCase().includes(cleanQuery)) ?? false;

            return matchesName || matchesCategory || matchesRole || matchesProjects;
          });
        };

        const filteredHandsOn = filterItems(handsOn);
        const filteredLearningStudy = filterItems(learningStudy);

        if (!filteredHandsOn.length && !filteredLearningStudy.length) return null;

        return {
          ...category,
          handsOn: filteredHandsOn,
          learningStudy: filteredLearningStudy,
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);
  }, [categories, selectedCategory, viewMode, cleanQuery]);

  const totalMatchingSkills = useMemo(() => {
    return filteredCategories.reduce((acc, cat) => acc + cat.handsOn.length + cat.learningStudy.length, 0);
  }, [filteredCategories]);

  // Handle modal escape key and scroll lock
  useEffect(() => {
    if (!activeSkill) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveSkill(null);
    };
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeSkill]);

  // Client-side enhancement: decorate skill <li> with project indicators and interactive styling
  useEffect(() => {
    if (!containerRef.current) return;
    const items = containerRef.current.querySelectorAll<HTMLLIElement>(".skills-practice li");
    items.forEach((li) => {
      const skillName = (li.childNodes[0]?.textContent || li.textContent || "").trim();
      const detail = getSkillDetail(skillName);
      if (detail) {
        li.classList.add("skill-item-interactive");
        const projectCount = detail.projects.length;
        if (projectCount > 0) {
          li.setAttribute("title", `Click to view ${projectCount} project(s) using ${skillName}`);
          if (!li.querySelector(".skill-project-indicator")) {
            const indicator = document.createElement("span");
            indicator.className = "skill-project-indicator";
            indicator.textContent = ` ↗ ${projectCount}`;
            indicator.setAttribute("aria-hidden", "true");
            li.appendChild(indicator);
          }
        } else {
          li.setAttribute("title", `Click to view technical overview of ${skillName}`);
        }
      }
    });
  }, [filteredCategories]);

  // Event delegation for clicking a skill
  const handleListClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const li = target.closest("li");
    if (!li) return;

    const textNode = li.childNodes[0];
    const skillName = (textNode?.textContent || li.textContent || "").trim();
    if (!skillName) return;

    const detail = getSkillDetail(skillName);
    if (detail) {
      setActiveSkill(detail);
    }
  };

  return (
    <div className="skills-interactive-container" ref={containerRef}>
      {/* Sticky Search & Filter Toolbar */}
      <div className="skills-toolbar">
        <div className="skills-toolbar-top">
          <div className="skills-search-field">
            <span className="skills-search-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <label htmlFor={searchInputId} className="sr-only">
              Search skills or technologies
            </label>
            <input
              id={searchInputId}
              type="search"
              placeholder="Filter skills or linked projects (e.g. FastAPI, Drizzle, Graph, Go)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="skills-search-input"
              aria-label="Filter skills or linked projects"
            />
            {query ? (
              <button
                type="button"
                className="skills-search-clear"
                onClick={() => setQuery("")}
                aria-label="Clear skill search"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            ) : null}
          </div>

          {/* View Mode: M3 Segmented Group with shared sliding indicator */}
          <div
            ref={vmGroupRef}
            className="skills-view-mode-group"
            role="radiogroup"
            aria-label="Competency matrix filter"
          >
            {/* Shared sliding active indicator */}
            <span
              className="skills-mode-indicator"
              style={{
                transform: `translateX(${vmIndicator.left}px)`,
                width: `${vmIndicator.width}px`,
              }}
              aria-hidden="true"
            />
            {VIEW_MODES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={viewMode === value}
                ref={(el) => {
                  if (el) vmButtonRefs.current.set(value, el);
                  else vmButtonRefs.current.delete(value);
                }}
                className={`skills-mode-pill${viewMode === value ? " skills-mode-pill-active" : ""}`}
                onClick={() => setViewMode(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="skills-category-pills" role="tablist" aria-label="Skill categories">
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === "all"}
            className={`skills-cat-pill${selectedCategory === "all" ? " skills-cat-pill-active" : ""}`}
            onClick={() => setSelectedCategory("all")}
          >
            {selectedCategory === "all" ? (
              <svg className="skills-check-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : null}
            All Categories
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`skills-cat-pill${isSelected ? " skills-cat-pill-active" : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {isSelected ? (
                  <svg className="skills-check-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : null}
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Live Filter Result Count */}
        {(cleanQuery || selectedCategory !== "all" || viewMode !== "all") ? (
          <div className="skills-filter-summary" role="status" aria-live="polite">
            <span>
              Showing {totalMatchingSkills} skill{totalMatchingSkills === 1 ? "" : "s"} across {filteredCategories.length} categor{filteredCategories.length === 1 ? "y" : "ies"}
            </span>
            <button
              type="button"
              className="skills-reset-link"
              onClick={() => {
                setQuery("");
                setSelectedCategory("all");
                setViewMode("all");
              }}
            >
              Reset filters
            </button>
          </div>
        ) : null}
      </div>

      {/* Render Filtered Category Sections with Event Delegation for Cross-Linking */}
      <div className="skills-category-list" onClick={handleListClick}>
        {filteredCategories.map((category) => {
          return (
            <section
              className="skills-category"
              key={category.id}
              aria-labelledby={`skills-${category.id}-heading`}
            >
              <h2 id={`skills-${category.id}-heading`}>{category.name}</h2>
              <div className="skills-category-content">
                <div
                  className={`skills-practice-groups${category.handsOn.length && category.learningStudy.length ? " skills-practice-mixed" : ""}`}
                >
                  {category.handsOn.length ? (
                    <div className="skills-practice" data-practice="hands-on">
                      <h3>{groupLabels.handsOn}</h3>
                      <ul>
                        {category.handsOn.map((item, index) => (
                          <li key={`${item.name}-${index}`}>{item.name}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {category.learningStudy.length ? (
                    <div className="skills-practice" data-practice="learning-study">
                      <h3>{groupLabels.learningStudy}</h3>
                      <ul>
                        {category.learningStudy.map((item, index) => (
                          <li key={`${item.name}-${index}`}>{item.name}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
                {category.note?.trim() ? <p className="skills-category-note">{category.note}</p> : null}
              </div>
            </section>
          );
        })}

        {filteredCategories.length === 0 ? (
          <div className="skills-empty-state">
            <MorphingShape
              className="skills-empty-art"
              shape="blob"
              hoverShape="circle"
              pressShape="scalloped"
              morphOnView={true}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </MorphingShape>
            <p className="skills-empty-message">No skills match your current search and filter settings.</p>
            <button
              type="button"
              className="skills-reset-button"
              onClick={() => {
                setQuery("");
                setSelectedCategory("all");
                setViewMode("all");
              }}
            >
              Clear Search & Show All Skills
            </button>
          </div>
        ) : null}
      </div>

      {/* "Skills in Action" Cross-Link Modal / Drawer */}
      {activeSkill ? (
        <div
          className="skill-modal-backdrop"
          onClick={() => setActiveSkill(null)}
          data-lenis-prevent="true"
        >
          <div
            className="skill-modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="skill-modal-title"
            data-lenis-prevent="true"
          >
            <div className="skill-modal-header">
              <div>
                <p className="eyebrow">{activeSkill.role}</p>
                <h3 id="skill-modal-title" className="skill-modal-heading">
                  {activeSkill.name}
                </h3>
              </div>
              <button
                type="button"
                className="skill-modal-close"
                onClick={() => setActiveSkill(null)}
                aria-label="Close skill modal"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <p className="skill-modal-desc">{activeSkill.description}</p>

            {activeSkill.highlights && activeSkill.highlights.length > 0 ? (
              <div className="skill-modal-highlights-box">
                <span className="skill-modal-highlights-title">Core Engineering Applications</span>
                <ul className="skill-modal-highlights-list">
                  {activeSkill.highlights.map((h, i) => (
                    <li key={i}>
                      <span className="skill-modal-bullet">✓</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {activeSkill.projects.length > 0 ? (
              <>
                <h4 className="skill-modal-section-title">
                  Shipped Projects Implementing {activeSkill.name} ({activeSkill.projects.length})
                </h4>
                <div className="skill-modal-projects-list">
                  {activeSkill.projects.map((proj) => (
                    <div
                      key={proj.slug}
                      className="skill-modal-project-card"
                      data-project-slug={proj.slug}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest(".skill-modal-repo-link")) return;
                        const link = e.currentTarget.querySelector<HTMLAnchorElement>(".skill-modal-details-link");
                        if (link && target !== link && !link.contains(target)) {
                          setActiveSkill(null);
                          link.click();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          const link = e.currentTarget.querySelector<HTMLAnchorElement>(".skill-modal-details-link");
                          if (link) {
                            setActiveSkill(null);
                            link.click();
                          }
                        }
                      }}
                    >
                      <div className="skill-modal-card-top">
                        <span className="skill-modal-card-cat">{proj.category}</span>
                        <span className="skill-modal-card-status">{proj.status}</span>
                      </div>
                      <h4 className="skill-modal-card-title">{proj.name}</h4>
                      <p className="skill-modal-card-tagline">{proj.tagline}</p>

                      <div className="skill-modal-links-row">
                        <Link
                          href={`/projects/${proj.slug}`}
                          className="skill-modal-details-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSkill(null);
                          }}
                        >
                          <span>View Project Details</span>
                          <span className="skill-modal-arrow" aria-hidden="true">→</span>
                        </Link>
                        {proj.repoUrl ? (
                          <a
                            href={proj.repoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="skill-modal-repo-link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Source Code ↗
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
