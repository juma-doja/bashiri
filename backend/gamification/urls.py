"""
gamification/urls.py

URL configuration for gamification system
"""
from django.urls import path
from .views import (
    UserProgressView, GenerateReferralCodeView, ValidateReferralView, CompleteReferralView,
    SocialShareView, DailyChallengesView, JoinChallengeView, UpdateChallengeProgressView,
    AchievementListView
)

app_name = 'gamification'

urlpatterns = [
    # User progress and achievements
    path('progress/', UserProgressView.as_view(), name='user_progress'),
    path('achievements/', AchievementListView.as_view(), name='achievements_list'),
    
    # Referral system
    path('referral/generate/', GenerateReferralCodeView.as_view(), name='generate_referral'),
    path('referral/validate/', ValidateReferralView.as_view(), name='validate_referral'),
    path('referral/complete/', CompleteReferralView.as_view(), name='complete_referral'),
    
    # Social sharing
    path('share/', SocialShareView.as_view(), name='social_share'),
    
    # Daily challenges
    path('challenges/', DailyChallengesView.as_view(), name='daily_challenges'),
    path('challenges/join/', JoinChallengeView.as_view(), name='join_challenge'),
    path('challenges/update/', UpdateChallengeProgressView.as_view(), name='update_challenge'),
]