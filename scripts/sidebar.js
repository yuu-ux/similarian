// 修正点: window.setupSidebar = function() { ... } として
//         グローバル関数にする (main.js から呼べるようにする)

window.setupSidebar = function() {
  console.log("✅ サイドバーのセットアップ開始");
  
  // ここで .sidebar が存在している前提 (main.js で読み込み後に呼ばれる)
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) {
    console.error("❌ .sidebar が見つかりません");
    return;
  }

  const header = document.getElementById("header");
  if (!header) {
    console.error("❌ #header が見つかりません");
    return;
  }

  // サイドバー内の開閉ボタンを作成
  const toggleButtonSidebar = document.createElement("button");
  toggleButtonSidebar.id = "toggleSidebar";
  toggleButtonSidebar.classList.add("toggle-button");
  toggleButtonSidebar.innerHTML = "×"; // 初期状態は閉じるボタン（×）

  // サイドバーの最上部にボタンを追加
  sidebar.insertBefore(toggleButtonSidebar, sidebar.firstChild);

  // ヘッダー内の開閉ボタン（HTML内に存在するもの）
  const toggleButtonHeader = document.getElementById("toggleSidebarHeader");
  if (!toggleButtonHeader) {
    console.warn("⚠ ヘッダー用ボタンが見つかりません。サイドバーの開閉はサイドバー内ボタンのみになるかも。");
  }

  let isCollapsed = false; // サイドバーが閉じているかの状態

  // サイドバーの開閉を制御する関数
  function toggleSidebar() {
    isCollapsed = !isCollapsed; // 状態を切り替え

    if (isCollapsed) {
      sidebar.classList.add("collapsed");   // サイドバーを閉じる
      header.classList.add("expanded");     // ヘッダーを広げる
      toggleButtonSidebar.style.display = "none"; // サイドバー内のボタンを非表示
      if (toggleButtonHeader) toggleButtonHeader.classList.remove("hidden"); // ヘッダー内のボタンを表示
    } else {
      sidebar.classList.remove("collapsed"); // サイドバーを開く
      header.classList.remove("expanded");   // ヘッダーを元のサイズに
      toggleButtonSidebar.style.display = "block"; // サイドバー内のボタンを表示
      if (toggleButtonHeader) toggleButtonHeader.classList.add("hidden"); // ヘッダー内のボタンを非表示
    }
  }

  // ボタンにクリックイベントを設定
  toggleButtonSidebar.addEventListener("click", toggleSidebar);
  if (toggleButtonHeader) {
    toggleButtonHeader.addEventListener("click", toggleSidebar);
  }

  console.log("✅ サイドバーのセットアップ完了");
};
