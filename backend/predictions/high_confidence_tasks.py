"""
High Confidence Match Tracking Task
Filters matches with home/away win >= 55% and tracks performance
"""
import logging
from datetime import timedelta, datetime as dt
from django.utils import timezone
from django.db.models import Q
from celery import shared_task

from .models import Match, HighConfidenceSnapshot
from .services import predict_fixture
from feed.models import Card

logger = logging.getLogger(__name__)


@shared_task
def generate_high_confidence_matches():
    """
    Generate cards for matches with home/away win >= 55%
    Only for HOME_WIN and AWAY_WIN markets
    """
    # Use UTC dates for consistency between manual and automatic runs
    today_utc = dt.utcnow().date()
    three_days_ahead = today_utc + timedelta(days=3)
    
    # Get upcoming matches - only from supported leagues
    supported_leagues = [
        "Bundesliga",
        "Campeonato Brasileiro Série A",
        "Championship",
        "Premier League",
        "La Liga",
        "Ligue 1",
        "Serie A",
        "UEFA Champions League"
    ]
    
    upcoming_matches = Match.objects.filter(
        status="SCHEDULED",
        kickoff_at__date__gte=today_utc - timedelta(days=1),  # Include yesterday to handle timezone issues
        kickoff_at__date__lte=three_days_ahead,
        home_score__isnull=True,
        away_score__isnull=True,
        league__name__in=supported_leagues,
    ).select_related("home_team", "away_team", "league")
    
    created_count = 0
    skipped_count = 0
    
    for match in upcoming_matches:
        # Check if card already exists
        if Card.objects.filter(type="HIGH_CONFIDENCE", match_id=match.id).exists():
            skipped_count += 1
            continue
        
        try:
            # Get prediction - use the poisson_key from the league
            poisson_key = match.league.poisson_key
            prediction = predict_fixture(poisson_key, match.home_team.name, match.away_team.name)
            
            # Check home/away win percentages - use match_result for leagues that don't have 1x2
            match_result = prediction.get("match_result", {})
            one_x_two = prediction.get("1x2", {})
            
            # Try 1x2 first, fallback to match_result
            if one_x_two:
                home_win_pct = one_x_two.get("home", 0)
                away_win_pct = one_x_two.get("away", 0)
            else:
                home_win_pct = match_result.get("home_win", 0)
                away_win_pct = match_result.get("away_win", 0)
            
            # Filter: either home or away win >= 50%
            if home_win_pct >= 50 or away_win_pct >= 50:
                # Determine which side is high confidence
                if home_win_pct >= away_win_pct:
                    winner = "home"
                    confidence = home_win_pct
                    team_name = match.home_team.name
                else:
                    winner = "away"
                    confidence = away_win_pct
                    team_name = match.away_team.name
                
                # Convert to integer if needed (match_result is already percentage)
                if confidence > 1:
                    confidence = round(confidence, 1)
                
                # Create card
                Card.objects.create(
                    type="HIGH_CONFIDENCE",
                    match_id=match.id,
                    data={
                        "match": {
                            "home_team": match.home_team.name,
                            "away_team": match.away_team.name,
                            "league": match.league.name,
                            "kickoff_at": match.kickoff_at.isoformat(),
                        },
                        "prediction": {
                            "winner": winner,
                            "team": team_name,
                            "confidence": confidence,
                            "market": "1X2",
                        },
                        "created_at": timezone.now().isoformat(),
                    },
                )

                # Create snapshot for tracking
                HighConfidenceSnapshot.objects.create(
                    match=match,
                    winner=winner,
                    confidence=confidence,
                )

                created_count += 1
                logger.info(f"Created high confidence card for {match.home_team.name} vs {match.away_team.name} - {winner} {confidence}%")
            else:
                skipped_count += 1
                
        except Exception as e:
            logger.error(f"Failed to process match {match.id}: {e}")
            skipped_count += 1
    
    logger.info(f"High confidence matches: {created_count} created, {skipped_count} skipped")
    return f"High confidence: {created_count} created, {skipped_count} skipped"


@shared_task
def remove_finished_high_confidence_cards():
    """
    Remove high confidence cards for finished matches and settle snapshots
    """
    today = timezone.localdate()

    # Get finished matches
    finished_matches = Match.objects.filter(
        status="FINISHED",
        kickoff_at__date__lte=today,
    )

    # Settle snapshots for finished matches
    settled_count = 0
    for match in finished_matches:
        # Get snapshot for this match
        snapshot = HighConfidenceSnapshot.objects.filter(match=match).first()
        if snapshot and snapshot.status == "PENDING":
            # Determine if prediction was correct
            actual_home = match.home_score
            actual_away = match.away_score

            if actual_home is not None and actual_away is not None:
                # Check if prediction was correct
                if snapshot.winner == "home":
                    is_correct = actual_home > actual_away
                else:  # away
                    is_correct = actual_away > actual_home

                # Update snapshot
                snapshot.status = "WON" if is_correct else "LOST"
                snapshot.actual_home_score = actual_home
                snapshot.actual_away_score = actual_away
                snapshot.settled_at = timezone.now()
                snapshot.save()
                settled_count += 1
                logger.info(f"Settled high confidence snapshot for {match}: {snapshot.status}")

    # Delete cards for finished matches
    deleted_count = Card.objects.filter(
        type="HIGH_CONFIDENCE",
        match_id__in=finished_matches.values_list("id", flat=True)
    ).delete()[0]

    logger.info(f"Settled {settled_count} high confidence snapshots, removed {deleted_count} cards")
    return f"Settled {settled_count} snapshots, removed {deleted_count} cards"
