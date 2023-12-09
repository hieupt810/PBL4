import math

from flask import Blueprint, request
from utils import (
    getDatetime,
    getNeo4J,
    query,
    respond,
    respondWithError,
    uniqueID,
    validRequest,
)
from config import Config

home_bp = Blueprint("home", __name__)
db = getNeo4J()


@home_bp.route("", methods=["POST"])
def create_home():
    requires = ["username", "password"]
    req = request.get_json()
    try:
        if not validRequest(request, requires):
            return respondWithError()

        rec, _, _ = db.execute_query(
            query("""MATCH (u:User {token: $token}) RETURN u.role AS role LIMIT 1"""),
            routing_="r",
            token=request.headers.get("Authorization"),
        )
        if len(rec) != 1 or rec[0]["role"] == 0:
            return respondWithError()

        req = request.get_json()
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
        return respond()
    except:
        return respondWithError(code=500)


@home_bp.route("", methods=["GET"])
def list_home():
    page = request.args.get("page", type=int, default=1)
    per_page = request.args.get("per_page", type=int, default=10)
    username = request.args.get("username", type=str, default="")
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

        rec, _, _ = db.execute_query(
            query(
                """MATCH (u:User)-[:CONTROL {role: 2}]-(h:Home)
                WHERE toLower(u.username) CONTAINS toLower($username)
                RETURN  u.first_name AS first_name,
                        u.last_name AS last_name,
                        u.username AS username,
                        h.id AS id,
                        h.updated_at AS updated_at,
                        COUNT(h) AS amount
                ORDER BY h.updated_at DESC
                SKIP $skip LIMIT $limit"""
            ),
            routing_="r",
            token=request.headers.get("Authorization"),
            username=username,
            skip=(page - 1) * per_page,
            limit=per_page,
        )

        amount, _, _ = db.execute_query(
            query(
                """MATCH (u:User)-[:CONTROL {role: 2}]-(h:Home)
                WHERE toLower(u.username) CONTAINS toLower($username)
                RETURN COUNT(h) AS amount"""
            ),
            routing_="r",
            token=request.headers.get("Authorization"),
            username=username,
        )

        return respond(
            data={
                "total": (
                    math.ceil(amount[0]["amount"] / per_page) if len(rec) > 0 else 0
                ),
                "homes": [
                    {
                        "first_name": record["first_name"],
                        "last_name": record["last_name"],
                        "username": record["username"],
                        "updated_at": record["updated_at"],
                        "id": record["id"],
                    }
                    for record in rec
                ],
            }
        )
    except:
        return respondWithError(code=500)


@home_bp.route("/<id>", methods=["DELETE"])
def delete_home(id):
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

        _, _, _ = db.execute_query(
            query(
                """MATCH (h:Home {id: $id}) OPTIONAL MATCH (h)<-[:CONTROL]-(u:User)
                DETACH DELETE h, u"""
            ),
            routing_="w",
            id=id,
        )
        return respond()
    except:
        return respondWithError(code=500)


