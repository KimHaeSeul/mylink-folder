"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { use } from "react";
import {
  collection,
  doc,
  getDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Link as LinkType } from "@/data/links";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface UserProfile {
  displayName: string;
  photoURL: string;
  email: string;
}

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = use(params);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // 유저 프로필 fetch
  useEffect(() => {
    const fetchProfile = async () => {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }
      setProfile(userSnap.data() as UserProfile);
    };
    fetchProfile();
  }, [uid]);

  // 링크 목록 실시간 구독
  useEffect(() => {
    if (notFound) return;

    const q = query(
      collection(db, `users/${uid}/links`),
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
  }, [uid, notFound]);

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
            {profile?.displayName?.[0]?.toUpperCase() || "U"}
          </div>
        )}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            @{profile?.displayName || "User"}
          </h1>
          <p className="text-sm text-muted-foreground">Minimalist Link Management</p>
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
                      <span className="font-medium text-foreground">
                        {link.title}
                      </span>
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
