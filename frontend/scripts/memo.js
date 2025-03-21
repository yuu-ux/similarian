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

        // メモアイテムのクリックイベントを分離
        const memoContent = document.createElement('div');
        memoContent.className = 'memo-content-area';
        memoContent.onclick = () => openMemo(memo.id);

        const firstParagraph = memo.text;
        previewText = firstParagraph;

        // メモの内容部分のHTML
        memoContent.innerHTML = `
            <div class="memo-item-group">${memo.group || 'グループデータがありません'}</div>
            <div class="memo-item-textdata">${marked.parse(previewText) || 'メモデータがありません'}</div>
        `;

        // グループ編集部分のHTML
        const groupEditArea = document.createElement('div');
        groupEditArea.className = 'memo-item-group-button';
        groupEditArea.innerHTML = `
            <div class="memo-item-button">
                <button class="edit-group" onclick="event.stopPropagation(); showGroupEditPopover(this, ${memo.id})">グループ編集</button>
                <button class="memo-item-button-delete" onclick="event.stopPropagation(); deleteMemo(${memo.id})">メモ削除</button>
            </div>
            <div class="popover" id="popover-${memo.id}"></div>
        `;

        // 要素を組み立てる
        memoItem.appendChild(memoContent);
        memoItem.appendChild(groupEditArea);
        memoList.appendChild(memoItem);
    });
};

// メモリストを動的に生成する関数
async function generateMemoList() {
    const memoList = document.querySelector('.memo-list');
    memoList.innerHTML = ''; // 既存のメモをクリア

    memoData = await getData();
    memoData.forEach(memo => {
        const memoItem = document.createElement('div');
        memoItem.className = 'memo-item';
        memoItem.setAttribute('data-id', memo.id);

        // メモアイテムのクリックイベントを分離
        const memoContent = document.createElement('div');
        memoContent.className = 'memo-content-area';
        memoContent.onclick = () => openMemo(memo.id);

        const firstParagraph = memo.text;
        previewText = firstParagraph;

        // メモの内容部分のHTML
        memoContent.innerHTML = `
            <div class="memo-item-group">${memo.group || 'グループデータがありません'}</div>
            <div class="memo-item-textdata">${marked.parse(previewText) || 'メモデータがありません'}</div>
        `;

        // グループ編集部分のHTML
        const groupEditArea = document.createElement('div');
        groupEditArea.className = 'memo-item-group-button';
        groupEditArea.innerHTML = `
            <div class="memo-item-button">
                <button class="edit-group" onclick="event.stopPropagation(); showGroupEditPopover(this, ${memo.id})">グループ編集</button>
                <button class="memo-item-button-delete" onclick="event.stopPropagation(); deleteMemo(${memo.id})">メモ削除</button>
            </div>
            <div class="popover" id="popover-${memo.id}"></div>
        `;

        // 要素を組み立てる
        memoItem.appendChild(memoContent);
        memoItem.appendChild(groupEditArea);
        memoList.appendChild(memoItem);
    });
}

// ページ読み込み時にメモリストを生成
document.addEventListener('DOMContentLoaded', setupMemo);

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
} 

function closeMemo() {
    const memoList = document.querySelector('.memo-list');
    const memoEmb = document.querySelector('.memo-emb');

    console.log("closeMemo: memo-list を表示し、memo-emb を非表示");
    memoList.classList.remove('hidden');
    memoEmb.classList.add('hidden');
}

// 新しいメモを追加する関数
window.addNewMemo = async function(newMemo) {
    console.log("✅ 新しいメモの追加開始");

    try {
        const response = await fetch('http://localhost:8001/api/memos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newMemo)
        });

        if (!response.ok) {
            throw new Error('メモの追加に失敗しました');
        }

        // APIからの応答を待つ
        const addedMemo = await response.json();

        // メモデータを更新
        memoData = await getData();

        // メモ一覧を更新
        generateMemoList();

        // 新しいメモを選択状態にする
        openMemo(addedMemo.id);

        console.log("✅ 新しいメモの追加完了");
    } catch (error) {
        console.error('エラーが発生しました:', error);
    }
};

// メモを削除する関数
window.deleteMemo = async function(id) {
    if (confirm('このメモを削除してもよろしいですか？')) {
        console.log("✅ メモの削除開始");

        try {
            const response = await fetch(`http://localhost:8001/api/memos/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('メモの削除に失敗しました');
            }

            // メモデータを更新
            memoData = await getData();

            // メモ一覧を更新
            generateMemoList();

            // メモ詳細画面を閉じる
            closeMemo();

            console.log("✅ メモの削除完了");
        } catch (error) {
            console.error('エラーが発生しました:', error);
        }
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

document.querySelectorAll(".memo-item-button-delete").forEach(button => {
    button.addEventListener("click", window.deleteMemo);
});
