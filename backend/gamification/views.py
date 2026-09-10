"""
gamification/views.py

Views for gamification system endpoints
"""
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from datetime import timedelta
import uuid

from .models import UserAchievement, UserProgress, Referral, DailyChallenge, UserChallenge, SocialShare
from .serializers import (
    UserProgressSerializer, UserAchievementSerializer, ReferralSerializer,
    DailyChallengeSerializer, UserChallengeSerializer, SocialShareSerializer
)
from accounts.models import User


class UserProgressView(APIView):
    """GET /api/gamification/progress/ - Get user progress and stats"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Get or create user progress
        progress, created = UserProgress.objects.get_or_create(user=request.user)
        serializer = UserProgressSerializer(progress)
        
        # Get user achievements
        achievements = UserAchievement.objects.filter(user=request.user)
        achievement_serializer = UserAchievementSerializer(achievements, many=True)
        
        return Response({
            'progress': serializer.data,
            'achievements': achievement_serializer.data,
            'is_new': created
        })


class GenerateReferralCodeView(APIView):
    """POST /api/gamification/referral/generate/ - Generate unique referral code"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        from .services import generate_referral_code
        
        # Generate or get existing referral code
        referral_code = generate_referral_code(request.user)
        
        return Response({
            'referral_code': referral_code.referral_code,
            'referral_link': f"https://bashiri.app?ref={referral_code.referral_code}",
            'status': referral_code.status
        })


class ValidateReferralView(APIView):
    """POST /api/gamification/referral/validate/ - Validate referral code during registration"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        referral_code = request.data.get('referral_code')
        
        if not referral_code:
            return Response({'error': 'Referral code required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            referral = Referral.objects.get(referral_code=referral_code)
            
            # Check if referral is still valid
            if referral.status == "COMPLETED":
                return Response({'error': 'Referral code already used'}, status=status.HTTP_400_BAD_REQUEST)
            
            if referral.expires_at and referral.expires_at < timezone.now():
                referral.status = "EXPIRED"
                referral.save()
                return Response({'error': 'Referral code expired'}, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({
                'valid': True,
                'referrer': referral.referrer.username if referral.referrer else None
            })
            
        except Referral.DoesNotExist:
            return Response({'error': 'Invalid referral code'}, status=status.HTTP_404_NOT_FOUND)


class CompleteReferralView(APIView):
    """POST /api/gamification/referral/complete/ - Complete referral after registration"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        referral_code = request.data.get('referral_code')
        
        if not referral_code:
            return Response({'error': 'Referral code required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            referral = Referral.objects.get(referral_code=referral_code)
            
            # Complete the referral
            referral.complete_referral(request.user)
            
            serializer = ReferralSerializer(referral)
            return Response({
                'message': 'Referral completed successfully',
                'reward_points': referral.reward_points,
                'referral': serializer.data
            })
            
        except Referral.DoesNotExist:
            return Response({'error': 'Invalid referral code'}, status=status.HTTP_404_NOT_FOUND)


class SocialShareView(APIView):
    """POST /api/gamification/share/ - Track social sharing and give XP rewards"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        share_type = request.data.get('share_type')
        content_type = request.data.get('content_type')  # 'tip', 'profile', 'match'
        content_id = request.data.get('content_id')
        
        if not all([share_type, content_type, content_id]):
            return Response({'error': 'share_type, content_type, and content_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate share_type
        valid_share_types = ['WHATSAPP', 'FACEBOOK', 'TWITTER', 'TELEGRAM', 'COPY_LINK']
        if share_type not in valid_share_types:
            return Response({'error': f'Invalid share_type. Must be one of: {", ".join(valid_share_types)}'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate content_type
        valid_content_types = ['tip', 'profile', 'match']
        if content_type not in valid_content_types:
            return Response({'error': f'Invalid content_type. Must be one of: {", ".join(valid_content_types)}'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate content_id
        try:
            content_id = int(content_id)
            if content_id <= 0:
                return Response({'error': 'content_id must be a positive integer'}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({'error': 'content_id must be a valid integer'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create social share record
        share = SocialShare.objects.create(
            user=request.user,
            share_type=share_type,
            content_type=content_type,
            content_id=content_id
        )
        
        serializer = SocialShareSerializer(share)
        return Response({
            'message': 'Share recorded',
            'reward_xp': share.reward_xp,
            'share': serializer.data
        })


class DailyChallengesView(APIView):
    """GET /api/gamification/challenges/ - Get today's challenges"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from django.db.models import Q
        
        today = timezone.localdate()
        
        # Get today's challenges
        challenges = DailyChallenge.objects.filter(challenge_date=today, is_active=True)
        challenge_serializer = DailyChallengeSerializer(challenges, many=True)
        
        # Get user's progress on today's challenges
        user_challenges = UserChallenge.objects.filter(
            user=request.user,
            challenge__challenge_date=today
        ).select_related('challenge')
        user_challenge_serializer = UserChallengeSerializer(user_challenges, many=True)
        
        return Response({
            'challenges': challenge_serializer.data,
            'user_progress': user_challenge_serializer.data
        })


class JoinChallengeView(APIView):
    """POST /api/gamification/challenges/join/ - Join a daily challenge"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        challenge_id = request.data.get('challenge_id')
        
        if not challenge_id:
            return Response({'error': 'Challenge ID required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            challenge = DailyChallenge.objects.get(id=challenge_id, is_active=True)
            
            # Check if user already joined
            if UserChallenge.objects.filter(user=request.user, challenge=challenge).exists():
                return Response({'error': 'Already joined this challenge'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create user challenge
            user_challenge = UserChallenge.objects.create(
                user=request.user,
                challenge=challenge
            )
            
            serializer = UserChallengeSerializer(user_challenge)
            return Response({
                'message': 'Challenge joined successfully',
                'user_challenge': serializer.data
            })
            
        except DailyChallenge.DoesNotExist:
            return Response({'error': 'Challenge not found or inactive'}, status=status.HTTP_404_NOT_FOUND)


class UpdateChallengeProgressView(APIView):
    """POST /api/gamification/challenges/update/ - Update challenge progress"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user_challenge_id = request.data.get('user_challenge_id')
        increment = request.data.get('increment', 1)
        
        if not user_challenge_id:
            return Response({'error': 'User challenge ID required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user_challenge = UserChallenge.objects.get(
                id=user_challenge_id,
                user=request.user
            )
            
            # Update progress
            user_challenge.update_progress(increment)
            
            serializer = UserChallengeSerializer(user_challenge)
            return Response({
                'message': 'Progress updated',
                'user_challenge': serializer.data
            })
            
        except UserChallenge.DoesNotExist:
            return Response({'error': 'User challenge not found'}, status=status.HTTP_404_NOT_FOUND)


class AchievementListView(APIView):
    """GET /api/gamification/achievements/ - Get user achievements"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        achievements = UserAchievement.objects.filter(user=request.user)
        serializer = UserAchievementSerializer(achievements, many=True)
        
        return Response({
            'achievements': serializer.data,
            'total_count': achievements.count()
        })