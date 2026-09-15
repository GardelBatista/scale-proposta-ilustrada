/* MyDose Scale, proposta ilustrada. O @ leva para o onboarding (/comecar).
   O resto é apresentação: parallax da paisagem, exemplos por área e o viewer. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js');

/* ---------- nav + barra fixa ---------- */
const nav = $('#nav'), sticky = $('.sticky'), entry = $('#primeiro-passo'), finalSec = $('#final');
const onScroll = () => {
  nav.classList.toggle('scrolled', scrollY > 30);
  const past = scrollY > entry.offsetTop + 260;
  const atEnd = finalSec && scrollY + innerHeight > finalSec.offsetTop + 80;
  sticky.classList.toggle('show', past && !atEnd);
};
addEventListener('scroll', onScroll, { passive: true }); onScroll();

/* ---------- @ do Instagram → onboarding ---------- */
const COMECAR = 'https://scale.mydoseapp.com/comecar?handle=';
function comecar(input, feedback) {
  const raw = (input.value || '').trim().replace(/^@/, '');
  const say = m => { if (!feedback) return; feedback.textContent = m; feedback.hidden = !m; };
  if (!raw) { say('Coloque o seu @ do Instagram para começar.'); input.focus(); return; }
  if (!/^[a-zA-Z0-9_.]{1,30}$/.test(raw)) { say('Use só o seu @, com letras, números, ponto ou sublinhado. Não precisa do link.'); input.focus(); return; }
  say('');
  location.assign(COMECAR + encodeURIComponent(raw));
}
const mainInput = $('#profile-input'), fb = $('#profile-feedback');
entry.addEventListener('submit', e => { e.preventDefault(); comecar(mainInput, fb); });
$('[data-entry-2]').addEventListener('submit', e => { e.preventDefault(); comecar($('#profile-input-2'), null); });
$$('[data-focus-entry]').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  $('#inicio').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  setTimeout(() => mainInput.focus({ preventScroll: true }), reduced ? 0 : 550);
}));

/* ---------- parallax da paisagem (hero) ---------- */
const land = $('.hero .land svg');
if (land && !reduced && innerWidth > 720) {
  const L = { far: $('#l-far', land), mid: $('#l-mid', land), lake: $('#l-lake', land), near: $('#l-near', land), fore: $('#l-fore', land), bird: $('#l-bird', land) };
  const F = { far: .04, mid: .07, lake: .1, near: .14, fore: .2, bird: -.06 };
  let tick = false;
  const par = () => { const y = Math.min(scrollY, 900); for (const k in L) if (L[k]) L[k].style.transform = `translateY(${-(y * F[k]).toFixed(1)}px)`; tick = false; };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(par); } }, { passive: true }); par();
}

/* ---------- reveals ---------- */
if (!reduced && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach(el => io.observe(el));
  setTimeout(() => $$('.rv:not(.in)').forEach(el => el.classList.add('in')), 3000);
} else $$('.rv').forEach(el => el.classList.add('in'));

/* ---------- exemplos por área ---------- */
const CASES = {
  nutricao: { cover: 'manifesto-oliva', detail: 'editorial-sage', label: 'Nutrição', title: 'Uma conversa sobre alimentação. Uma presença que acolhe.', text: 'Um tema que aparece no atendimento, apresentado em uma sequência para a pessoa ler, salvar e levar para a próxima conversa.', purpose: 'Educar sem transformar o post em uma consulta.' },
  fisioterapia: { cover: 'frase-partida', detail: 'convite-jade', label: 'Fisioterapia', title: 'A boa orientação também começa pela escuta.', text: 'Uma mensagem de acolhimento abre a conversa sobre o cuidado. Explore o formato e adapte a mensagem ao seu contexto.', purpose: 'Aproximar sem prometer recuperação ou expor pacientes.' },
  psicologia: { cover: 'pergunta-indigo', detail: 'trocas-bosque', label: 'Psicologia', title: 'Às vezes, uma frase abre espaço para uma conversa.', text: 'Uma peça de acolhimento, com respiro e uma mensagem simples. Comunicação humana sem expor histórias de pacientes.', purpose: 'Acolher sem prometer resultados.' },
  consultorio: { cover: 'convite-jade', detail: 'glossario-pedra', label: 'Consultório', title: 'O cuidado pode começar antes do primeiro encontro.', text: 'Uma orientação visual para quem está chegando. Dúvidas frequentes viram conteúdo útil, fácil de encontrar e compartilhar.', purpose: 'Orientar quem está chegando, sem promessas.' }
};
const NAMES = { 'editorial-sage': 'Editorial · sage', 'pergunta-indigo': 'Pergunta · índigo', 'dado-destaque': 'Dado em destaque', 'declaracao-vinho': 'Declaração · vinho', 'capa-serie': 'Capa de série', 'manifesto-oliva': 'Manifesto · oliva', 'frase-partida': 'Frase partida · coral', 'trocas-bosque': 'Trocas · bosque', 'convite-jade': 'Convite · jade', 'glossario-pedra': 'Glossário · pedra' };
const src = (k, i = 0) => `assets/carrossel-${k}-${i}.webp`;
const tabs = $$('[data-case]');
function pick(b) {
  const c = CASES[b.dataset.case];
  tabs.forEach(x => { x.setAttribute('aria-selected', String(x === b)); x.tabIndex = x === b ? 0 : -1; });
  $('#case-panel').setAttribute('aria-labelledby', b.id);
  $('#case-cover').src = src(c.cover); $('#case-detail').src = c.detail === 'editorial-sage' ? src('editorial-sage', 1) : src(c.detail);
  $('#case-label').textContent = c.label; $('#case-title').textContent = c.title; $('#case-text').textContent = c.text; $('#case-purpose').textContent = c.purpose;
  $('#case-open').dataset.template = c.cover;
}
tabs.forEach((b, i) => {
  b.addEventListener('click', () => pick(b));
  b.addEventListener('keydown', e => { if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; e.preventDefault(); const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length]; pick(n); n.focus(); });
});

/* ---------- viewer ---------- */
const modal = $('#viewer'), img = $('#result-image'), vid = $('#result-video');
let prevFocus = null;
function open() { prevFocus = document.activeElement; if (!modal.open) modal.showModal(); $('#close-viewer').focus(); }
function showTemplate(key) {
  vid.hidden = true; vid.pause(); vid.removeAttribute('src');
  img.hidden = false; img.src = src(key); img.alt = NAMES[key] || key;
  $('#viewer-kind').textContent = 'Carrossel · 4:5'; $('#viewer-title').textContent = NAMES[key] || key;
  $('#source-note').textContent = 'Peça real do acervo de templates. Marca fictícia de demonstração; conteúdo sujeito a revisão profissional.';
  open();
}
function showVideo() {
  img.hidden = true; vid.hidden = false;
  vid.src = 'assets/reel.mp4'; vid.poster = 'assets/reel-poster.jpg';
  $('#viewer-kind').textContent = 'Gabriel · exemplo do acervo'; $('#viewer-title').textContent = 'O vídeo editado';
  $('#source-note').textContent = 'Vídeo editado já existente no acervo. A gravação continua sendo de quem gravou.';
  open(); vid.play().catch(() => {});
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-template],[data-video]'); if (!t || t.closest('dialog')) return;
  if (t.dataset.video) showVideo(); else showTemplate(t.dataset.template);
});
$('#close-viewer').addEventListener('click', () => modal.close());
modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
modal.addEventListener('close', () => { vid.pause(); if (prevFocus && prevFocus.isConnected) prevFocus.focus({ preventScroll: true }); });
})();
