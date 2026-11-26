// rWebRouter product page: theme toggle, tab groups, copy buttons, videos that play only while visible.
(() => {
  const root = document.documentElement;
  const toggle = document.querySelector(".theme");
  const current = () => root.dataset.theme || "dark"; // dark unless the visitor picked light
  const label = () => { if (toggle) toggle.textContent = current() === "dark" ? "☀" : "☾"; };
  label();
  toggle?.addEventListener("click", () => {
    root.dataset.theme = current() === "dark" ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch { /* private mode */ }
    label();
  });

  // Every [role=tablist] is its own group (WAI-ARIA tabs; arrow keys move between tabs).
  document.querySelectorAll('[role="tablist"]').forEach((list) => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) {
          panel.hidden = !on;
          panel.querySelectorAll("video[data-autoplay]").forEach((v) => (on && !v.closest("[hidden]") ? v.play().catch(() => {}) : v.pause()));
        }
      });
      if (focus) tab.focus();
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(tab));
      tab.addEventListener("keydown", (e) => {
        const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (step) select(tabs[(i + step + tabs.length) % tabs.length], true);
      });
    });
    list.selectTab = (id) => { const t = tabs.find((x) => x.id === id); if (t) select(t); };
  });

  // Visitors see their own platform first.
  const ua = navigator.userAgent || "";
  const plat = /iPhone|iPad/.test(ua) ? "iphone" : /Mac/.test(ua) ? "mac" : /Linux|X11/.test(ua) ? "linux" : null;
  if (plat) {
    document.getElementById("platform-tabs")?.selectTab?.(`tab-${plat}`);
    if (plat !== "iphone") document.getElementById("key-tabs")?.selectTab?.(`key-${plat}`);
  }

  // Copy buttons on terminal snippets.
  document.querySelectorAll(".snippet").forEach((box) => {
    const btn = document.createElement("button");
    btn.className = "copy"; btn.type = "button"; btn.textContent = "Copy";
    btn.addEventListener("click", async () => {
      const text = [...box.querySelectorAll("pre .c")].map((c) => c.textContent).join("\n");
      try { await navigator.clipboard.writeText(text); btn.textContent = "Copied"; }
      catch { btn.textContent = "Select + copy"; }
      setTimeout(() => { btn.textContent = "Copy"; }, 1600);
    });
    box.append(btn);
  });

  // Demo videos play only on screen, and not at all when the visitor prefers reduced motion.
  const videos = document.querySelectorAll("video[data-autoplay]");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { videos.forEach((v) => { v.controls = true; }); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting && !target.closest("[hidden]")) target.play().catch(() => { target.controls = true; });
      else target.pause();
    });
  }, { threshold: 0.25 });
  videos.forEach((v) => io.observe(v));
})();
