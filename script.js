/* =========================================================
   SOBАKI SHUKAKI — script.js (CLEAN)
   - Year in footer
   - Copy-to-clipboard (correct: copies textContent by id)
   - Header scroll effect
   - Scroll-to-top button
   - Smooth scroll for anchors
   - Animate on scroll
   - Noise canvas effect
   - Meta Pixel events (ViewContent / InitiateCheckout / Lead / Social clicks)
   ========================================================= */

/* =========================
   Helpers
   ========================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* =========================
   Meta Pixel safe wrappers
   ========================= */
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

/* =========================
   Main UI logic
   ========================= */
(() => {
  // Year in footer
  const y = $("#y");
  if (y) y.textContent = String(new Date().getFullYear());

  // Header scroll effect
  const header = $(".header");
  const handleHeaderScroll = () => {
    if (window.scrollY > 50) header?.classList.add("scrolled");
    else header?.classList.remove("scrolled");
  };
  window.addEventListener("scroll", handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  // Scroll to top button
  const scrollTopBtn = $("#scrollTop");
  const handleScrollTopVisibility = () => {
    if (window.scrollY > 400) scrollTopBtn?.classList.add("visible");
    else scrollTopBtn?.classList.remove("visible");
  };
  window.addEventListener("scroll", handleScrollTopVisibility, { passive: true });
  handleScrollTopVisibility();

  scrollTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Smooth scroll for navigation links (#anchors)
  $$("a[href^='#']").forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const target = $(href);
      if (!target) return;

      e.preventDefault();
      const headerHeight = header?.offsetHeight || 68;
      const targetPosition =
        target.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({ top: targetPosition, behavior: "smooth" });
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
  document.addEventListener("DOMContentLoaded", animateOnScroll);
  // Trigger on load a few times
  animateOnScroll();
  setTimeout(animateOnScroll, 100);
  setTimeout(animateOnScroll, 300);
})();

/* =========================
   Copy-to-clipboard (correct)
   Copies textContent from element id in data-copy
   Tracks: Lead + CopyRequisites
   ========================= */
(() => {
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        return true;
      } catch (_) {
        return false;
      }
    }
  }

  $$(".copy[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();

      const id = btn.getAttribute("data-copy");
      if (!id) return;

      const el = document.getElementById(id);
      const text = (el?.textContent || "").trim();
      if (!text) return;

      const ok = await copyText(text);

      const prev = btn.textContent;
      btn.textContent = ok ? "✔" : "✖";
      btn.classList.toggle("copied", ok);

      // Track copy action (no sensitive data)
      fbqTrack("Lead", {
        content_name: "Copy Requisites",
        field: id,
        page: window.location.pathname,
      });
      fbqCustom("CopyRequisites", {
        field: id,
        page: window.location.pathname,
      });

      setTimeout(() => {
        btn.textContent = prev;
        btn.classList.remove("copied");
      }, 1200);
    });
  });
})();

/* =========================
   Meta Pixel events
   - ViewContent: when #donate becomes visible
   - InitiateCheckout: click on Monobank / donate links
   - Contact: click on social links
   ========================= */
(() => {
  function getHost(url) {
    try {
      return new URL(url, window.location.href)
        .hostname.replace(/^www\./, "")
        .toLowerCase();
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

    if (host.includes("send.monobank.ua") && lower.includes("/jar/")) return "monobank_jar";
    if (host.includes("monobank.ua")) return "monobank";

    // optional future providers
    if (host.includes("binance.com") || host.includes("okx.com") || host.includes("whitebit.com")) {
      return "crypto_exchange";
    }

    return null;
  }

  function placementOfLink(a) {
    if (a.closest(".socialRow--heroCenter")) return "hero";
    if (a.closest(".socialRow--big")) return "footer";
    if (a.closest("nav")) return "nav";
    return "other";
  }

  // ViewContent: Donate section visible
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
              page: window.location.pathname,
            });
            io.disconnect();
          }
        }
      },
      { threshold: 0.35 }
    );

    io.observe(donateSection);
  });

  // Click tracking (social + donate)
  document.addEventListener("click", function (e) {
    const a = e.target.closest("a");
    if (!a) return;

    const href = a.getAttribute("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;

    // Social
    const social = classifySocial(href);
    if (social) {
      fbqTrack("Contact", {
        method: social,
        link: href,
      });

      fbqCustom("SocialClick", {
        platform: social,
        placement: placementOfLink(a),
        link: href,
        page: window.location.pathname,
      });

      return;
    }

    // Donate
    const donate = classifyDonate(href);
    if (donate) {
      fbqTrack("InitiateCheckout", {
        content_name: "Donate Click",
        method: donate,
        link: href,
      });

      fbqCustom("DonateClick", {
        method: donate,
        placement: placementOfLink(a),
        link: href,
        page: window.location.pathname,
      });

      return;
    }
  });
})();

/* =========================
   Noise canvas effect
   ========================= */
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
    if (!ctx) return;

    const tw = Math.max(180, Math.floor((innerWidth * dpr) / (3 * NOISE_SCALE)));
    const th = Math.max(140, Math.floor((innerHeight * dpr) / (3 * NOISE_SCALE)));

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
