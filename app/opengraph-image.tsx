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

  // 핑크빛 이모지 리스트
  const emojis = ["💖", "💞", "🌸", "🍒", "💕"];

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
          backgroundColor: "#ffffff", // 완전 플랫 화이트 배경
          backgroundImage: "radial-gradient(circle at 50% -20%, rgba(244, 63, 94, 0.05), transparent 50%), radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.03), transparent 45%)",
          color: "#f43f5e",
          fontFamily: "Pretendard, sans-serif",
          position: "relative",
          padding: "60px 80px",
        }}
      >
        {/* 5행 8열 은은한 핑크 이모지 바둑판 격자 패턴 배경 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "36px 48px",
            opacity: 0.12,
            zIndex: 1,
          }}
        >
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              {Array.from({ length: 8 }).map((_, colIndex) => (
                <span
                  key={colIndex}
                  style={{
                    fontSize: "30px",
                    display: "flex",
                  }}
                >
                  {emojis[(rowIndex + colIndex) % emojis.length]}
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* 중앙 미니멀 둥근 사각 카드 보드 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "640px",
            height: "260px",
            backgroundColor: "#ffffff",
            border: "2px solid rgba(244, 63, 94, 0.15)",
            borderRadius: "32px",
            boxShadow: "0 25px 60px rgba(244, 63, 94, 0.08)",
            zIndex: 2,
          }}
        >
          {/* 극도로 깔끔하고 선명한 84px 초대형 메인 브랜드 타이틀 */}
          <h1
            style={{
              fontSize: "84px",
              fontWeight: 900,
              margin: 0,
              color: "#f43f5e", // 깔끔하고 이쁜 체리 핑크 단색
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            My-Link
          </h1>
        </div>

        {/* 하단 미니멀 크레딧 */}
        <div
          style={{
            display: "flex", // satori 호환성
            position: "absolute",
            bottom: 48,
            opacity: 0.4,
            zIndex: 2,
          }}
        >
          <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", color: "#71717a" }}>
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
