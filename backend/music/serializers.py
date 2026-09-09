from rest_framework import serializers

from .models import MusicTrack


class MusicTrackSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source="owner.username", read_only=True)
    genre_label = serializers.CharField(source="get_genre_display", read_only=True)

    class Meta:
        model = MusicTrack
        fields = [
            "id", "title", "artist", "genre", "genre_label", "audio_url",
            "duration_seconds", "file_size_bytes", "owner", "owner_name", "created_at",
        ]
        read_only_fields = ["id", "owner", "owner_name", "genre_label", "created_at"]

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title ya wimbo inahitajika.")
        return value

    def validate_file_size_bytes(self, value):
        if value > 50 * 1024 * 1024:
            raise serializers.ValidationError("Wimbo usizidi 50MB.")
        return value

    def validate_duration_seconds(self, value):
        if value < 1 or value > 15 * 60:
            raise serializers.ValidationError("Wimbo lazima uwe kati ya sekunde 1 na dakika 15.")
        return value
