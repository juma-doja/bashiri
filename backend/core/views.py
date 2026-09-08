"""
core/views.py — Health check endpoint kuthibitisha Django, PostgreSQL,
na Redis zinaongea kabla ya kuendelea na Phase 1/2.
"""
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.conf import settings
import redis
from django.utils import timezone
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import VisitorLog


@require_GET
def health_check(request):
    status = {
        "bashiri": "ok",
        "database": "unknown",
        "redis": "unknown",
        "version": "1.0.0",
    }
    http_status = 200

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        status["database"] = "ok"
    except Exception as e:
        status["database"] = f"error: {e}"
        http_status = 503

    try:
        r = redis.from_url(settings.CELERY_BROKER_URL)
        r.ping()
        status["redis"] = "ok"
    except Exception as e:
        status["redis"] = f"error: {e}"
        http_status = 503

    return JsonResponse(status, status=http_status)


class VisitorLogView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        visitor_key = str(request.data.get("visitor_key", "")).strip()
        path = str(request.data.get("path", "/")).strip()[:500] or "/"
        if len(visitor_key) < 16 or len(visitor_key) > 64:
            return Response({"detail": "visitor_key is required."}, status=400)

        VisitorLog.objects.update_or_create(
            visitor_key=visitor_key,
            visit_date=timezone.localdate(),
            path=path,
            defaults={
                "user": request.user if request.user.is_authenticated else None,
                "user_agent": request.META.get("HTTP_USER_AGENT", "")[:500],
            },
        )
        return Response({"tracked": True}, status=201)
