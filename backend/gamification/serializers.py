"""
gamification/serializers.py

Serializers for gamification system
"""
from rest_framework import serializers
from .models import UserAchievement, UserProgress, Referral, DailyChallenge, UserChallenge, SocialShare


class UserProgressSerializer(serializers.ModelSerializer):
    """Serializer for user progress with XP and levels"""
    class Meta:
        model = UserProgress
        fields = [
            'level', 'experience_points', 'current_level_xp', 'next_level_xp',
            'ai_agreement_score', 'social_shares_count', 'referral_count', 'last_updated'
        ]
    
    def to_representation(self, instance):
        """Add derived fields from User model"""
        data = super().to_representation(instance)
        data['total_tips_created'] = instance.total_tips_created
        data['total_tips_correct'] = instance.total_tips_correct
        data['longest_streak'] = instance.longest_streak
        data['current_streak'] = instance.current_streak
        data['level_progress'] = (instance.current_level_xp / instance.next_level_xp * 100) if instance.next_level_xp > 0 else 0
        return data


class UserAchievementSerializer(serializers.ModelSerializer):
    """Serializer for user achievements/badges"""
    class Meta:
        model = UserAchievement
        fields = ['id', 'achievement_type', 'earned_at', 'metadata']
        read_only_fields = ['earned_at']


class ReferralSerializer(serializers.ModelSerializer):
    """Serializer for referral tracking"""
    class Meta:
        model = Referral
        fields = ['id', 'referral_code', 'status', 'reward_points', 'created_at', 'completed_at', 'expires_at']
        read_only_fields = ['created_at', 'completed_at']


class DailyChallengeSerializer(serializers.ModelSerializer):
    """Serializer for daily challenges"""
    class Meta:
        model = DailyChallenge
        fields = ['id', 'challenge_type', 'title', 'description', 'reward_xp', 'target_value', 'challenge_date', 'is_active']


class UserChallengeSerializer(serializers.ModelSerializer):
    """Serializer for user challenge participation"""
    class Meta:
        model = UserChallenge
        fields = ['id', 'challenge', 'current_value', 'completed', 'completed_at', 'started_at']
        read_only_fields = ['started_at', 'completed_at']
    
    challenge = DailyChallengeSerializer(read_only=True)


class SocialShareSerializer(serializers.ModelSerializer):
    """Serializer for social sharing tracking"""
    class Meta:
        model = SocialShare
        fields = ['id', 'share_type', 'content_type', 'content_id', 'shared_at', 'reward_xp']
        read_only_fields = ['shared_at']