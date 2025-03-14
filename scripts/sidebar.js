// 修正点: window.setupSidebar = function() { ... } として
//         グローバル関数にする (main.js から呼べるようにする)

window.setupSidebar = function() {
  console.log("✅ サイドバーのセットアップ開始");
  
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) {
    console.error("❌ .sidebar が見つかりません");
    return;
  }

  const header = document.querySelector(".header");
  if (!header) {
    console.error("❌ .header が見つかりません");
    return;
  }

  // サイドバー内の開閉ボタン（HTML内に存在するもの）
  const toggleButtonSidebar = document.getElementById("toggleSidebar");
  if (!toggleButtonSidebar) {
    console.error("❌ #toggleSidebar が見つかりません");
    return;
  }

  // ヘッダー内の開閉ボタン（HTML内に存在するもの）
  const toggleButtonHeader = document.getElementById("toggleSidebarHeader");
  if (!toggleButtonHeader) {
    console.warn("⚠ ヘッダー用ボタンが見つかりません。サイドバーの開閉はサイドバー内ボタンのみになるかも。");
  }

  let isCollapsed = false; // サイドバーが閉じているかの状態

  // サイドバーの開閉を制御する関数
  function toggleSidebar(event) {
    // イベントの伝播を停止
    event.preventDefault();
    event.stopPropagation();

    isCollapsed = !isCollapsed; // 状態を切り替え
    console.log("サイドバーの状態:", isCollapsed ? "閉じる" : "開く");

    const mainContent = document.querySelector('.main-content');

    if (isCollapsed) {
      sidebar.classList.add("collapsed");   // サイドバーを閉じる
      header.classList.add("expanded");     // ヘッダーを広げる
      if (mainContent) mainContent.classList.add("expanded"); // メインコンテンツを広げる
      if (toggleButtonHeader) toggleButtonHeader.classList.remove("hidden"); // ヘッダー内のボタンを表示
    } else {
      sidebar.classList.remove("collapsed"); // サイドバーを開く
      header.classList.remove("expanded");   // ヘッダーを元のサイズに
      if (mainContent) mainContent.classList.remove("expanded"); // メインコンテンツを元に戻す
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
