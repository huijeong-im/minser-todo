# 민서맘 투두리스트 앱

## 프로젝트 개요
개인용 할 일 관리 앱. 비개발자인 민서맘이 직접 사용하는 앱이므로 기능 추가 시 사용성을 최우선으로 고려할 것.

## 기술 스택
- React (Vite)
- 스타일: 인라인 스타일 (CSS 파일 없음)
- 데이터 저장: localStorage (서버 없음)
- 배포: Vercel (`vercel --prod --yes`)

## 주요 기능
- 할 일 추가/완료/삭제
- 카테고리: 육아👶 / 집안일🏠 / 개인🌿 / 중요⭐
- 완료 항목은 전체 탭에서 하단으로 자동 정렬
- 길게 눌러 드래그로 순서 변경 (sortMode)
- 미완료 상태로 하루 지난 항목에 🔄 이월 뱃지 표시
- 프로필 사진 변경 (300px 압축 후 localStorage 저장)
- 매일 명언 표시 (날짜 기반, 30개 목록)
- 매일 알림 설정 (서비스워커 + Web Notifications API)
- 완료 체크 시 🎉 컨페티 애니메이션

## localStorage 키
- `minser-todos`: 할 일 목록 (JSON 배열)
- `minser-profile`: 프로필 사진 (base64)
- `minser-notif-time`: 알림 시간 ("HH:MM")
- `minser-notif-enabled`: 알림 활성화 여부 ("true"/"false")

## 디자인 원칙
- 색상 테마: 핑크/살구/베이지 계열 (따뜻하고 포근한 느낌)
- 메인 컬러: #FF8FAB (핑크), #FFBE98 (살구), #5D2A42 (다크 로즈)
- 폰트 크기: 입력창 최소 16px 유지 (iOS 자동 확대 방지)
- 모바일 우선 디자인, 최대 너비 480px

## 수정 시 주의사항
- 카테고리 이름/이모지 변경 시 CATEGORY_COLORS, CATEGORY_EMOJI 두 곳 모두 수정
- 스타일은 CSS 파일 대신 인라인 스타일로 작성
- 배포 명령어: `cd "Desktop/Web Developement/todo-app" && npm run build && vercel --prod --yes`
