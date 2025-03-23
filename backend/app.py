from flask import Flask, request, jsonify, session
from opensearchpy import OpenSearch
import os
from dotenv import load_dotenv
from datetime import timedelta, datetime
import numpy as np
from sentence_transformers import SentenceTransformer
from member import member_bp


load_dotenv()
app = Flask(__name__)
app.secret_key = 'user'
app.permanent_session_lifetime = timedelta(minutes=5)
app.register_blueprint(member_bp)

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

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
INDEX_NAME = 'memo'

@app.route('/', methods=['GET'])
def index():
    query = {
        'query': {
            'match_all': {}
        },
        'size': 10000,
    }
    response = client.search(index=INDEX_NAME, body=query)
    documents = [hit['_source'] for hit in response['hits']['hits']]
    return jsonify(documents)

def get_latest_id():
    query = {
        'size': 1,
        'sort': [{'id': {'order': 'desc'}}],
        '_source': ['id'],
        'query': {
            'match_all': {},
        },
    }
    try:
        response = client.search(index=INDEX_NAME, body=query)
        id = response['hits']['hits'][0]['_source']['id'] if response['hits']['hits'] else 0
    except:
        id = 0
    return int(id)

@app.route('/create', methods=['POST'])
def create():
    text = request.form.get('memo', '')
    group = request.form.get('group', '')
    if not text:
        return jsonify({'status': 'error', 'message': 'メモの内容が空です'}), 400

    vector = model.encode(text).tolist()
    data = {
        'id': get_latest_id() + 1,
        'text': text,
        'group': group,
        'vector': vector,
        'create_at': datetime.now().isoformat(),
        'modify_at': datetime.now().isoformat(),
    }
    try:
        client.index(index=INDEX_NAME, id=data['id'], body=data)
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

    if id is None:
        return jsonify({'status': 'error', 'message': '不正なリクエストです'})
    vector = None
    if text:
        vector = model.encode(text).tolist()

    data = {
        'doc' : {
            'text': text if text else None,
            'group': group if group else None,
            'vector': vector if vector else None,
            'modify_at': datetime.now().isoformat(),
        },
    }

    try:
        client.update(INDEX_NAME, id, body=data)
        return jsonify({'status': 'success', 'message': '更新しました'}), 201
    except:
        return jsonify({'status': 'error', 'message': '更新できませんでした'}), 500


# データ検索（k-NN検索）
@app.route('/search', methods=['GET'])
def search_memos():
    query_text = request.args.get('query', '')
    # ベクトル化
    query_vector = model.encode(query_text).tolist()
    query = {
        'size': 10,
        'query': {
            'knn': {
                'vector': {
                    'vector': query_vector,
                    'k': 10,
                    # 'num_candidates': 10
                }
            }
        }
    }
    response = client.search(index=INDEX_NAME, body=query)
    return jsonify(response['hits']['hits'])

if __name__ == '__main__':
    app.run()
