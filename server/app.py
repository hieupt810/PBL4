from __future__ import print_function

from auth.routes import auth_bp
from config import Config
from home.routes import home_bp
from user.routes import user_bp
from device.routes import device_bp
from utils import get_app, get_neo4j, query, uniqueid, get_datetime
from werkzeug.security import generate_password_hash

app = get_app()

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(home_bp, url_prefix="/api/home")
app.register_blueprint(user_bp, url_prefix="/api/user")
app.register_blueprint(device_bp, url_prefix="/api/device")

if __name__ == "__main__":
    if Config.valid_env():
        _, _, _ = get_neo4j().execute_query(
            query(
                """MERGE (u:User {first_name: "Root", last_name: "Smart Home"})
                SET u.username = $username,
                    u.password = $password,
                    u.id = $id,
                    u.role = 2,
                    u.gender = 0,
                    u.updated_at = $updated_at"""
            ),
            routing_="w",
            username=Config.ROOT_USERNAME,
            password=generate_password_hash(Config.ROOT_PASSWORD),
            id=uniqueid(),
            updated_at=get_datetime(),
        )

        app.run(debug=True, host=Config.SERVER_HOST, port=8082, threaded=True)
    else:
        print("Missing variable(s) in local environment")
