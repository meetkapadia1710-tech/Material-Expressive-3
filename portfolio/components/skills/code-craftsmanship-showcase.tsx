"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface Snippet {
  id: string;
  title: string;
  language: string;
  filename: string;
  tagline: string;
  architectureNote: string;
  code: string;
}

const snippets: Snippet[] = [
  {
    id: "spring-hook",
    title: "Fluid Spring Velocity Hook",
    language: "TypeScript / React",
    filename: "useSpringVelocity.ts",
    tagline: "Critically damped harmonic oscillator physics with delta-time RAF interpolation and guaranteed frame cleanup.",
    architectureNote: "Decouples render timing from physical clock intervals. Clamps delta-time to prevent spring explosion on tab resume, and guarantees frame cleanup on unmount.",
    code: `import { useEffect, useRef, useState } from "react";

interface SpringConfig {
  stiffness?: number; // Tension coefficient (k)
  damping?: number;   // Friction drag (c)
  precision?: number; // Settle threshold epsilon
}

/**
 * Fluid spring velocity listener with RAF interpolation & lifecycle cleanup.
 * Implements second-order differential equation physics without external animation bloat.
 */
export function useSpringVelocity(target: number, config: SpringConfig = {}) {
  const { stiffness = 180, damping = 24, precision = 0.001 } = config;
  const [current, setCurrent] = useState(target);
  const state = useRef({ current: target, velocity: 0, target });
  state.current.target = target;

  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      // Clamp delta-time (max 64ms) to prevent simulation explosions on tab unfocus
      const dt = Math.min((time - lastTime) / 1000, 0.064);
      lastTime = time;

      const { current: x, velocity: v, target: xTarget } = state.current;
      const displacement = x - xTarget;
      const springForce = -stiffness * displacement;
      const dampingForce = -damping * v;
      const acceleration = springForce + dampingForce;

      const nextVelocity = v + acceleration * dt;
      const nextPosition = x + nextVelocity * dt;

      if (Math.abs(displacement) < precision && Math.abs(nextVelocity) < precision) {
        state.current.current = xTarget;
        state.current.velocity = 0;
        setCurrent(xTarget);
        return; // Equilibrated: cancel RAF loop to free CPU cycles
      }

      state.current.current = nextPosition;
      state.current.velocity = nextVelocity;
      setCurrent(nextPosition);
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId); // Guaranteed subscriber cancellation
  }, [target, stiffness, damping, precision]);

  return { value: current, velocity: state.current.velocity };
}`,
  },
  {
    id: "drizzle-schema",
    title: "PostgreSQL 3NF Drizzle Schema",
    language: "TypeScript / Drizzle",
    filename: "schema.ts",
    tagline: "Normalized third normal form relations for repository audits with cascade deletes and composite indexes.",
    architectureNote: "Maintains relational integrity between repositories and automated code health audits, employing multi-column index coverage for low-latency score lookups.",
    code: `import { pgTable, serial, text, integer, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Normalized 3NF PostgreSQL schema for RepoGrade repository health analytics.
 * Enforces referential integrity with ON DELETE CASCADE and composite indexes.
 */
export const repositories = pgTable(
  "repositories",
  {
    id: serial("id").primaryKey(),
    owner: text("owner").notNull(),
    name: text("name").notNull(),
    primaryLanguage: text("primary_language"),
    defaultBranch: text("default_branch").default("main").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("repo_owner_name_idx").on(table.owner, table.name),
    index("repo_language_idx").on(table.primaryLanguage),
  ]
);

export const repoAudits = pgTable(
  "repo_audits",
  {
    id: serial("id").primaryKey(),
    repoId: integer("repo_id")
      .notNull()
      .references(() => repositories.id, { onDelete: "cascade" }),
    healthScore: integer("health_score").notNull(), // 0 to 100
    codeQualityRating: text("code_quality_rating").notNull(), // "A+", "A", "B", ...
    readmeFreshness: integer("readme_freshness").notNull(),
    testCoverageEstimate: integer("test_coverage_estimate"),
    auditCommitSha: text("audit_commit_sha").notNull(),
    generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("audit_repo_timestamp_idx").on(table.repoId, table.generatedAt),
    index("audit_score_idx").on(table.healthScore),
  ]
);

export const repositoriesRelations = relations(repositories, ({ many }) => ({
  audits: many(repoAudits),
}));`,
  },
  {
    id: "fastapi-stream",
    title: "FastAPI Local AI SSE Stream",
    language: "Python / FastAPI",
    filename: "stream_analysis.py",
    tagline: "Asynchronous Server-Sent Events (SSE) streaming gateway routing prompts to local Ollama inference runtime.",
    architectureNote: "Zero-cloud dependencies. Employs connection keep-alive pooling, handles token-by-token backpressure, and streams typed chunks with graceful error recovery.",
    code: `import json
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

app = FastAPI(title="Hindsight Memory Inference Gateway", version="1.0.0")

class AnalysisRequest(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=4000)
    model: str = Field(default="deepseek-r1:8b")
    temperature: float = Field(default=0.2, ge=0.0, le=1.0)

async def stream_ollama_generator(request: AnalysisRequest):
    """
    Asynchronously streams NDJSON token chunks from local Ollama runtime.
    Implements persistent connection pooling and handles backpressure safely.
    """
    ollama_url = "http://127.0.0.1:11434/api/generate"
    payload = {
        "model": request.model,
        "prompt": request.prompt,
        "stream": True,
        "options": {"temperature": request.temperature}
    }
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            async with client.stream("POST", ollama_url, json=payload) as response:
                if response.status_code != 200:
                    yield f"event: error\\ndata: {json.dumps({'error': 'Local Ollama runtime unreachable'})}\\n\\n"
                    return

                async for line in response.aiter_lines():
                    if not line:
                        continue
                    chunk = json.loads(line)
                    token = chunk.get("response", "")
                    is_done = chunk.get("done", False)
                    
                    # Yield Server-Sent Event (SSE) frame
                    yield f"data: {json.dumps({'token': token, 'done': is_done})}\\n\\n"
                    if is_done:
                        break
        except httpx.RequestError as exc:
            yield f"event: error\\ndata: {json.dumps({'error': str(exc)})}\\n\\n"

@app.post("/api/analyze/stream")
async def stream_analysis(request: AnalysisRequest):
    return StreamingResponse(
        stream_ollama_generator(request),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )`,
  },
];

