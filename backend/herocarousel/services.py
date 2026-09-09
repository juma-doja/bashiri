"""
herocarousel/services.py

Automatic slide builders — kila function inarudisha dict ya slide moja,
au None kama hakuna data ya kutosha (mfano hakuna Derby inayoendelea).
Backgrounds za automatic slides zinapatikana kutoka HeroImageConfig (admin-controlled)
au fallback kwa hardcoded Cloudinary paths kama hakuna config.
"""
from datetime import timedelta

from django.conf import settings
from django.db.models import Q
from django.utils import timezone

from core.cloudinary_utils import cloudinary_url

# Fallback images kama admin hajaweka custom images
HERO_IMAGES_FALLBACK = {
    "top_pick": "bashiri/hero/today-match",
    "derby": "bashiri/hero/derby",
    "track_record": "bashiri/hero/track-record",
    "pro": "bashiri/hero/pro",
    "mic": "bashiri/hero/mic",
    "did_you_know": "bashiri/hero/didyouknow",
}


def get_hero_image(slide_type: str) -> str:
    """Pata image URL kutoka HeroImageConfig au fallback."""
    from .models import HeroImageConfig

    try:
        config = HeroImageConfig.objects.get(slide_type=slide_type)
        if config.image_url:
            return config.image_url
    except HeroImageConfig.DoesNotExist:
        pass

    # Fallback kwa hardcoded Cloudinary path
    return cloudinary_url(HERO_IMAGES_FALLBACK.get(slide_type, ""))


def get_today_accuracy() -> float | None:
    """Pata accuracy ya picks za leo kutoka BashiriPickSnapshot."""
    from predictions.models import BashiriPickSnapshot

    today = timezone.localdate()

    # Get picks zilizocreated leo na zimesettle
    today_snapshots = BashiriPickSnapshot.objects.filter(
        created_at__date=today,
        status__in=["WON", "LOST", "PUSH"]
    )

    total_settled = today_snapshots.count()
    if total_settled == 0:
        return None

    won_count = today_snapshots.filter(status="WON").count()
    lost_count = today_snapshots.filter(status="LOST").count()

    # Accuracy = won / (won + lost) * 100 (PUSH hazihesabiki)
    decisions = won_count + lost_count
    if decisions == 0:
        return None

    accuracy = round((won_count / decisions) * 100, 1)
    return accuracy


def build_top_pick_slide():
    from feed.models import Card

    today = timezone.localdate()
    cards = Card.objects.filter(
        type__in=["AI_PICK", "BIG_MATCH"], created_at__date=today, is_active=True
    ).select_related("match", "match__home_team", "match__away_team")

    best_card = None
    best_confidence = -1
    for card in cards:
        ai_pick = card.data.get("ai_pick", {})
        confidence = ai_pick.get("confidence")
        if confidence is None:
            confidence = ai_pick.get("probability_percent", 0)
        try:
            confidence = float(confidence or 0)
        except (TypeError, ValueError):
            confidence = 0
        # Older feed cards stored 80.1% as 8010. Keep them readable while
        # ranking both legacy and current cards on the same 0-100 scale.
        if confidence > 100:
            confidence /= 100
        if confidence > best_confidence:
            best_confidence = confidence
            best_card = card

    if not best_card or not best_card.match_id:
        return None

    match_data = best_card.data.get("match", {})
    return {
        "id": "auto-top-pick",
        "type": "TOP_PICK",
        "title": f"{match_data.get('home_team')} vs {match_data.get('away_team')}",
        "subtitle": f"AI Confidence: {best_confidence:g}%",
        "image_url": get_hero_image("top_pick"),
        "cta_label": "Ona Prediction",
        "route": f"/create/{best_card.match_id}/predict",
        "accent_color": "#00FF87",
    }


def build_derby_slide():
    from predictions.models import ActiveDerby

    derby = ActiveDerby.objects.filter(is_active=True).select_related("home_team", "away_team").first()
    if not derby or not derby.is_currently_active:
        return None

    return {
        "id": "auto-derby",
        "type": "DERBY",
        "title": derby.derby_name,
        "subtitle": f"{derby.home_team.name} vs {derby.away_team.name}",
        "image_url": get_hero_image("derby"),
        "cta_label": "Derby Hub",
        "route": "/derby",
        "accent_color": derby.theme_accent_color,
    }


