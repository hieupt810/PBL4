from flask import Blueprint, jsonify, request
from utils import getDatetime, getNeo4J, query, uniqueID, validRequest

home_bp = Blueprint("home", __name__)
db = getNeo4J()


@home_bp.route("/add-home", methods=["POST"])
def create_home():
    requires = ["username", "password"]
    req = request.get_json()
    try:
        if (not "token" in request.headers) or (not validRequest(req, requires)):
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})
                RETURN u.role AS role LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("token"),
        )
        if len(records) != 1 or records[0]["role"] == 0:
            return jsonify({"message": "E002", "status": 400}), 200

        _, _, _ = db.execute_query(
            query(
                """MATCH (u:User {username: $username})
                MERGE (u)-[:CONTROL {role: 2}]->(h:Home {id: $id, updated_at: $updated_at, password: $password})"""
            ),
            routing_="w",
            username=req["username"],
            id=uniqueID(),
            updated_at=getDatetime(),
            password=req["password"],
        )
        return jsonify({"message": "I005", "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200


@home_bp.route("/list-home", methods=["GET"])
def list_home():
    page = request.args.get("page", type=int, default=1)
    size = request.args.get("size", type=int, default=10)
    username = request.args.get("username", type=str, default="")
    try:
        if not "token" in request.headers:
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})
                RETURN u.role AS role LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("token"),
        )
        if len(records) != 1 or records[0]["role"] == 0:
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query(
                """MATCH (u:User)-[:CONTROL {role: 2}]-(h:Home)
                WHERE toLower(u.username) CONTAINS toLower($username)
                RETURN  u.first_name AS first_name, u.last_name AS last_name,
                        u.username AS username, h.id AS id, h.password AS password,
                        h.updated_at AS updated_at, COUNT(h) AS amount
                SKIP $skip LIMIT $limit"""
            ),
            routing_="r",
            token=request.headers.get("token"),
            username=username,
            skip=(page - 1) * size,
            limit=size,
        )
        return (
            jsonify(
                {
                    "message": "I006",
                    "status": 200,
                    "homes": [
                        {
                            "first_name": record["first_name"],
                            "last_name": record["last_name"],
                            "username": record["username"],
                            "password": record["password"],
                            "id": record["id"],
                        }
                        for record in records
                    ],
                    "amount": records[0]["amount"] if len(records) > 0 else 0,
                }
            ),
            200,
        )
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200


@home_bp.route("/delete-home", methods=["DELETE"])
def delete_home():
    requires = ["id"]
    req = request.get_json()
    try:
        if (not "token" in request.headers) or (not validRequest(req, requires)):
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})
                RETURN u.role AS role LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("token"),
        )
        if len(records) != 1 or records[0]["role"] == 0:
            return jsonify({"message": "E002", "status": 400}), 200

        _, _, _ = db.execute_query(
            query(
                """MATCH (h:Home {id: $id})
                OPTIONAL MATCH (h)<-[:CONTROL]-(u:User)
                DETACH DELETE h, u"""
            ),
            routing_="w",
            id=req["id"],
        )
        return jsonify({"message": "I013", "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200


@home_bp.route("/add-member", methods=["POST"])
def add_member():
    requires = ["username"]
    req = request.get_json()
    try:
        if (not "token" in request.headers) or (not validRequest(req, requires)):
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query(
                """MATCH (:User {token: $token})-[c:CONTROL]->(:Home)
                RETURN c.role AS role LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("token"),
        )
        if len(records) != 1 or records[0]["role"] != 2:
            return jsonify({"message": "E002", "status": 400}), 200

        _, _, _ = db.execute_query(
            query(
                """MATCH (:User {token: $token})-[:CONTROL]->(h:Home)
                MATCH (u:User {username: $username})
                MERGE (u)-[:CONTROL {role: 1}]->(h)
                SET h.updated_at = $updated_at"""
            ),
            routing_="w",
            token=request.headers.get("token"),
            username=req["username"],
            updated_at=getDatetime(),
        )
        return jsonify({"message": "I006", "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200


@home_bp.route("/delete-member", methods=["DELETE"])
def delete_member():
    try:
        if (not "token" in request.headers) or (not "username" in request.args):
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query(
                """MATCH (:User {token: $token})-[c:CONTROL]->(:Home)
                RETURN c.role AS role LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("token"),
        )
        if len(records) != 1 or records[0]["role"] != 2:
            return jsonify({"message": "E002", "status": 400}), 200

        _, _, _ = db.execute_query(
            query(
                """MATCH (:User {token: $token})-[:CONTROL]->(h:Home)
                MATCH (:User {username: $username})-[c:CONTROL {role: 1}]->(h)
                SET h.updated_at = $updated_at
                DELETE c"""
            ),
            routing_="w",
            token=request.headers.get("token"),
            username=request.args.get("username"),
            updated_at=getDatetime(),
        )
        return jsonify({"message": "I009", "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200


@home_bp.route("/list-member", methods=["GET"])
def get_members():
    page = request.args.get("page", type=int, default=1)
    size = request.args.get("size", type=int, default=5)
    try:
        if not "token" in request.headers:
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})
                RETURN u.username AS username LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("token"),
        )
        if len(records) != 1:
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query(
                """MATCH (:User {token: $token})-[:CONTROL]->(h:Home)
                MATCH (u:User)-[c:CONTROL]->(h)
                RETURN  u.first_name AS first_name, u.last_name AS last_name,
                        u.gender AS gender, c.role AS role,
                        u.username AS username, COUNT(u) AS amount
                ORDER BY role DESC, first_name ASC, last_name ASC
                SKIP $skip LIMIT $limit"""
            ),
            routing_="r",
            token=request.headers.get("token"),
            limit=size,
            skip=(page - 1) * size,
        )
        return (
            jsonify(
                {
                    "message": "I006",
                    "status": 200,
                    "amount": records[0]["amount"] if len(records) > 0 else 0,
                    "members": [
                        {
                            "first_name": record["first_name"],
                            "last_name": record["last_name"],
                            "gender": record["gender"],
                            "role": record["role"],
                            "username": record["username"],
                        }
                        for record in records
                    ],
                }
            ),
            200,
        )
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200