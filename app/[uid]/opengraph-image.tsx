import { ImageResponse } from "next/og";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

// Route segment config
export const runtime = "nodejs";

// Image metadata
export const alt = "My-Link Profile";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Pretendard 폰트 페칭 함수 (한글 깨짐 방지)
async function getFont(weight: "Regular" | "Bold") {
  const url = `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff/Pretendard-${weight}.woff`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch Pretendard-${weight} font`);
  }
  return await response.arrayBuffer();
}

// 구글 프로필 이미지를 Base64 데이터 URI로 변환하는 함수 (타임아웃 적용)
async function getProfileImageBase64(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2000); // 2초 타임아웃 제한

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);

    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const contentType = response.headers.get("content-type") || "image/jpeg";
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error("Error fetching profile image for OG:", error);
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = await params;
  let profileData: any = null;

  // 1. Firestore에서 프로필 정보 실시간 fetch
  try {
    // 1-1. 먼저 username 필드로 검색 시도
    const q = query(
      collection(db, "users"),
      where("profile.username", "==", uid)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      profileData = userDoc.data();
    } else {
      // 1-2. 없을 경우 하위 호환성을 위해 ID(uid) 매칭 시도
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        profileData = userSnap.data();
      }
    }
  } catch (e) {
    console.error("Error fetching user profile for dynamic OG:", e);
  }

  // 기본 대체 정보 설정
  const name = profileData?.profile?.name || profileData?.displayName || "User";
  const username = profileData?.profile?.username || uid;
  const photoURL = profileData?.photoURL;

  // 프로필 이미지 Base64로 변환 시도
  let avatarBase64: string | null = null;
  if (photoURL) {
    avatarBase64 = await getProfileImageBase64(photoURL);
  }

  // 폰트 파일 로드
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
          backgroundColor: "#ffffff", // 라이트 모드 화이트 배경
          backgroundImage: "radial-gradient(circle at 50% -20%, rgba(244, 63, 94, 0.05), transparent 50%), radial-gradient(circle at 90% 90%, rgba(236, 72, 153, 0.03), transparent 45%)",
          color: "#18181b", // zinc-900 (다크 그레이)
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

        {/* 중앙 미니멀 프로필 카드 보드 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "640px",
            height: "320px",
            backgroundColor: "#ffffff",
            border: "2px solid rgba(244, 63, 94, 0.15)",
            borderRadius: "32px",
            boxShadow: "0 25px 60px rgba(244, 63, 94, 0.08)",
            zIndex: 2,
            padding: "36px",
          }}
        >
          {/* 아바타 영역 (크기와 선을 극도로 슬림화) */}
          {avatarBase64 ? (
            <img
              src={avatarBase64}
              alt="Avatar"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "40px",
                border: "3px solid rgba(244, 63, 94, 0.15)",
                objectFit: "cover",
                marginBottom: "16px",
              }}
            />
          ) : (
            // 이니셜 아바타 Fallback (핑크 테마)
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "80px",
                height: "80px",
                borderRadius: "40px",
                backgroundColor: "rgba(244, 63, 94, 0.06)",
                border: "3px solid rgba(244, 63, 94, 0.15)",
                marginBottom: "16px",
              }}
            >
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: 800,
                  color: "#f43f5e",
                }}
              >
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* 유저명 / 이름 */}
          <h2
            style={{
              fontSize: "38px",
              fontWeight: 800,
              color: "#18181b",
              margin: 0,
              textAlign: "center",
              letterSpacing: "-0.02em",
            }}
          >
            {name}
          </h2>

          {/* 사용자 고유 아이디 배지 (핑크) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "4px 12px",
              backgroundColor: "rgba(244, 63, 94, 0.05)",
              border: "1px solid rgba(244, 63, 94, 0.15)",
              borderRadius: "9999px",
              marginTop: "10px",
            }}
          >
            <span
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#f43f5e",
                letterSpacing: "-0.01em",
              }}
            >
              @{username}
            </span>
          </div>
        </div>

        {/* 하단 미니멀 브랜드 네임 */}
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
