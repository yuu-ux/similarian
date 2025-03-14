const memoData = [
    { id: 1, date: "2025-03-01", text: "今日は新しいメモアプリのアイディアを考えた。内容ベースの検索を取り入れたい。", group: "アイディア", similarity: 0.894 },
    { id: 2, date: "2025-03-02", text: "生成AIについて調べた。自然言語処理の進化が著しい。", group: "リサーチ", similarity: 0.754 },
    { id: 3, date: "2025-03-05", text: "日記の検索機能を強化する方法を考えた。タグだけでなく、意味ベースで分類できると便利。", group: "アイディア", similarity: 0.685 },
    { id: 4, date: "2025-03-07", text: "最近のAI技術をまとめた。特に意味ベースの検索技術が注目されている。", group: "リサーチ", similarity: 0.543 },
    { id: 5, date: "2025-03-07", text: "最近のAI技術をまとめた。特に意味ベースの検索技術が注目されている。", group: "リサーチ", similarity: 0.542 },
    { id: 6, date: "2025-03-07", text: "最近のAI技術をまとめた。特に意味ベースの検索技術が注目されている。", group: "リサーチ", similarity: 0.541 }
];

// メモエリアのセットアップ
window.setupMemo = function() {
    console.log("✅ メモエリアのセットアップ完了");

    const memoList = document.querySelector('.memo-list');
    memoList.innerHTML = ""; // 初期化

    memoData.forEach((memo) => {
        const memoItem = document.createElement("div");
        memoItem.classList.add("memo-item");
        memoItem.textContent = memo.text;
        memoItem.dataset.id = memo.id;

        // クリックイベントを追加
        memoItem.addEventListener("click", () => openMemo(memo.id));

        memoList.appendChild(memoItem);
    });
};

// メモを開く処理
function openMemo(id) {
    window.alert(id + "番のメモを開く");
}