def build_track_record_slide():
    """Track Record slide inatumia accuracy ya picks za leo kutoka BashiriPickSnapshot."""
    today_accuracy = get_today_accuracy()

    # Kama hakuna picks za leo zimesettle, usionyeshe slide hii
    if today_accuracy is None:
        return None

    return {
        "id": "auto-track-record",
        "type": "TRACK_RECORD",
        "title": "Bashiri Track Record",
        "subtitle": f"AI Sahihi {today_accuracy}% Leo",
        "image_url": get_hero_image("track_record"),
        "cta_label": "Ona Takwimu",
        "route": "/bashiri-pick-analytics",
        "accent_color": "#00FF87",
    }


def build_pro_slide(user):
    if user and user.is_authenticated and getattr(user, "is_subscription_active", False):
        return None  # tayari ni subscriber, usimwonyeshe tena

    weekly_price = settings.BASHIRI["SUBSCRIPTION_PRICES"]["weekly_tzs"]
    return {
        "id": "auto-pro",
        "type": "PRO",
        "title": "Fungua Masoko Yote 9",
        "subtitle": f"Kuanzia TZS {weekly_price:,}/wiki",
        "image_url": get_hero_image("pro"),
        "cta_label": "Panda PRO",
        "route": "/subscribe?plan=weekly",
        "accent_color": "#FFD600",
    }


def build_fan_of_match_slide():
    from mic.models import MicReaction

    week_ago = timezone.now() - timedelta(days=7)
    reaction = (
        MicReaction.objects.filter(is_fan_of_match=True, is_active=True, created_at__gte=week_ago)
        .select_related("user", "match", "match__home_team", "match__away_team")
        .order_by("-created_at")
        .first()
    )
    if not reaction:
        return None

    return {
        "id": "auto-fan-of-match",
        "type": "FAN_OF_MATCH",
        "title": f"🏆 Fan of the Match: @{reaction.user.username}",
        "subtitle": f"{reaction.match.home_team.name} vs {reaction.match.away_team.name}",
        "image_url": get_hero_image("mic"),
        "cta_label": "Ona Bashiri Mic",
        "route": f"/match/{reaction.match_id}/mic",
        "accent_color": "#FFD600",
    }


def build_did_you_know_slide():
    from feed.models import Card

    card = Card.objects.filter(type="DID_YOU_KNOW", is_active=True).order_by("-created_at").first()
    if not card:
        return None

    return {
        "id": f"auto-did-you-know-{card.id}",
        "type": "DID_YOU_KNOW",
        "title": "💡 Je Wajua?",
        "subtitle": card.data.get("fact", ""),
        "image_url": get_hero_image("did_you_know"),
        "cta_label": "",
        "route": "",
        "accent_color": "#3B82F6",
    }


def get_active_custom_slides():
    from .models import CustomSlide

    now = timezone.now()
    slides = (
        CustomSlide.objects.filter(is_active=True)
        .filter(Q(starts_at__isnull=True) | Q(starts_at__lte=now))
        .filter(Q(ends_at__isnull=True) | Q(ends_at__gte=now))
        .order_by("order")
    )
    return [
        {
            "id": f"custom-{s.id}",
            "type": "CUSTOM",
            "title": s.title,
            "subtitle": s.subtitle,
            "image_url": s.image_url,
            "cta_label": s.cta_label,
            "route": s.route,
            "accent_color": s.accent_color,
        }
        for s in slides
    ]


def build_hero_slides(user):
    """Inaunganisha custom slides (admin) + automatic slides, kikomo cha MAX_SLIDES."""
    max_slides = settings.BASHIRI["HERO_CAROUSEL_MAX_SLIDES"]

    slides = get_active_custom_slides()
    remaining = max_slides - len(slides)

    if remaining > 0:
        # Mpangilio wa kipaumbele: mechi ya leo, derby, track record, PRO, mic, did-you-know
        auto_builders = [
            build_top_pick_slide,
            build_derby_slide,
            build_track_record_slide,
            lambda: build_pro_slide(user),
            build_fan_of_match_slide,
            build_did_you_know_slide,
        ]
        for builder in auto_builders:
            if remaining <= 0:
                break
            slide = builder()
            if slide:
                slides.append(slide)
                remaining -= 1

    return slides[:max_slides]
