// 검색 노출용 실제 주소 페이지(/about/ /care/ /health/ /library/)와 sitemap.xml을 만듭니다.
// 배포 워크플로가 블로그 글 목록(data/blog.json)을 갱신한 뒤 실행하므로, 새 글이 올라오면 목록에 자동 반영됩니다.
// 의존성 없음 (Node 20+).
import fs from 'node:fs/promises';

const SITE = 'https://strongwoman.kr';
const BLOG = 'https://blog.naver.com/strongwoman_1316';
const OG = SITE + '/assets/homepage-og-20261120-v3.jpg';
const ROOT = new URL('../', import.meta.url);

const blog = JSON.parse(await fs.readFile(new URL('data/blog.json', ROOT), 'utf8'));
const posts = (blog.posts || []).slice().sort((a, b) => b.date.localeCompare(a.date));
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ymd = (iso) => new Date(new Date(iso).getTime() + 9 * 3600e3).toISOString().slice(0, 10);
const kdate = (iso) => { const d = ymd(iso).split('-'); return `${d[0]}.${d[1]}.${d[2]}`; };
const clean = (t) => String(t || '').replace(/\s+/g, ' ').trim();
const today = ymd(new Date().toISOString());

const byCat = (...cats) => posts.filter((p) => cats.includes(clean(p.category)));
const health = byCat('건강테크');
const books = byCat('2026_50일 재독여행', '생각창고·독서');
const essays = byCat('스트롱우먼_생각에세이', '박수현 소개', '프롤로그');

const NAV = [
  ['/', '홈'], ['/about/', '박수현 소개'], ['/care/', '보장분석'], ['/health/', '건강테크'], ['/library/', '북인사이트'], ['/claim/', '보험금 청구'],
];

function layout({ path, title, desc, h1, eyebrow, lead, body, jsonld = [], crumbs }) {
  const url = SITE + path;
  const crumbLd = {
    '@type': 'BreadcrumbList',
    itemListElement: [{ '@type': 'ListItem', position: 1, name: '홈', item: SITE + '/' }, { '@type': 'ListItem', position: 2, name: crumbs, item: url }],
  };
  const ld = { '@context': 'https://schema.org', '@graph': [crumbLd, ...jsonld] };
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#304c87">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:locale" content="ko_KR"><meta property="og:site_name" content="스트롱우먼 박수현">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}">
<meta property="og:image" content="${OG}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${OG}">
<link rel="icon" type="image/svg+xml" href="/card/assets/icon.svg">
<link rel="stylesheet" href="/assets/seo.css?v=20261126">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
<a class="skip" href="#main">본문으로 건너뛰기</a>
<header class="top"><div class="wrap toprow">
<a class="brand" href="/" aria-label="스트롱우먼 박수현 홈페이지로"><b>스트롱우먼 박수현</b><small>삶을 지키는 온라인 생각창고</small></a>
<nav class="nav" aria-label="주요 메뉴">${NAV.map(([h, t]) => `<a href="${h}"${h === path ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
</div></header>
<main id="main">
<section class="hero"><div class="wrap">
<p class="crumbs"><a href="/">홈</a> › <span>${esc(crumbs)}</span></p>
<span class="eyebrow">${esc(eyebrow)}</span>
<h1>${h1}</h1>
<p class="lead">${lead}</p>
</div></section>
${body}
</main>
<footer class="foot"><div class="wrap">
<p><b>스트롱우먼 박수현</b> · 광주 라이프플래너 · 오늘을 지키고 내일을 설계합니다</p>
<nav aria-label="바로가기"><a href="/">홈페이지</a><a href="/card/">전자명함·전화 상담</a><a href="/claim/">보험금 청구 서류</a><a href="${BLOG}" rel="noopener">네이버 블로그</a><a href="https://www.youtube.com/@strongwoman_suhyeon" rel="noopener">유튜브</a></nav>
<p class="note">보험 보장은 상품과 약관에 따라 다르며, 이 페이지는 특정 상품의 가입 권유나 보장 확약이 아닙니다. 건강 정보는 일반적인 생활 정보이며 개인별 의료 자문이 아닙니다.</p>
<p class="note">© ${new Date().getFullYear()} 스트롱우먼 박수현</p>
</div></footer>
</body>
</html>
`;
}

function postList(items, limit) {
  const list = limit ? items.slice(0, limit) : items;
  if (!list.length) return '<p class="muted">곧 글이 올라옵니다.</p>';
  return `<div class="posts">${list.map((p) => `<article class="post">
<p class="meta">${esc(clean(p.category))} · ${kdate(p.date)}</p>
<h3><a href="${esc(p.link)}" rel="noopener">${esc(clean(p.title))}</a></h3>
<p>${esc(clean(p.summary))}</p>
<a class="more" href="${esc(p.link)}" rel="noopener">블로그에서 읽기 →</a>
</article>`).join('\n')}</div>`;
}
const itemListLd = (name, items) => ({
  '@type': 'ItemList', name, numberOfItems: items.length,
  itemListElement: items.slice(0, 50).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: p.link, name: clean(p.title) })),
});

