from __future__ import print_function

from auth.routes import auth_bp
from config import Config
from utils import get_app, get_neo4j, query

app = get_app()

app.register_blueprint(auth_bp, url_prefix="/api/auth")

if __name__ == "__main__":
    if (
        Config.SERVER_HOST
        and Config.NEO4J_URI
        and Config.NEO4J_USERNAME
        and Config.NEO4J_PASSWORD
        and Config.ROOT_USERNAME
        and Config.ROOT_PASSWORD
    ):
        db = get_neo4j()
        _, _, _ = db.execute_query(
            query(
                """MERGE (u:User {name: $name})
                SET u.username = $username, u.password = $password, u.token = '', u.role = 2"""
            ),
            routing_="w",
            name="Root",
            username=Config.ROOT_USERNAME,
            password=Config.ROOT_PASSWORD,
        )

        app.run(debug=True, host=Config.SERVER_HOST, port=8082, threaded=True)
    else:
        print("Missing variable(s) in local environment")
