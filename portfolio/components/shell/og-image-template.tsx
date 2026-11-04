import { ImageResponse } from "next/og";
import { OG_COLORS, OG_IMAGE_SIZE } from "@/lib/og-tokens";

interface OgPreviewData {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  badge?: string;
  stack?: readonly string[];
}

export function renderOgImage(data: OgPreviewData): ImageResponse {
  const titleClamped = data.title.length > 55 ? `${data.title.slice(0, 52)}...` : data.title;
  const subtitleClamped = data.subtitle && data.subtitle.length > 120
    ? `${data.subtitle.slice(0, 117)}...`
    : data.subtitle;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: OG_COLORS.background,
          padding: "48px",
          fontFamily: "Manrope, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Ambient Expressive Shapes */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(97, 66, 174, 0.35) 0%, rgba(20, 19, 24, 0) 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-80px",
            width: "440px",
            height: "440px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(227, 242, 156, 0.18) 0%, rgba(20, 19, 24, 0) 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Main Card Container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            backgroundColor: OG_COLORS.surface,
            border: `2px solid ${OG_COLORS.outlineVariant}`,
            borderRadius: "36px",
            padding: "48px 56px",
            position: "relative",
          }}
        >
          {/* Header Row: Brand Mark + Eyebrow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "16px",
                  backgroundColor: OG_COLORS.secondary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  fontWeight: "800",
                  color: OG_COLORS.onSecondary,
                  transform: "rotate(-6deg)",
                  position: "relative",
                }}
              >
                MK
                <div
                  style={{
                    position: "absolute",
                    top: "-3px",
                    right: "-3px",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: OG_COLORS.primaryContainer,
                    border: `2px solid ${OG_COLORS.surface}`,
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    color: OG_COLORS.onSurface,
                    letterSpacing: "-0.5px",
                  }}
                >
                  Meet Kapadia.
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    color: OG_COLORS.onSurfaceVariant,
                    letterSpacing: "0.04em",
                  }}
                >
                  Software Engineer & Systems Builder
                </span>
              </div>
            </div>

            {data.eyebrow ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 18px",
                  borderRadius: "9999px",
                  backgroundColor: OG_COLORS.surfaceContainerHigh,
                  border: `1px solid ${OG_COLORS.outlineVariant}`,
                  fontSize: "13px",
                  fontWeight: "700",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: OG_COLORS.primary,
                }}
              >
                {data.eyebrow}
              </div>
            ) : null}
          </div>

          {/* Focal Center Area: Title & Subtitle */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", margin: "24px 0" }}>
            {data.badge ? (
              <div style={{ display: "flex" }}>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    padding: "4px 14px",
                    borderRadius: "8px",
                    backgroundColor: OG_COLORS.secondaryContainer,
                    color: OG_COLORS.onSecondaryContainer,
                  }}
                >
                  {data.badge}
                </span>
              </div>
            ) : null}

            <div
              style={{
                fontSize: titleClamped.length > 30 ? "46px" : "56px",
                fontWeight: "800",
                color: OG_COLORS.onSurface,
                letterSpacing: "-1.5px",
                lineHeight: 1.15,
              }}
            >
              {titleClamped}
            </div>

            {subtitleClamped ? (
              <div
                style={{
                  fontSize: "22px",
                  color: OG_COLORS.onSurfaceVariant,
                  lineHeight: 1.45,
                  maxWidth: "920px",
                }}
              >
                {subtitleClamped}
              </div>
            ) : null}

            {data.stack?.length ? (
              <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
                {data.stack.slice(0, 5).map((tech) => (
                  <span
                    key={tech}
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      padding: "6px 14px",
                      borderRadius: "8px",
                      backgroundColor: OG_COLORS.surfaceContainerHighest,
                      color: OG_COLORS.onSurface,
                      border: `1px solid ${OG_COLORS.outlineVariant}`,
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {/* Footer Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: `1px solid ${OG_COLORS.outlineVariant}`,
              paddingTop: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "15px", color: OG_COLORS.onSurfaceVariant }}>
                meetkapadia.dev
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                color: OG_COLORS.onSurfaceVariant,
              }}
            >
              <span>Material 3 Expressive Architecture</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_IMAGE_SIZE,
    }
  );
}

