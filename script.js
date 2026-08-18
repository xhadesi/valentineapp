/* ==========================================================================
   CHINESE VALENTINE'S DAY (七夕) - INTERACTIVE LIQUID GLASS EXPERIENCE
   ========================================================================== */

(function () {
  'use strict';

  // --- Sound & Chinese Pentatonic Music Synthesizer (Web Audio API) ---
  let soundEnabled = true;
  let bgMusicPlaying = false;
  let audioCtx = null;
  let bgMusicTimer = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Soft Chinese Pentatonic Romantic Melody (Guzheng / Bamboo Flute style synthesis)
  // Pentatonic Scale: C5, D5, E5, G5, A5, C6
  const pentatonicMelody = [
    { note: 523.25, dur: 0.5, pause: 0.6 }, // C5
    { note: 587.33, dur: 0.4, pause: 0.5 }, // D5
    { note: 659.25, dur: 0.6, pause: 0.7 }, // E5
    { note: 783.99, dur: 0.5, pause: 0.6 }, // G5
    { note: 659.25, dur: 0.4, pause: 0.5 }, // E5
    { note: 587.33, dur: 0.6, pause: 0.8 }, // D5
    { note: 523.25, dur: 0.8, pause: 1.0 }, // C5
    { note: 440.00, dur: 0.5, pause: 0.6 }, // A4
    { note: 392.00, dur: 0.6, pause: 0.7 }, // G4
    { note: 440.00, dur: 0.5, pause: 0.6 }, // A4
    { note: 523.25, dur: 0.9, pause: 1.2 }, // C5
    { note: 659.25, dur: 0.5, pause: 0.6 }, // E5
    { note: 783.99, dur: 0.7, pause: 0.8 }, // G5
    { note: 880.00, dur: 0.5, pause: 0.6 }, // A5
    { note: 783.99, dur: 0.8, pause: 1.0 }, // G5
    { note: 659.25, dur: 0.9, pause: 1.4 }, // E5
  ];

  let currentNoteIdx = 0;

  function playGuzhengPluck(freq, dur = 0.5, volume = 0.05) {
    if (!soundEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2.01, now);

      // Gentle attack and soft decay
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur + 0.3);

      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.linearRampToValueAtTime(volume * 0.35, now + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + dur * 0.7);

      osc.connect(gain);
      osc2.connect(gain2);
      gain.connect(audioCtx.destination);
      gain2.connect(audioCtx.destination);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + dur + 0.4);
      osc2.stop(now + dur + 0.4);
    } catch (e) {}
  }

  function startChineseBgMusic() {
    if (bgMusicPlaying) return;
    bgMusicPlaying = true;
    currentNoteIdx = 0;

    function playNextMelodyStep() {
      if (!soundEnabled || !bgMusicPlaying) return;
      const noteItem = pentatonicMelody[currentNoteIdx];
      playGuzhengPluck(noteItem.note, noteItem.dur, 0.05); // Soft romantic volume

      currentNoteIdx = (currentNoteIdx + 1) % pentatonicMelody.length;
      bgMusicTimer = setTimeout(playNextMelodyStep, noteItem.pause * 1000);
    }

    playNextMelodyStep();
  }

  function stopChineseBgMusic() {
    bgMusicPlaying = false;
    if (bgMusicTimer) {
      clearTimeout(bgMusicTimer);
      bgMusicTimer = null;
    }
  }

  function playPopSound(freq = 440, type = 'sine', duration = 0.15) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.4, audioCtx.currentTime + duration);

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  function playVictorySound() {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.1);

        gain.gain.setValueAtTime(0.16, audioCtx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + idx * 0.1 + 0.6);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + idx * 0.1);
        osc.stop(audioCtx.currentTime + idx * 0.1 + 0.7);
      });
    } catch (e) {}
  }

  // --- Sound Toggle UI ---
  const soundToggleBtn = document.getElementById('sound-toggle');
  const soundIcon = document.getElementById('sound-icon');
  const soundText = document.getElementById('sound-text');

  soundToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    initAudio();
    soundEnabled = !soundEnabled;
    soundIcon.textContent = soundEnabled ? '🎵' : '🔇';
    soundText.textContent = soundEnabled ? 'Music ON' : 'Music OFF';
    if (soundEnabled) {
      startChineseBgMusic();
      playPopSound(520, 'sine', 0.1);
    } else {
      stopChineseBgMusic();
    }
  });

  // Autostart music on first user interaction anywhere on screen
  function handleFirstInteraction() {
    initAudio();
    if (soundEnabled && !bgMusicPlaying) {
      startChineseBgMusic();
    }
    window.removeEventListener('pointerdown', handleFirstInteraction);
    window.removeEventListener('touchstart', handleFirstInteraction);
    window.removeEventListener('click', handleFirstInteraction);
  }
  window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
  window.addEventListener('touchstart', handleFirstInteraction, { once: true });
  window.addEventListener('click', handleFirstInteraction, { once: true });

  // --- Ambient Canvas Particles (Glowing Hearts & Stardust) ---
  const canvas = document.getElementById('ambient-canvas');
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class HeartParticle {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 20;
      this.size = Math.random() * 18 + 8;
      this.speedY = Math.random() * 1.1 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.7;
      this.opacity = Math.random() * 0.55 + 0.2;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.02;
      this.color = Math.random() > 0.4 ? 'rgba(255, 60, 130, ' : 'rgba(255, 170, 210, ';
      this.isStar = Math.random() > 0.7;
    }
    update() {
      this.y -= this.speedY;
      this.x += this.speedX + Math.sin(this.y * 0.012) * 0.6;
      this.rotation += this.rotSpeed;
      if (this.y < -30) {
        this.reset();
      }
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;

      if (this.isStar) {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.15, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = this.color + this.opacity + ')';
        ctx.shadowColor = 'rgba(255, 0, 100, 0.4)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        const s = this.size * 0.6;
        ctx.moveTo(0, s * 0.3);
        ctx.bezierCurveTo(-s, -s * 0.6, -s * 1.2, s * 0.4, 0, s * 1.2);
        ctx.bezierCurveTo(s * 1.2, s * 0.4, s, -s * 0.6, 0, s * 0.3);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  for (let i = 0; i < 40; i++) {
    particles.push(new HeartParticle());
  }

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    for (let p of particles) {
      p.update();
      p.draw();
    }
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // --- Evasion Engine & Mobile Touch Rules ---
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');
  const noIcon = document.getElementById('no-icon');
  const noMainLabel = document.getElementById('no-main-label');
  const noSubLabel = document.getElementById('no-sub-label');
  const dodgeHint = document.getElementById('dodge-hint');
  const creatureMouth = document.getElementById('creature-mouth');
  const celebrationOverlay = document.getElementById('celebration-overlay');
  const btnReplay = document.getElementById('btn-replay');

  let dodgeCount = 0;
  let yesScale = 1;
  let lastDodgeTime = 0;

  const noPhrases = [
    { main: "NO", sub: "才不要", icon: "💔", hint: "Hmm... you can't click that! 😏" },
    { main: "Are you sure?", sub: "你确定吗？🥺", icon: "🤨", hint: "Wait! Think carefully! 💔" },
    { main: "Really really sure?", sub: "真的真的吗？😭", icon: "😢", hint: "You're breaking my little heart! 💔" },
    { main: "Think again!", sub: "再想想嘛~", icon: "🥺", hint: "The YES button is waiting for you! 💖" },
    { main: "Don't press this!", sub: "别点这个！", icon: "🙈", hint: "Error 404: NO option not found! ✨" },
    { main: "Oops, missed it!", sub: "点不着略略略~", icon: "😜", hint: "I'm way too fast for you! ⚡" },
    { main: "Wrong button!", sub: "点错啦！", icon: "😱", hint: "Destiny says: CLICK YES! 🌟" },
    { main: "Give up already~", sub: "放弃抵抗吧💕", icon: "💘", hint: "Look how big & shiny YES is now! 😍" },
    { main: "Just say YES!", sub: "乖乖选YES吧~", icon: "💍", hint: "There is only one true choice! 💕" }
  ];

  function dodgeNoButton(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const now = Date.now();
    // Debounce rapid triggers on mobile touch (90ms)
    if (now - lastDodgeTime < 90) return;
    lastDodgeTime = now;

    initAudio();
    if (soundEnabled && !bgMusicPlaying) {
      startChineseBgMusic();
    }

    dodgeCount++;

    // Dynamic scaling for YES button (up to 2.4x)
    yesScale = Math.min(1 + dodgeCount * 0.16, 2.4);
    btnYes.style.transform = `scale(${yesScale})`;

    // Cute Mascot Reaction
    if (creatureMouth) {
      creatureMouth.style.height = '12px';
      creatureMouth.style.borderRadius = '50%';
      setTimeout(() => {
        creatureMouth.style.height = '6px';
        creatureMouth.style.borderRadius = '0 0 10px 10px';
      }, 500);
    }

    // Play quick pop sound
    const pitch = Math.min(320 + dodgeCount * 45, 950);
    playPopSound(pitch, 'sine', 0.1);

    // Update NO texts & emojis
    const phraseIdx = Math.min(dodgeCount, noPhrases.length - 1);
    const phrase = noPhrases[phraseIdx];
    noMainLabel.textContent = phrase.main;
    noSubLabel.textContent = phrase.sub;
    noIcon.textContent = phrase.icon;
    dodgeHint.textContent = phrase.hint;
    dodgeHint.style.color = '#ff80aa';

    // Move NO Button strictly inside visible viewport
    btnNo.classList.add('evading');

    const btnWidth = btnNo.offsetWidth || 120;
    const btnHeight = btnNo.offsetHeight || 55;
    
    // Margins to prevent button from going under notches or screen edges
    const margin = 20;
    const maxX = Math.max(margin, window.innerWidth - btnWidth - margin);
    const maxY = Math.max(margin, window.innerHeight - btnHeight - margin - 30);

    const randomX = Math.floor(margin + Math.random() * (maxX - margin));
    const randomY = Math.floor(margin + Math.random() * (maxY - margin));

    btnNo.style.left = `${randomX}px`;
    btnNo.style.top = `${randomY}px`;
    btnNo.style.transform = `scale(${Math.max(0.78, 1 - dodgeCount * 0.025)}) rotate(${(Math.random() - 0.5) * 18}deg)`;
  }

  // Bind mouse, pointer and touch events
  btnNo.addEventListener('mouseenter', dodgeNoButton);
  btnNo.addEventListener('pointerenter', dodgeNoButton);
  btnNo.addEventListener('pointerover', dodgeNoButton);
  btnNo.addEventListener('touchstart', dodgeNoButton, { passive: false });
  btnNo.addEventListener('touchmove', dodgeNoButton, { passive: false });
  btnNo.addEventListener('pointerdown', dodgeNoButton);
  btnNo.addEventListener('click', dodgeNoButton);

  // --- YES Button Click Celebration ---
  btnYes.addEventListener('click', () => {
    initAudio();
    playVictorySound();

    // Trigger romantic confetti
    if (typeof confetti === 'function') {
      const count = 280;
      const defaults = { origin: { y: 0.7 } };

      function fire(particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, {
          particleCount: Math.floor(count * particleRatio)
        }));
      }

      fire(0.25, { spread: 26, startVelocity: 55, colors: ['#ff0077', '#ff66aa', '#ffffff', '#ffd700'] });
      fire(0.2, { spread: 60, colors: ['#ff1493', '#ff69b4', '#ffe4e1'] });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, colors: ['#ff0055', '#ffb6c1', '#ffffff'] });
      fire(0.1, { spread: 120, startVelocity: 45, colors: ['#ff1475', '#ffffff', '#ff99cc'] });
    }

    // Show celebration modal
    setTimeout(() => {
      celebrationOverlay.classList.remove('hidden');
    }, 350);
  });

  // --- Replay Button Reset ---
  btnReplay.addEventListener('click', () => {
    celebrationOverlay.classList.add('hidden');
    dodgeCount = 0;
    yesScale = 1;
    btnYes.style.transform = 'scale(1)';

    btnNo.classList.remove('evading');
    btnNo.style.position = '';
    btnNo.style.left = '';
    btnNo.style.top = '';
    btnNo.style.transform = 'scale(1) rotate(0deg)';

    noMainLabel.textContent = "NO";
    noSubLabel.textContent = "才不要";
    noIcon.textContent = "💔";
    dodgeHint.textContent = "Tip: Try clicking \"NO\" if you dare~ 😏";
    dodgeHint.style.color = '#ffccd9';

    playPopSound(440, 'triangle', 0.2);
  });

})();
