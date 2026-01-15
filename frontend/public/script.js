(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // Year in footer
  const y = $("#y");
  if (y) y.textContent = String(new Date().getFullYear());

  // Copy buttons
  $$(".copy[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.getAttribute("data-copy") || "";
      try {
        await navigator.clipboard.writeText(text);
        const prev = btn.textContent;
        btn.textContent = "✔";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = prev;
          btn.classList.remove("copied");
        }, 1200);
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
        const prev = btn.textContent;
        btn.textContent = "✔";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = prev;
          btn.classList.remove("copied");
        }, 1200);
      }
    });
  });

  // Header scroll effect
  const header = $(".header");
  const handleHeaderScroll = () => {
    if (window.scrollY > 50) {
      header?.classList.add("scrolled");
    } else {
      header?.classList.remove("scrolled");
    }
  };
  window.addEventListener("scroll", handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  // Scroll to top button
  const scrollTopBtn = $("#scrollTop");
  const handleScrollTopVisibility = () => {
    if (window.scrollY > 400) {
      scrollTopBtn?.classList.add("visible");
    } else {
      scrollTopBtn?.classList.remove("visible");
    }
  };
  window.addEventListener("scroll", handleScrollTopVisibility, { passive: true });
  
  scrollTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Smooth scroll for navigation links
  $$("a[href^='#']").forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href && href !== "#") {
        const target = $(href);
        if (target) {
          e.preventDefault();
          const headerHeight = header?.offsetHeight || 68;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
          window.scrollTo({ top: targetPosition, behavior: "smooth" });
        }
      }
    });
  });

  // Animate on scroll
  const animateOnScroll = () => {
    const elements = $$(".animate-on-scroll");
    const windowHeight = window.innerHeight;
    
    elements.forEach((el) => {
      const elementTop = el.getBoundingClientRect().top;
      const elementVisible = 150;
      
      if (elementTop < windowHeight - elementVisible) {
        el.classList.add("animated");
      }
    });
  };
  
  window.addEventListener("scroll", animateOnScroll, { passive: true });
  // Trigger on load - multiple times to ensure all visible elements animate
  animateOnScroll();
  setTimeout(animateOnScroll, 100);
  setTimeout(animateOnScroll, 300);
  
  // Also trigger when DOM is fully ready
  document.addEventListener("DOMContentLoaded", animateOnScroll);

})();

// WebGL-style noise effect
(() => {
  const c = document.getElementById("fx-noise");
  if (!c) return;

  const ctx = c.getContext("2d", { alpha: true });
  let w = 0,
    h = 0,
    dpr = 1;

  const NOISE_SCALE = 1.1;
  const FPS = 18;
  const STRENGTH = 28;

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

    let seed = (t * 0.001) % 1000;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let i = 0; i < data.length; i += 4) {
      const n = (rnd() - 0.5) * STRENGTH;
      const v = 128 + n;

      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const driftX = Math.sin(t * 0.0007) * 6 * dpr;
    const driftY = Math.cos(t * 0.0009) * 6 * dpr;

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
