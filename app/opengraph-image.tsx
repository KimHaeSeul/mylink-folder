import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "nodejs";

// Image metadata
export const alt = "My-Link - Minimalist Link Management";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Pretendard 폰트 페칭 함수 (한글 깨짐 방지용)
async function getFont(weight: "Regular" | "Bold") {
  const url = `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff/Pretendard-${weight}.woff`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch Pretendard-${weight} font`);
  }
  return await response.arrayBuffer();
}

export default async function Image() {
  let fontRegular: ArrayBuffer | null = null;
  let fontBold: ArrayBuffer | null = null;

  try {
    const [regular, bold] = await Promise.all([
      getFont("Regular"),
      getFont("Bold")
    ]);
    fontRegular = regular;
    fontBold = bold;
  } catch (error) {
    console.error("Font loading error for OG image:", error);
  }

  // 폰트 로드 실패 시 기본 폰트 배열 설정
  const fonts = fontRegular && fontBold
    ? [
        {
          name: "Pretendard",
          data: fontRegular,
          style: "normal" as const,
          weight: 400 as const,
        },
        {
          name: "Pretendard",
          data: fontBold,
          style: "normal" as const,
          weight: 700 as const,
        },
      ]
    : [];

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b", // zinc-950
          backgroundImage: "radial-gradient(circle at 50% -20%, rgba(124, 58, 237, 0.15), transparent 50%), radial-gradient(circle at 10% 90%, rgba(37, 99, 235, 0.08), transparent 40%)",
          color: "#ffffff",
          fontFamily: "Pretendard, sans-serif",
          position: "relative",
          padding: "60px 80px",
        }}
      >
        {/* 미니멀한 격자 선 장식 효과 (CSS 선 조합) */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            right: 40,
            bottom: 40,
            border: "1px solid rgba(255, 255, 255, 0.03)",
            borderRadius: "32px",
            display: "flex",
          }}
        />

        {/* 상단 장식 배지 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            backgroundColor: "rgba(124, 58, 237, 0.1)",
            border: "1px solid rgba(124, 58, 237, 0.2)",
            borderRadius: "9999px",
            marginBottom: "36px",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#a78bfa", letterSpacing: "0.05em" }}>
            MY-LINK.COM
          </span>
          <span style={{ color: "rgba(167, 139, 250, 0.4)", fontSize: "14px" }}>|</span>
          <span style={{ fontSize: "13px", fontWeight: 400, color: "#e4e4e7" }}>
            가장 심플한 프로필
          </span>
        </div>

        {/* 메인 콘텐츠 카드 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "800px",
            padding: "48px",
            backgroundColor: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "24px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* 타이틀 로고 */}
          <h1
            style={{
              fontSize: "64px",
              fontWeight: 800,
              margin: 0,
              background: "linear-gradient(to bottom, #ffffff 30%, #a1a1aa 100%)",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: "-0.03em",
              marginBottom: "16px",
            }}
          >
            My-Link
          </h1>

          {/* 슬로건 및 설명 */}
          <p
            style={{
              fontSize: "24px",
              fontWeight: 500,
              color: "#f4f4f5",
              margin: 0,
              textAlign: "center",
              lineHeight: 1.4,
              letterSpacing: "-0.01em",
            }}
          >
            텍스트와 파비콘으로만 완성하는
          </p>
          <p
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#a78bfa", // primary 계열 연보라
              margin: "4px 0 0 0",
              textAlign: "center",
              lineHeight: 1.4,
              letterSpacing: "-0.01em",
            }}
          >
            가장 현대적이고 미니멀한 링크 프로필
          </p>
        </div>

        {/* 하단 크레딧 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            position: "absolute",
            bottom: 72,
            opacity: 0.5,
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", color: "#a1a1aa" }}>
            POWERED BY MY-LINK
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts,
    }
  );
}
