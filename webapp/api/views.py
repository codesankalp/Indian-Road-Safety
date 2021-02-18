from django.shortcuts import render, HttpResponse
from .mlmodel import model_path, label_path, detect
from .models import Roads
from .serializers import RoadSerializer, PostRoadSerializer
from rest_framework import viewsets
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.core.files import File
import os
import base64
from PIL import Image
from io import BytesIO
from rest_framework import status


def test(request):
    print(model_path, label_path)
    boxes, scores, classes, num, image_byte = detect(
        'India_000002.jpg'
    )
    image_b64 = image_byte.decode("utf-8")
    return HttpResponse(f'<img src="data:image/png;base64, {image_b64}" alt="Red dot" />')


class RoadViewSet(viewsets.ModelViewSet):
    queryset = Roads.objects.all()
    serializer_class = PostRoadSerializer

    def list(self, request):
        queryset = Roads.objects.all()
        serializer = RoadSerializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        try:
            data = request.data
            img = request.FILES['original_image']
            fs = FileSystemStorage()
            filename = fs.save(img.name, img)
            file_url = fs.url(filename)
            file_url = f'{settings.BASE_DIR}{file_url}'
            boxes, scores, classes, num, image_byte, det_img = detect(
                file_url
            )
            image_b64 = image_byte.decode("utf-8")
            img_obj = File(det_img, name=f'detected_{img.name}')
            detected_img = fs.save(img_obj.name, img_obj)
            print(fs.url(detected_img))
            obj = Roads(
                original_image=filename,
                detected_image=detected_img,
                detected_base64=image_b64,
                longitude=data.get('longitude', 0),
                latitude=data.get('latitude', 0),
                boxes=boxes,
                scores=scores,
                classes=classes,
                num=num
            )
            obj.save()
            queryset = Roads.objects.all()
            serializer = RoadSerializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(e, type(e))
            return Response({'error': f'{e}'}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        queryset = Roads.objects.all()
        road = get_object_or_404(queryset, pk=pk)
        serializer = RoadSerializer(road)
        return Response(serializer.data)

    def update(self, request, pk=None):
        try:
            data = request.data
            img = request.FILES['original_image']
            fs = FileSystemStorage()
            filename = fs.save(img.name, img)
            file_url = fs.url(filename)
            file_url = f'{settings.BASE_DIR}{file_url}'
            boxes, scores, classes, num, image_byte, det_img = detect(
                file_url
            )
            image_b64 = image_byte.decode("utf-8")
            img_obj = File(det_img, name=f'detected_{img.name}')
            detected_img = fs.save(img_obj.name, img_obj)
            print(fs.url(detected_img))
            queryset = Roads.objects.all()
            road = get_object_or_404(queryset, pk=pk)
            road.original_image = filename
            road.detected_image = detected_img
            road.detected_base64 = image_b64
            road.longitude = data.get('longitude', 0)
            road.latitude = data.get('latitude', 0)
            road.boxes = boxes
            road.scores = scores
            road.classes = classes
            road.num = num
            road.save()
            serializer = RoadSerializer(road)
            return Response(serializer.data)
        except Exception as e:
            print(e, type(e))
            return Response({'error': f'{e}'}, status=status.HTTP_400_BAD_REQUEST)
