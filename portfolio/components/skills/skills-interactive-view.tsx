"use client";

import { useState, useId, useMemo, useEffect, useRef, useLayoutEffect, useCallback } from "react";
import Link from "next/link";
import { projectCatalogCopy } from "@/content/projects";
import type { SkillCategory, SkillItem } from "@/content/types";
import { groupSkillItems } from "@/lib/skill-groups";
import { getSkillDetail, type SkillDetail } from "@/lib/skill-projects";
import type { LeetCodeStats } from "@/lib/leetcode";
import { MorphingShape } from "@/components/motion/morphing-shape";

interface SkillsInteractiveViewProps {
  categories: readonly SkillCategory[];
  groupLabels: {
    handsOn: string;
    learningStudy: string;
  };
  leetCodeStats?: LeetCodeStats | null;
}

type ViewMode = "all" | "hands-on" | "study";

const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: "all", label: "All Skills" },
  { value: "hands-on", label: "Production Stacks" },
  { value: "study", label: "Theoretical Foundations" },
];

export function SkillsInteractiveView({ categories, groupLabels, leetCodeStats = null }: SkillsInteractiveViewProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [activeSkill, setActiveSkill] = useState<SkillDetail | null>(null);

  // Sliding indicator for view-mode segmented group
  const [vmIndicator, setVmIndicator] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const vmGroupRef = useRef<HTMLDivElement>(null);
  const vmButtonRefs = useRef<Map<ViewMode, HTMLButtonElement>>(new Map());

  const skillDialog = useRef<HTMLDialogElement>(null);
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
            const detail = getSkillDetail(item.name, leetCodeStats);
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
  }, [categories, selectedCategory, viewMode, cleanQuery, leetCodeStats]);

  const totalMatchingSkills = useMemo(() => {
    return filteredCategories.reduce((acc, cat) => acc + cat.handsOn.length + cat.learningStudy.length, 0);
  }, [filteredCategories]);

  useEffect(() => {
    const dialog = skillDialog.current;
    if (activeSkill && !dialog?.open) dialog?.showModal();
  }, [activeSkill]);

  function dismissSkill() {
    skillDialog.current?.close();
    setActiveSkill(null);
  }

  function skillItem(name: string, index: number) {
    const detail = getSkillDetail(name, leetCodeStats);
    return <li key={`${name}-${index}`}>
      {detail ? <button type="button" className="skill-item-interactive" aria-haspopup="dialog" onClick={() => setActiveSkill(detail)}>
        {name}
        {detail.projects.length > 0 && <span className="skill-project-indicator" aria-hidden="true">↗ {detail.projects.length}</span>}
      </button> : name}
    </li>;
  }

  return (
    <div className="skills-interactive-container">
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
              placeholder="Filter skills or projects"
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
            data-scroll-region
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
            {VIEW_MODES.map(({ value, label }, index) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={viewMode === value}
                tabIndex={viewMode === value ? 0 : -1}
                ref={(el) => {
                  if (el) vmButtonRefs.current.set(value, el);
                  else vmButtonRefs.current.delete(value);
                }}
                className={`skills-mode-pill${viewMode === value ? " skills-mode-pill-active" : ""}`}
                onClick={(event) => { setViewMode(value); event.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" }); }}
                onKeyDown={(event) => {
                  const { key } = event;
                  const step = key === "ArrowRight" || key === "ArrowDown" ? 1
                    : key === "ArrowLeft" || key === "ArrowUp" ? -1 : 0;
                  if (!step) return;
                  event.preventDefault();
                  const next = VIEW_MODES[(index + step + VIEW_MODES.length) % VIEW_MODES.length];
                  const nextButton = vmButtonRefs.current.get(next.value);
                  nextButton?.focus({ preventScroll: true });
                  nextButton?.click();
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="skills-category-pills" data-scroll-region role="group" aria-label="Skill categories">
          <button
            type="button"
            aria-pressed={selectedCategory === "all"}
            className={`skills-cat-pill${selectedCategory === "all" ? " skills-cat-pill-active" : ""}`}
            onClick={(event) => { setSelectedCategory("all"); event.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" }); }}
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
                aria-pressed={isSelected}
                className={`skills-cat-pill${isSelected ? " skills-cat-pill-active" : ""}`}
                onClick={(event) => { setSelectedCategory(cat.id); event.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" }); }}
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
      <div className="skills-category-list">
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
                        {category.handsOn.map((item, index) => skillItem(item.name, index))}
                      </ul>
                    </div>
                  ) : null}

                  {category.learningStudy.length ? (
                    <div className="skills-practice" data-practice="learning-study">
                      <h3>{groupLabels.learningStudy}</h3>
                      <ul>
                        {category.learningStudy.map((item, index) => skillItem(item.name, index))}
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
        <dialog
          ref={skillDialog}
          className="skill-modal-content"
          aria-labelledby="skill-modal-title"
          data-lenis-prevent="true"
          onCancel={(event) => { event.preventDefault(); dismissSkill(); }}
          onClick={(event) => { if (event.target === event.currentTarget) {
            const box = event.currentTarget.getBoundingClientRect();
            if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dismissSkill();
          } }}
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
                onClick={dismissSkill}
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
                  Projects Using {activeSkill.name} ({activeSkill.projects.length})
                </h4>
                <div className="skill-modal-projects-list">
                  {activeSkill.projects.map((proj) => (
                    <div
                      key={proj.slug}
                      className="skill-modal-project-card"
                      data-project-slug={proj.slug}
                    >
                      <div className="skill-modal-card-top">
                        {proj.category ? <span className="skill-modal-card-cat">{proj.category}</span> : null}
                        {proj.status ? <span className="skill-modal-card-status">{projectCatalogCopy.statusLabels[proj.status]}</span> : null}
                      </div>
                      <h4 className="skill-modal-card-title">{proj.name}</h4>
                      <p className="skill-modal-card-tagline">{proj.tagline}</p>

                      <div className="skill-modal-links-row">
                        {proj.visibility === "public" ? (
                          <Link
                            href={`/projects/${proj.slug}`}
                            className="skill-modal-details-link"
                            onClick={dismissSkill}
                          >
                            <span>View Project Details</span>
                            <span className="skill-modal-arrow" aria-hidden="true">→</span>
                          </Link>
                        ) : null}
                        {proj.repoUrl ? (
                          <a
                            href={proj.repoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="skill-modal-repo-link"
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
        </dialog>
      ) : null}
    </div>
  );
}
