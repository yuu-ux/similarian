// HTMLファイルを指定の要素に読み込む関数
function loadComponent(id, file, callback) {
  fetch(file)
    .then(response => response.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
      if (callback) {
        // DOMの更新を待ってからコールバックを実行
        setTimeout(callback, 0);
      }
    })
    .catch(error => console.error(`Error loading ${file}:`, error));
}

// 各パーツを読み込む
// 1) サイドバー (sidebar.html) 読み込み後に setupSidebar() を呼ぶ
loadComponent("sidebar", "components/sidebar.html", () => {
  if (window.setupSidebar) {
    window.setupSidebar(); // グローバルに定義してある関数を呼ぶ
  } else {
    console.error("❌ setupSidebar が未定義です");
  }
});

// 2) ヘッダー (header.html) 読み込み後に setupHeader() を呼ぶ
loadComponent("header", "components/header.html", () => {
  if (window.setupHeader) {
    window.setupHeader();
  } else {
    console.error("❌ setupHeader が未定義です");
  }
});

// 3) メイン (main.html) 読み込み後に setupMemo() を呼ぶ
loadComponent("main", "components/main.html", () => {
  if (window.setupMemo) {
    window.setupMemo();
  } else {
    console.error("❌ setupMemo が未定義です");
  }
});