"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Sparkles, 
  Check, 
  Globe, 
  LayoutGrid, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Pencil,
  ArrowRight,
  Monitor,
  Smartphone
} from "lucide-react";

// URL 유효성 검사 함수
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const hostname = url.hostname;
    if (!hostname) return false;
    if (hostname !== "localhost" && !hostname.includes(".")) return false;
    return true;
  } catch {
    return false;
  }
}

interface VirtualLink {
  id: string;
  title: string;
  url: string;
  clickCount: number;
}

interface LandingPageProps {
  onLogin: () => Promise<void>;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  // 가상 링크 상태 관리 (시뮬레이터용)
  const [virtualLinks, setVirtualLinks] = useState<VirtualLink[]>([
    { id: "1", title: "인스타그램 📸", url: "https://instagram.com", clickCount: 142 },
    { id: "2", title: "나의 개발 블로그 💻", url: "https://medium.com", clickCount: 88 },
    { id: "3", title: "포트폴리오 보러가기 💼", url: "https://github.com", clickCount: 205 },
  ]);

  const [inputTitle, setInputTitle] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [showStickyFooter, setShowStickyFooter] = useState(false);

  // 스크롤 감지 레퍼런스
  const heroRef = useRef<HTMLDivElement>(null);

  // 가상 링크 추가 핸들러
  const handleAddVirtualLink = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = inputTitle.trim();
    const trimmedUrl = inputUrl.trim();

    if (!trimmedTitle || !trimmedUrl) {
      toast.error("가상 링크의 제목과 URL을 입력해주세요!");
      return;
    }

    let finalUrl = trimmedUrl;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    if (!isValidUrl(finalUrl)) {
      toast.error("올바른 URL 형식을 입력해주세요. (예: google.com)");
      return;
    }

    const newLink: VirtualLink = {
      id: Date.now().toString(),
      title: trimmedTitle,
      url: finalUrl,
      clickCount: 0,
    };

