# 🚀 My-Link (마이링크)

> **"이미지 업로드 없이, 텍스트와 파비콘만으로 완성하는 가장 단순하고 아름다운 나만의 프로필"**

**My-Link(마이링크)**는 불필요한 기능들을 과감히 걷어내고, 닉네임 기반으로 쉽고 빠르게 자신만의 링크 페이지를 구축·공유할 수 있는 극도의 미니멀리즘 링크 관리 서비스입니다.

---

## ✨ 핵심 가치 (Core Value)

- **극도의 미니멀리즘**: 프로필 이미지 업로드, 복잡한 레이아웃 테마 설정 등 머리 아픈 설정을 배제했습니다. 오직 글자와 자동으로 추출되는 파비콘만으로 정갈하고 완벽한 프로필이 완성됩니다.
- **실시간 반응성**: 변경 사항이 화면 전환 없이 즉시 반영되고 저장되는 인터랙티브한 사용자 경험(UX)을 지향합니다.
- **프리미엄 비주얼**: 세련된 서체(Nunito Sans, Roboto), 은은하고 트렌디한 다크/라이트 그라데이션, 그리고 정교한 마이크로 인터랙션을 통해 첫인상부터 고급스러운 감성을 전달합니다.

---

## 🛠️ 주요 기능 (Key Features)

### 🔑 소셜 인증 및 자동 프로필 생성
* **구글 소셜 로그인**: Firebase Auth를 연동하여 단 한 번의 클릭만으로 안전하게 로그인하고 시작할 수 있습니다.
* **자동 닉네임 Slug 설정**: 로그인 시 지메일 아이디의 앞부분을 기반으로 고유한 `displayName`을 자동 생성하며, 이는 즉시 자신만의 프로필 경로(`mylink.com/displayName`)가 됩니다.

### ✎ 직관적인 링크 관리 & 인라인 편집 (Inline Edit)
* **초고속 링크 추가/삭제**: 번거로운 입력 폼 대신, 간편하게 제목과 URL만 입력하여 즉시 리스트에 추가합니다.
* **인라인 편집 (Inline Edit)**: 별도의 수정 페이지로 이동할 필요 없이, 리스트의 텍스트나 연필 아이콘(`✎`)을 클릭하여 즉시 입력 필드로 전환하고 편집할 수 있습니다. 입력 후 `Enter`를 누르거나 포커스를 잃으면(`blur`) 실시간으로 자동 저장됩니다.

### 🌐 실시간 파비콘 자동 추출 (Google Favicon API)
* 사용자가 링크 URL을 입력하면, Google Favicon API (`https://www.google.com/s2/favicons?domain=[URL]&sz=64`)를 활용하여 해당 도메인의 파비콘을 실시간으로 가져와 목록에 노출합니다. 별도의 아이콘 업로드 없이도 직관적이고 알록달록한 리스트가 구성됩니다.

### 📈 링크 클릭 실시간 통계 (Click Tracking)
* 방문자가 소유자의 프로필 링크를 클릭할 때마다 클릭 횟수가 실시간으로 카운트되어 Firebase Firestore에 반영됩니다.
* 소유자는 본인의 링크 관리 페이지 및 별도의 통계 대시보드(`/stats`)를 통해 어떤 링크가 가장 인기가 많은지 한눈에 직관적으로 파악할 수 있습니다.

### 🎨 고품질 미니멀리즘 UI/UX
* **스켈레톤 UI**: 데이터 로딩 중 레이아웃이 어색하게 틀어지는 현상을 방지하기 위해 `shadcn/ui` 기반의 아름다운 스켈레톤을 촘촘히 설계했습니다.
* **하단 고정 푸터 (Sticky CTA Footer)**: 서비스 어디서든 방문자가 "나만의 My-Link 만들기"로 쉽게 유입되도록 감각적인 플로팅 CTA 버튼을 배치했습니다.
* **호버 인터랙션**: 마우스 오버 시 미세하게 반응하는 부드러운 스케일 업 애니메이션 효과를 부여하여 시각적 즐거움을 줍니다.

### 🖼️ 동적 오픈 그래프(OG) 이미지 자동 생성
* Next.js의 파일 시스템 기반 동적 이미지 생성 API(OG Image Generation)를 적용하여, `/` 메인 페이지는 물론 각 유저의 프로필 페이지(`/[uid]`)에 맞는 맞춤형 고해상도 OG 이미지를 실시간으로 동적 렌더링합니다. 공유 링크를 보낼 때 더욱 돋보이는 비주얼을 자랑합니다.

