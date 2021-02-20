import requests
import time
import os
import random

north_lat, north_long = (28.831539, 77.129251)
south_lat, south_long = (28.451887, 77.183024)
east_lat, east_long = (28.652580, 77.328073)
west_lat, west_long = (28.630283, 76.922609)


def get_random(min_val, max_val):
    return round(random.uniform(min_val, max_val), 6)


url = 'http://127.0.0.1:8000/api/road/'
lats = [north_lat, south_lat, east_lat, west_lat]
longs = [north_long, south_long, east_long, west_long]
path = '/home/sankalp/Desktop/Indian-Road-Safety/images'
for i in os.listdir(path):
    files = {
        'original_image': open(f'{path}/{i}', 'rb'),
    }

    data = {
        'latitude': get_random(random.choice(lats), random.choice(lats)),
        'longitude': get_random(random.choice(longs), random.choice(longs)),
    }
    requests.post(url, files=files, data=data)
    print(i)
    time.sleep(2)
