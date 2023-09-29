import requests
from flask import Blueprint, jsonify

ard_bp = Blueprint("ard", __name__)


@ard_bp.route("", methods=["GET"])
def get():
    try:
        r = requests.get("" + "/5/on")
        r.json()

        return jsonify({"message": "", "status": 200, "json": str(r)}), 200
    except Exception as error:
        return jsonify({"message": "E001", "status": 500, "error": str(error)}), 200
