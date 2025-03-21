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
let isAiMode = false; // AI生成モードの状態を管理
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

// AI生成モードの切り替え
window.toggleAiMode = function() {
    isAiMode = !isAiMode;
    selectedMemos.clear(); // 選択をリセット
    const aiBtn = document.getElementById('aiGenerateBtn');
    aiBtn.classList.toggle('active');
    
    if (isAiMode) {
        // AI生成モード時に生成ボタンを表示
        showAiGenerateButton();
    } else {
        // AI生成モード終了時に生成ボタンを非表示
        hideAiGenerateButton();
    }
    
    // メモリストを再生成して選択UIを更新
    generateMemoList();
};

// AI生成用のフローティングボタンを表示
function showAiGenerateButton() {
    let generateButton = document.getElementById('floatingGenerateButton');
    if (!generateButton) {
        generateButton = document.createElement('button');
        generateButton.id = 'floatingGenerateButton';
        generateButton.className = 'floating-generate-button';
        generateButton.textContent = '選択したメモで生成';
        generateButton.onclick = generateFromSelectedMemos;
        generateButton.style.display = 'none'; // 初期状態では非表示
        document.body.appendChild(generateButton);
    }
}

// AI生成用のフローティングボタンを非表示
function hideAiGenerateButton() {
    const generateButton = document.getElementById('floatingGenerateButton');
    if (generateButton) {
        generateButton.remove();
    }
}

// メモの選択状態を切り替え
function toggleMemoSelection(memoId) {
    if (selectedMemos.has(memoId)) {
        selectedMemos.delete(memoId);
    } else {
        selectedMemos.add(memoId);
    }
    
    // 選択状態に応じてUIを更新
    updateMemoSelectionUI();
    
    // 生成ボタンの表示/非表示を制御
    const generateButton = document.getElementById('floatingGenerateButton');
    if (generateButton) {
        generateButton.style.display = selectedMemos.size > 0 ? 'block' : 'none';
    }
}

// メモの選択状態をUIに反映
function updateMemoSelectionUI() {
    document.querySelectorAll('.memo-item').forEach(item => {
        const memoId = parseInt(item.getAttribute('data-id'));
        if (selectedMemos.has(memoId)) {
            item.classList.add('selected-for-ai');
        } else {
            item.classList.remove('selected-for-ai');
        }
    });
}

// 選択されたメモからAIコンテンツを生成
async function generateFromSelectedMemos() {
    if (selectedMemos.size === 0) {
        alert('メモが選択されていません');
        return;
    }

    try {
        const selectedMemoContents = Array.from(selectedMemos)
            .map(id => memoData.find(m => m.id === id))
            .filter(memo => memo)
            .map(memo => memo.text);

        console.log('AI生成開始: 選択されたメモ数', selectedMemos.size);
        
        const response = await fetch('http://localhost:8001/api/ai-generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                memoContents: selectedMemoContents
            })
        });

        if (!response.ok) {
            throw new Error('AI生成に失敗しました');
        }

        const result = await response.json();
        console.log('AI生成完了:', result);

        // 生成結果を表示または処理
        alert('AI生成が完了しました');
        
        // 生成モードを終了
        toggleAiMode();
    } catch (error) {
        console.error('AI生成エラー:', error);
        alert('AI生成中にエラーが発生しました');
    }
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

        // AI生成モード時は選択可能に
        if (isAiMode) {
            memoItem.onclick = (e) => {
                e.stopPropagation();
                toggleMemoSelection(memo.id);
            };
            if (selectedMemos.has(memo.id)) {
                memoItem.classList.add('selected-for-ai');
            }
        } else {
            memoItem.onclick = () => openMemo(memo.id);
        }

        const memoContent = document.createElement('div');
        memoContent.className = 'memo-content-area';

        const firstParagraph = memo.text;
        previewText = firstParagraph;

        // メモの内容部分のHTML
        memoContent.innerHTML = `
            <div class="memo-item-group">${memo.group || 'グループデータがありません'}</div>
            <div class="memo-item-textdata">${marked.parse(previewText) || 'メモデータがありません'}</div>
        `;

        // グループ編集部分のHTML（AI生成モード時は非表示）
        if (!isAiMode) {
            const groupEditArea = document.createElement('div');
            groupEditArea.className = 'memo-item-group-button';
            groupEditArea.innerHTML = `
                <div class="memo-item-button">
                    <button class="edit-group" onclick="event.stopPropagation(); showGroupEditPopover(this, ${memo.id})">グループ編集</button>
                    <button class="memo-item-button-delete" onclick="event.stopPropagation(); deleteMemo(${memo.id})">メモ削除</button>
                </div>
                <div class="popover" id="popover-${memo.id}"></div>
            `;
            memoItem.appendChild(groupEditArea);
        }

        memoItem.appendChild(memoContent);
        memoList.appendChild(memoItem);
    });
}

// AI生成ボタンのイベントリスナーを設定
document.addEventListener('DOMContentLoaded', function() {
    const aiBtn = document.getElementById('aiGenerateBtn');
    if (aiBtn) {
        aiBtn.addEventListener('click', toggleAiMode);
    }
});

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
