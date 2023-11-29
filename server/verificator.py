import os

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision
from PIL import Image

basedir = os.path.join(os.getcwd(), "application")
class SiameseNetwork(nn.Module):
    def __init__(self):
        super(SiameseNetwork, self).__init__()

        self.cnn1 = nn.Sequential(
            nn.Conv2d(1, 96, kernel_size=11, stride=4),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(3, stride=2),
            nn.Conv2d(96, 256, kernel_size=5, stride=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, stride=2),
            nn.Conv2d(256, 384, kernel_size=3, stride=1),
            nn.ReLU(inplace=True),
        )

        self.fc1 = nn.Sequential(
            nn.Linear(384, 1024),
            nn.ReLU(inplace=True),
            nn.Linear(1024, 256),
            nn.ReLU(inplace=True),
            nn.Linear(256, 2),
        )

    def forward_once(self, x):
        # This function will be called for both images
        # It's output is used to determine the similiarity
        output = self.cnn1(x)
        output = output.view(output.size()[0], -1)
        output = self.fc1(torch.transpose(output, 0, 1))
        return output

    def forward(self, input1, input2):
        # In this function we pass in both images and obtain both vectors
        # which are returned
        output1 = self.forward_once(input1)
        output2 = self.forward_once(input2)

        return output1, output2


def preprocess(path):
    transformation = torchvision.transforms.Compose(
        [torchvision.transforms.Resize((100, 100)), torchvision.transforms.ToTensor()]
    )
    return transformation(Image.open(path).convert("L"))

def load_model():
    device = torch.device("cpu")
    model = SiameseNetwork().to(device)
    model.load_state_dict(torch.load("SNN_50.pt", map_location=device))
    return model

def face_verificate(model, user_dir: str, image_dir: str) -> float:
    results = []
    for image in os.listdir(user_dir):
        input_image = preprocess(image_dir)
        validation_image = preprocess(os.path.join(user_dir, image))

        output1, output2 = model.forward(input_image, validation_image)
        euclidean_distance = F.pairwise_distance(output1, output2)
        results.append(euclidean_distance.item())
    return np.average(results)


def identify(model, image_dir: str, accept_threshold: float = 1.0):
    users_dir = os.path.join(os.getcwd(),"application/users") 
    for user in os.listdir(users_dir):
        user_dir = os.path.join(users_dir, user)
        if not os.path.isdir(user_dir):
            continue

        if face_verificate(model, user_dir, image_dir) <= accept_threshold:
            return True, user

    return False, "unknown"

def check(image_dir: str, accept_threshold: float = 0.7):
    if not os.path.isdir(basedir):
        os.mkdir(basedir)

    if not os.path.isdir(os.path.join(basedir, "data")):
        os.mkdir(os.path.join(basedir, "data"))
    model = load_model()
    return identify(model,image_dir,accept_threshold)
    