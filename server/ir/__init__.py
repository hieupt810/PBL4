from flask import Blueprint, jsonify, request
from utils import getDatetime, getNeo4J, query, uniqueID, validRequest

ir_bp = Blueprint("ir", __name__)
db = getNeo4J()


@ir_bp.route("/create", methods=["POST"])
def createIR():
    requires = ["name", "id", "ir", "mode"]
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
                CREATE (:IR {ir: $ir, name: $name, mode: $mode, id = $id, updated_at : $updated_at})<-[:CONTAINS]-(h)"""
            ),
            routing_="w",
            home_id=req["id"],
            ir=req["ir"],
            name=req["name"],
            mode=req["mode"],
            id=uniqueID(),
            updated_at=getDatetime(),
        )
        return jsonify({"message": "I016", "status": 200}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200
