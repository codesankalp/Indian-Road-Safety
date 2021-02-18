from django.urls import path, include
from .views import *
from rest_framework import routers

router = routers.DefaultRouter()

router.register('road', RoadViewSet, basename='road')

urlpatterns = [
    path('', test, name='hello'),
    path('api/', include(router.urls)),
]
