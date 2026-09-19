"""feed/tasks.py — Celery: recaps, stats, polls, live updates, weekly report."""
import logging
from datetime import timedelta

from celery import shared_task
from django.db.models import Q
from django.utils import timezone

from .models import Card

logger = logging.getLogger(__name__)


@shared_task
def generate_result_recaps():
    from predictions.models import Match, BashiriPickSnapshot
    from predictions.settlement_engine import settle_ai_pick

    today = timezone.localdate()
    two_days_ago = today - timedelta(days=2)
    finished_recent = Match.objects.filter(
        status="FINISHED",
        kickoff_at__date__gte=two_days_ago,
        kickoff_at__date__lte=today,
        home_score__isnull=False, away_score__isnull=False,
    ).select_related("home_team", "away_team", "league")

    created_count = 0

    for match in finished_recent:
        # Deactivate LIVE_MATCH card for this match if it exists and is still active
        Card.objects.filter(
            type="LIVE_MATCH", match_id=match.id, is_active=True
        ).update(is_active=False)

        # Check if RESULT_RECAP already exists for this match
        if Card.objects.filter(type="RESULT_RECAP", match_id=match.id).exists():
            continue

        # Get Bashiri Pick Snapshot for this match (EXACTLY what was shown in TopPickCard)
        bashiri_snapshot = BashiriPickSnapshot.objects.filter(match=match).first()
        if not bashiri_snapshot:
            continue

        # Settle the snapshot if not already settled
        if bashiri_snapshot.status == "PENDING" or bashiri_snapshot.status == "LIVE":
            # Map market_key to settlement engine format
            market_mapping = {
                'HOME_GOALS_OVER_0_5': 'home_over_0_5',
                'HOME_GOALS_OVER_1_5': 'home_over_1_5',
                'AWAY_GOALS_OVER_0_5': 'away_over_0_5',
                'AWAY_GOALS_OVER_1_5': 'away_over_1_5',
                'OVER_UNDER_1_5': 'over_1_5',
                'OVER_UNDER_2_5': 'over_2_5',
                '1X2_HOME': '1x2_home',
                '1X2_DRAW': '1x2_draw',
                '1X2_AWAY': '1x2_away',
                'BTTS_YES': 'btts_yes',
                'BTTS_NO': 'btts_no',
                'DC_1X': 'dc_1x',
                'DC_X2': 'dc_x2',
                'DC_12': 'dc_12',
            }
            
            # Map option_key to settlement engine format
            option_mapping = {
                'home_over_0_5': 'Over',
                'home_under_0_5': 'Under',
                'home_over_1_5': 'Over',
                'home_under_1_5': 'Under',
                'away_over_0_5': 'Over',
                'away_under_0_5': 'Under',
                'away_over_1_5': 'Over',
                'away_under_1_5': 'Under',
                'over_1_5': 'Over',
                'under_1_5': 'Under',
                'over_2_5': 'Over',
                'under_2_5': 'Under',
                'home': 'Home',
                'draw': 'Draw',
                'away': 'Away',
                'yes': 'Yes',
                'no': 'No',
                '1x': '1X',
                'x2': 'X2',
                '12': '12',
            }

            settlement_market = market_mapping.get(bashiri_snapshot.market_key, bashiri_snapshot.market_key.lower())
            settlement_option = option_mapping.get(bashiri_snapshot.option_key, bashiri_snapshot.option_key)
            
            try:
                settlement = settle_ai_pick(
                    settlement_market,
                    settlement_option,
                    match.home_score,
                    match.away_score
                )
                bashiri_snapshot.status = settlement.status
                bashiri_snapshot.actual_home_score = match.home_score
                bashiri_snapshot.actual_away_score = match.away_score
                bashiri_snapshot.settled_at = timezone.now()
                bashiri_snapshot.save(update_fields=['status', 'actual_home_score', 'actual_away_score', 'settled_at'])
            except Exception as e:
                logger.error(f"Failed to settle bashiri snapshot for match {match.id}: {e}")
                continue

        # Create RESULT_RECAP card with Bashiri Pick data
        was_correct = bashiri_snapshot.status == "WON"

        Card.objects.create(
            type="RESULT_RECAP", match_id=match.id,
            data={
                "match": {
                    "home_team": match.home_team.name, "away_team": match.away_team.name,
                    "home_score": match.home_score, "away_score": match.away_score,
                },
                "ai_predicted": bashiri_snapshot.option_label,
                "ai_market": bashiri_snapshot.market_label,
                "ai_confidence": bashiri_snapshot.confidence,
                "was_correct": was_correct,
                "is_bashiri_pick": True,  # Flag to indicate this is from Bashiri Pick
            },
        )
        created_count += 1

    logger.info(f"generate_result_recaps: {created_count} recaps")
    return f"Result recaps: {created_count}"


