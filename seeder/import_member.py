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
client = OpenSearch(
    hosts=[{'host': OPENSEARCH_HOST, 'port': OPENSEARCH_PORT}],
    http_auth=(ADMIN_USER, ADMIN_PASSWORD),
    use_ssl=True,
    verify_certs=False
)

# サンプルデータ（追加するメンバー）
members = [
    {'id': '1', 'email': 'user1@example.com', 'password': 'password123'},
    {'id': '2', 'email': 'user2@example.com', 'password': 'securepass'},
    {'id': '3', 'email': 'user3@example.com', 'password': 'mypassword'},
]

# パスワードをハッシュ化する関数
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# メンバーをインポート
for member in members:
    doc = {
        'id': member['id'],
        'email': member['email'],
        'password': hash_password(member['password']),
        'create_at': datetime.datetime.now(datetime.UTC).strftime('%Y-%m-%d %H:%M:%S'),
        'update_at': datetime.datetime.now(datetime.UTC).strftime('%Y-%m-%d %H:%M:%S')
    }

    response = client.index(index=INDEX_NAME, id=member['id'], body=doc)
    print(f'Inserted {member['email']}: {response['result']}')

print('Data import complete!')
