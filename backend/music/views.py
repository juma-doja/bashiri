import time

import cloudinary.api
import cloudinary.utils
from django.conf import settings
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import MusicTrack
from .serializers import MusicTrackSerializer


class MusicUploadSignatureView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        timestamp = int(time.time())
        params = {"timestamp": timestamp, "folder": "bashiri/music"}
        signature = cloudinary.utils.api_sign_request(params, settings.CLOUDINARY_STORAGE["API_SECRET"])
        return Response({
            "signature": signature,
            "timestamp": timestamp,
            "api_key": settings.CLOUDINARY_STORAGE["API_KEY"],
            "cloud_name": settings.CLOUDINARY_STORAGE["CLOUD_NAME"],
            "folder": "bashiri/music",
            "resource_type": "video",
            "max_bytes": 50 * 1024 * 1024,
        })


class MusicTrackListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tracks = MusicTrack.objects.filter(owner=request.user, is_active=True)
        return Response(MusicTrackSerializer(tracks, many=True).data)

    def post(self, request):
        serializer = MusicTrackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        track = serializer.save(owner=request.user)
        return Response(MusicTrackSerializer(track).data, status=status.HTTP_201_CREATED)


class MusicTrackDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, track_id):
        track = MusicTrack.objects.filter(id=track_id, owner=request.user).first()
        if not track:
            return Response({"detail": "Wimbo haujapatikana."}, status=status.HTTP_404_NOT_FOUND)
        try:
            cloudinary.api.delete_resources(
                [track.cloudinary_public_id],
                resource_type="video",
                type="upload",
            )
        except Exception:
            pass
        track.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
