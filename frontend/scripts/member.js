//ユーザー情報をデータベースに登録する関数


document.addEventListener('DOMContentLoaded', () => {
	//ボタン要素を取得
	const registerButton = document.querySelector('button[type="button"]');

	//ボタンにクリックイベントリスナーを追加
	registerButton.addEventListener('click', () => {
		//イベントが発生したことを確認
		console.log('登録ボタンがクリックされました!');
		
		//入力された値を取得
		const name = document.getElementById('myname').value;
		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;

		//入力値をコンソールに出力(デバッグ用)
		console.log(name, email, password)

		//入力値がからの場合のバリデーション
		if (!name || !email || !password){
			alert('全てのフィールドを入力してください')
			return ;
		}

		const formData = new URLSearchParams();
		formData.append('name', name)
		formData.append('email', email)
		formData.append('password', password)

		//サーバー側にデータを送信
		fetch('http://localhost:8001/api/signup', {
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
			.then((data) => {
				if (data.status === 'success') {
					alert('ユーザー登録に成功しました！');
					//成功した場合に別のURLにリダイレクト
					window.location.href = "http://localhost:8001"
				}
				else {
					alert('エラー: ${data.message}');
				}
			})
			.catch((error) => {
				console.error('エラー:', error);
				alert('登録中にエラーが発生しました。');
			});
	});
});
