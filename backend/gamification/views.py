"""
gamification/views.py

Views for gamification system endpoints
"""
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.db import transaction
from django.db import IntegrityError
from django.db.models import Count, Q, Sum
from datetime import timedelta
import uuid
import logging

from .models import (
    UserAchievement, UserProgress, Referral, DailyChallenge, UserChallenge,
    SocialShare, PredictionLeague, PredictionLeagueMember, LeaguePick,
)
from .serializers import (
    UserProgressSerializer, UserAchievementSerializer, ReferralSerializer,
    DailyChallengeSerializer, UserChallengeSerializer, SocialShareSerializer
)
from accounts.models import User
from tips.market_registry import (
    get_market_definition,
    is_valid_selection,
    normalize_selection_key,
)

logger = logging.getLogger(__name__)


def settle_league_picks(league):
    pending = LeaguePick.objects.filter(
        member__league=league,
        status="PENDING",
    ).select_related("match")
    for pick in pending:
        match = pick.match
        if match.status in {"POSTPONED", "CANCELLED"}:
            outcome = "VOID"
        elif match.status == "FINISHED" and match.home_score is not None and match.away_score is not None:
            from tips.verification import verify_tip

            try:
                outcome = verify_tip(
                    pick.market_key,
                    pick.selection_key,
                    match.home_score,
                    match.away_score,
                ).value
            except ValueError:
                logger.exception("Could not settle league pick %s", pick.pk)
                continue
        else:
            continue

        points = 3 if outcome == "CORRECT" else 0
        LeaguePick.objects.filter(pk=pick.pk, status="PENDING").update(
            status=outcome,
            points=points,
            settled_at=timezone.now(),
        )


def league_member_data(member):
    correct_count = member.correct_count or 0
    incorrect_count = member.incorrect_count or 0
    settled = correct_count + incorrect_count
    return {
        "user_id": member.user_id,
        "username": member.user.username or "Mchezaji",
        "avatar_url": member.user.avatar_url,
        "joined_at": member.joined_at,
        "points": member.points or 0,
        "picks_count": member.picks_count or 0,
        "correct_count": correct_count,
        "incorrect_count": incorrect_count,
        "pending_count": member.pending_count or 0,
        "void_count": member.void_count or 0,
        "accuracy": round(correct_count / settled * 100, 1) if settled else None,
    }


def league_pick_data(pick):
    from tips.market_registry import get_selection_label

    return {
        "id": pick.id,
        "user_id": pick.member.user_id,
        "username": pick.member.user.username or "Mchezaji",
        "avatar_url": pick.member.user.avatar_url,
        "match": {
            "id": pick.match_id,
            "home_team": pick.match.home_team.name,
            "away_team": pick.match.away_team.name,
            "league": pick.match.league.name,
            "kickoff_at": pick.match.kickoff_at,
            "status": pick.match.status,
            "home_score": pick.match.home_score,
            "away_score": pick.match.away_score,
        },
        "market_key": pick.market_key,
        "market_label": get_market_definition(pick.market_key)["label"],
        "selection_key": pick.selection_key,
        "selection_label": get_selection_label(pick.market_key, pick.selection_key) or pick.selection_key,
        "status": pick.status,
        "points": pick.points,
        "submitted_at": pick.submitted_at,
        "settled_at": pick.settled_at,
    }


def league_summary(league, member):
    points = getattr(member, "points", None)
    picks_count = getattr(member, "picks_count", None)
    if points is None:
        points = member.picks.aggregate(points=Sum("points"))["points"] or 0
    if picks_count is None:
        picks_count = member.picks.count()
    return {
        "id": str(league.id),
        "name": league.name,
        "description": league.description,
        "invite_code": str(league.invite_code),
        "owner_id": league.owner_id,
        "owner_name": league.owner.username or "Mchezaji",
        "member_count": league.members.count(),
        "is_active": league.is_open,
        "created_at": league.created_at,
        "ends_at": league.ends_at,
        "my_points": points,
        "my_picks_count": picks_count,
    }


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


class PredictionLeagueListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        memberships = PredictionLeagueMember.objects.filter(
            user=request.user,
        ).annotate(
            points=Sum("picks__points"),
            picks_count=Count("picks", distinct=True),
            correct_count=Count("picks", filter=Q(picks__status="CORRECT"), distinct=True),
            incorrect_count=Count("picks", filter=Q(picks__status="INCORRECT"), distinct=True),
            pending_count=Count("picks", filter=Q(picks__status="PENDING"), distinct=True),
            void_count=Count("picks", filter=Q(picks__status="VOID"), distinct=True),
        ).select_related("league", "league__owner")
        results = [
            league_summary(membership.league, membership)
            for membership in memberships
        ]
        return Response({"results": results})

    def post(self, request):
        name = str(request.data.get("name", "")).strip()
        description = str(request.data.get("description", "")).strip()
        duration_days = request.data.get("duration_days", 7)
        if not name or len(name) > 60:
            return Response(
                {"name": "Jina linahitajika na lisizidi herufi 60."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(description) > 280:
            return Response(
                {"description": "Maelezo yasizidi herufi 280."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            duration_days = int(duration_days)
        except (TypeError, ValueError):
            duration_days = 0
        if duration_days not in {7, 30, 90}:
            return Response(
                {"duration_days": "Chagua ligi ya siku 7, 30 au 90."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        active_owned = PredictionLeague.objects.filter(
            owner=request.user,
            is_active=True,
            ends_at__gt=timezone.now(),
        ).count()
        if active_owned >= 10:
            return Response(
                {"detail": "Unaweza kusimamia ligi hai 10 kwa wakati mmoja."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            league = PredictionLeague.objects.create(
                name=name,
                description=description,
                owner=request.user,
                ends_at=timezone.now() + timedelta(days=duration_days),
            )
            member = PredictionLeagueMember.objects.create(
                league=league,
                user=request.user,
            )
        return Response(
            league_summary(league, member),
            status=status.HTTP_201_CREATED,
        )


class JoinPredictionLeagueView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        invite_code = str(request.data.get("invite_code", "")).strip()
        try:
            invite_uuid = uuid.UUID(invite_code)
        except (ValueError, TypeError, AttributeError):
            return Response(
                {"detail": "Link/code ya ligi si sahihi."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        league = PredictionLeague.objects.filter(
            invite_code=invite_uuid,
            is_active=True,
            ends_at__gt=timezone.now(),
        ).select_related("owner").first()
        if not league:
            return Response(
                {"detail": "Ligi hii imefungwa au haipo tena."},
                status=status.HTTP_404_NOT_FOUND,
            )
        member, created = PredictionLeagueMember.objects.get_or_create(
            league=league,
            user=request.user,
        )
        if created and league.members.count() > 100:
            member.delete()
            return Response(
                {"detail": "Ligi imefikia idadi ya juu ya washiriki 100."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({
            "joined": created,
            "league": league_summary(league, member),
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class PredictionLeagueDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, invite_code):
        try:
            invite_uuid = uuid.UUID(str(invite_code))
        except (ValueError, TypeError, AttributeError):
            return Response({"detail": "Ligi haipo."}, status=status.HTTP_404_NOT_FOUND)
        league = PredictionLeague.objects.filter(invite_code=invite_uuid).select_related("owner").first()
        if not league:
            return Response({"detail": "Ligi haipo."}, status=status.HTTP_404_NOT_FOUND)
        member = PredictionLeagueMember.objects.filter(
            league=league,
            user=request.user,
        ).select_related("user").first()
        if not member:
            return Response(
                {"detail": "Jiunge na ligi hii kwa invite code kabla ya kuiona."},
                status=status.HTTP_403_FORBIDDEN,
            )

        settle_league_picks(league)
        members = list(
            league.members.select_related("user").annotate(
                points=Sum("picks__points"),
                picks_count=Count("picks", distinct=True),
                correct_count=Count("picks", filter=Q(picks__status="CORRECT"), distinct=True),
                incorrect_count=Count("picks", filter=Q(picks__status="INCORRECT"), distinct=True),
                pending_count=Count("picks", filter=Q(picks__status="PENDING"), distinct=True),
                void_count=Count("picks", filter=Q(picks__status="VOID"), distinct=True),
            )
        )
        standings = [league_member_data(item) for item in members]
        standings.sort(
            key=lambda item: (
                -item["points"],
                -item["correct_count"],
                -item["picks_count"],
                item["joined_at"],
            )
        )
        picks = LeaguePick.objects.filter(
            member__league=league,
        ).select_related(
            "member__user",
            "match__home_team",
            "match__away_team",
            "match__league",
        ).order_by("-match__kickoff_at", "-submitted_at")[:300]
        return Response({
            "league": league_summary(league, member),
            "is_open": league.is_open,
            "standings": standings,
            "picks": [league_pick_data(pick) for pick in picks],
        })


class PredictionLeaguePickListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, invite_code):
        try:
            invite_uuid = uuid.UUID(str(invite_code))
        except (ValueError, TypeError, AttributeError):
            return Response({"detail": "Ligi haipo."}, status=status.HTTP_404_NOT_FOUND)
        member = PredictionLeagueMember.objects.filter(
            league__invite_code=invite_uuid,
            league__is_active=True,
            user=request.user,
        ).first()
        if not member:
            return Response({"detail": "Hujaingia kwenye ligi hii."}, status=status.HTTP_404_NOT_FOUND)
        picks = member.picks.select_related(
            "match__home_team", "match__away_team", "match__league"
        )
        return Response({"results": [league_pick_data(pick) for pick in picks]})

    def post(self, request, invite_code):
        try:
            invite_uuid = uuid.UUID(str(invite_code))
        except (ValueError, TypeError, AttributeError):
            return Response({"detail": "Ligi haipo."}, status=status.HTTP_404_NOT_FOUND)
        member = PredictionLeagueMember.objects.filter(
            league__invite_code=invite_uuid,
            league__is_active=True,
            user=request.user,
        ).select_related("league").first()
        if not member:
            return Response({"detail": "Hujaingia kwenye ligi hii."}, status=status.HTTP_404_NOT_FOUND)
        if not member.league.is_open:
            return Response({"detail": "Muda wa ligi hii umeisha."}, status=status.HTTP_400_BAD_REQUEST)

        from predictions.models import Match

        try:
            match = Match.objects.select_related(
                "home_team", "away_team", "league"
            ).get(pk=request.data.get("match"))
        except (Match.DoesNotExist, TypeError, ValueError):
            return Response({"match": "Chagua mechi iliyopo."}, status=status.HTTP_400_BAD_REQUEST)
        if match.status != "SCHEDULED" or match.kickoff_at <= timezone.now():
            return Response(
                {"match": "Unaweza kuweka pick kabla tu mechi iliyoratibiwa haijaanza."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        market_key = str(request.data.get("market_key", "")).strip()
        definition = get_market_definition(market_key)
        if not definition or not definition["available"]:
            return Response({"market_key": "Market hii haipatikani."}, status=status.HTTP_400_BAD_REQUEST)
        selection_key = normalize_selection_key(
            market_key,
            str(request.data.get("selection_key", "")).strip(),
        )
        if not is_valid_selection(market_key, selection_key):
            return Response(
                {"selection_key": "Chagua selection halali kwa market hii."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if market_key == "CORRECT_SCORE":
            try:
                home, away = (int(value) for value in selection_key.split("-", maxsplit=1))
            except (TypeError, ValueError):
                return Response(
                    {"selection_key": "Correct score tumia muundo kama 2-1."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if home not in range(21) or away not in range(21):
                return Response(
                    {"selection_key": "Correct score iwe kati ya 0-0 na 20-20."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        try:
            with transaction.atomic():
                pick = LeaguePick.objects.create(
                    member=member,
                    match=match,
                    market_key=market_key,
                    selection_key=selection_key,
                )
        except IntegrityError:
            return Response(
                {"detail": "Tayari umeweka pick ya mechi hii kwenye ligi."},
                status=status.HTTP_409_CONFLICT,
            )
        pick = LeaguePick.objects.select_related(
            "member__user", "match__home_team", "match__away_team", "match__league"
        ).get(pk=pick.pk)
        return Response(league_pick_data(pick), status=status.HTTP_201_CREATED)