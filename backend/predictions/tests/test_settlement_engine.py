import pytest

from predictions.settlement_engine import settle_ai_pick


@pytest.mark.parametrize(
    ("market", "selection", "home_score", "away_score", "expected"),
    [
        ("1X2", "home_win", 2, 1, "WON"),
        ("1X2", "away_win", 1, 2, "WON"),
        ("1X2", "draw", 1, 1, "WON"),
        ("BTTS", "btts_yes", 1, 1, "WON"),
        ("BTTS", "btts_no", 1, 0, "WON"),
        ("OVER_UNDER_1_5", "over_1_5", 2, 0, "WON"),
        ("OVER_UNDER_1_5", "under_1_5", 1, 0, "WON"),
        ("OVER_UNDER_2_5", "over_2_5", 2, 1, "WON"),
        ("DOUBLE_CHANCE", "dc_1x", 1, 0, "WON"),
        ("DRAW_NO_BET", "away_dnb", 0, 2, "WON"),
        ("HOME_GOALS_OVER_1_5", "home_under_1_5", 1, 0, "WON"),
        ("AWAY_GOALS_OVER_1_5", "away_over_1_5", 0, 2, "WON"),
    ],
)
def test_option_keys_settle_without_void(
    market, selection, home_score, away_score, expected
):
    result = settle_ai_pick(market, selection, home_score, away_score)

    assert result.status == expected, result.reason
