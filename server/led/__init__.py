import requests
from config import Config
from flask import Blueprint, jsonify, request
from utils import *

led_bp = Blueprint("led", __name__)
db = getNeo4J()


@led_bp.route("", methods=["POST"])
def led_switch():
    requires = ["id", "mode"]
    req = request.get_json()
    try:
        if not ("Authorization" in request.headers and validRequest(request, requires) or (req["mode"] != "on" and req["mode"] != "off")
        ):
            return respondWithError()

        rec, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})-[c:CONTROL]->(:Home)
                RETURN c.role AS role LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("Authorization"),
        )
        if len(rec) != 1:
            return respondWithError(code = 400, msg = "E002")

        rec, _, _ = db.execute_query(
            query("""MATCH (l:Led {id: $id}) RETURN l.pin AS pin"""),
            routing_="r",
            id=req["id"],
        )
        _ = requests.post(
            f"{Config.ESP_SERVER_URL}/led/{rec[0]['pin']}/{req['mode']}"
        )
        return respond(msg = "I014")
    except Exception as error:
        return respondWithError(code = 500, error = error)
                


@led_bp.route("home/<home_id>", methods=["GET"])
def getHomeLed(home_id):
    page = request.args.get("page", type=int, default=1)
    size = request.args.get("size", type=int, default=10)
    try:
        if not "Authorization" in request.headers:
            return respondWithError(msg="E002",code=400)

        rec, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})-[c:CONTROL]->(h:Home {id : $id})
                RETURN c.role AS role LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("Authorization"),
            id=home_id,
        )
        if len(rec) != 1:
            return respondWithError(msg="E002",code=400)

        rec, _, _ = db.execute_query(
            query(
                """MATCH (h:Home{id:$homeId})<-[:CONTAINS]-(l:Led)
                RETURN  l.id AS id, l.name AS name, l.pin AS pin
                SKIP $skip LIMIT $limit"""
            ),
            routing_="r",
            skip=(page - 1) * size,
            limit=size,
            homeId=Config.HOME_ID,
        )
        
        return respond(msg="I014", data={"leds": [
                                                    {
                                                        "id": record["id"],
                                                        "name": record["name"],
                                                        "pin": record["pin"]
                                                    }
                                                    for record in rec
                                                ]})

    except Exception as error:
        return respondWithError(code = 500, error = error)


@led_bp.route("/create", methods=["POST"])
def createLed():
    requires = ["name", "pin", "home_id"]
    req = request.get_json()
    try:
        if (not "Authorization" in request.headers) or (not validRequest(request, requires)):
            return respondWithError(msg="E002",code=400)

        rec, _, _ = db.execute_query(
            query("""MATCH (u:User {token: $token}) RETURN u.role AS role LIMIT 1"""),
            routing_="r",
            token=request.headers.get("Authorization"),
        )
        if len(rec) != 1 or rec[0]["role"] == 0:
            return respondWithError(msg="E002",code=400)

        rec, _, _ = db.execute_query(
            query(
                """MATCH (h:Home {id: $home_id})
                CREATE (l:Led {id: $id, pin: $pin, name: $name, updated_at: $updated_at})-[:CONTAINS]->(h)
                """
            ),
            routing_="w",
            id=uniqueID(),
            pin=req["pin"], 
            name=req["name"],
            updated_at=getDatetime(),
            home_id=req["home_id"],
        )
        return respond(msg="I015")
    except Exception as error:
        return respondWithError(code = 500, error = error)

@led_bp.route("/<id>/delete", methods=["DELETE"])
def deleteLed(id):
    try:
        if (not "Authorization" in request.headers) :
            return respondWithError(msg="E002",code=400)
        rec, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})
                RETURN u"""
            ),
            routing_="r",
            token=request.headers.get("Authorization"),
        )
        if len(rec) != 1:
            print(rec)
            return respondWithError(code = 400, msg = "E002")

        rec, _, _ = db.execute_query(
            query("""MATCH (l:Led {id: $id}) DETACH DELETE l"""),
            routing_="w",
            id=id,
        )
        return respond()
    except Exception as error:
        return respondWithError(code = 500, error = error)