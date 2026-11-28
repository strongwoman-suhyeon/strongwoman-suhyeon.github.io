# strongwoman.kr

스트롱우먼 박수현의 홈페이지(삶을 지키는 생각창고)입니다.

- 홈페이지: index.html (메인), card/ (전자명함)
- 블로그 글 목록: data/blog.json — GitHub Actions가 매일 06:00, 20:00(한국 시간)에 네이버 블로그 RSS에서 자동 갱신
- 묻고 답하기 답변: data/qna.json 에 항목을 추가하면 바로 반영
- 오늘의 생각창고: assets/extra.js 가 날짜에 맞춰 건강테크·북인사이트·오늘의 질문을 자동으로 바꿔 보여 줌
- 배포: main 브랜치에 올리면 GitHub Pages로 자동 배포 (.github/workflows/deploy.yml)
- 오늘의 책 한 줄: data/today-book.json 에 대표님이 확인한 카드(날짜별)를 추가하면 그날 '오늘의 북인사이트' 카드에 표시. 없으면 블로그 독서 글을 보여 줌
- 도메인: strongwoman.kr (가비아 DNS: A 185.199.108~111.153, www CNAME strongwoman-suhyeon.github.io, 구글 인증 TXT 유지)
- 관리자 화면: admin/ (대시보드 + 자료 보관함). 내용은 모두 암호화된 파일(admin/d/*.bin)이라 비밀번호 없이는 열리지 않음. 검색 제외(noindex). 로컬 빌드 스크립트로 만들어 올리며 저장소에서 직접 고치지 않음
