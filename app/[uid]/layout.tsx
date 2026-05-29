import { Metadata } from "next";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

// 동적 프로필 메타데이터 실시간 연동기 (Next.js 15+ 대응)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ uid: string }>;
}): Promise<Metadata> {
  const { uid } = await params;
  let profileData: any = null;

  try {
    // 1. 먼저 username 필드로 검색 시도
    const q = query(
      collection(db, "users"),
      where("profile.username", "==", uid)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      profileData = querySnapshot.docs[0].data();
    } else {
      // 2. 없을 경우 하위 호환성을 위해 ID(uid) 매칭 시도
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        profileData = userSnap.data();
      }
    }
  } catch (e) {
    console.error("Error generating metadata for dynamic profile:", e);
  }

  const name = profileData?.profile?.name || profileData?.displayName || "User";
  const username = profileData?.profile?.username || uid;
  const bio = profileData?.profile?.bio || "Minimalist Link Management";

  return {
    title: `${name} (@${username}) | My-Link`,
    description: bio,
    openGraph: {
      title: `${name} (@${username}) | My-Link`,
      description: bio,
      url: `https://my-link-ganadi.vercel.app/${uid}`,
      type: "profile",
      username: username,
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} (@${username}) | My-Link`,
      description: bio,
    },
  };
}

export default function PublicProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
