import React from "react";

export function SimpleEyeIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* 단순한 가로 눈매 아웃라인 (쌍꺼풀 없음) */}
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      {/* 중앙 눈동자 */}
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