@shared_task
def generate_stat_cards():
    from predictions.models import Match
    from predictions.services import team_form

    upcoming = Match.objects.filter(
        status="SCHEDULED", kickoff_at__gte=timezone.now(),
        kickoff_at__lte=timezone.now() + timedelta(hours=48),
    ).select_related("home_team", "away_team", "league")

    created_count = 0
    for match in upcoming:
        if Card.objects.filter(type="STAT", match_id=match.id).exists():
            continue
        Card.objects.create(
            type="STAT", match_id=match.id,
            data={
                "match": {
                    "home_team": match.home_team.name, "away_team": match.away_team.name,
                    "league": match.league.name,
                },
                "home_form": team_form(match.home_team_id, exclude_match_id=match.id),
                "away_form": team_form(match.away_team_id, exclude_match_id=match.id),
            },
        )
        created_count += 1

    logger.info(f"generate_stat_cards: {created_count} cards")
    return f"Stat cards: {created_count}"


@shared_task
def generate_poll_cards():
    from predictions.models import Match

    upcoming_big = Match.objects.filter(
        status="SCHEDULED", is_big_match=True,
        kickoff_at__gte=timezone.now(), kickoff_at__lte=timezone.now() + timedelta(hours=24),
    ).select_related("home_team", "away_team")

    created_count = 0
    for match in upcoming_big:
        if Card.objects.filter(type="POLL", match_id=match.id).exists():
            continue
        Card.objects.create(
            type="POLL", match_id=match.id,
            data={
                "question": f"Nani atashinda: {match.home_team.name} vs {match.away_team.name}?",
                "options": [match.home_team.name, "Sare", match.away_team.name],
                "tallies": {}, "vote_count": 0, "engagement_threshold": 50,
            },
        )
        created_count += 1

    logger.info(f"generate_poll_cards: {created_count} cards")
    return f"Poll cards: {created_count}"


@shared_task
def update_live_match_cards():
    from django.core.cache import cache
    from predictions.models import Match

    live_matches = Match.objects.filter(status="LIVE").select_related("home_team", "away_team", "league")
    updated_count = 0
    created_count = 0
    data_changed = False
    for match in live_matches:
        new_data = {
            "match": {
                "home_team": match.home_team.name, "away_team": match.away_team.name,
                "league": match.league.name,
                "score": {"home": match.home_score or 0, "away": match.away_score or 0},
            }
        }
        card, created = Card.objects.get_or_create(
            type="LIVE_MATCH", 
            match_id=match.id, 
            defaults={"data": new_data, "is_active": True}
        )
        if created:
            created_count += 1
            data_changed = True
            logger.info(f"Created LIVE_MATCH card for match #{match.id}: {match.home_team.name} vs {match.away_team.name}")
        # Check if data actually changed
        elif card.data != new_data:
            card.data = new_data
            card.save(update_fields=["data"])
            updated_count += 1
            data_changed = True
        # Ensure card is active
        elif not card.is_active:
            card.is_active = True
            card.save(update_fields=["is_active"])
            data_changed = True
            logger.info(f"Activated LIVE_MATCH card for match #{match.id}")

    # Invalidate specific caches if live card data changed
    if data_changed:
        cache.delete("live_matches")
        # Invalidate feed cache (only when live data changes)
        cache.delete("feed_list")
        logger.info("Cache invalidated: live_matches and feed_list")

    return f"Live cards: {created_count} created, {updated_count} updated"


