from .utils.label_map import convert_label_map_to_categories, load_labelmap, create_category_index
from .utils.visualize import *
import os
from django.conf import settings
import numpy as np
import sys
import tarfile
import tensorflow.compat.v1 as tf
import zipfile
from pathlib import Path
from collections import defaultdict
from io import StringIO
from matplotlib import pyplot as plt
from PIL import Image
import base64
import io


tf.disable_v2_behavior()

model_path = settings.BASE_DIR / settings.ML_MODEL
label_path = settings.BASE_DIR / settings.ML_LABEL
NUM_CLASSES = 8
IMAGE_SIZE = (12, 10)


def load_image_into_numpy_array(image):
    (im_width, im_height) = image.size
    return np.array(image.getdata()).reshape(
        (im_height, im_width, 3)).astype(np.uint8)


detection_graph = tf.Graph()
with detection_graph.as_default():
    od_graph_def = tf.GraphDef()
    with tf.gfile.GFile(model_path, 'rb') as fid:
        serialized_graph = fid.read()
        od_graph_def.ParseFromString(serialized_graph)
        tf.import_graph_def(od_graph_def, name='')

label_map = load_labelmap(label_path)
categories = convert_label_map_to_categories(
    label_map, max_num_classes=NUM_CLASSES, use_display_name=True
)
category_index = create_category_index(categories)


def detect(image_path):
    with detection_graph.as_default():
        with tf.Session(graph=detection_graph) as sess:
            # Definite input and output Tensors for detection_graph
            image_tensor = detection_graph.get_tensor_by_name('image_tensor:0')
            # Each box represents a part of the image where a particular object was detected.
            detection_boxes = detection_graph.get_tensor_by_name(
                'detection_boxes:0')
            # Each score represent how level of confidence for each of the objects.
            # Score is shown on the result image, together with the class label.
            detection_scores = detection_graph.get_tensor_by_name(
                'detection_scores:0'
            )
            detection_classes = detection_graph.get_tensor_by_name(
                'detection_classes:0'
            )
            num_detections = detection_graph.get_tensor_by_name(
                'num_detections:0'
            )
            image = Image.open(image_path)
#           print(image)
            # the array based representation of the image will be used later in order to prepare the
            # result image with boxes and labels on it.
            image_np = load_image_into_numpy_array(image)
            # Expand dimensions since the model expects images to have shape: [1, None, None, 3]
            image_np_expanded = np.expand_dims(image_np, axis=0)
            # Actual detection.
            (boxes, scores, classes, num) = sess.run(
                [
                    detection_boxes,
                    detection_scores,
                    detection_classes,
                    num_detections
                ],
                feed_dict={image_tensor: image_np_expanded}
            )
            # print(np.squeeze(boxes),
            #   np.squeeze(classes).astype(np.int32),
            #   np.squeeze(scores), num, category_index, sep="\n")
            # Visualization of the results of a detection.
            _, ls = visualize_boxes_and_labels_on_image_array(
                image_np,
                np.squeeze(boxes),
                np.squeeze(classes).astype(np.int32),
                np.squeeze(scores),
                category_index,
                min_score_thresh=0.3,
                use_normalized_coordinates=True,
                line_thickness=8
            )
            avg = sum(ls)/len(ls)
            plt.figure(figsize=IMAGE_SIZE)
            plt.axis('off')
            plt.imshow(image_np)
            pic_IObytes = io.BytesIO()
            img = io.BytesIO()
            plt.savefig(img, format='png')
            plt.savefig(pic_IObytes,  format='png')
            pic_IObytes.seek(0)
            pic_hash = base64.b64encode(pic_IObytes.read())
            return (boxes, scores, classes, num, pic_hash, img, avg)
