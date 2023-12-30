import os

from dotenv import load_dotenv


class Config(object):
    load_dotenv()

    SERVER_HOST = str(os.environ.get("SERVER_HOST"))

    NEO4J_URI = str(os.environ.get("NEO4J_URI"))
    NEO4J_USERNAME = str(os.environ.get("NEO4J_USERNAME"))
    NEO4J_PASSWORD = str(os.environ.get("NEO4J_PASSWORD"))

    ROOT_USERNAME = str(os.environ.get("ROOT_USERNAME"))
    ROOT_PASSWORD = str(os.environ.get("ROOT_PASSWORD"))

    ESP_SERVER_URL_HOUSE = str(os.environ.get("ESP_SERVER_URL_HOUSE"))
    ESP_SERVER_URL_DOOR = str(os.environ.get("ESP_SERVER_URL_DOOR"))
    
    HOME_ID = str(os.environ.get("HOME_ID"))

    UPLOAD_FOLDER = str(os.environ.get("UPLOAD_FOLDER"))
    HISTORY_FOLDER = str(os.environ.get("HISTORY_FOLDER"))
    ALLOWED_EXTENSIONS = str(os.environ.get("ALLOWED_EXTENSIONS"))