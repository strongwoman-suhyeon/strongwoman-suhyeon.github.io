/* 생각창고 안으로: 둘러보기 이동과 지도 동작 */
(()=>{
'use strict';
const targets={tour:'#tour',dawn:'#dawn-room'};
function go(){const key=(location.hash.slice(1)||'').split('/')[1];const el=targets[key]&&document.querySelector(targets[key]);if(!el)return;const calm=window.matchMedia('(prefers-reduced-motion:reduce)').matches;setTimeout(()=>el.scrollIntoView({behavior:calm?'auto':'smooth',block:'start'}),90)}
window.addEventListener('hashchange',go);go();
document.addEventListener('click',e=>{const a=e.target.closest('a[href="#home/tour"],a[href="#about/dawn"]');if(a&&location.hash===a.getAttribute('href')){e.preventDefault();go()}});
const map=document.getElementById('tour-map');
if(map){let touched=false;const center=()=>{if(!touched&&map.scrollWidth>map.clientWidth)map.scrollLeft=(map.scrollWidth-map.clientWidth)/2};
['pointerdown','touchstart','wheel','keydown'].forEach(t=>map.addEventListener(t,()=>{touched=true},{passive:true}));
const img=map.querySelector('img');if(img)img.addEventListener('load',center);
window.addEventListener('hashchange',()=>setTimeout(center,60));window.addEventListener('resize',center);setTimeout(center,60)}
document.querySelectorAll('.tour-pin[data-room]').forEach(pin=>{const card=document.querySelector('.tour-rooms .room-'+pin.dataset.room);if(!card)return;const on=()=>{card.classList.add('is-hot')},off=()=>{card.classList.remove('is-hot')};pin.addEventListener('mouseenter',on);pin.addEventListener('mouseleave',off);pin.addEventListener('focus',on);pin.addEventListener('blur',off);
const pon=()=>{pin.classList.add('is-hot')},poff=()=>{pin.classList.remove('is-hot')};card.addEventListener('mouseenter',pon);card.addEventListener('mouseleave',poff);card.addEventListener('focus',pon);card.addEventListener('blur',poff)});
})();

/* 외관의 세 공간: 이름표와 건물 영역을 눌러 바로 이동 */
(()=>{
'use strict';
const frame=document.querySelector('.scene-frame');
if(!frame||frame.dataset.linked==='true')return;
frame.dataset.linked='true';
const style=document.createElement('style');
style.textContent=`
.scene-frame .scene-zone{position:absolute;z-index:1;display:block;cursor:pointer;border-radius:12px;transition:background .2s}
.scene-frame .zone-care{left:0;top:38%;width:30%;height:49%;clip-path:polygon(0 0,44% 0,100% 39%,100% 100%,0 100%)}
.scene-frame .zone-book{left:32%;top:20%;width:35%;height:68%;clip-path:polygon(0 23%,50% 0,100% 23%,100% 100%,0 100%)}
.scene-frame .zone-cafe{left:69%;top:45%;width:31%;height:44%;clip-path:polygon(0 13%,38% 0,100% 0,100% 100%,0 100%)}
.scene-frame a.scene-chip{z-index:2;display:inline-flex;align-items:center;min-height:44px;text-decoration:none;cursor:pointer;box-shadow:0 3px 14px rgba(30,45,38,.12);transition:background .2s,box-shadow .2s;box-sizing:border-box}
.scene-frame a.scene-chip::before{flex-shrink:0}
.scene-frame a.scene-chip::after{content:'↗';font-size:.9em;margin-left:7px}
.scene-frame a.scene-chip:focus-visible{outline:3px solid currentColor;outline-offset:4px}
.scene-frame a.scene-chip:hover,.scene-frame:has(.zone-care:hover) .chip-care,.scene-frame:has(.zone-book:hover) .chip-book,.scene-frame:has(.zone-cafe:hover) .chip-cafe{background:#fff;box-shadow:0 0 0 2px currentColor,0 6px 20px rgba(30,45,38,.2)}
.scene-frame .scene-short{display:none}
@media(max-width:720px){.scene-frame a.scene-chip{font-size:11px;line-height:1.4;padding:6px 9px;min-height:44px;gap:0}.scene-frame a.scene-chip::before{width:6px;height:6px;margin-right:5px}.scene-frame a.scene-chip::after{margin-left:4px}.scene-frame .scene-long{display:none}.scene-frame .scene-short{display:inline}.scene-frame .chip-care{left:2%;top:32%}.scene-frame .chip-book{top:6%}.scene-frame .chip-cafe{right:2%;top:35%}}
@media(prefers-reduced-motion:reduce){.scene-frame a.scene-chip,.scene-frame .scene-zone{transition:none}}
`;
document.head.append(style);
const rooms=[['care','#care','보장분석센터','보장분석으로 이동'],['book','#library','생각서점 · 독서모임','북인사이트 독서 공간으로 이동'],['cafe','#health','쉼의 카페','건강테크로 이동']];
rooms.forEach(([key,href,short,label])=>{
const chip=frame.querySelector('.chip-'+key);if(!chip)return;
const link=document.createElement('a');link.className=chip.className;link.href=href;link.title=label;
const full=document.createElement('span');full.className='scene-long';full.textContent=chip.textContent;
const compact=document.createElement('span');compact.className='scene-short';compact.textContent=short;compact.setAttribute('aria-hidden','true');
link.append(full,compact);link.setAttribute('aria-label',chip.textContent+' · '+label);chip.replaceWith(link);
const zone=document.createElement('a');zone.className='scene-zone zone-'+key;zone.href=href;zone.tabIndex=-1;zone.setAttribute('aria-hidden','true');zone.title=label;frame.prepend(zone);
});
})();