---

## 🎨 기술 스택 (Tech Stack)

### Frontend
- **Framework**: `Next.js 15+` (App Router, Turbopack 활성화)
- **Library**: `React 19`, `TypeScript`
- **Styling**: `Tailwind CSS 4` (PostCSS)
- **UI Components**: `shadcn/ui`
- **Icons**: `Hugeicons React`

### Backend & Infrastructure
- **Database / Auth**: `Firebase v11+` (Cloud Firestore, Firebase Authentication)
- **Security**: `Firestore Security Rules`를 통한 세밀한 데이터 접근 권한 통제 (본인 데이터만 수정 가능, 읽기는 전체 허용)
- **Deployment**: `Vercel`

---

## 📂 프로젝트 구조 (Project Structure)

```text
my-link/
├── app/                  # Next.js App Router 
│   ├── [uid]/            # 사용자 고유 닉네임 프로필 페이지 (동적 OG 포함)
│   ├── stats/            # 실시간 클릭 통계 대시보드 페이지
│   ├── globals.css       # 테마 컬러 및 Tailwind CSS 4 레이어 설정
│   ├── layout.tsx        # 글로벌 레이아웃 (폰트 세팅 등)
│   ├── page.tsx          # 메인 랜딩 페이지 및 링크 편집 관리 대시보드
│   └── opengraph-image.tsx # 메인 경로 동적 OG 이미지 생성
├── components/           # 재사용 가능한 비즈니스/UI 컴포넌트
│   └── ui/               # shadcn/ui 기반 원자 컴포넌트 (Button, Skeleton 등)
├── docs/                 # 서비스 기획 및 설계 분석 문서
│   ├── prd.md            # v2 기능 정의서
│   ├── scenarios.md      # 크리에이터/방문자 사용자 시나리오
│   └── Wireframe.md      # UI 와이어프레임 설계도
├── hooks/                # 커스텀 React 훅
├── lib/                  # Firebase 초기화 및 공통 유틸리티
├── public/               # 정적 애셋
├── firestore.rules       # Firebase Firestore 보안 규칙 파일
└── package.json          # 의존성 및 스크립트 정의
```

---

## 🚀 시작 가이드 (Getting Started)

### 1. 저장소 복제 및 의존성 설치
```bash
git clone https://github.com/KimHaeSeul/my-link.git
cd my-link
npm install
```

### 2. 환경 변수 설정
프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고 아래와 같이 Firebase 프로젝트 설정값을 입력합니다.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. 개발 서버 실행
자동으로 브라우저를 열어 로컬 개발 서버를 시작합니다.
```bash
npm run dev
```
개발 서버가 시작되면 브라우저에서 `http://localhost:3000`을 통해 접속할 수 있습니다.

### 4. 빌드 및 프로덕션 검증
```bash
# 코드 린트 및 포맷팅 검증
npm run lint
npm run format

# TypeScript 타입 체크
npm run typecheck

# 프로덕션 빌드
npm run build
```

---

## 🔒 Firebase Security Rules (보안 규칙)

안전한 데이터 보호를 위해 다음과 같은 Firestore 보안 규칙이 설정되어 있습니다. (`firestore.rules` 파일 참고)

- **`users` 컬렉션**:
  - 누구나 프로필 조회가 가능합니다 (`read` 허용).
  - 인증된 사용자 중 오직 본인의 프로필 문서만 생성, 수정 및 삭제할 수 있습니다 (`write` 통제).
- **`links` 하위 컬렉션**:
  - 누구나 링크 리스트 조회가 가능합니다 (`read` 허용).
  - 인증된 소유자 본인만 링크 추가, 수정, 삭제를 할 수 있습니다 (`write` 통제).
  - 단, 방문자가 링크를 클릭할 때의 클릭수 업데이트(`clickCount`)에 한하여 부분적인 업데이트 권한이 안전하게 분리되어 있습니다.

---

## 👤 제작자 및 기여
- **KimHaeSeul** - [GitHub](https://github.com/KimHaeSeul)

---
*본 프로젝트는 군더더기 없는 미학적 즐거움과 최고의 사용성을 제공하기 위해 지속적으로 개선되고 있습니다.*
