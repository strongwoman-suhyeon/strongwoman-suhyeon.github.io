(function () {
  'use strict';
  document.documentElement.classList.add('js');

  /* 상황별 서류: 칩으로 한 가지씩 보기 */
  var caseTabs = Array.prototype.slice.call(document.querySelectorAll('[data-case]'));
  var casePanels = Array.prototype.slice.call(document.querySelectorAll('[data-panel]'));
  function showCase(id, focus) {
    caseTabs.forEach(function (t) {
      var on = t.getAttribute('data-case') === id;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
      if (on && t.scrollIntoView && window.innerWidth < 720) {
        t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      }
    });
    casePanels.forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== id; });
  }
  if (caseTabs.length) {
    caseTabs.forEach(function (t, i) {
      t.addEventListener('click', function () { showCase(t.getAttribute('data-case')); });
      t.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        var n = (i + (e.key === 'ArrowRight' ? 1 : -1) + caseTabs.length) % caseTabs.length;
        showCase(caseTabs[n].getAttribute('data-case'), true);
      });
    });
    showCase(caseTabs[0].getAttribute('data-case'));
  }

  /* 보험사 찾기: 이름 검색 + 종류 고르기 */
  var input = document.getElementById('ins-search');
  var groupBtns = Array.prototype.slice.call(document.querySelectorAll('[data-group-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.ins'));
  var count = document.getElementById('ins-count');
  var empty = document.getElementById('ins-empty');
  var group = 'all';
  function norm(s) { return (s || '').toLowerCase().replace(/\s+/g, ''); }
  function apply() {
    var q = norm(input && input.value);
    var shown = 0;
    cards.forEach(function (c) {
      var ok = (group === 'all' || c.getAttribute('data-group') === group) &&
        (!q || norm(c.getAttribute('data-keys')).indexOf(q) !== -1);
      c.hidden = !ok;
      if (ok) shown++;
    });
    if (count) count.textContent = shown + '곳';
    if (empty) empty.hidden = shown !== 0;
  }
  if (input) input.addEventListener('input', apply);
  groupBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      group = b.getAttribute('data-group-filter');
      groupBtns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      apply();
    });
  });
  apply();

  /* 휴대폰 하단 버튼: 첫 화면을 지나면 보이기 */
  var dock = document.querySelector('.dock');
  var hero = document.querySelector('.hero');
  if (dock && hero) {
    var onScroll = function () { dock.classList.toggle('on', window.scrollY > hero.offsetHeight - 120); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
