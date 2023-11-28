import requests
from config import Config
from flask import Blueprint, jsonify, request
from utils import getDatetime, getNeo4J, query, uniqueID, validRequest

led_bp = Blueprint("led", __name__)
db = getNeo4J()


@led_bp.route("", methods=["POST"])
def led_switch():
    requires = ["id", "mode"]
    req = request.get_json()
    try:
        if (
            (not "token" in request.headers)
            or (not validRequest(req, requires))
            or (req["mode"] != "on" and req["mode"] != "off")
        ):
            return jsonify({"message": "E002", "status": 400}), 200

        rec, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})-[c:CONTROL]->(:Home)
                RETURN c.role AS role LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("token"),
        )
        if len(rec) != 1:
            return jsonify({"message": "E002", "status": 400}), 200

        rec, _, _ = db.execute_query(
            query("""MATCH (l:Led {id: $id}) RETURN l.pin AS pin"""),
            routing_="r",
            id=req["id"],
        )
        _ = requests.post(
            f"http://{Config.ESP_SERVER_URL}/led/{rec[0]['pin']}/{req['mode']}"
        )
        return jsonify({"message": "I014", "status": 200}), 200
    except Exception as error:
        return (
            jsonify(
                {
                    "message": "E001",
                    "status": 500,
                    "error": str(error),
                    "": Config.ESP_SERVER_URL,
                }
            ),
            200,
        )


@led_bp.route("", methods=["GET"])
def getHomeLed():
    page = request.args.get("page", type=int, default=1)
    size = request.args.get("size", type=int, default=10)
    try:
        if not "token" in request.headers:
            return jsonify({"message": "E002", "status": 400}), 200

        rec, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})-[c:CONTROL]->(h:Home {id : $id})
                RETURN c.role AS role LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("token"),
            id="49480b29-b900-412b-8394-f1bcee055f8c",
        )
        if len(rec) != 1:
            return jsonify({"message": "E002", "status": 400}), 200

        rec, _, _ = db.execute_query(
            query(
                """MATCH (l:Led)
                RETURN  l.id AS id, l.name AS name, l.pin AS pin
                SKIP $skip LIMIT $limit"""
            ),
            routing_="r",
            skip=(page - 1) * size,
            limit=size,
        )
        return (
            jsonify(
                {
                    "message": "I014",
                    "status": 200,
                    "leds": [
                        {
                            "id": record["id"],
                            "name": record["name"],
                            "pin": record["pin"],
                        }
                        for record in rec
                    ],
                }
            ),
            200,
        )
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200


@led_bp.route("/create", methods=["POST"])
def createLed():
    requires = ["name", "pin", "id"]
    req = request.get_json()
    try:
        if (not "token" in request.headers) or (not validRequest(req, requires)):
            return jsonify({"message": "E002", "status": 400}), 200

        rec, _, _ = db.execute_query(
            query("""MATCH (u:User {token: $token}) RETURN u.role AS role LIMIT 1"""),
            routing_="r",
            token=request.headers.get("token"),
        )
        if len(rec) != 1 or rec[0]["role"] == 0:
            return jsonify({"message": "E002", "status": 400}), 200

        rec, _, _ = db.execute_query(
            query(
                """CREATE (l:Led {id: $id, pin: $pin, name: $name, updated_at: $updated_at})
                MERGE (l)-[:CONTAINS]->(:Home {id: $home_id})"""
            ),
            routing_="w",
            id=uniqueID(),
            pin=req["pin"],
            name=req["name"],
            updated_at=getDatetime(),
            home_id=req["id"],
        )
        return jsonify({"message": "I015", "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200
