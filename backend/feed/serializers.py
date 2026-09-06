"""feed/serializers.py"""
from rest_framework import serializers

from .models import Card, PollVote
from predictions.ai_pick_config import get_selection_label, normalize_probability_percent


class CardSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # BIG_MATCH was an old alias; clients only implement AI_PICK.
        if representation["type"] == "BIG_MATCH":
            representation["type"] = "AI_PICK"
        data = representation.get("data") or {}
        ai_pick = data.get("ai_pick") if isinstance(data, dict) else None
        if isinstance(ai_pick, dict):
            normalized_data = dict(data)
            normalized_pick = dict(ai_pick)
            selection = normalized_pick.get("selection") or normalized_pick.get("option_key")
            if selection:
                normalized_pick.setdefault("selection", selection)
                normalized_pick.setdefault("selection_label", get_selection_label(selection))
            if "probability_percent" in normalized_pick:
                normalized_pick["probability_percent"] = normalize_probability_percent(
                    normalized_pick["probability_percent"]
                )
            normalized_data["ai_pick"] = normalized_pick
            representation["data"] = normalized_data
        return representation

    class Meta:
        model = Card
        fields = ["id", "type", "match_id", "data", "created_at"]


class PollVoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PollVote
        fields = ["id", "card", "choice", "created_at"]
        read_only_fields = ["id", "created_at"]