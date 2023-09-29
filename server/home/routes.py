from flask import Blueprint, jsonify, request
from utils import get_neo4j, query, uniqueid, valid_request

home_bp = Blueprint("home", __name__)
db = get_neo4j()


@home_bp.route("", methods=["POST"])
def create_home():
    try:
        if not "token" in request.headers:
            return jsonify({"message": "E003", "status": 400}), 200
        records, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})
                RETURN u.username AS username LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("token"),
        )
        if not len(records) == 1:
            return jsonify({"message": "E003", "status": 400}), 200

        _, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})
                CREATE (u)-[:CONTROL]->(h: Home {id: $id, admin: $admin})"""
            ),
            routing_="w",
            token=request.headers.get("token"),
            id=uniqueid(),
            admin=records[0]["username"],
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
        records, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})
                RETURN u.username AS username LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("token"),
        )
        if not len(records) == 1:
            return jsonify({"message": "E003", "status": 400}), 200

        if not valid_request(req, requires):
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query(
                """MATCH (u:User {username: $username})
                RETURN u.username AS username LIMIT 1"""
            ),
            routing_="r",
            username=req["username"],
        )
        if not len(records) == 1:
            return jsonify({"message": "E008", "status": 400}), 200

        _, _, _ = db.execute_query(
            query(
                """MATCH (:User {token: $token})-[:CONTROL]->(h: Home)
                MATCH (u: User {username: $username})
                MERGE (u)-[:CONTROL]->(h)"""
            ),
            routing_="w",
            token=request.headers.get("token"),
            username=req["username"],
        )
        return jsonify({"message": "I006", "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200
