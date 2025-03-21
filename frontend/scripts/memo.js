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
function generateMemoList() {
    const memoList = document.querySelector('.memo-list');
    memoList.innerHTML = ''; // 既存のメモをクリア

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
    }
};

// ダミーのグループリスト
const availableGroups = [
    "アイディア",
    "リサーチ",
    "開発",
    "デザイン",
    "プロジェクト管理",
    "マーケティング",
    "ユーザーリサーチ"
];

// ポップオーバーを表示する関数
function showGroupEditPopover(button, memoId) {
    const popover = document.getElementById(`popover-${memoId}`);
    const memo = memoData.find(m => m.id === memoId);
    const currentGroups = memo.group ? memo.group.split(',').map(g => g.trim()) : [];
    
    // 他のポップオーバーを全て非表示
    document.querySelectorAll('.popover').forEach(p => p.classList.remove('show'));
    
    // 所属グループと未所属グループを分類
    const memberGroups = availableGroups.filter(group => currentGroups.includes(group));
    const nonMemberGroups = availableGroups.filter(group => !currentGroups.includes(group));
    
    // ポップオーバーの内容を更新
    popover.innerHTML = `
        <div class="group-management">
            <div class="group-section">
                <div class="group-section-title">
                    所属中
                    <button type="button" 
                            class="group-action-main-button remove" 
                            onclick="removeFromSelectedGroups(${memoId})"
                            disabled>
                        選択したグループを削除
                    </button>
                </div>
                <div class="group-buttons-container">
                    ${memberGroups.map(group => `
                        <button type="button" 
                                class="group-select-button" 
                                data-group="${group}"
                                onclick="toggleGroupSelection(this, ${memoId})">
                            <span class="group-label">${group}</span>
                        </button>
                    `).join('') || '<p>所属しているグループはありません</p>'}
                </div>
            </div>
            <div class="group-section">
                <div class="group-section-title">
                    追加可能
                    <button type="button" 
                            class="group-action-main-button add" 
                            onclick="addSelectedGroups(${memoId})"
                            disabled>
                        選択したグループを追加
                    </button>
                </div>
                <div class="group-buttons-container">
                    ${nonMemberGroups.map(group => `
                        <button type="button" 
                                class="group-select-button" 
                                data-group="${group}"
                                onclick="toggleGroupSelection(this, ${memoId})">
                            <span class="group-label">${group}</span>
                        </button>
                    `).join('') || '<p>追加可能なグループはありません</p>'}
                </div>
            </div>
            <div class="new-group-section">
                <div class="new-group-title">新規グループを作成</div>
                <div class="new-group-form">
                    <input type="text" 
                           class="new-group-input" 
                           placeholder="新しいグループ名を入力"
                           onkeyup="validateNewGroup(this)">
                    <button type="button" 
                            class="new-group-button" 
                            onclick="createNewGroup(this, ${memoId})"
                            disabled>
                        作成
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // クリックされたボタンのポップオーバーを表示
    popover.classList.add('show');
    
    // ボタンの位置に合わせてポップオーバーを配置
    const buttonRect = button.getBoundingClientRect();
    popover.style.top = `${buttonRect.bottom + window.scrollY + 10}px`;
    popover.style.left = `${buttonRect.left + window.scrollX - (popover.offsetWidth / 2) + (button.offsetWidth / 2)}px`;
    
    // ドキュメント全体のクリックイベントリスナーを追加
    document.addEventListener('click', closePopoverOnClickOutside);
}

// グループの選択状態を切り替える
function toggleGroupSelection(button, memoId) {
    button.classList.toggle('selected');
    
    // 親セクションの追加/削除ボタンの状態を更新
    const section = button.closest('.group-section');
    const actionButton = section.querySelector('.group-action-main-button');
    const hasSelectedGroups = section.querySelectorAll('.group-select-button.selected').length > 0;
    
    actionButton.disabled = !hasSelectedGroups;
}

// グループを更新する関数
async function updateGroup(memoId, newGroup) {
    try {
        const response = await fetch(`http://localhost:8001/api/memos/${memoId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ group: newGroup })
        });
        
        if (!response.ok) {
            throw new Error('グループの更新に失敗しました');
        }

        // メモデータを更新
        memoData = await getData();
        
        // UI更新
        generateMemoList();
        
        // ポップオーバーを閉じる
        document.getElementById(`popover-${memoId}`).classList.remove('show');
    } catch (error) {
        console.error('エラーが発生しました:', error);
    }
}

// 選択したグループを追加
async function addSelectedGroups(memoId) {
    const memo = memoData.find(m => m.id === memoId);
    if (!memo) return;

    const currentGroups = memo.group ? memo.group.split(',').map(g => g.trim()) : [];
    const selectedGroups = Array.from(
        document.querySelectorAll('.group-section:last-child .group-select-button.selected')
    ).map(button => button.dataset.group);
    
    // 新しいグループを追加
    const updatedGroups = [...new Set([...currentGroups, ...selectedGroups])];
    await updateGroup(memoId, updatedGroups.join(', '));
}

// 選択したグループを削除
async function removeFromSelectedGroups(memoId) {
    const memo = memoData.find(m => m.id === memoId);
    if (!memo) return;

    const currentGroups = memo.group ? memo.group.split(',').map(g => g.trim()) : [];
    const selectedGroups = Array.from(
        document.querySelectorAll('.group-section:first-child .group-select-button.selected')
    ).map(button => button.dataset.group);
    
    // 選択されたグループを除外
    const updatedGroups = currentGroups.filter(group => !selectedGroups.includes(group));
    await updateGroup(memoId, updatedGroups.join(', '));
}

// ポップオーバーの外側をクリックしたら閉じる
function closePopoverOnClickOutside(event) {
    if (!event.target.closest('.popover') && !event.target.closest('.edit-group')) {
        document.querySelectorAll('.popover').forEach(p => p.classList.remove('show'));
        document.removeEventListener('click', closePopoverOnClickOutside);
    }
}

// 新規グループ名の入力を検証
function validateNewGroup(input) {
    const button = input.nextElementSibling;
    const groupName = input.value.trim();
    
    // グループ名が空でなく、既存のグループと重複していない場合に有効
    const isValid = groupName !== '' && !availableGroups.includes(groupName);
    button.disabled = !isValid;
}

// 新規グループを作成
function createNewGroup(button, memoId) {
    const input = button.previousElementSibling;
    const groupName = input.value.trim();
    
    if (groupName && !availableGroups.includes(groupName)) {
        // 新しいグループを追加
        availableGroups.push(groupName);
        
        // 入力フィールドをクリア
        input.value = '';
        button.disabled = true;
        
        // ポップオーバーを再表示して最新の状態を反映
        const editButton = document.querySelector(`.memo-item[data-id="${memoId}"] .edit-group`);
        showGroupEditPopover(editButton, memoId);
    }
}