    setVirtualLinks([newLink, ...virtualLinks]);
    setInputTitle("");
    setInputUrl("");
    toast.success("가상 스마트폰에 링크가 실시간 추가되었습니다!");
  };

  // 가상 링크 삭제 핸들러
  const handleDeleteVirtualLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVirtualLinks(virtualLinks.filter(link => link.id !== id));
    if (editingId === id) setEditingId(null);
    toast("가상 링크가 삭제되었습니다.");
  };

  // 가상 인라인 편집 시작 핸들러
  const startEditVirtualLink = (link: VirtualLink, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(link.id);
    setEditTitle(link.title);
    setEditUrl(link.url);
  };

  // 가상 인라인 편집 저장 핸들러
  const handleSaveVirtualEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const trimmedTitle = editTitle.trim();
    const trimmedUrl = editUrl.trim();

    if (!trimmedTitle || !trimmedUrl) {
      toast.error("제목과 URL을 입력해주세요!");
      return;
    }

    let finalUrl = trimmedUrl;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    if (!isValidUrl(finalUrl)) {
      toast.error("올바른 URL 형식을 입력해주세요.");
      return;
    }

    setVirtualLinks(virtualLinks.map(link => {
      if (link.id === id) {
        return { ...link, title: trimmedTitle, url: finalUrl };
      }
      return link;
    }));
    setEditingId(null);
    toast.success("인라인 편집이 완료되었습니다!");
  };

  // 가상 링크 클릭수 증가 핸들러
  const handleVirtualLinkClick = (id: string) => {
    setVirtualLinks(virtualLinks.map(link => {
      if (link.id === id) {
        return { ...link, clickCount: link.clickCount + 1 };
      }
      return link;
    }));
    toast("가상 클릭 수가 1 증가했습니다!");
  };

  // 스크롤 이벤트로 하단 Sticky Footer 표시 여부 감지
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const heroBottom = heroRef.current.getBoundingClientRect().bottom;
      // 히어로 섹션 아래가 화면의 중간(혹은 200px 남았을 때) 위로 올라가면 스티키 푸터 켜기
      if (heroBottom < 200) {
        setShowStickyFooter(true);
      } else {
        setShowStickyFooter(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 도메인 기반 호스트네임 추출
  const getHostname = (urlStr: string) => {
    try {
      return new URL(urlStr).hostname;
    } catch {
      return "example.com";
    }
  };

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

      {/* 2. Hero & Simulator Section */}
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
                <a 
                  href="#simulator" 
                  className="inline-flex h-14 items-center justify-center rounded-full border border-border bg-card px-8 text-sm font-semibold hover:bg-secondary/50 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  직접 체험해보기
                </a>
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

            {/* 우측: 실시간 시뮬레이터 (스마트폰 목업 + 가상 인풋) */}
            <div id="simulator" className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[340px] sm:max-w-[360px] md:max-w-[370px]">
                
                {/* 1. 가상 링크 추가 컨트롤 패널 (스마트폰 목업 위/옆에 예쁘게 얹혀있는 카드) */}
                <div className="absolute -top-10 -left-6 sm:-left-12 z-20 w-48 sm:w-56 bg-card/90 backdrop-blur-md p-4 rounded-2xl border border-border shadow-2xl transition-all hover:scale-105">
                  <span className="text-[11px] font-bold text-primary tracking-wider uppercase block mb-1">실시간 시뮬레이터</span>
                  <p className="text-[11px] text-muted-foreground mb-3">아래 폼에 URL을 입력하면 폰 목업의 파비콘이 바뀝니다!</p>
                  
                  <form onSubmit={handleAddVirtualLink} className="space-y-2">
                    <div>
                      <Label htmlFor="v-title" className="text-[10px] font-bold text-foreground">링크 제목</Label>
                      <Input 
                        id="v-title" 
                        value={inputTitle} 
                        onChange={(e) => setInputTitle(e.target.value)} 
                        placeholder="예: 나의 트위터" 
                        className="h-7 text-xs px-2 mt-0.5 rounded-md"
                      />
                    </div>
                    <div>
                      <Label htmlFor="v-url" className="text-[10px] font-bold text-foreground">도메인 URL</Label>
                      <Input 
                        id="v-url" 
                        value={inputUrl} 
                        onChange={(e) => setInputUrl(e.target.value)} 
                        placeholder="예: twitter.com" 
                        className="h-7 text-xs px-2 mt-0.5 rounded-md"
                      />
                    </div>
                    <Button type="submit" size="sm" className="w-full h-7 text-xs font-bold mt-1 bg-primary/95 rounded-md flex items-center justify-center gap-1">
                      <Plus className="h-3 w-3" /> 추가하기
                    </Button>
                  </form>
                </div>

                {/* 2. 스마트폰 본체 목업 프레임 */}
                <div className="relative mx-auto h-[600px] w-full rounded-[42px] border-[10px] border-neutral-900 bg-neutral-950 p-3 shadow-2xl">
                  {/* 스피커 노치 */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-32 bg-neutral-900 rounded-b-2xl z-20 flex items-center justify-center">
                    <div className="h-1 w-10 bg-neutral-800 rounded-full" />
                  </div>
                  
                  {/* 폰 화면 내부 콘텐츠 영역 */}
                  <div className="h-full w-full overflow-y-auto rounded-[32px] bg-background px-4 py-8 relative no-scrollbar">
                    
                    {/* 가상 유저 프로필 헤더 */}
                    <div className="flex flex-col items-center text-center mt-4 mb-8">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/80 text-xl font-bold shadow-sm mb-3">
                        ⚡️
                      </div>
                      <h3 className="font-extrabold text-base text-foreground">홍길동 (Gildong)</h3>
                      <span className="text-xs text-muted-foreground mt-0.5">@gildong_dev</span>
                      <p className="text-xs text-muted-foreground mt-1 px-4 leading-normal">
                        심플함을 즐기는 프론트엔드 개발자 🚀
                      </p>
                    </div>

                    {/* 가상 링크 리스트 */}
                    <div className="flex flex-col gap-3">
                      {virtualLinks.length === 0 ? (
                        <div className="text-center py-8 text-xs text-muted-foreground">
                          아직 등록된 링크가 없습니다.<br />위 패널에서 첫 링크를 추가해 보세요!
                        </div>
                      ) : (
                        virtualLinks.map((link) => {
                          const hostname = getHostname(link.url);
                          const isEditing = editingId === link.id;

                          return (
                            <div key={link.id} className="relative group">
                              {isEditing ? (
                                <Card className="p-3 border-primary/50 shadow-sm bg-card text-left">
                                  <div className="flex flex-col gap-2">
                                    <Input 
                                      value={editTitle} 
                                      onChange={(e) => setEditTitle(e.target.value)} 
                                      className="h-7 text-xs" 
                                      placeholder="제목"
                                    />
                                    <Input 
                                      value={editUrl} 
                                      onChange={(e) => setEditUrl(e.target.value)} 
                                      className="h-7 text-xs" 
                                      placeholder="URL"
                                    />
                                    <div className="flex justify-end gap-1.5 mt-1">
                                      <Button 
                                        variant="secondary" 
                                        size="sm" 
                                        className="h-6 text-[10px] px-2 rounded"
                                        onClick={() => setEditingId(null)}
                                      >
                                        취소
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        className="h-6 text-[10px] px-2 rounded"
                                        onClick={(e) => handleSaveVirtualEdit(link.id, e)}
                                      >
                                        저장
                                      </Button>
                                    </div>
                                  </div>
                                </Card>
                              ) : (
                                <Card 
                                  onClick={() => handleVirtualLinkClick(link.id)}
                                  className="overflow-hidden transition-all duration-300 hover:scale-103 active:scale-98 cursor-pointer shadow-sm border border-border/60 hover:shadow-md hover:border-primary/30"
                                >
                                  <CardContent className="flex items-center gap-3 p-3 text-left">
                                    {/* 실시간 구글 Favicon 파싱 */}
                                    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/60 p-1.5 overflow-hidden">
                                      <img
                                        src={
                                          link.url.includes("blog.naver.com")
                                            ? "https://blog.naver.com/favicon.ico"
                                            : `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`
                                        }
                                        alt={link.title}
                                        className="h-full w-full object-contain"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = "https://www.google.com/s2/favicons?domain=example.com&sz=128";
                                        }}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-xs text-foreground truncate">{link.title}</h4>
                                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                                        <TrendingUp className="h-3 w-3 text-primary/80" />
                                        <span>클릭 {link.clickCount}회</span>
                                      </span>
                                    </div>

                                    {/* 편집/삭제 인터랙티브 버튼 (호버 시 선명하게 노출) */}
                                    <div className="flex items-center gap-1">
                                      <button 
                                        onClick={(e) => startEditVirtualLink(link, e)}
                                        className="p-1 text-muted-foreground hover:text-primary transition-colors"
                                        title="인라인 편집 체험"
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </button>
                                      <button 
                                        onClick={(e) => handleDeleteVirtualLink(link.id, e)}
                                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                                        title="삭제"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* 가상 하단 크레딧 */}
                    <div className="text-center mt-12 mb-4">
                      <p className="text-[9px] text-muted-foreground/60 tracking-wider">
                        POWERED BY MY-LINK
                      </p>
                    </div>

                  </div>
                </div>

                {/* 3. 모바일 목업 뒤쪽 쉐도우 및 장식 데코 */}
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
