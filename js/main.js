/* =========================================================
   Scorpion Atelier — interacción
   ========================================================= */

/* ---------------------------------------------------------
   CONFIGURACIÓN DEL FORMULARIO
   Cuando el dominio esté listo, completar `endpoint` con la URL
   que recibe las consultas. Funciona con:
     · Formspree      → "https://formspree.io/f/XXXXXXXX"
     · Getform/Basin  → la URL que entregue el servicio
     · Backend propio → por ejemplo "/api/contacto"
   Se envía por POST como JSON (Accept: application/json).
   Mientras esté vacío, el formulario valida pero no envía.
   --------------------------------------------------------- */
const FORM_CONFIG = {
  endpoint: "",
  successMessage: "Gracias. La consulta llegó al taller; la respuesta suele tardar dos o tres días.",
  errorMessage: "No se pudo enviar. Revise la conexión e intente de nuevo en unos minutos.",
  previewMessage: "El formulario todavía no está conectado: los datos son válidos, pero no se enviaron.",
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Madera del banco (canvas procedural) ---------- */
(function woodBench() {
  const canvas = document.getElementById("wood");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function hash(x, y) {
    let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }
  function noise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y) {
    let s = 0, amp = .5, f = 1;
    for (let i = 0; i < 4; i++) { s += amp * noise(x * f, y * f); f *= 2.03; amp *= .5; }
    return s;
  }
  // Generador pseudoaleatorio con semilla: el banco siempre se ve igual.
  function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }

  let lastW = 0;
  function render() {
    const rect = canvas.getBoundingClientRect();
    const cssW = Math.round(rect.width), cssH = Math.round(rect.height);
    if (!cssW || !cssH) return;
    const maxPx = 1500000;
    const scale = Math.min(window.devicePixelRatio || 1, Math.sqrt(maxPx / (cssW * cssH)), 1.5);
    const W = Math.round(cssW * scale), H = Math.round(cssH * scale);
    canvas.width = W; canvas.height = H;

    const img = ctx.createImageData(W, H);
    const px = img.data;
    const k = 1 / scale;
    for (let y = 0; y < H; y++) {
      const Y = y * k;
      for (let x = 0; x < W; x++) {
        const X = x * k;
        const warp = fbm(X * .0022, Y * .011);
        const v = Y * .05 + warp * 10 + fbm(X * .0008, Y * .0028) * 5;
        const rings = Math.sin(v * 1.7);
        const streak = noise(X * .015, Y * .55);
        const pore = noise(X * .09, Y * 1.4);
        let t = .42 + .2 * rings + .2 * (streak - .5) + .22 * (warp - .5) - .08 * (pore > .82 ? 1 : 0);
        t = Math.max(0, Math.min(1, t));
        const i = (y * W + x) * 4;
        px[i]     = 22 + 78 * t;
        px[i + 1] = 14 + 48 * t;
        px[i + 2] = 9 + 25 * t;
        px[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);

    ctx.save();
    ctx.scale(scale, scale);
    const r = rng(7);

    // Rayones del uso diario
    ctx.lineCap = "round";
    for (let n = 0; n < 340; n++) {
      const x = r() * cssW, y = r() * cssH, len = 8 + r() * 110, a = r() * Math.PI;
      ctx.strokeStyle = `rgba(255, 222, 176, ${.025 + r() * .06})`;
      ctx.lineWidth = .4 + r() * .8;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len * .3); ctx.stroke();
    }
    // Quemaduras y manchas de soldadura
    for (let n = 0; n < 14; n++) {
      const x = r() * cssW, y = r() * cssH, rad = 6 + r() * 30;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, "rgba(8, 5, 3, .45)"); g.addColorStop(1, "rgba(8, 5, 3, 0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
    }
    // Limaduras de oro alrededor de la zona de trabajo
    // Centradas en el reloj, esté donde esté según el tamaño de pantalla.
    const watch = document.querySelector(".obj--watch");
    const wr = watch ? watch.getBoundingClientRect() : null;
    const cx = wr && wr.width ? wr.left + wr.width / 2 - rect.left : cssW * .6;
    const cy = wr && wr.height ? wr.top + wr.height * .7 - rect.top : cssH * .55;
    for (let n = 0; n < 1100; n++) {
      const ang = r() * Math.PI * 2, d = Math.pow(r(), .6) * Math.min(cssW, cssH) * .55;
      const x = cx + Math.cos(ang) * d * 1.4, y = cy + Math.sin(ang) * d;
      ctx.fillStyle = `rgba(${210 + r() * 40 | 0}, ${165 + r() * 50 | 0}, ${70 + r() * 50 | 0}, ${.15 + r() * .55})`;
      const s = .5 + r() * 1.3;
      ctx.fillRect(x, y, s, s * (.5 + r()));
    }
    ctx.restore();
    lastW = cssW;
  }

  render();
  let t;
  window.addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(() => {
      // Solo se redibuja si cambia el ancho (evita redibujar en móviles al mover la barra del navegador).
      if (Math.abs(canvas.getBoundingClientRect().width - lastW) > 40) render();
    }, 200);
  });
})();

