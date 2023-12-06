from flask import Flask, jsonify, request
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")


@app.route("/temperature", methods=["POST"])
def handle_temperature():
    req = request.get_json()

    temperature = req["temperature"]
    print(f"Temperature: {temperature}°C")
    if temperature != None or temperature.str.lower() != "nan":
        socketio.emit("temperature", {"temperature": temperature})

    return jsonify({"message": "Temperature received successfully", "status": 200}), 200


@app.route("/humidity", methods=["POST"])
def handle_humidity():
    req = request.get_json()

    humidity = req["humidity"]
    print(f"Humidity: {humidity}%")
    if humidity != None or humidity.str.lower()  != "nan":
        socketio.emit("humidity", {"humidity": humidity})
    return jsonify({"message": "Humidity received successfully"})


if __name__ == "__main__":
    socketio.run(
        app, host="0.0.0.0", port=5005, debug=False, use_reloader=True, log_output=False
    )
