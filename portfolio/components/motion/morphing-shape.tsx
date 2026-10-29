"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

export type ShapeName = "roundedSquare" | "circle" | "scalloped" | "blob";

const POINT_COUNT = 32;

function polygon(shape: ShapeName) {
  const points = Array.from({ length: POINT_COUNT }, (_, index) => {
    const angle = (index / POINT_COUNT) * Math.PI * 2 - Math.PI / 2;
    if (shape === "roundedSquare") {
      const exponent = 0.52;
      const x = Math.sign(Math.cos(angle)) * Math.pow(Math.abs(Math.cos(angle)), exponent);
      const y = Math.sign(Math.sin(angle)) * Math.pow(Math.abs(Math.sin(angle)), exponent);
      return `${((x + 1) * 50).toFixed(2)}% ${((y + 1) * 50).toFixed(2)}%`;
    }
    let radius = 0.5;
    if (shape === "scalloped") radius = 0.45 + 0.05 * Math.cos(index * Math.PI);
    if (shape === "blob") radius = 0.47 + 0.045 * Math.sin(angle * 3 + 0.4) + 0.025 * Math.sin(angle * 5 - 0.7);
    return `${(50 + Math.cos(angle) * radius * 100).toFixed(2)}% ${(50 + Math.sin(angle) * radius * 100).toFixed(2)}%`;
  });
  return `polygon(${points.join(",")})`;
}

const shapes: Record<ShapeName, string> = {
  roundedSquare: polygon("roundedSquare"),
  circle: polygon("circle"),
  scalloped: polygon("scalloped"),
  blob: polygon("blob"),
};

type MorphingShapeProps = {
  children: ReactNode;
  className: string;
  shape?: ShapeName;
  viewShape?: ShapeName;
  hoverShape?: ShapeName;
  focusShape?: ShapeName;
  pressShape?: ShapeName;
  selectedShape?: ShapeName;
  morphOnView?: boolean;
  interactive?: boolean;
  label?: string;
};

export function MorphingShape({
  children,
  className,
  shape = "roundedSquare",
  viewShape = "scalloped",
  hoverShape = "circle",
  focusShape = "blob",
  pressShape = "scalloped",
  selectedShape = "blob",
  morphOnView = false,
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
  } as CSSProperties;
  const classes = `shape-morph${morphOnView ? " morph-on-view" : ""}${interactive ? " shape-morph-button" : ""} ${className}`;

  if (interactive) {
    return <button type="button" className={classes} style={style} aria-label={label} aria-pressed={selected} data-selected={selected || undefined} onClick={() => setSelected((current) => !current)}>{children}</button>;
  }

  return <span className={classes} style={style} aria-hidden="true" data-morph-in-view={morphOnView || undefined}>{children}</span>;
}
