import { Metadata } from "next";
import { Geist_Mono, Nunito_Sans, Roboto } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const robotoHeading = Roboto({ subsets: ["latin"], variable: "--font-heading" });
const nunitoSans = Nunito_Sans({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

import { Toaster } from "@/components/ui/sonner";

// 전역 오픈그래프 및 검색 메타데이터 설정 (배포 URL 연동)
export const metadata: Metadata = {
  metadataBase: new URL("https://my-link-ganadi.vercel.app"),
  title: "My-Link | 텍스트와 파비콘으로 완성하는 미니멀 링크 프로필",
  description: "복잡한 이미지 업로드 없이 오직 텍스트와 실시간 파비콘만으로 극도로 심플하고 모던한 프로필을 완성해 보세요.",
  openGraph: {
    title: "My-Link | 미니멀 링크 프로필",
    description: "텍스트와 실시간 파비콘만으로 완성하는 가장 현대적이고 가벼운 프로필 링크 서비스",
    url: "https://my-link-ganadi.vercel.app",
    siteName: "My-Link",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "My-Link | 미니멀 링크 프로필",
    description: "텍스트와 실시간 파비콘만으로 완성하는 가장 현대적이고 가벼운 프로필 링크 서비스",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", nunitoSans.variable, robotoHeading.variable)}
    >
      <body>
        <ThemeProvider>
          {children}
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
