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
async function generateMemoList() {
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

// AI生成機能の実装
let isSelectingMode = false;
let selectedMemos = new Set();

// 生成AIボタンのクリックイベント
document.getElementById('aiGenerateBtn').addEventListener('click', function() {
    isSelectingMode = !isSelectingMode;
    this.classList.toggle('active');
    
    if (isSelectingMode) {
        // 選択モードを開始
        this.textContent = '生成開始';
        document.body.classList.add('selecting-mode');
        enableMemoSelection();
    } else {
        // 選択モードを終了し、AIリクエストを送信
        this.textContent = '生成AI';
        document.body.classList.remove('selecting-mode');
        if (selectedMemos.size > 0) {
            generateAIResponse();
        }
        disableMemoSelection();
        selectedMemos.clear();
    }
});

// メモの選択を有効にする
function enableMemoSelection() {
    document.querySelectorAll('.memo-item').forEach(memo => {
        memo.classList.add('selectable');
        // クリックイベントを一時的に無効化
        memo.setAttribute('data-original-click', memo.onclick);
        memo.onclick = null;
        
        // 選択用のクリックイベントを追加
        memo.addEventListener('click', handleMemoSelection);
    });
}

// メモの選択を無効にする
function disableMemoSelection() {
    document.querySelectorAll('.memo-item').forEach(memo => {
        memo.classList.remove('selectable', 'selected');
        // 元のクリックイベントを復元
        const originalClick = memo.getAttribute('data-original-click');
        if (originalClick) {
            memo.onclick = new Function(originalClick);
        }
        memo.removeEventListener('click', handleMemoSelection);
    });
}

// メモ選択のハンドラー
function handleMemoSelection(event) {
    if (!isSelectingMode) return;
    
    const memoItem = event.currentTarget;
    const memoId = memoItem.getAttribute('data-id');
    
    if (selectedMemos.has(memoId)) {
        selectedMemos.delete(memoId);
        memoItem.classList.remove('selected');
    } else {
        selectedMemos.add(memoId);
        memoItem.classList.add('selected');
    }
}

// AI生成リクエストを送信
async function generateAIResponse() {
    const selectedMemoTexts = Array.from(selectedMemos).map(memoId => {
        const memo = memoData.find(m => m.id === parseInt(memoId));
        return memo ? memo.text : '';
    }).filter(text => text);

    if (selectedMemoTexts.length === 0) return;

    try {
        const response = await fetch('http://localhost:8001/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                memos: selectedMemoTexts
            })
        });

        if (!response.ok) {
            throw new Error('AI生成リクエストに失敗しました');
        }

        const result = await response.json();
        displayAIResponse(result.response);
    } catch (error) {
        console.error('エラーが発生しました:', error);
        alert('AI生成中にエラーが発生しました');
    }
}

// AI生成結果を表示
function displayAIResponse(response) {
    // 既存のAIレスポンス表示があれば削除
    const existingResponse = document.querySelector('.ai-response-container');
    if (existingResponse) {
        existingResponse.remove();
    }

    // 新しいレスポンス表示を作成
    const container = document.createElement('div');
    container.className = 'ai-response-container';
    
    const header = document.createElement('div');
    header.className = 'ai-response-header';
    header.innerHTML = `
        <h3>AI生成結果</h3>
        <button class="close-ai-response">×</button>
    `;

    const content = document.createElement('div');
    content.className = 'ai-response-content';
    content.innerHTML = marked.parse(response);

    container.appendChild(header);
    container.appendChild(content);
    document.body.appendChild(container);

    // 閉じるボタンの処理
    container.querySelector('.close-ai-response').onclick = () => {
        container.remove();
    };
}

// スタイルの追加
const style = document.createElement('style');
style.textContent = `
    .selecting-mode .memo-item.selectable {
        cursor: pointer;
        opacity: 0.7;
        transition: all 0.3s ease;
    }

    .selecting-mode .memo-item.selectable:hover {
        opacity: 1;
        transform: scale(1.01);
    }

    .selecting-mode .memo-item.selected {
        opacity: 1;
        border: 2px solid #4CAF50;
        background-color: rgba(76, 175, 80, 0.1);
    }

    #aiGenerateBtn.active {
        background-color: #4CAF50;
        color: white;
    }

    .ai-response-container {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80%;
        max-width: 800px;
        max-height: 80vh;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        display: flex;
        flex-direction: column;
    }

    .ai-response-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-bottom: 1px solid #eee;
    }

    .ai-response-header h3 {
        margin: 0;
    }

    .close-ai-response {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.5rem;
    }

    .ai-response-content {
        padding: 1rem;
        overflow-y: auto;
        flex-grow: 1;
    }
`;

document.head.appendChild(style);
