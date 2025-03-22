// 生成AIのセットアップ
window.setupGenerativeAI = function() {
  console.log("✅ 生成AIのセットアップ開始");

  const generateAiBtn = document.getElementById("generateAiBtn");
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

  console.log("✅ 生成AIのセットアップ完了");
};

function toggleAI() {
    const memoList = document.querySelector('.memo-list');
    const aiDisplayArea = document.querySelector('.ai-display-area');
    
    memoList.classList.toggle('with-ai');
    aiDisplayArea.classList.toggle('active');
}