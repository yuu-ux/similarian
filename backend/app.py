from flask import Flask, request, jsonify
from opensearchpy import OpenSearch
import os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)

# OpenSearch の接続設定
admi_user = os.getenv('ADMIN_USER')
admi_password = os.getenv('ADMIN_PASSWORD')
OPENSEARCH_HOST = os.getenv("OPENSEARCH_HOST", "http://localhost:9200")
client = OpenSearch(hosts=[OPENSEARCH_HOST], http_auth=(admi_user, admi_password))

INDEX_NAME = "notes"

# データ追加（Create）
@app.route("/create", methods=["POST"])
def create():
    data = request.json
    response = client.index(index=INDEX_NAME, body=data)
    return jsonify({"message": "Note created", "id": response["_id"]})

# データ取得（Read）
@app.route("/notes/<note_id>", methods=["GET"])
def get_note(note_id):
    response = client.get(index=INDEX_NAME, id=note_id)
    return jsonify(response["_source"])

# データ検索（全文検索）
@app.route("/notes/search", methods=["GET"])
def search_notes():
    query_text = request.args.get("query", "")
    search_query = {
        "query": {
            "match": {"content": query_text}
        }
    }
    response = client.search(index=INDEX_NAME, body=search_query)
    results = [hit["_source"] for hit in response["hits"]["hits"]]
    return jsonify(results)

if __name__ == "__main__":
    app.run()
