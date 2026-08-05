/* =========================================================
   MARIA — SECRET LOVE PROPOSAL
   Vanilla JS — scenes, effects, audio
   ========================================================= */
(() => {
  'use strict';

  /* ---------- helpers ---------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const rand = (min, max) => Math.random() * (max - min) + min;

  /* ---------- safe audio play (won't throw if file missing) ---------- */
  function safePlay(audioEl) {
    if (!audioEl) return;
    try {
      const p = audioEl.play();
      if (p && p.catch) p.catch(() => {/* ignore missing asset / autoplay block */});
    } catch (e) { /* ignore */ }
  }

  /* =========================================================
     1. AMBIENT LAYERS — stars, fireflies, petals, hearts
     ========================================================= */
  function buildStars() {
    const layer = $('#starsLayer');
    const count = window.innerWidth < 640 ? 60 : 120;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'star';
      s.style.top = rand(0, 100) + '%';
      s.style.left = rand(0, 100) + '%';
      s.style.animationDelay = rand(0, 3.5) + 's';
      s.style.width = s.style.height = rand(1, 2.4) + 'px';
      frag.appendChild(s);
    }
    layer.appendChild(frag);
  }

  function buildFireflies() {
    const layer = $('#firefliesLayer');
    const count = window.innerWidth < 640 ? 10 : 18;
    for (let i = 0; i < count; i++) {
      const f = document.createElement('span');
      f.className = 'firefly';
      f.style.left = rand(0, 100) + '%';
      f.style.bottom = rand(-10, 10) + '%';
      f.style.setProperty('--dx', rand(-60, 60) + 'px');
      f.style.animationDuration = rand(10, 20) + 's';
      f.style.animationDelay = rand(0, 14) + 's';
      layer.appendChild(f);
    }
  }

  function buildPetals() {
    const layer = $('#petalsLayer');
    const count = window.innerWidth < 640 ? 10 : 18;
    const glyphs = ['🌸', '🌺', '💮'];
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'petal';
      p.textContent = glyphs[Math.floor(rand(0, glyphs.length))];
      p.style.left = rand(0, 100) + '%';
      p.style.fontSize = rand(.7, 1.3) + 'rem';
      p.style.setProperty('--sway', rand(-50, 50) + 'px');
      p.style.animationDuration = rand(10, 20) + 's';
      p.style.animationDelay = rand(0, 16) + 's';
      layer.appendChild(p);
    }
  }

  function buildHearts() {
    const layer = $('#heartsLayer');
    const count = window.innerWidth < 640 ? 8 : 14;
    for (let i = 0; i < count; i++) {
      const h = document.createElement('span');
      h.className = 'floating-heart';
      h.textContent = '❤';
      h.style.left = rand(0, 100) + '%';
      h.style.color = Math.random() > .5 ? '#f43f5e' : '#e8c874';
      h.style.fontSize = rand(.7, 1.4) + 'rem';
      h.style.setProperty('--hx', rand(-40, 40) + 'px');
      h.style.animationDuration = rand(9, 18) + 's';
      h.style.animationDelay = rand(0, 14) + 's';
      layer.appendChild(h);
    }
  }

  buildStars(); buildFireflies(); buildPetals(); buildHearts();

  /* =========================================================
     2. CURSOR GLOW
     ========================================================= */
  const cursorGlow = $('#cursorGlow');
  window.addEventListener('pointermove', (e) => {
    cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
  }, { passive: true });

  /* =========================================================
     3. MAGNETIC BUTTONS
     ========================================================= */
  $$('.magnetic').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      btn.style.setProperty('--mx', mx + '%');
      btn.style.setProperty('--my', my + '%');
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.12;
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.12;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });

  /* =========================================================
     4. SCENE 1 — LOADER + TYPEWRITER + INTRO REVEAL
     ========================================================= */
  const loader = $('#loader');
  const introContent = $('#introContent');

  function typeLine(el, speed = 42) {
    return new Promise((resolve) => {
      const text = el.dataset.text || '';
      el.textContent = '';
      el.classList.add('typing');
      let i = 0;
      const tick = () => {
        if (i <= text.length) {
          el.textContent = text.slice(0, i);
          i++;
          setTimeout(tick, speed);
        } else {
          el.classList.remove('typing');
          resolve();
        }
      };
      tick();
    });
  }

  window.addEventListener('load', () => {
    setTimeout(async () => {
      loader.classList.add('hidden');
      introContent.classList.add('visible');
      await typeLine($('#tw1'), 46);
      await new Promise(r => setTimeout(r, 250));
      await typeLine($('#tw2'), 40);
    }, 1400);
  });
  // fallback in case 'load' already fired
  if (document.readyState === 'complete') {
    window.dispatchEvent(new Event('load'));
  }

  $('#enterStoryBtn').addEventListener('click', () => {
    safePlay($('#sfxClick'));
    $('#scene2').scrollIntoView({ behavior: 'smooth' });
  });

  /* =========================================================
     5. SCROLL REVEAL (IntersectionObserver)
     ========================================================= */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('in-view');
    });
  }, { threshold: 0.2 });
  $$('.scroll-reveal').forEach((el) => revealObserver.observe(el));

  /* =========================================================
     6. SCENE 3 — FEELINGS TYPEWRITER-ON-SCROLL + CONSTELLATION
     ========================================================= */
  const feelingLines = $$('.feeling-line');
  let feelingsPlayed = false;
  const feelingsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !feelingsPlayed) {
        feelingsPlayed = true;
        feelingLines.forEach((line, idx) => {
          setTimeout(() => {
            line.textContent = line.dataset.tw;
            line.classList.add('revealed');
          }, idx * 650);
        });
        setTimeout(() => {
          $('.constellation-heart').classList.add('drawn');
        }, feelingLines.length * 650 + 200);
      }
    });
  }, { threshold: 0.4 });
  feelingsObserver.observe($('#scene3'));

  /* =========================================================
     7. SCENE 4 — 3D TILT ON REASON CARDS
     ========================================================= */
  $$('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(700px) rotateX(${py * -10}deg) rotateY(${px * 10}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  /* =========================================================
     8. SCENE 5 — ENVELOPE / LETTER
     ========================================================= */
  const envelope = $('#envelope');
  const openLetterBtn = $('#openLetterBtn');
  let letterOpened = false;
  openLetterBtn.addEventListener('click', () => {
    if (letterOpened) return;
    letterOpened = true;
    envelope.classList.add('open');
    safePlay($('#sfxEnvelope'));
    openLetterBtn.classList.add('hidden');
  });

  /* =========================================================
     9. SCENE 6 — PROPOSAL BUTTONS + CANVAS FX
     ========================================================= */
  const proposalButtons = $('#proposalButtons');
  const panels = { yes: $('#panelYes'), wait: $('#panelWait'), no: $('#panelNo') };

  function showPanel(key) {
    proposalButtons.classList.add('hidden');
    Object.values(panels).forEach(p => { p.hidden = true; });
    panels[key].hidden = false;
  }

  $('#btnYes').addEventListener('click', () => {
    safePlay($('#sfxSuccess'));
    showPanel('yes');
    launchCelebration();
  });
  $('#btnWait').addEventListener('click', () => {
    safePlay($('#sfxClick'));
    showPanel('wait');
  });
  $('#btnNo').addEventListener('click', () => {
    safePlay($('#sfxClick'));
    showPanel('no');
  });

  /* ---- canvas confetti / fireworks / sparkles ---- */
  const canvas = $('#fxCanvas');
  const ctx = canvas.getContext('2d');
  let fxParticles = [];
  let fxRunning = false;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function spawnConfetti(n = 140) {
    const colors = ['#e8c874', '#f43f5e', '#7c3aed', '#22d3ee', '#f5efe6'];
    for (let i = 0; i < n; i++) {
      fxParticles.push({
        type: 'confetti',
        x: rand(0, canvas.width),
        y: -20,
        vx: rand(-1.5, 1.5),
        vy: rand(2, 5),
        size: rand(4, 9),
        rot: rand(0, 360),
        vr: rand(-6, 6),
        color: colors[Math.floor(rand(0, colors.length))],
        life: 0,
        maxLife: rand(140, 220),
      });
    }
  }

  function spawnFirework(cx, cy) {
    const colors = ['#e8c874', '#f43f5e', '#7c3aed', '#22d3ee', '#fff'];
    const n = 46;
    const color = colors[Math.floor(rand(0, colors.length))];
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n;
      const speed = rand(2, 6.5);
      fxParticles.push({
        type: 'spark',
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: rand(1.5, 3),
        color,
        life: 0,
        maxLife: rand(50, 80),
      });
    }
  }

  function spawnSparkle() {
    fxParticles.push({
      type: 'sparkle',
      x: rand(0, canvas.width),
      y: rand(0, canvas.height * 0.6),
      size: rand(1, 2.5),
      color: '#f5efe6',
      life: 0,
      maxLife: rand(40, 90),
      vy: rand(-0.3, 0.3),
    });
  }

  function stepFx() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fxParticles.forEach((p) => {
      p.life++;
      if (p.type === 'confetti') {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
        ctx.restore();
      } else if (p.type === 'spark') {
        p.x += p.vx; p.y += p.vy; p.vy += 0.05;
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'sparkle') {
        p.y += p.vy;
        ctx.globalAlpha = Math.max(0, Math.sin((p.life / p.maxLife) * Math.PI));
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
    fxParticles = fxParticles.filter((p) => p.life < p.maxLife);
    if (fxParticles.length > 0) {
      requestAnimationFrame(stepFx);
    } else {
      fxRunning = false;
    }
  }

  function ensureFxLoop() {
    if (!fxRunning) { fxRunning = true; requestAnimationFrame(stepFx); }
  }

  function launchCelebration() {
    spawnConfetti(150);
    ensureFxLoop();
    let bursts = 0;
    const fireworkTimer = setInterval(() => {
      spawnFirework(rand(canvas.width * 0.2, canvas.width * 0.8), rand(canvas.height * 0.2, canvas.height * 0.55));
      ensureFxLoop();
      bursts++;
      if (bursts >= 6) clearInterval(fireworkTimer);
    }, 380);
    for (let i = 0; i < 40; i++) setTimeout(spawnSparkle, i * 60);
  }

  /* =========================================================
     10. BACKGROUND MUSIC PLAYER
     ========================================================= */
  const bgMusic = $('#bgMusic');
  const musicPlayer = $('#musicPlayer');
  const musicToggle = $('#musicToggle');
  const musicMute = $('#musicMute');
  const musicVolume = $('#musicVolume');
  let userMuted = false;
  bgMusic.volume = 0.45;

  function fadeAudio(target, duration = 900) {
    const start = bgMusic.volume;
    const startTime = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - startTime) / duration);
      bgMusic.volume = start + (target - start) * t;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  musicToggle.addEventListener('click', () => {
    if (bgMusic.paused) {
      safePlay(bgMusic);
      fadeAudio(userMuted ? 0 : musicVolume.value / 100);
      musicPlayer.classList.add('playing');
      musicToggle.setAttribute('aria-pressed', 'true');
      $('.icon-play', musicToggle).style.display = 'none';
      $('.icon-pause', musicToggle).style.display = '';
    } else {
      fadeAudio(0, 500);
      setTimeout(() => bgMusic.pause(), 520);
      musicPlayer.classList.remove('playing');
      musicToggle.setAttribute('aria-pressed', 'false');
      $('.icon-play', musicToggle).style.display = '';
      $('.icon-pause', musicToggle).style.display = 'none';
    }
  });

  musicMute.addEventListener('click', () => {
    userMuted = !userMuted;
    bgMusic.volume = userMuted ? 0 : musicVolume.value / 100;
    $('.icon-vol-on', musicMute).style.display = userMuted ? 'none' : '';
    $('.icon-vol-off', musicMute).style.display = userMuted ? '' : 'none';
  });

  musicVolume.addEventListener('input', () => {
    if (!userMuted) bgMusic.volume = musicVolume.value / 100;
  });

  /* =========================================================
     11. BUTTON CLICK SOUND (global, subtle)
     ========================================================= */
  $$('.btn-glow, .btn-answer, .btn-contact').forEach((b) => {
    b.addEventListener('click', () => safePlay($('#sfxClick')));
  });

})();
