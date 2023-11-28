import os
import uuid

import cv2
import numpy as np
import tensorflow as tf
from keras.layers import Layer

basedir = os.path.join(os.getcwd(), "application")


def preprocess(path):
    byte_img = tf.io.read_file(path)
    img = tf.io.decode_png(byte_img, channels=3)

    return tf.image.resize(img, (105, 105)) / 255.0  # type: ignore


def verify(model, threshold, accept_threshold=0.8, accept_numbers=5):
    results = []
    accept = 0
    for image in os.listdir(os.path.join(basedir, "data")):
        input_img = preprocess(os.path.join(basedir, "input_image.png"))
        validation_img = preprocess(os.path.join(basedir, "data", image))

        # Make Predictions
        result = model.predict(
            list(np.expand_dims([input_img, validation_img], axis=1))
        )
        results.append(result)

        if result >= accept_threshold:
            accept += 1
        if accept == accept_numbers:
            return results, True

    verified = np.average(results) >= threshold

    return results, verified


class L1Dist(Layer):
    def __init__(self, **kwargs):
        super().__init__()

    def call(self, input_embedding, validation_embedding):
        return tf.math.abs(input_embedding - validation_embedding)

def face_verificate(model, user_dir: str, image_dir: str) -> float:
    results = []
    for image in os.listdir(user_dir):
        input_image = preprocess(image_dir)
        validation_image = preprocess(os.path.join(user_dir, image))

        result = model.predict(
            list(np.expand_dims([input_image, validation_image], axis=1))
        )
        results.append(result)
    return np.average(results)


def identify(model, image_dir: str, accept_threshold: float = 0.7):
    users_dir = os.path.join(os.getcwd(),"application/users") 
    for user in os.listdir(users_dir):
        user_dir = os.path.join(users_dir, user)
        if not os.path.isdir(user_dir):
            continue

        if face_verificate(model, user_dir, image_dir) >= accept_threshold:
            return True, user

    return False, "unknown"

def check(image_dir: str, accept_threshold: float = 0.7):
    if not os.path.isdir(basedir):
        os.mkdir(basedir)

    if not os.path.isdir(os.path.join(basedir, "data")):
        os.mkdir(os.path.join(basedir, "data"))

    siamese_model = tf.keras.models.load_model(
        "model.h5",
        custom_objects={
            "L1Dist": L1Dist,
            "BinaryCrossentropy": tf.losses.BinaryCrossentropy,
        },
        compile=False,
    )
    return identify(siamese_model,image_dir,accept_threshold)
    