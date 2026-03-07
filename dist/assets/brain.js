/* ── THE BRAIN — Animations ── */
(function () {
  // Scroll observer
  const obs = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }),
    { threshold: 0.2 }
  );

  // Pipeline nodes — staggered reveal + active cycle
  const nodes = document.querySelectorAll('.pipeline-node');
  nodes.forEach((n, i) => { n.style.transitionDelay = `${i * 150}ms`; obs.observe(n); });
  let activeNode = 0;
  setInterval(() => {
    nodes.forEach((n) => n.classList.remove('active'));
    nodes[activeNode].classList.add('active');
    activeNode = (activeNode + 1) % nodes.length;
  }, 2000);

  // Counter animation
  function animateCounters() {
    document.querySelectorAll('.stat-num').forEach((el) => {
      const target = parseInt(el.dataset.target, 10);
      let current = 0;
      const step = Math.ceil(target / 40);
      const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = current.toLocaleString();
      }, 30);
    });
  }
  const voiceDna = document.getElementById('voiceDna');
  if (voiceDna) {
    const cObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { animateCounters(); cObs.disconnect(); }
    }, { threshold: 0.3 });
    cObs.observe(voiceDna);
  }

  // Waveform canvas
  const wc = document.getElementById('waveCanvas');
  if (wc) {
    const ctx = wc.getContext('2d');
    const W = wc.width, H = wc.height;
    let phase = 0;
    function drawWave() {
      ctx.clearRect(0, 0, W, H);
      const mid = H / 2;
      for (let layer = 0; layer < 3; layer++) {
        ctx.beginPath();
        ctx.strokeStyle = layer === 0 ? '#c9a84c' : layer === 1 ? 'rgba(201,168,76,0.3)' : 'rgba(201,168,76,0.1)';
        ctx.lineWidth = layer === 0 ? 2 : 1;
        const amp = (30 - layer * 8) * (0.6 + 0.4 * Math.sin(phase * 0.3 + layer));
        const freq = 0.02 + layer * 0.005;
        for (let x = 0; x < W; x++) {
          const envelope = Math.sin((x / W) * Math.PI);
          const y = mid + Math.sin(x * freq + phase + layer * 2) * amp * envelope
            + Math.sin(x * freq * 2.3 + phase * 1.5) * (amp * 0.3) * envelope;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // Frequency bars at bottom
      for (let i = 0; i < 40; i++) {
        const h = 4 + Math.abs(Math.sin(i * 0.5 + phase * 2)) * 20;
        const a = 0.15 + Math.abs(Math.sin(i * 0.3 + phase)) * 0.25;
        ctx.fillStyle = `rgba(201,168,76,${a})`;
        ctx.fillRect(i * 10 + 2, H - h, 6, h);
      }
      phase += 0.03;
      requestAnimationFrame(drawWave);
    }
    drawWave();
  }

  // Circadian needle rotation + persona updates
  const personas = [
    { name: 'Night Owl', time: '22:00 – 05:00', traits: 'Sparse · Thoughtful · Low energy', energy: 20, color: '#d08080', hours: [22,23,0,1,2,3,4] },
    { name: 'Early Riser', time: '05:00 – 07:00', traits: 'Calm · Brief · Waking up', energy: 25, color: '#e89aad', hours: [5,6] },
    { name: 'Morning Drive', time: '07:00 – 09:00', traits: 'Focused · Direct · Getting into gear', energy: 45, color: '#7ab4e0', hours: [7,8] },
    { name: 'Work Mode', time: '09:00 – 12:00', traits: 'Professional · Articulate · Peak energy', energy: 85, color: '#6dc992', hours: [9,10,11] },
    { name: 'Midday Break', time: '12:00 – 13:30', traits: 'Casual · Warm · Slightly distracted', energy: 55, color: '#e0c064', hours: [12,13] },
    { name: 'Afternoon Push', time: '13:30 – 17:00', traits: 'Efficient · Helpful · Steady', energy: 65, color: '#b48ad6', hours: [14,15,16] },
    { name: 'Wind Down', time: '17:00 – 19:30', traits: 'Relaxed · Personal · Transitioning', energy: 50, color: '#a0a0b4', hours: [17,18,19] },
    { name: 'Evening Social', time: '19:30 – 22:00', traits: 'Playful · Opinionated · Engaging', energy: 70, color: '#e09868', hours: [20,21] },
  ];

  const needle = document.getElementById('circNeedle');
  const circEnergy = document.getElementById('circEnergy');
  const circMood = document.getElementById('circMood');
  const personaDot = document.querySelector('.persona-dot');
  const personaName = document.querySelector('.persona-name');
  const personaTime = document.querySelector('.persona-time');
  const personaTraits = document.querySelector('.persona-traits');
  let circHour = 6;

  function updateCircadian() {
    if (!needle) return;
    const angle = (circHour / 24) * 360 - 90;
    needle.setAttribute('transform', `rotate(${angle} 150 150)`);
    const persona = personas.find((p) => p.hours.includes(circHour)) || personas[0];
    if (circEnergy) circEnergy.textContent = persona.energy + '%';
    if (circMood) circMood.textContent = 'energy';
    if (personaDot) personaDot.style.background = persona.color;
    if (personaName) personaName.textContent = persona.name;
    if (personaTime) personaTime.textContent = persona.time;
    if (personaTraits) personaTraits.textContent = persona.traits;
    circHour = (circHour + 1) % 24;
  }
  updateCircadian();
  setInterval(updateCircadian, 1500);

  // Emotion bars — animate on scroll
  const emotionBars = document.getElementById('emotionBars');
  if (emotionBars) {
    const eObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        emotionBars.querySelectorAll('.ebar-fill').forEach((bar) => {
          bar.style.width = bar.dataset.width + '%';
        });
        eObs.disconnect();
      }
    }, { threshold: 0.3 });
    eObs.observe(emotionBars);
  }

  // Typing demo
  const typingArea = document.getElementById('typingArea');
  const typingWpm = document.getElementById('typingWpm');
  const typingStatus = document.getElementById('typingStatus');
  const replies = [
    "Honestly mate, this is bang on. The best tools I've seen lately are the ones that amplify what someone already does well.",
    "Solid take. Reckon most founders overthink the first version — ship it, learn, iterate. That's the pattern that works.",
    "This is class. The gap between talking about building and actually shipping is where 90% of people fall off.",
  ];

  if (typingArea) {
    let replyIdx = 0;
    function typeReply() {
      const text = replies[replyIdx % replies.length];
      replyIdx++;
      typingArea.textContent = '';
      if (typingStatus) typingStatus.textContent = 'composing...';
      let i = 0;
      let startTime = Date.now();
      let wordCount = 0;

      function typeChar() {
        if (i >= text.length) {
          if (typingStatus) typingStatus.textContent = 'ready to send';
          setTimeout(typeReply, 3000);
          return;
        }
        // Simulate typo occasionally
        if (Math.random() < 0.04 && i > 5 && text[i] !== ' ') {
          const wrong = String.fromCharCode(text.charCodeAt(i) + (Math.random() > 0.5 ? 1 : -1));
          typingArea.textContent += wrong;
          setTimeout(() => {
            typingArea.textContent = typingArea.textContent.slice(0, -1);
            setTimeout(() => {
              typingArea.textContent += text[i];
              i++;
              if (text[i - 1] === ' ') wordCount++;
              updateWpm();
              scheduleNext();
            }, 80 + Math.random() * 60);
          }, 120 + Math.random() * 80);
          return;
        }
        typingArea.textContent += text[i];
        if (text[i] === ' ') wordCount++;
        i++;
        updateWpm();
        scheduleNext();
      }

      function updateWpm() {
        const elapsed = (Date.now() - startTime) / 60000;
        if (elapsed > 0 && typingWpm) {
          typingWpm.textContent = Math.round(wordCount / elapsed) + ' wpm';
        }
      }

      function scheduleNext() {
        // Gaussian-ish timing: base + random variance
        const base = 45;
        const variance = (Math.random() + Math.random() + Math.random()) / 3 * 60;
        const pause = text[i - 1] === '.' || text[i - 1] === ',' ? 200 + Math.random() * 200 : 0;
        setTimeout(typeChar, base + variance + pause);
      }

      setTimeout(typeChar, 800);
    }
    // Start when visible
    const tObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { typeReply(); tObs.disconnect(); }
    }, { threshold: 0.3 });
    tObs.observe(typingArea);
  }

  // Mouse bezier demo
  const mouseSvg = document.getElementById('mouseSvg');
  const mousePath = document.getElementById('mousePath');
  const mouseTrail = document.getElementById('mouseTrail');
  const mouseDot = document.getElementById('mouseDot');

  if (mouseSvg && mouseDot) {
    function animateMouse() {
      // Random start point
      const sx = 30 + Math.random() * 60, sy = 30 + Math.random() * 80;
      // Target: Send button
      const tx = 310, ty = 195;
      // Control points with overshoot
      const cx1 = sx + (tx - sx) * 0.3 + (Math.random() - 0.5) * 80;
      const cy1 = sy + (ty - sy) * 0.1 + (Math.random() - 0.5) * 60;
      const cx2 = tx + (Math.random() - 0.5) * 40;
      const cy2 = ty - 40 + Math.random() * 30;
      // Overshoot point
      const ox = tx + 8 + Math.random() * 12;
      const oy = ty - 4 + Math.random() * 8;

      const d = `M${sx},${sy} C${cx1},${cy1} ${cx2},${cy2} ${ox},${oy}`;
      const dCorrect = `M${sx},${sy} C${cx1},${cy1} ${cx2},${cy2} ${ox},${oy} L${tx},${ty}`;
      if (mousePath) mousePath.setAttribute('d', dCorrect);

      // Animate along path
      const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathEl.setAttribute('d', dCorrect);
      const len = pathEl.getTotalLength();
      let progress = 0;
      const trailPoints = [];

      function step() {
        progress += 0.008 + Math.random() * 0.006; // varying speed
        if (progress > 1) {
          setTimeout(animateMouse, 1200 + Math.random() * 800);
          return;
        }
        const pt = pathEl.getPointAtLength(progress * len);
        mouseDot.setAttribute('cx', pt.x);
        mouseDot.setAttribute('cy', pt.y);
        trailPoints.push(`${pt.x},${pt.y}`);
        if (trailPoints.length > 1 && mouseTrail) {
          mouseTrail.setAttribute('d', 'M' + trailPoints.join(' L'));
        }
        requestAnimationFrame(step);
      }

      trailPoints.length = 0;
      if (mouseTrail) mouseTrail.setAttribute('d', '');
      step();
    }

    const mObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { animateMouse(); mObs.disconnect(); }
    }, { threshold: 0.3 });
    mObs.observe(mouseSvg);
  }
})();
