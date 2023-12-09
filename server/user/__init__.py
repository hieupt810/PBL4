import math

from flask import Blueprint, request
from utils import getDatetime, getNeo4J, query, respond, respondWithError, validRequest

user_bp = Blueprint("user", __name__)
db = getNeo4J()


@user_bp.route("", methods=["GET"])
def profile():
    try:
        if not ("Authorization" in request.headers):
            return respondWithError()

        rec, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})-[:CONTROL]->(h:Home)
                MATCH (h)<-[c:CONTROL]-(u:User)
                RETURN  u.username AS username,
                        u.first_name AS first_name,
                        u.last_name AS last_name,
                        u.gender AS gender,
                        u.role AS role,
                        u.updated_at AS updated_at,
                        h.id AS home_id
                LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("Authorization"),
        )
        if len(rec) != 1:
            return respondWithError()

        members, _, _ = db.execute_query(
            query(
                """MATCH (:User {token: $token})-[:CONTROL]->(h:Home)
                MATCH (h)<-[c:CONTROL]-(u:User)
                RETURN  u.first_name AS first_name,
                        u.last_name AS last_name,
                        u.gender AS gender,
                        c.role AS role,
                        u.username AS username
                ORDER BY role DESC, first_name ASC, last_name ASC
                """
            ),
            routing_="r",
            token=request.headers.get("Authorization"),
        )
        
        return respond(
            data={
                "username": rec[0]["username"],
                "first_name": rec[0]["first_name"],
                "last_name": rec[0]["last_name"],
                "gender": rec[0]["gender"],
                "role": rec[0]["role"],
                "updated_at": rec[0]["updated_at"],
                "home_id": rec[0]["home_id"],
                "home": [
                    {
                        "first_name": member["first_name"],
                        "last_name": member["last_name"],
                        "gender": member["gender"],
                        "role": member["role"],
                        "username": member["username"],
                    }
                    for member in members
                ],
            }
        )
    except Exception as error:
        return respondWithError(code=500, error=str(error))


@user_bp.route("", methods=["GET"])
def user_list():
    page = request.args.get("page", type=int, default=1)
    per_page = request.args.get("per_page", type=int, default=10)
    # Search params
    username = request.args.get("username", type=str, default="")
    role = request.args.get("role", type=int, default=-1)
    try:
        if not "Authorization" in request.headers:
            return respondWithError()

        rec, _, _ = db.execute_query(
            query("""MATCH (u:User {token: $token}) RETURN u.role AS role LIMIT 1"""),
            routing_="r",
            token=request.headers.get("Authorization"),
        )
        if len(rec) != 1 or rec[0]["role"] == 0:
            return respondWithError()

        if username != "" and role == -1:
            rec, _, _ = db.execute_query(
                query(
                    """MATCH (u:User)
                    WHERE toLower(u.username) CONTAINS toLower($username)
                    RETURN  u.username AS username, u.first_name AS first_name,
                            u.last_name AS last_name, u.gender AS gender,
                            u.role AS role, u.updated_at AS updated_at,
                            COUNT {
                                (t:User)
                                WHERE toLower(t.username) CONTAINS toLower($username)
                            } AS amount
                    ORDER BY updated_at DESC, first_name ASC, last_name ASC
                    SKIP $skip LIMIT $limit"""
                ),
                routing_="r",
                skip=(page - 1) * per_page,
                limit=per_page,
                username=username,
            )
        elif username != "" and role != -1:
            rec, _, _ = db.execute_query(
                query(
                    """MATCH (u:User)
                    WHERE u.role = $role AND toLower(u.username) CONTAINS toLower($username)
                    RETURN  u.username AS username, u.first_name AS first_name,
                            u.last_name AS last_name, u.gender AS gender,
                            u.role AS role, u.updated_at AS updated_at,
                            COUNT {
                                (t:User)
                                WHERE t.role = $role AND toLower(t.username) CONTAINS toLower($username)
                            } AS amount
                    ORDER BY updated_at DESC, first_name ASC, last_name ASC
                    SKIP $skip LIMIT $limit"""
                ),
                routing_="r",
                skip=(page - 1) * per_page,
                limit=per_page,
                username=username,
                role=role,
            )
        elif username == "" and role != -1:
            rec, _, _ = db.execute_query(
                query(
                    """MATCH (u:User {role: $role})
                    RETURN  u.username AS username, u.first_name AS first_name,
                            u.last_name AS last_name, u.gender AS gender,
                            u.role AS role, u.updated_at AS updated_at,
                            COUNT{ (:User {role: $role}) } AS amount
                    ORDER BY updated_at DESC, first_name ASC, last_name ASC
                    SKIP $skip LIMIT $limit"""
                ),
                routing_="r",
                skip=(page - 1) * per_page,
                limit=per_page,
                role=role,
            )
        else:
            rec, _, _ = db.execute_query(
                query(
                    """MATCH (u:User)
                    RETURN  u.username AS username, u.first_name AS first_name,
                            u.last_name AS last_name, u.gender AS gender,
                            u.role AS role, u.updated_at AS updated_at,
                            COUNT{ (:User) } AS amount
                    ORDER BY updated_at DESC, first_name ASC, last_name ASC
                    SKIP $skip LIMIT $limit"""
                ),
                routing_="r",
                skip=(page - 1) * per_page,
                limit=per_page,
            )
        return respond(
            data={
                "total": (
                    math.ceil(rec[0]["amount"] / per_page) if len(rec) > 0 else 0
                ),
                "users": [
                    {
                        "username": record["username"],
                        "first_name": record["first_name"],
                        "last_name": record["last_name"],
                        "gender": record["gender"],
                        "role": record["role"],
                        "updated_at": record["updated_at"],
                    }
                    for record in rec
                ],
            }
        )
    except:
        return respondWithError(code=500)

