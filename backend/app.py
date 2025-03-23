from flask import Flask, request, jsonify, session
from opensearchpy import OpenSearch
import os
from dotenv import load_dotenv
from datetime import timedelta, datetime
import numpy as np
from sentence_transformers import SentenceTransformer
import boto3
import json
from botocore.exceptions import ClientError

load_dotenv()
app = Flask(__name__)
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

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
INDEX_NAME = 'memo'

# Bedrockのクライアント設定を修正
bedrock_runtime = boto3.client(
    service_name='bedrock-runtime',
    region_name='us-west-2',
    aws_session_token=os.getenv('AWS_SESSION_TOKEN'),
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)

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
        return jsonify({'status': 'success', 'message': '更新できませんでした'}), 404

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

@app.route('/sendTexts', methods=['POST'])
def send_texts():
    try:
        data = request.json
        texts = data.get('texts', [])
        
        print("受け取ったテキスト:", texts)  # デバッグログ

        # テキストを結合して1つのプロンプトにする
        combined_text = " ".join(texts)

        # Claudeへのリクエストボディを作成
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "messages": [
                {
                    "role": "user",
                    "content": combined_text
                }
            ],
            "temperature": 0.7,
            "top_p": 1,
            "top_k": 250
        }

        try:
            print("Bedrockにリクエスト送信:", json.dumps(request_body, indent=2))  # デバッグログ
            
            print(os.getenv('AWS_SECRET_ACCESS_KEY'))
            print(os.getenv('AWS_ACCESS_KEY_ID'))
            print(os.getenv('AWS_SESSION_TOKEN'))
            # Bedrock APIを呼び出し
            response = bedrock_runtime.invoke_model(
                modelId="anthropic.claude-3-sonnet-20240229-v1:0",
                body=json.dumps(request_body),
                contentType="application/json",
                accept="application/json"
            )

            # レスポンスの処理
            response_body = json.loads(response['body'].read().decode())
            print("Bedrockからのレスポンス:", json.dumps(response_body, indent=2))  # デバッグログ

            # レスポンスから生成されたテキストを取得
            generated_text = response_body['content'][0]['text']

            return jsonify({
                'status': 'success',
                'message': 'テキストを生成しました',
                'generated_text': generated_text
            })

        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            print(f"Bedrock APIエラー: {error_code} - {error_message}")  # デバッグログ
            return jsonify({
                'status': 'error',
                'message': f'Bedrock APIエラー: {error_message}'
            }), 500

    except Exception as e:
        print(f"予期せぬエラー: {str(e)}")  # デバッグログ
        return jsonify({
            'status': 'error',
            'message': f'テキストの生成に失敗しました: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run()
