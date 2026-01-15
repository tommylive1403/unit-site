(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // Year
  const y = $("#y");
  if (y) y.textContent = String(new Date().getFullYear());

  // Copy buttons
  $$(".copy[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.getAttribute("data-copy") || "";
      try {
        await navigator.clipboard.writeText(text);
        const prev = btn.textContent;
        btn.textContent = "Скопійовано";
        setTimeout(() => (btn.textContent = prev), 900);
      } catch {
        // fallback
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
    });
  });

  // Media rail arrows
  $$("[data-rail]").forEach((rail) => {
    const row = $(".mediaRow", rail);
    const left = $(".railArrow--left", rail);
    const right = $(".railArrow--right", rail);
    if (!row) return;

    const step = () => {
      const card = $(".mediaCard", row);
      const w = card ? card.getBoundingClientRect().width : 280;
      return w + 18;
    };

    left?.addEventListener("click", () =>
      row.scrollBy({ left: -step(), behavior: "smooth" })
    );
    right?.addEventListener("click", () =>
      row.scrollBy({ left: step(), behavior: "smooth" })
    );
  });
})();

(() => {
  const c = document.getElementById("fx-noise");
  if (!c) return;

  const ctx = c.getContext("2d", { alpha: true });
  let w = 0,
    h = 0,
    dpr = 1;

  // “WebGL-ish”: дрібний шум + легка анімація (як shader time)
  const NOISE_SCALE = 1.1; // 1.0 = дуже дрібний; 1.4 = трохи крупніший
  const FPS = 18; // менше FPS = більш “кінематографічно” і легше
  const STRENGTH = 32; // інтенсивність зерна (0..255). 32-40 зазвичай ідеально

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.floor(innerWidth * dpr);
    h = Math.floor(innerHeight * dpr);
    c.width = w;
    c.height = h;
    c.style.width = innerWidth + "px";
    c.style.height = innerHeight + "px";
  }

  function render(t) {
    // робимо “tile” шуму і масштабуємо на весь екран — як у шейдері
    const tw = Math.max(
      180,
      Math.floor((innerWidth * dpr) / (3 * NOISE_SCALE))
    );
    const th = Math.max(
      140,
      Math.floor((innerHeight * dpr) / (3 * NOISE_SCALE))
    );

    const img = ctx.createImageData(tw, th);
    const data = img.data;

    // псевдо-рандом, стабільний по кадрам (як зерно плівки)
    let seed = (t * 0.001) % 1000;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // monochrome grain
    for (let i = 0; i < data.length; i += 4) {
      const n = (rnd() - 0.5) * STRENGTH;
      const v = 128 + n;

      data[i] = v; // R
      data[i + 1] = v; // G
      data[i + 2] = v; // B
      data[i + 3] = 255; // A
    }

    // очищення + drift
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const driftX = Math.sin(t * 0.0007) * 6 * dpr;
    const driftY = Math.cos(t * 0.0009) * 6 * dpr;

    // tmp canvas -> pattern
    const tmp = document.createElement("canvas");
    tmp.width = tw;
    tmp.height = th;
    tmp.getContext("2d").putImageData(img, 0, 0);

    const pattern = ctx.createPattern(tmp, "repeat");
    ctx.translate(driftX, driftY);
    ctx.scale(w / tw, h / th);
    ctx.fillStyle = pattern;
    ctx.fillRect(-1, -1, tw + 2, th + 2);
  }

  let last = 0;
  function loop(t) {
    if (t - last > 1000 / FPS) {
      last = t;
      render(t);
    }
    requestAnimationFrame(loop);
  }

  resize();
  addEventListener("resize", resize, { passive: true });
  requestAnimationFrame(loop);
})();