@user_bp.route("/without_home", methods=["GET"])
def get_users_without_home():
    try :
        if not "Authorization" in request.headers:
            return respondWithError()
        records, _, _ = db.execute_query(
            query("""MATCH (u:User {token: $token, role: $role}) RETURN u.role AS role LIMIT 1"""),
            routing_="r",
            token=request.headers.get("Authorization"),
            role = 2,
        )
        if len(records) != 1 :
            return respondWithError(msg="E002",code=400)
        rec, _, _ = db.execute_query(
                query(
                    """ MATCH (u:User)
                        WHERE NOT (u)-[:CONTROL]->(:Home)
                        AND NOT u.username = 'root'
                        RETURN  u.username AS username, u.first_name AS first_name,
                            u.last_name AS last_name, u.gender AS gender,
                            u.role AS role, u.updated_at AS updated_at
                        """
                ),
                routing_="r",
            )
        return respond (
            data = [
            {
                "username": record["username"],
                "first_name": record["first_name"],
                "last_name": record["last_name"],
                "gender": record["gender"],
                "role": record["role"],
                "updated_at": record["updated_at"],
            } 
            for record in rec
            ]
        )
        
    except:
        return respondWithError(code=500)

@user_bp.route("/<id>", methods=["PUT"])
def update_user(id):
    requires = ["first_name", "last_name", "gender", "role"]
    try:
        if not ("Authorization" in request.headers and validRequest(request, requires)):
            return respondWithError()

        rec, _, _ = db.execute_query(
            query(
                """MATCH (session:User {token: $token})
                MATCH (user:User {id: $id})
                RETURN session.username, session.role, user.username"""
            ),
            routing_="r",
            token=request.headers.get("Authorization"),
            id=id,
        )
        if len(rec) != 1 and not (
            rec[0]["session.username"] == rec[0]["user.username"]
            or rec[0]["session.role"] > 0
        ):
            return respondWithError()

        req = request.get_json()
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
            updated_at=getDatetime(),
        )
        return respond()
    except:
        return respondWithError(code=500)


@user_bp.route("/<id>", methods=["DELETE"])
def delete_user(id):
    try:
        if not ("Authorization" in request.headers):
            return respondWithError()

        rec, _, _ = db.execute_query(
            query(
                """MATCH (session:User {token: $token})
                MATCH (user:User {id: $id})
                RETURN session.username, session.role, user.username"""
            ),
            routing_="r",
            token=request.headers.get("Authorization"),
            id=id,
        )
        if len(rec) != 1 and not (
            rec[0]["session.username"] == rec[0]["user.username"]
            or rec[0]["session.role"] > 0
        ):
            return respondWithError()

        _, _, _ = db.execute_query(
            query(
                """MATCH (u:User {id: $id})
                OPTIONAL MATCH (u)-[:CONTROL {role: 2}]->(h:Home)
                OPTIONAL MATCH (h)<-[:CONTROL]-(m:User)
                DETACH DELETE u, h, m"""
            ),
            routing_="w",
            id=id,
        )
        return respond()
    except:
        return respondWithError(code=500)
