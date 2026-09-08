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


make_task("Notify Daily Picks", "notifications.tasks.notify_daily_picks", {"minute": "0", "hour": "7"})
make_task("Notify Favorite Team Matches", "notifications.tasks.notify_favorite_team_matches", {"minute": "*/30", "hour": "*"})
make_task("Notify High Confidence Picks", "notifications.tasks.notify_high_confidence_picks", {"minute": "0", "hour": "8"})

print("Tasks added successfully")
