import requests
from config import Config
from flask import Blueprint, jsonify, request
from utils import getDatetime, getNeo4J, query, uniqueID, validRequest

door_bp = Blueprint("door", __name__)
db = getNeo4J()


@door_bp.route("/door/open", methods=["POST"])
def open_door():
    try:
        if not "token" in request.headers:
            return jsonify({"message": "E002", "status": 400}), 200
        records, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})- [c:CONTROL]-> (home:Home)
                RETURN c.role AS control_role LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("token"),
        )
        if len(records) != 1:
            return jsonify({"message": "E002", "status": 400}), 200

        response = requests.post(f"{Config.ESP_SERVER_URL}/door/unlock")
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


@door_bp.route("/door/lock", methods=["POST"])
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
            return jsonify({"message": "E002", "status": 400}), 200

        response = requests.post(f"{Config.ESP_SERVER_URL}/door/lock")
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

@door_bp.route("/pass", methods=["GET"])
def get_pass():
    try:

        records, _, _ = db.execute_query(
            query(
                """MATCH (h:Home {id: $id})
                    RETURN h.password AS password
                    LIMIT 1"""
            ),
            routing_= "r",
            id=request.args.get('id'),
        )

        if records:
            # Check if the records list is empty
            if len(records) > 0:
                password = records[0]["password"]
                return jsonify(password), 200
            else:
                return jsonify({"message": "No records found"}), 404

        else:
            return jsonify({"message": "No records found"}), 404

    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200