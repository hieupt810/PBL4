from __future__ import print_function

from config import Config
from utils import get_app

app = get_app()

if __name__ == "__main__":
    if Config.SERVER_HOST:
        app.run(debug=True, host=Config.SERVER_HOST, port=8082, threaded=True)
    else:
        print("Can not find server host in local environment")
