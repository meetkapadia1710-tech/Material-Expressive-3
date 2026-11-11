"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

export type ShapeName = "roundedSquare" | "circle" | "scalloped" | "blob" | "clover" | "diamond";

const shapes: Record<ShapeName, string> = {
  roundedSquare: "var(--shape-polygon-rounded-square)",
  circle: "var(--shape-polygon-circle)",
  scalloped: "var(--shape-polygon-scalloped)",
  blob: "var(--shape-polygon-blob)",
  clover: "var(--shape-polygon-clover)",
  diamond: "var(--shape-polygon-diamond)",
};

type MorphingShapeProps = {
  children: ReactNode;
  className?: string;
  shape?: ShapeName;
  viewShape?: ShapeName;
  hoverShape?: ShapeName;
  focusShape?: ShapeName;
  pressShape?: ShapeName;
  selectedShape?: ShapeName;
  morphOnView?: boolean;
  morphed?: boolean;
  interactive?: boolean;
  label?: string;
};

export function MorphingShape({
  children,
  className = "",
  shape = "roundedSquare",
  viewShape = "scalloped",
  hoverShape = "circle",
  focusShape = "blob",
  pressShape = "scalloped",
  selectedShape = "blob",
  morphOnView = false,
  morphed = false,
  interactive = false,
  label = "Change decorative shape",
}: MorphingShapeProps) {
  const [selected, setSelected] = useState(false);
  const style = {
    "--morph-rest": shapes[shape],
    "--morph-view": shapes[viewShape],
    "--morph-hover": shapes[hoverShape],
    "--morph-focus": shapes[focusShape],
    "--morph-press": shapes[pressShape],
    "--morph-selected": shapes[selectedShape],
  } as CSSProperties & Record<string, string>;
  const classes = `shape-morph${morphOnView ? " morph-on-view" : ""}${interactive ? " shape-morph-button" : ""}${className ? ` ${className}` : ""}`;

  if (interactive) {
    return <button type="button" className={classes} style={style} aria-label={label} aria-pressed={selected} data-selected={selected || undefined} onClick={() => setSelected((current) => !current)}>{children}</button>;
  }

  return <span className={classes} style={style} aria-hidden="true" data-morph-in-view={morphOnView || undefined} data-morphed={morphed ? "true" : undefined}>{children}</span>;
}
