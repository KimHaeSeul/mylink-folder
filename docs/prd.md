# [PRD] 마이링크 (My-Link) 서비스 기능 정의서 (v2)

## 1. 프로젝트 개요
- **프로젝트명**: 마이링크 (My-Link)
- **목적**: 불필요한 기능을 걷어낸, 닉네임 기반의 가장 심플한 링크 관리 서비스.
- **핵심 가치**: "이미지 없이 텍스트와 파비콘만으로 완성하는 깔끔한 프로필"

## 2. 타겟 사용자
- **심플함을 선호하는 크리에이터**: 이미지 업로드나 복잡한 설정 없이 링크만 빠르게 공유하고 싶은 사용자.
- **개인 브랜딩 사용자**: 본인의 닉네임을 URL로 사용하여 아이덴티티를 표현하고 싶은 사용자.

## 3. 핵심 기능 목록

### 3.1 필수 기능 (Phase 1)
| 구분 | 기능명 | 상세 내용 |
| :--- | :--- | :--- |
| **인증** | 구글 소셜 로그인 | Firebase Auth를 통한 가입 및 로그인 |
| **프로필** | 프로필 설정 | **Google 프로필 이미지**(자동), **displayName**, **bio** 수정 기능 |
| **링크 관리** | 링크 추가 및 삭제 | 링크 제목과 URL 입력 |
| **편집** | **인라인 편집** | 링크 목록에서 제목과 URL을 즉시 수정 가능 |
| **아이콘** | **자동 파비콘** | Google API를 사용하여 URL 기반 파비콘 노출 |
| **UI/UX** | **shadcn/ui 기반** | **스켈레톤 UI**, **고정 푸터(CTA)** 포함 심플 모던 디자인 |
| **공유** | displayName URL | `mylink.com/displayName` 형태의 고유 접근 경로 제공 |

### 3.2 확장 기능 (Phase 2)
| 구분 | 기능명 | 상세 내용 |
| :--- | :--- | :--- |
| **통계** | **클릭 조회수** | 각 링크 아이템별 누적 클릭 수 추적 및 노출 |

## 4. 상세 설명 및 데이터 모델링

### 4.1 데이터베이스 구조 (Firebase Firestore)
- **사용자 정보 (Root Collection: `users`)**
  - Document ID: `{uid}`
  - Fields: `displayName`, `bio`, `email`, `photoURL` (Google Profile), `createdAt`
- **링크 정보 (Sub-collection: `users/{uid}/links`)**
  - Document ID: 자동 생성
  - Fields: `title`, `url`, `clickCount`, `createdAt`

### 4.2 인라인 편집 UI
- 링크 아이템 클릭 시 텍스트가 입력 필드(Input)로 전환되어 즉시 수정 가능.
- 포커스를 잃거나 Enter 키 입력 시 자동 저장.

### 4.3 파비콘 API 활용
- Google Favicon 서비스 사용: `https://www.google.com/s2/favicons?domain=[URL]&sz=64`
- URL 입력 완료 시 해당 도메인의 파비콘을 실시간으로 가져와 리스트에 노출.

### 4.4 URL 라우팅 및 displayName 설정
- **URL Slug**: 사용자의 `displayName`이 즉시 URL 주소가 됨 (`mylink.com/displayName`).
- **초기값 설정**: 첫 로그인 시 구글 지메일 계정의 앞부분(`email.split('@')[0]`)을 가져와서 `displayName` 초기값으로 설정함.
- **중복 체크**: 고유한 URL 제공을 위해 `displayName` 중복 체크 기능 필요.

## 5. 기술 스택
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend/Auth**: Firebase (Authentication, Cloud Firestore)
- **Deployment**: Vercel

---
*본 문서는 사용자의 수정 요청을 바탕으로 이미지 업로드 및 복잡한 정렬 기능을 제외하고 본연의 기능에 집중하여 재작성되었습니다.*
