import random
import string
import uuid
from textwrap import dedent
from typing import cast

from config import Config
from flask import Flask
from flask_cors import CORS
from neo4j import GraphDatabase, basic_auth
from typing_extensions import LiteralString

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


def get_neo4j():
    return GraphDatabase.driver(
        uri=Config.NEO4J_URI,
        auth=basic_auth(Config.NEO4J_USERNAME, Config.NEO4J_PASSWORD),
    )


def uniqueid() -> str:
    return str(uuid.uuid1())


def query(q: LiteralString) -> LiteralString:
    return cast(LiteralString, dedent(q).strip())


def generate_token() -> str:
    characters = string.ascii_uppercase + string.ascii_lowercase + string.digits
    return "".join(random.choice(characters) for _ in range(10))


def valid_request(request, requires) -> bool:
    if len(requires) == 0:
        return True
    for require in requires:
        if not require in request:
            return False
    return True