@home_bp.route("/<id>/member", methods=["POST"])
def add_member(id):
    requires = ["username"]
    try:
        if not ("Authorization" in request.headers and validRequest(request, requires)):
            return respondWithError()

        rec, _, _ = db.execute_query(
            query(
                """MATCH (:User {token: $token})-[c:CONTROL]->(:Home {id: $id}) RETURN c.role AS role LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("Authorization"),
            id=id,
        )
        if len(rec) != 1 or rec[0]["role"] != 2:
            return respondWithError()

        req = request.get_json()
        _, _, _ = db.execute_query(
            query(
                """MATCH (h:Home {id: $id})
                MATCH (u:User {username: $username})
                MERGE (u)-[:CONTROL {role: 1}]->(h)
                SET h.updated_at = $updated_at"""
            ),
            routing_="w",
            id=id,
            username=req["username"],
            updated_at=getDatetime(),
        )
        return respond()
    except Exception as error:
        return respondWithError(code=500, error=str(error))


@home_bp.route("/<home_id>/delete-member", methods=["DELETE"])
def delete_member(home_id):
    username = request.args.get('username')
    try:
        if not ("Authorization" in request.headers):
            return respondWithError()

        rec, _, _ = db.execute_query(
            query(
                """MATCH (:User {token: $token})-[c:CONTROL]->(:Home {id: $id}) RETURN c.role AS role LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("Authorization"),
            id=Config.HOME_ID,
        )
        if len(rec) != 1 or rec[0]["role"] != 2:
            return respondWithError()

        _, _, _ = db.execute_query(
            query(
                """MATCH (:User {username: $username})-[c:CONTROL]->(h:Home {id: $home_id})
                SET h.updated_at = $updated_at DELETE c"""
            ),
            routing_="w",
            username=username,
            home_id = home_id,
            updated_at=getDatetime(),
        )
        return respond()
    except Exception as error:
        return respondWithError(code = 500, error = error)


@home_bp.route("/<id>/member", methods=["GET"])
def get_members(id):
    page = request.args.get("page", type=int, default=1)
    per_page = request.args.get("per_page", type=int, default=10)
    try:
        if not "Authorization" in request.headers:
            return respondWithError()

        rec, _, _ = db.execute_query(
            query("""MATCH (u:User {token: $token}) RETURN u.role AS role LIMIT 1"""),
            routing_="r",
            token=request.headers.get("Authorization"),
        )
        if len(rec) != 1:
            return respondWithError()

        rec, _, _ = db.execute_query(
            query(
                """MATCH (u:User )-[c:CONTROL]->(:Home {id: $id})
                RETURN  u.first_name AS first_name,
                        u.last_name AS last_name,
                        u.gender AS gender,
                        c.role AS role,
                        u.username AS username,
                        COUNT(u) AS amount
                ORDER BY role DESC, first_name ASC, last_name ASC
                SKIP $skip LIMIT $limit"""
            ),
            routing_="r",
            id=id,
            limit=per_page,
            skip=(page - 1) * per_page,
        )
        return respond(
            data={
                "total": (
                    math.ceil(rec[0]["amount"] / per_page) if len(rec) > 0 else 0
                ),
                "members": [
                    {
                        "first_name": record["first_name"],
                        "last_name": record["last_name"],
                        "gender": record["gender"],
                        "role": record["role"],
                        "username": record["username"],
                    }
                    for record in rec
                ],
            }
        )
    except Exception as error:
        return respondWithError(code = 500, error = error)
    
@home_bp.route("<home_id>/getAllDevice", methods=["GET"])
def get_Devices(home_id):
    try:
        if (not "Authorization" in request.headers) :
            return respondWithError(msg="E002",code=400)

        records, _, _ = db.execute_query(
            query("""MATCH (u:User {token: $token, role:$role}) RETURN u.role AS role LIMIT 1"""),
            routing_="r",
            token=request.headers.get("Authorization"),
            role = 2
        )
        if len(records) != 1 or records[0]["role"] == 0:
            return respondWithError(msg="E002",code=400)

        records, _, _ = db.execute_query(
            query(
                """MATCH (h:Home{id:$homeId})<-[:CONTAINS]-(l:Led)
                RETURN  l.id AS id, l.name AS name, l.pin AS pin"""
            ),
            routing_="r",
            homeId=home_id,
        )
        data = []
        for led in records:
            data.append({
                "id": led["id"],
                "name": led["name"],
                "pin": led["pin"],
                "device": "led",
            })
        devices, _, _ = db.execute_query(
            query(
                """MATCH (h:Home{id:$homeId})<-[:CONTAINS]-(ir:IR)
                RETURN ir.id AS id, ir.name AS name, ir.device AS device, ir.pin AS pin"""
            ),
            routing_="r",
            homeId=home_id
        )
        for device in devices:
            data.append({
                "id": device["id"],
                "name": device["name"],
                "device": device["device"],
                "pin": device["pin"],
            })
        return respond (data=data)
    except Exception as error:
        return respondWithError(code = 500, error = error)
        