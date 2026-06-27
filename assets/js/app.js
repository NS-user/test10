/* ============================================================
   DevViz — アプリ本体（ナビ / ルーティング / テーマ / 進捗）
   ============================================================ */
(function () {
  "use strict";

  const concepts = window.CONCEPTS || [];
  const byId = Object.fromEntries(concepts.map((c) => [c.id, c]));

  const els = {
    navList: document.getElementById("navList"),
    hero: document.getElementById("hero"),
    heroGrid: document.getElementById("heroGrid"),
    concept: document.getElementById("concept"),
    search: document.getElementById("search"),
    progressText: document.getElementById("progressText"),
    progressFill: document.getElementById("progressFill"),
    sidebar: document.getElementById("sidebar"),
    backdrop: document.getElementById("backdrop"),
    menuToggle: document.getElementById("menuToggle"),
    themeToggle: document.getElementById("themeToggle"),
    startBtn: document.getElementById("startBtn"),
  };

  /* ---------- 学習済みの管理（localStorage） ---------- */
  const STORE_KEY = "devviz.visited";
  let visited = new Set();
  try { visited = new Set(JSON.parse(localStorage.getItem(STORE_KEY) || "[]")); } catch (e) {}
  function saveVisited() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify([...visited])); } catch (e) {}
  }

  /* ---------- テーマ ---------- */
  const THEME_KEY = "devviz.theme";
  function applyTheme(t) {
    if (t === "light") document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
    els.themeToggle.textContent = t === "light" ? "☀️" : "🌙";
  }
  let theme = localStorage.getItem(THEME_KEY) || "dark";
  applyTheme(theme);
  els.themeToggle.addEventListener("click", () => {
    theme = theme === "light" ? "dark" : "light";
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
  });

  /* ---------- サイドバー（モバイル） ---------- */
  function openSidebar(open) {
    els.sidebar.classList.toggle("open", open);
    els.backdrop.classList.toggle("show", open);
    els.menuToggle.setAttribute("aria-expanded", String(open));
  }
  els.menuToggle.addEventListener("click", () => openSidebar(!els.sidebar.classList.contains("open")));
  els.backdrop.addEventListener("click", () => openSidebar(false));

  /* ---------- ナビ構築（グループ分け） ---------- */
  function buildNav(filter) {
    els.navList.innerHTML = "";
    const groups = {};
    concepts.forEach((c) => {
      if (filter && !matches(c, filter)) return;
      (groups[c.group] = groups[c.group] || []).push(c);
    });
    const groupNames = Object.keys(groups);
    if (groupNames.length === 0) {
      els.navList.appendChild(
        Object.assign(document.createElement("li"), {
          className: "nav-group-title", textContent: "該当なし",
        })
      );
      return;
    }
    groupNames.forEach((g) => {
      const title = document.createElement("li");
      title.className = "nav-group-title";
      title.textContent = g;
      els.navList.appendChild(title);
      groups[g].forEach((c) => els.navList.appendChild(navItem(c)));
    });
    highlightActive();
  }

  function matches(c, q) {
    q = q.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      (c.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }

  function navItem(c) {
    const li = document.createElement("li");
    li.className = "nav-item" + (visited.has(c.id) ? " done" : "");
    li.dataset.id = c.id;
    li.innerHTML =
      `<span class="nav-icon">${c.icon}</span>` +
      `<span class="nav-label">${c.title}</span>` +
      `<span class="nav-check">✓</span>`;
    li.addEventListener("click", () => {
      location.hash = c.id;
      openSidebar(false);
    });
    return li;
  }

  /* ---------- ヒーローのカード ---------- */
  function buildHero() {
    els.heroGrid.innerHTML = "";
    concepts.forEach((c) => {
      const card = document.createElement("div");
      card.className = "hero-card";
      card.innerHTML =
        `<div class="hc-icon">${c.icon}</div>` +
        `<div class="hc-title">${c.title}</div>` +
        `<div class="hc-desc">${c.summary}</div>`;
      card.addEventListener("click", () => (location.hash = c.id));
      els.heroGrid.appendChild(card);
    });
  }

  /* ---------- 進捗 ---------- */
  function updateProgress() {
    const total = concepts.length;
    const done = concepts.filter((c) => visited.has(c.id)).length;
    els.progressText.textContent = `学習: ${done} / ${total}`;
    els.progressFill.style.width = total ? (done / total) * 100 + "%" : "0";
  }

  /* ---------- 概念ページ描画 ---------- */
  function renderConcept(c) {
    const idx = concepts.findIndex((x) => x.id === c.id);
    const prev = concepts[idx - 1];
    const next = concepts[idx + 1];

    els.concept.innerHTML = "";
    const head = document.createElement("div");
    head.className = "concept-head";
    head.innerHTML =
      `<div class="concept-eyebrow">${c.icon} ${c.group}</div>` +
      `<h1>${c.title}</h1>` +
      `<p class="concept-summary">${c.summary}</p>` +
      `<div class="concept-tags">${(c.tags || []).map((t) => `<span class="tag">#${t}</span>`).join("")}</div>`;
    els.concept.appendChild(head);

    const bodyWrap = document.createElement("div");
    bodyWrap.innerHTML = c.body;
    els.concept.appendChild(bodyWrap);

    // デモをマウント
    if (c.demo && typeof window[c.demo] === "function") {
      const demoHost = document.createElement("div");
      els.concept.appendChild(demoHost);
      try { window[c.demo](demoHost); }
      catch (e) {
        demoHost.innerHTML = `<div class="callout warn">デモの読み込みに失敗しました: ${e.message}</div>`;
      }
    }

    // 前後ナビ
    const nav = document.createElement("div");
    nav.className = "concept-nav";
    nav.appendChild(navButton(prev, "← 前の用語", false));
    nav.appendChild(navButton(next, "次の用語 →", true));
    els.concept.appendChild(nav);

    els.hero.hidden = true;
    els.concept.hidden = false;

    // 学習済みに記録
    if (!visited.has(c.id)) {
      visited.add(c.id);
      saveVisited();
      updateProgress();
      const item = els.navList.querySelector(`[data-id="${c.id}"]`);
      if (item) item.classList.add("done");
    }
    highlightActive();
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = `${c.title} — DevViz`;
  }

  function navButton(target, label, isNext) {
    const btn = document.createElement("button");
    btn.className = "btn" + (isNext ? " next" : "");
    if (!target) {
      btn.disabled = true;
      btn.style.opacity = ".4";
      btn.innerHTML = `<span class="cn-label">${label}</span><span class="cn-title">—</span>`;
    } else {
      btn.innerHTML = `<span class="cn-label">${label}</span><span class="cn-title">${target.icon} ${target.title}</span>`;
      btn.addEventListener("click", () => (location.hash = target.id));
    }
    return btn;
  }

  function showHero() {
    els.concept.hidden = true;
    els.hero.hidden = false;
    highlightActive();
    document.title = "DevViz — 動かして学ぶ開発用語";
  }

  function highlightActive() {
    const id = (location.hash || "").replace("#", "");
    els.navList.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.toggle("active", item.dataset.id === id);
    });
  }

  /* ---------- ルーティング ---------- */
  function route() {
    const id = (location.hash || "").replace("#", "");
    if (id && byId[id]) renderConcept(byId[id]);
    else showHero();
  }
  window.addEventListener("hashchange", route);

  /* ---------- 検索 ---------- */
  els.search.addEventListener("input", () => buildNav(els.search.value.trim()));

  /* ---------- スタートボタン ---------- */
  els.startBtn.addEventListener("click", () => {
    location.hash = concepts[0].id;
  });

  /* ---------- 初期化 ---------- */
  buildNav("");
  buildHero();
  updateProgress();
  route();
})();
