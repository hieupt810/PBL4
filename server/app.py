from __future__ import print_function

from auth.routes import auth_bp
from config import Config
from utils import get_app

app = get_app()

app.register_blueprint(auth_bp, url_prefix="/api/auth")

if __name__ == "__main__":
    if Config.SERVER_HOST:
        app.run(debug=True, host=Config.SERVER_HOST, port=8082, threaded=True)
    else:
        print("Missing server host in local environment")
