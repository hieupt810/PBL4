from __future__ import print_function

from auth.routes import auth_bp
from config import Config
from home.routes import home_bp
from utils import get_app, get_neo4j, query, uniqueid
from werkzeug.security import generate_password_hash

app = get_app()

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(home_bp, url_prefix="/api/home")

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
                    u.token = $token"""
            ),
            routing_="w",
            username=Config.ROOT_USERNAME,
            password=generate_password_hash(Config.ROOT_PASSWORD),
            token=uniqueid(),
            id=uniqueid(),
        )

        app.run(debug=True, host=Config.SERVER_HOST, port=8082, threaded=True)
    else:
        print("Missing variable(s) in local environment")
