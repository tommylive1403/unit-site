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
 
// === Copy-to-clipboard for Support block ===
document.addEventListener("click", e => {
  const btn = e.target.closest("[data-copy]");
  if (!btn) return;

  const id = btn.dataset.copy;
  const el = document.getElementById(id);
  if (!el) return;

  const text = el.textContent.trim();
  if (!text) return;

  navigator.clipboard.writeText(text);

  const old = btn.textContent;
  btn.textContent = "Готово ✓";
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = old;
    btn.disabled = false;
  }, 1200);
});
/* =========================================================
   META PIXEL EVENTS — SOBАKI SHUKAKI
   Потрібно: Pixel встановлений у <head> (у тебе вже є)

   Події:
   - ViewContent: коли видно секцію донату #donate
   - InitiateCheckout: клік по Monobank / платіжному посиланню
   - Lead: копіювання реквізитів (кнопки .copy[data-copy])
   - Contact + SocialClick: клік по соцмережах (IG/FB/TikTok/TG)
   ========================================================= */

(function () {
  // ---------- Safe wrappers ----------
  function fbqTrack(eventName, params) {
    try {
      if (typeof window.fbq === "function") {
        window.fbq("track", eventName, params || {});
      }
    } catch (_) {}
  }

  function fbqCustom(eventName, params) {
    try {
      if (typeof window.fbq === "function") {
        window.fbq("trackCustom", eventName, params || {});
      }
    } catch (_) {}
  }

  // ---------- Helpers ----------
  function getHost(url) {
    try {
      return new URL(url, window.location.href).hostname.replace(/^www\./, "").toLowerCase();
    } catch (_) {
      return "";
    }
  }

  function classifySocial(url) {
    const host = getHost(url);
    if (host.includes("instagram.com")) return "instagram";
    if (host.includes("facebook.com") || host.includes("fb.com")) return "facebook";
    if (host.includes("tiktok.com")) return "tiktok";
    if (host === "t.me" || host.endsWith(".t.me")) return "telegram";
    return null;
  }

  function classifyDonate(url) {
    const host = getHost(url);
    const lower = (url || "").toLowerCase();

    // Monobank jar
    if (host.includes("send.monobank.ua") && lower.includes("/jar/")) return "monobank_jar";
    // Інші monobank-лінки (на майбутнє)
    if (host.includes("monobank.ua")) return "monobank";
    // Якщо колись додаси сторонні крипто-платформи
    if (host.includes("binance.com") || host.includes("okx.com") || host.includes("whitebit.com")) return "crypto_exchange";

    return null;
  }

  function placementOfLink(a) {
    if (a.closest(".socialRow--heroCenter")) return "hero";
    if (a.closest(".socialRow--big")) return "footer";
    if (a.closest("nav")) return "nav";
    return "other";
  }

  // ---------- 1) ViewContent: видно секцію #donate ----------
  document.addEventListener("DOMContentLoaded", function () {
    const donateSection = document.querySelector("#donate");
    if (!donateSection || !("IntersectionObserver" in window)) return;

    let fired = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!fired && entry.isIntersecting) {
            fired = true;
            fbqTrack("ViewContent", {
              content_name: "Donate Section",
              page: window.location.pathname
            });
            io.disconnect();
          }
        }
      },
      { threshold: 0.35 }
    );

    io.observe(donateSection);
  });

  // ---------- 2) Click tracking: соцмережі + донати ----------
  document.addEventListener("click", function (e) {
    const a = e.target.closest("a");
    if (!a) return;

    const href = a.getAttribute("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;

    // --- Social links ---
    const social = classifySocial(href);
    if (social) {
      // Стандартна подія (зручно для оптимізації/аудиторій)
      fbqTrack("Contact", {
        method: social,
        link: href
      });

      // Кастом (зручно в Events Manager)
      fbqCustom("SocialClick", {
        platform: social,
        placement: placementOfLink(a),
        link: href,
        page: window.location.pathname
      });

      return;
    }

    // --- Donate links ---
    const donate = classifyDonate(href);
    if (donate) {
      // Найкраща конверсія для твого кейсу (бо “успішний донат” на сторонніх сервісах не видно)
      fbqTrack("InitiateCheckout", {
        content_name: "Donate Click",
        method: donate,
        link: href
      });

      fbqCustom("DonateClick", {
        method: donate,
        placement: placementOfLink(a),
        link: href,
        page: window.location.pathname
      });

      return;
    }
  });

  // ---------- 3) Lead: Copy реквізитів ----------
  document.addEventListener("click", function (e) {
    const btn = e.target.closest("button.copy");
    if (!btn) return;

    const targetId = btn.getAttribute("data-copy");
    if (!targetId) return;

    // НЕ передаємо реквізити, тільки факт взаємодії
    fbqTrack("Lead", {
      content_name: "Copy Requisites",
      field: targetId,
      page: window.location.pathname
    });

    fbqCustom("CopyRequisites", {
      field: targetId,
      page: window.location.pathname
    });
  });
})();
