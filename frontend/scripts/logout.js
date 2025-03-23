// ログアウト処理を実行する関数
async function handleLogout() {
    console.log("ログアウト処理を開始");  // デバッグ用
    try {
        const response = await fetch('http://localhost:8001/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const data = await response.json();

        if (data.status === "success") {
            alert("ログアウトしました");
            // ログインページにリダイレクト
            window.location.href = "http://localhost:8001/login";
        } else {
            alert(`エラー: ${data.message}`);
        }
    } catch (error) {
        console.error("エラー:", error);
        alert("ログアウト中にエラーが発生しました");
    }
}

// グローバルに関数を公開
window.setupLogout = function() {
    console.log("✅ ログアウトのセットアップ開始");
    
    // IDを使用して要素を取得
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        // クリックイベントを直接設定
        logoutButton.onclick = function(event) {
            event.preventDefault();
            console.log("ログアウトボタンがクリックされました");  // デバッグ用
            handleLogout();
        };
        console.log("✅ ログアウトボタンのイベントリスナーを設定しました");
    } else {
        console.error("❌ ログアウトボタンが見つかりません");
    }
}; 