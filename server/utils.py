import uuid
from datetime import datetime
from textwrap import dedent
from typing import cast

from config import Config
from flask import Flask, Request, jsonify
from flask_cors import CORS
from neo4j import Driver, GraphDatabase, basic_auth
from typing_extensions import LiteralString
from flask import Flask, send_from_directory

app = None


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)
    return app


def get_app() -> Flask:
    global app
    if app:
        return app
    app = create_app()
    return app


def getNeo4J() -> Driver:
    return GraphDatabase.driver(
        uri=Config.NEO4J_URI,
        auth=basic_auth(Config.NEO4J_USERNAME, Config.NEO4J_PASSWORD),
    )


def uniqueID() -> str:
    return str(uuid.uuid4())


def query(q: LiteralString) -> LiteralString:
    return cast(LiteralString, dedent(q).strip())


def validRequest(request: Request, requires: list[str]) -> bool:
    req = request.get_json()
    for require in requires:
        if require not in req:
            return False

    return True


def getDatetime() -> str:
    return datetime.now().strftime("%Y/%m/%d %H:%M")


def respond(data=[], msg: str = "I001", code: int = 200):
    return jsonify({"message": msg, "code": code, "data": data}), 200


def respondWithError(msg: str = "E001", code: int = 404):
    return jsonify({"message": msg, "code": code}), 400

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def history_file(filename):
    return send_from_directory('static/history', filename)
