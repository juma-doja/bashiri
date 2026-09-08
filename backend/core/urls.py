from django.urls import path
from .views import VisitorLogView, health_check

urlpatterns = [
    path("health/", health_check, name="health-check"),
    path("visits/", VisitorLogView.as_view(), name="visitor-log"),
]