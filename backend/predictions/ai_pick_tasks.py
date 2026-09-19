"""
AI Pick Generation and Settlement Tasks

Celery tasks for:
1. Generating AI picks from predictions using same logic as dashboard
2. Settling AI picks when matches finish
3. Updating AI Pick status based on match status
"""

import uuid
from celery import shared_task
from django.utils import timezone
from django.db import transaction
from datetime import timedelta

from .models import AIPick, Match
from .settlement_engine import settle_ai_pick
from .ml.poisson_model import predict_fixture


@shared_task
def generate_ai_picks(feed_type="STANDARD"):
    """
    Generate AI picks from upcoming matches using qualification engine.
    Also creates corresponding feed cards for display.

    Args:
        feed_type: "STANDARD" or "PREMIUM"
    """
    from django.conf import settings
    from feed.models import Card

    # Get upcoming matches (today + 2 days)
    today = timezone.localdate()
    two_days_ahead = today + timedelta(days=2)

    # Only include leagues that are supported by Poisson model
    SUPPORTED_LEAGUES = ['Bundesliga', 'Campeonato Brasileiro Série A', 'Championship', 'EPL', 'LaLiga', 'Ligue1', 'Serie A', 'UEFA Champions League']

    matches = Match.objects.filter(
        kickoff_at__date__gte=today,
        kickoff_at__date__lte=two_days_ahead,
        status="SCHEDULED",
        league__poisson_key__in=SUPPORTED_LEAGUES
    ).select_related('league', 'home_team', 'away_team')

    picks_created = 0
    picks_skipped = 0

    for match in matches:
        # Skip if AI Pick card already exists for this match in feed
        existing_card = Card.objects.filter(type="AI_PICK", match_id=match.id).first()
        if existing_card:
            picks_skipped += 1
            continue

        # Skip if AIPick already exists for this match in database
        existing_pick = AIPick.objects.filter(match=match, feed=feed_type).first()
        if existing_pick:
            picks_skipped += 1
            continue

        try:
            # Get prediction from Poisson model
            prediction = predict_fixture(
                match.league.poisson_key,
                match.home_team.name,
                match.away_team.name,
            )

            # Use the same logic as dashboard for consistency
            # Import compute_global_top_pick from services
            from .services import compute_global_top_pick

            # Get global top pick using same logic as dashboard
            global_best = compute_global_top_pick(prediction)

            if global_best is None:
                # NO_STRONG_PICK - create card with no pick
                best_pick = None
            else:
                # Map global_best to our format
                best_pick = {
                    'market': global_best['market_key'],
                    'selection': global_best['option_key'],
                    'probability': global_best['confidence'] / 100,  # Convert percentage to decimal
                    'tier': global_best.get('tier') or 'STRONG',  # Default to STRONG if tier is None
                }

            # Create AI Pick if qualified
            if best_pick:
                # Import market definitions for labels
                from .services import MARKET_DEFINITIONS

                market_def = MARKET_DEFINITIONS.get(best_pick['market'], {})
                market_label = market_def.get('label', best_pick['market'])
                
                # Find option label
                option_label = best_pick['selection']
                for opt in market_def.get('options', []):
                    if opt['key'] == best_pick['selection']:
                        option_label = opt['label']
                        break

                with transaction.atomic():
                    pick = AIPick.objects.create(
                        pick_id=uuid.uuid4(),
                        match=match,
                        home_team=match.home_team.name,
                        away_team=match.away_team.name,
                        league=match.league.name,
                        kickoff_at=match.kickoff_at,
                        market=best_pick['market'],
                        selection=best_pick['selection'],
                        probability=best_pick['probability'],  # Store raw probability as decimal (0.827)
                        probability_percent=round(best_pick['probability'] * 100, 1),  # Store display percentage (82.7)
                        tier=best_pick['tier'],
                        feed=feed_type,
                        status='PENDING',
                        model_version=prediction.get('model_version', 'unknown'),
                        threshold_config_version='v1',
                        market_config_version='v1',
                        published_at=timezone.now(),
                    )
                    picks_created += 1

                    # Create corresponding feed card for display
                    Card.objects.create(
                        type="AI_PICK",
                        match_id=match.id,
                        data={
                            'match': {
                                'id': match.id,
                                'home_team': match.home_team.name,
                                'away_team': match.away_team.name,
                                'home_team_crest_url': match.home_team.crest_url,
                                'away_team_crest_url': match.away_team.crest_url,
                                'kickoff_at': match.kickoff_at.isoformat(),
                                'league': match.league.name,
                                'is_big_match': match.is_big_match,
                            },
                            'ai_pick': {
                                'option_key': best_pick['selection'].lower(),
                                'selection': best_pick['selection'],
                                'selection_label': option_label,
                                'market_label': market_label,
                                'probability_percent': round(best_pick['probability'] * 100, 1),
                                'tier': best_pick['tier'],
                                'status': 'PENDING',
                                'pick_id': str(pick.pick_id),
                            }
                        }
                    )
            else:
                # Create NO_STRONG_PICK card
                Card.objects.create(
                    type="AI_PICK",
                    match_id=match.id,
                    data={
                        'match': {
                            'id': match.id,
                            'home_team': match.home_team.name,
                            'away_team': match.away_team.name,
                            'home_team_crest_url': match.home_team.crest_url,
                            'away_team_crest_url': match.away_team.crest_url,
                            'kickoff_at': match.kickoff_at.isoformat(),
                            'league': match.league.name,
                            'is_big_match': match.is_big_match,
                        },
                        'ai_pick': None  # NO_STRONG_PICK
                    }
                )
                picks_skipped += 1

        except Exception as e:
            print(f"Error generating AI pick for match {match.id}: {e}")
            picks_skipped += 1

    return {
        'feed_type': feed_type,
        'picks_created': picks_created,
        'picks_skipped': picks_skipped,
    }


