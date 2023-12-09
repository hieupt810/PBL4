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
from werkzeug.security import check_password_hash, generate_password_hash

auth_bp = Blueprint("auth", __name__)
db = getNeo4J()


@auth_bp.route("/register", methods=["POST"])
def register():
    requires = ["first_name", "last_name", "gender", "username", "password"]
    try:
        if not validRequest(request, requires):
            return respondWithError()

        req = request.get_json()
        rec, _, _ = db.execute_query(
            query("""MATCH (u:User {username: $username}) RETURN u.name LIMIT 1"""),
            routing_="r",
            username=req["username"],
        )
        if len(rec) == 1:
            return respondWithError(msg="E005")

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
        return respond(msg="I002")
    except:
        return respondWithError(code=500)


@auth_bp.route("/login", methods=["POST"])
def login():
    requires = ["username", "password"]
    try:
        if not validRequest(request, requires):
            return respondWithError()
        print("check1")
        req = request.get_json()
        rec, _, _ = db.execute_query(
            query(
                """MATCH (u:User {username: $username})
                RETURN u.password AS password, u.role AS role LIMIT 1"""
            ),
            routing_="r",
            username=req["username"],
        )
        if (not len(rec) == 1) or (
            not check_password_hash(rec[0]["password"], req["password"])
        ):
            return respondWithError("E002", 401)

        token = uniqueID()
        _, _, _ = db.execute_query(
            query("""MATCH (u:User {username: $username}) SET u.token = $token"""),
            routing_="w",
            username=req["username"],
            token=token,
        )
        return respond({"token": token, "role": rec[0]["role"]}, "I003")
    except Exception as error:
        return respondWithError(code = 500, error = error)


@auth_bp.route("/change-password", methods=["PUT"])
def change_password():
    requires = ["old_password", "new_password"]
    try:
        if not validRequest(request, requires):
            return respondWithError()

        rec, _, _ = db.execute_query(
            query("""MATCH (u:User {token: $token}) RETURN u.password LIMIT 1"""),
            routing_="r",
            token=request.headers.get("Authorization"),
        )
        if len(rec) != 1:
            return respondWithError()

        req = request.get_json()
        if not check_password_hash(rec[0]["u.password"], req["old_password"]):
            return respondWithError(msg="E004")

        _, _, _ = db.execute_query(
            query("""MATCH (u:User {token: $token}) SET u.password = $password"""),
            routing_="w",
            token=request.headers.get("Authorization"),
            password=generate_password_hash(req["new_password"]),
        )
        return respond(msg="I004")
    except:
        return respondWithError(code=500)
