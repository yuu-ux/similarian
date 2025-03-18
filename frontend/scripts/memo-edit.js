// 編集画面の切り替え
window.toggleMemoEdit = function() {
    const memoList = document.querySelector('.memo-list');
    const memoEditContainer = document.querySelector('.memo-edit-container');
    
    if (!memoEditContainer) {
        // 編集コンテナが存在しない場合は作成
        const main = document.getElementById('main');
        const editContainer = document.createElement('div');
        editContainer.className = 'memo-edit-container';
        editContainer.innerHTML = `
            <div class="memo-edit-left">
                <div class="memo-edit-header">
                    <h2>メモを編集</h2>
                    <button class="memo-save-button">保存</button>
                </div>
                <textarea id="memoEditTextarea" class="memo-edit-textarea" placeholder="Markdownでメモを書くことができます"></textarea>
            </div>
            <div class="memo-edit-right">
                <div class="memo-preview-header">
                    <h2>プレビュー</h2>
                </div>
                <div id="memoPreview" class="memo-preview"></div>
            </div>
        `;
        main.appendChild(editContainer);
        
        // 編集画面のセットアップ
        setupMemoEdit();
    }

    // 表示切り替え
    if (memoList) memoList.classList.toggle('hidden');
    if (memoEditContainer) memoEditContainer.classList.toggle('hidden');
};

// メモ編集画面のセットアップ
function setupMemoEdit() {
    console.log('メモ編集画面のセットアップを開始');
    
    // 必要なDOM要素を取得
    const memoEditContainer = document.querySelector('.memo-edit-container');
    const memoEditTextarea = document.getElementById('memoEditTextarea');
    const memoPreview = document.getElementById('memoPreview');
    const saveButton = document.querySelector('.memo-save-button');

    if (!memoEditContainer || !memoEditTextarea || !memoPreview || !saveButton) {
        console.error('必要なDOM要素が見つかりません');
        return;
    }

    // テキストエリアの入力イベント
    memoEditTextarea.addEventListener('input', () => {
        memoPreview.innerHTML = marked.parse(memoEditTextarea.value);
    });

    // 保存ボタンのクリックイベント
    saveButton.addEventListener('click', () => {
        const text = memoEditTextarea.value.trim();
        if (!text) {
            alert('メモの内容を入力してください');
            return;
        }

        // 新しいメモを作成
        const newMemo = {
            id: memoData.length + 1,
            date: new Date().toISOString().split('T')[0],
            text: text,
            group: '',
            similarity: 0
        };

        // memoDataに追加
        memoData.push(newMemo);

        // ローカルストレージに保存
        localStorage.setItem('memoData', JSON.stringify(memoData));

        // メモリストを更新
        if (window.generateMemoList) {
            window.generateMemoList();
        }

        // 編集画面を閉じる
        toggleMemoEdit();

        // テキストエリアをクリア
        memoEditTextarea.value = '';

        console.log('新しいメモを保存しました');
    });

    console.log('メモ編集画面のセットアップが完了');
} 