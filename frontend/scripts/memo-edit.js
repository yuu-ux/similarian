// 編集画面の切り替え
window.toggleMemoEdit = function() {
    const memoList = document.querySelector('.memo-list');
    const memoEditContainer = document.querySelector('.memo-edit-container');
    const memoEmb = document.querySelector('.memo-emb');  // メモ詳細画面を取得
    
    if (!memoEditContainer) {
        const main = document.getElementById('main');
        const editContainer = document.createElement('div');
        editContainer.className = 'memo-edit-container';
        editContainer.innerHTML = `
            <div class="memo-edit-left">
                <div class="memo-edit-header">
                    <h2>メモを編集</h2>
                    <div class="memo-edit-buttons">
                        <button class="memo-cancel-button">キャンセル</button>
                        <button class="memo-save-button">保存</button>
                    </div>
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
        
        // DOMが追加されたことを確認してからセットアップを実行
        requestAnimationFrame(() => {
            setupMemoEdit();
        });
    }

    // すべての画面を非表示にする
    if (memoList) memoList.classList.add('hidden');
    if (memoEmb) memoEmb.classList.add('hidden');
    if (memoEditContainer) memoEditContainer.classList.add('hidden');
    
    // 編集画面のみを表示
    if (memoEditContainer) memoEditContainer.classList.remove('hidden');
};

// メモ編集画面のセットアップ
window.setupMemoEdit = function() {
    console.log('メモ編集画面のセットアップを開始');
    
    // 必要なDOM要素を取得
    const memoEditContainer = document.querySelector('.memo-edit-container');
    const memoEditTextarea = document.getElementById('memoEditTextarea');
    const memoPreview = document.getElementById('memoPreview');
    const saveButton = document.querySelector('.memo-save-button');
    const cancelButton = document.querySelector('.memo-cancel-button');

    // if (!memoEditContainer || !memoEditTextarea || !memoPreview || !saveButton || !cancelButton) {
    //     console.error('必要なDOM要素が見つかりません');
    //     return;
    // }
    if (!memoEditContainer) {
        console.error('memoEditContainer DOM要素が見つかりません');
        return;
    }
    if (!memoEditTextarea) {
        console.error('memoEditTextarea DOM要素が見つかりません');
        return;
    }
    if (!memoPreview) {
        console.error('memoPreview DOM要素が見つかりません');
        return;
    }
    if (!saveButton) {
        console.error('saveButton DOM要素が見つかりません');
        return;
    }
    if (!cancelButton) {
        console.error('cancelButton DOM要素が見つかりません');
        return;
    }

    // テキストエリアの入力イベント
    memoEditTextarea.addEventListener('input', () => {
        memoPreview.innerHTML = marked.parse(memoEditTextarea.value);
    });

    // キャンセルボタンのクリックイベント
    cancelButton.addEventListener('click', () => {
        const memoId = memoEditContainer.dataset.memoId;
        
        if (memoId) {
            // 編集中のメモがある場合は、そのメモの詳細画面に戻る
            const memoEmb = document.querySelector('.memo-emb');
            if (memoEmb) {
                memoEmb.classList.remove('hidden');
                memoEditContainer.classList.add('hidden');
            }
        } else {
            // 新規作成の場合は、メモ一覧に戻る
            const memoList = document.querySelector('.memo-list');
            if (memoList) memoList.classList.remove('hidden');
            memoEditContainer.classList.add('hidden');
        }
        
        // テキストエリアをクリア
        memoEditTextarea.value = '';
        // 編集中のメモIDをクリア
        memoEditContainer.dataset.memoId = '';
    });

    // 保存ボタンのクリックイベントを修正
    saveButton.addEventListener('click', async () => {
        const text = memoEditTextarea.value.trim();
        if (!text) {
            alert('メモの内容を入力してください');
            return;
        }

        const memoId = memoEditContainer.dataset.memoId;
        // console.log(memoId);

        try {
            const formData = new URLSearchParams();
            formData.append('id', memoId);
            formData.append('memo', text);

            let response;
            if (memoId) {
                response = await fetch('http://localhost:8001/api/update', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                    body: formData
                });
            } else {
                response = await fetch('http://localhost:8001/api/create', {
                    method: 'POST',
                    body: formData
                });
            }

            const data = await response.json();

            if (data.status === "success") {
                alert("メモを保存しました");
                // 成功したらメモ一覧を更新
                if (window.setupMemo) {
                    await window.setupMemo();
                    // メモ一覧を表示
                    const memoList = document.querySelector('.memo-list');
                    if (memoList) memoList.classList.remove('hidden');
                    
                    // 編集画面とメモ詳細画面を非表示
                    if (memoEditContainer) memoEditContainer.classList.add('hidden');
                    const memoEmb = document.querySelector('.memo-emb');
                    if (memoEmb) memoEmb.classList.add('hidden');
                    
                    // テキストエリアをクリア
                    memoEditTextarea.value = '';
                    // 編集中のメモIDをクリア
                    memoEditContainer.dataset.memoId = '';
                }
            } else {
                throw new Error(data.message || "メモの保存に失敗しました");
            }
        } catch (error) {
            console.error("エラー:", error);
            alert(error.message || "メモの保存中にエラーが発生しました");
        }
    });

    console.log('メモ編集画面のセットアップが完了');
};

// ページ読み込み時に編集画面のセットアップを実行
document.addEventListener('DOMContentLoaded', () => {
    // 代わりに toggleMemoEdit 関数で DOM を作成・設定します
}); 