from flask import Blueprint, jsonify, request
from serial import Serial
from utils import get_neo4j, query, valid_request
from werkzeug.security import check_password_hash, generate_password_hash

hardware_bp = Blueprint("hardware", __name__)
arduino = Serial(port="COM4", baudrate=115200, timeout=0.1)
db = get_neo4j()


def valid_pin(pin: str) -> bool:
    if len(pin) != 6:
        return False
    for c in pin:
        if not c.isdigit():
            return False
    return True


@hardware_bp.route("/create-pin", methods=["POST"])
def create_pin():
    requires = ["pin"]
    req = request.get_json()
    try:
        if not valid_request(req, requires) or not valid_pin(req["pin"]):
            return jsonify({"message": "E002", "status": 400}), 200
        if not "token" in request.headers:
            return jsonify({"message": "E003", "status": 401}), 200

        records, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})
                RETURN u.username AS username LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("token"),
        )
        if not len(records) == 1:
            return jsonify({"message": "E003", "status": 401}), 200

        _, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})
                CREATE (u)-[:HAS]->(:Password {value: $value})"""
            ),
            routing_="w",
            token=request.headers.get("token"),
            value=generate_password_hash(req["pin"]),
        )

        return jsonify({"message": "I006", "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200


@hardware_bp.route("/unlock", methods=["POST"])
def unlock():
    try:
        if not "token" in request.headers:
            return jsonify({"message": "E003", "status": 401}), 200

        password = str(arduino.readline())
        if not valid_pin(password):
            return jsonify({"message": "E002", "status": 400}), 200

        records, _, _ = db.execute_query(
            query(
                """MATCH (:User {token: $token})-[:HAS]->(p:Password)
                RETURN p.value AS password LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("token"),
        )
        if not len(records) == 1:
            return jsonify({"message": "E003", "status": 401}), 200
        if not check_password_hash(records[0]["password"], password):
            return jsonify({"message": "E006", "status": 401}), 200

        arduino.write(bytes("Unlock", "utf-8"))
        return jsonify({"message": "I005", "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200
