// メモデータの取得
async function getData() {
    const url = "http://localhost:8001/api/";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`レスポンスステータス: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error.message);
    }
}

let memoData;
window.setupMemo = async function() {
    console.log("✅ メモエリアのセットアップ完了");

    const memoList = document.querySelector('.memo-list');
    memoList.innerHTML = ''; // 既存のメモをクリア

    memoData = await getData();
    memoData.forEach(memo => {
        const memoItem = document.createElement('div');
        memoItem.className = 'memo-item';
        memoItem.setAttribute('data-id', memo.id);
        memoItem.onclick = () => openMemo(memo.id);

        const previewText = memo.text;

        memoItem.innerHTML = `
            <div class="memo-item-group">${memo.group || 'グループデータがありません'}</div>
            <div class="memo-item-textdata">${marked.parse(previewText) || 'メモデータがありません'}</div>
            <div class="memo-item-group-button">
                <p>グループ</p>
                <div class="memo-item-button">
                    <button class="memo-item-button-edit">編集</button>
                    <button class="memo-item-button-delete" onclick="event.stopPropagation(); deleteMemo(${memo.id})">削除</button>
                </div>
            </div>
        `;

        memoList.appendChild(memoItem);
    });
};

function openMemo(id) {
    const memoList = document.querySelector('.memo-list');
    const memoEmb = document.querySelector('.memo-emb');
    const memoContent = document.querySelector('.memo-content');
    const memoDetailGroupText = document.querySelector('.memo-detail-group-text');
    const memoDetailDateText = document.querySelector('.memo-detail-date-text');
    const sideMemos = document.querySelector('.side-memos');

    // 選択状態をリセット
    document.querySelectorAll('.memo-item.selected, .side-memo-item.selected').forEach(item => {
        item.classList.remove('selected');
    });

    // メインリストの選択状態を更新
    const selectedMemoItem = document.querySelector(`.memo-item[data-id="${id}"]`);
    if (selectedMemoItem) {
        selectedMemoItem.classList.add('selected');
    }

    // id に対応するメモデータを取得
    const memo = memoData.find(memo => memo.id === id);
    if (!memo) return;

    // クリックされたメモの内容をMarkdownとして表示
    memoContent.innerHTML = marked.parse(memo.text);
    memoDetailGroupText.textContent = memo.group || 'グループデータがありません';
    memoDetailDateText.textContent = memo.date || '日付データがありません';

    // サイドメモに他のメモを並べる
    sideMemos.innerHTML = '';
    memoData.forEach(m => {
        if (m.id !== id) {
            let sideItem = document.createElement('div');
            sideItem.className = 'side-memo-item';
            sideItem.setAttribute('data-id', m.id);
            sideItem.innerHTML = marked.parse(m.text);
            sideItem.onclick = () => openMemo(m.id);
            sideMemos.appendChild(sideItem);
        } else {
            // 選択されているメモをサイドメモにも表示し、選択状態にする
            let sideItem = document.createElement('div');
            sideItem.className = 'side-memo-item selected';
            sideItem.setAttribute('data-id', m.id);
            sideItem.innerHTML = marked.parse(m.text);
            sideItem.onclick = () => openMemo(m.id);
            sideMemos.appendChild(sideItem);
        }
    });

    // 表示切り替え
    memoList.classList.add('hidden');
    memoEmb.classList.remove('hidden');
    memoEmb.dataset.id = memo.id;
}

function closeMemo() {
    const memoList = document.querySelector('.memo-list');
    const memoEmb = document.querySelector('.memo-emb');

    console.log("closeMemo: memo-list を表示し、memo-emb を非表示");
    memoList.classList.remove('hidden');
    memoEmb.classList.add('hidden');
}

// メモを削除する関数
window.deleteMemo = function(id) {
    if (confirm('このメモを削除してもよろしいですか？')) {
        const formData = new URLSearchParams();
        formData.append('id', id);
        fetch('http://localhost:8001/api/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('サーバーエラー');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                const memoElement = document.querySelector(`.memo-item[data-id="${id}"]`);
                if (memoElement) {
                    memoElement.remove();
                }
                alert("メモを削除しました");
            } else {
                alert("メモの削除に失敗しました");
            }
        })
        .catch(error => {
            alert("エラーが発生しました");
        });
    }
};

window.editMemo = function() {
    const memoEmb = document.querySelector('.memo-emb');
    const memoId = memoEmb.dataset.id; // 現在開いているメモのID
    const memo = memoData.find(m => m.id === parseInt(memoId));
    
    if (!memo) {
        console.error('メモが見つかりません');
        return;
    }

    // 編集画面を表示
    toggleMemoEdit();

    // 編集画面のテキストエリアに現在のメモの内容をセット
    const memoEditTextarea = document.getElementById('memoEditTextarea');
    if (memoEditTextarea) {
        memoEditTextarea.value = memo.text;
        // プレビューも更新
        const memoPreview = document.getElementById('memoPreview');
        if (memoPreview) {
            memoPreview.innerHTML = marked.parse(memo.text);
        }
    }

    // 編集中のメモIDを保存
    const memoEditContainer = document.querySelector('.memo-edit-container');
    if (memoEditContainer) {
        memoEditContainer.dataset.memoId = memoId;
    }
};
