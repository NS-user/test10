/* ============================================================
   DevViz — インタラクティブ・デモ集
   各 mountXxxDemo(el) は、与えられた要素にデモを描画する。
   ============================================================ */

(function () {
  "use strict";

  /* 小さなヘルパ */
  function h(tag, attrs, children) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === "class") el.className = attrs[k];
        else if (k === "html") el.innerHTML = attrs[k];
        else if (k.startsWith("on") && typeof attrs[k] === "function")
          el.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        else el.setAttribute(k, attrs[k]);
      }
    }
    (children || []).forEach((c) =>
      el.appendChild(typeof c === "string" ? document.createTextNode(c) : c)
    );
    return el;
  }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function demoShell(title, badge) {
    const stage = h("div", { class: "demo-stage" });
    const panel = h("div", { class: "demo" }, [
      h("div", { class: "demo-head" }, [
        h("span", { class: "demo-badge" }, [badge || "DEMO"]),
        h("span", { class: "demo-title" }, [title]),
      ]),
      stage,
    ]);
    return { panel, stage };
  }

  /* ========================================================
     DOM デモ — ツリーをクリックするとプレビューが光る
     ======================================================== */
  window.mountDomDemo = function (root) {
    const { panel, stage } = demoShell("DOMツリーを触ってみる", "INTERACTIVE");

    const tree = {
      tag: "body", children: [
        { tag: "header", children: [{ tag: "h1", text: "DevViz" }] },
        { tag: "main", children: [
          { tag: "p", text: "段落テキスト" },
          { tag: "button", text: "ボタン" },
        ]},
      ],
    };

    const previewWrap = h("div", { class: "dom-preview" });
    const nodeMap = new Map();

    function renderPreview() {
      previewWrap.innerHTML = "";
      function build(node) {
        let el;
        if (node.tag === "h1") el = h("h1", { style: "margin:0;font-size:1.3rem" }, [node.text]);
        else if (node.tag === "p") el = h("p", { style: "margin:6px 0" }, [node.text]);
        else if (node.tag === "button") el = h("button", { class: "btn btn-sm" }, [node.text]);
        else el = h("div", { style: "padding:4px 0" });
        if (node.children) node.children.forEach((c) => el.appendChild(build(c)));
        nodeMap.set(node, el);
        return el;
      }
      previewWrap.appendChild(build(tree));
    }

    function renderTree(node, container) {
      const label = node.text
        ? `<${node.tag}> ${node.text}`
        : `<${node.tag}>`;
      const nodeEl = h("div", { class: "dom-node", html: label });
      nodeEl.addEventListener("click", () => {
        const target = nodeMap.get(node);
        if (target) {
          target.classList.add("flash");
          nodeEl.classList.add("flash");
          setTimeout(() => {
            target.classList.remove("flash");
            nodeEl.classList.remove("flash");
          }, 700);
        }
      });
      container.appendChild(nodeEl);
      if (node.children && node.children.length) {
        const kids = h("div", { class: "dom-children" });
        node.children.forEach((c) => renderTree(c, kids));
        container.appendChild(kids);
      }
    }

    const treeWrap = h("div", { class: "dom-tree" });
    renderTree(tree, treeWrap);
    renderPreview();

    stage.appendChild(
      h("p", { class: "lead", style: "margin-top:0" }, [
        "↓ ツリーのノードをクリックすると、右の実際の表示がハイライトされます。",
      ])
    );
    stage.appendChild(
      h("div", { style: "display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start" }, [
        h("div", {}, [h("div", { style: "font-size:.78rem;color:var(--text-dim);margin-bottom:6px" }, ["DOMツリー"]), treeWrap]),
        h("div", {}, [h("div", { style: "font-size:.78rem;color:var(--text-dim);margin-bottom:6px" }, ["実際の表示"]), previewWrap]),
      ])
    );
    root.appendChild(panel);
  };

  /* ========================================================
     React デモ — state更新・再レンダー・仮想DOM差分
     ======================================================== */
  window.mountReactDemo = function (root) {
    const { panel, stage } = demoShell("state を更新して再レンダーを観察", "INTERACTIVE");
    let count = 0;
    let renders = 0;

    const display = h("div", { class: "react-counter-display" }, ["0"]);
    const renderInfo = h("div", { class: "render-count" }, ["再レンダー: 0 回"]);
    const vdomWrap = h("div", {});

    function paintVdom(changed) {
      vdomWrap.innerHTML = "";
      vdomWrap.appendChild(h("div", { class: "vdom-node" }, ['<div className="counter">']));
      vdomWrap.appendChild(
        h("div", { class: "vdom-node" + (changed ? " changed" : ""), style: "margin-left:18px" }, [
          `  <span> ${count} 回クリック </span>`,
        ])
      );
      vdomWrap.appendChild(h("div", { class: "vdom-node" }, ["</div>"]));
    }
    paintVdom(false);

    function update(delta) {
      count += delta;
      renders++;
      display.textContent = String(count);
      renderInfo.textContent = `再レンダー: ${renders} 回`;
      paintVdom(true);
      setTimeout(() => paintVdom(false), 600);
    }

    stage.appendChild(
      h("div", { class: "react-demo" }, [
        h("div", { class: "react-state-box" }, [
          h("div", { style: "font-size:.78rem;color:var(--text-dim)" }, ["state（いまの値）"]),
          display,
          h("div", { class: "demo-controls", style: "justify-content:center" }, [
            h("button", { class: "btn btn-sm btn-primary", onClick: () => update(1) }, ["+1 (setCount)"]),
            h("button", { class: "btn btn-sm", onClick: () => update(-1) }, ["-1"]),
            h("button", { class: "btn btn-sm", onClick: () => { count = 0; renders++; display.textContent = "0"; renderInfo.textContent = `再レンダー: ${renders} 回`; paintVdom(true); setTimeout(()=>paintVdom(false),600);} }, ["reset"]),
          ]),
          renderInfo,
        ]),
        h("div", { class: "react-render-box" }, [
          h("div", { style: "font-size:.78rem;color:var(--text-dim);margin-bottom:8px" }, ["仮想DOM（差分が光る）"]),
          vdomWrap,
          h("p", { style: "font-size:.78rem;color:var(--text-dim);margin-bottom:0" }, [
            "stateが変わった部分だけが再計算され、本物のDOMに反映されます。",
          ]),
        ]),
      ])
    );
    root.appendChild(panel);
  };

  /* ========================================================
     非同期デモ — 同期 vs 非同期(並行) のタイムライン比較
     ======================================================== */
  window.mountAsyncDemo = function (root) {
    const { panel, stage } = demoShell("同期 vs 非同期 のタイムライン", "ANIMATION");
    const tasks = [
      { label: "タスクA", dur: 1500, color: "var(--accent)" },
      { label: "タスクB", dur: 1000, color: "var(--accent-2)" },
      { label: "タスクC", dur: 800, color: "var(--accent-3)" },
    ];
    const timeline = h("div", { class: "timeline" });
    const totalOut = h("div", { class: "field-out", style: "margin-top:10px" }, [""]);

    function buildRows(mode) {
      timeline.innerHTML = "";
      const SCALE = 0.12; // ms -> px
      let syncCursor = 0;
      const rows = tasks.map((t) => {
        const track = h("div", { class: "tl-track" });
        const bar = h("div", { class: "tl-bar", style: `background:${t.color};left:0;width:0` }, [t.dur + "ms"]);
        track.appendChild(bar);
        timeline.appendChild(h("div", { class: "tl-row" }, [h("div", { class: "tl-label" }, [t.label]), track]));
        return { t, bar, start: 0 };
      });
      if (mode === "sync") {
        rows.forEach((r) => { r.start = syncCursor; syncCursor += r.t.dur; });
      } else {
        rows.forEach((r) => { r.start = 0; });
      }
      return { rows, SCALE, total: mode === "sync" ? syncCursor : Math.max(...tasks.map((t) => t.dur)) };
    }

    async function animate(mode) {
      const { rows, SCALE, total } = buildRows(mode);
      totalOut.textContent = "";
      const t0 = performance.now();
      await Promise.all(
        rows.map(async (r) => {
          await sleep(r.start);
          const startTime = performance.now();
          const dur = r.t.dur;
          return new Promise((resolve) => {
            function step(now) {
              const p = Math.min(1, (now - startTime) / dur);
              r.bar.style.width = (dur * SCALE * p) + "px";
              r.bar.style.left = (r.start * SCALE) + "px";
              if (p < 1) requestAnimationFrame(step);
              else resolve();
            }
            requestAnimationFrame(step);
          });
        })
      );
      const elapsed = Math.round(performance.now() - t0);
      totalOut.textContent = `合計時間 ≈ ${total}ms（${mode === "sync" ? "順番に待った" : "並行に走らせた"}）`;
    }

    stage.appendChild(
      h("div", { class: "demo-controls" }, [
        h("button", { class: "btn btn-sm btn-primary", onClick: () => animate("sync") }, ["▶ 同期（順番に）"]),
        h("button", { class: "btn btn-sm btn-primary", onClick: () => animate("async") }, ["▶ 非同期（並行に）"]),
      ])
    );
    stage.appendChild(timeline);
    stage.appendChild(totalOut);
    buildRows("sync");
    root.appendChild(panel);
  };

  /* ========================================================
     イベントループ デモ — スタック/キュー/出力をステップ表示
     ======================================================== */
  window.mountEventLoopDemo = function (root) {
    const { panel, stage } = demoShell("console.log の順番を追う", "STEP");

    const stackBox = h("div", { class: "el-box" }, [h("h4", {}, ["コールスタック"])]);
    const microBox = h("div", { class: "el-box" }, [h("h4", {}, ["マイクロタスク"])]);
    const taskBox = h("div", { class: "el-box" }, [h("h4", {}, ["タスクキュー"])]);
    const output = h("div", { class: "el-output" }, []);

    function clearBoxes() {
      [stackBox, microBox, taskBox].forEach((b) => {
        b.querySelectorAll(".el-item").forEach((x) => x.remove());
      });
      output.innerHTML = "";
    }
    function add(box, cls, text) {
      const item = h("div", { class: "el-item " + cls }, [text]);
      box.appendChild(item);
      return item;
    }
    function out(text) {
      output.appendChild(h("div", { class: "out-line" }, ["▶ " + text]));
    }

    async function run() {
      clearBoxes();
      const STEP = 850;
      // main() がスタックに
      const main = add(stackBox, "callstack running", "main()");
      await sleep(STEP);
      // console.log(1)
      const l1 = add(stackBox, "callstack running", "console.log(1)");
      await sleep(STEP); out("1"); l1.remove();
      // setTimeout -> task queue
      const st = add(stackBox, "callstack running", "setTimeout(cb)");
      await sleep(STEP); st.remove();
      const task = add(taskBox, "queue", "() => log(2)");
      await sleep(STEP);
      // Promise.then -> microtask
      const pr = add(stackBox, "callstack running", "Promise.then(cb)");
      await sleep(STEP); pr.remove();
      const micro = add(microBox, "micro", "() => log(3)");
      await sleep(STEP);
      // console.log(4)
      const l4 = add(stackBox, "callstack running", "console.log(4)");
      await sleep(STEP); out("4"); l4.remove();
      // main 終了 -> スタック空
      main.remove();
      await sleep(STEP);
      // マイクロタスク優先
      micro.classList.add("running");
      await sleep(STEP); out("3"); micro.remove();
      await sleep(STEP);
      // タスクキュー
      task.classList.add("running");
      await sleep(STEP); out("2"); task.remove();
      await sleep(STEP);
      out("→ 出力順: 1, 4, 3, 2");
    }

    stage.appendChild(
      h("div", { class: "demo-controls" }, [
        h("button", { class: "btn btn-sm btn-primary", onClick: run }, ["▶ ステップ実行"]),
      ])
    );
    stage.appendChild(h("div", { class: "eventloop" }, [stackBox, microBox, taskBox]));
    stage.appendChild(h("div", { style: "font-size:.78rem;color:var(--text-dim);margin-top:8px" }, ["出力:"]));
    stage.appendChild(output);
    root.appendChild(panel);
  };

  /* ========================================================
     HTTP デモ — メソッドを選んでパケットを飛ばす
     ======================================================== */
  window.mountHttpDemo = function (root) {
    const { panel, stage } = demoShell("リクエストとレスポンスの往復", "ANIMATION");

    const responses = {
      GET: { code: 200, text: '{ "id": 1, "name": "さくら" }', note: "ユーザー情報を取得" },
      POST: { code: 201, text: '{ "id": 7, "created": true }', note: "新規ユーザーを作成" },
      PUT: { code: 200, text: '{ "id": 1, "updated": true }', note: "ユーザーを更新" },
      DELETE: { code: 204, text: "(本文なし)", note: "ユーザーを削除" },
    };

    const select = h("select", { class: "demo-select" },
      Object.keys(responses).map((m) => h("option", { value: m }, [m]))
    );
    const wire = h("div", { class: "http-wire" });
    const packet = h("div", { class: "http-packet req" }, []);
    wire.appendChild(packet);
    const log = h("div", { class: "http-log" }, []);

    const clientNode = h("div", { class: "http-node" }, [
      h("div", { class: "hn-icon" }, ["💻"]),
      h("div", { class: "hn-label" }, ["クライアント"]),
      h("div", { class: "hn-sub" }, ["ブラウザ"]),
    ]);
    const serverNode = h("div", { class: "http-node" }, [
      h("div", { class: "hn-icon" }, ["🖥️"]),
      h("div", { class: "hn-label" }, ["サーバー"]),
      h("div", { class: "hn-sub" }, ["api.example.com"]),
    ]);

    function logLine(cls, text) {
      log.appendChild(h("div", { class: cls }, [text]));
      log.scrollTop = log.scrollHeight;
    }

    let busy = false;
    async function send() {
      if (busy) return;
      busy = true;
      const method = select.value;
      const r = responses[method];
      logLine("com-l", `// ${r.note}`);
      logLine("req-l", `→ ${method} /users/1  HTTP/1.1`);

      // リクエスト: client -> server
      packet.className = "http-packet req";
      packet.textContent = "›";
      packet.style.opacity = "1";
      await animatePacket(0, 1);
      await sleep(350);
      logLine("com-l", "  …サーバーが処理中");

      // レスポンス: server -> client
      packet.className = "http-packet res";
      packet.textContent = "‹";
      await animatePacket(1, 0);
      packet.style.opacity = "0";
      logLine("res-l", `← ${r.code} ${statusText(r.code)}`);
      logLine("res-l", `  ${r.text}`);
      logLine("com-l", "—");
      busy = false;
    }

    function statusText(code) {
      return ({ 200: "OK", 201: "Created", 204: "No Content", 404: "Not Found" })[code] || "";
    }

    function animatePacket(from, to) {
      return new Promise((resolve) => {
        const t0 = performance.now();
        const dur = 700;
        function step(now) {
          const p = Math.min(1, (now - t0) / dur);
          const pos = from + (to - from) * p;
          packet.style.left = `calc(${pos * 100}% - 12px)`;
          if (p < 1) requestAnimationFrame(step);
          else resolve();
        }
        requestAnimationFrame(step);
      });
    }

    stage.appendChild(
      h("div", { class: "demo-controls" }, [
        h("span", { style: "font-size:.85rem;color:var(--text-dim)" }, ["メソッド:"]),
        select,
        h("button", { class: "btn btn-sm btn-primary", onClick: send }, ["▶ 送信"]),
      ])
    );
    stage.appendChild(h("div", { class: "http-stage" }, [clientNode, wire, serverNode]));
    stage.appendChild(log);
    root.appendChild(panel);
  };

  /* ========================================================
     Node.js デモ — 擬似サーバーにリクエストを送る
     ======================================================== */
  window.mountNodeDemo = function (root) {
    const { panel, stage } = demoShell("Node.js サーバーを動かす（擬似）", "INTERACTIVE");

    const routes = {
      "/": () => ({ status: 200, body: "Hello from Node!" }),
      "/time": () => ({ status: 200, body: "現在時刻: " + new Date().toLocaleTimeString("ja-JP") }),
      "/users": () => ({ status: 200, body: JSON.stringify([{ id: 1 }, { id: 2 }]) }),
      "/secret": () => ({ status: 403, body: "Forbidden" }),
    };

    const select = h("select", { class: "demo-select" },
      Object.keys(routes).map((p) => h("option", { value: p }, ["GET " + p]))
    );
    const term = h("div", { class: "http-log", style: "max-height:200px" }, [
      h("div", { class: "com-l" }, ["$ node server.js"]),
      h("div", { class: "res-l" }, ["Server listening on :3000"]),
    ]);

    function line(cls, text) {
      term.appendChild(h("div", { class: cls }, [text]));
      term.scrollTop = term.scrollHeight;
    }

    async function request() {
      const path = select.value;
      line("req-l", `→ GET http://localhost:3000${path}`);
      await sleep(300);
      line("com-l", "  [event loop] リクエストを受信、ハンドラを実行");
      await sleep(400);
      const res = routes[path]();
      const cls = res.status === 200 ? "res-l" : "com-l";
      line(cls, `← ${res.status}  ${res.body}`);
      line("com-l", "—");
    }

    stage.appendChild(
      h("p", { class: "lead", style: "margin-top:0" }, [
        "ルートを選んで「リクエスト」を押すと、Node.jsサーバーが応答する様子を再現します。",
      ])
    );
    stage.appendChild(
      h("div", { class: "demo-controls" }, [
        select,
        h("button", { class: "btn btn-sm btn-primary", onClick: request }, ["▶ リクエスト"]),
      ])
    );
    stage.appendChild(term);
    root.appendChild(panel);
  };

  /* ========================================================
     Git デモ — コミット/ブランチ/マージで履歴グラフを育てる
     ======================================================== */
  window.mountGitDemo = function (root) {
    const { panel, stage } = demoShell("コミット履歴を育てる", "INTERACTIVE");

    let history = [{ type: "commit", branch: "main", msg: "initial commit" }];
    let onFeature = false;
    let hashCounter = 0;
    const graph = h("div", { class: "git-graph" });

    function hash() {
      hashCounter++;
      return (0xa10 + hashCounter * 37).toString(16).slice(0, 7).padStart(7, "0");
    }
    const hashes = [];

    function render() {
      graph.innerHTML = "";
      history.forEach((c, i) => {
        if (!hashes[i]) hashes[i] = hash();
        const dotCls = c.branch === "feature" ? "feature" : c.type === "merge" ? "merge" : "";
        const indent = c.branch === "feature" ? "margin-left:26px" : "";
        graph.appendChild(
          h("div", { class: "git-row", style: indent }, [
            h("span", { class: "git-dot " + dotCls }, []),
            h("span", { class: "git-branch-label" }, [c.branch]),
            h("span", { class: "git-hash" }, [hashes[i]]),
            h("span", { class: "git-msg" }, [c.msg]),
          ])
        );
      });
    }

    const msgInput = h("input", {
      class: "demo-select", style: "flex:1;min-width:140px", placeholder: "コミットメッセージ", value: "機能を追加",
    });

    function commit() {
      const branch = onFeature ? "feature" : "main";
      history.push({ type: "commit", branch, msg: msgInput.value || "update" });
      render();
    }
    function branch() {
      if (onFeature) return;
      onFeature = true;
      history.push({ type: "commit", branch: "feature", msg: "(feature ブランチ作成)" });
      updateButtons();
      render();
    }
    function merge() {
      if (!onFeature) return;
      onFeature = false;
      history.push({ type: "merge", branch: "main", msg: "Merge branch 'feature'" });
      updateButtons();
      render();
    }
    function reset() {
      history = [{ type: "commit", branch: "main", msg: "initial commit" }];
      hashes.length = 0; hashCounter = 0; onFeature = false;
      updateButtons(); render();
    }

    const branchBtn = h("button", { class: "btn btn-sm", onClick: branch }, ["🔀 ブランチ作成"]);
    const mergeBtn = h("button", { class: "btn btn-sm", onClick: merge }, ["⬇ マージ"]);
    function updateButtons() {
      branchBtn.disabled = onFeature;
      mergeBtn.disabled = !onFeature;
      branchBtn.style.opacity = onFeature ? ".5" : "1";
      mergeBtn.style.opacity = onFeature ? "1" : ".5";
    }

    stage.appendChild(
      h("div", { class: "demo-controls" }, [
        msgInput,
        h("button", { class: "btn btn-sm btn-primary", onClick: commit }, ["✓ コミット"]),
        branchBtn, mergeBtn,
        h("button", { class: "btn btn-sm", onClick: reset }, ["↺ リセット"]),
      ])
    );
    stage.appendChild(graph);
    updateButtons();
    render();
    root.appendChild(panel);
  };

  /* ========================================================
     Flexbox デモ — プロパティを切り替えてレイアウト確認
     ======================================================== */
  window.mountFlexboxDemo = function (root) {
    const { panel, stage } = demoShell("Flexbox プレイグラウンド", "PLAYGROUND");

    const props = {
      "flex-direction": ["row", "row-reverse", "column", "column-reverse"],
      "justify-content": ["flex-start", "center", "flex-end", "space-between", "space-around"],
      "align-items": ["stretch", "flex-start", "center", "flex-end"],
    };
    const state = { "flex-direction": "row", "justify-content": "flex-start", "align-items": "stretch" };

    const flexStage = h("div", { class: "flex-stage" },
      ["1", "2", "3"].map((n) => h("div", { class: "flex-item" }, [n]))
    );
    const cssOut = h("pre", { class: "code", style: "margin-bottom:0" }, []);

    function apply() {
      flexStage.style.flexDirection = state["flex-direction"];
      flexStage.style.justifyContent = state["justify-content"];
      flexStage.style.alignItems = state["align-items"];
      cssOut.textContent =
        ".container {\n  display: flex;\n" +
        Object.keys(state).map((k) => `  ${k}: ${state[k]};`).join("\n") +
        "\n}";
    }

    const controls = h("div", { class: "flex-controls" },
      Object.keys(props).map((key) => {
        const sel = h("select", {},
          props[key].map((v) => h("option", { value: v }, [v]))
        );
        sel.addEventListener("change", () => { state[key] = sel.value; apply(); });
        return h("div", { class: "flex-control" }, [
          h("label", {}, [key]),
          sel,
        ]);
      })
    );

    stage.appendChild(controls);
    stage.appendChild(flexStage);
    stage.appendChild(h("div", { style: "font-size:.78rem;color:var(--text-dim);margin-top:10px" }, ["生成されるCSS:"]));
    stage.appendChild(cssOut);
    apply();
    root.appendChild(panel);
  };

  /* ========================================================
     変数・型 デモ — 入力値の型を判定して操作例を表示
     ======================================================== */
  window.mountVariablesDemo = function (root) {
    const { panel, stage } = demoShell("値を入れて typeof を見る", "INTERACTIVE");

    const examples = ['"さくら"', "42", "true", "[1, 2, 3]", '{ id: 1 }', "3.14"];
    const input = h("input", {
      class: "demo-select", style: "flex:1;min-width:160px",
      value: '"さくら"', placeholder: 'JS値（例: 42, true, [1,2]）',
    });
    const out = h("div", { style: "margin-top:12px" }, []);

    function parseValue(src) {
      // 安全にリテラルだけ評価（Functionは使うがUI内デモのため）
      try {
        // 文字列・数値・真偽・配列・オブジェクトのリテラルを想定
        return { ok: true, value: Function('"use strict";return (' + src + ")")() };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    }

    function describe(v) {
      const t = Array.isArray(v) ? "array" : typeof v;
      const tips = {
        string: ["連結できる: " + JSON.stringify(v) + ' + "!" → ' + JSON.stringify(v + "!"), "長さ: " + ('"' + v + '".length → ' + String(v).length)],
        number: ["計算できる: " + v + " * 2 → " + v * 2, "偶数? : " + (v % 2 === 0)],
        boolean: ["否定: !" + v + " → " + (!v), "条件分岐に使える"],
        array: ["要素数: .length → " + v.length, "先頭: [0] → " + JSON.stringify(v[0])],
        object: ["キー一覧: Object.keys → " + JSON.stringify(Object.keys(v)), "プロパティ参照ができる"],
        undefined: ["未定義の値"],
      };
      return { t, tips: tips[t] || ["（対応する操作例なし）"] };
    }

    function evaluate() {
      const r = parseValue(input.value.trim());
      out.innerHTML = "";
      if (!r.ok) {
        out.appendChild(h("div", { class: "callout warn" }, [
          h("div", { class: "callout-title" }, ["パースできませんでした"]),
          h("div", { style: "font-family:var(--mono);font-size:.82rem" }, [r.error]),
        ]));
        return;
      }
      const d = describe(r.value);
      out.appendChild(
        h("div", { class: "callout tip" }, [
          h("div", {}, [
            h("span", { style: "font-size:.8rem;color:var(--text-dim)" }, ["typeof の結果: "]),
            h("code", { class: "inline" }, [d.t]),
          ]),
          h("ul", { style: "margin:8px 0 0" }, d.tips.map((t) => h("li", { class: "field-out", style: "color:var(--text)" }, [t]))),
        ])
      );
    }

    input.addEventListener("keydown", (e) => { if (e.key === "Enter") evaluate(); });

    stage.appendChild(
      h("div", { class: "demo-controls" }, [
        input,
        h("button", { class: "btn btn-sm btn-primary", onClick: evaluate }, ["判定する"]),
      ])
    );
    stage.appendChild(
      h("div", { style: "display:flex;gap:6px;flex-wrap:wrap;margin-bottom:4px" },
        examples.map((ex) => h("button", {
          class: "btn btn-sm", style: "font-family:var(--mono);font-size:.78rem",
          onClick: () => { input.value = ex; evaluate(); },
        }, [ex]))
      )
    );
    stage.appendChild(out);
    evaluate();
    root.appendChild(panel);
  };

  /* 数値フォーマット（円） */
  function yen(n) {
    return "¥" + Math.round(n).toLocaleString("ja-JP");
  }
  function rangeRow(label, min, max, value, step, onInput, fmt) {
    const out = h("span", { class: "field-out" }, [fmt ? fmt(value) : String(value)]);
    const input = h("input", {
      type: "range", class: "demo-range", min, max, step, value,
      style: "flex:1;min-width:120px;accent-color:var(--accent)",
    });
    input.addEventListener("input", () => {
      const v = Number(input.value);
      out.textContent = fmt ? fmt(v) : String(v);
      onInput(v);
    });
    const row = h("div", { style: "display:flex;align-items:center;gap:12px;margin:10px 0" }, [
      h("span", { style: "width:130px;font-size:.85rem;color:var(--text-dim)" }, [label]),
      input, out,
    ]);
    return row;
  }

  /* ========================================================
     ARR / MRR 計算機
     ======================================================== */
  window.mountArrDemo = function (root) {
    const { panel, stage } = demoShell("ARR / MRR 計算機", "CALCULATOR");
    const state = { price: 10000, customers: 100 };

    const mrrOut = h("div", { class: "react-counter-display", style: "font-size:1.6rem" }, []);
    const arrOut = h("div", { class: "react-counter-display", style: "color:var(--accent-3)" }, []);
    const note = h("p", { class: "lead", style: "margin:6px 0 0;font-size:.85rem" }, []);

    function recalc() {
      const mrr = state.price * state.customers;
      const arr = mrr * 12;
      mrrOut.textContent = yen(mrr) + " / 月";
      arrOut.textContent = yen(arr) + " / 年";
      const toOku = (1e8 / (state.price * 12));
      note.textContent =
        `この単価なら、ARR 1億円に必要な顧客数 ≒ ${Math.ceil(toOku).toLocaleString("ja-JP")} 社`;
    }

    stage.appendChild(rangeRow("月額（1社）", 500, 500000, state.price, 500,
      (v) => { state.price = v; recalc(); }, yen));
    stage.appendChild(rangeRow("顧客数", 1, 2000, state.customers, 1,
      (v) => { state.customers = v; recalc(); }, (v) => v.toLocaleString("ja-JP") + " 社"));
    stage.appendChild(
      h("div", { style: "display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px" }, [
        h("div", { class: "react-state-box" }, [
          h("div", { style: "font-size:.78rem;color:var(--text-dim);text-align:center" }, ["MRR（月間経常収益）"]), mrrOut,
        ]),
        h("div", { class: "react-state-box" }, [
          h("div", { style: "font-size:.78rem;color:var(--text-dim);text-align:center" }, ["ARR（年間経常収益）"]), arrOut,
        ]),
      ])
    );
    stage.appendChild(note);
    recalc();
    root.appendChild(panel);
  };

  /* ========================================================
     チャーン（解約率）— 顧客の減衰グラフ
     ======================================================== */
  window.mountChurnDemo = function (root) {
    const { panel, stage } = demoShell("チャーンで顧客がどう減るか", "ANIMATION");
    const state = { churn: 5, start: 1000 };
    const MONTHS = 24;

    const chart = h("div", {
      style: "display:flex;align-items:flex-end;gap:3px;height:160px;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:10px;margin-top:8px",
    });
    const summary = h("div", { class: "field-out", style: "margin-top:10px" }, []);

    function recalc() {
      chart.innerHTML = "";
      const r = state.churn / 100;
      let n = state.start;
      let halfMonth = null;
      for (let m = 0; m <= MONTHS; m++) {
        const cur = state.start * Math.pow(1 - r, m);
        if (halfMonth === null && cur <= state.start / 2) halfMonth = m;
        const hPct = (cur / state.start) * 100;
        const bar = h("div", {
          style: `flex:1;height:${hPct}%;border-radius:3px 3px 0 0;` +
            `background:linear-gradient(to top,var(--accent),var(--accent-2));` +
            `min-height:2px;transition:height .3s`,
          title: `${m}ヶ月後: ${Math.round(cur)}人`,
        });
        chart.appendChild(bar);
      }
      const end = Math.round(state.start * Math.pow(1 - r, MONTHS));
      const avgMonths = r > 0 ? Math.round(1 / r) : Infinity;
      summary.innerHTML =
        `24ヶ月後: <b>${end.toLocaleString("ja-JP")}人</b>（残り ${Math.round(end / state.start * 100)}%）　／　` +
        `半分になるまで: <b>${halfMonth !== null ? halfMonth + "ヶ月" : "—"}</b>　／　` +
        `平均継続: <b>${avgMonths === Infinity ? "∞" : "約" + avgMonths + "ヶ月"}</b>`;
    }

    stage.appendChild(rangeRow("月次チャーン率", 0, 20, state.churn, 0.5,
      (v) => { state.churn = v; recalc(); }, (v) => v + "%"));
    stage.appendChild(rangeRow("開始時の顧客数", 100, 5000, state.start, 100,
      (v) => { state.start = v; recalc(); }, (v) => v.toLocaleString("ja-JP") + "人"));
    stage.appendChild(h("div", { style: "font-size:.78rem;color:var(--text-dim);margin-top:6px" }, ["新規獲得ゼロと仮定した場合の、24ヶ月の顧客数推移:"]));
    stage.appendChild(chart);
    stage.appendChild(summary);
    recalc();
    root.appendChild(panel);
  };

  /* ========================================================
     LTV / CAC 採算チェッカー
     ======================================================== */
  window.mountLtvCacDemo = function (root) {
    const { panel, stage } = demoShell("LTV / CAC 採算チェッカー", "CALCULATOR");
    const state = { price: 10000, margin: 80, months: 24, cac: 50000 };

    const verdict = h("div", { style: "text-align:center;padding:14px;border-radius:10px;margin-top:14px;font-weight:700" }, []);
    const nums = h("div", { style: "display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:12px" }, []);

    function recalc() {
      const ltv = state.price * (state.margin / 100) * state.months;
      const cac = state.cac;
      const ratio = cac > 0 ? ltv / cac : Infinity;
      nums.innerHTML = "";
      const cells = [
        ["LTV（生涯価値）", yen(ltv), "var(--accent)"],
        ["CAC（獲得コスト）", yen(cac), "var(--warn)"],
        ["LTV ÷ CAC", (ratio === Infinity ? "∞" : ratio.toFixed(1)), "var(--accent-3)"],
      ];
      cells.forEach(([label, val, color]) => {
        nums.appendChild(h("div", { class: "react-state-box", style: "text-align:center" }, [
          h("div", { style: "font-size:.74rem;color:var(--text-dim)" }, [label]),
          h("div", { style: `font-size:1.2rem;font-weight:800;color:${color};margin-top:4px` }, [val]),
        ]));
      });
      let msg, bg, fg;
      if (ratio >= 3) { msg = "✅ 健全（3:1 をクリア）— 獲得コストを十分回収できています"; bg = "color-mix(in srgb,var(--accent-3) 18%,transparent)"; fg = "var(--accent-3)"; }
      else if (ratio >= 1) { msg = "⚠️ 要改善（1〜3）— 回収はできるが、もう一伸ばし欲しい水準"; bg = "color-mix(in srgb,var(--warn) 18%,transparent)"; fg = "var(--warn)"; }
      else { msg = "🚨 赤字構造（1未満）— 顧客を増やすほど損が膨らみます"; bg = "color-mix(in srgb,var(--danger) 18%,transparent)"; fg = "var(--danger)"; }
      verdict.style.background = bg;
      verdict.style.color = fg;
      verdict.textContent = msg;
    }

    stage.appendChild(rangeRow("月額", 500, 200000, state.price, 500, (v) => { state.price = v; recalc(); }, yen));
    stage.appendChild(rangeRow("粗利率", 10, 100, state.margin, 5, (v) => { state.margin = v; recalc(); }, (v) => v + "%"));
    stage.appendChild(rangeRow("平均継続月数", 1, 60, state.months, 1, (v) => { state.months = v; recalc(); }, (v) => v + "ヶ月"));
    stage.appendChild(rangeRow("CAC（獲得コスト）", 1000, 1000000, state.cac, 1000, (v) => { state.cac = v; recalc(); }, yen));
    stage.appendChild(nums);
    stage.appendChild(verdict);
    recalc();
    root.appendChild(panel);
  };

  /* ========================================================
     PMF 達成度メーター
     ======================================================== */
  window.mountPmfDemo = function (root) {
    const { panel, stage } = demoShell("PMF 達成度メーター", "INTERACTIVE");
    const signals = [
      { label: "解約が少なく使い続けられる", weight: 30 },
      { label: "口コミ・紹介で勝手に増える", weight: 25 },
      { label: "「無くなったら困る」が40%超", weight: 25 },
      { label: "作る前から需要に追われている", weight: 20 },
    ];
    const checked = new Set();

    const meterFill = h("div", {
      style: "height:100%;width:0;border-radius:99px;transition:width .4s,background .4s;background:var(--danger)",
    });
    const meterLabel = h("div", { style: "text-align:center;font-weight:800;margin-top:8px" }, []);

    function recalc() {
      let score = 0;
      signals.forEach((s, i) => { if (checked.has(i)) score += s.weight; });
      meterFill.style.width = score + "%";
      let color, text;
      if (score >= 80) { color = "var(--accent-3)"; text = `🎉 PMF達成ライン（${score}%）— 成長を加速できる段階`; }
      else if (score >= 50) { color = "var(--accent)"; text = `🌱 PMFが見えてきた（${score}%）— あと一歩`; }
      else if (score >= 25) { color = "var(--warn)"; text = `🔍 模索中（${score}%）— サインを増やそう`; }
      else { color = "var(--danger)"; text = `⛔ PMF前（${score}%）— まず“求められる状態”を作る`; }
      meterFill.style.background = color;
      meterLabel.textContent = text;
      meterLabel.style.color = color;
    }

    stage.appendChild(h("p", { class: "lead", style: "margin-top:0" }, ["当てはまるサインをONにすると、達成度メーターが動きます:"]));
    signals.forEach((s, i) => {
      const box = h("button", {
        class: "btn btn-sm",
        style: "display:flex;width:100%;justify-content:space-between;align-items:center;margin:6px 0;text-align:left",
      }, [
        h("span", {}, [s.label]),
        h("span", { class: "field-out" }, ["+" + s.weight + "%"]),
      ]);
      box.addEventListener("click", () => {
        if (checked.has(i)) { checked.delete(i); box.classList.remove("btn-primary"); }
        else { checked.add(i); box.classList.add("btn-primary"); }
        recalc();
      });
      stage.appendChild(box);
    });
    stage.appendChild(h("div", {
      style: "height:18px;background:var(--bg);border:1px solid var(--border);border-radius:99px;overflow:hidden;margin-top:14px",
    }, [meterFill]));
    stage.appendChild(meterLabel);
    recalc();
    root.appendChild(panel);
  };

  /* ========================================================
     資金調達ラウンド ラダー
     ======================================================== */
  window.mountFundingDemo = function (root) {
    const { panel, stage } = demoShell("資金調達ラウンドのはしご", "INTERACTIVE");
    const rounds = [
      { name: "シード", arr: "〜数千万円 / 未確定", raise: "数百万〜数千万円", todo: "アイデア検証・試作（MVP）を作る。少人数で素早く回す。" },
      { name: "シリーズA", arr: "ARR 1億円前後", raise: "数億円", todo: "PMF達成が見えた段階。本格的な成長と組織づくりに投資。" },
      { name: "シリーズB", arr: "ARR 数億〜10億円", raise: "十数億円", todo: "勝ち筋を拡大。営業・マーケを増強しシェアを取りにいく。" },
      { name: "シリーズC+", arr: "ARR 数十億円〜", raise: "数十億円〜", todo: "海外展開・M&A・上場準備など、規模拡大のフェーズ。" },
      { name: "イグジット", arr: "IPO / M&A", raise: "—", todo: "上場や買収で投資家がリターンを得るゴール。評価額10億ドル超はユニコーン。" },
    ];

    const detail = h("div", { class: "callout tip", style: "margin-top:14px" }, [
      h("div", { class: "callout-title" }, ["クリックして各ラウンドを見る"]),
      h("div", { style: "color:var(--text-dim)" }, ["上のはしごの段を選ぶと、その段階の状態が表示されます。"]),
    ]);

    const ladder = h("div", { style: "display:flex;flex-direction:column-reverse;gap:6px" });
    rounds.forEach((r, i) => {
      const step = h("button", {
        class: "btn",
        style: `text-align:left;margin-left:${i * 18}px;border-left:4px solid var(--accent);`,
      }, [
        h("span", { style: "font-weight:700" }, [r.name]),
        h("span", { style: "color:var(--text-dim);font-size:.82rem;margin-left:10px" }, [r.arr]),
      ]);
      step.addEventListener("click", () => {
        ladder.querySelectorAll(".btn").forEach((b) => b.classList.remove("btn-primary"));
        step.classList.add("btn-primary");
        detail.innerHTML = "";
        detail.appendChild(h("div", { class: "callout-title" }, [`🚀 ${r.name}`]));
        detail.appendChild(h("div", { style: "margin-top:4px" }, [
          h("div", {}, [h("b", {}, ["目安ARR: "]), r.arr]),
          h("div", {}, [h("b", {}, ["調達額の目安: "]), r.raise]),
          h("div", { style: "margin-top:4px;color:var(--text-dim)" }, [r.todo]),
        ]));
      });
      ladder.appendChild(step);
    });

    stage.appendChild(h("p", { class: "lead", style: "margin-top:0" }, ["下に行くほど初期、上に行くほど成長後のラウンドです:"]));
    stage.appendChild(ladder);
    stage.appendChild(detail);
    root.appendChild(panel);
  };
})();