@shared_task
def generate_weekly_report():
    week_ago = timezone.now() - timedelta(days=7)
    recaps = Card.objects.filter(type="RESULT_RECAP", created_at__gte=week_ago)
    total = recaps.count()
    if total == 0:
        return "Hakuna result recaps za wiki hii."

    correct = sum(1 for r in recaps if r.data.get("was_correct"))
    accuracy = round((correct / total) * 100, 1)

    Card.objects.create(
        type="AI_WEEKLY_REPORT",
        data={
            "week_ending": timezone.localdate().isoformat(),
            "total_predictions": total, "correct_predictions": correct,
            "accuracy_percentage": accuracy,
        },
    )
    return f"Weekly report: {correct}/{total} ({accuracy}%)"


@shared_task
def generate_did_you_know_cards():
    """Kila siku, tengeneza Did You Know cards kwa timu zenye facts za kuvutia."""
    import random

    from predictions.models import Team

    from .insights import generate_facts_for_team

    teams = list(Team.objects.all())
    random.shuffle(teams)

    created_count = 0
    for team in teams[:30]:  # angalia timu 30 tu kwa siku, epuka Celery kuchukua muda mrefu
        facts = generate_facts_for_team(team)
        if not facts:
            continue

        fact_text = random.choice(facts)

        # Epuka fact ile ile ndani ya wiki moja kwa timu hiyo hiyo
        week_ago = timezone.now() - timedelta(days=7)
        duplicate = Card.objects.filter(
            type="DID_YOU_KNOW", data__team_id=team.id, data__fact=fact_text, created_at__gte=week_ago
        ).exists()
        if duplicate:
            continue

        Card.objects.create(
            type="DID_YOU_KNOW",
            data={"team_id": team.id, "team_name": team.name, "fact": fact_text, "league": team.league.name},
        )
        created_count += 1

        if created_count >= 8:  # tosha kwa siku moja
            break

    logger.info(f"generate_did_you_know_cards: {created_count} cards")
    return f"Did You Know cards: {created_count}"


@shared_task
def close_expired_debates():
    from datetime import datetime

    from django.utils import timezone

    debates = Card.objects.filter(type="DEBATE", data__is_closed=False)
    closed_count = 0

    for debate in debates:
        closes_at_str = debate.data.get("closes_at")
        if not closes_at_str:
            logger.warning(f"Debate #{debate.id} haina closes_at field")
            continue

        try:
            closes_at = datetime.fromisoformat(closes_at_str)
        except (ValueError, TypeError) as e:
            logger.error(f"Debate #{debate.id}: parsing closes_at failed: {e}")
            continue

        # Make sure closes_at is timezone-aware
        if timezone.is_naive(closes_at):
            closes_at = timezone.make_aware(closes_at)

        now = timezone.now()
        if now >= closes_at:
            debate.data["voting_closed"] = True
            debate.save(update_fields=["data"])
            closed_count += 1
            logger.info(f"Debate #{debate.id} voting closed: closes_at={closes_at}, now={now}")

    logger.info(f"close_expired_debates: {closed_count} debates closed")
    return f"Debates zilizofungwa voting: {closed_count}"


