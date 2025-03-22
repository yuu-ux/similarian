// ヘッダーのセットアップ処理
window.setupHeader = function() {
  console.log("✅ ヘッダーのセットアップ開始");

  // 「新しいメモ」ボタンのイベント登録
  const newMemoBtn = document.getElementById("newMemoBtn");
  if (newMemoBtn) {
    newMemoBtn.addEventListener("click", () => {
      // 編集画面を表示
      window.toggleMemoEdit();
    });
  }

  // 検索機能のセットアップ
  const searchInput = document.getElementById("searchInput");
  const searchHistory = document.getElementById("searchHistory");

  // ローカルストレージから検索履歴を取得
  let searchHistoryItems = JSON.parse(localStorage.getItem("searchHistory") || "[]");

  // 検索履歴を表示する関数
  function showSearchHistory() {
    searchHistory.innerHTML = searchHistoryItems
      .map(item => `
        <div class="search-history-item" data-search="${item}">
          <span></span>
          ${item}
        </div>
      `)
      .join("");

    searchHistory.classList.add("active");
  }

  // 検索履歴を非表示にする関数
  function hideSearchHistory() {
    searchHistory.classList.remove("active");
  }

  // 検索履歴に追加する関数
  function addToSearchHistory(searchTerm) {
    if (!searchTerm.trim()) return;

    // 重複を削除し、先頭に追加
    searchHistoryItems = [searchTerm, ...searchHistoryItems.filter(item => item !== searchTerm)];

    // 最大10件まで保存
    if (searchHistoryItems.length > 10) {
      searchHistoryItems = searchHistoryItems.slice(0, 10);
    }

    // ローカルストレージに保存
    localStorage.setItem("searchHistory", JSON.stringify(searchHistoryItems));
  }

  if (searchInput && searchHistory) {
    // 入力欄がフォーカスされたとき
    searchInput.addEventListener("focus", () => {
      showSearchHistory();
    });

    // 検索実行時
    searchInput.addEventListener("keypress", async (event) => {
        if (event.key === "Enter") {
            const searchTerm = event.target.value.trim();
            if (searchTerm) {
                const params = new URLSearchParams({ query: searchTerm });
                await fetch(`https://rra5ztrdk7.us-west-2.awsapprunner.com/api/search?${params}`, {
                    method: 'GET',
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('サーバーエラー');
                    }
                    return response.json();
                })
                .then(data => {
                    generateMemoList(data);
                })
              addToSearchHistory(searchTerm);
              showSearchHistory(); // 履歴を更新して表示
            }
        }
    });

    // 検索履歴のクリック処理
    searchHistory.addEventListener("click", (event) => {
      const historyItem = event.target.closest(".search-history-item");
      if (historyItem) {
        const searchTerm = historyItem.dataset.search;
        searchInput.value = searchTerm;
        hideSearchHistory();
      }
    });

    // 検索履歴の外側をクリックしたとき
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".search-box")) {
        hideSearchHistory();
      }
    });
  }

  console.log("✅ ヘッダーのセットアップ完了");
};