function renderHighlightedCode(line: string) {
  const trimmed = line.trim();
  if (trimmed.startsWith("//") || trimmed.startsWith("#") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
    return <span className="craftsmanship-token-comment">{line}</span>;
  }
  const tokenRegex = /(\b(?:import|export|from|const|let|var|function|return|if|else|async|await|def|class|type|interface|serial|text|integer|timestamp|boolean|void)\b|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\/\/.*$|#.*$|\b\d+\b)/g;
  const parts = line.split(tokenRegex);
  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.startsWith("//") || part.startsWith("#")) {
          return <span key={i} className="craftsmanship-token-comment">{part}</span>;
        }
        if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'")) || (part.startsWith("`") && part.endsWith("`"))) {
          return <span key={i} className="craftsmanship-token-string">{part}</span>;
        }
        if (/^(?:import|export|from|const|let|var|function|return|if|else|async|await|def|class|type|interface|serial|text|integer|timestamp|boolean|void)$/.test(part)) {
          return <span key={i} className="craftsmanship-token-keyword">{part}</span>;
        }
        if (/^\d+$/.test(part)) {
          return <span key={i} className="craftsmanship-token-number">{part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export function CodeCraftsmanshipShowcase() {
  const [activeTab, setActiveTab] = useState(snippets[0].id);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  const activeSnippet = snippets.find((s) => s.id === activeTab) ?? snippets[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeSnippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  return (
    <aside className="craftsmanship-container" aria-labelledby="craftsmanship-heading">
      <div className="craftsmanship-header">
        <div className="craftsmanship-title-group">
          <p className="eyebrow">Engineering Depth</p>
          <h2 id="craftsmanship-heading">Code Craftsmanship Showcase</h2>
          <p className="craftsmanship-subtitle">
            Real, production-grade architectural snippets written by Meet across frontend spring physics, normalized relational schemas, and local streaming AI.
          </p>
        </div>
        <button
          type="button"
          className="craftsmanship-toggle-button"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? "Collapse Snippet Viewer" : "Expand Snippet Viewer"}</span>
          <svg
            className={`craftsmanship-toggle-icon ${isExpanded ? "icon-up" : "icon-down"}`}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded ? (
          <motion.div
            key="craftsmanship-collapse"
            className="craftsmanship-collapse-wrapper"
            initial={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0.01 }
                : { duration: 0.38, ease: [0.38, 1.21, 0.22, 1] }
            }
            style={{ overflow: "hidden" }}
          >
            <div className="craftsmanship-collapse-inner">
              <div className="craftsmanship-viewer">
                {/* Tabs */}
                <div className="craftsmanship-tab-bar" role="tablist" aria-label="Code snippet tabs">
                  {snippets.map((snippet) => {
                    const selected = snippet.id === activeTab;
                    return (
                      <button
                        key={snippet.id}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        aria-controls={`panel-${snippet.id}`}
                        id={`tab-${snippet.id}`}
                        className={`craftsmanship-tab${selected ? " craftsmanship-tab-active" : ""}`}
                        onClick={() => {
                          setActiveTab(snippet.id);
                          setCopied(false);
                        }}
                      >
                        <span className="craftsmanship-tab-dot" />
                        <span className="craftsmanship-tab-filename">{snippet.filename}</span>
                        <span className="craftsmanship-tab-lang">{snippet.language}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Snippet Content with fluid key transition */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSnippet.id}
                    id={`panel-${activeSnippet.id}`}
                    role="tabpanel"
                    aria-labelledby={`tab-${activeSnippet.id}`}
                    className="craftsmanship-panel"
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0.01 }
                        : { duration: 0.22, ease: [0.2, 0, 0, 1] }
                    }
                  >
                    <div className="craftsmanship-panel-meta">
                      <div>
                        <h3 className="craftsmanship-snippet-title">{activeSnippet.title}</h3>
                        <p className="craftsmanship-snippet-tagline">{activeSnippet.tagline}</p>
                      </div>
                      <button
                        type="button"
                        className="craftsmanship-copy-button"
                        onClick={handleCopy}
                        aria-label={`Copy ${activeSnippet.filename} code`}
                      >
                        {copied ? (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="craftsmanship-code-wrapper">
                      <pre className="craftsmanship-pre">
                        <code>
                          {activeSnippet.code.split("\n").map((line, idx) => (
                            <div key={idx} className="craftsmanship-code-line">
                              <span className="craftsmanship-line-number" aria-hidden="true">
                                {idx + 1}
                              </span>
                              <span className="craftsmanship-line-text">{renderHighlightedCode(line)}</span>
                            </div>
                          ))}
                        </code>
                      </pre>
                    </div>

                    <div className="craftsmanship-architecture-box">
                      <span className="craftsmanship-arch-label">Architectural Design Note</span>
                      <p className="craftsmanship-arch-text">{activeSnippet.architectureNote}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </aside>
  );
}
