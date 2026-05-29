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
      profileData = querySnapshot.docs[0].data();
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
  const bio = profileData?.profile?.bio || "Minimalist Link Management";
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
          backgroundImage: "radial-gradient(circle at 50% -20%, rgba(124, 58, 237, 0.18), transparent 55%), radial-gradient(circle at 90% 90%, rgba(37, 99, 235, 0.08), transparent 45%)",
          color: "#ffffff",
          fontFamily: "Pretendard, sans-serif",
          position: "relative",
          padding: "60px 80px",
        }}
      >
        {/* 그리드 장식 액자 */}
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

        {/* 메인 프로필 카드 */}
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
          {/* 아바타 영역 */}
          {avatarBase64 ? (
            <img
              src={avatarBase64}
              alt="Avatar"
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "55px",
                border: "3px solid rgba(255, 255, 255, 0.15)",
                objectFit: "cover",
                marginBottom: "20px",
              }}
            />
          ) : (
            // 이니셜 아바타 Fallback
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "110px",
                height: "110px",
                borderRadius: "55px",
                backgroundColor: "rgba(124, 58, 237, 0.15)",
                border: "3px solid rgba(124, 58, 237, 0.3)",
                marginBottom: "20px",
              }}
            >
              <span
                style={{
                  fontSize: "44px",
                  fontWeight: 800,
                  color: "#a78bfa",
                }}
              >
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* 유저명 / 이름 */}
          <h2
            style={{
              fontSize: "44px",
              fontWeight: 800,
              color: "#ffffff",
              margin: 0,
              textAlign: "center",
              letterSpacing: "-0.02em",
            }}
          >
            {name}
          </h2>

          {/* 사용자 고유 아이디 배지 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "5px 14px",
              backgroundColor: "rgba(124, 58, 237, 0.1)",
              border: "1px solid rgba(124, 58, 237, 0.25)",
              borderRadius: "9999px",
              marginTop: "12px",
            }}
          >
            <span
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#c084fc", // 핑크-보랏빛
                letterSpacing: "-0.01em",
              }}
            >
              @{username}
            </span>
          </div>

          {/* 한 줄 소개 */}
          <p
            style={{
              fontSize: "20px",
              fontWeight: 400,
              color: "#a1a1aa",
              margin: "24px 0 0 0",
              textAlign: "center",
              lineHeight: 1.5,
              maxWidth: "580px",
              letterSpacing: "-0.01em",
            }}
          >
            {bio}
          </p>
        </div>

        {/* 하단 크레딧 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
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
