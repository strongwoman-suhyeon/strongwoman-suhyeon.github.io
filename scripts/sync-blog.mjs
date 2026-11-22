// 네이버 블로그 RSS를 읽어 data/blog.json을 갱신합니다.
// GitHub Actions가 매일 실행합니다. 의존성 없음 (Node 20+).
import fs from 'node:fs/promises';

const RSS = 'https://rss.blog.naver.com/strongwoman_1316.xml';
const OUT = new URL('../data/blog.json', import.meta.url);

async function loadXml() {
  if (process.env.RSS_FILE) return fs.readFile(process.env.RSS_FILE, 'utf8');
  const res = await fetch(RSS, { headers: { 'User-Agent': 'Mozilla/5.0 (strongwoman.kr blog sync)' } });
  if (!res.ok) throw new Error('RSS ' + res.status);
  return res.text();
}

const decode = (s) => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/\u00a0/g, ' ')
  .trim();
const tag = (x, t) => {
  const m = x.match(new RegExp('<' + t + '>([\\s\\S]*?)</' + t + '>'));
  return m ? decode(m[1]) : '';
};

function cleanSummary(html) {
  let t = html.replace(/<img[^>]*>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  t = t.replace(/^\d{4}년 \d{1,2}월 \d{1,2}일 \S+요일\s*(재독 기록)?\s*/, '');
  t = t.replace(/^안녕하세요[.,!]?\s*스트롱우먼 박수현입니다[.!]?\s*/, '');
  t = t.replace(/\.{3,}\s*$/, '').trim();
  if (t.length > 120) t = t.slice(0, 118).replace(/\s+\S*$/, '') + '…';
  return t;
}

let xml;
try {
  xml = await loadXml();
} catch (e) {
  console.error('블로그 RSS를 읽지 못했습니다. 기존 목록을 그대로 둡니다:', e.message);
  process.exit(0);
}

const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
  const x = m[1];
  const link = tag(x, 'link').split('?')[0];
  const id = (link.match(/\/(\d+)$/) || [])[1] || link;
  const rawDesc = tag(x, 'description');
  const thumb = (rawDesc.match(/<img[^>]+src="([^"]+)"/) || [])[1] || '';
  return {
    id,
    title: tag(x, 'title'),
    link,
    category: tag(x, 'category'),
    date: new Date(tag(x, 'pubDate')).toISOString(),
    summary: cleanSummary(rawDesc),
    thumb: thumb.replace(/^http:/, 'https:'),
  };
}).filter((p) => p.id && p.title);

if (!items.length) {
  console.error('RSS에 글이 없습니다. 기존 목록을 그대로 둡니다.');
  process.exit(0);
}

let old = { posts: [] };
try { old = JSON.parse(await fs.readFile(OUT, 'utf8')); } catch {}

// RSS는 최근 글만 보여 주므로, 그보다 오래된 글은 보관 목록에서 유지합니다.
// RSS 범위 안에서 사라진 글은 삭제·비공개로 보고 목록에서 뺍니다.
const oldest = items.reduce((min, p) => (p.date < min ? p.date : min), items[0].date);
const keep = (old.posts || []).filter((p) => p.date < oldest && !items.some((i) => i.id === p.id));
const posts = [...items, ...keep].sort((a, b) => b.date.localeCompare(a.date));

const next = { source: 'https://blog.naver.com/strongwoman_1316', posts };
if (JSON.stringify(old.posts || []) === JSON.stringify(posts)) {
  console.log('바뀐 글이 없습니다. (' + posts.length + '편)');
} else {
  next.updated = new Date().toISOString();
  await fs.writeFile(OUT, JSON.stringify(next, null, 1) + '\n');
  console.log('글 목록을 갱신했습니다. (' + posts.length + '편)');
}
