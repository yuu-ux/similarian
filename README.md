### 表示方法
拡張機能の"live server"を入れて、右クリックで”Open with live server” もしくは、右下の”Go Live”をクリックしてください。
自動的にページが開きます。

自動で開かない場合は、URLに
http://localhost:5500/similarian/
と入力しましょう

## Dockerについて
Dockerの起動方法
`docker-compose up -d` または `docker compose up -d`

Dockerの停止
`docker-compose stop` または `docker compose stop`
Dockerの再開
`docker-compose start` または `docker compose start`

Dockerの終了
`docker-compose down` または `docker compose down`

## 動作確認
ページの表示
http://localhost:8001/
をURLへ

メモ一覧のデータ(json)
`docker compose exec -it app python ../seeder/import_memo.py`（メモのデモをデータベースへ格納）
をターミナルで入力後、
http://localhost:8001/api
をURLへ

デモを格納しなければ 500 のエラーコードでるかも。。。

OpenSerch
http://localhost:9200/
をURLへ