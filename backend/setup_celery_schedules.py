#!/usr/bin/env python
"""Setup Celery Beat schedules for Bashiri."""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django_celery_beat.models import CrontabSchedule, PeriodicTask, IntervalSchedule


def make_schedule_unique(schedule_queryset):
    schedules = list(schedule_queryset.order_by('id'))
    if not schedules:
        return None

    primary = schedules[0]
    if len(schedules) > 1:
        for duplicate in schedules[1:]:
            PeriodicTask.objects.filter(crontab=duplicate).update(crontab=primary)
            duplicate.delete()
    return primary


def ensure_crontab_schedule(cron_kwargs):
    matches = CrontabSchedule.objects.filter(**cron_kwargs).order_by('id')
    existing = matches.first()
    if existing:
        return make_schedule_unique(matches)
    return CrontabSchedule.objects.create(**cron_kwargs)


def make_task(name, task, cron_kwargs):
    schedule = ensure_crontab_schedule(cron_kwargs)
    obj, created = PeriodicTask.objects.get_or_create(name=name, defaults={"crontab": schedule, "task": task})
    if not created:
        obj.crontab = schedule
        obj.task = task
        obj.interval = None
        obj.enabled = True
        obj.save()
    print(f"{'Imeundwa' if created else 'Imethibitishwa'}: {name}")


def ensure_interval_schedule(every, period):
    matches = IntervalSchedule.objects.filter(every=every, period=period).order_by('id')
    existing = matches.first()
    if existing:
        if matches.count() > 1:
            for duplicate in matches[1:]:
                PeriodicTask.objects.filter(interval=duplicate).update(interval=existing)
                duplicate.delete()
        return existing
    return IntervalSchedule.objects.create(every=every, period=period)


def make_interval_task(name, task, every_minutes):
    schedule = ensure_interval_schedule(every_minutes, IntervalSchedule.MINUTES)
    obj, created = PeriodicTask.objects.get_or_create(name=name, defaults={"interval": schedule, "task": task})
    if not created:
        obj.interval = schedule
        obj.crontab = None
        obj.task = task
        obj.enabled = True
        obj.save()
    print(f"{'Imeundwa' if created else 'Imethibitishwa'}: {name}")


def make_interval_task_seconds(name, task, every_seconds):
    schedule = ensure_interval_schedule(every_seconds, IntervalSchedule.SECONDS)
    obj, created = PeriodicTask.objects.get_or_create(name=name, defaults={"interval": schedule, "task": task})
    if not created:
        obj.interval = schedule
        obj.crontab = None
        obj.task = task
        obj.enabled = True
        obj.save()
    print(f"{'Imeundwa' if created else 'Imethibitishwa'}: {name}")


def remove_legacy_periodic_tasks():
    legacy_names = [
        "verify-tips",
        "lock-tips-at-kickoff",
        "verify-slips",
        "update-leaderboard",
        "clean-old-shares",
        "sync-live-matches",
        "sync-finished-matches",
        "generate-daily-ai-picks",
        "update-ai-pick-status",
        "generate-ai-track-record",
        "fetch-live-odds",
        "fetch-upcoming-odds",
        "fetch-team-standings",
        "create-best-streak-card",
        "generate-daily-picks",
        "Generate Daily Picks",
        # Historical imports are one-off operations and must never run from Beat.
        "Historical Sync 2023-2027",
    ]
    deleted_count, _ = PeriodicTask.objects.filter(name__in=legacy_names).delete()
    if deleted_count:
        print(f"Legacy schedules zimeondolewa: {deleted_count}")


remove_legacy_periodic_tasks()

# Tips and slips
make_interval_task("Verify Tips", "tips.tasks.verify_tips_task", 5)
make_interval_task_seconds("Lock Tips at Kickoff", "tips.tasks.lock_tips_at_kickoff_task", 60)
make_interval_task("Verify Slips", "tips.tasks.verify_slips_task", 5)
make_interval_task("Update Leaderboard", "tips.tasks.update_leaderboard_task", 10)
make_task("Create Best Streak Card", "tips.tasks.create_best_streak_card_task", {"minute": "0", "hour": "5"})

# Sync KAMILI — mara moja kwa siku (fixtures mpya + backup ya matokeo)
make_task("Sync Football Data", "predictions.tasks.sync_daily_task", {"minute": "0", "hour": "3"})

