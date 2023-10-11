from __future__ import print_function

from auth.routes import auth_bp
from config import Config
from door.routes import door_bp
from home.routes import home_bp
from ir.routes import ir_bp
from led.routes import led_bp
from user.routes import user_bp
from utils import get_app, getDatetime, getNeo4J, query, uniqueID
from werkzeug.security import generate_password_hash

app = get_app()

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(door_bp, url_prefix="/api/door")
app.register_blueprint(home_bp, url_prefix="/api/home")
app.register_blueprint(ir_bp, url_prefix="/api/ir")
app.register_blueprint(led_bp, url_prefix="/api/led")
app.register_blueprint(user_bp, url_prefix="/api/user")

if __name__ == "__main__":
    if Config.valid_env():
        _, _, _ = getNeo4J().execute_query(
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
            id=uniqueID(),
            updated_at=getDatetime(),
        )

        app.run(debug=True, host=Config.SERVER_HOST, port=8082, threaded=True)
    else:
        print("Missing variable(s) in local environment")
