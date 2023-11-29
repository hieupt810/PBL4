import os
import requests
from config import Config
from flask import Blueprint, jsonify, request
from utils import getNeo4J, query, validRequest
from utils import getNeo4J, query, validRequest, allowed_file, getDatetime, uniqueID
from werkzeug.utils import secure_filename
from verificator import check

door_bp = Blueprint("door", __name__)
db = getNeo4J()

basedir = os.path.join(os.getcwd(), "application")

@door_bp.route("/door/open", methods=["POST"])
def open_door():
    try:
        if not "token" in request.headers:
            return jsonify({"message": "E002", "status": 400}), 200
        rec, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})- [c:CONTROL]-> (home:Home)
                RETURN c.role AS control_role LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("token"),
        )
        if len(rec) != 1:
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
        rec, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})
                RETURN u.role AS role LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("token"),
        )
        if len(rec) != 1 or rec[0]["role"] == 0:
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
        rec, _, _ = db.execute_query(
            query(
                """MATCH (h:Home {id: $id})
                    RETURN h.password AS password
                    LIMIT 1"""
            ),
            routing_="r",
            id=request.args.get("id"),
        )

        if rec:
            # Check if the rec list is empty
            if len(rec) > 0:
                password = rec[0]["password"]
                return jsonify(password), 200
            else:
                return jsonify({"message": "No rec found"}), 404

        else:
            return jsonify({"message": "No rec found"}), 404

    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200


@door_bp.route("/resetPass", methods=["PUT"])
def reset_pass():
    requires = ["oldPass", "newPass"]
    req = request.get_json()
    try:
        if not validRequest(req, requires):
            return jsonify({"message": "E002", "status": 400}), 200
        rec, _, _ = db.execute_query(
            query(
                """MATCH (h:Home {id: $id, password: $password})
                    RETURN h.id AS password
                    LIMIT 1"""
            ),
            routing_="r",
            id=Config.HOME_ID,
            password=req["oldPass"],
        )
        if rec:
            # Check if the rec list is empty
            if len(rec) > 0:
                _, _, _ = db.execute_query(
                    query(
                        """MATCH (h:Home {id: $id, password: $password})
                    SET h.password = $newPass"""
                    ),
                    routing_="w",
                    id=Config.HOME_ID,
                    password=req["oldPass"],
                    newPass=req["newPass"],
                )
                return jsonify({"message": "I003", "status": 200}), 200
            else:
                return jsonify({"message": "No rec found"}), 404

        else:
            return jsonify({"message": "HomeID or Password is incorrect"}), 404
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200


@door_bp.route("/history", methods=["GET"])
def history():  
    try:
        rec, _, _ = db.execute_query(
            query(
                """MATCH (o:Open)-[:TO]->(h:Home)
                MATCH (o)-[:BY]->(u:User)
                WHERE h.id = $home_id
                RETURN o.id AS id, o.imgUrl AS imgUrl, u.username AS username, o.atTime AS atTime, o.success AS success"""
            ),
            routing_="r",
            home_id = Config.HOME_ID,
        )
        if rec:
            # Check if the rec list is empty
            if len(rec) > 0:
                history = [{"id": r["id"],"imgUrl": r["imgUrl"], "username": r["username"], "atTime": r["atTime"], "success": r["success"]} for r in rec]
                return jsonify({"history": history}), 200
            else:
                return jsonify({"message": "No r found"}), 404
        else:
            return jsonify({"message": "No r found"}), 404

    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200
    

@door_bp.route("/faceCheck", methods=["POST"])
def face_recognition():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image part in the request'}), 400
        
        file = request.files['image']

        if file and allowed_file(file.filename):
            file_name = uniqueID()+".jpe"
            file_path = os.path.join(basedir, "upload", file_name)
            file.save(file_path)
            c , user = check(file_path)
            if c:
                _, _, _ = db.execute_query(
                    query(
                        """MATCH (u:User {username: $username})
                        MATCH (h:Home {id: $home_id})
                        CREATE (o:Open {imgUrl: $imgUrl, atTime: $atTime, success: $success})
                        CREATE (o)-[:TO]->(h)
                        CREATE (o)-[:BY]->(u)"""
                    ),
                    routing_="w",
                    imgUrl=file_name,
                    username=user,
                    home_id=Config.HOME_ID,
                    atTime=getDatetime(),
                    success=True,
                )
                response = requests.post(f"http://{Config.ESP_SERVER_URL}/door/unlock")
                # if response.status_code == 200:
                #     # Xử lý phản hồi thành công
                #     print("Request successful.")
                # else:
                #     # Xử lý lỗi
                #     print("Request failed with status code:", response.status_code)
                #     print("Response:", response.text)
                return jsonify({'message': 'Face recognized successfully'}), 200
            else:
                _, _, _ = db.execute_query(
                    query(
                        """MATCH (u:User {username: $username})
                        MATCH (h:Home {id: $home_id})
                        CREATE (o:Open {imgUrl: $imgUrl, atTime: $atTime, success: $success})
                        CREATE (o)-[:TO]->(h)
                        CREATE (o)-[:BY]->(u)"""
                    ),
                    routing_="w",
                    imgUrl=file_name,
                    username='unknown',
                    home_id=Config.HOME_ID,
                    atTime=getDatetime(),
                    success=False,
                )
                return jsonify({'error': 'Face recognition failed'}), 400
            
        else:
            return jsonify({'error': 'Invalid file type'}), 400
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200