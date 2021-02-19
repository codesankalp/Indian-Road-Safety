from .models import Roads
from rest_framework import serializers


class RoadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Roads
        fields = ['id', 'original_image',
                  'detected_image', 'longitude', 'latitude', 'effect_percentage']


class PostRoadSerializer(RoadSerializer):
    class Meta:
        model = Roads
        fields = ['id', 'original_image', 'longitude', 'latitude']
