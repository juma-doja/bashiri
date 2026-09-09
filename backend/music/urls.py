from django.urls import path

from .views import MusicTrackDeleteView, MusicTrackListCreateView, MusicUploadSignatureView

urlpatterns = [
    path("upload-signature/", MusicUploadSignatureView.as_view(), name="music-upload-signature"),
    path("tracks/", MusicTrackListCreateView.as_view(), name="music-tracks"),
    path("tracks/<int:track_id>/", MusicTrackDeleteView.as_view(), name="music-track-delete"),
]
