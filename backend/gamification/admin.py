from django.contrib import admin

# Register your models here.
from django.contrib import admin

from .models import LeaguePick, PredictionLeague, PredictionLeagueMember


@admin.register(PredictionLeague)
class PredictionLeagueAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "created_at", "ends_at", "is_active")
    search_fields = ("name", "owner__username", "invite_code")
    list_filter = ("is_active", "created_at")


@admin.register(PredictionLeagueMember)
class PredictionLeagueMemberAdmin(admin.ModelAdmin):
    list_display = ("league", "user", "joined_at")
    search_fields = ("league__name", "user__username")


@admin.register(LeaguePick)
class LeaguePickAdmin(admin.ModelAdmin):
    list_display = ("member", "match", "market_key", "selection_key", "status", "points")
    list_filter = ("status", "market_key")
    search_fields = ("member__league__name", "member__user__username")
