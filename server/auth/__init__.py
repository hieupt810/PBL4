from flask import Blueprint, jsonify, request
from utils import getDatetime, getNeo4J, query, uniqueID, validRequest
from werkzeug.security import check_password_hash, generate_password_hash

auth_bp = Blueprint("auth", __name__)
db = getNeo4J()


@auth_bp.route("/register", methods=["POST"])
def register():
    requires = ["first_name", "last_name", "gender", "username", "password"]
    req = request.get_json()
    try:
        if not validRequest(req, requires):
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
                    u.token = $token,
                    u.updated_at = $updated_at"""
            ),
            routing_="w",
            username=req["username"],
            password=generate_password_hash(req["password"]),
            first_name=req["first_name"],
            last_name=req["last_name"],
            gender=req["gender"],
            id=uniqueID(),
            token=uniqueID(),
            updated_at=getDatetime(),
        )
        return jsonify({"message": "I001", "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200


@auth_bp.route("/login", methods=["POST"])
def login():
    requires = ["username", "password"]
    req = request.get_json()
    try:
        if not validRequest(req, requires):
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query(
                """MATCH (u:User {username: $username})
                RETURN u.password AS password, u.role AS role LIMIT 1"""
            ),
            routing_="r",
            username=req["username"],
        )
        if (not len(records) == 1) or (
            not check_password_hash(records[0]["password"], req["password"])
        ):
            return jsonify({"message": "E006", "status": 400}), 200

        token = uniqueID()
        _, _, _ = db.execute_query(
            query(
                """MATCH (u:User {username: $username})
                SET u.token = $token"""
            ),
            routing_="w",
            username=req["username"],
            token=token,
        )
        return (
            jsonify(
                {
                    "message": "I002",
                    "status": 200,
                    "token": token,
                    "role": records[0]["role"],
                }
            ),
            200,
        )
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200


@auth_bp.route("/change-password", methods=["PUT"])
def change_password():
    requires = ["old_password", "new_password"]
    req = request.get_json()
    try:
        if (not "token" in request.headers) or (not validRequest(req, requires)):
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
            return jsonify({"message": "E002", "status": 400}), 200
        if not check_password_hash(records[0]["password"], req["old_password"]):
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
