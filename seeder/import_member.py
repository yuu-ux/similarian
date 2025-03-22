from opensearchpy import OpenSearch
import datetime
import hashlib

# OpenSearch の設定
OPENSEARCH_HOST = 'opensearch'
OPENSEARCH_PORT = 9200
INDEX_NAME = 'member'
ADMIN_USER = 'admin'
ADMIN_PASSWORD = '514_YugaEhara'

# 接続設定
client = OpenSearch (
    hosts=[{'host': OPENSEARCH_HOST, 'port': OPENSEARCH_PORT}],
    http_auth=(ADMIN_USER, ADMIN_PASSWORD),
    use_ssl=False,
    verify_certs=False
)

# 既存のインデックス削除
if client.indices.exists(index=INDEX_NAME):
    client.indices.delete(index=INDEX_NAME)

# 新しいインデックス作成
index_body = {
    "settings": {
        "index": {
            "knn": False
        }
    },
    "mappings": {
        "properties": {
            "id": {"type": "long"},
            "name": {"type": "keyword"},
            "email": {"type": "keyword"},
            "password": {"type": "keyword"},
            "created_at": {"type": "date"},
            "updated_at": {"type": "date"},
        }
    }
}

client.indices.create(index=INDEX_NAME, body=index_body)
print("✅ インデックス作成完了")

# サンプルコード (追加するメンバー)
members = [
    {
        'id': 1,
        'name': 'アンガールズ田中',
        'email': 'test@gmail.com',
        'password': 'test20030425',
    },
    {
        'id': 2,
        'name': 'でんだいくん',
        'email': 'test1@gmail.com',
        'password': 'password1230',
    }
]



# # サンプルデータ（追加するメンバー）
# members = [
#     {'id': '1', 'email': 'user1@example.com', 'password': 'password123'},
#     {'id': '2', 'email': 'user2@example.com', 'password': 'securepass'},
#     {'id': '3', 'email': 'user3@example.com', 'password': 'mypassword'},
# ]


# パスワードをハッシュ化する関数
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# メンバーをインポート
for member in members:
    doc = {
        'id': member['id'],
        'name': member['name'],
        'email': member['email'],
        'password': hash_password(member['password']),
        'create_at': datetime.datetime.now(datetime.UTC).strftime('%Y-%m-%d %H:%M:%S'),
        'update_at': datetime.datetime.now(datetime.UTC).strftime('%Y-%m-%d %H:%M:%S')
    }

    response = client.index(index=INDEX_NAME, id=member['id'], body=doc)
    print(f'Inserted {member['email']}: {response['result']}')

print('Data import complete!')
