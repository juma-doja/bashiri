from datetime import timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import User
from gamification.models import LeaguePick, PredictionLeague, PredictionLeagueMember
from predictions.models import League, Match, Team


class PredictionLeagueApiTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            phone_number="+255700000001",
            username="league_owner",
        )
        self.user = User.objects.create_user(
            phone_number="+255700000002",
            username="league_member",
        )
        self.client = APIClient()
        self.client.force_authenticate(self.owner)
        self.competition = League.objects.create(
            code="TST",
            name="Test League",
            poisson_key="TestLeague",
        )
        self.home = Team.objects.create(league=self.competition, name="Home")
        self.away = Team.objects.create(league=self.competition, name="Away")

    def create_league(self):
        response = self.client.post(
            "/api/gamification/leagues/",
            {"name": "Marafiki", "description": "Ligi ya test", "duration_days": 7},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        return response.data

    def create_match(self, external_id, kickoff_at=None, status="SCHEDULED", home_score=None, away_score=None):
        return Match.objects.create(
            external_id=external_id,
            league=self.competition,
            home_team=self.home,
            away_team=self.away,
            kickoff_at=kickoff_at or timezone.now() + timedelta(days=1),
            status=status,
            home_score=home_score,
            away_score=away_score,
        )

    def submit_pick(self, invite_code, match):
        return self.client.post(
            f"/api/gamification/leagues/{invite_code}/picks/",
            {
                "match": match.pk,
                "market_key": "1X2",
                "selection_key": "home_win",
            },
            format="json",
        )

    def test_create_join_and_member_only_access(self):
        league = self.create_league()
        self.assertTrue(
            PredictionLeagueMember.objects.filter(
                league__invite_code=league["invite_code"],
                user=self.owner,
            ).exists()
        )

        self.client.force_authenticate(self.user)
        joined = self.client.post(
            "/api/gamification/leagues/join/",
            {"invite_code": league["invite_code"]},
            format="json",
        )
        self.assertEqual(joined.status_code, 201)
        self.assertTrue(joined.data["joined"])

        repeated_join = self.client.post(
            "/api/gamification/leagues/join/",
            {"invite_code": league["invite_code"]},
            format="json",
        )
        self.assertEqual(repeated_join.status_code, 200)
        self.assertFalse(repeated_join.data["joined"])

        outsider = User.objects.create_user(
            phone_number="+255700000003",
            username="league_outsider",
        )
        self.client.force_authenticate(outsider)
        detail = self.client.get(f"/api/gamification/leagues/{league['invite_code']}/")
        self.assertEqual(detail.status_code, 403)

    def test_picks_must_be_before_kickoff_and_unique_per_match(self):
        league = self.create_league()
        future_match = self.create_match(1001)

        first_pick = self.submit_pick(league["invite_code"], future_match)
        self.assertEqual(first_pick.status_code, 201)
        duplicate_pick = self.submit_pick(league["invite_code"], future_match)
        self.assertEqual(duplicate_pick.status_code, 409)

        past_match = self.create_match(
            1002,
            kickoff_at=timezone.now() - timedelta(minutes=1),
        )
        late_pick = self.submit_pick(league["invite_code"], past_match)
        self.assertEqual(late_pick.status_code, 400)

    def test_finished_and_postponed_picks_settle_and_update_standings(self):
        league_response = self.create_league()
        league = PredictionLeague.objects.get(invite_code=league_response["invite_code"])
        member = PredictionLeagueMember.objects.get(league=league, user=self.owner)

        correct_match = self.create_match(
            1003,
            status="FINISHED",
            home_score=2,
            away_score=0,
        )
        incorrect_match = self.create_match(
            1004,
            status="FINISHED",
            home_score=0,
            away_score=2,
        )
        void_match = self.create_match(1005, status="POSTPONED")

        for match in (correct_match, incorrect_match, void_match):
            LeaguePick.objects.create(
                member=member,
                match=match,
                market_key="1X2",
                selection_key="home_win",
            )

        response = self.client.get(
            f"/api/gamification/leagues/{league.invite_code}/"
        )
        self.assertEqual(response.status_code, 200)

        picks_by_match = {
            pick["match"]["id"]: pick
            for pick in response.data["picks"]
        }
        self.assertEqual(picks_by_match[correct_match.pk]["status"], "CORRECT")
        self.assertEqual(picks_by_match[incorrect_match.pk]["status"], "INCORRECT")
        self.assertEqual(picks_by_match[void_match.pk]["status"], "VOID")

        standing = response.data["standings"][0]
        self.assertEqual(standing["points"], 3)
        self.assertEqual(standing["correct_count"], 1)
        self.assertEqual(standing["incorrect_count"], 1)
        self.assertEqual(standing["void_count"], 1)
        self.assertEqual(standing["accuracy"], 50.0)
