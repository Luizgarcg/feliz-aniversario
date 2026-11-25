/* ==========================================================
   COLAGEM INTERATIVA + FAIXA + EXTRAS
   (carrega depois do script.js; usa TEXT, state, burst e
   launchHeartFirework que já existem lá)
   ========================================================== */
(() => {
  const board = document.getElementById("board");
  if (!board) return;

  // Posições em unidades da largura do quadro (x, y, w). h = altura do quadro.
  // k: pol = polaroid, torn = papel rasgado
  const LAYOUT = {
    d: {
      h: 1.08,
      items: [
        { t: "photo", n: 1, k: "pol", x: 0.03, y: 0.02, w: 0.27, r: -5 },
        { t: "photo", n: 2, k: "torn", x: 0.35, y: 0.0, w: 0.22, r: 3 },
        { t: "photo", n: 3, k: "pol", x: 0.62, y: 0.04, w: 0.27, r: 5 },
        { t: "photo", n: 4, k: "torn", x: 0.08, y: 0.38, w: 0.22, r: 4 },
        { t: "photo", n: 5, k: "pol", x: 0.33, y: 0.3, w: 0.31, r: -3 },
        { t: "photo", n: 6, k: "pol", x: 0.67, y: 0.42, w: 0.26, r: -5 },
        { t: "photo", n: 7, k: "pol", x: 0.04, y: 0.69, w: 0.28, r: 3 },
        { t: "photo", n: 8, k: "torn", x: 0.38, y: 0.68, w: 0.25, r: -2 },
        { t: "tag", x: 0.24, y: 0.015, w: 0.1, r: -4 },
        { t: "badge", x: 0.58, y: 0.31, w: 0.1, r: 8 },
        { t: "heart", x: 0.9, y: 0.3, w: 0.075, r: 0 },
        { t: "star", x: 0.3, y: 0.25, w: 0.06, r: 10 },
        { t: "star", x: 0.92, y: 0.7, w: 0.06, r: -12 },
        { t: "heart", x: 0.62, y: 0.97, w: 0.06, r: 0 },
        { t: "note", x: 0.7, y: 0.74, w: 0.22, r: 4 },
      ],
    },
    m: {
      h: 2.95,
      items: [
        { t: "photo", n: 1, k: "pol", x: 0.03, y: 0.01, w: 0.46, r: -4 },
        { t: "photo", n: 2, k: "torn", x: 0.54, y: 0.1, w: 0.4, r: 3 },
        { t: "photo", n: 3, k: "pol", x: 0.04, y: 0.62, w: 0.46, r: 4 },
        { t: "photo", n: 4, k: "torn", x: 0.55, y: 0.72, w: 0.4, r: -3 },
        { t: "photo", n: 5, k: "pol", x: 0.03, y: 1.24, w: 0.46, r: -3 },
        { t: "photo", n: 6, k: "pol", x: 0.52, y: 1.36, w: 0.44, r: 5 },
        { t: "photo", n: 7, k: "pol", x: 0.04, y: 1.86, w: 0.46, r: 3 },
        { t: "photo", n: 8, k: "torn", x: 0.55, y: 2.0, w: 0.4, r: -4 },
        { t: "tag", x: 0.3, y: 0.0, w: 0.2, r: -4 },
        { t: "badge", x: 0.4, y: 0.52, w: 0.17, r: 8 },
        { t: "heart", x: 0.42, y: 1.2, w: 0.13, r: 0 },
        { t: "star", x: 0.45, y: 0.3, w: 0.1, r: 10 },
        { t: "star", x: 0.46, y: 1.8, w: 0.1, r: -12 },
        { t: "heart", x: 0.8, y: 2.7, w: 0.12, r: 0 },
        { t: "note", x: 0.1, y: 2.52, w: 0.6, r: -3 },
      ],
    },
  };

  const HEART =
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';

  let z = 20;
  let mode = null;
  let lastW = 0;
  let noteIdx = 0;
  let pieces = [];
  let revealed = false;
  const isMobile = () => window.innerWidth < 640;
  const $lb = () => document.getElementById("lb");

  function inner(it) {
    switch (it.t) {
      case "photo":
        return it.k === "pol"
          ? `<img src="fotos/foto${it.n}.jpg" alt="" draggable="false"><p class="cap"></p>`
          : `<img src="fotos/foto${it.n}.jpg" alt="" draggable="false">`;
      case "heart":
        return HEART;
      case "badge":
        return "<span>22</span>";
      case "star":
        return "✦";
      case "tag":
        return '<span class="tagtxt"></span>';
      case "note":
        return '<span class="notetxt"></span>';
    }
    return "";
  }

  function classFor(it) {
    if (it.t === "photo") return `photo ${it.k}`;
    return `st st-${it.t}`;
  }

  function build() {
    mode = isMobile() ? "m" : "d";
    const L = LAYOUT[mode];
    const W = board.clientWidth;
    lastW = W;
    board.innerHTML = "";
    board.style.height = L.h * W + "px";
    pieces = L.items.map((it, idx) => {
      const el = document.createElement("div");
      el.className = `pc ${classFor(it)}`;
      el.dataset.t = it.t;
      if (it.n) el.dataset.n = it.n;
      el.style.setProperty("--r", it.r + "deg");
      el.style.left = it.x * W + "px";
      el.style.top = it.y * W + "px";
      if (it.t !== "tag") el.style.width = it.w * W + "px";
      el.style.zIndex = idx + 1;
      el.innerHTML = inner(it);
      el._home = { x: it.x, y: it.y, r: it.r };
      board.appendChild(el);
      return el;
    });
    updateCaptions();
    revealed = false;
    observeReveal();
  }

  function updateCaptions() {
    if (typeof TEXT === "undefined" || typeof state === "undefined") return;
    const t = TEXT[state.lang];
    board.querySelectorAll(".pol").forEach((p) => {
      const cap = p.querySelector(".cap");
      if (cap) cap.textContent = t.slides[+p.dataset.n - 1] || "";
    });
    board.querySelectorAll(".tagtxt").forEach((e) => (e.textContent = t.galH));
    board.querySelectorAll(".notetxt").forEach((e) => (e.textContent = t.loveNotes[noteIdx % t.loveNotes.length]));
  }
  window.updateCollageCaptions = updateCaptions;

  /* ---------- aparecer ao rolar (+ foto "revela" a cor) ---------- */
  let io;
  function observeReveal() {
    if (io) io.disconnect();
    io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !revealed) {
          revealed = true;
          pieces.forEach((el, i) => {
            setTimeout(() => el.classList.add("in"), i * 110);
            if (el.classList.contains("photo")) setTimeout(() => el.classList.add("dev"), 700 + i * 220);
          });
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(board);
  }

  /* ---------- arrastar (mouse e toque com "segurar") ---------- */
  let cur = null;
  board.addEventListener("pointerdown", (e) => {
    const el = e.target.closest(".pc");
    if (!el) return;
    cur = {
      el, id: e.pointerId, sx: e.clientX, sy: e.clientY,
      l: el.offsetLeft, t: el.offsetTop, moved: false,
      active: e.pointerType !== "touch", timer: null,
    };
    if (cur.active) grab();
    else
      cur.timer = setTimeout(() => {
        if (cur) {
          cur.active = true;
          grab();
          if (navigator.vibrate) navigator.vibrate(12);
        }
      }, 220);
  });

  function grab() {
    cur.el.classList.remove("moving");
    cur.el.classList.add("drag");
    cur.el.style.zIndex = ++z;
    try { cur.el.setPointerCapture(cur.id); } catch (_) {}
  }

  window.addEventListener("pointermove", (e) => {
    if (!cur || e.pointerId !== cur.id) return;
    const dx = e.clientX - cur.sx;
    const dy = e.clientY - cur.sy;
    if (!cur.active) {
      // no toque, mexer antes de segurar = rolar a página
      if (Math.hypot(dx, dy) > 8) { clearTimeout(cur.timer); cur = null; }
      return;
    }
    if (Math.hypot(dx, dy) > 4) cur.moved = true;
    const el = cur.el;
    const W = board.clientWidth;
    const H = board.clientHeight;
    const nl = Math.max(-el.offsetWidth * 0.15, Math.min(W - el.offsetWidth * 0.85, cur.l + dx));
    const nt = Math.max(-el.offsetHeight * 0.1, Math.min(H - el.offsetHeight * 0.85, cur.t + dy));
    el.style.left = nl + "px";
    el.style.top = nt + "px";
  });

  // enquanto arrasta no celular, não deixa a página rolar
  board.addEventListener("touchmove", (e) => { if (cur && cur.active) e.preventDefault(); }, { passive: false });

  function release(e, cancelled) {
    if (!cur || e.pointerId !== cur.id) return;
    clearTimeout(cur.timer);
    const { el, moved } = cur;
    el.classList.remove("drag");
    if (!cancelled && !moved) tap(el, e);
    cur = null;
  }
  window.addEventListener("pointerup", (e) => release(e, false));
  window.addEventListener("pointercancel", (e) => release(e, true));

  /* ---------- toque nas peças ---------- */
  function tap(el, e) {
    const type = el.dataset.t;
    const x = e.clientX, y = e.clientY;
    if (type === "photo") {
      const lb = $lb();
      lb.querySelector("img").src = el.querySelector("img").src;
      lb.style.display = "flex";
    } else if (type === "heart") {
      burst(x, y, 26);
    } else if (type === "badge") {
      launchHeartFirework(x, y);
    } else if (type === "star") {
      burst(x, y, 12);
      el.style.transition = "transform .6s";
      el.style.setProperty("--r", (parseFloat(el.style.getPropertyValue("--r")) + 180) + "deg");
    } else if (type === "note") {
      noteIdx++;
      updateCaptions();
      burst(x, y, 8);
    }
  }

  /* ---------- misturar / arrumar ---------- */
  document.getElementById("shuffle").addEventListener("click", (e) => {
    const W = board.clientWidth, H = board.clientHeight;
    pieces.forEach((el) => {
      el.classList.add("moving");
      const w = el.offsetWidth, h = el.offsetHeight;
      el.style.left = Math.random() * Math.max(10, W - w) + "px";
      el.style.top = Math.random() * Math.max(10, H - h) + "px";
      el.style.setProperty("--r", (Math.random() * 20 - 10).toFixed(1) + "deg");
    });
    burst(e.clientX, e.clientY, 14);
  });
  document.getElementById("reset").addEventListener("click", () => {
    const W = board.clientWidth;
    pieces.forEach((el) => {
      el.classList.add("moving");
      el.style.left = el._home.x * W + "px";
      el.style.top = el._home.y * W + "px";
      el.style.setProperty("--r", el._home.r + "deg");
    });
  });

  /* ---------- refazer ao mudar a largura da tela ---------- */
  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      if (Math.abs(board.clientWidth - lastW) > 2) build();
    }, 250);
  });

  build();

  /* ==========================================================
     FAIXA EM MOVIMENTO: muda de direção e acelera com o scroll
     ========================================================== */
  const track = document.querySelector(".mq-track");
  if (track && track.animate) {
    const anim = track.animate(
      [{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }],
      { duration: 26000, iterations: Infinity, easing: "linear" },
    );
    let dir = 1, boost = 0, lastY = window.scrollY;
    window.addEventListener("scroll", () => {
      const v = window.scrollY - lastY;
      lastY = window.scrollY;
      if (Math.abs(v) > 1) dir = v > 0 ? 1 : -1;
      boost = Math.min(8, boost + Math.abs(v) * 0.12);
    }, { passive: true });
    (function loop() {
      boost *= 0.93;
      anim.playbackRate = dir * (1 + boost);
      requestAnimationFrame(loop);
    })();
  }

  /* ==========================================================
     EXTRAS: clicar no "22" solta fogos; mouse deixa estrelinhas
     ========================================================== */
  const age = document.getElementById("age");
  if (age) age.addEventListener("click", (e) => launchHeartFirework(e.clientX, e.clientY));

  if (window.matchMedia("(pointer: fine)").matches) {
    let lx = 0, ly = 0;
    window.addEventListener("pointermove", (e) => {
      if (Math.hypot(e.clientX - lx, e.clientY - ly) < 28) return;
      lx = e.clientX; ly = e.clientY;
      const s = document.createElement("span");
      s.className = "trail";
      s.textContent = "✦";
      s.style.left = e.clientX + "px";
      s.style.top = e.clientY + "px";
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 800);
    });
  }
})();