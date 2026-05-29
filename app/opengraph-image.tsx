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
          backgroundColor: "#ffffff", // 극강의 플랫 화이트 캔버스
          backgroundImage: "radial-gradient(circle at 50% -20%, rgba(244, 63, 94, 0.05), transparent 50%), radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.03), transparent 45%)",
          color: "#18181b", // zinc-900 (다크 차콜)
          fontFamily: "Pretendard, sans-serif",
          position: "relative",
          padding: "60px 80px",
        }}
      >
        {/* 상단 엠블럼 마크 (연한 핑크 서클 + 장미색 M) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "28px",
            backgroundColor: "rgba(244, 63, 94, 0.08)",
            marginBottom: "14px",
            border: "1px solid rgba(244, 63, 94, 0.12)",
          }}
        >
          <span style={{ fontSize: "24px", fontWeight: 900, color: "#f43f5e", fontFamily: "sans-serif" }}>
            M
          </span>
        </div>

        {/* 차콜 단색 로고 타이틀 (장식성 그라디언트 걷어냄) */}
        <h1
          style={{
            fontSize: "52px",
            fontWeight: 800,
            margin: 0,
            color: "#18181b",
            letterSpacing: "-0.03em",
          }}
        >
          My-Link
        </h1>

        {/* 넓고 시원한 공백 여백 뒤에 오는 2단 수직 슬림 링크 바 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginTop: "48px",
          }}
        >
          {/* 슬롯 1: GitHub */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              width: "420px",
              height: "62px",
              borderRadius: "9999px",
              border: "1px solid #f4f4f5", // 극도로 옅은 플랫 테두리
              backgroundColor: "#ffffff",
              padding: "0 20px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.015)",
            }}
          >
            {/* 파비콘 박스 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                backgroundColor: "rgba(244, 63, 94, 0.03)",
                marginRight: "14px",
                overflow: "hidden",
              }}
            >
              <img
                src="https://www.google.com/s2/favicons?domain=github.com&sz=128"
                alt="GitHub"
                style={{ width: "18px", height: "18px", objectFit: "contain" }}
              />
            </div>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#18181b", flex: 1 }}>GitHub 💻</span>
            <span style={{ fontSize: "11px", color: "#a1a1aa", marginRight: "4px" }}>github.com</span>
            <span style={{ fontSize: "13px", color: "#f43f5e", fontWeight: 700 }}>→</span>
          </div>

          {/* 슬롯 2: Instagram */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              width: "420px",
              height: "62px",
              borderRadius: "9999px",
              border: "1px solid #f4f4f5",
              backgroundColor: "#ffffff",
              padding: "0 20px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.015)",
            }}
          >
            {/* 파비콘 박스 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                backgroundColor: "rgba(244, 63, 94, 0.03)",
                marginRight: "14px",
                overflow: "hidden",
              }}
            >
              <img
                src="https://www.google.com/s2/favicons?domain=instagram.com&sz=128"
                alt="Instagram"
                style={{ width: "18px", height: "18px", objectFit: "contain" }}
              />
            </div>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#18181b", flex: 1 }}>Instagram 📸</span>
            <span style={{ fontSize: "11px", color: "#a1a1aa", marginRight: "4px" }}>instagram.com</span>
            <span style={{ fontSize: "13px", color: "#f43f5e", fontWeight: 700 }}>→</span>
          </div>
        </div>

        {/* 하단 미니멀 브랜드 네임 */}
        <div
          style={{
            display: "flex", // satori 렌더링 호환성 준수
            position: "absolute",
            bottom: 72,
            opacity: 0.35,
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
