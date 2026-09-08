from django_celery_beat.models import CrontabSchedule, PeriodicTask


def ensure_crontab_schedule(cron_kwargs):
    matches = CrontabSchedule.objects.filter(**cron_kwargs).order_by('id')
    if not matches.exists():
        return CrontabSchedule.objects.create(**cron_kwargs)

    primary = matches.first()
    duplicates = list(matches[1:])
    for duplicate in duplicates:
        PeriodicTask.objects.filter(crontab=duplicate).update(crontab=primary)
        duplicate.delete()
    return primary


def make_task(name, task, cron_kwargs):
    schedule = ensure_crontab_schedule(cron_kwargs)
    obj, created = PeriodicTask.objects.get_or_create(name=name, defaults={"crontab": schedule, "task": task})
    if not created:
        obj.crontab = schedule
        obj.task = task
        obj.enabled = True
        obj.save()


make_task("Daily Sync", "predictions.tasks.sync_daily_task", {"minute": "0", "hour": "3"})
make_task("Generate Daily Picks", "predictions.tasks.generate_daily_picks", {"minute": "0", "hour": "6"})
make_task("Generate Result Recaps", "feed.tasks.generate_result_recaps", {"minute": "*/30", "hour": "*"})
make_task("Generate Stat Cards", "feed.tasks.generate_stat_cards", {"minute": "0", "hour": "5"})
make_task("Generate Poll Cards", "feed.tasks.generate_poll_cards", {"minute": "0", "hour": "5"})
make_task("Update Live Match Cards", "feed.tasks.update_live_match_cards", {"minute": "*/2", "hour": "*"})
make_task("Generate Weekly Report", "feed.tasks.generate_weekly_report", {"minute": "0", "hour": "20", "day_of_week": "0"})
