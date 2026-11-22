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
