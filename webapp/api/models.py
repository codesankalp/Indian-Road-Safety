from django.db import models


class Roads(models.Model):
    original_image = models.ImageField()
    detected_image = models.ImageField()
    detected_base64 = models.TextField()
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    effect_percentage = models.DecimalField(max_digits=9, decimal_places=6)
    boxes = models.TextField()
    scores = models.TextField()
    classes = models.TextField()
    num = models.TextField()
