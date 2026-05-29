import { ImageResponse } from "next/og";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, orderBy } from "firebase/firestore";

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
  let actualUid = "";

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
      actualUid = userDoc.id;
    } else {
      // 1-2. 없을 경우 하위 호환성을 위해 ID(uid) 매칭 시도
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        profileData = userSnap.data();
        actualUid = userSnap.id;
      }
    }
  } catch (e) {
    console.error("Error fetching user profile for dynamic OG:", e);
  }

  // 기본 대체 정보 설정
  const name = profileData?.profile?.name || profileData?.displayName || "User";
  const username = profileData?.profile?.username || uid;
  const photoURL = profileData?.photoURL;

  // 2. 사용자의 실제 최신 등록 링크 2개 실시간 fetch (그림 도식용)
  let fetchedLinks: any[] = [];
  if (actualUid) {
    try {
      const linksRef = collection(db, `users/${actualUid}/links`);
      const linksQuery = query(linksRef, orderBy("createdAt", "desc"));
      const linksSnap = await getDocs(linksQuery);
      
      linksSnap.docs.forEach((docSnap) => {
        if (fetchedLinks.length < 2) {
          const data = docSnap.data();
          fetchedLinks.push({
            title: data.title || "Link",
            url: data.url || "",
          });
        }
      });
    } catch (linksErr) {
      console.error("Error fetching links for OG:", linksErr);
    }
  }

  // 등록된 실제 링크가 없을 경우, 미려한 샘플 도식용 가상 데이터 생성
  if (fetchedLinks.length === 0) {
    fetchedLinks = [
      { title: "포트폴리오 ✨", url: "https://github.com" },
      { title: "인스타그램 📸", url: "https://instagram.com" }
    ];
  }

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
          backgroundColor: "#ffffff", // 라이트 모드 화이트 배경
          backgroundImage: "radial-gradient(circle at 50% -20%, rgba(244, 63, 94, 0.05), transparent 50%), radial-gradient(circle at 90% 90%, rgba(236, 72, 153, 0.03), transparent 45%)",
          color: "#18181b", // zinc-900 (다크 그레이)
          fontFamily: "Pretendard, sans-serif",
          position: "relative",
          padding: "60px 80px",
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
              border: "2px solid rgba(244, 63, 94, 0.12)",
              objectFit: "cover",
              marginBottom: "14px",
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
              border: "2px solid rgba(244, 63, 94, 0.15)",
              marginBottom: "14px",
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
            fontSize: "36px",
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
            padding: "3px 10px",
            backgroundColor: "rgba(244, 63, 94, 0.05)",
            border: "1px solid rgba(244, 63, 94, 0.12)",
            borderRadius: "9999px",
            marginTop: "6px",
            marginBottom: "36px",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#f43f5e",
              letterSpacing: "-0.01em",
            }}
          >
            @{username}
          </span>
        </div>

        {/* 2단 수직 슬림 링크 바 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {fetchedLinks.map((link, index) => {
            let hostname = "example.com";
            try {
              hostname = new URL(link.url).hostname;
            } catch (e) {}

            const faviconUrl = link.url.includes("blog.naver.com")
              ? "https://blog.naver.com/favicon.ico"
              : `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;

            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  width: "420px",
                  height: "62px",
                  borderRadius: "9999px",
                  border: "1px solid #f4f4f5", // 옅은 플랫 테두리
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
                    src={faviconUrl}
                    alt={link.title}
                    style={{ width: "18px", height: "18px", objectFit: "contain" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://www.google.com/s2/favicons?domain=example.com&sz=128";
                    }}
                  />
                </div>
                {/* 타이틀 및 호스트네임 */}
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#18181b",
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {link.title}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#a1a1aa",
                    marginRight: "4px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {hostname}
                </span>
                <span style={{ fontSize: "13px", color: "#f43f5e", fontWeight: 700 }}>→</span>
              </div>
            );
          })}
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
