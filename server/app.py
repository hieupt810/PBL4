from __future__ import print_function

from auth.routes import auth_bp
from config import Config
from home.routes import home_bp
from utils import generate_token, get_app, get_neo4j, query, uniqueid

app = get_app()

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(home_bp, url_prefix="/api/home")

if __name__ == "__main__":
    if Config.valid_env():
        _, _, _ = get_neo4j().execute_query(
            query(
                """MERGE (u:User {name: $name})
                SET u.username = $username,
                    u.password = $password,
                    u.token = $token,
                    u.id = $id,
                    u.role = 2"""
            ),
            routing_="w",
            name="Root",
            username=Config.ROOT_USERNAME,
            password=Config.ROOT_PASSWORD,
            token=generate_token(),
            id=uniqueid(),
        )

        app.run(debug=True, host=Config.SERVER_HOST, port=8082, threaded=True)
    else:
        print("Missing variable(s) in local environment")
