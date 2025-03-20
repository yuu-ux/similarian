from flask import Flask, request, jsonify, session, send_from_directory
from opensearchpy import OpenSearch
import os
from dotenv import load_dotenv
from datetime import timedelta, datetime
from flask_cors import CORS

load_dotenv()
app = Flask(__name__)
CORS(app)  # CORSを有効化
app.secret_key = 'user'
app.permanent_session_lifetime = timedelta(minutes=5)

# OpenSearch の接続設定
admin_user = os.getenv('ADMIN_USER')
admin_password = os.getenv('ADMIN_PASSWORD')
OPENSEARCH_HOST = os.getenv('OPENSEARCH_HOST')
OPENSEARCH_PORT = os.getenv('OPENSEARCH_PORT')

client = OpenSearch (
    hosts=[{'host': OPENSEARCH_HOST, 'port': int(OPENSEARCH_PORT)}],
    http_auth=(admin_user, admin_password),
    use_ssl=False,
    verify_certs=False
)

INDEX_NAME = 'memo'

@app.route('/', methods=['GET'])
def index():
    try:
        query = {
            'query': {
                'match_all': {}
            },
            'size': 10000,
        }
        response = client.search(index=INDEX_NAME, body=query)
        documents = [hit['_source'] for hit in response['hits']['hits']]
        return jsonify(documents)
    except Exception as e:
        print(f"OpenSearch error: {str(e)}")  # エラーの詳細をログに出力
        return jsonify({'error': str(e)}), 500

def get_latest_id():
    try:
        query = {
            'size': 1,
            'sort': [{'id': {'order': 'desc'}}],
            '_source': ['id'],
            'query': {
                'match_all': {},
            },
        }
        response = client.search(index=INDEX_NAME, body=query)
        id = response['hits']['hits'][0]['_source']['id'] if response['hits']['hits'] else 1
        return int(id)
    except Exception as e:
        print(f"Error getting latest ID: {str(e)}")  # エラーの詳細をログに出力
        return 1  # エラー時は1を返す

# データ追加（Create）
@app.route('/create', methods=['POST'])
def create():
    text = request.form.get('memo', '')
    group = request.form.get('group', '')
    if not text:
        return jsonify({'status': 'error', 'message': 'メモの内容が空です'}), 400
    data = {
        'id': get_latest_id() + 1,
        'text': text,
        'group': group,
        'similarity': 0.11,
        'create_at': datetime.now().isoformat(),
        'modify_at': datetime.now().isoformat(),
    }
    try:
        client.index(index=INDEX_NAME, body=data)
        return jsonify({'status': 'success', 'message': 'メモを登録しました'}), 201
    except ValueError:
        return jsonify({'status': 'error', 'message': 'メモの登録に失敗しました'}), 400

@app.route('/delete', methods=['POST'])
def delete():
    id = request.form.get('id')
    try:
        client.delete(INDEX_NAME, id)
        return jsonify({'status': 'success', 'message': '削除しました'}), 201
    except:
        return jsonify({'status': 'error', 'message': '削除できませんでした'}), 400

@app.route('/update', methods=['POST'])
def update():
    id = request.form.get('id')
    text = request.form.get('text')
    group = request.form.get('group')
    data = {
        'text': text,
        'group': group,
        'similarity': 0.11,
        'modify_at': datetime.now().isoformat(),
    }
    try:
        client.update(INDEX_NAME, id, body=data)
        return jsonify({'status': 'success', 'message': '更新しました'}), 201
    except:
        return jsonify({'status': 'success', 'message': '更新できませんでした'}), 404

# データ検索（全文検索）
@app.route('/memos/search', methods=['GET'])
def search_memos():
    query_text = request.args.get('query', '')
    search_query = {
        'query': {
            'match': {'content': query_text}
        }
    }
    response = client.search(index=INDEX_NAME, body=search_query)
    results = [hit['_source'] for hit in response['hits']['hits']]
    return jsonify(results)

if __name__ == '__main__':
    app.run()
