const screens = {
  intro: document.getElementById('screen-intro'),
  no: document.getElementById('screen-no'),
  letter: document.getElementById('screen-letter'),
};
const mascot = document.getElementById('mascot');
const pupils = document.getElementById('pupils');
const say = document.getElementById('say');
const envelope = document.getElementById('envelope');
const video = document.getElementById('melody-video');
const fallback = document.getElementById('melody-fallback');
const progressFill = document.getElementById('progress-fill');

// ---------- Ikon Iconify (hanya love, bintang, bunga) ----------
const icons = ['ph:heart-fill', 'ph:star-fill', 'ph:flower-fill'];
const colors = ['#ff8fab', '#ffb3c6', '#ffe69a', '#c4ead6', '#bfe3f7'];
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

function makeIcon(className) {
  const el = document.createElement('iconify-icon');
  el.setAttribute('icon', pick(icons));
  el.className = className;
  el.style.color = pick(colors);
  return el;
}

function burstIcons(x, y, count = 10) {
  for (let i = 0; i < count; i++) {
    const el = makeIcon('burst');
    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 90;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.fontSize = 18 + Math.random() * 14 + 'px';
    el.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
    el.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }
}

function confetti(count = 36) {
  for (let i = 0; i < count; i++) {
    const el = makeIcon('confetti');
    el.style.left = Math.random() * 100 + 'vw';
    el.style.fontSize = 16 + Math.random() * 18 + 'px';
    el.style.animationDuration = 2.5 + Math.random() * 2.5 + 's';
    el.style.animationDelay = Math.random() * 0.8 + 's';
    el.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 6500);
  }
}

// ---------- Pindah layar ----------
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
  window.scrollTo({ top: 0 });

  if (name === 'no') video.play().catch(() => {});
  else video.pause();

  if (name === 'intro') {
    envelope.classList.remove('pop');
    setMood();
  }
  if (name === 'letter') {
    setupReveal();
    updateProgress();
  }
}

// ---------- Maskot ----------
function setMood(mood) {
  mascot.classList.remove('happy', 'sad');
  if (mood) mascot.classList.add(mood);
}

// mata mengikuti kursor / jari
document.addEventListener('pointermove', e => {
  if (!screens.intro.classList.contains('active')) return;
  const r = mascot.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height * 0.6;
  const dx = e.clientX - cx;
  const dy = e.clientY - cy;
  const d = Math.hypot(dx, dy) || 1;
  const m = Math.min(5, d / 18);
  pupils.style.transform = `translate(${(dx / d) * m}px, ${(dy / d) * m}px)`;
});

// diklik = penyet + ngomong
const sayLines = ['eh?!', 'hihi geli', 'jangan dicolek~', 'halo kamu!', 'sayang kamu'];
let sayIndex = 0, sayTimer;
mascot.addEventListener('click', e => {
  mascot.classList.remove('squish');
  void mascot.getBoundingClientRect();
  mascot.classList.add('squish');

  say.textContent = sayLines[sayIndex++ % sayLines.length];
  say.classList.add('show');
  clearTimeout(sayTimer);
  sayTimer = setTimeout(() => say.classList.remove('show'), 1300);

  burstIcons(e.clientX, e.clientY, 5);
});

// ---------- Tombol ----------
const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');

btnYes.addEventListener('pointerenter', () => setMood('happy'));
btnYes.addEventListener('pointerleave', () => setMood());
btnNo.addEventListener('pointerenter', () => setMood('sad'));
btnNo.addEventListener('pointerleave', () => setMood());

btnYes.addEventListener('click', e => {
  setMood('happy');
  envelope.classList.add('pop');
  burstIcons(e.clientX, e.clientY, 12);
  setTimeout(() => showScreen('letter'), 800);
});
btnNo.addEventListener('click', () => showScreen('no'));

['btn-back-no', 'btn-back-letter', 'btn-back-letter-2'].forEach(id => {
  document.getElementById(id).addEventListener('click', () => showScreen('intro'));
});

envelope.addEventListener('click', e => burstIcons(e.clientX, e.clientY, 8));
document.getElementById('heart-btn').addEventListener('click', e => burstIcons(e.clientX, e.clientY, 14));

const polaroid = document.getElementById('polaroid');
polaroid.addEventListener('click', e => {
  polaroid.classList.remove('wiggle');
  void polaroid.offsetWidth;
  polaroid.classList.add('wiggle');
  burstIcons(e.clientX, e.clientY, 10);
});

// ---------- Fallback video ----------
function useFallback() {
  video.hidden = true;
  fallback.hidden = false;
}
video.addEventListener('error', useFallback);
video.querySelector('source').addEventListener('error', useFallback);

// ---------- Progress scroll ----------
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max > 0 ? (window.scrollY / max) * 100 : 100;
  progressFill.style.width = Math.min(100, pct) + '%';
}
window.addEventListener('scroll', () => {
  if (screens.letter.classList.contains('active')) updateProgress();
});

// ---------- Paragraf muncul + confetti di akhir ----------
let revealObserver, endObserver, confettiFired = false;

function setupReveal() {
  if (revealObserver) revealObserver.disconnect();
  if (endObserver) endObserver.disconnect();
  confettiFired = false;

  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => {
    el.classList.remove('visible');
    revealObserver.observe(el);
  });

  endObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !confettiFired) {
      confettiFired = true;
      confetti();
    }
  }, { threshold: 0.8 });
  endObserver.observe(document.getElementById('signature'));
}