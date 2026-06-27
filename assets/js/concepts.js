/* ============================================================
   DevViz — 用語データ
   各概念: id / icon / title / group / summary / tags / body(HTML) / demo(関数名)
   body は説明テキスト。demo は demos.js のマウント関数名を指す。
   ============================================================ */

window.CONCEPTS = [
  {
    id: "dom",
    icon: "🌳",
    title: "DOM",
    group: "Web基礎",
    summary: "ブラウザがHTMLを「木構造のオブジェクト」として表現したもの。JavaScriptはこれを操作して画面を変える。",
    tags: ["HTML", "ブラウザ", "JavaScript"],
    body: `
      <p>DOM（Document Object Model）は、ブラウザが読み込んだHTMLを
      <strong>ツリー状のオブジェクト</strong>として表したものです。
      <code class="inline">document</code> を起点に、要素（ノード）が親子関係でぶら下がっています。</p>

      <h2>なぜ重要？</h2>
      <p>JavaScriptで画面を動的に変えるとき、実際に操作しているのはこのDOMツリーです。
      <code class="inline">document.querySelector()</code> でノードを取り出し、
      テキストやスタイルを書き換えると、ブラウザが再描画してくれます。</p>

      <pre class="code"><span class="com">// h1 要素を取得して文字を変える</span>
<span class="kw">const</span> title = document.<span class="fn">querySelector</span>(<span class="str">"h1"</span>);
title.textContent = <span class="str">"こんにちは DOM!"</span>;</pre>

      <p>下のツリーでノードをクリックすると、対応するプレビューがハイライトされます。
      「HTML = 静的な文字列」ではなく「触れるオブジェクトの木」だと体感してみてください。</p>
    `,
    demo: "mountDomDemo",
  },

  {
    id: "react",
    icon: "⚛️",
    title: "React / state",
    group: "フレームワーク",
    summary: "UIを「状態（state）」の関数として書くライブラリ。stateが変わると、必要な部分だけ再描画される。",
    tags: ["React", "コンポーネント", "仮想DOM"],
    body: `
      <p><strong>React</strong> は、画面（UI）を「いまの状態（state）からどう見えるか」という
      関数として記述するためのライブラリです。
      ボタンを押して数字を増やす、といった処理は「DOMを直接書き換える」のではなく
      <strong>stateを更新する</strong>と考えます。</p>

      <pre class="code"><span class="kw">function</span> <span class="fn">Counter</span>() {
  <span class="kw">const</span> [count, setCount] = <span class="fn">useState</span>(<span class="num">0</span>);
  <span class="kw">return</span> &lt;button onClick={() =&gt; <span class="fn">setCount</span>(count + <span class="num">1</span>)}&gt;
    {count} 回クリック
  &lt;/button&gt;;
}</pre>

      <h2>仮想DOMとは</h2>
      <p>stateが変わると、Reactはまず<strong>仮想DOM</strong>（メモリ上の軽い複製）を作り、
      前回との<strong>差分だけ</strong>を本物のDOMに反映します。
      これにより「全部描き直す」より高速で、書く側はstateの更新に集中できます。</p>

      <p>下のデモでボタンを押すと、stateの値・再レンダー回数・
      仮想DOMで「変わった」と判定される部分が光ります。</p>
    `,
    demo: "mountReactDemo",
  },

  {
    id: "async",
    icon: "⏳",
    title: "非同期処理 / Promise",
    group: "JavaScript",
    summary: "時間のかかる処理を「待っている間も他を進める」仕組み。Promise と async/await で書く。",
    tags: ["Promise", "async/await", "コールバック"],
    body: `
      <p>ファイル読み込みや通信は時間がかかります。
      JavaScriptはこれを<strong>非同期</strong>で扱い、
      「結果が来たら呼んでね」という約束＝<code class="inline">Promise</code>を返します。</p>

      <pre class="code"><span class="com">// async/await で「同期っぽく」書ける</span>
<span class="kw">async function</span> <span class="fn">load</span>() {
  <span class="kw">const</span> res = <span class="kw">await</span> <span class="fn">fetch</span>(<span class="str">"/api"</span>);
  <span class="kw">const</span> data = <span class="kw">await</span> res.<span class="fn">json</span>();
  <span class="kw">return</span> data;
}</pre>

      <h2>同期 vs 非同期</h2>
      <p>同期処理は「終わるまで次に進めない」。非同期は「待ち時間に別の仕事を進める」。
      下のタイムラインで、3つの処理を<strong>同期</strong>で並べた場合と
      <strong>非同期（並行）</strong>で動かした場合の合計時間を比べてみましょう。</p>
    `,
    demo: "mountAsyncDemo",
  },

  {
    id: "eventloop",
    icon: "🔁",
    title: "イベントループ",
    group: "Node.js / JS",
    summary: "1本のスレッドで非同期を捌く仕組み。コールスタックが空くと、キューのタスクを順に実行する。",
    tags: ["Node.js", "並行処理", "キュー"],
    body: `
      <p>JavaScript（ブラウザもNode.jsも）は基本的に<strong>シングルスレッド</strong>。
      にもかかわらず重い処理で固まらないのは、<strong>イベントループ</strong>のおかげです。</p>

      <p>仕組みはこうです:</p>
      <ul>
        <li><strong>コールスタック</strong>: いま実行中の関数が積まれる場所</li>
        <li><strong>タスクキュー</strong>: <code class="inline">setTimeout</code> などのコールバックが待つ列</li>
        <li><strong>マイクロタスク</strong>: <code class="inline">Promise.then</code> 用の、優先度の高い列</li>
      </ul>
      <p>スタックが空になるたび、ループは<strong>マイクロタスクを全部</strong>片付けてから、
      タスクキューを1つ実行します。だから次のコードは
      <code class="inline">1 → 4 → 3 → 2</code> の順で出力されます。</p>

      <pre class="code"><span class="fn">console</span>.log(<span class="num">1</span>);
<span class="fn">setTimeout</span>(() =&gt; <span class="fn">console</span>.log(<span class="num">2</span>));
<span class="fn">Promise</span>.<span class="fn">resolve</span>().<span class="fn">then</span>(() =&gt; <span class="fn">console</span>.log(<span class="num">3</span>));
<span class="fn">console</span>.log(<span class="num">4</span>);</pre>

      <p>下の「実行」ボタンで、スタック・キュー・出力がどう動くかをステップ表示します。</p>
    `,
    demo: "mountEventLoopDemo",
  },

  {
    id: "http",
    icon: "🌐",
    title: "HTTP / API",
    group: "Web基礎",
    summary: "クライアントとサーバーが「リクエスト」と「レスポンス」をやり取りする約束事。",
    tags: ["HTTP", "REST", "fetch"],
    body: `
      <p>ブラウザ（クライアント）がサーバーに「これちょうだい」と送るのが<strong>リクエスト</strong>、
      サーバーが返すのが<strong>レスポンス</strong>。この往復のルールが<strong>HTTP</strong>です。</p>

      <p>主なメソッド:</p>
      <ul>
        <li><code class="inline">GET</code> … 取得する</li>
        <li><code class="inline">POST</code> … 新しく作る</li>
        <li><code class="inline">PUT</code> / <code class="inline">PATCH</code> … 更新する</li>
        <li><code class="inline">DELETE</code> … 削除する</li>
      </ul>
      <p>レスポンスには<strong>ステータスコード</strong>が付きます:
      <code class="inline">200</code> 成功 / <code class="inline">404</code> 見つからない / <code class="inline">500</code> サーバーエラー。</p>

      <pre class="code"><span class="kw">const</span> res = <span class="kw">await</span> <span class="fn">fetch</span>(<span class="str">"https://api.example.com/users/1"</span>);
<span class="com">// res.status === 200</span>
<span class="kw">const</span> user = <span class="kw">await</span> res.<span class="fn">json</span>();</pre>

      <p>下のデモでメソッドを選んで「送信」すると、
      パケットがクライアント→サーバー→クライアントと動き、ログに往復が記録されます。</p>
    `,
    demo: "mountHttpDemo",
  },

  {
    id: "nodejs",
    icon: "🟢",
    title: "Node.js",
    group: "ランタイム",
    summary: "ブラウザの外でJavaScriptを動かす実行環境。サーバーやツールを書ける。",
    tags: ["Node.js", "npm", "サーバー"],
    body: `
      <p><strong>Node.js</strong> は、ChromeのJSエンジン「V8」を取り出して、
      ブラウザの外（PCやサーバー）でJavaScriptを動かせるようにした実行環境です。
      これにより、フロントもバックも<strong>同じ言語</strong>で書けます。</p>

      <h2>何ができる？</h2>
      <ul>
        <li>Webサーバー（API）を立てる</li>
        <li>ファイルやデータベースを読み書きする</li>
        <li>ビルドツールやCLIなどの開発ツールを動かす</li>
      </ul>

      <pre class="code"><span class="com">// 数行でHTTPサーバーが立つ</span>
<span class="kw">import</span> http <span class="kw">from</span> <span class="str">"node:http"</span>;
http.<span class="fn">createServer</span>((req, res) =&gt; {
  res.<span class="fn">end</span>(<span class="str">"Hello from Node!"</span>);
}).<span class="fn">listen</span>(<span class="num">3000</span>);</pre>

      <div class="callout tip">
        <div class="callout-title">npm とは</div>
        <p>Node.jsに付属するパッケージ管理ツール。
        <code class="inline">npm install react</code> のように、
        世界中の公開ライブラリを取り込めます。</p>
      </div>

      <p>Node.jsの「速さの秘密」は前項の<strong>イベントループ</strong>。
      「イベントループ」のデモと合わせて見ると理解が深まります。</p>
    `,
    demo: "mountNodeDemo",
  },

  {
    id: "git",
    icon: "🔀",
    title: "Git / ブランチ",
    group: "ツール",
    summary: "変更の履歴を記録するバージョン管理。ブランチで作業を分け、マージで合流させる。",
    tags: ["Git", "commit", "branch"],
    body: `
      <p><strong>Git</strong> は、コードの変更履歴を<strong>コミット</strong>という単位で記録する
      バージョン管理システムです。「いつ・誰が・何を変えたか」を遡れ、
      壊れても元に戻せます。</p>

      <h2>ブランチとマージ</h2>
      <p><strong>ブランチ</strong>は履歴の枝。本流（main）を壊さずに新機能を試せます。
      完成したら<strong>マージ</strong>で本流に合流させます。</p>

      <pre class="code"><span class="fn">git</span> checkout -b feature   <span class="com"># 枝を作って移動</span>
<span class="fn">git</span> add .
<span class="fn">git</span> commit -m <span class="str">"新機能を追加"</span>
<span class="fn">git</span> checkout main
<span class="fn">git</span> merge feature        <span class="com"># 本流に合流</span></pre>

      <p>下のデモで、コミットを積んだりブランチを切ってマージしたりして、
      履歴グラフがどう育つかを見てみましょう。</p>
    `,
    demo: "mountGitDemo",
  },

  {
    id: "flexbox",
    icon: "📐",
    title: "CSS Flexbox",
    group: "Web基礎",
    summary: "要素を縦横に整列・分配するCSSレイアウト。justify-content と align-items が要。",
    tags: ["CSS", "レイアウト", "デザイン"],
    body: `
      <p><strong>Flexbox</strong> は、子要素を<strong>一方向（横 or 縦）に並べて配置</strong>するCSSの仕組みです。
      親に <code class="inline">display: flex</code> を付けると、子が「フレックスアイテム」になります。</p>

      <h2>主なプロパティ</h2>
      <ul>
        <li><code class="inline">flex-direction</code> … 並べる向き（row / column）</li>
        <li><code class="inline">justify-content</code> … 主軸方向の配置（左右など）</li>
        <li><code class="inline">align-items</code> … 交差軸方向の配置（上下など）</li>
        <li><code class="inline">gap</code> … アイテム間の余白</li>
      </ul>

      <pre class="code">.container {
  <span class="kw">display</span>: flex;
  <span class="kw">justify-content</span>: center;
  <span class="kw">align-items</span>: center;
  <span class="kw">gap</span>: <span class="num">8px</span>;
}</pre>

      <p>下のプレイグラウンドで各プロパティを切り替えると、
      アイテムの並びがリアルタイムに変わります。生成されるCSSも下に表示されます。</p>
    `,
    demo: "mountFlexboxDemo",
  },

  {
    id: "variables",
    icon: "📦",
    title: "変数とデータ型",
    group: "JavaScript",
    summary: "値に名前を付けて入れておく箱。文字列・数値・真偽値・配列・オブジェクトなどの型がある。",
    tags: ["変数", "型", "基礎"],
    body: `
      <p><strong>変数</strong>は、値に名前を付けて保存しておく「箱」です。
      JavaScriptでは <code class="inline">const</code>（再代入しない）と
      <code class="inline">let</code>（再代入する）を使います。</p>

      <pre class="code"><span class="kw">const</span> name = <span class="str">"さくら"</span>;   <span class="com">// 文字列 string</span>
<span class="kw">let</span> age = <span class="num">20</span>;          <span class="com">// 数値 number</span>
<span class="kw">const</span> active = <span class="kw">true</span>;     <span class="com">// 真偽値 boolean</span>
<span class="kw">const</span> tags = [<span class="str">"js"</span>, <span class="str">"web"</span>]; <span class="com">// 配列 array</span>
<span class="kw">const</span> user = { name, age };  <span class="com">// オブジェクト object</span></pre>

      <h2>型を体感する</h2>
      <p>値によって「できること」が変わります。
      文字列は連結でき、数値は計算でき、配列は要素を持てます。
      下のデモに値を入れると、<code class="inline">typeof</code> で判定した型と、
      その型でできる操作の例が表示されます。</p>
    `,
    demo: "mountVariablesDemo",
  },
];
