"""
gamification/services.py

Gamification business logic and services
"""
from django.utils import timezone
from datetime import timedelta
import secrets
import string

from .models import UserProgress, Referral, UserAchievement, DailyChallenge, UserChallenge
from accounts.models import User


def generate_referral_code(user):
    """Generate unique referral code for user"""
    # Check if user already has a referral code
    existing_referral = Referral.objects.filter(referrer=user).first()
    if existing_referral:
        return existing_referral
    
    # Generate unique code
    while True:
        code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
        if not Referral.objects.filter(referral_code=code).exists():
            break
    
    # Create referral with 30-day expiry
    referral = Referral.objects.create(
        referrer=user,
        referral_code=code,
        expires_at=timezone.now() + timedelta(days=30)
    )
    
    return referral


def award_achievement(user, achievement_type, metadata=None):
    """Award achievement to user if not already earned"""
    # Check if user already has this achievement
    if UserAchievement.objects.filter(user=user, achievement_type=achievement_type).exists():
        return None
    
    # Create achievement
    achievement = UserAchievement.objects.create(
        user=user,
        achievement_type=achievement_type,
        metadata=metadata or {}
    )
    
    # Give XP reward based on achievement type
    xp_rewards = {
        "FIRST_WIN": 50,
        "STREAK_5": 100,
        "STREAK_10": 200,
        "DERBY_SPECIALIST": 150,
        "WEEKLY_CHAMPION": 300,
        "MONTHLY_CHAMPION": 500,
        "CENTURY_TIPSTER": 200,
        "PERFECT_WEEK": 250,
        "AI_MASTER": 150,
        "EARLY_BIRD": 30,
        "SOCIAL_BUTTERFLY": 50,
        "REFERRAL_HERO": 300,
    }
    
    if user.progress:
        user.progress.add_xp(xp_rewards.get(achievement_type, 0))
    
    return achievement


def check_and_award_achievements(user):
    """Check for achievements and award them automatically"""
    from tips.models import UserTip
    
    if not user.progress:
        return []
    
    earned_achievements = []
    
    # Check FIRST_WIN
    if UserTip.objects.filter(user=user, visibility="PUBLIC", status="CORRECT").exists():
        earned = award_achievement(user, "FIRST_WIN")
        if earned:
            earned_achievements.append(earned)
    
    # Check STREAK_5
    if user.progress.current_streak >= 5:
        earned = award_achievement(user, "STREAK_5")
        if earned:
            earned_achievements.append(earned)
    
    # Check STREAK_10
    if user.progress.current_streak >= 10:
        earned = award_achievement(user, "STREAK_10")
        if earned:
            earned_achievements.append(earned)
    
    # Check CENTURY_TIPSTER
    if user.progress.total_tips_created >= 100:
        earned = award_achievement(user, "CENTURY_TIPSTER")
        if earned:
            earned_achievements.append(earned)
    
    # Check SOCIAL_BUTTERFLY
    if user.progress.social_shares_count >= 10:
        earned = award_achievement(user, "SOCIAL_BUTTERFLY")
        if earned:
            earned_achievements.append(earned)
    
    # Check REFERRAL_HERO
    if user.progress.referral_count >= 5:
        earned = award_achievement(user, "REFERRAL_HERO")
        if earned:
            earned_achievements.append(earned)
    
    return earned_achievements


def create_daily_challenges():
    """Create daily challenges for today if they don't exist"""
    from datetime import date
    
    today = date.today()
    
    # Check if challenges already exist for today
    if DailyChallenge.objects.filter(challenge_date=today).exists():
        return
    
    # Create daily challenges
    challenges = [
        {
            "challenge_type": "WIN_3_TIPS",
            "title": "Shinda 3 Tips Leo",
            "description": "Pata 3 tips sahihi leo kupata mchanganyiko wa XP",
            "reward_xp": 50,
            "target_value": 3
        },
        {
            "challenge_type": "ACCURACY_70",
            "title": "Usahihi wa 70%",
            "description": "Pata accuracy ya angalau 70% kwa tips zako za leo",
            "reward_xp": 100,
            "target_value": 70
        },
        {
            "challenge_type": "CREATE_5_TIPS",
            "title": "Changia 5 Tips",
            "description": "Changia 5 tips za mechi kubwa usaidike kupata XP",
            "reward_xp": 75,
            "target_value": 5
        },
        {
            "challenge_type": "STREAK_3",
            "title": "Streak ya 3",
            "description": "Pata 3 tips sahihi mfululizo kwa XP kubwa",
            "reward_xp": 80,
            "target_value": 3
        },
        {
            "challenge_type": "SOCIAL_SHARE",
            "title": "Social Star",
            "description": "Share tips zako 3 mara kwa WhatsApp/Facebook",
            "reward_xp": 30,
            "target_value": 3
        },
    ]
    
    for challenge_data in challenges:
        DailyChallenge.objects.create(
            challenge_date=today,
            **challenge_data
        )
    
    return len(challenges)