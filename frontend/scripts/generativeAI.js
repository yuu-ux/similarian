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
        return selectedMemo ? selectedMemo.text : null;
    }).filter(text => text !== null);

    if (selectedTexts.length > 0) {
        const aiDisplayContent = document.querySelector('.ai-display-content');
        // ローディング表示用のdiv
        aiDisplayContent.innerHTML = `
            <div class="ai-loading">
                <p>生成中...</p>
            </div>
        `;

        const payload = {
            texts: selectedTexts
        };

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
            
            const aiDisplayContent = document.querySelector('.ai-display-content');
            
            if (data.status === 'success') {
                // 生成された文章用のdivを作成
                aiDisplayContent.innerHTML = `
                    <div class="ai-generated-content">
                        <div class="ai-generated-header">
                            <h3>生成された文章</h3>
                            <span class="ai-generated-time">${new Date().toLocaleString()}</span>
                        </div>
                        <div class="ai-generated-text">
                            ${marked.parse(data.generated_text)}
                        </div>
                    </div>
                `;
            } else {
                // エラーメッセージ用のdiv
                aiDisplayContent.innerHTML = `
                    <div class="ai-error-content">
                        <div class="error-message">
                            <h3>エラーが発生しました</h3>
                            <p>${data.message}</p>
                        </div>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error("エラー:", error);
            const aiDisplayContent = document.querySelector('.ai-display-content');
            // エラーメッセージ用のdiv
            aiDisplayContent.innerHTML = `
                <div class="ai-error-content">
                    <div class="error-message">
                        <h3>エラーが発生しました</h3>
                        <p>サーバーとの通信に失敗しました</p>
                    </div>
                </div>
            `;
        });
    } else {
        const aiDisplayContent = document.querySelector('.ai-display-content');
        // 警告メッセージ用のdiv
        aiDisplayContent.innerHTML = `
            <div class="ai-warning-content">
                <div class="warning-message">
                    <h3>メモが選択されていません</h3>
                    <p>生成AIを使用するには、メモを選択してください</p>
                </div>
            </div>
        `;
    }
  }
  