import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const alt = "강산 업무지원";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const logoData = readFileSync(join(process.cwd(), "public", "logo2.png"));
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  const fontData = readFileSync(join(process.cwd(), "app", "fonts", "NotoSansKR-Bold-subset.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#181818",
          padding: "72px",
          position: "relative",
          fontFamily: "Noto Sans KR",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(168,85,247,0.22), transparent)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="" width={64} height={64} style={{ borderRadius: 14 }} />
          <div style={{ display: "flex", fontSize: 36, fontWeight: 700, color: "#ffffff" }}>강산 업무지원</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
          <div style={{ display: "flex", fontSize: 60, fontWeight: 700, color: "#ffffff", lineHeight: 1.25 }}>
            외근 · 일정 · 업무보고를
          </div>
          <div style={{ display: "flex", fontSize: 60, fontWeight: 700, color: "#ffffff", lineHeight: 1.25 }}>
            한곳에서 관리하세요
          </div>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: "#a1a1aa", marginTop: 22 }}>
            강산이엔지 업무지원 시스템
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Noto Sans KR",
          data: fontData,
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}
