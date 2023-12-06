import os
import requests
from config import Config
from flask import Blueprint, jsonify, request
from utils import *
from verificator import check

door_bp = Blueprint("door", __name__)
db = getNeo4J()

basedir = os.path.join(os.getcwd(), "application")

@door_bp.route("/open", methods=["POST"])
def open_door():
    try:
        if not "Authorization" in request.headers:
            return respondWithError(msg="E002",code=400)
        rec, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})- [c:CONTROL]-> (home:Home)
                RETURN c.role AS control_role LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("Authorization"),
        )
        if len(rec) != 1:
            return respondWithError(msg="E002",code=400)

        response = requests.post(f"{Config.ESP_SERVER_URL}/door/unlock")
        if response.status_code == 200:
            # Xử lý phản hồi thành công
            print("Request successful.")
        else:
            # Xử lý lỗi
            print("Request failed with status code:", response.status_code)
            print("Response:", response.text)
        return respond()
    except Exception as error:
        return respondWithError(code = 500, error = error)


@door_bp.route("/lock", methods=["POST"])
def lock_door():
    try:
        if not "Authorization" in request.headers:
            return respondWithError(msg="E002",code=400)
        rec, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})
                RETURN u.role AS role LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("Authorization"),
        )
        if len(rec) != 1:
            return jsonify({"message": "E002", "status": 400}), 200

        response = requests.post(f"{Config.ESP_SERVER_URL}/door/lock")
        if response.status_code == 200:
            # Xử lý phản hồi thành công
            print("Request successful.")
        else:
            # Xử lý lỗi
            print("Request failed with status code:", response.status_code)
            print("Response:", response.text)
        return respond()
    except Exception as error:
        return respondWithError(code = 500, error = error)


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
                return respond(data = password)
            else:
                return respondWithError()

        else:
            return respondWithError()

    except Exception as error:
        return respondWithError(code = 500, error = error)


@door_bp.route("/resetPass", methods=["PUT"])
def reset_pass():
    requires = ["oldPass", "newPass", "home_id"]
    req = request.get_json()
    try:
        if not "Authorization" in request.headers:
            return respondWithError(msg="E002",code=400)
        rec, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})
                RETURN u.role AS role LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("Authorization"),
        )
        if len(rec) != 1:
            return jsonify({"message": "E002", "status": 400}), 200
        if not validRequest(request, requires):
            return respondWithError(msg="E002",code=400)
        rec, _, _ = db.execute_query(
            query(
                """MATCH (h:Home {id: $id, password: $password})
                    RETURN h.id AS password
                    LIMIT 1"""
            ),
            routing_="r",
            id=req["home_id"],
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
                    id=req["home_id"],
                    password=req["oldPass"],
                    newPass=req["newPass"],
                )
                response = requests.post(f"{Config.ESP_SERVER_URL}/door/changePass")
                if response.status_code == 200:
                    # Xử lý phản hồi thành công
                    print("Request successful.")
                else:
                    # Xử lý lỗi
                    print("Request failed with status code:", response.status_code)
                    print("Response:", response.text)
                return respond()
            else:
                return respondWithError()

        else:
            return respondWithError()
    except Exception as error:
        return respondWithError(code = 500, error = error)


@door_bp.route("/history/home/<home_id>", methods=["GET"])
def history(home_id):  
    try:
        if not "Authorization" in request.headers:
            return respondWithError(msg="E002",code=400)
        rec, _, _ = db.execute_query(
            query(
                """MATCH (u:User {token: $token})
                RETURN u.role AS role LIMIT 1"""
            ),
            routing_="r",
            token=request.headers.get("Authorization"),
        )
        if len(rec) != 1:
            return jsonify({"message": "E002", "status": 400}), 200
        rec, _, _ = db.execute_query(
            query(
                """MATCH (o:Open)-[:TO]->(h:Home)
                MATCH (o)-[:BY]->(u:User)
                WHERE h.id = $home_id
                RETURN o.id AS id, o.imgUrl AS imgUrl, u.username AS username, o.atTime AS atTime, o.success AS success"""
            ),
            routing_="r",
            home_id = home_id,
        )
        
        if rec:
            # Check if the rec list is empty
            if len(rec) > 0:
                history = [{"id": r["id"],"imgUrl": r["imgUrl"], "username": r["username"], "atTime": r["atTime"], "success": r["success"]} for r in rec]
                return respond(data= history)
            else:
                return respondWithError()

        else:
            return respondWithError()

    except Exception as error:
        return respondWithError(code = 500, error = error)
    

@door_bp.route("/face-check/home/<home_id>", methods=["POST"])
def face_recognition(home_id):
    try:
        if 'image' not in request.files:
            return respondWithError(code = 404, error = None)
        
        file = request.files['image']

        if file and allowed_file(file.filename):
            file_name = uniqueID()+".png"
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
                    home_id=home_id,
                    atTime=getDatetime(),
                    success=True,
                )
                response = requests.post(f"{Config.ESP_SERVER_URL}/door/unlock")
                if response.status_code == 200:
                    # Xử lý phản hồi thành công
                    print("Request successful.")
                else:
                    # Xử lý lỗi
                    print("Request failed with status code:", response.status_code)
                    print("Response:", response.text)
                return respond()
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
                    home_id=home_id,
                    atTime=getDatetime(),
                    success=False,
                )
                return respondWithError()
            
        else:
            return respondWithError(code=400)
    except Exception as error:
        return respondWithError(code = 500, error = error)