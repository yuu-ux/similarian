from opensearchpy import OpenSearch
from datetime import timedelta, datetime
from flask import Blueprint, jsonify, request, session
from dotenv import load_dotenv
import os

member_bp = Blueprint('member', __name__)


INDEX_NAME = 'member'

load_dotenv()

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

@member_bp.route('/signup', methods=['POST'])
def register():
    name = request.form.get('name')
    email = request.form.get('email')
    password = request.form.get('password')

    if not name or not email or not password:
        return jsonify({'status': 'error', 'message': '氏名とメールアドレス，パスワードを入力してください'}), 400
    data = {
        'name': name,
        'email': email,
        'password': password,
        'created_at': datetime.now().isoformat()
    }

    try:
        client.index(index=INDEX_NAME, body=data)        
        return jsonify({'status': 'success', 'message': 'ユーザー登録に成功しました'}), 201
    except Exception as e:
        return jsonify({'status': 'success', 'message': '登録に失敗しました'}), 500

@member_bp.route('/login', methods=['POST'])
def login():
    email = request.form.get('email')
    password = request.form.get('password')

    if not email or not password:
        return jsonify({'status': 'error', 'message': 'メールアドレスとパスワードを入力してください'}), 400
     
    #OpenSearchでメールアドレスとパスワードを入力
    query = {
        'query': {
            'bool': {
                'must': [
                    {'match': {'email': email}},
                    {'match': {'password': password}}
                ]
            }
        }
    }

    response = client.search(index=INDEX_NAME, body=query)
    hits = response['hits']['hits']
    try:
        response = client.search(index=INDEX_NAME, body=query)
        hits = response['hits']['hits']
        if not hits:
            return jsonify({'status': 'error', 'message': 'ユーザーが見つかりませんでした'}), 404
        return jsonify({'status': 'success', 'message': 'ログイン成功しました'}), 201
    except:
        return jsonify({'status': 'error', 'message': 'サーバーエラー'}), 500

@member_bp.route('/logout', methods=['POST'])
def logout():
    try:
        # セッションをクリア
        session.clear()
        return jsonify({'status': 'success', 'message': 'ログアウトしました'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': 'ログアウトに失敗しました'}), 500
