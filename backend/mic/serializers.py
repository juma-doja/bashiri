from urllib.parse import urlparse

from django.conf import settings
from rest_framework import serializers

from .models import (
    MicReaction,
    MicReactionVote,
    ReelPost,
    ReelPostComment,
)
from predictions.models import Match


class MicReactionSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    avatar_url = serializers.CharField(source="user.avatar_url", read_only=True)
    vote_count = serializers.SerializerMethodField()
    user_voted = serializers.SerializerMethodField()
    user_vote_emoji = serializers.SerializerMethodField()
    vote_breakdown = serializers.SerializerMethodField()
    
    # Phase 1: Make duration_seconds optional to support future frontend
    duration_seconds = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = MicReaction
        fields = [
            "id", "match", "user", "username", "avatar_url", "video_url", "thumbnail_url",
            "duration_seconds", "mood", "team_side", "is_fan_of_match",
            "vote_count", "user_voted", "user_vote_emoji", "vote_breakdown", "created_at",
        ]
        read_only_fields = ["id", "user", "username", "avatar_url", "is_fan_of_match", "vote_count", "user_voted", "user_vote_emoji", "vote_breakdown", "created_at"]

    def get_vote_count(self, obj):
        return obj.votes.count()

    def get_user_voted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.votes.filter(user=request.user).exists()
        return False

    def get_user_vote_emoji(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            vote = obj.votes.filter(user=request.user).first()
            return vote.emoji if vote else None
        return None

    def get_vote_breakdown(self, obj):
        from django.db.models import Count
        breakdown = {}
        for emoji_choice, _ in obj._meta.get_field('votes').related_model._meta.get_field('emoji').choices:
            count = obj.votes.filter(emoji=emoji_choice).count()
            if count > 0:
                breakdown[emoji_choice] = count
        return breakdown


class MicReactionVoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = MicReactionVote
        fields = ["id", "mic_reaction", "emoji", "created_at"]
        read_only_fields = ["id", "created_at"]


class ReelPostCommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    avatar_url = serializers.CharField(source="user.avatar_url", read_only=True)

    class Meta:
        model = ReelPostComment
        fields = ["id", "username", "avatar_url", "content", "created_at"]
        read_only_fields = fields


class CreateReelPostCommentSerializer(serializers.Serializer):
    content = serializers.CharField(max_length=500, trim_whitespace=True)


class ReelPostSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    avatar_url = serializers.CharField(source="user.avatar_url", read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    shares_count = serializers.IntegerField(read_only=True)
    user_liked = serializers.BooleanField(read_only=True)
    match_details = serializers.SerializerMethodField()

    class Meta:
        model = ReelPost
        fields = [
            "id",
            "user",
            "username",
            "avatar_url",
            "match",
            "match_details",
            "media_type",
            "media_url",
            "thumbnail_url",
            "caption",
            "duration_seconds",
            "likes_count",
            "comments_count",
            "shares_count",
            "user_liked",
            "created_at",
        ]
        read_only_fields = fields

    def get_match_details(self, obj):
        if not obj.match_id:
            return None
        match = obj.match
        return {
            "id": match.id,
            "home_team": match.home_team.name,
            "away_team": match.away_team.name,
            "league": match.league.name,
            "status": match.status,
            "home_score": match.home_score,
            "away_score": match.away_score,
        }


class CreateReelPostSerializer(serializers.Serializer):
    media_type = serializers.ChoiceField(choices=["IMAGE", "VIDEO"])
    media_url = serializers.URLField(max_length=1000)
    thumbnail_url = serializers.URLField(max_length=1000, required=False, allow_blank=True)
    caption = serializers.CharField(max_length=500, required=False, allow_blank=True)
    duration_seconds = serializers.IntegerField(min_value=0, max_value=60, required=False, default=0)
    match = serializers.PrimaryKeyRelatedField(
        queryset=Match.objects.all(),
        required=False,
        allow_null=True,
    )

    def validate_media_url(self, value):
        parsed = urlparse(value)
        cloud_name = settings.CLOUDINARY_STORAGE["CLOUD_NAME"]
        if (
            parsed.scheme != "https"
            or parsed.netloc != "res.cloudinary.com"
            or not parsed.path.startswith(f"/{cloud_name}/")
            or "/bashiri/reels/" not in parsed.path
        ):
            raise serializers.ValidationError("Media lazima ipakiwe kupitia Cloudinary ya Bashiri Reels.")
        return value

    def validate(self, attrs):
        parsed = urlparse(attrs["media_url"])
        expected_resource = f"/{attrs['media_type'].lower()}/upload/"
        if expected_resource not in parsed.path:
            raise serializers.ValidationError({
                "media_url": "Aina ya media haifanani na faili lililopakiwa."
            })
        if attrs["media_type"] == "IMAGE" and attrs.get("duration_seconds", 0):
            raise serializers.ValidationError({"duration_seconds": "Picha haina muda wa video."})
        return attrs