"""
gamification/models.py

Complete gamification system for Bashiri:
- UserAchievement: Badges and awards earned by users
- UserProgress: XP, levels, experience points
- Referral: User referral tracking system
- DailyChallenge: Daily gamification challenges
- UserChallenge: User participation in challenges
- SocialShare: Track social sharing activity
"""
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class UserAchievement(models.Model):
    """Badges and achievements earned by users"""
    ACHIEVEMENT_TYPES = [
        ("FIRST_WIN", "First Winner - First correct tip"),
        ("STREAK_5", "5-Streak Master - 5 correct tips in a row"),
        ("STREAK_10", "10-Streak Legend - 10 correct tips in a row"),
        ("DERBY_SPECIALIST", "Derby Specialist - Won a derby tip"),
        ("WEEKLY_CHAMPION", "Weekly Champion - Top of weekly leaderboard"),
        ("MONTHLY_CHAMPION", "Monthly Champion - Top of monthly leaderboard"),
        ("CENTURY_TIPSTER", "Century Tipster - 100 tips total"),
        ("PERFECT_WEEK", "Perfect Week - 100% accuracy in a week"),
        ("AI_MASTER", "AI Master - High AI agreement score"),
        ("EARLY_BIRD", "Early Bird - First 10 users daily"),
        ("SOCIAL_BUTTERFLY", "Social Butterfly - 10 social shares"),
        ("REFERRAL_HERO", "Referral Hero - 5 successful referrals"),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='achievements'
    )
    achievement_type = models.CharField(
        max_length=50,
        choices=ACHIEVEMENT_TYPES
    )
    earned_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)  # Additional data like value, count, etc.
    
    class Meta:
        db_table = "gamification_userachievement"
        unique_together = ['user', 'achievement_type']
        ordering = ['-earned_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.get_achievement_type_display()}"


class UserProgress(models.Model):
    """User progression with XP, levels, and experience points"""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='progress'
    )
    level = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    experience_points = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    current_level_xp = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    next_level_xp = models.IntegerField(default=100, validators=[MinValueValidator(1)])
    ai_agreement_score = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    social_shares_count = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    referral_count = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    last_updated = models.DateTimeField(auto_now=True)
    
    def add_xp(self, amount):
        """Add XP and handle level ups"""
        self.experience_points += amount
        self.current_level_xp += amount
        
        # Check for level up
        while self.current_level_xp >= self.next_level_xp:
            self.current_level_xp -= self.next_level_xp
            self.level += 1
            self.next_level_xp = int(self.next_level_xp * 1.5)  # 50% increase per level
            
        self.save()
        return self.level
    
    @property
    def total_tips_created(self):
        """Get total tips from User model"""
        return self.user.tip_count
    
    @property
    def total_tips_correct(self):
        """Get correct tips from User model"""
        return self.user.correct_predictions
    
    @property
    def longest_streak(self):
        """Get longest streak from User model"""
        return self.user.best_streak
    
    @property
    def current_streak(self):
        """Get current streak from User model"""
        return self.user.current_streak
    
    class Meta:
        db_table = "gamification_userprogress"
    
    def __str__(self):
        return f"{self.user.username} - Level {self.level} ({self.experience_points} XP)"


class Referral(models.Model):
    """User referral tracking system"""
    referrer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='referrals_made'
    )
    referred_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='referrals_received',
        null=True,
        blank=True
    )
    referral_code = models.CharField(max_length=50, unique=True, db_index=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ("PENDING", "Pending - Not registered yet"),
            ("COMPLETED", "Completed - Successfully registered"),
            ("EXPIRED", "Expired - Code expired"),
        ],
        default="PENDING"
    )
    reward_points = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    def complete_referral(self, referred_user):
        """Mark referral as completed and give rewards"""
        self.referred_user = referred_user
        self.status = "COMPLETED"
        self.completed_at = timezone.now()
        self.reward_points = 100  # 100 XP per referral
        self.save()
        
        # Give XP to referrer
        if self.referrer.progress:
            self.referrer.progress.add_xp(100)
            self.referrer.progress.referral_count += 1
            self.referrer.progress.save()
    
    class Meta:
        db_table = "gamification_referral"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.referrer.username} - {self.referral_code} ({self.status})"


class DailyChallenge(models.Model):
    """Daily gamification challenges"""
    CHALLENGE_TYPES = [
        ("WIN_3_TIPS", "Win 3 Tips Today"),
        ("ACCURACY_70", "Reach 70% Accuracy"),
        ("CREATE_5_TIPS", "Create 5 Tips"),
        ("STREAK_3", "Get 3 Correct Tips in a Row"),
        ("EARLY_BIRD", "Be Among First 10 Users Today"),
        ("SOCIAL_SHARE", "Share 3 Tips"),
    ]
    
    challenge_type = models.CharField(
        max_length=50,
        choices=CHALLENGE_TYPES
    )
    title = models.CharField(max_length=100)
    description = models.TextField()
    reward_xp = models.IntegerField(default=50, validators=[MinValueValidator(0)])
    target_value = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    challenge_date = models.DateField(db_index=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = "gamification_dailychallenge"
        ordering = ['-challenge_date']
        unique_together = ['challenge_date', 'challenge_type']
    
    def __str__(self):
        return f"{self.title} - {self.challenge_date}"


class UserChallenge(models.Model):
    """User participation in daily challenges"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='challenges'
    )
    challenge = models.ForeignKey(
        DailyChallenge,
        on_delete=models.CASCADE,
        related_name='participants'
    )
    current_value = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    
    def update_progress(self, increment=1):
        """Update challenge progress"""
        if not self.completed:
            self.current_value += increment
            if self.current_value >= self.challenge.target_value:
                self.completed = True
                self.completed_at = timezone.now()
                
                # Give XP reward
                if self.user.progress:
                    self.user.progress.add_xp(self.challenge.reward_xp)
            
            self.save()
    
    class Meta:
        db_table = "gamification_userchallenge"
        unique_together = ['user', 'challenge']
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.challenge.title} ({self.current_value}/{self.challenge.target_value})"


class SocialShare(models.Model):
    """Track social sharing activity"""
    SHARE_TYPES = [
        ("WHATSAPP", "WhatsApp Share"),
        ("FACEBOOK", "Facebook Share"),
        ("TWITTER", "Twitter Share"),
        ("TELEGRAM", "Telegram Share"),
        ("COPY_LINK", "Copy Link"),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='shares',
        null=True,
        blank=True
    )
    share_type = models.CharField(
        max_length=20,
        choices=SHARE_TYPES
    )
    content_type = models.CharField(max_length=50)  # 'tip', 'profile', 'match'
    content_id = models.IntegerField()  # tip_id, user_id, match_id
    shared_at = models.DateTimeField(auto_now_add=True)
    reward_xp = models.IntegerField(default=5, validators=[MinValueValidator(0)])
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        
        # Give XP reward
        if self.user and hasattr(self.user, 'progress'):
            progress, created = UserProgress.objects.get_or_create(user=self.user)
            progress.add_xp(self.reward_xp)
            progress.social_shares_count += 1
            progress.save()
    
    class Meta:
        db_table = "gamification_socialshare"
        ordering = ['-shared_at']
    
    def __str__(self):
        return f"{self.user.username if self.user else 'Anonymous'} - {self.share_type}"