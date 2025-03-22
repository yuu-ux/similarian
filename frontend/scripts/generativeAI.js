// 生成AIのセットアップ
window.setupGenerativeAI = function() {
  console.log("✅ 生成AIのセットアップ開始");

  const generateAiBtn = document.getElementById("generateAiBtn");
  const aiGenerateBtn = document.querySelector('.ai-generate-button');
  const aiDisplayArea = document.querySelector('.ai-display-area');
  const aiCloseButton = document.querySelector('.ai-close-button');
  const memoList = document.querySelector('.memo-list');

  if (generateAiBtn && aiDisplayArea && aiCloseButton) {
    generateAiBtn.addEventListener('click', () => {
      
      aiDisplayArea.classList.remove('hidden');
      aiDisplayArea.classList.add('active');
      memoList.classList.add('with-ai');
    });

    aiCloseButton.addEventListener('click', () => {
      aiDisplayArea.classList.remove('active');
      aiDisplayArea.classList.add('hidden');
      memoList.classList.remove('with-ai');
    });
  }
  if (aiGenerateBtn) {
    aiGenerateBtn.addEventListener('click', () => {
      sendSelectedTextToBackend();
    });
  }

  console.log("✅ 生成AIのセットアップ完了");
};

function toggleAI() {
    const memoList = document.querySelector('.memo-list');
    const aiDisplayArea = document.querySelector('.ai-display-area');
    
    memoList.classList.toggle('with-ai');
    aiDisplayArea.classList.toggle('active');
}

// 選択されたテキストをバックエンドに渡す関数
function sendSelectedTextToBackend() {
  const selectedTexts = Array.from(selectedMemos).map(id => {
      const selectedMemo = memoData.find(m => m.id === id);
      return selectedMemo ? selectedMemo.text : null; // メモのテキストを取得
  }).filter(text => text !== null); // nullを除外

  if (selectedTexts.length > 0) {
      // バックエンドに送信するためのデータを準備
      const payload = {
          texts: selectedTexts
      };

      // バックエンドにPOSTリクエストを送信
      fetch("http://localhost:8001/api/sendTexts", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
      })
      .then(response => response.json())
      .then(data => {
          console.log("バックエンドからの応答:", data);
          // 必要に応じて、成功メッセージやエラーメッセージを表示
      })
      .catch(error => {
          console.error("エラー:", error);
      });
  } else {
      console.log("選択されたメモがありません。");
  }
}
