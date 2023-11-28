from flask import Blueprint, jsonify, request
from utils import getDatetime, getNeo4J, query, uniqueID, validRequest
from config import Config

ir_bp = Blueprint("ir", __name__)
db = getNeo4J()

@ir_bp.route("/create", methods=["POST"])
def createIR():
    requires = ["name","device","pin"]
    req = request.get_json()
    try:
        if (not "token" in request.headers) or (not validRequest(req, requires)):
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query("""MATCH (u:User {token: $token, role: $role}) RETURN u.role AS role LIMIT 1"""),
            routing_="r",
            token=request.headers.get("token"),
            role = 2,
        )
        if len(records) != 1 or records[0]["role"] == 0:
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query(
                """MATCH (h:Home {id: $home_id})
                CREATE (ir:IR {ir: $ir, name: $name, mode: $mode, id : $id, device : $device, updated_at : $updated_at, pin: $pin})-[:CONTAINS]->(h)"""
            ),
            routing_="w",
            home_id=Config.HOME_ID,
            name=req["name"],
            id=uniqueID(),
            updated_at=getDatetime(),
            device = req["device"],
            pin = req["pin"],
        )
        return jsonify({"message": "I016", "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200

@ir_bp.route("/createFunc", methods=["POST"])
def addFunc():
    requires = ["mode"]
    req = request.get_json()
    try :
        records, _, _ = db.execute_query(
            query(
                """CREATE (f:Func {mode:$mode, id:$id })"""
            ),
            routing_="w",
            id=uniqueID(),
            mode=req["mode"],
        )
        return jsonify({"message": "I016", "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200
@ir_bp.route("/getFuncs", methods=["GET"])
def getFuncs():
    try:
        records, _, _ = db.execute_query(
            query(
                """MATCH (func:Func) RETURN func"""
            ),
            routing_="r", 
        )

        funcs = [
            {
                "id": record["func"]["id"], 
                "mode": record["func"]["mode"], 
            }
            for record in records 
        ]

        return jsonify({"funcs": funcs, "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200
    
@ir_bp.route("/addIr", methods=["POST"])
def addIr():
    requires = ["ir_code","id_device", "id_mode"]
    req = request.get_json()
    try :
        if (not "token" in request.headers) or (not validRequest(req, requires)):
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query("""MATCH (u:User {token: $token, role: $role}) RETURN u.role AS role LIMIT 1"""),
            routing_="r",
            token=request.headers.get("token"),
            role = 2,
        )
        if len(records) != 1 or records[0]["role"] == 0:
            return jsonify({"message": "E002", "status": 400}), 200
        records, _, _ = db.execute_query(
            query(
                """
                MATCH (ir:IR {id: $id_device}), (func:Func {id: $id_mode})
                MERGE (ir)-[r:HAS_FUNC]->(func)
                SET r.ir_code = $ir_code
                """
            ),
            routing_="w",
            id_device=req["id_device"],  # ID của IR mới tạo
            id_mode=req["id_mode"],  # Lấy ID của Func từ kết quả truy vấn tạo Func
            ir_code=req["ir_code"],  # Thay YOUR_IR_CODE_HERE bằng giá trị thực của ir_code
        )
        return jsonify({"message": "I016", "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200
@ir_bp.route("/control", methods=["POST"])
def controlIR():
    requires = ["id_device", "id_mode"]
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
                """MATCH (ir:IR {id: $ir_id})-[r:HAS_FUNC]->(func:Func {id: $id_mode})
                RETURN r.ir_code AS ir_code, ir.name AS name, func.mode AS mode, ir.device AS ir_device, ir.pin AS pin"""
            ),
            routing_="r",
            ir_id=req["id_device"],
            id_mode= req ["id_mode"],
        )
        _ = request.post(
            f"http://{Config.ESP_SERVER_URL}/{records[0]['device']}/{records[0]['pin']}",
            json={"ir_code": records[0]["ir_code"]}  # Thêm body cho POST request ở đây
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
                """MATCH (h:Home{id:$homeId})<-[:CONTAINS]-(ir:IR)
                RETURN ir.id AS id, ir.name AS name, ir.device AS device, ir.pin AS pin"""
            ),
            routing_="r",
            homeId=Config.HOME_ID
        )
        
        devices_list = []
        for device in devices:
            devices_list.append({
                "id": device["id"],
                "name": device["name"],
                "device": device["device"],
                "pin": device["pin"],
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
                RETURN ir.id AS id, ir.name AS name, ir.device AS device, ir.pin AS pin"""
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
                "device": device["device"],
                "pin": device["pin"]
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
