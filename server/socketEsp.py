from flask import Flask, request, jsonify
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/temperature', methods=['POST'])
def handle_temperature():
    data = request.json  
    temperature = data.get('temperature')
    print(f"Temperature: {temperature}°C")
    if temperature != None:
        socketio.emit('temperature', {'temperature': temperature})

    humidity = data.get('humidity')
    print(f"Humidity: {humidity}%")
    if humidity != None:
        socketio.emit('humidity', {'humidity': humidity})
    return jsonify({'message': 'Temperature received successfully'})

@app.route('/humidity', methods=['POST'])
def handle_humidity():
    data = request.json 
    humidity = data.get('humidity')
    print(f"Humidity: {humidity}%")
    socketio.emit('humidity', {'humidity': humidity})
    return jsonify({'message': 'Humidity received successfully'})

if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=5005, debug=True)