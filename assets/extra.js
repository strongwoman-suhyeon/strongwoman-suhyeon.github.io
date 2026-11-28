/* 오늘의 생각창고 · 블로그 글 모음 · 묻고 답하기 (2026-11 추가)
   글 목록(data/blog.json)은 GitHub Actions가 네이버 블로그 RSS에서 매일 자동으로 갱신합니다.
   묻고 답하기 답변은 data/qna.json에 추가하면 바로 보입니다. */
(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const QUESTIONS = [
    '오늘 나를 위해 미뤄 둔 한 가지는 무엇인가요?',
    '요즘 내 몸이 가장 자주 보내는 신호는 무엇인가요?',
    '최근 읽은 문장 중 마음에 남은 한 줄은 무엇인가요?',
    '오늘 고마움을 전하고 싶은 사람은 누구인가요?',
    '지금의 나를 지켜 주는 습관 하나를 꼽는다면요?',
    '내 하루에서 가장 편안한 시간은 언제인가요?',
    '1년 뒤의 내가 오늘의 나에게 해 줄 말은 무엇일까요?',
    '요즘 내가 가장 잘하고 있는 일은 무엇인가요?',
    '오늘 10분만 걷는다면 어디를 걷고 싶나요?',
    '내가 정말 원하는 것과 해야 한다고 느끼는 것은 같은가요?',
    '최근에 나를 웃게 한 장면은 무엇이었나요?',
    '오늘 하지 않기로 정할 일 하나는 무엇인가요?',
    '가족에게 꼭 전하고 싶은 말이 있다면 무엇인가요?',
    '마지막으로 건강검진을 받은 때는 언제였나요?',
    '다시 읽고 싶은 책 한 권을 꼽는다면요?',
    '요즘 나를 지치게 하는 것은 무엇이고, 덜어낼 방법은 있을까요?',
    '오늘 물 한 잔을 더 마신다면 언제가 좋을까요?',
    '내가 가장 나다운 순간은 언제인가요?',
    '걱정하는 일 중 내가 바꿀 수 있는 것은 무엇인가요?',
    '이번 주에 나에게 주고 싶은 작은 선물은 무엇인가요?',
    '오늘 잠들기 전 내려놓고 싶은 생각은 무엇인가요?',
    '요즘 새로 배우고 싶은 것이 있나요?',
    '내 삶에서 꼭 지키고 싶은 것은 무엇인가요?',
    '오늘 아침, 몸은 어떤 기분으로 일어났나요?',
    '누군가에게 받은 좋은 질문 중 기억나는 것이 있나요?',
    '지금 하고 있는 일은 누구에게 도움이 되고 있나요?',
    '오늘 한 번 더 웃어 줄 수 있는 사람은 누구인가요?',
    '작년 이맘때와 비교해 달라진 나는 어떤 모습인가요?',
    '혼자만의 시간이 생긴다면 무엇을 하고 싶나요?',
    '오늘의 나에게 ‘그래도 잘했다’고 말해 줄 일은 무엇인가요?'
  ];

  const CATS = {
    '건강테크': { name: '건강테크', cls: 'cat-health' },
    '2026_50일 재독여행': { name: '재독여행', cls: 'cat-book' },
    '생각창고·독서': { name: '책으로 생각 잇기', cls: 'cat-book' }, // 상위 카테고리에 남은 예전 독서 글 (2026-11-28 정리)
    '북인사이트': { name: '북인사이트', cls: 'cat-book' },
    '책으로 생각 잇기': { name: '책으로 생각 잇기', cls: 'cat-book' },
    '스트롱우먼_생각에세이': { name: '생각에세이', cls: 'cat-essay' }
  };
  const cat = (p) => CATS[p.category] || { name: '박수현 이야기', cls: 'cat-etc' };
  const isHealth = (p) => p.category === '건강테크';
  const isBook = (p) => ['2026_50일 재독여행', '생각창고·독서', '북인사이트', '책으로 생각 잇기'].includes(p.category);
  const isFresh = (p) => isHealth(p) || isBook(p) || p.category === '스트롱우먼_생각에세이';

  // 한국 시간 기준 날짜
  const kstNow = new Date(Date.now() + 9 * 3600e3);
  const dayIndex = Math.floor(kstNow.getTime() / 864e5);
  const WEEK = '일월화수목금토';
  const todayLabel = (kstNow.getUTCMonth() + 1) + '월 ' + kstNow.getUTCDate() + '일 ' + WEEK[kstNow.getUTCDay()] + '요일';
  const fmt = (d) => {
    const x = new Date(new Date(d).getTime() + 9 * 3600e3);
    return x.getUTCFullYear() + '.' + String(x.getUTCMonth() + 1).padStart(2, '0') + '.' + String(x.getUTCDate()).padStart(2, '0');
  };

  const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳㉑㉒㉓㉔㉕㉖㉗㉘㉙㉚㉛㉜㉝㉞㉟㊱㊲㊳㊴㊵㊶㊷㊸㊹㊺㊻㊼㊽㊾㊿';
  const jaedokNo = (t) => {
    const m = t.match(/재독여행\s*([①-⑳㉑-㉟㊱-㊿])/);
    return m ? CIRCLED.indexOf(m[1]) + 1 : 0;
  };
  const healthNo = (t) => {
    const m = t.match(/건강테크\s*_?\s*(\d{2,3})/);
    return m ? Number(m[1]) : 0;
  };
  const cleanHealthTitle = (t) => t.replace(/^건강테크\s*_?\s*\d*\s*회?\s*[｜|_:\-]?\s*/, '').trim() || t;
  function splitBook(t) {
    const book = (t.match(/『[^』]+』/) || [])[0] || '';
    let rest = t.replace(/^50일 재독여행\s*[①-⑳㉑-㉟㊱-㊿]?\s*/, '').replace(book, '').replace(/^[\s_｜|:\-]+/, '').trim();
    return { book, rest: rest || t };
  }

  const thumbHtml = (p, word) =>
    (p.thumb ? '<img src="' + esc(p.thumb) + '" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentNode.classList.add(\'noimg\');this.remove()">' : '') +
    '<span class="ph-word" aria-hidden="true">' + esc(word) + '</span>';

  function postCard(p) {
    const c = cat(p);
    const word = isBook(p) ? (splitBook(p.title).book || '북인사이트') : c.name;
    return '<li><a class="post" href="' + esc(p.link) + '" target="_blank" rel="noopener noreferrer">' +
      '<div class="ph' + (p.thumb ? '' : ' noimg') + '">' + thumbHtml(p, word) + '</div>' +
      '<div class="pb"><div class="meta"><span class="chip-cat ' + c.cls + '">' + esc(c.name) + '</span><span>' + fmt(p.date) + '</span></div>' +
      '<h3>' + esc(p.title) + '</h3>' + (p.summary ? '<p>' + esc(p.summary) + '</p>' : '') +
      '<span class="go">블로그에서 읽기 ↗</span></div></a></li>';
  }

  /* 오늘의 생각창고 */
  function renderToday(posts) {
    const dateEl = $('#today-date');
    if (dateEl) dateEl.textContent = todayLabel;
    const q = QUESTIONS[dayIndex % QUESTIONS.length];
    const qEl = $('#today-question');
    if (qEl) qEl.innerHTML = '<span class="label"><i>오늘의 질문</i></span><p class="q">' + esc(q) + '</p>' +
      '<p>정답은 없어요. 마음속으로 답해 보고, 남기고 싶다면 한 줄로 적어 보세요.</p>' +
      '<a class="go" href="#home/daily">오늘의 작은 기록에 적기 ↓</a>';

    const health = posts.filter(isHealth);
    const books = posts.filter(isBook);
    const hEl = $('#today-health');
    if (hEl && health.length) {
      const p = health[dayIndex % health.length];
      const n = healthNo(p.title);
      hEl.href = p.link;
      hEl.innerHTML = '<span class="label"><i>오늘의 건강테크</i>' + (n ? n + '회' : '') + '</span>' +
        '<h3>' + esc(cleanHealthTitle(p.title)) + '</h3>' + (p.summary ? '<p class="clamp">' + esc(p.summary) + '</p>' : '') +
        '<span class="go">블로그에서 이어 읽기 ↗</span>';
    }
    const bEl = $('#today-book');
    if (bEl && books.length) {
      const p = books[(dayIndex + 3) % books.length];
      const { book, rest } = splitBook(p.title);
      const n = jaedokNo(p.title);
      bEl.href = p.link;
      bEl.innerHTML = '<span class="label"><i>오늘의 북인사이트</i>' + (n ? '재독여행 ' + n + '일째' : '') + '</span>' +
        (book ? '<p class="book-title">' + esc(book) + '</p>' : '') + '<h3>' + esc(rest) + '</h3>' +
        (p.summary ? '<p class="clamp">' + esc(p.summary) + '</p>' : '') +
        '<span class="go">블로그에서 이어 읽기 ↗</span>';
    }
    const fresh = $('#fresh-list');
    if (fresh) {
      fresh.innerHTML = posts.filter(isFresh).slice(0, 4).map((p) => {
        const c = cat(p);
        return '<li><a href="' + esc(p.link) + '" target="_blank" rel="noopener noreferrer"><span class="d">' + fmt(p.date) + '</span>' +
          '<span class="chip-cat ' + c.cls + '">' + esc(c.name) + '</span><span class="t">' + esc(p.title) + '</span></a></li>';
      }).join('');
    }
  }

  /* 오늘의 책 한 줄 (전자책 서재 3줄 루틴에서 대표님이 확인한 카드만 data/today-book.json에 올림) */
  const todayKey = kstNow.getUTCFullYear() + '-' + String(kstNow.getUTCMonth() + 1).padStart(2, '0') + '-' + String(kstNow.getUTCDate()).padStart(2, '0');
  function renderTodayBook(data) {
    const bEl = $('#today-book');
    if (!bEl || !data || !Array.isArray(data.items)) return;
    const it = data.items.find((x) => x.date === todayKey && x.text);
    if (!it) return;
    bEl.href = it.link || '#library';
    if (it.link && /^https?:/.test(it.link)) { bEl.target = '_blank'; } else { bEl.removeAttribute('target'); }
    bEl.innerHTML = '<span class="label"><i>' + esc(it.label || '오늘의 책 한 줄') + '</i>' + (it.theme ? esc(it.theme) : '') + '</span>' +
      '<p class="book-line">' + String(it.text).split(/\n/).map(esc).join('<br>') + '</p>' +
      (it.book ? '<p class="book-src">' + esc(it.book) + '</p>' : '') +
      '<span class="go">' + (it.link ? '이어 읽기 ' + (/^https?:/.test(it.link) ? '↗' : '→') : '북인사이트 둘러보기 →') + '</span>';
  }

  /* 시리즈 진행 */
  function renderSeries(posts) {
    const hs = $('#health-series');
    if (hs) {
      const START = 96, END = 118, total = END - START + 1;
      const inSeries = posts.filter((p) => isHealth(p)).filter((p) => { const n = healthNo(p.title); return n >= START && n <= END; });
      const done = new Set(inSeries.map((p) => healthNo(p.title))).size;
      const latest = inSeries[0];
      hs.innerHTML = '<div><span class="s-label">지금 연재 중</span><h3>「건강검진 결과지 읽어드려요」</h3>' +
        '<p>매주 결과지의 한 칸씩, 쉬운 말로 함께 읽어요.' + (latest ? ' 최신 회차: <a href="' + esc(latest.link) + '" target="_blank" rel="noopener noreferrer">' + esc(cleanHealthTitle(latest.title)) + '</a>' : '') + '</p></div>' +
        '<div class="s-count">' + done + '<small> / ' + total + '회</small></div><div class="bar"><span data-w="' + Math.min(100, (done / total) * 100) + '"></span></div>';
    }
    const ls = $('#library-series');
    if (ls) {
      const nums = posts.filter((p) => p.category === '2026_50일 재독여행').map((p) => jaedokNo(p.title)).filter(Boolean);
      const done = nums.length ? Math.max(...nums) : 0;
      const latest = posts.find((p) => jaedokNo(p.title) === done);
      ls.innerHTML = '<div><span class="s-label">지금 진행 중</span><h3>50일 재독여행</h3>' +
        '<p>다시 꺼내 읽은 책 한 권과, 그 책이 오늘의 나에게 건넨 말.' + (latest ? ' 최신 기록: <a href="' + esc(latest.link) + '" target="_blank" rel="noopener noreferrer">' + esc(splitBook(latest.title).book || latest.title) + '</a>' : '') + '</p></div>' +
        '<div class="s-count">' + done + '<small> / 50일</small></div><div class="bar"><span data-w="' + Math.min(100, (done / 50) * 100) + '"></span></div>';
    }
    requestAnimationFrame(() => document.querySelectorAll('.series .bar span').forEach((s) => { s.style.width = s.dataset.w + '%'; }));
  }

  /* 블로그 전체 글 */
  function setupArchive(key, posts, emptyWord) {
    const list = $('#' + key + '-archive');
    if (!list) return;
    const input = $('#' + key + '-archive-search');
    const count = $('#' + key + '-archive-count');
    const more = $('#' + key + '-archive-more');
    const PAGE = 9;
    let shown = PAGE;
    // 북인사이트 메뉴: [전체] [재독여행] [북인사이트] 거르기 버튼 (2026-11-24 대표님 승인)
    let kind = '전체';
    if (key === 'library' && count && !$('#library-archive-chips')) {
      const KINDS = ['전체', '재독여행', '북인사이트', '책으로 생각 잇기'];
      const num = (k) => (k === '전체' ? posts.length : posts.filter((p) => cat(p).name === k).length);
      const box = document.createElement('div');
      box.className = 'chips';
      box.id = 'library-archive-chips';
      box.setAttribute('aria-label', '북인사이트 글 종류');
      box.style.margin = '4px 0 14px';
      box.innerHTML = KINDS.map((k) => '<button type="button" class="chip" data-kind="' + k + '" aria-pressed="' + (k === '전체') + '">' + k +
        ' <span style="opacity:.6;font-weight:400">' + num(k) + '</span></button>').join('');
      count.parentNode.insertBefore(box, count);
      box.addEventListener('click', (e) => {
        const b = e.target.closest('[data-kind]');
        if (!b) return;
        kind = b.dataset.kind;
        box.querySelectorAll('[data-kind]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        shown = PAGE;
        draw();
      });
    }
    function draw() {
      const q = (input?.value || '').trim().toLocaleLowerCase('ko');
      const items = posts.filter((p) => (kind === '전체' || cat(p).name === kind) &&
        (p.title + ' ' + p.summary).toLocaleLowerCase('ko').includes(q));
      if (count) count.textContent = '블로그 글 ' + items.length + '편' + (kind !== '전체' ? ' · ' + kind : '') + (q ? ' · “' + q + '” 검색 결과' : '');
      list.innerHTML = items.length ? items.slice(0, shown).map(postCard).join('') : '<li class="archive-empty">' + emptyWord + '</li>';
      if (more) more.hidden = items.length <= shown;
    }
    input?.addEventListener('input', () => { shown = PAGE; draw(); });
    more?.addEventListener('click', () => { shown += PAGE; draw(); });
    draw();
  }

  /* 묻고 답하기 */
  function renderQna(data) {
    const box = $('#qna-list');
    if (!box) return;
    const items = (data && Array.isArray(data.items) ? data.items : []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const chips = $('#qna-chips');
    let topic = '전체';
    function draw() {
      const list = items.filter((x) => topic === '전체' || x.topic === topic);
      if (!items.length) {
        box.innerHTML = '<div class="qna-empty"><b>첫 질문을 기다리고 있어요.</b>보내 주신 질문에 대한 답변이 이곳에 차곡차곡 모입니다.<br>작은 궁금증도 괜찮아요.</div>';
        return;
      }
      box.innerHTML = list.length ? list.map((x) =>
        '<details class="qna-item"><summary><span class="qmark" aria-hidden="true">Q.</span><span>' + esc(x.q) + '</span></summary>' +
        '<div class="ans"><span class="who">' + esc(x.topic || '') + (x.nickname ? ' · ' + esc(x.nickname) + '님의 질문' : '') + (x.date ? ' · ' + esc(x.date) : '') + '</span>' +
        String(x.a || '').split(/\n{2,}/).map((t) => '<p>' + esc(t).replace(/\n/g, '<br>') + '</p>').join('') +
        (x.link ? '<p><a class="textlink" href="' + esc(x.link) + '" target="_blank" rel="noopener noreferrer">자세히 읽기 ↗</a></p>' : '') +
        '</div></details>').join('') : '<div class="qna-empty">이 주제의 답변은 아직 없어요.</div>';
    }
    chips?.addEventListener('click', (e) => {
      const b = e.target.closest('[data-qtopic]');
      if (!b) return;
      topic = b.dataset.qtopic;
      chips.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      draw();
    });
    draw();
  }

  const bust = '?v=' + dayIndex;
  fetch('data/blog.json' + bust).then((r) => r.json()).then((d) => {
    const posts = (d.posts || []).slice().sort((a, b) => b.date.localeCompare(a.date));
    renderToday(posts);
    renderSeries(posts);
    setupArchive('health', posts.filter(isHealth), '검색어와 맞는 건강테크 글이 없어요.');
    setupArchive('library', posts.filter(isBook), '검색어와 맞는 독서 기록이 없어요.');
    return fetch('data/today-book.json' + bust).then((r) => r.json()).then(renderTodayBook).catch(() => {});
  }).catch(() => {
    renderToday([]);
    document.querySelectorAll('.today-card .skeleton').forEach((s) => s.remove());
  });
  fetch('data/qna.json' + bust).then((r) => r.json()).then(renderQna).catch(() => renderQna({ items: [] }));
})();

/* 상단 작은 관리자 메뉴 (2026-11-27 대표님 요청: 나만 들어가는 제작물 게시판) */
(() => {
  const row = document.querySelector('.header .navrow');
  if (!row || row.querySelector('.admin-mini')) return;
  const st = document.createElement('style');
  st.textContent = '.admin-mini{display:inline-flex;align-items:center;gap:4px;margin-left:6px;padding:4px 9px;border-radius:999px;border:1px solid rgba(48,76,135,.18);color:#7a7f8c;font-size:12px;font-weight:600;line-height:1;text-decoration:none;opacity:.7;white-space:nowrap}'
    + '.admin-mini:hover,.admin-mini:focus-visible{opacity:1;color:#304c87;border-color:rgba(48,76,135,.45)}'
    + '.admin-mini svg{width:12px;height:12px}'
    + '@media (max-width:980px){.admin-mini{order:2;margin-left:auto;margin-right:6px}.admin-mini span{display:none}}';
  document.head.appendChild(st);
  const a = document.createElement('a');
  a.className = 'admin-mini';
  a.href = '/admin/#works';
  a.title = '나만 보는 제작물 게시판 (비밀번호 필요)';
  a.setAttribute('aria-label', '관리자 제작물 게시판');
  a.rel = 'nofollow';
  a.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg><span>관리</span>';
  const cta = row.querySelector('.nav-cta');
  if (cta) cta.after(a); else row.appendChild(a);
})();
