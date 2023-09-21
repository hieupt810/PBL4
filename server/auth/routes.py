from flask import Blueprint, jsonify, request
from utils import generate_token, get_neo4j, query, valid_request
from werkzeug.security import check_password_hash, generate_password_hash

auth_bp = Blueprint("auth", __name__)
db = get_neo4j()


@auth_bp.route("/register", methods=["POST"])
def register():
    requires = ["name", "username", "password"]
    req = request.get_json()
    try:
        if not valid_request(req, requires):
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query("""MATCH (u:User {username: $username}) RETURN u.name LIMIT 1"""),
            routing_="r",
            username=req["username"],
        )
        if len(records) > 0:
            return jsonify({"message": "E004", "status": 403}), 200

        _, _, _ = db.execute_query(
            query(
                """CREATE (u:User {username: $username, password: $password, token: $token, name: $name, role: 0})"""
            ),
            routing_="w",
            username=req["username"],
            password=generate_password_hash(req["password"]),
            token=generate_token(),
            name=req["name"],
        )
        return jsonify({"message": "I001", "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200


@auth_bp.route("/login", methods=["POST"])
def login():
    requires = ["username", "password"]
    req = request.get_json()
    try:
        if not valid_request(req, requires):
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query(
                """MATCH (u:User {username: $username})
                RETURN u.password AS password LIMIT 1"""
            ),
            routing_="r",
            username=req["username"],
        )
        if not len(records) == 1:
            return jsonify({"message": "E005", "status": 401}), 200
        if not check_password_hash(records[0]["password"], str(req["password"])):
            return jsonify({"message": "E006", "status": 401}), 200

        token = generate_token()
        _, _, _ = db.execute_query(
            query(
                """MATCH (u:User {username: $username})
                SET u.token = $token"""
            ),
            routing_="w",
            username=req["username"],
            token=token,
        )
        return jsonify({"message": "I002", "status": 200, "token": token}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200


@auth_bp.route("", methods=["PUT"])
def update_user():
    requires = ["username", "name"]
    req = request.get_json()
    try:
        if not valid_request(req, requires):
            return jsonify({"message": "E002", "status": 400}), 200
        if not "token" in request.headers:
            return jsonify({"message": "E003", "status": 401}), 200

        records, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})
                RETURN u.username AS username, u.role AS role LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("token"),
        )
        if not len(records) == 1:
            return jsonify({"message": "E003", "status": 401}), 200
        if records[0]["username"] != req["username"] and records[0]["role"] == 0:
            return jsonify({"message": "E007", "status": 406}), 200

        _, _, _ = db.execute_query(
            query(
                """MATCH (u:User {username: $username})
                SET u.name = $name"""
            ),
            routing_="w",
            username=req["username"],
            name=req["name"],
        )
        return jsonify({"message": "I003", "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200


@auth_bp.route("", methods=["DELETE"])
def delete_user():
    requires = ["username"]
    req = request.get_json()
    try:
        if not valid_request(req, requires):
            return jsonify({"message": "E002", "status": 400}), 200
        if not "token" in request.headers:
            return jsonify({"message": "E003", "status": 401}), 200

        records, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})
                RETURN u.username AS username, u.role AS role LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("token"),
        )
        if not len(records) == 1:
            return jsonify({"message": "E003", "status": 401}), 200
        if records[0]["username"] != req["username"] and records[0]["role"] == 0:
            return jsonify({"message": "E007", "status": 406}), 200

        _, _, _ = db.execute_query(
            query(
                """MATCH (u:User {username: $username})
                DETACH DELETE u"""
            ),
            routing_="w",
            username=req["username"],
        )
        return jsonify({"message": "I004", "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200