/* ---------- Detalles de los objetos del banco ---------- */
(function benchDetails() {
  // Boceto: contorno ondulado de la caja, como el dibujo del joyero.
  function wavePath(cx, cy, R, amp, lobes, rot, wobble) {
    let d = "";
    for (let i = 0; i <= 160; i++) {
      const a = (i / 160) * Math.PI * 2;
      const rr = R + amp * Math.sin(lobes * a + rot) + wobble * Math.sin(3 * a + 1.3);
      d += (i ? "L" : "M") + (cx + Math.cos(a) * rr).toFixed(1) + " " + (cy + Math.sin(a) * rr).toFixed(1);
    }
    return d + "Z";
  }
  const w1 = document.getElementById("sketchWave");
  const w2 = document.getElementById("sketchWave2");
  if (w1) w1.setAttribute("d", wavePath(150, 180, 104, 7, 8, .4, 2.5));
  if (w2) w2.setAttribute("d", wavePath(151, 181, 88, 5, 8, .4, 2));

  // Tornillos y rubíes sobre el paño
  const screws = document.getElementById("screws");
  if (screws) {
    const pts = [[52, 58, 6, "s"], [78, 46, 4.5, "s"], [100, 70, 5, "s"], [64, 96, 4, "s"], [96, 104, 6.5, "s"],
                 [44, 84, 3.5, "r"], [118, 88, 3, "r"], [84, 124, 4, "s"], [120, 56, 3.5, "s"]];
    screws.innerHTML = pts.map(([x, y, r, k], i) => k === "r"
      ? `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#ruby)"/>`
      : `<g transform="rotate(${i * 37} ${x} ${y})"><circle cx="${x}" cy="${y}" r="${r}" fill="url(#screw)"/><rect x="${x - r * .8}" y="${y - r * .14}" width="${r * 1.6}" height="${r * .28}" fill="#2a2d2f"/></g>`
    ).join("");
  }

  // Bobina de alambre
  const coil = document.getElementById("coil");
  if (coil) {
    let s = "";
    for (let i = 0; i < 9; i++) s += `<ellipse cx="${58 + i * .7}" cy="${58 - i * .4}" rx="${38 - i * .3}" ry="${36 - i * .25}" opacity="${.55 + i * .05}"/>`;
    coil.innerHTML = s;
  }

  // Marcas de talle en el triboulet
  const marks = document.getElementById("mandrelMarks");
  if (marks) {
    let s = "";
    for (let i = 0; i < 18; i++) {
      const y = 30 + i * 15;
      const half = 6 + (y / 300) * 14;
      s += `<path d="M${30 - half * (i % 3 === 0 ? .9 : .5)} ${y} H30"/>`;
    }
    marks.innerHTML = s;
  }
})();

/* ---------- Luz de la lámpara y paralaje sutil ---------- */
(function lamp() {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  requestAnimationFrame(() => setTimeout(() => hero.classList.add("is-lit"), 150));
  if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;

  const objs = [...hero.querySelectorAll(".obj")];
  const lampEl = hero.querySelector(".hero__lamp");
  let raf = 0, mx = 0, my = 0;
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width - .5;
    my = (e.clientY - r.top) / r.height - .5;
    if (!raf) raf = requestAnimationFrame(apply);
  });
  hero.addEventListener("pointerleave", () => { mx = 0; my = 0; if (!raf) raf = requestAnimationFrame(apply); });
  function apply() {
    raf = 0;
    for (const o of objs) {
      const d = parseFloat(o.dataset.depth || 0);
      o.style.setProperty("--px", `${(-mx * d * 10).toFixed(2)}px`);
      o.style.setProperty("--py", `${(-my * d * 8).toFixed(2)}px`);
    }
    lampEl.style.setProperty("--lx", `${66 + mx * 16}%`);
    lampEl.style.setProperty("--ly", `${38 + my * 16}%`);
  }
})();

