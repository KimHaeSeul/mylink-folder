"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Sparkles, 
  Check, 
  Globe, 
  LayoutGrid, 
  TrendingUp, 
  Monitor,
  Smartphone
} from "lucide-react";

interface LandingPageProps {
  onLogin: () => Promise<void>;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const [showStickyFooter, setShowStickyFooter] = useState(false);

  // 스크롤 감지 레퍼런스
  const heroRef = useRef<HTMLDivElement>(null);

  // 정적인 예시 링크 카드 목록 (비주얼 감상용)
  const mockLinks = [
    { id: "1", title: "포트폴리오 ✨", url: "github.com" },
    { id: "2", title: "인스타그램 📸", url: "instagram.com" },
    { id: "3", title: "기술 블로그 💻", url: "velog.io" },
  ];

  // 스크롤 이벤트로 하단 Sticky Footer 표시 여부 감지
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const heroBottom = heroRef.current.getBoundingClientRect().bottom;
      if (heroBottom < 200) {
        setShowStickyFooter(true);
      } else {
        setShowStickyFooter(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-background text-foreground selection:bg-primary/20">
      
      {/* 1. Header (GNB) */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-xl shadow-md shadow-primary/20">
              M
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
              My-Link
            </span>
          </div>
          <div>
            <Button 
              onClick={onLogin}
              variant="outline" 
              className="rounded-full px-5 text-sm font-semibold hover:bg-secondary/80 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              시작하기
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section (시뮬레이터 폼 완전히 걷어냄) */}
      <section ref={heroRef} className="relative py-16 sm:py-20 md:py-24 lg:py-28 overflow-hidden">
        {/* 미려하고 세련된 배경 그래디언트 오버레이 */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,var(--color-primary-foreground),transparent_50%)] opacity-30" />
        <div className="absolute top-1/3 left-0 -z-10 h-72 w-72 bg-gradient-to-tr from-primary/10 to-transparent blur-3xl rounded-full" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
            
            {/* 좌측: 감각적인 카피 및 소개 */}
            <div className="lg:col-span-7 flex flex-col text-center lg:text-left items-center lg:items-start space-y-6">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary animate-pulse">
                <Sparkles className="h-3.5 w-3.5" />
                <span>미니멀 프로필 링크의 새로운 기준</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight sm:leading-none tracking-tight">
                나를 표현하는<br />
                <span className="bg-gradient-to-r from-primary via-primary/80 to-foreground bg-clip-text text-transparent">
                  가장 가벼운 방법.
                </span>
              </h1>
              
              <p className="max-w-xl text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
                무겁고 복잡한 이미지 업로드 대신, 오직 <strong className="text-foreground">텍스트</strong>와 <strong className="text-foreground">실시간 파비콘</strong>만으로 완성하는 극도로 심플하고 모던한 프로필을 1초 만에 만들어보세요.
              </p>

              <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 pt-2">
                <Button 
                  size="lg" 
                  onClick={onLogin}
                  className="rounded-full px-8 h-14 text-base font-extrabold shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  무료로 시작하기 🚀
                </Button>
              </div>

              {/* 통계 배지 */}
              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6 text-sm text-muted-foreground pt-4 border-t border-border/40 w-full">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Google 간편 로그인</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>파비콘 자동 연동</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>완벽한 반응형 지원</span>
                </div>
              </div>
            </div>

            {/* 우측: 정적 스마트폰 비주얼 목업 (체험용 인풋 폼 완전히 제거) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[310px] sm:max-w-[330px]">
                
                {/* 스마트폰 본체 목업 프레임 */}
                <div className="relative mx-auto h-[560px] w-full rounded-[40px] border-[10px] border-neutral-900 bg-neutral-950 p-3 shadow-2xl">
                  {/* 스피커 노치 */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-28 bg-neutral-900 rounded-b-2xl z-20 flex items-center justify-center">
                    <div className="h-1 w-8 bg-neutral-800 rounded-full" />
                  </div>
                  
                  {/* 폰 화면 내부 콘텐츠 영역 */}
                  <div className="h-full w-full overflow-hidden rounded-[30px] bg-background px-4 py-8 relative flex flex-col justify-between">
                    
                    <div>
                      {/* 가상 유저 프로필 헤더 */}
                      <div className="flex flex-col items-center text-center mt-6 mb-8">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary/80 text-xl font-bold shadow-sm mb-3">
                          ⚡️
                        </div>
                        <h3 className="font-extrabold text-sm text-foreground">홍길동 (Gildong)</h3>
                        <span className="text-[11px] text-muted-foreground mt-0.5">@gildong_dev</span>
                        <p className="text-[11px] text-muted-foreground mt-1 px-4 leading-normal">
                          심플함을 즐기는 개발자 🚀
                        </p>
                      </div>

                      {/* 예시 고정 링크 리스트 */}
                      <div className="flex flex-col gap-3">
                        {mockLinks.map((link) => (
                          <Card 
                            key={link.id}
                            className="overflow-hidden shadow-sm border border-border/60 transition-transform duration-300 hover:scale-102 bg-card"
                          >
                            <CardContent className="flex items-center gap-3 p-3 text-left">
                              {/* 실시간 구글 Favicon 파싱 */}
                              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/60 p-1.5 overflow-hidden">
                                <img
                                  src={`https://www.google.com/s2/favicons?domain=${link.url}&sz=128`}
                                  alt={link.title}
                                  className="h-full w-full object-contain"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-xs text-foreground truncate">{link.title}</h4>
                              </div>
                              <span className="text-muted-foreground/60 text-xs pl-1">
                                →
                              </span>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* 가상 하단 크레딧 */}
                    <div className="text-center mb-2">
                      <p className="text-[8px] text-muted-foreground/50 tracking-wider">
                        POWERED BY MY-LINK
                      </p>
                    </div>

                  </div>
                </div>

                {/* 모바일 목업 뒤쪽 쉐도우 및 장식 데코 */}
                <div className="absolute -bottom-6 -right-6 -z-10 h-32 w-32 bg-primary/10 rounded-full blur-2xl" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Core Features Section (핵심 강점 그리드) */}
      <section className="border-t border-border/40 py-16 sm:py-20 md:py-24 bg-secondary/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              어째서 마이링크일까요?
            </h2>
            <p className="text-base text-muted-foreground">
              불필요하고 복잡한 커스터마이징 대신, 콘텐츠와 본연의 정보 전달에만 오롯이 몰입하도록 단순화의 철학을 고수합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 카드 1 */}
            <Card className="border border-border/60 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md bg-card">
              <CardContent className="pt-6 flex flex-col h-full justify-between">
                <div className="space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2 shadow-sm">
                    <Globe className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">구글 파비콘 자동 추출</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    복잡한 로고나 썸네일을 고민할 필요가 없습니다. 등록하고자 하는 URL을 타이핑하기만 하면, 구글 API가 실시간으로 어울리는 파비콘을 즉시 매칭합니다.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 카드 2 */}
            <Card className="border border-border/60 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md bg-card">
              <CardContent className="pt-6 flex flex-col h-full justify-between">
                <div className="space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2 shadow-sm">
                    <LayoutGrid className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">인라인 즉시 편집 (Inline Edit)</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    페이지 이동이나 로딩 대기는 없습니다. 관리 대시보드에서 연필 아이콘만 누르면 그 자리에서 즉시 수정되고 실시간으로 반영되는 쾌적한 인라인 편집을 선보입니다.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 카드 3 */}
            <Card className="border border-border/60 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md bg-card">
              <CardContent className="pt-6 flex flex-col h-full justify-between">
                <div className="space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2 shadow-sm">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">방문자 클릭 카운트 통계</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    누가 어떤 링크를 통해 어디로 가고 있는지 알려주는 영리하고 단순한 실시간 클릭 카운터를 각 링크 카드에 직관적으로 제공하여 성과를 손쉽게 추적합니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. Step Timeline Section (초간단 3단계 가이드) */}
      <section className="border-t border-border/40 py-16 sm:py-20 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              1초 만에 완성하는 나만의 링크 프로필
            </h2>
            <p className="text-base text-muted-foreground">
              가장 단순한 가입과 극도로 쾌적한 제작 단계를 경험해보세요.
            </p>
          </div>

          <div className="relative">
            {/* 중앙 진행 라인 (데스크톱 전용) */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 -z-10 hidden md:block" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
              
              {/* 1단계 */}
              <div className="flex flex-col items-center text-center bg-background p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-black text-lg mb-4">
                  1
                </div>
                <h3 className="text-base font-bold mb-2">구글 간편 가입</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  구글 계정 연동만으로 번거로운 비밀번호 설정과 이메일 인증 절차를 단번에 뛰어넘습니다.
                </p>
              </div>

              {/* 2단계 */}
              <div className="flex flex-col items-center text-center bg-background p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-black text-lg mb-4">
                  2
                </div>
                <h3 className="text-base font-bold mb-2">닉네임 확보 및 설정</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  나만의 개성있는 아이디를 정해 `mylink.com/username` 형태의 고유한 도메인 주소를 획득하세요.
                </p>
              </div>

              {/* 3단계 */}
              <div className="flex flex-col items-center text-center bg-background p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-black text-lg mb-4">
                  3
                </div>
                <h3 className="text-base font-bold mb-2">무한 추가 및 복사</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  원하는 링크들을 클릭 한 번에 추가하고, 연동 완료된 내 프로필 URL을 인스타그램과 SNS에 붙여넣으세요.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 5. Sticky Floating Footer (고정형 하단 CTA) */}
      <div 
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-lg transition-all duration-500 ease-out transform ${
          showStickyFooter ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between gap-4 rounded-full bg-card/90 backdrop-blur-md border border-border px-5 py-3.5 shadow-2xl">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-extrabold text-sm">
              M
            </div>
            <span className="text-xs font-bold text-foreground truncate max-w-[120px] sm:max-w-none">
              지금 바로 마이링크 만들기
            </span>
          </div>
          <Button 
            onClick={onLogin} 
            size="sm" 
            className="rounded-full px-5 text-xs font-bold h-9 bg-primary shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-1"
          >
            1초 가입 🚀
          </Button>
        </div>
      </div>

      {/* 6. Footer (하단 영역) */}
      <footer className="border-t border-border/40 bg-secondary/5 py-12 text-center text-sm text-muted-foreground">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-foreground text-base tracking-tight">My-Link</span>
            <span className="text-xs">© 2026. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-xs">
            <a href="#" className="hover:text-foreground transition-colors">이용약관</a>
            <a href="#" className="hover:text-foreground transition-colors">개인정보처리방침</a>
            <a href="#" className="hover:text-foreground transition-colors font-semibold text-primary/80">Google Login 연동</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