/* 공간 이름표를 명확한 바로가기 버튼으로 표시 */
(()=>{
const frame=document.querySelector('.scene-frame');if(!frame||frame.dataset.buttons==='true')return;frame.dataset.buttons='true';
const style=document.createElement('style');style.textContent=`
.scene-click-hint{margin:0 0 12px;text-align:center;font-size:14px;line-height:1.6;color:#425b48;font-weight:600}
.scene-click-hint strong{font-weight:800;text-decoration:underline;text-underline-offset:3px}
.scene-frame .chip-care{--scene-accent:#365c9d}.scene-frame .chip-book{--scene-accent:#7551a0}.scene-frame .chip-cafe{--scene-accent:#b85447}
.scene-frame a.scene-chip{flex-direction:column;justify-content:center;gap:7px;padding:10px 17px;min-height:72px;background:#fff;border:2px solid var(--scene-accent);border-radius:18px;color:var(--scene-accent);box-shadow:0 4px 0 color-mix(in srgb,var(--scene-accent) 40%,transparent),0 8px 20px #25362b24;transition:box-shadow .18s,background .18s}
.scene-frame a.scene-chip::before,.scene-frame a.scene-chip::after{display:none}
.scene-frame a.scene-chip .scene-long,.scene-frame a.scene-chip .scene-short{text-decoration:underline;text-underline-offset:4px;text-decoration-thickness:1px;font-weight:800}
.scene-frame .scene-cta{display:inline-flex;align-items:center;gap:7px;padding:3px 11px;border-radius:20px;background:var(--scene-accent);color:#fff;font-size:12px;line-height:1.5;font-weight:700;letter-spacing:0;white-space:nowrap;text-decoration:none}
.scene-frame a.scene-chip:hover,.scene-frame:has(.zone-care:hover) .chip-care,.scene-frame:has(.zone-book:hover) .chip-book,.scene-frame:has(.zone-cafe:hover) .chip-cafe{background:color-mix(in srgb,var(--scene-accent) 6%,white);box-shadow:0 5px 0 color-mix(in srgb,var(--scene-accent) 55%,transparent),0 10px 24px #25362b36}
.scene-frame a.scene-chip:active{box-shadow:0 1px 0 var(--scene-accent),0 2px 8px #25362b24;background:color-mix(in srgb,var(--scene-accent) 12%,white)}
@media(max-width:720px){.scene-click-hint{font-size:12px;margin-bottom:9px}.scene-frame a.scene-chip{font-size:12px;padding:7px 9px;gap:5px;min-height:62px;border-radius:13px}.scene-frame .scene-cta{font-size:10px;padding:2px 9px}.scene-frame .chip-book{top:3%}.scene-frame .chip-care{top:41%;left:2%}.scene-frame .chip-cafe{top:44%;right:2%}}
`;document.head.append(style);
frame.querySelectorAll('a.scene-chip').forEach(link=>{const cta=document.createElement('span');cta.className='scene-cta';cta.textContent='바로가기 →';cta.setAttribute('aria-hidden','true');link.append(cta)});
const hint=document.createElement('p');hint.className='scene-click-hint';hint.append('궁금한 공간의 ');const strong=document.createElement('strong');strong.textContent='이름표를 눌러보세요';hint.append(strong,'.');frame.before(hint);
})();