const pages = {};

// ---------- /care/ ----------
const faq = [
  ['가지고 있는 보험을 바로 바꿔야 하나요?', '변경을 전제로 시작하지 않습니다. 먼저 현재 계약의 보장 내용과 조건을 이해하고, 유지할 부분과 추가 확인할 부분을 구분하는 것이 중요합니다.'],
  ['어떤 자료를 준비하면 좋을까요?', '현재 가입 내용, 궁금한 점, 최근의 생활 변화를 정리해두면 도움이 됩니다. 민감한 자료의 구체적인 범위와 전달 방법은 상담 전에 별도로 확인하세요.'],
  ['건강테크는 의료 상담인가요?', '아닙니다. 일반적인 생활 실천 정보를 나누는 콘텐츠입니다. 질환의 진단이나 치료, 약 복용의 변경은 담당 의료진과 상의해야 합니다.'],
];
pages['care'] = layout({
  path: '/care/', crumbs: '보험 보장분석·맞춤설계 상담',
  title: '보험 보장분석·맞춤설계 상담 · 전국 비대면 가능 | 스트롱우먼 박수현',
  desc: '보험 보장분석과 1:1 맞춤설계 상담. 가입한 보험의 보장 내용, 갱신, 겹치는 보장과 빈 곳을 쉬운 말로 점검하고 생활에 맞게 정리합니다. 전국 비대면 상담도 가능합니다.',
  eyebrow: '삶을 지키는 보장',
  h1: '내 보험을 이해하는 것부터,<br>보험 보장분석·맞춤설계 상담',
  lead: '얼마나 많이 가입했는지보다, 지금 내 삶에 어떤 보장이 필요한지 함께 살펴봅니다. 계약 변경을 결정하기 전, 가지고 있는 보장을 먼저 이해해보세요.',
  jsonld: [
    { '@type': 'ProfessionalService', '@id': SITE + '/#service', name: '스트롱우먼 박수현 보험 보장분석·맞춤설계 상담', url: SITE + '/care/', telephone: '+82-10-2000-0220', areaServed: [{ '@type': 'Country', name: '대한민국' }, { '@type': 'AdministrativeArea', name: '광주광역시' }], address: { '@type': 'PostalAddress', addressLocality: '광주광역시', addressCountry: 'KR' } },
    { '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ],
  body: `<section class="sec"><div class="wrap">
<h2>상담은 이렇게 생각합니다</h2>
<ol class="steps">
<li><b>지금의 삶과 고민 듣기</b><span>가족 구성, 생활의 변화, 가장 궁금한 점부터 이야기를 나눕니다.</span></li>
<li><b>현재 보장 이해하기</b><span>가입 내용과 보장 기간, 갱신 여부, 지급 조건을 쉬운 말로 살펴봅니다.</span></li>
<li><b>선택의 이유 설명하기</b><span>유지하거나 점검할 부분을 구분하고, 결정 전에 확인할 사항을 정리합니다.</span></li>
</ol>
<p>광주 지역은 물론 <b>전국 어디서나 비대면으로 상담</b>받으실 수 있습니다. 상담 방법과 일정은 <a href="/card/"><u>전자명함</u></a>에서 문의해 주세요.</p>
<p class="muted">상담 범위와 자료 전달 방법은 문의 후 개별 확인이 필요합니다. 특정 상품 가입이나 보험금 지급을 보장하지 않습니다.</p>
</div></section>
<section class="sec alt"><div class="wrap">
<h2>증권분석이 먼저입니다</h2>
<p>증권은 내가 가진 보장의 지도입니다. 어떤 보장이 있는지, 겹치는 것은 무엇인지, 비어 있는 곳은 어디인지, 갱신과 가입 순서는 어떤지를 먼저 살펴야 무엇이 더 필요한지도 보입니다. 상품을 권하기 전에 이미 가진 것을 이해하는 것, 그것이 보장분석의 출발점입니다.</p>
<p>보장은 한 번 정하고 끝나는 것이 아닙니다. 결혼, 출산, 육아, 자녀의 성장, 일의 변화, 부모님의 건강처럼 삶의 시기마다 필요한 보장이 달라집니다. 그래서 증권을 보는 것과 함께, 지금 삶의 어디에 있는지를 함께 살펴봅니다.</p>
<p><a class="btn ghost" href="/about/">박수현이 일하는 방식 보기 →</a></p>
</div></section>
<section class="sec"><div class="wrap">
<h2>상담 전, 다섯 가지 질문</h2>
<p class="muted">진단이나 가입 권유가 아닌, 상담 준비용 질문입니다. 잘 모르는 항목은 상담 질문으로 남겨보세요.</p>
<ul class="checks">
<li>현재 내 보험의 보장 내용을 설명할 수 있어요.</li>
<li>갱신 여부와 보장 종료 시점을 알고 있어요.</li>
<li>매달 내는 보험료가 생활에 무리가 없는지 살펴봤어요.</li>
<li>가족이나 직업의 변화가 보장에 반영됐는지 확인했어요.</li>
<li>보험금을 청구할 때 어디에 문의할지 알고 있어요.</li>
</ul>
</div></section>
<section class="sec alt"><div class="wrap">
<h2>미리 궁금한 이야기</h2>
<div class="faq">${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
</div></section>
<section class="sec"><div class="wrap">
<div class="callout"><b>기존 계약을 해지하고 새 계약을 체결하기 전에</b><span>보험료 인상, 가입 거절, 보장 제한 등이 생길 수 있습니다. 변경 전에는 기존 계약의 조건과 새 계약의 차이를 충분히 확인하세요.</span></div>
<h2>보험금 청구, 서류부터 접수까지</h2>
<p>상황별 필요 서류를 확인하고, 보험사별 청구서 양식을 받아 모바일로 바로 접수하세요.</p>
<p class="cta"><a class="btn" href="/claim/">보험금 청구 안내 보기</a><a class="btn ghost" href="/card/">전자명함에서 상담 문의</a></p>
</div></section>`,
});

// ---------- /health/ ----------
pages['health'] = layout({
  path: '/health/', crumbs: '건강테크',
  title: '건강테크 글 모음 · 건강검진 결과지 읽는 법 | 스트롱우먼 박수현',
  desc: `건강검진 결과지와 생활 속 건강 실천을 쉬운 말로 풀어쓴 건강테크 시리즈 ${health.length}편. 박수현의 네이버 블로그 글을 한곳에 모았습니다.`,
  eyebrow: '건강 지식이 먼저다',
  h1: '건강테크, 오늘의 작은 실천',
  lead: '많이 아는 것보다 한 가지를 내 일상에 적용하는 것. 건강검진 결과지부터 생활 습관까지, 어려운 건강 이야기를 생활의 언어로 풀어봅니다.',
  jsonld: [itemListLd('건강테크 글 모음', health)],
  body: `<section class="sec"><div class="wrap">
<h2>지금까지 나눈 건강 이야기 <small>(${health.length}편)</small></h2>
<p class="muted">네이버 블로그에 올린 건강테크가 이곳에 자동으로 모입니다. 최신 글이 가장 위에 보입니다.</p>
${postList(health)}
<p class="cta"><a class="btn" href="${BLOG}?categoryNo=0" rel="noopener">블로그에서 전체 보기</a></p>
<div class="callout"><b>건강테크는 일반적인 생활 정보입니다</b><span>개인별 의료 자문이 아닙니다. 통증이나 불편이 있다면 무리하지 말고 의료진과 상의하세요. 질환이나 복용약이 있는 경우 개인에게 맞는 방법을 확인해야 합니다.</span></div>
</div></section>`,
});

// ---------- /library/ ----------
pages['library'] = layout({
  path: '/library/', crumbs: '북인사이트',
  title: '50일 재독여행 · 북인사이트 독서 기록 | 스트롱우먼 박수현',
  desc: `다시 읽고, 기록하고, 삶으로 옮기는 박수현의 독서 기록. 50일 재독여행과 생각창고 독서 글 ${books.length}편을 한곳에 모았습니다.`,
  eyebrow: '읽은 것을 내 일상으로',
  h1: '책에서 삶으로 옮겨 온 기록',
  lead: '새벽에 책을 펼치고 손으로 기록하는 작은 약속. 50일 동안 다시 읽은 책의 문장을 오늘의 실천으로 연결한 재독여행 기록입니다.',
  jsonld: [itemListLd('북인사이트 · 50일 재독여행', books)],
  body: `<section class="sec"><div class="wrap">
<h2>50일 재독여행 · 독서 기록 <small>(${books.length}편)</small></h2>
<p class="muted">책 한 권을 다시 읽고, 인상 깊은 문장과 나의 생각을 기록했습니다. 최신 글이 가장 위에 보입니다.</p>
${postList(books)}
<p class="cta"><a class="btn" href="${BLOG}" rel="noopener">블로그에서 전체 보기</a></p>
</div></section>`,
});

// ---------- /about/ ----------
pages['about'] = layout({
  path: '/about/', crumbs: '박수현 소개',
  title: '박수현 소개 · 광주 보험 설계사 라이프플래너 | 스트롱우먼 박수현',
  desc: '2010년부터 보험업에 몸담은 광주 라이프플래너 박수현(스트롱우먼)을 소개합니다. 증권분석에서 시작해 가족 컨설팅으로 이어지는 선택설계자의 일하는 방식.',
  eyebrow: '스트롱우먼 박수현 선택설계자',
  h1: '배우며, 연결하며, 함께 자랍니다.',
  lead: '안녕하세요. 스트롱우먼 박수현, 선택설계자입니다. 광주에서 보험 설계사이자 라이프플래너로 일하고 있습니다.',
  jsonld: [
    { '@type': 'ProfilePage', mainEntity: { '@type': 'Person', '@id': SITE + '/#person', name: '박수현', alternateName: '스트롱우먼 박수현', jobTitle: '보험 설계사·라이프플래너(선택설계자)', url: SITE + '/about/', image: OG, sameAs: [BLOG, 'https://www.youtube.com/@strongwoman_suhyeon', 'https://www.instagram.com/strong_woman_a/', 'https://www.instagram.com/happymom1316/'] } },
  ],
  body: `<section class="sec"><div class="wrap">
<p>2010년 8월 보험 일을 시작한 이후, 고객이 자신의 보장을 이해하고 필요한 선택을 할 수 있도록 돕는 일을 중요하게 생각해왔습니다. 제 일상에는 보험 공부만큼이나 독서와 기록, 건강을 공부하는 시간이 있습니다. 배운 것을 쉬운 말로 나누고, 오늘의 작은 실천으로 연결하는 것이 제가 지향하는 방식입니다.</p>
<h2>이름에 담은 뜻</h2>
<h3>왜 스트롱우먼인가요</h3>
<p>사람 안의 힘을 믿기 때문입니다. 사람 안에는 이미 삶을 지켜낼 힘이 있다고 믿고, 그 힘을 깨워 스스로 책임지는 길에 조용히 함께 걷겠다는 다짐입니다.</p>
<h3>왜 선택설계자인가요</h3>
<p>선택의 환경을 함께 만들기 때문입니다. 상품을 앞세우기보다 지금의 보장을 이해하고, 놓치기 쉬운 부분을 점검하고, 생활과 연결해 정리하도록 돕습니다. 선택을 대신하는 사람이 아니라, 고객님이 이해하고 스스로 선택하도록 돕는 사람입니다.</p>
</div></section>
<section class="sec alt"><div class="wrap">
<h2>일하는 방식: 증권분석에서 시작해, 가족 컨설팅으로</h2>
<ol class="steps">
<li><b>보장분석에서 시작했습니다</b><span>보험을 믿지 않던 시절의 경험에서, 판매가 아닌 분석의 눈으로 보험을 이해하는 일을 시작했습니다.</span></li>
<li><b>증권분석이 먼저입니다</b><span>증권은 내가 가진 보장의 지도입니다. 상품을 권하기 전에 이미 가진 것을 이해합니다.</span></li>
<li><b>라이프사이클을 함께 봅니다</b><span>결혼, 출산, 육아, 일의 변화처럼 삶의 시기마다 필요한 보장이 달라집니다.</span></li>
<li><b>희노애락과 연결합니다</b><span>보험은 삶의 모든 순간에 일상을 이어가도록 돕는 준비라고 생각합니다.</span></li>
</ol>
<p>그래서 한 사람의 상품이 아니라 가족 단위로 삶을 살펴보는 가족 컨설팅을 주로 합니다. 보험 보장의 세부 내용은 상품과 약관에 따라 다르며, 이 글은 일하는 방식을 소개하는 글입니다.</p>
<p><a class="btn" href="/care/">보험 보장분석 상담 안내</a></p>
</div></section>
<section class="sec"><div class="wrap">
<h2>걸어온 길</h2>
<ul class="timeline">
<li><b>2010.8</b> 메리츠화재 입사, 보험업의 시작</li>
<li><b>2014~2016</b> 우수인증설계사 3회</li>
<li><b>2017</b> 지금융코리아 그레이트 합류</li>
<li><b>2023~2026</b> 우수인증설계사 4년 연속</li>
<li><b>2024</b> 연도대상 2위 · 100만클럽</li>
<li><b>2025</b> 연도대상 동상</li>
<li><b>2025.2~</b> 북팟 원포인트 15분 강의 진행</li>
</ul>
<p class="muted">보유한 강의 자료와 수상 기록을 바탕으로 정리한 것이며, 일부 연도는 자료 기준입니다.</p>
</div></section>
<section class="sec alt"><div class="wrap">
<h2>박수현의 글</h2>
${postList(essays, 12)}
<p class="cta"><a class="btn" href="${BLOG}" rel="noopener">네이버 블로그 가기</a><a class="btn ghost" href="/card/">전자명함 보기</a></p>
</div></section>`,
});

for (const [dir, html] of Object.entries(pages)) {
  await fs.mkdir(new URL(dir + '/', ROOT), { recursive: true });
  await fs.writeFile(new URL(dir + '/index.html', ROOT), html);
}

// ---------- sitemap.xml ----------
const latest = (arr) => (arr.length ? ymd(arr[0].date) : today);
const urls = [
  ['/', ymd(blog.updated || new Date().toISOString()), 'daily', '1.0'],
  ['/care/', today, 'monthly', '0.9'],
  ['/about/', today, 'monthly', '0.8'],
  ['/health/', latest(health), 'weekly', '0.8'],
  ['/library/', latest(books), 'weekly', '0.8'],
  ['/card/', '2026-11-26', 'monthly', '0.7'],
  ['/claim/', '2026-11-23', 'monthly', '0.7'],
];
const sm = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([p, d, f, pr]) => `  <url>\n    <loc>${SITE}${p}</loc>\n    <lastmod>${d}</lastmod>\n    <changefreq>${f}</changefreq>\n    <priority>${pr}</priority>\n  </url>`).join('\n')}
</urlset>
`;
await fs.writeFile(new URL('sitemap.xml', ROOT), sm);
console.log('SEO 페이지 생성 완료:', Object.keys(pages).join(', '), '· 건강', health.length, '· 독서', books.length, '· 에세이', essays.length);
