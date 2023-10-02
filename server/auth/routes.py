from flask import Blueprint, jsonify, request
from utils import get_neo4j, query, uniqueid, valid_request
from werkzeug.security import check_password_hash, generate_password_hash

auth_bp = Blueprint("auth", __name__)
db = get_neo4j()


@auth_bp.route("/register", methods=["POST"])
def register():
    requires = ["first_name", "last_name", "gender", "username", "password"]
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
            return jsonify({"message": "E004", "status": 400}), 200

        _, _, _ = db.execute_query(
            query(
                """CREATE (u:User)
                SET u.username = $username,
                    u.password = $password,
                    u.first_name = $first_name,
                    u.last_name = $last_name,
                    u.gender = $gender,
                    u.id = $id,
                    u.role = 0,
                    u.token = $token"""
            ),
            routing_="w",
            username=req["username"],
            password=generate_password_hash(req["password"]),
            first_name=req["first_name"],
            last_name=req["last_name"],
            gender=req["gender"],
            id=uniqueid(),
            token=uniqueid(),
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
            return jsonify({"message": "E006", "status": 400}), 200
        if not check_password_hash(records[0]["password"], str(req["password"])):
            return jsonify({"message": "E006", "status": 400}), 200

        token = uniqueid()
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


@auth_bp.route("/change-password", methods=["PUT"])
def change_password():
    requires = ["old_password", "new_password"]
    req = request.get_json()
    try:
        if not "token" in request.headers:
            return jsonify({"message": "E003", "status": 400}), 200
        if not valid_request(req, requires):
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})
                RETURN u.password AS password LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("token"),
        )
        if not len(records) == 1:
            return jsonify({"message": "E003", "status": 400}), 200
        if not check_password_hash(records[0]["password"], str(req["old_password"])):
            return jsonify({"message": "E008", "status": 400}), 200

        _, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})
                SET u.password = $password"""
            ),
            routing_="w",
            token=request.headers.get("token"),
            password=generate_password_hash(req["new_password"]),
        )
        return jsonify({"message": "I010", "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200


@auth_bp.route("", methods=["GET"])
def get_profile():
    token = request.args.get("token", type=str)
    try:
        records, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})
                RETURN  u.username AS username,
                        u.first_name AS first_name,
                        u.last_name AS last_name,
                        u.gender AS gender LIMIT 1"""
            ),
            routing_="r",
            token=token,
        )
        if not len(records) == 1:
            return jsonify({"message": "E005", "status": 400}), 200

        return (
            jsonify(
                {
                    "message": "I008",
                    "status": 200,
                    "profile": {
                        "username": records[0]["username"],
                        "first_name": records[0]["first_name"],
                        "last_name": records[0]["last_name"],
                        "gender": records[0]["gender"],
                    },
                }
            ),
            200,
        )
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200


@auth_bp.route("", methods=["PUT"])
def update_user():
    requires = ["username", "first_name", "last_name", "gender"]
    req = request.get_json()
    try:
        if not "token" in request.headers:
            return jsonify({"message": "E003", "status": 400}), 200
        if not valid_request(req, requires):
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})
                RETURN u.username AS username, u.role AS role LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("token"),
        )
        if (not len(records) == 1) or (
            records[0]["role"] != 2 and req["username"] != records[0]["username"]
        ):
            return jsonify({"message": "E003", "status": 400}), 200

        _, _, _ = db.execute_query(
            query(
                """MATCH (u:User {username: $username})
                SET u.first_name = $first_name,
                    u.last_name = $last_name,
                    u.gender = $gender"""
            ),
            routing_="w",
            username=req["username"],
            first_name=req["first_name"],
            last_name=req["last_name"],
            gender=req["gender"],
        )
        return jsonify({"message": "I003", "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200


@auth_bp.route("", methods=["DELETE"])
def delete_user():
    requires = ["username"]
    req = request.get_json()
    try:
        if not "token" in request.headers:
            return jsonify({"message": "E003", "status": 400}), 200
        if not valid_request(req, requires):
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})
                RETURN u.role AS role LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("token"),
        )
        if (not len(records) == 1) or (records[0]["role"] != 2):
            return jsonify({"message": "E003", "status": 400}), 200

        _, _, _ = db.execute_query(
            query(
                """MATCH (u:User {username: $username})
                MATCH (u)-[:CONTROL {role: 2}]->(h:Home)
                DETACH DELETE u, h"""
            ),
            routing_="w",
            username=req["username"],
        )
        return jsonify({"message": "I004", "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200
