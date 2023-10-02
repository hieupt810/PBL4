from flask import Blueprint, jsonify, request
from utils import get_neo4j, query, uniqueid, valid_request

home_bp = Blueprint("home", __name__)
db = get_neo4j()


@home_bp.route("", methods=["POST"])
def create_home():
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
                MERGE (u)-[:CONTROL {role: 2}]->(h:Home {id: $id})"""
            ),
            routing_="w",
            username=req["username"],
            id=uniqueid(),
        )
        return jsonify({"message": "I005", "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200


@home_bp.route("/add-member", methods=["POST"])
def add_member():
    requires = ["username"]
    req = request.get_json()
    try:
        if not "token" in request.headers:
            return jsonify({"message": "E003", "status": 400}), 200
        if not valid_request(req, requires):
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})-[:CONTROL {role: 2}]->(:Home)
                RETURN u.username AS username LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("token"),
        )
        if not len(records) == 1:
            return jsonify({"message": "E003", "status": 400}), 200

        _, _, _ = db.execute_query(
            query(
                """MATCH (:User {token: $token})-[:CONTROL {role: 2}]->(h:Home)
                MATCH (u:User {username: $username})
                MERGE (u)-[:CONTROL {role: 1}]->(h)"""
            ),
            routing_="w",
            token=request.headers.get("token"),
            username=req["username"],
        )
        return jsonify({"message": "I006", "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200


@home_bp.route("/delete-member", methods=["DELETE"])
def delete_member():
    requires = ["username"]
    req = request.get_json()
    try:
        if not "token" in request.headers:
            return jsonify({"message": "E003", "status": 400}), 200
        if not valid_request(req, requires):
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})-[:CONTROL {role: 2}]->(:Home)
                RETURN u.username AS username LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("token"),
        )
        if not len(records) == 1:
            return jsonify({"message": "E003", "status": 400}), 200

        _, _, _ = db.execute_query(
            query(
                """MATCH (:User {token: $token})-[:CONTROL {role: 2}]->(h:Home)
                MATCH (:User {username: $username})-[c:CONTROL {role: 1}]->(h)
                DELETE c"""
            ),
            routing_="w",
            token=request.headers.get("token"),
            username=req["username"],
        )
        return jsonify({"message": "I009", "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200


@home_bp.route("", methods=["GET"])
def get_members():
    token = request.args.get("token", type=str)
    page = request.args.get("page", type=int, default=1)
    size = request.args.get("size", type=int, default=5)
    try:
        if page < 1 or size < 1:
            return jsonify({"message": "E002", "status": 400}), 200

        if not token:
            return jsonify({"message": "E003", "status": 400}), 200

        records, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})
                RETURN u.username AS username LIMIT 1"""
            ),
            routing_="r",
            token=token,
        )
        if not len(records) == 1:
            return jsonify({"message": "E003", "status": 400}), 200

        records, _, _ = db.execute_query(
            query(
                """MATCH (:User {token: $token})-[:CONTROL]->(h:Home)
                MATCH (u:User)-[c:CONTROL]->(h)
                RETURN u.first_name AS first_name, u.last_name AS last_name, u.gender AS gender, c.role AS role
                ORDER BY role DESC, first_name ASC, last_name ASC
                SKIP $skip LIMIT $limit """
            ),
            routing_="r",
            token=token,
            limit=size,
            skip=(page - 1) * size,
        )
        members = []
        for record in records:
            if record is not None:
                members.append(
                    {
                        "first_name": record["first_name"],
                        "last_name": record["last_name"],
                        "gender": record["gender"],
                        "role": record["role"],
                    }
                )
        return jsonify({"message": "I006", "status": 200, "members": members}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200