@shared_task
def deactivate_finished_live_cards():
    """
    Safety-net: funga LIVE_MATCH cards ZOTE zenye is_active=True ambazo
    match yake si LIVE tena, bila kujali kama imekuwa FINISHED, CANCELLED,
    au POSTPONED. Celery Beat: kila dakika 1.
    """
    live_cards = Card.objects.filter(type="LIVE_MATCH", is_active=True).select_related("match")
    deactivated = 0
    for card in live_cards:
        if card.match_id and card.match.status != "LIVE":
            card.is_active = False
            card.save(update_fields=["is_active"])
            deactivated += 1
    logger.info(f"deactivate_finished_live_cards: {deactivated} cards zimefungwa")
    return f"deactivate_finished_live_cards: {deactivated} cards zimefungwa"


@shared_task
def generate_mic_winner_cards():
    """Generate MIC_WINNER cards for finished matches with mic reactions."""
    from django.core.cache import cache
    from mic.models import MicReaction
    from mic.views import FanOfMatchView
    from predictions.models import Match
    from django.conf import settings

    # Use the same 7-day window as compute_fan_of_match for consistency
    window_days = settings.BASHIRI.get("MIC_FAN_OF_MATCH_WINDOW_DAYS", 7)
    cutoff = timezone.now() - timedelta(days=window_days)
    
    # Get matches finished more than 7 days ago that have mic reactions
    finished_matches = Match.objects.filter(
        status="FINISHED",
        updated_at__lte=cutoff
    ).filter(
        mic_reactions__isnull=False
    ).distinct().select_related("home_team", "away_team", "league")

    created_count = 0
    for match in finished_matches:
        # Skip if MIC_WINNER card already exists for this match
        if Card.objects.filter(type="MIC_WINNER", match_id=match.id).exists():
            continue

        # Check if match has any active mic reactions
        reaction_count = MicReaction.objects.filter(
            match_id=match.id, is_active=True
        ).count()
        
        if reaction_count == 0:
            continue

        # Get the best video using FanOfMatchView logic
        from django.db.models import Count, Case, When, IntegerField, Sum
        
        vote_weights = {"FIRE": 3, "HUNDRED": 2}
        
        reactions = MicReaction.objects.filter(
            match_id=match.id, is_active=True
        ).select_related("user").annotate(
            vote_count=Count("votes"),
            weighted_score=Sum(
                Case(
                    *[When(votes__emoji=emoji, then=weight) for emoji, weight in vote_weights.items()],
                    default=1,
                    output_field=IntegerField()
                )
            )
        ).order_by("-weighted_score", "-vote_count", "-created_at")

        winner = reactions.first()
        
        if not winner:
            continue

        # Create MIC_WINNER card
        Card.objects.create(
            type="MIC_WINNER",
            match_id=match.id,
            data={
                "match": {
                    "id": match.id,
                    "home_team": match.home_team.name,
                    "away_team": match.away_team.name,
                    "home_score": match.home_score,
                    "away_score": match.away_score,
                    "league": match.league.name,
                },
                "winner": {
                    "id": winner.id,
                    "user": {
                        "id": winner.user.id,
                        "username": winner.user.username,
                        "avatar_url": winner.user.avatar_url,
                    },
                    "video_url": winner.video_url,
                    "thumbnail_url": winner.thumbnail_url,
                    "duration_seconds": winner.duration_seconds,
                    "mood": winner.mood,
                    "team_side": winner.team_side,
                    "vote_count": winner.vote_count,
                },
            },
        )
        created_count += 1

        # Send notification to the winner
        from notifications.models import Notification
        Notification.objects.create(
            user=winner.user,
            type="MIC_WINNER",
            title="🏆 Video Yako Imeshinda Fan of the Match!",
            body=f"Hongera! Video yako ya {match.home_team.name} vs {match.away_team.name} imepata votes zaidi na imetangazwa kuwa Fan of the Match.",
            data={
                "match_id": match.id,
                "card_id": Card.objects.filter(type="MIC_WINNER", match_id=match.id).first().id,
                "vote_count": winner.vote_count,
            },
        )

    logger.info(f"generate_mic_winner_cards: {created_count} cards")
    return f"Mic Winner cards: {created_count}"