@shared_task
def update_ai_pick_status():
    """
    Update AI Pick status based on match status.
    PENDING -> LIVE when match starts
    LIVE -> settlement when match finishes
    """
    from django.db import transaction

    # Update PENDING to LIVE for matches that have started
    AIPick.objects.filter(
        status='PENDING',
        match__status='LIVE'
    ).update(status='LIVE')

    # Settle LIVE picks for finished matches
    live_picks = AIPick.objects.filter(
        status='LIVE',
        match__status='FINISHED'
    ).select_related('match')

    settled_count = 0
    for pick in live_picks:
        match = pick.match

        if match.home_score is None or match.away_score is None:
            continue

        with transaction.atomic():
            # Settlement is idempotent - skip if already settled
            if pick.status in ['WON', 'LOST', 'PUSH', 'VOID']:
                continue

            # Run settlement engine
            settlement = settle_ai_pick(
                pick.market,
                pick.selection,
                match.home_score,
                match.away_score
            )

            # Update pick with result
            pick.status = settlement.status
            pick.actual_home_score = match.home_score
            pick.actual_away_score = match.away_score
            pick.result = settlement.status
            pick.settled_at = timezone.now()
            pick.save(update_fields=['status', 'actual_home_score', 'actual_away_score', 'result', 'settled_at'])

            settled_count += 1

    return {
        'settled_count': settled_count,
    }


@shared_task
def generate_daily_ai_picks():
    """
    Scheduled task to generate AI picks for both feeds.
    Run this daily (e.g., at 00:00 UTC).
    """
    standard_result = generate_ai_picks(feed_type="STANDARD")
    premium_result = generate_ai_picks(feed_type="PREMIUM")

    return {
        'standard': standard_result,
        'premium': premium_result,
    }


@shared_task
def update_pick_status_periodic():
    """
    Periodic task to update AI Pick status.
    Run this every 5-10 minutes.
    """
    return update_ai_pick_status()
