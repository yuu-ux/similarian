from opensearchpy import OpenSearch
import datetime
import hashlib

# OpenSearch の設定
OPENSEARCH_HOST = 'opensearch'
OPENSEARCH_PORT = 9200
INDEX_NAME = 'memo'
ADMIN_USER = 'admin'
ADMIN_PASSWORD = '514_YugaEhara'

# 接続設定
client = OpenSearch(
    hosts=[{'host': OPENSEARCH_HOST, 'port': OPENSEARCH_PORT}],
    http_auth=(ADMIN_USER, ADMIN_PASSWORD),
    use_ssl=True,
    verify_certs=False
)

# サンプルデータ（追加するメンバー）
memo_dict = [
    {
        'id': 1,
        'date': '2025-03-01',
        'text': '# メモアプリのアイディア\n\n今日は新しいメモアプリのアイディアを考えた。\n\n**重要ポイント**:\n- 内容ベースの検索を取り入れたい\n- セマンティック分析の活用\n- ユーザーフレンドリーなインターフェース',
        'group': 'アイディア',
        'similarity': 0.894
    },
    {
        'id': 2,
        'date': '2025-03-02',
        'text': '## 生成AIについて調べた\n\n自然言語処理の進化が著しい。最近のモデルは以下の特徴がある：\n\n1. 高精度な言語理解\n2. 文脈を考慮した応答\n3. マルチモーダル対応\n\n今後の研究課題も多い。',
        'group': 'リサーチ',
        'similarity': 0.754
    },
    {
        'id': 3,
        'date': '2025-03-05',
        'text': '# 検索機能の強化方法\n\n日記の検索機能を強化する方法を考えた。\n\n## 主な方針\n- タグだけでなく、**意味ベース**で分類\n- キーワードのクラスタリング\n- ユーザーの検索履歴を学習\n\n> タグだけでなく、意味ベースで分類できると本当に便利。# a\n# a \n # a \n # a \n # a \n # a \n # dahdal \n',
        'group': 'アイディア',
        'similarity': 0.685
    },
    {
        'id': 4,
        'date': '2025-03-07',
        'text': '# AI技術まとめ\n\n最近のAI技術をまとめた。\n\n## 注目技術\n- 特に意味ベースの検索技術が注目されている\n- ベクトル検索エンジンの実用化\n- エンベディングモデルの高精度化\n\n```python\n# 簡単な類似度計算の例\ndef calc_similarity(vec1, vec2):\n    return dot_product(vec1, vec2) / (norm(vec1) * norm(vec2))\n```',
        'group': 'リサーチ',
        'similarity': 0.543
    },
    {
        'id': 5,
        'date': '2025-03-07',
        'text': '## AI技術の最前線\n\n最近のAI技術をまとめた。\n\n特に意味ベースの検索技術が注目されている：\n\n1. 大規模言語モデルの活用\n2. 高次元ベクトル空間での検索\n3. リアルタイム分析の実現\n\n**今後の展望**: クラウドとエッジの融合が進む',
        'group': 'リサーチ',
        'similarity': 0.542
    },
    {
        'id': 6,
        'date': '2025-03-07',
        'text': '# AI技術調査メモ\n\n最近のAI技術をまとめた。\n\n特に意味ベースの検索技術が注目されている。\n\n## 主要プレイヤー\n- OpenAI\n- Anthropic\n- Google\n- Meta\n\n> 「意味」を理解するAIの発展が、検索の未来を変える',
        'group': '',
        'similarity': 0.541
    },
    {
        'id': 7,
        'date': '2025-03-08',
        'text': '# UI設計メモ\n\nメモアプリのUI設計について考えた。\n\n## 基本方針\n- シンプルさと機能性のバランスが重要\n- 視覚的階層を明確に\n- タッチ操作の最適化\n\n### 重要な要素\n1. 直感的なナビゲーション\n2. 高コントラストの可読性\n3. 一貫したデザイン言語',
        'group': 'デザイン',
        'similarity': 0.623
    },
    {
        'id': 8,
        'date': '2025-03-09',
        'text': '# データ構造化の検討\n\nデータの構造化について検討。\n\n## 候補フォーマット\n- JSONフォーマットが最適かもしれない\n- NoSQLデータベースとの親和性\n- スキーマの柔軟性\n\n```json\n{\n  \'id\': \'unique-id\',\n  \'content\': \'メモ内容\',\n  \'tags\': [\'tag1\', \'tag2\'],\n  \'created_at\': \'2025-03-09T10:30:00Z\'\n}\n```',
        'group': '開発',
        'similarity': 0.715
    },
    {
        'id': 9,
        'date': '2025-03-10',
        'text': '# セマンティック検索の実装\n\nセマンティック検索の実装方法を調査。\n\n## 有望な選択肢\n- ベクトルデータベースが有望か\n- Pinecone、Weaviate、Milvusなどの比較\n- クエリ最適化の方法\n\n### 実装ステップ\n1. テキストのエンコード\n2. ベクトルの格納\n3. 類似度検索の実装\n4. UI連携',
        'group': 'リサーチ',
        'similarity': 0.832
    },
    {
        'id': 10,
        'date': '2025-03-10',
        'text': '# プロジェクトタイムライン\n\nプロジェクトのタイムラインを作成。\n\n## 主要マイルストーン\n- 来月中にプロトタイプを完成させたい\n- 4月：基本機能の実装\n- 5月：ベータテスト開始\n- 6月：正式リリース\n\n> スケジュールは柔軟に調整する必要あり',
        'group': 'プロジェクト管理',
        'similarity': 0.452
    },
    {
        'id': 11,
        'date': '2025-03-11',
        'text': '# 音声認識機能の検討\n\n音声認識機能の追加を検討。\n\n## 市場動向\n- ボイスメモの需要が高まっている\n- 音声→テキスト変換の精度向上\n- マルチ言語対応の必要性\n\n### 技術選択肢\n- OpenAI Whisper\n- Google Speech-to-Text\n- 独自モデルの開発',
        'group': 'アイディア',
        'similarity': 0.578
    },
    {
        'id': 12,
        'date': '2025-03-11',
        'text': '# 競合分析\n\n競合アプリの分析を行った。\n\n## 主要競合\n1. **Evernote**: 多機能だが複雑化\n2. **Apple Notes**: シンプルだが機能制限あり\n3. **Notion**: 柔軟性高いが学習コスト大\n\n## 差別化戦略\n- 差別化ポイントを明確にする必要がある\n- AI活用による自動分類が強み\n- シンプルUXと高度機能のバランス',
        'group': 'マーケティング',
        'similarity': 0.612
    },
    {
        'id': 13,
        'date': '2025-03-12',
        'text': '# ユーザーフィードバック収集\n\nユーザーフィードバックの収集方法について考えた。\n\n## 必要なもの\n- アンケートフォームの設計が必要\n- インタビュー対象者の選定\n- ユーザビリティテストの方法\n\n### 質問例\n1. 「現在のメモ管理で困っていることは？」\n2. 「理想のメモアプリに欲しい機能は？」\n3. 「どのような検索方法が便利だと思いますか？」',
        'group': 'ユーザーリサーチ',
        'similarity': 0.524
    },
    {
        'id': 14,
        'date': '2025-03-12',
        'text': '# メモ共有機能のアイディア\n\nメモの共有機能についてアイディアを出した。\n\n## 検討事項\n- ソーシャル要素を取り入れるべきか\n- プライバシー設定の粒度\n- 共同編集機能の実装\n\n### 共有オプション\n- リンク共有\n- 招待制\n- 公開/非公開設定\n\n> 共有しやすさとセキュリティのバランスが鍵',
        'group': 'アイディア',
        'similarity': 0.673
    },
]

# メンバーをインポート
for memo in memo_dict:
    doc = {
        'id': memo['id'],
        'date': memo['date'],
        'text': memo['text'],
        'group': memo['group'],
        'similarity': memo['similarity'],
        'create_at': datetime.datetime.now(datetime.UTC).strftime('%Y-%m-%d %H:%M:%S'),
        'update_at': datetime.datetime.now(datetime.UTC).strftime('%Y-%m-%d %H:%M:%S')
    }

    response = client.index(index=INDEX_NAME, id=memo['id'], body=doc)

print('Data import complete!')
