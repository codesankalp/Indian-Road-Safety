from django.urls import path, include
from .views import *
from rest_framework import routers

router = routers.DefaultRouter()

router.register('road', RoadViewSet, basename='road')

urlpatterns = [
    path('', index, name='home_page'),
    path('test/', test, name='hello'),
    path('api/', include(router.urls)),
]
