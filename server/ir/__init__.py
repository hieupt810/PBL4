from flask import Blueprint, jsonify, request
from utils import *
from config import Config
import requests

ir_bp = Blueprint("ir", __name__)
db = getNeo4J()

@ir_bp.route("/create", methods=["POST"])
def createIR():
    requires = ["name","device","pin", "home_id"]
    req = request.get_json()
    try:
        if (not "Authorization" in request.headers) or (not validRequest(request, requires)):
            return respondWithError(msg="E002",code=400)

        records, _, _ = db.execute_query(
            query("""MATCH (u:User {token: $token, role: $role}) RETURN u.role AS role LIMIT 1"""),
            routing_="r",
            token=request.headers.get("Authorization"),
            role = 2,
        )
        if len(records) != 1 or records[0]["role"] == 0:
            return respondWithError(msg="E002",code=400)

        records, _, _ = db.execute_query(
            query(
                """MATCH (h:Home {id: $home_id})
                CREATE (ir:IR {name: $name, id : $id, device : $device, updated_at : $updated_at, pin: $pin})-[:CONTAINS]->(h)"""
            ),
            routing_="w",
            home_id=req["home_id"],
            name=req["name"],
            id=uniqueID(),
            updated_at=getDatetime(),
            device = req["device"],
            pin = req["pin"],
        )
        return respond(msg="I016")
    except Exception as error:
        return respondWithError(code = 500, error = error)

@ir_bp.route("/createFunc", methods=["POST"])
def addFunc():
    requires = ["mode"]
    req = request.get_json()
    try :
        if (not "Authorization" in request.headers) or (not validRequest(request, requires)):
            return respondWithError(msg="E002",code=400)
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
        records, _, _ = db.execute_query(
            query(
                """CREATE (f:Func {mode:$mode, id:$id })"""
            ),
            routing_="w",
            id=uniqueID(),
            mode=req["mode"],
        )
        return respond(msg="I016")
    except Exception as error:
        return respondWithError(code = 500, error = error)
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

        return respond(data=funcs)
    except Exception as error:
        return respondWithError(code = 500, error = error)
    
@ir_bp.route("/addIr", methods=["POST"])
def addIr():
    requires = ["ir_code","id_device", "id_mode"]
    req = request.get_json()
    try :
        if (not "Authorization" in request.headers) or (not validRequest(request, requires)):
            return respondWithError(msg="E002",code=400)

        records, _, _ = db.execute_query(
            query("""MATCH (u:User {token: $token, role: $role}) RETURN u.role AS role LIMIT 1"""),
            routing_="r",
            token=request.headers.get("Authorization"),
            role = 2,
        )
        if len(records) != 1 or records[0]["role"] == 0:
            return respondWithError(msg="E002",code=400)
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
        return respond()
    except Exception as error:
        return respondWithError(code = 500, error = error)
@ir_bp.route("/control", methods=["POST"])
def controlIR():
    requires = ["id_device", "id_mode"]
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
                """MATCH (ir:IR {id: $ir_id})-[r:HAS_FUNC]->(func:Func {id: $id_mode})
                RETURN r.ir_code AS ir_code, ir.name AS name, func.mode AS mode, ir.device AS ir_device, ir.pin AS pin"""
            ),
            routing_="r",
            ir_id=req["id_device"],
            id_mode= req ["id_mode"],
        )
        _ = requests.post(
            f"{Config.ESP_SERVER_URL}/ir/{rec[0]['pin']}",
            headers={"ir_code": rec[0]["ir_code"]}  # Thêm body cho POST request ở đây
        )
        return respond()
    except Exception as error:
        return respondWithError(code = 500, error = error)
    
@ir_bp.route("/getAll/home/<home_id>", methods=["GET"])
def getAll(home_id):
    try:
        if not "Authorization" in request.headers:
            return respondWithError(msg="E002",code=400)

        records, _, _ = db.execute_query(
            query("""MATCH (u:User {token: $token}) RETURN u.role AS role LIMIT 1"""),
            routing_="r",
            token=request.headers.get("Authorization"),
        )
        if len(records) != 1 or records[0]["role"] == 0:
            return respondWithError(msg="E002",code=400)

        devices, _, _ = db.execute_query(
            query(
                """MATCH (h:Home{id:$homeId})<-[:CONTAINS]-(ir:IR)
                RETURN ir.id AS id, ir.name AS name, ir.device AS device, ir.pin AS pin"""
            ),
            routing_="r",
            homeId=home_id
        )
        
        devices_list = []
        for device in devices:
            devices_list.append({
                "id": device["id"],
                "name": device["name"],
                "device": device["device"],
                "pin": device["pin"],
            })

        return respond(data = devices_list)
    except Exception as error:
        return respondWithError(code = 500, error = error)

@ir_bp.route("/getDevice/<device>/home/<home_id>", methods=["GET"])
def getByDevice(device,home_id):
    try:
        if not "Authorization" in request.headers:
            return respondWithError(msg="E002",code=400)

        records, _, _ = db.execute_query(
            query("""MATCH (u:User {token: $token}) RETURN u.role AS role LIMIT 1"""),
            routing_="r",
            token=request.headers.get("Authorization"),
        )
        if len(records) != 1 or records[0]["role"] == 0:
            return respondWithError(msg="E002",code=400)

        devices, _, _ = db.execute_query(
            query(
                """MATCH (h:Home {id : $home_id})<-[:CONTAINS]-(ir:IR {device: $device})
                RETURN ir.id AS id, ir.name AS name, ir.device AS device, ir.pin AS pin"""
            ),
            routing_="r",
            home_id = home_id,
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

        return respond(data = devices_list)
    except Exception as error:
        return respondWithError(code = 500, error = error)

@ir_bp.route("/delete/<id>", methods=["DELETE"])
def deleteByID(id):
    try:
        if not "Authorization" in request.headers:
            return respondWithError(msg="E002",code=400)

        records, _, _ = db.execute_query(
            query("""MATCH (u:User {token: $token}) RETURN u.role AS role LIMIT 1"""),
            routing_="r",
            token=request.headers.get("Authorization"),
        )
        if len(records) != 1 or records[0]["role"] == 0:
            return respondWithError(msg="E002",code=400)

        result, _, _ = db.execute_query(
            query(
                """MATCH (ir:IR {id: $id})
                DETACH DELETE ir"""
            ),
            routing_="w",
            id=id,
        )
        return respond()
    except Exception as error:
        return respondWithError(code = 500, error = error)
