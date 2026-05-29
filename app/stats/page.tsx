"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { type Link as LinkType } from "@/data/links";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SimpleEyeIcon } from "@/components/ui/simple-eye-icon";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft02Icon, Link01Icon, StarIcon } from "@hugeicons/core-free-icons";

export default function StatsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [links, setLinks] = useState<LinkType[]>([]);
  const [linksLoading, setLinksLoading] = useState(true);

  // 1. Auth 상태 확인 및 리다이렉트
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // 2. 링크 목록 조회수 구독
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, `users/${user.uid}/links`),
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
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          };
        });
        setLinks(fetchedLinks);
        setLinksLoading(false);
      },
      (err) => {
        console.error("Error fetching links for stats:", err);
        setLinksLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 3. 통계 데이터 계산
  const totalViews = links.reduce((acc, curr) => acc + (curr.clickCount || 0), 0);
  const totalLinks = links.length;
  const mostClickedLink = links.length > 0 
    ? [...links].sort((a, b) => b.clickCount - a.clickCount)[0] 
    : null;

  // 4. 차트 데이터 포맷팅 (조회수가 높은 탑 8개 추출)
  const chartData = [...links]
    .sort((a, b) => b.clickCount - a.clickCount)
    .slice(0, 8)
    .map((link, index) => ({
      name: link.title.length > 10 ? link.title.slice(0, 10) + ".." : link.title,
      views: link.clickCount,
      fill: `hsl(var(--primary) / ${1 - index * 0.1})`, // 인덱스에 따라 은은하게 페이딩되는 그라데이션
    }));

  const chartConfig = {
    views: {
      label: "조회수",
      color: "hsl(var(--primary))",
    },
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 sm:px-8 md:px-16 lg:px-32">
        <Skeleton className="h-20 w-20 rounded-full mb-4" />
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col bg-background px-4 sm:px-8 md:px-16 lg:px-32 xl:px-48 pt-12 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8 w-full max-w-4xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/")}
          className="rounded-full gap-1.5 transition-transform hover:-translate-x-0.5"
        >
          <HugeiconsIcon icon={ArrowLeft02Icon} size={16} />
          <span>관리 홈으로</span>
        </Button>
        <h1 className="text-xl font-bold tracking-tight text-center sm:text-right">통계 대시보드</h1>
      </div>

      {linksLoading ? (
        <div className="w-full max-w-4xl mx-auto space-y-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-48 mb-4" />
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in-50 duration-500">
          {/* 요약 카드 그리드 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* 총 조회수 카드 */}
            <Card className="shadow-sm border-border/60 transition-all hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <SimpleEyeIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">총 조회수</p>
                  <h3 className="text-2xl font-bold tracking-tight mt-0.5">{totalViews.toLocaleString()}회</h3>
                </div>
              </CardContent>
            </Card>

            {/* 등록 링크 수 카드 */}
            <Card className="shadow-sm border-border/60 transition-all hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/80 text-secondary-foreground">
                  <HugeiconsIcon icon={Link01Icon} size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">총 등록 링크</p>
                  <h3 className="text-2xl font-bold tracking-tight mt-0.5">{totalLinks}개</h3>
                </div>
              </CardContent>
            </Card>

            {/* 인기 최고 링크 카드 */}
            <Card className="shadow-sm border-border/60 transition-all hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                  <HugeiconsIcon icon={StarIcon} size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground">인기 최고 링크</p>
                  <h3 className="text-base font-bold truncate mt-0.5 text-foreground" title={mostClickedLink?.title || "없음"}>
                    {mostClickedLink ? mostClickedLink.title : "등록된 링크 없음"}
                  </h3>
                  {mostClickedLink && (
                    <p className="text-xs text-muted-foreground mt-0.5">조회수 {mostClickedLink.clickCount}회</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 차트 시각화 카드 */}
          <Card className="shadow-sm border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">조회수 순위 (Top 8)</CardTitle>
              <CardDescription>어떤 링크에 가장 유입이 많았는지 한눈에 비교해 보세요.</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {links.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-center text-muted-foreground border border-dashed rounded-xl border-border/80">
                  <span className="text-3xl mb-2">📊</span>
                  <p className="text-sm font-medium">조회수를 분석할 수 있는 링크가 아직 없습니다.</p>
                  <p className="text-xs mt-1 text-muted-foreground/80">먼저 링크를 추가해 주세요!</p>
                </div>
              ) : (
                <div className="w-full">
                  <ChartContainer config={chartConfig} className="h-72 w-full">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        className="fill-muted-foreground font-sans font-medium text-[11px]"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        className="fill-muted-foreground font-mono font-medium text-[11px]"
                      />
                      <ChartTooltip
                        cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                        content={<ChartTooltipContent indicator="dot" />}
                      />
                      <Bar
                        dataKey="views"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={45}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
