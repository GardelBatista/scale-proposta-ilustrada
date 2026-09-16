/* MyDose Scale — landing. O @ do hero leva para a máquina de onboarding (/comecar).
   O resto é apresentação: stepper do produto, exemplos por área, galeria e viewer. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js');

/* ---------- nav ---------- */
const nav = $('#nav');
const sticky = $('.sticky'), entry = $('#primeiro-passo');
const onScroll = () => { nav.classList.toggle('scrolled', scrollY > 30); sticky.classList.toggle('show', scrollY > entry.offsetTop + 200); };
addEventListener('scroll', onScroll, { passive: true }); onScroll();

/* ---------- @ do Instagram → onboarding ---------- */
const COMECAR = 'https://scale.mydoseapp.com/comecar?handle=';
function comecar(input, feedback) {
  const raw = (input.value || '').trim().replace(/^@/, '');
  if (!raw) { if (feedback) feedback.textContent = 'Coloque o seu @ do Instagram para começar.'; input.focus(); return; }
  if (!/^[a-zA-Z0-9_.]{1,30}$/.test(raw)) { if (feedback) feedback.textContent = 'Use só o seu @, com letras, números, ponto ou sublinhado. Não precisa do link.'; input.focus(); return; }
  if (feedback) feedback.textContent = '';
  location.assign(COMECAR + encodeURIComponent(raw));
}
const mainInput = $('#profile-input'), fb = $('#profile-feedback');
$('#primeiro-passo').addEventListener('submit', e => { e.preventDefault(); comecar(mainInput, fb); });
$('[data-entry-2]').addEventListener('submit', e => { e.preventDefault(); comecar($('#profile-input-2'), null); });
$$('[data-focus-entry]').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  $('#inicio').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  setTimeout(() => mainInput.focus({ preventScroll: true }), reduced ? 0 : 550);
}));

/* ---------- typewriter do H1 ---------- */
(() => {
  const el = $('#tw'); if (!el) return;
  const phrases = el.dataset.phrases.split('|');
  if (reduced) { $('#h1').classList.add('tw-static'); return; }
  // reserva a altura da frase mais longa: o H1 não muda de tamanho enquanto digita (zero layout shift)
  const h1 = $('#h1');
  const reserve = () => { const cur = el.textContent; let max = 0; phrases.forEach(f => { el.textContent = f; max = Math.max(max, h1.offsetHeight); }); el.textContent = cur; h1.style.minHeight = max + 'px'; };
  reserve(); addEventListener('resize', reserve, { passive: true });
  let i = 0, txt = phrases[0], del = false;
  const step = () => {
    const full = phrases[i];
    if (!del) { txt = full.slice(0, txt.length + 1); el.textContent = txt; if (txt === full) { del = true; return setTimeout(step, 2200); } return setTimeout(step, 46 + Math.random() * 40); }
    txt = full.slice(0, txt.length - 1); el.textContent = txt;
    if (!txt) { del = false; i = (i + 1) % phrases.length; return setTimeout(step, 320); }
    setTimeout(step, 26);
  };
  setTimeout(step, 2600);
})();

/* ---------- parallax da paisagem (hero) ---------- */
const land = $('.hero .land-svg');
if (land && !reduced) {
  const L = { far: $('#l-far', land), mid: $('#l-mid', land), lake: $('#l-lake', land), near: $('#l-near', land), fore: $('#l-fore', land) };
  const mob = innerWidth <= 640;
  const F = mob ? { far: .02, mid: .035, lake: .05, near: .07, fore: .1 } : { far: .04, mid: .07, lake: .1, near: .14, fore: .2 };
  let tick = false;
  const par = () => { const y = Math.min(scrollY, 900); for (const k in L) if (L[k]) L[k].style.transform = `translateY(${-(y * F[k]).toFixed(1)}px)`; tick = false; };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(par); } }, { passive: true }); par();
}

/* ---------- reveals ---------- */
if (!reduced && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach(el => io.observe(el));
  // rede de segurança: nada fica escondido se o observer não disparar
  setTimeout(() => $$('.rv:not(.in)').forEach(el => el.classList.add('in')), 3000);
} else $$('.rv').forEach(el => el.classList.add('in'));

/* ---------- peças do acervo: caminho, nomes e navegação das lâminas ---------- */
const src = (k, i = 0) => `assets/acervo/carrossel-${k}-${i}.webp`;
const NAMES = { 'capa-serie': 'Capa de série', 'mito-verdade-cobalto': 'Mito · verdade', 'erro-grafite': 'Erro · grafite',
  'declaracao-vinho': 'Declaração · vinho', 'glossario-pedra': 'Glossário · pedra', 'traducao-lavanda': 'Tradução · lavanda',
  'linha-do-tempo': 'Linha do tempo', 'passos-linho': 'Passos · linho', 'editorial-sage': 'Editorial · sage',
  'dado-destaque': 'Dado em destaque', 'trocas-bosque': 'Trocas · bosque', 'manifesto-oliva': 'Manifesto · oliva',
  'aspas-creme': 'Aspas · creme' };
let atual = null, lamina = 0;

/* ---------- viewer ---------- */
const modal = $('#viewer'), img = $('#result-image'), vid = $('#result-video');
let prevFocus = null;
function open() { prevFocus = document.activeElement; if (!modal.open) modal.showModal(); $('#close-viewer').focus(); }
function pinta() {
  img.src = src(atual, lamina); img.alt = `${NAMES[atual] || atual}, lâmina ${lamina + 1} de 3`;
  $('#viewer-kind').textContent = `Carrossel · lâmina ${lamina + 1} de 3`;
}
function passa(d) { if (!atual) return; lamina = (lamina + d + 3) % 3; pinta(); }
function showTemplate(key, slide) {
  vid.hidden = true; vid.pause(); vid.removeAttribute('src');
  atual = key; lamina = +slide || 0;
  img.hidden = false; pinta();
  $('#viewer-title').textContent = NAMES[key] || key;
  $('#source-note').textContent = 'Peça real do acervo de templates. Marca fictícia de demonstração; conteúdo sujeito a revisão profissional.';
  open();
}
function showVideo(kind) {
  img.hidden = true; vid.hidden = false;
  const film = kind === 'film';
  vid.src = film ? 'https://scale.mydoseapp.com/assets/filme.mp4' : 'assets/reel.mp4'; vid.poster = 'assets/reel-poster.jpg';
  $('#viewer-kind').textContent = film ? 'Filme de apresentação · 2 min' : 'Gabriel · exemplo do acervo';
  $('#viewer-title').textContent = film ? 'Conheça o MyDose Scale' : 'O vídeo editado';
  $('#source-note').textContent = film ? 'O produto inteiro, em uma sessão de uso.' : 'Vídeo editado já existente no acervo.';
  open(); vid.play().catch(() => {});
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-template],[data-video]'); if (!t) return;
  if (t.dataset.video) showVideo(t.dataset.video); else showTemplate(t.dataset.template, +(t.dataset.slide || 0));
});
$('#close-viewer').addEventListener('click', () => modal.close());
$$('[data-lamina]').forEach(b => b.addEventListener('click', () => passa(+b.dataset.lamina)));
modal.addEventListener('keydown', e => { if (e.key === 'ArrowRight') passa(1); if (e.key === 'ArrowLeft') passa(-1); });
modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
modal.addEventListener('close', () => { vid.pause(); atual = null; if (prevFocus && prevFocus.isConnected) prevFocus.focus({ preventScroll: true }); });
})();
