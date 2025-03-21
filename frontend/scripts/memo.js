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
let selectedMemos = new Set(); // 選択されたメモのIDを管理

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
        const groupArea = document.createElement('div');
        groupArea.className = 'memo-item-group-area';

        const groupText = document.createElement('div');
        groupText.className = 'memo-item-group';
        groupText.textContent = memo.group || 'グループデータがありません';

        // チェックボックスエリアの作成
        const checkboxArea = document.createElement('div');
        checkboxArea.className = 'memo-checkbox-area';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'memo-checkbox';
        checkbox.checked = selectedMemos.has(memo.id);
        checkbox.onclick = (e) => {
            e.stopPropagation(); // メモの開閉イベントを防ぐ
            toggleMemoSelection(memo.id);
        };
        checkboxArea.appendChild(checkbox);

        groupArea.appendChild(groupText);
        groupArea.appendChild(checkboxArea);

        memoContent.appendChild(groupArea);
        memoContent.innerHTML += `
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

// メモの選択状態を切り替える関数
function toggleMemoSelection(memoId) {
    const checkbox = document.querySelector(`.memo-item[data-id="${memoId}"] .memo-checkbox`);
    if (selectedMemos.has(memoId)) {
        selectedMemos.delete(memoId);
        checkbox.checked = false;
    } else {
        selectedMemos.add(memoId);
        checkbox.checked = true;
    }
    updateSelectionUI();
}

// 選択状態のUIを更新する関数
function updateSelectionUI() {
    const selectedCount = selectedMemos.size;
    // ここで選択されたメモの数に応じてUIを更新
    // 例：ヘッダーに選択数を表示したり、一括操作ボタンの表示/非表示を切り替えたりする
    console.log(`${selectedCount}件のメモが選択されています`);
}

// メモリストを動的に生成する関数
async function generateMemoList() {
    const memoList = document.querySelector('.memo-list');
    memoList.innerHTML = ''; // 既存のメモをクリア

    memoData = await getData();
    memoData.forEach(memo => {
        const memoItem = document.createElement('div');
        memoItem.className = 'memo-item';
        memoItem.setAttribute('data-id', memo.id);

        // チェックボックスエリアの作成
        const checkboxArea = document.createElement('div');
        checkboxArea.className = 'memo-checkbox-area';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'memo-checkbox';
        checkbox.checked = selectedMemos.has(memo.id);
        checkbox.onclick = (e) => {
            e.stopPropagation();
            toggleMemoSelection(memo.id);
        };
        checkboxArea.appendChild(checkbox);

        // メモアイテムのクリックイベントを分離
        const memoContent = document.createElement('div');
        memoContent.className = 'memo-content-area';
        memoContent.onclick = () => openMemo(memo.id);

        const firstParagraph = memo.text;
        previewText = firstParagraph;

        // メモの内容部分のHTML
        const groupArea = document.createElement('div');
        groupArea.className = 'memo-item-group-area';

        const groupText = document.createElement('div');
        groupText.className = 'memo-item-group';
        groupText.textContent = memo.group || 'グループデータがありません';

        groupArea.appendChild(groupText);
        groupArea.appendChild(checkboxArea);

        memoContent.appendChild(groupArea);
        memoContent.innerHTML += `
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

// 新しいメモを追加する関数
window.addNewMemo = function(newMemo) {
  console.log("✅ 新しいメモの追加開始");

  // メモデータに新しいメモを追加
  memoData.push(newMemo);

  // ローカルストレージに保存
  localStorage.setItem('memoData', JSON.stringify(memoData));

  // メモ一覧を更新
  generateMemoList();

  // 新しいメモを選択状態にする
  openMemo(newMemo.id);

  console.log("✅ 新しいメモの追加完了");
};

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

document.querySelectorAll(".memo-item-button-delete").forEach(button => {
    button.addEventListener("click", window.deleteMemo);
});
