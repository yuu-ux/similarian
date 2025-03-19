from flask import Flask, request, jsonify
from opensearchpy import OpenSearch
import os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)

# OpenSearch の接続設定
admin_user = os.getenv('ADMIN_USER')
admin_password = os.getenv('ADMIN_PASSWORD')
OPENSEARCH_HOST = os.getenv('OPENSEARCH_HOST')
OPENSEARCH_PORT = os.getenv('OPENSEARCH_PORT')

client = OpenSearch (
    hosts=[{'host': OPENSEARCH_HOST, 'port': int(OPENSEARCH_PORT)}],
    http_auth=(admin_user, admin_password),
    use_ssl=True,
    verify_certs=False
)

INDEX_NAME = 'memos'

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

# データ追加（Create）
@app.route('/create', methods=['POST'])
def create():
    data = request.json
    response = client.index(index=INDEX_NAME, body=data)
    return jsonify({'message': 'Note created', 'id': response['_id']})

# データ取得（Read）
@app.route('/memos/<memo_id>', methods=['GET'])
def get_memo(memo_id):
    response = client.get(index=INDEX_NAME, id=memo_id)
    return jsonify(response['_source'])

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