# Historical sync is intentionally not registered with Beat. Run it manually
# when importing a new season, then keep production scheduling incremental.

# Sync NDOGO — mpya, kila sekunde 30 (status/score za mechi za sasa) - production safe
make_interval_task_seconds("Quick Sync Live Matches", "predictions.tasks.sync_live_and_upcoming_matches", 30)

# Sync mechi zilizoisha hivi karibuni — kila dakika 5
make_interval_task("Sync Recently Finished Matches", "predictions.tasks.sync_recently_finished_matches", 5)

# AI Picks — kila siku saa 12:30 (NEW AI PICK SYSTEM)
make_task("Generate Daily AI Picks", "predictions.ai_pick_tasks.generate_daily_ai_picks", {"minute": "30", "hour": "12"})

# Update AI Pick Status — kila dakika 10 (NEW AI PICK SYSTEM)
make_interval_task("Update AI Pick Status", "predictions.ai_pick_tasks.update_pick_status_periodic", 10)

# Settle Bashiri Pick snapshots for finished matches — kila dakika 5
make_interval_task("Settle Bashiri Pick Snapshots", "predictions.tasks.settle_bashiri_pick_snapshots_task", 5)

# Generate AI Track Record — kila siku saa 12:30
make_task("Generate AI Track Record", "predictions.tasks.generate_ai_track_record_snapshot", {"minute": "30", "hour": "12"})

# Odds API tasks - Live odds every 5 minutes
make_interval_task("Fetch Live Odds", "predictions.tasks.fetch_live_odds_task", 5)

# Odds API tasks - Upcoming odds every 15 minutes
make_interval_task("Fetch Upcoming Odds", "predictions.tasks.fetch_upcoming_odds_task", 15)

# Feed tasks
make_interval_task("Generate Result Recaps", "feed.tasks.generate_result_recaps", 15)
make_task("Clean old shares", "tips.tasks.clean_old_shares_task", {"minute": "0", "hour": "3"})
make_task("Deactivate old tips", "tips.tasks.deactivate_old_tips_task", {"minute": "0", "hour": "3"})
make_task("Generate Poll Cards", "feed.tasks.generate_poll_cards", {"minute": "0", "hour": "5"})
make_interval_task_seconds("Update Live Match Cards", "feed.tasks.update_live_match_cards", 30)
make_task("Generate Weekly Report", "feed.tasks.generate_weekly_report", {"minute": "0", "hour": "20", "day_of_week": "0"})
make_task("Generate Did You Know Cards", "feed.tasks.generate_did_you_know_cards", {"minute": "30", "hour": "5"})
make_task("Close Expired Debates", "feed.tasks.close_expired_debates", {"minute": "0", "hour": "*"})
make_interval_task("Deactivate Finished Live Cards", "feed.tasks.deactivate_finished_live_cards", 1)

# Notifications
make_task("Notify Daily Picks", "notifications.tasks.notify_daily_picks", {"minute": "0", "hour": "7"})
make_task("Notify Morning Picks", "notifications.tasks.notify_morning_picks", {"minute": "0", "hour": "9"})
make_task("Notify Favorite Team Matches", "notifications.tasks.notify_favorite_team_matches", {"minute": "*/30", "hour": "*"})
make_task("Notify High Confidence Picks", "notifications.tasks.notify_high_confidence_picks", {"minute": "0", "hour": "8"})
make_task("Notify Live Match Alerts", "notifications.tasks.notify_live_match_alerts", {"minute": "*/5", "hour": "*"})
make_task("Notify Evening Recap", "notifications.tasks.notify_evening_recap", {"minute": "0", "hour": "21"})
make_task("Notify Weekly Summary", "notifications.tasks.notify_weekly_summary", {"minute": "0", "hour": "10", "day_of_week": "1"})

# Bashiri Mic
make_task("Compute Fan of Match", "mic.tasks.compute_fan_of_match", {"minute": "0", "hour": "*"})
make_task("Generate Mic Winner Cards", "feed.tasks.generate_mic_winner_cards", {"minute": "0", "hour": "*"})

# Standings - Fetch league standings every 5 minutes
make_interval_task("Fetch Team Standings", "predictions.tasks.fetch_team_standings_task", 5)

print("\n✅ Schedule zote zimeundwa/thibitishwa!")
