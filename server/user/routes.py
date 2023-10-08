from flask import Blueprint, jsonify, request
from utils import get_datetime, get_neo4j, query, valid_request

user_bp = Blueprint("user", __name__)
db = get_neo4j()


@user_bp.route("", methods=["GET"])
def profile():
    token = request.args.get("token", type=str)
    try:
        records, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})
                RETURN  u.username AS username,
                        u.first_name AS first_name,
                        u.last_name AS last_name,
                        u.gender AS gender,
                        u.role AS role,
                        u.updated_at AS updated_at
                LIMIT 1"""
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
                        "role": records[0]["role"],
                        "updated_at": records[0]["updated_at"],
                    },
                }
            ),
            200,
        )
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200


@user_bp.route("/list-user", methods=["GET"])
def user_list():
    token = request.args.get("token", type=str)
    page = request.args.get("page", type=int, default=1)
    size = request.args.get("size", type=int, default=10)
    username = request.args.get("username", type=str, default="")
    role = request.args.get("role", type=int, default=-1)
    try:
        records, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})
                RETURN u.role AS role LIMIT 1"""
            ),
            routing_="r",
            token=token,
        )
        if len(records) != 1 or records[0]["role"] == 0:
            return jsonify({"message": "E005", "status": 400}), 200

        if username != "" and role == -1:
            records, _, _ = db.execute_query(
                query(
                    """MATCH (u:User)
                    WHERE toLower(u.username) CONTAINS toLower($username)
                    RETURN  u.username AS username,
                            u.first_name AS first_name,
                            u.last_name AS last_name,
                            u.gender AS gender,
                            u.role AS role,
                            u.updated_at AS updated_at,
                            COUNT(u) AS amount
                    ORDER BY updated_at DESC, first_name ASC, last_name ASC
                    SKIP $skip LIMIT $limit"""
                ),
                routing_="r",
                skip=(page - 1) * size,
                limit=size,
                username=username,
            )
        elif username != "" and role != -1:
            records, _, _ = db.execute_query(
                query(
                    """MATCH (u:User)
                    WHERE u.role = $role AND toLower(u.username) CONTAINS toLower($username)
                    RETURN  u.username AS username,
                            u.first_name AS first_name,
                            u.last_name AS last_name,
                            u.gender AS gender,
                            u.role AS role,
                            u.updated_at AS updated_at,
                            COUNT(u) AS amount
                    ORDER BY updated_at DESC, first_name ASC, last_name ASC
                    SKIP $skip LIMIT $limit"""
                ),
                routing_="r",
                skip=(page - 1) * size,
                limit=size,
                username=username,
                role=role,
            )
        elif username == "" and role != -1:
            records, _, _ = db.execute_query(
                query(
                    """MATCH (u:User)
                    WHERE u.role = $role
                    RETURN  u.username AS username,
                            u.first_name AS first_name,
                            u.last_name AS last_name,
                            u.gender AS gender,
                            u.role AS role,
                            u.updated_at AS updated_at,
                            COUNT(u) AS amount
                    ORDER BY updated_at DESC, first_name ASC, last_name ASC
                    SKIP $skip LIMIT $limit"""
                ),
                routing_="r",
                skip=(page - 1) * size,
                limit=size,
                role=role,
            )
        else:
            records, _, _ = db.execute_query(
                query(
                    """MATCH (u:User)
                    RETURN  u.username AS username,
                            u.first_name AS first_name,
                            u.last_name AS last_name,
                            u.gender AS gender,
                            u.role AS role,
                            u.updated_at AS updated_at,
                            COUNT(u) AS amount
                    ORDER BY updated_at DESC, first_name ASC, last_name ASC
                    SKIP $skip LIMIT $limit"""
                ),
                routing_="r",
                skip=(page - 1) * size,
                limit=size,
            )
        return (
            jsonify(
                {
                    "message": "I012",
                    "status": 200,
                    "users": [
                        {
                            "username": record["username"],
                            "first_name": record["first_name"],
                            "last_name": record["last_name"],
                            "gender": record["gender"],
                            "role": record["role"],
                            "updated_at": record["updated_at"],
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


@user_bp.route("", methods=["PUT"])
def update_user():
    requires = ["username", "first_name", "last_name", "gender", "role"]
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
        if (
            (not len(records) == 1)
            or (records[0]["role"] != 2 and req["username"] != records[0]["username"])
            or (records[0]["role"] != 0 and req["role"] != 0)
        ):
            return jsonify({"message": "E003", "status": 400}), 200

        _, _, _ = db.execute_query(
            query(
                """MATCH (u:User {username: $username})
                SET u.first_name = $first_name,
                    u.last_name = $last_name,
                    u.gender = $gender,
                    u.role = $role,
                    u.updated_at = $updated_at"""
            ),
            routing_="w",
            username=req["username"],
            first_name=req["first_name"],
            last_name=req["last_name"],
            gender=req["gender"],
            role=req["role"],
            updated_at=get_datetime(),
        )
        return jsonify({"message": "I003", "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200


@user_bp.route("", methods=["DELETE"])
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
        if (len(records) != 1) or (records[0]["role"] == 0):
            return jsonify({"message": "E003", "status": 400}), 200

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