/* ---------- Cabecera sólida al hacer scroll ---------- */
(function header() {
  const bar = document.getElementById("top-bar");
  const onScroll = () => bar.classList.toggle("is-solid", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();

/* ---------- Galería: filtros + visor ---------- */
(function gallery() {
  const grid = document.getElementById("grid");
  if (!grid) return;
  const tiles = [...grid.querySelectorAll(".tile")];
  const chips = [...document.querySelectorAll(".chip")];

  chips.forEach((chip) => chip.addEventListener("click", () => {
    const f = chip.dataset.filter;
    chips.forEach((c) => { const on = c === chip; c.classList.toggle("is-active", on); c.setAttribute("aria-pressed", on); });
    tiles.forEach((t) => {
      const show = f === "todo" || t.dataset.cat === f;
      t.classList.toggle("is-hidden", !show);
      t.classList.remove("is-in");
      if (show && !reduceMotion) { void t.offsetWidth; t.classList.add("is-in"); }
    });
  }));

  const dlg = document.getElementById("lightbox");
  const media = document.getElementById("lb-media");
  const cap = document.getElementById("lb-cap");
  let current = 0;
  const visible = () => tiles.filter((t) => !t.classList.contains("is-hidden")).map((t) => t.querySelector(".tile__btn"));

  function show(btn) {
    const list = visible();
    current = list.indexOf(btn);
    media.innerHTML = "";
    let el;
    if (btn.dataset.type === "video") {
      el = document.createElement("video");
      Object.assign(el, { src: btn.dataset.src, controls: true, autoplay: true, muted: true, loop: true, playsInline: true });
    } else {
      el = document.createElement("img");
      el.src = btn.dataset.src;
      el.alt = btn.querySelector("img")?.alt || "";
    }
    media.appendChild(el);
    cap.textContent = btn.dataset.caption || "";
  }
  function step(dir) {
    const list = visible();
    if (!list.length) return;
    show(list[(current + dir + list.length) % list.length]);
  }

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".tile__btn");
    if (!btn) return;
    show(btn);
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
  });
  document.getElementById("lb-prev").addEventListener("click", () => step(-1));
  document.getElementById("lb-next").addEventListener("click", () => step(1));
  document.getElementById("lb-close").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target.classList.contains("lightbox__fig")) dlg.close(); });
  dlg.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  });
  dlg.addEventListener("close", () => { media.innerHTML = ""; });

  // Swipe en móviles
  let sx = null;
  dlg.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
  dlg.addEventListener("touchend", (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    sx = null;
  });
})();

/* ---------- Formulario de contacto / lista de espera ---------- */
(function contactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const status = document.getElementById("form-status");
  const submit = document.getElementById("f-submit");

  const rules = [
    { id: "f-nombre", err: "e-nombre", test: (v) => v.trim().length >= 2, msg: "Escriba su nombre." },
    { id: "f-email", err: "e-email", test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), msg: "Revise el email: falta la @ o el dominio." },
    { id: "f-msg", err: "e-msg", test: (v) => v.trim().length >= 10, msg: "Cuéntenos un poco más (mínimo 10 caracteres)." },
    { id: "f-ok", err: "e-ok", test: (_, el) => el.checked, msg: "Hace falta aceptar para poder responder." },
  ];

  function validate() {
    let firstBad = null;
    for (const r of rules) {
      const el = document.getElementById(r.id);
      const ok = r.test(el.value, el);
      el.closest(".field").classList.toggle("has-error", !ok);
      el.setAttribute("aria-invalid", String(!ok));
      document.getElementById(r.err).textContent = ok ? "" : r.msg;
      if (!ok && !firstBad) firstBad = el;
    }
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  form.addEventListener("input", (e) => {
    const field = e.target.closest(".field");
    if (field && field.classList.contains("has-error")) {
      field.classList.remove("has-error");
      const errEl = field.querySelector(".field__err");
      if (errEl) errEl.textContent = "";
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "form__status";
    status.textContent = "";
    if (!validate()) return;
    if (form.web.value) return; // spam: campo trampa completo

    const data = Object.fromEntries(new FormData(form).entries());
    delete data.web;
    data.origen = "scorpion-atelier-web";

    if (!FORM_CONFIG.endpoint) {
      status.textContent = FORM_CONFIG.previewMessage;
      return;
    }

    submit.disabled = true;
    submit.textContent = "Enviando…";
    try {
      const res = await fetch(FORM_CONFIG.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      status.classList.add("is-ok");
      status.textContent = FORM_CONFIG.successMessage;
    } catch (err) {
      status.classList.add("is-error");
      status.textContent = FORM_CONFIG.errorMessage;
    } finally {
      submit.disabled = false;
      submit.textContent = "Enviar";
    }
  });
})();

document.getElementById("year").textContent = new Date().getFullYear();
