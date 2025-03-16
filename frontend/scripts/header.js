// ヘッダーのセットアップ処理
function setupHeader() {
    console.log("✅ ヘッダーのセットアップ完了");
  
    // 「新しいメモ」ボタンのイベント登録
    const newMemoBtn = document.getElementById("newMemoBtn");
    if (newMemoBtn) {
      newMemoBtn.addEventListener("click", () => {
        alert("新しいメモの作成画面を表示します");
      });
    }
  
    // 検索機能のセットアップ
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (event) => {
        console.log("検索キーワード:", event.target.value);
      });
    }
  }
  