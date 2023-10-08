import requests as requests_
from config import Config
from flask import Blueprint, jsonify, request
from utils import get_datetime, get_neo4j, query, uniqueid, valid_request

device_bp = Blueprint("device", __name__)
db = get_neo4j()


@device_bp.route("/led", methods=["POST"])
def led():
    requires = ["id", "mode"]
    req = request.get_json()
    try:
        if not "token" in request.headers:
            return jsonify({"message": "E003", "status": 400}), 200
        if not valid_request(req, requires) or (
            req["mode"] != "on" and req["mode"] != "off"
        ):
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})-[c:CONTROL]->(:Home)
                RETURN c.role AS role LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("token"),
        )
        if len(records) != 1:
            return jsonify({"message": "E003", "status": 400}), 200

        records, _, _ = db.execute_query(
            query(
                """MATCH (l:Led {id: $id})
                RETURN l.pin AS pin"""
            ),
            routing_="r",
            id=req["id"],
        )
        _ = requests_.post(
            f"{Config.ESP_SERVER_URL}/led/{records[0]['pin']}/{req['mode']}"
        )
        return jsonify({"message": "I014", "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200


@device_bp.route("/led", methods=["GET"])
def all_led():
    try:
        if not "token" in request.headers:
            return jsonify({"message": "E003", "status": 400}), 200

        records, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})-[c:CONTROL]->(:Home)
                RETURN c.role AS role LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("token"),
        )
        if len(records) != 1:
            return jsonify({"message": "E003", "status": 400}), 200

        records, _, _ = db.execute_query(query("""MATCH (l:Led) RETURN l LIMIT 25"""))
        led_data = [dict(record["l"]) for record in records]
        return jsonify({"message": "I014", "status": 200, "leds": led_data}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200


@device_bp.route("/led/add", methods=["POST"])
def addLed():
    requires = ["name", "pin", "home_id"]
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
        if len(records) != 1 or records[0]["role"] == 0:
            return jsonify({"message": "E003", "status": 400}), 200
        records, _, _ = db.execute_query(
            query(
                """CREATE (led:Led {id:$id ,pin: $pin_number, name: $name, updated_at: $updated_at})"""
            ),
            routing_="r",
            pin_number=req["pin"],
            name=req["name"],
            updated_at=get_datetime(),
            id=uniqueid(),
        )
        # ID của LED mới thêm vào
        new_led_id = records[0]["id"]

        # Truy vấn Cypher để thêm LED vào home
        db.execute_query(
            query(
                """MATCH (h:Home {id: $home_id})
                MATCH (led:Led {id: $led_id})
                CREATE (h)-[:CONTAINS]->(led)"""
            ),
            routing_="w",
            home_id=req["home_id"],
            led_id=new_led_id,
        )
        return jsonify({"message": "", "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200


@device_bp.route("/ir_device/add", methods=["POST"])
def ir_add():
    requires = ["name", "home_id", "ir", "mode"]
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
        if len(records) != 1 or records[0]["role"] == 0:
            return jsonify({"message": "E003", "status": 400}), 200
        records, _, _ = db.execute_query(
            query(
                """CREATE (led:Led {ir: {$ir}, name: {$name},mode: {$mode}, home_id = {$home_id}, updated_at : {$updated_at}})"""
            ),
            routing_="w",
            ir=req["ir"],
            mode=req["mode"],
            home_id=req["home_id"],
            name=req["name"],
            updated_at=get_datetime(),
        )
        return jsonify({"message": "", "stauts": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200


@device_bp.route("/door/open", methods=["POST"])
def open_door():
    try:
        if not "token" in request.headers:
            return jsonify({"message": "E003", "status": 400}), 200
        records, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})- [c:CONTROL]-> (home:Home)
                RETURN c.role AS control_role LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("token"),
        )
        if len(records) != 1:
            return jsonify({"message": "E003", "status": 400}), 200

        response = requests_.post(f"{Config.ESP_SERVER_URL}/door/unlock")
        if response.status_code == 200:
            # Xử lý phản hồi thành công
            print("Request successful.")
        else:
            # Xử lý lỗi
            print("Request failed with status code:", response.status_code)
            print("Response:", response.text)
        return jsonify({}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200


@device_bp.route("/door/lock", methods=["POST"])
def lock_door():
    try:
        records, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})
                RETURN u.role AS role LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("token"),
        )
        if len(records) != 1 or records[0]["role"] == 0:
            return jsonify({"message": "E003", "status": 400}), 200

        response = requests_.post(f"{Config.ESP_SERVER_URL}/door/lock")
        if response.status_code == 200:
            # Xử lý phản hồi thành công
            print("Request successful.")
        else:
            # Xử lý lỗi
            print("Request failed with status code:", response.status_code)
            print("Response:", response.text)
        return jsonify({}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200
