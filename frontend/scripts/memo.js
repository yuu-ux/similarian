async function getData() {
    const url = "http://localhost:5000/";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`レスポンスステータス: ${response.status}`);
        }
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        return data;
    } catch (error) {
        console.error("データ取得エラー:", error);
        return [];  // エラー時は空の配列を返す
    }
}

let memoData;
window.setupMemo = async function() {
    console.log("✅ メモエリアのセットアップ完了");

    const memoList = document.querySelector('.memo-list');
    if (!memoList) {
        console.error('メモリスト要素が見つかりません');
        return;
    }

    memoList.innerHTML = ''; // 既存のメモをクリア

    memoData = await getData();
    if (!Array.isArray(memoData)) {
        console.error('メモデータが配列ではありません:', memoData);
        memoData = [];
    }

    memoData.forEach(memo => {
        const memoItem = document.createElement('div');
        memoItem.className = 'memo-item';
        memoItem.setAttribute('data-id', memo.id);
        memoItem.onclick = () => openMemo(memo.id);

        const firstParagraph = memo.text;
        previewText = firstParagraph;

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

// メモリストを動的に生成する関数
function generateMemoList() {
    const memoList = document.querySelector('.memo-list');
    memoList.innerHTML = ''; // 既存のメモをクリア

    memoData.forEach(memo => {
        const memoItem = document.createElement('div');
        memoItem.className = 'memo-item';
        memoItem.setAttribute('data-id', memo.id);
        memoItem.onclick = () => openMemo(memo.id);

        const firstParagraph = memo.text;
        previewText = firstParagraph;

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
}

// ページ読み込み時にメモリストを生成
document.addEventListener('load', generateMemoList);

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

// メモを削除する関数
window.deleteMemo = function(id) {
    if (confirm('このメモを削除してもよろしいですか？')) {
        console.log("✅ メモの削除開始");

        const formData = new FormData();
        formData.append("id", id)  
        fetch("http://localhost:5000/delete", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                alert("削除が完了しました");
                // メモリストを再読み込み
                setupMemo();
                closeMemo();
            } else {
                alert("削除に失敗しました: " + data.message);
            }
        })
        .catch((error) => {
            console.error("削除エラー:", error);
            alert("削除中にエラーが発生しました");
        });
    }
};

