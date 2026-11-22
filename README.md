# strongwoman.kr

스트롱우먼 박수현의 홈페이지(삶을 지키는 온라인 생각창고)입니다.

- 홈페이지: index.html (메인), card/ (전자명함)
- 블로그 글 목록: data/blog.json — GitHub Actions가 매일 06:00, 20:00(한국 시간)에 네이버 블로그 RSS에서 자동 갱신
- 묻고 답하기 답변: data/qna.json 에 항목을 추가하면 바로 반영
- 오늘의 생각창고: assets/extra.js 가 날짜에 맞춰 건강테크·북인사이트·오늘의 질문을 자동으로 바꿔 보여 줌
- 배포: main 브랜치에 올리면 GitHub Pages로 자동 배포 (.github/workflows/deploy.yml)
