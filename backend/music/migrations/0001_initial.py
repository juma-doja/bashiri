from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]
    operations = [
        migrations.CreateModel(
            name="MusicTrack",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=120)),
                ("artist", models.CharField(blank=True, default="", max_length=120)),
                ("genre", models.CharField(choices=[("MATCHDAY", "Matchday"), ("CHILL", "Chill"), ("FOCUS", "Focus"), ("LATE_NIGHT", "Late Night"), ("OTHER", "Other")], default="OTHER", max_length=20)),
                ("audio_url", models.URLField(max_length=500)),
                ("cloudinary_public_id", models.CharField(max_length=255)),
                ("duration_seconds", models.PositiveIntegerField(default=0)),
                ("file_size_bytes", models.PositiveBigIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="music_tracks", to=settings.AUTH_USER_MODEL)),
            ],
            options={"db_table": "music_track", "ordering": ["-created_at"]},
        ),
    ]
