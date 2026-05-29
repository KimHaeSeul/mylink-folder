"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { use } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  increment,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { type Link as LinkType } from "@/data/links";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { SimpleEyeIcon } from "@/components/ui/simple-eye-icon";

interface UserProfile {
  displayName: string;
  photoURL: string;
  email: string;
  profile?: {
    username: string;
    name: string;
    bio: string;
  };
}

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = use(params);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [actualUid, setActualUid] = useState<string | null>(null);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Auth 상태 모니터링
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const isOwner = !!currentUser && !!actualUid && currentUser.uid === actualUid;

  const handleLinkClick = async (linkId: string) => {
    if (!actualUid) return;
    try {
      const linkRef = doc(db, `users/${actualUid}/links`, linkId);
      await updateDoc(linkRef, {
        clickCount: increment(1),
      });
    } catch (err) {
      console.error("Error updating click count:", err);
    }
  };

  // 유저 프로필 fetch
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // 1. 먼저 username 필드로 검색 시도
        const q = query(
          collection(db, "users"),
          where("profile.username", "==", uid)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          setProfile(userDoc.data() as UserProfile);
          setActualUid(userDoc.id);
          return;
        }

        // 2. 검색 결과가 없으면 하위 호환성을 위해 ID(uid) 매칭 시도
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setProfile(userSnap.data() as UserProfile);
          setActualUid(userSnap.id);
          return;
        }

        // 3. 둘 다 없으면 notFound
        setNotFound(true);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setNotFound(true);
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [uid]);

  // 링크 목록 실시간 구독
  useEffect(() => {
    if (!actualUid || notFound) return;

    const q = query(
      collection(db, `users/${actualUid}/links`),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedLinks: LinkType[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || "",
            url: data.url || "",
            clickCount: data.clickCount || 0,
            createdAt:
              data.createdAt?.toDate?.()?.toISOString() ||
              new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || undefined,
          };
        });
        setLinks(fetchedLinks);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching links:", err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [actualUid, notFound]);

  if (isLoading) {
    return (
      <div className="flex min-h-svh flex-col items-center bg-background px-4 sm:px-8 md:px-16 lg:px-32 xl:px-48 pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-24">
        <div className="mb-10 flex flex-col items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex w-full max-w-md flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden shadow-sm">
              <CardContent className="flex items-center gap-4 p-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex flex-1 items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 sm:px-8 md:px-16 lg:px-32 text-center">
        <p className="text-6xl mb-4">🔍</p>
        <h1 className="text-2xl font-bold mb-2">페이지를 찾을 수 없어요</h1>
        <p className="text-muted-foreground mb-8">
          존재하지 않는 사용자입니다.
        </p>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
        >
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center bg-background px-4 sm:px-8 md:px-16 lg:px-32 xl:px-48 pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-24">
      {/* Top Right CTA */}
      <div className="fixed top-4 right-4 sm:top-5 sm:right-6 md:top-6 md:right-8 lg:top-6 lg:right-12 xl:right-16 z-20">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "default", size: "sm" }),
            "rounded-full shadow-md transition-transform hover:scale-105 active:scale-95"
          )}
        >
          My-Link 만들기 🚀
        </Link>
      </div>
      {/* 프로필 헤더 */}
      <div className="mb-10 flex flex-col items-center gap-4">
        {profile?.photoURL ? (
          <img
            src={profile.photoURL}
            alt="Profile"
            className="h-20 w-20 rounded-full ring-4 ring-background shadow-xl"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground ring-4 ring-background shadow-xl">
            {profile?.profile?.name?.[0]?.toUpperCase() || profile?.displayName?.[0]?.toUpperCase() || "U"}
          </div>
        )}
        <div className="text-center flex flex-col items-center">
          <h1 className="text-2xl font-bold tracking-tight">
            {profile?.profile?.name || profile?.displayName || "User"}
          </h1>
          {(profile?.profile?.username || profile?.email) && (
            <p className="text-sm text-muted-foreground mt-1">
              @{profile?.profile?.username || profile?.email?.split("@")[0]}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-0.5">
            {profile?.profile?.bio || "Minimalist Link Management"}
          </p>
        </div>
      </div>

      {/* 링크 목록 (읽기 전용) */}
      <div className="flex w-full max-w-md flex-col gap-4">
        {links.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            아직 추가된 링크가 없습니다.
          </div>
        ) : (
          links.map((link) => {
            let hostname = "example.com";
            try {
              hostname = new URL(link.url).hostname;
            } catch (e) {}

            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(link.id)}
              >
                <Card className="overflow-hidden transition-all duration-300 hover:scale-102 hover:shadow-md active:scale-98 cursor-pointer group">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/50 p-2 overflow-hidden">
                      <img
                        src={
                          link.url.includes("blog.naver.com")
                            ? "https://blog.naver.com/favicon.ico"
                            : `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`
                        }
                        alt={link.title}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex flex-1 items-center justify-between">
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-medium text-foreground">
                          {link.title}
                        </span>
                        {isOwner && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <SimpleEyeIcon className="h-3.5 w-3.5 text-muted-foreground/80" />
                            <span>{link.clickCount || 0}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 text-lg">
                        →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </a>
            );
          })
        )}
      </div>

    </div>
  );
}
