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


if __name__ == "__main__":
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

    cap = cv2.VideoCapture(0)
    while cap.isOpened():
        ret, frame = cap.read()
        frame = frame[250 : 250 + 400, 450 : 450 + 400, :]

        cv2.imshow("Verification", frame)

        # Collect new person
        if cv2.waitKey(1) & 0xFF == ord("c"):
            if len(os.listdir(os.path.join(basedir, "data"))) < 20:
                img_name = os.path.join(basedir, "data", "{}.png".format(uuid.uuid4()))
                cv2.imwrite(img_name, frame)
            else:
                print("Enough data")

        # Verification trigger
        if cv2.waitKey(10) & 0xFF == ord("v"):
            cv2.imwrite(os.path.join(basedir, "input_image.png"), frame)

            results, verified = verify(siamese_model, 0.5)
            print(1 - np.average(results), verified)

        if cv2.waitKey(10) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
