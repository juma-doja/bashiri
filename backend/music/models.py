from django.conf import settings
from django.db import models


class MusicTrack(models.Model):
    GENRE_CHOICES = [
        ("MATCHDAY", "Matchday"),
        ("CHILL", "Chill"),
        ("FOCUS", "Focus"),
        ("LATE_NIGHT", "Late Night"),
        ("OTHER", "Other"),
    ]

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="music_tracks")
    title = models.CharField(max_length=120)
    artist = models.CharField(max_length=120, blank=True, default="")
    genre = models.CharField(max_length=20, choices=GENRE_CHOICES, default="OTHER")
    audio_url = models.URLField(max_length=500)
    cloudinary_public_id = models.CharField(max_length=255)
    duration_seconds = models.PositiveIntegerField(default=0)
    file_size_bytes = models.PositiveBigIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "music_track"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.owner}"
