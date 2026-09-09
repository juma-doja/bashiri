"""
AI Pick Settlement Engine

Deterministic settlement logic for all AI Pick markets.
Each market has a specific settlement function that takes final scores
and returns WON, LOST, PUSH, or VOID.
"""

import re
from typing import Tuple, Optional


class SettlementResult:
    """Result of settlement calculation."""
    def __init__(self, status: str, reason: str = ""):
        self.status = status  # "WON", "LOST", "PUSH", "VOID"
        self.reason = reason

    def to_dict(self):
        return {"status": self.status, "reason": self.reason}


def settle_1x2_home(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """Settle 1X2 Home predictions."""
    if selection != "Home":
        return SettlementResult("VOID", f"Invalid selection for 1x2_home: {selection}")

    if home_score > away_score:
        return SettlementResult("WON", f"Home won {home_score}-{away_score}")
    elif home_score < away_score:
        return SettlementResult("LOST", f"Home lost {home_score}-{away_score}")
    else:
        return SettlementResult("LOST", f"Match ended in draw {home_score}-{away_score}")


def settle_1x2_draw(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """Settle 1X2 Draw predictions."""
    if selection != "Draw":
        return SettlementResult("VOID", f"Invalid selection for 1x2_draw: {selection}")

    if home_score == away_score:
        return SettlementResult("WON", f"Match ended in draw {home_score}-{away_score}")
    else:
        return SettlementResult("LOST", f"Match did not end in draw {home_score}-{away_score}")


def settle_1x2_away(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """Settle 1X2 Away predictions."""
    if selection != "Away":
        return SettlementResult("VOID", f"Invalid selection for 1x2_away: {selection}")

    if away_score > home_score:
        return SettlementResult("WON", f"Away won {home_score}-{away_score}")
    elif away_score < home_score:
        return SettlementResult("LOST", f"Away lost {home_score}-{away_score}")
    else:
        return SettlementResult("LOST", f"Match ended in draw {home_score}-{away_score}")


def settle_btts_yes(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """Settle BTTS Yes predictions."""
    if selection != "Yes":
        return SettlementResult("VOID", f"Invalid selection for btts_yes: {selection}")

    if home_score >= 1 and away_score >= 1:
        return SettlementResult("WON", f"Both teams scored {home_score}-{away_score}")
    else:
        return SettlementResult("LOST", f"Both teams did not score {home_score}-{away_score}")


def settle_btts_no(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """Settle BTTS No predictions."""
    if selection != "No":
        return SettlementResult("VOID", f"Invalid selection for btts_no: {selection}")

    if home_score == 0 or away_score == 0:
        return SettlementResult("WON", f"At least one team failed to score {home_score}-{away_score}")
    else:
        return SettlementResult("LOST", f"Both teams scored {home_score}-{away_score}")


def settle_dc_1x(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """Settle Double Chance 1X (Home or Draw)."""
    # Normalize selection - accept "1X" or "1x"
    normalized_selection = selection.lower()
    if normalized_selection != "1x":
        return SettlementResult("VOID", f"Invalid selection for dc_1x: {selection}")

    if home_score >= away_score:
        return SettlementResult("WON", f"Home won or drew {home_score}-{away_score}")
    else:
        return SettlementResult("LOST", f"Away won {home_score}-{away_score}")


def settle_dc_x2(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """Settle Double Chance X2 (Draw or Away)."""
    # Normalize selection - accept "X2" or "x2"
    normalized_selection = selection.lower()
    if normalized_selection != "x2":
        return SettlementResult("VOID", f"Invalid selection for dc_x2: {selection}")

    if away_score >= home_score:
        return SettlementResult("WON", f"Away won or drew {home_score}-{away_score}")
    else:
        return SettlementResult("LOST", f"Home won {home_score}-{away_score}")


def settle_dc_12(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """Settle Double Chance 12 (Home or Away - no draw)."""
    # Normalize selection - accept "12" or "12"
    normalized_selection = selection.lower()
    if normalized_selection != "12":
        return SettlementResult("VOID", f"Invalid selection for dc_12: {selection}")

    if home_score != away_score:
        return SettlementResult("WON", f"Match did not end in draw {home_score}-{away_score}")
    else:
        return SettlementResult("LOST", f"Match ended in draw {home_score}-{away_score}")


def settle_dnb_home(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """Settle Draw No Bet Home predictions."""
    if selection != "Home":
        return SettlementResult("VOID", f"Invalid selection for dnb_home: {selection}")

    if home_score > away_score:
        return SettlementResult("WON", f"Home won {home_score}-{away_score}")
    elif home_score == away_score:
        return SettlementResult("PUSH", f"Match ended in draw {home_score}-{away_score}")
    else:
        return SettlementResult("LOST", f"Home lost {home_score}-{away_score}")


def settle_dnb_away(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """Settle Draw No Bet Away predictions."""
    if selection != "Away":
        return SettlementResult("VOID", f"Invalid selection for dnb_away: {selection}")

    if away_score > home_score:
        return SettlementResult("WON", f"Away won {home_score}-{away_score}")
    elif home_score == away_score:
        return SettlementResult("PUSH", f"Match ended in draw {home_score}-{away_score}")
    else:
        return SettlementResult("LOST", f"Away lost {home_score}-{away_score}")


def settle_over_1_5(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """Settle Over 1.5 Goals predictions."""
    if selection != "Over":
        return SettlementResult("VOID", f"Invalid selection for over_1_5: {selection}")

    total_goals = home_score + away_score
    if total_goals >= 2:
        return SettlementResult("WON", f"Total goals {total_goals} >= 2")
    else:
        return SettlementResult("LOST", f"Total goals {total_goals} < 2")


def settle_over_2_5(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """Settle Over 2.5 Goals predictions."""
    if selection != "Over":
        return SettlementResult("VOID", f"Invalid selection for over_2_5: {selection}")

    total_goals = home_score + away_score
    if total_goals >= 3:
        return SettlementResult("WON", f"Total goals {total_goals} >= 3")
    else:
        return SettlementResult("LOST", f"Total goals {total_goals} < 3")


def settle_under_1_5(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """Settle Under 1.5 Goals predictions."""
    if selection != "Under":
        return SettlementResult("VOID", f"Invalid selection for under_1_5: {selection}")

    total_goals = home_score + away_score
    if total_goals <= 1:
        return SettlementResult("WON", f"Total goals {total_goals} <= 1")
    else:
        return SettlementResult("LOST", f"Total goals {total_goals} > 1")


def settle_under_2_5(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """Settle Under 2.5 Goals predictions."""
    if selection != "Under":
        return SettlementResult("VOID", f"Invalid selection for under_2_5: {selection}")

    total_goals = home_score + away_score
    if total_goals <= 2:
        return SettlementResult("WON", f"Total goals {total_goals} <= 2")
    else:
        return SettlementResult("LOST", f"Total goals {total_goals} > 2")


def settle_home_over_0_5(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """Settle Home Over 0.5 Goals predictions."""
    # Accept both "over" and "home_over_0_5" formats
    normalized_selection = selection.lower().replace("away_", "").replace("home_", "").replace("_1_5", "").replace("_0_5", "").replace("_2_5", "")
    if normalized_selection != "over":
        return SettlementResult("VOID", f"Invalid selection for home_over_0_5: {selection}")

    if home_score >= 1:
        return SettlementResult("WON", f"Home scored {home_score} goals")
    else:
        return SettlementResult("LOST", f"Home scored {home_score} goals")


def settle_home_over_1_5(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """Settle Home Over 1.5 Goals predictions."""
    if selection != "Over":
        return SettlementResult("VOID", f"Invalid selection for home_over_1_5: {selection}")

    if home_score >= 2:
        return SettlementResult("WON", f"Home scored {home_score} goals")
    else:
        return SettlementResult("LOST", f"Home scored {home_score} goals")


def settle_home_over_2_5(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """Settle Home Over 2.5 Goals predictions."""
    if selection != "Over":
        return SettlementResult("VOID", f"Invalid selection for home_over_2_5: {selection}")

    if home_score >= 3:
        return SettlementResult("WON", f"Home scored {home_score} goals")
    else:
        return SettlementResult("LOST", f"Home scored {home_score} goals")


def settle_away_over_0_5(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """Settle Away Over 0.5 Goals predictions."""
    # Accept both "over" and "home_over_0_5"/"away_over_0_5" formats
    normalized_selection = selection.lower().replace("away_", "").replace("home_", "").replace("_1_5", "").replace("_0_5", "").replace("_2_5", "")
    if normalized_selection != "over":
        return SettlementResult("VOID", f"Invalid selection for away_over_0_5: {selection}")

    if away_score >= 1:
        return SettlementResult("WON", f"Away scored {away_score} goals")
    else:
        return SettlementResult("LOST", f"Away scored {away_score} goals")


def settle_away_over_1_5(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """Settle Away Over 1.5 Goals predictions."""
    if selection != "Over":
        return SettlementResult("VOID", f"Invalid selection for away_over_1_5: {selection}")

    if away_score >= 2:
        return SettlementResult("WON", f"Away scored {away_score} goals")
    else:
        return SettlementResult("LOST", f"Away scored {away_score} goals")


def settle_home_over_2_5(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """Settle Home Over 2.5 Goals predictions."""
    if selection != "Over":
        return SettlementResult("VOID", f"Invalid selection for home_over_2_5: {selection}")

    if home_score >= 3:
        return SettlementResult("WON", f"Home scored {home_score} goals")
    else:
        return SettlementResult("LOST", f"Home scored {home_score} goals")


def settle_away_over_0_5(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """Settle Away Over 0.5 Goals predictions."""
    # Accept both "over" and "home_over_0_5"/"away_over_0_5" formats
    normalized_selection = selection.lower().replace("away_", "").replace("home_", "").replace("_1_5", "").replace("_0_5", "").replace("_2_5", "")
    if normalized_selection != "over":
        return SettlementResult("VOID", f"Invalid selection for away_over_0_5: {selection}")

    if away_score >= 1:
        return SettlementResult("WON", f"Away scored {away_score} goals")
    else:
        return SettlementResult("LOST", f"Away scored {away_score} goals")


def settle_away_over_1_5(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """Settle Away Over 1.5 Goals predictions."""
    if selection != "Over":
        return SettlementResult("VOID", f"Invalid selection for away_over_1_5: {selection}")

    if away_score >= 2:
        return SettlementResult("WON", f"Away scored {away_score} goals")
    else:
        return SettlementResult("LOST", f"Away scored {away_score} goals")


def settle_away_over_2_5(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """Settle Away Over 2.5 Goals predictions."""
    if selection != "Over":
        return SettlementResult("VOID", f"Invalid selection for away_over_2_5: {selection}")

    if away_score >= 3:
        return SettlementResult("WON", f"Away scored {away_score} goals")
    else:
        return SettlementResult("LOST", f"Away scored {away_score} goals")


def settle_home_under_0_5(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """Settle Home Under 0.5 Goals predictions."""
    # Accept both "under" and "home_under_0_5"/"away_under_0_5" formats
    normalized_selection = selection.lower().replace("away_", "").replace("home_", "").replace("_1_5", "").replace("_0_5", "").replace("_2_5", "")
    if normalized_selection != "under":
        return SettlementResult("VOID", f"Invalid selection for home_under_0_5: {selection}")

    if home_score == 0:
        return SettlementResult("WON", f"Home scored {home_score} goals")
    else:
        return SettlementResult("LOST", f"Home scored {home_score} goals")


def settle_home_under_1_5(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """Settle Home Under 1.5 Goals predictions."""
    # Accept both "under" and "home_under_1_5" formats
    normalized_selection = selection.lower().replace("away_", "").replace("home_", "").replace("_1_5", "").replace("_0_5", "").replace("_2_5", "")
    if normalized_selection != "under":
        return SettlementResult("VOID", f"Invalid selection for home_under_1_5: {selection}")

    if home_score <= 1:
        return SettlementResult("WON", f"Home scored {home_score} goals")
    else:
        return SettlementResult("LOST", f"Home scored {home_score} goals")


def settle_away_under_0_5(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """Settle Away Under 0.5 Goals predictions."""
    # Accept both "under" and "home_under_0_5"/"away_under_0_5" formats
    normalized_selection = selection.lower().replace("away_", "").replace("home_", "").replace("_1_5", "").replace("_0_5", "").replace("_2_5", "")
    if normalized_selection != "under":
        return SettlementResult("VOID", f"Invalid selection for away_under_0_5: {selection}")

    if away_score == 0:
        return SettlementResult("WON", f"Away scored {away_score} goals")
    else:
        return SettlementResult("LOST", f"Away scored {away_score} goals")


def settle_away_under_1_5(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """Settle Away Under 1.5 Goals predictions."""
    # Accept both "under" and "away_under_1_5"
    normalized_selection = selection.lower().replace("away_", "").replace("home_", "").replace("_1_5", "").replace("_0_5", "").replace("_2_5", "")
    if normalized_selection != "under":
        return SettlementResult("VOID", f"Invalid selection for away_under_1_5: {selection}")

    if away_score <= 1:
        return SettlementResult("WON", f"Away scored {away_score} goals")
    else:
        return SettlementResult("LOST", f"Away scored {away_score} goals")


# Settlement function registry
SETTLEMENT_FUNCTIONS = {
    "1x2_home": settle_1x2_home,
    "1x2_draw": settle_1x2_draw,
    "1x2_away": settle_1x2_away,
    "btts_yes": settle_btts_yes,
    "btts_no": settle_btts_no,
    "dc_1x": settle_dc_1x,
    "dc_x2": settle_dc_x2,
    "dc_12": settle_dc_12,
    "dnb_home": settle_dnb_home,
    "dnb_away": settle_dnb_away,
    "over_1_5": settle_over_1_5,
    "over_2_5": settle_over_2_5,
    "under_1_5": settle_under_1_5,
    "under_2_5": settle_under_2_5,
    "home_over_0_5": settle_home_over_0_5,
    "home_over_1_5": settle_home_over_1_5,
    "home_over_2_5": settle_home_over_2_5,
    "home_under_0_5": settle_home_under_0_5,
    "home_under_1_5": settle_home_under_1_5,
    "away_over_0_5": settle_away_over_0_5,
    "away_over_1_5": settle_away_over_1_5,
    "away_over_2_5": settle_away_over_2_5,
    "away_under_0_5": settle_away_under_0_5,
    "away_under_1_5": settle_away_under_1_5,
    # Add mappings for variations
    "HOME_GOALS_OVER_0_5": settle_home_over_0_5,
    "HOME_GOALS_OVER_1_5": settle_home_over_1_5,
    "HOME_GOALS_OVER_2_5": settle_home_over_2_5,
    "HOME_GOALS_UNDER_0_5": settle_home_under_0_5,
    "HOME_GOALS_UNDER_1_5": settle_home_under_1_5,
    "AWAY_GOALS_OVER_0_5": settle_away_over_0_5,
    "AWAY_GOALS_OVER_1_5": settle_away_over_1_5,
    "AWAY_GOALS_OVER_2_5": settle_away_over_2_5,
    "AWAY_GOALS_UNDER_0_5": settle_away_under_0_5,
    "AWAY_GOALS_UNDER_1_5": settle_away_under_1_5,
    "OVER_UNDER_1_5": settle_over_1_5,  # Will be handled based on selection
}


def settle_ai_pick(market: str, selection: str, home_score: int, away_score: int) -> SettlementResult:
    """
    Main settlement function - routes to appropriate market settlement logic.

    Args:
        market: Market key (e.g., "1x2_home", "dc_1x", "HOME_GOALS_OVER_0_5")
        selection: Selection key (e.g., "Home", "1X", "Over")
        home_score: Final home score
        away_score: Final away score

    Returns:
        SettlementResult with status and reason
    """
    # TopPickCard stores option keys (for example ``over_1_5``), while the
    # settlement functions consume canonical selections (``Over``). Normalize
    # both values here so every producer can use the same contract.
    normalized_market = market.lower().strip()
    normalized_selection = selection.lower().strip()

    selection_aliases = {
        "home_win": "Home",
        "away_win": "Away",
        "draw": "Draw",
        "btts_yes": "Yes",
        "btts_no": "No",
        "home_dnb": "Home",
        "away_dnb": "Away",
        "dc_1x": "1X",
        "dc_x2": "X2",
        "dc_12": "12",
    }
    canonical_selection = selection_aliases.get(normalized_selection)
    if canonical_selection is None:
        if re.fullmatch(r"(?:home|away)?_?(?:over|under)_\d+_\d+", normalized_selection):
            canonical_selection = "Under" if "under" in normalized_selection else "Over"
        elif normalized_selection.startswith("over"):
            canonical_selection = "Over"
        elif normalized_selection.startswith("under"):
            canonical_selection = "Under"
        else:
            canonical_selection = selection.strip()
    normalized_selection = canonical_selection.lower()

    market_aliases = {
        "1x2": {
            "home_win": "1x2_home",
            "draw": "1x2_draw",
            "away_win": "1x2_away",
        },
        "btts": {"btts_yes": "btts_yes", "btts_no": "btts_no"},
        "draw_no_bet": {"home_dnb": "dnb_home", "away_dnb": "dnb_away"},
        "double_chance": {"1x": "dc_1x", "x2": "dc_x2", "12": "dc_12"},
    }
    alias_market = market_aliases.get(normalized_market)
    if alias_market:
        normalized_market = alias_market.get(selection.lower().strip(), normalized_market)

    if normalized_market.startswith("over_under_"):
        threshold = normalized_market.removeprefix("over_under_")
        normalized_market = f"under_{threshold}" if normalized_selection == "under" else f"over_{threshold}"

    if normalized_market.startswith("1x2_"):
        normalized_selection = {"1x2_home": "home", "1x2_draw": "draw", "1x2_away": "away"}.get(normalized_market, normalized_selection)
    elif normalized_market in {"btts_yes", "btts_no"}:
        normalized_selection = "yes" if normalized_market.endswith("yes") else "no"
    elif normalized_market in {"dnb_home", "dnb_away"}:
        normalized_selection = "home" if normalized_market.endswith("home") else "away"
    elif normalized_market in {"dc_1x", "dc_x2", "dc_12"}:
        normalized_selection = {"dc_1x": "1x", "dc_x2": "x2", "dc_12": "12"}[normalized_market]
    
    # Handle HOME_GOALS_OVER_X_X markets - if selection is under, use under function
    if normalized_market.startswith("home_goals_over"):
        threshold = normalized_market.replace("home_goals_over_", "")
        if "under" in normalized_selection:
            normalized_market = f"home_under_{threshold}"
        else:
            normalized_market = f"home_over_{threshold}"
    
    # Handle HOME_GOALS_UNDER_X_X markets
    elif normalized_market.startswith("home_goals_under"):
        threshold = normalized_market.replace("home_goals_under_", "")
        normalized_market = f"home_under_{threshold}"
    
    # Handle AWAY_GOALS_OVER_X_X markets - if selection is under, use under function
    elif normalized_market.startswith("away_goals_over"):
        threshold = normalized_market.replace("away_goals_over_", "")
        if "under" in normalized_selection:
            normalized_market = f"away_under_{threshold}"
        else:
            normalized_market = f"away_over_{threshold}"
    
    # Handle AWAY_GOALS_UNDER_X_X markets
    elif normalized_market.startswith("away_goals_under"):
        threshold = normalized_market.replace("away_goals_under_", "")
        normalized_market = f"away_under_{threshold}"
    
    # Handle OVER_UNDER_1_5 market
    elif normalized_market == "over_under_1_5":
        if "under" in normalized_selection:
            normalized_market = "under_1_5"
        else:
            normalized_market = "over_1_5"
    
    # Handle DOUBLE_CHANCE market
    elif normalized_market == "double_chance":
        if "1x" in normalized_selection:
            normalized_market = "dc_1x"
        elif "x2" in normalized_selection:
            normalized_market = "dc_x2"
        elif "12" in normalized_selection:
            normalized_market = "dc_12"
    
    settlement_func = SETTLEMENT_FUNCTIONS.get(normalized_market)

    if settlement_func is None:
        return SettlementResult("VOID", f"Unknown market: {market} (normalized: {normalized_market})")

    return settlement_func(normalized_market, canonical_selection, home_score, away_score)
