from flask import Blueprint, jsonify, request
from utils import getDatetime, getNeo4J, query, uniqueID, validRequest
from config import Config

ir_bp = Blueprint("ir", __name__)
db = getNeo4J()

@ir_bp.route("/create", methods=["POST"])
def createIR():
    requires = ["name","ir", "mode", "device"]
    req = request.get_json()
    try:
        if (not "token" in request.headers) or (not validRequest(req, requires)):
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query("""MATCH (u:User {token: $token}) RETURN u.role AS role LIMIT 1"""),
            routing_="r",
            token=request.headers.get("token"),
        )
        if len(records) != 1 or records[0]["role"] == 0:
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query(
                """MATCH (h:Home {id: $home_id})
                CREATE (ir:IR {ir: $ir, name: $name, mode: $mode, id : $id, device : $device, updated_at : $updated_at})
                MERGE (ir)-[:CONTAINS]->(:Home {id: $home_id})"""
            ),
            routing_="w",
            home_id=Config.HOME_ID,
            ir=req["ir"],
            name=req["name"],
            mode=req["mode"],
            id=uniqueID(),
            updated_at=getDatetime(),
            device = req["device"],
        )
        return jsonify({"message": "I016", "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200
    
@ir_bp.route("/control", methods=["POST"])
def controlIR():
    requires = ["id"]
    req = request.get_json()
    try:
        if (not "token" in request.headers) or (not validRequest(req, requires)):
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query("""MATCH (u:User {token: $token}) RETURN u.role AS role LIMIT 1"""),  
            routing_="r",
            token=request.headers.get("token"),
        )
        if len(records) != 1 or records[0]["role"] == 0:
            return jsonify({"message": "E002", "status": 400}), 200
        records, _, _ = db.execute_query(
            query(
                """MATCH (ir:IR {id: $ir_id})
                RETURN ir.ir AS ir_code, ir.name AS ir_name, ir.mode AS ir_mode, ir.device AS ir_device"""
            ),
            routing_="r",
            ir_id=req["id"],
        )
        _ = requests.post(
            f"http://{Config.ESP_SERVER_URL}/{records[0]['device']}/{records[0]['pin']}/{req['mode']}",
            json={"body_key": records[0]["ir"]}  # Thêm body cho POST request ở đây
        )
        return jsonify({"message": "I016", "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200
    
@ir_bp.route("/getAll", methods=["GET"])
def getAll():
    try:
        if not "token" in request.headers:
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query("""MATCH (u:User {token: $token}) RETURN u.role AS role LIMIT 1"""),
            routing_="r",
            token=request.headers.get("token"),
        )
        if len(records) != 1 or records[0]["role"] == 0:
            return jsonify({"message": "E002", "status": 400}), 200

        devices, _, _ = db.execute_query(
            query(
                """MATCH (h:Home)<-[:CONTAINS]-(ir:IR)
                RETURN ir.id AS id, ir.name AS name, ir.ir AS ir_code, ir.mode AS mode, ir.device AS device"""
            ),
            routing_="r",
        )
        
        devices_list = []
        for device in devices:
            devices_list.append({
                "id": device["id"],
                "name": device["name"],
                "ir_code": device["ir_code"],
                "mode": device["mode"],
                "device": device["device"],
            })

        return jsonify({"devices": devices_list, "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200

@ir_bp.route("/getDevice/<device>", methods=["GET"])
def getByDevice(device):
    try:
        if not "token" in request.headers:
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query("""MATCH (u:User {token: $token}) RETURN u.role AS role LIMIT 1"""),
            routing_="r",
            token=request.headers.get("token"),
        )
        if len(records) != 1 or records[0]["role"] == 0:
            return jsonify({"message": "E002", "status": 400}), 200

        devices, _, _ = db.execute_query(
            query(
                """MATCH (h:Home {id : $home_id})<-[:CONTAINS]-(ir:IR {device: $device})
                RETURN ir.id AS id, ir.name AS name, ir.ir AS ir_code, ir.mode AS mode, ir.device AS device"""
            ),
            routing_="r",
            home_id = Config.HOME_ID,
            device=device,
        )
        
        devices_list = []
        for device in devices:
            devices_list.append({
                "id": device["id"],
                "name": device["name"],
                "ir_code": device["ir_code"],
                "mode": device["mode"],
                "device": device["device"],
            })

        return jsonify({"devices": devices_list, "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200

@ir_bp.route("/delete/<id>", methods=["DELETE"])
def deleteByID(id):
    try:
        if not "token" in request.headers:
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query("""MATCH (u:User {token: $token}) RETURN u.role AS role LIMIT 1"""),
            routing_="r",
            token=request.headers.get("token"),
        )
        if len(records) != 1 or records[0]["role"] == 0:
            return jsonify({"message": "E002", "status": 400}), 200

        result, _, _ = db.execute_query(
            query(
                """MATCH (ir:IR {id: $id})
                DETACH DELETE ir"""
            ),
            routing_="w",
            id=id,
        )

        if result:
            return jsonify({"message": "Device deleted successfully", "status": 200}), 200
        else:
            return jsonify({"message": "Device with given ID not found", "status": 404}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200
