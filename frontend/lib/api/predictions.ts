import { apiClient } from "./client";

export interface Team {
  id: number;
  name: string;
  crest_url: string;
  league?: League;
}
export interface League {
  id: number;
  code: string;
  name: string;
  poisson_key: string;
  logo_url: string;
  is_active: boolean;
}
export interface Match {
  id: number;
  league: League;
  home_team: Team;
  away_team: Team;
  kickoff_at: string;
  status: "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED" | "CANCELLED";
  home_score: number | null;
  away_score: number | null;
  is_big_match: boolean;
  stage: string;
  stage_display: string;
  group_name: string;
  matchday?: number | null;
}

export function getFixtures(date?: string, range?: string, offset?: number, limit?: number, league?: string) {
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  if (range) params.append("range", range);
  if (offset !== undefined) params.append("offset", offset.toString());
  if (limit !== undefined) params.append("limit", limit.toString());
  if (league) params.append("league", league);
  const query = params.toString();
  return apiClient<Match[]>(`/predictions/fixtures/${query ? '?' + query : ''}`, { skipAuth: true });
}
export function getLiveMatches() {
  return apiClient<Match[]>("/predictions/live/", { skipAuth: true });
}
export function getFinishedMatches(limit = 20, offset = 0, league?: string, team?: string, date?: string) {
  const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
  if (league) params.append("league", league);
  if (team) params.append("team", team);
  if (date) params.append("date", date);
  return apiClient<{ count: number; results: Match[] }>(`/predictions/finished/?${params}`, { skipAuth: true });
}
export function searchMatches(q: string, date?: string, league?: string) {
  const params = new URLSearchParams({ q });
  if (date) params.append("date", date);
  if (league) params.append("league", league);
  return apiClient<{ results: Match[] }>(`/predictions/search/?${params}`, { skipAuth: true });
}

export interface MatchFormEntry {
  opponent: string;
  result: string;
  date: string;
  opponent_crest?: string;
  is_home?: boolean;
  team_goals?: number;
  opponent_goals?: number;
}

export interface MatchOverview {
  match: Match;
  home_form: { sequence: string; avg_goals_scored: number; matches: MatchFormEntry[] };
  away_form: { sequence: string; avg_goals_scored: number; matches: MatchFormEntry[] };
  head_to_head: { date: string; home_team: string; away_team: string; home_score: number; away_score: number }[];
}

export function getMatchOverview(matchId: number, formRange?: number, h2hRange?: number) {
  const params = new URLSearchParams();
  if (formRange) params.append("form_range", formRange.toString());
  if (h2hRange) params.append("h2h_range", h2hRange.toString());
  const query = params.toString();
  return apiClient<MatchOverview>(`/predictions/matches/${matchId}/overview/${query ? '?' + query : ''}`, { skipAuth: true });
}

export interface MarketOption {
  key: string;
  label: string;
  prob: number | null;
  extra?: {
    rank?: number;
    home_goals?: number;
    away_goals?: number;
  };
}
export interface Market {
  key: string;
  label: string;
  is_locked: boolean;
  is_free: boolean;
  confidence: number | null;
  ai_pick: string | null;
  options: MarketOption[];
}

export interface TopPick {
  is_locked: boolean;
  confidence: number;
  market_label: string | null;
  option_label: string | null;
  status?: "STRONG" | "NO_STRONG_PICK";
  tier?: "STRONG" | "ELITE" | null;
  data_quality?: "HIGH" | "MEDIUM" | "LOW";
  model_version?: string;
  reason?: string;
}

export interface Dashboard {
  match_id: number;
  model_version: string;
  expected_goals: { home_xg: number; away_xg: number; total_xg: number };
  top_pick: TopPick;
  markets: Market[];
  match: Match;
}

export function getMatchDashboard(matchId: number) {
  return apiClient<Dashboard>(`/predictions/matches/${matchId}/dashboard/`);
}
export function saveMatch(matchId: number) {
  return apiClient("/predictions/save/", { method: "POST", body: JSON.stringify({ match_id: matchId }) });
}
export function getSavedMatches() {
  return apiClient<Array<{ match_id: number; home_team: string; away_team: string; saved_at: string }>>("/predictions/saved/");
}
export function saveMarket(matchId: number, marketKey: string) {
  return apiClient("/predictions/save-market/", { method: "POST", body: JSON.stringify({ match_id: matchId, market_key: marketKey }) });
}
export function unsaveMarket(matchId: number, marketKey: string) {
  return apiClient("/predictions/save-market/", { method: "DELETE", body: JSON.stringify({ match_id: matchId, market_key: marketKey }) });
}
export interface SavedMarket {
  id: number;
  match: {
    id: number;
    home_team: { name: string };
    away_team: { name: string };
    kickoff_at: string;
    league: { name: string };
  };
  market_key: string;
  created_at: string;
  ai_pick?: string;
  ai_confidence?: number;
  is_public?: boolean;
  user?: number;
  username?: string;
}

export function getSavedMarkets(matchId?: number) {
  const query = matchId ? `?match_id=${matchId}` : "";
  return apiClient<SavedMarket[]>(`/predictions/saved-markets/${query}`);
}
export function generateSavedMarketsPDF(tabName: string) {
  return apiClient("/predictions/saved-markets/pdf/", { 
    method: "POST", 
    body: JSON.stringify({ tab_name: tabName }),
    responseType: 'blob'
  });
}

export function generateHighConfidencePDF(league: string, cardIds?: number[]) {
  return apiClient("/predictions/high-confidence-pdf/", {
    method: "POST",
    body: JSON.stringify({ league: league, card_ids: cardIds }),
    responseType: 'blob'
  });
}

export function getPublicSavedMarkets() {
  return apiClient<SavedMarket[]>("/predictions/public-saved-markets/");
}

export function toggleSavedMarketPublic(id: number) {
  return apiClient<SavedMarket>(`/predictions/saved-markets/${id}/toggle-public/`, { method: "PATCH" });
}

export interface MarketOptionAnalysis {
  key: string;
  label: string;
  prob: number | null;
  was_actual_outcome: boolean | null;
  extra?: {
    rank?: number;
    home_goals?: number;
    away_goals?: number;
  };
}
export interface MarketAnalysis {
  key: string;
  label: string;
  is_locked: boolean;
  is_free: boolean;
  ai_pick: string | null;
  ai_was_correct: boolean | null;
  options: MarketOptionAnalysis[];
}
export interface AIRecommendationResult {
  status: "STRONG" | "NO_STRONG_PICK";
  market_key: string | null;
  option_key: string | null;
  market_label: string | null;
  option_label: string | null;
  confidence: number;
  tier?: "STRONG" | "ELITE" | null;
  data_quality?: "HIGH" | "MEDIUM" | "LOW";
  reason?: string;
  was_correct: boolean | null;
}

export interface MatchAnalysis {
  model_version: string;
  ai_scorecard: { correct: number; total: number };
  ai_recommendation: AIRecommendationResult;
  expected_goals: { home_xg: number; away_xg: number };
  actual_score: { home: number; away: number };
  markets: MarketAnalysis[];
  match: Match;
}

export function getMatchAnalysis(matchId: number) {
  return apiClient<MatchAnalysis>(`/predictions/matches/${matchId}/analysis/`);
}

export interface AITrackRecordMarketStat {
  correct: number;
  total: number;
  accuracy_percentage: number;
}
export interface AITrackRecord {
  generated_at: string;
  scope: string;
  markets: Record<string, AITrackRecordMarketStat>;
  weekly_trend: { week_start: string; accuracy_percentage: number }[];
  boldest_calls: {
    match_id: number;
    home_team: string;
    away_team: string;
    ai_confidence: number;
    ai_predicted: string;
    date: string;
  }[];
}

export function getAITrackRecord(league?: string) {
  const q = league ? `?league=${league}` : "";
  return apiClient<AITrackRecord>(`/predictions/ai-track-record/${q}`, { skipAuth: true });
}

export interface AIPerformanceStats {
  daily: {
    accuracy_percentage: number | null;
    total_predictions: number;
    correct_predictions: number;
    high_confidence_accuracy: number | null;
    market_accuracy: {
      "1x2": number | null;
      "btts": number | null;
      "over_under": number | null;
      "double_chance": number | null;
      "over_under_15": number | null;
      "home_goals": number | null;
      "away_goals": number | null;
    };
    market_counts: {
      "1x2": number;
      "btts": number;
      "over_under": number;
      "double_chance": number;
      "over_under_15": number;
      "home_goals": number;
      "away_goals": number;
    };
    current_streak: number;
    best_streak: number;
  };
  weekly: {
    accuracy_percentage: number | null;
    total_predictions: number;
    correct_predictions: number;
    high_confidence_accuracy: number | null;
    market_accuracy: {
      "1x2": number | null;
      "btts": number | null;
      "over_under": number | null;
      "double_chance": number | null;
      "over_under_15": number | null;
      "home_goals": number | null;
      "away_goals": number | null;
    };
    market_counts: {
      "1x2": number;
      "btts": number;
      "over_under": number;
      "double_chance": number;
      "over_under_15": number;
      "home_goals": number;
      "away_goals": number;
    };
    best_streak: number;
  };
  all_time: {
    accuracy_percentage: number;
    total_predictions: number;
    correct_predictions: number;
    high_confidence_accuracy: number;
  };
  weekly_trend: {
    date: string;
    accuracy_percentage: number | null;
    total_predictions: number;
  }[];
}

export function getAIPerformanceStats() {
  return apiClient<AIPerformanceStats>("/predictions/ai-performance/", { skipAuth: true });
}

export interface League {
  id: number;
  code: string;
  name: string;
  poisson_key: string;
  logo_url: string;
  is_active: boolean;
}

export function getLeagues() {
  return apiClient<League[]>("/predictions/leagues/", { skipAuth: true });
}

// Odds API types
export interface OddsBookmaker {
  id: number;
  match: Match;
  bookmaker_name: string;
  market_type: string;
  market_label: string;
  home_win_odds: number | string | null;
  draw_odds: number | string | null;
  away_win_odds: number | string | null;
  over_odds: number | string | null;
  under_odds: number | string | null;
  btts_yes_odds: number | string | null;
  btts_no_odds: number | string | null;
  last_updated: string;
  is_live: boolean;
}

export interface MatchOddsResponse {
  match: {
    id: number;
    home_team: string;
    away_team: string;
    kickoff_at: string;
    status: string;
  };
  odds: OddsBookmaker[];
  history: Array<{
    bookmaker: string;
    market_type: string;
    home_win_odds: number | null;
    draw_odds: number | null;
    away_win_odds: number | null;
    timestamp: string;
  }>;
}

export interface Bookmaker {
  name: string;
  leagues: string[];
}

export function getOdds(league?: string, status?: string, lang?: string) {
  const params = new URLSearchParams();
  if (league) params.append("league", league);
  if (status) params.append("status", status);
  if (lang) params.append("lang", lang);
  const query = params.toString();
  return apiClient<OddsBookmaker[]>(`/predictions/odds/${query ? '?' + query : ''}`, { skipAuth: true });
}

export function getMatchOdds(matchId: number, lang?: string) {
  const params = new URLSearchParams();
  if (lang) params.append("lang", lang);
  const query = params.toString();
  return apiClient<MatchOddsResponse>(`/predictions/matches/${matchId}/odds/${query ? '?' + query : ''}`, { skipAuth: true });
}

export function getBookmakers() {
  return apiClient<Bookmaker[]>("/predictions/bookmakers/", { skipAuth: true });
}

// Team and League Detail API types
export interface TeamStanding {
  id: number;
  team: Team;
  league: League;
  position: number;
  matches_played: number;
  won: number;
  draw: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  form: string | null;
  form_rating: number;
  updated_at: string;
}

export interface TeamDetail {
  team: Team;
  league: League | null;
  standings: TeamStanding | null;
  upcoming_matches: Match[];
  finished_matches: Match[];
}

export interface LeagueDetail {
  league: League;
  standings: TeamStanding[];
  upcoming_matches: Match[];
  finished_matches: Match[];
  teams: Team[];
}

export function getTeamDetail(teamId: number) {
  return apiClient<TeamDetail>(`/predictions/teams/${teamId}/`, { skipAuth: true });
}

export function getLeagueDetail(leagueCode: string) {
  return apiClient<LeagueDetail>(`/predictions/leagues/${leagueCode}/`, { skipAuth: true });
}

// Bashiri Pick Analytics types
export interface AIAnalytics {
  range: string;
  total_picks: number;
  market_breakdown?: Array<{
    market: string;
    market_label: string;
    picks: number;
    won: number;
    lost: number;
    hit_rate: number;
  }>;
  tier_breakdown?: Array<{
    tier: string;
    picks: number;
    won: number;
    lost: number;
    hit_rate: number;
  }>;
  league_breakdown?: Array<{
    league: string;
    league_name: string;
    picks: number;
    won: number;
    lost: number;
    hit_rate: number;
  }>;
}

export function getAIAnalytics(params?: {
  range?: "today" | "yesterday" | "this_week" | "last_7_days" | "this_month";
  breakdown?: "market" | "tier" | "league" | "all";
}) {
  const query = new URLSearchParams();
  if (params?.range) query.append("range", params.range);
  if (params?.breakdown) query.append("breakdown", params.breakdown);
  return apiClient<AIAnalytics>(`/predictions/ai-analytics/${query ? '?' + query : ''}`, { skipAuth: true });
}

export interface BashiriPickAnalyticsSummary {
  total_picks: number;
  settled_picks: number;
  won: number;
  lost: number;
  push: number;
  accuracy: number;
  current_streak: number;
  best_streak: number;
  date_range: {
    start: string;
    end: string;
  };
  filters_applied: {
    league: string | null;
    range: string;
    min_confidence: string | null;
    max_confidence: string | null;
  };
}

export interface MarketBreakdown {
  market: string;
  total: number;
  won: number;
  lost: number;
  accuracy: number;
}

export interface LeagueBreakdown {
  league: string;
  total: number;
  won: number;
  lost: number;
  accuracy: number;
}

export interface ConfidenceBreakdown {
  label: string;
  total: number;
  won: number;
  lost: number;
  accuracy: number;
}

export interface DailyTrend {
  date: string;
  accuracy: number;
  total: number;
  won: number;
  lost: number;
}

export interface RecentPick {
  snapshot_id: number;
  match_id: number;
  home_team: string;
  away_team: string;
  league: string;
  market_key: string;
  market_label: string;
  option_key: string;
  option_label: string;
  confidence: number;
  status: string;
  created_at: string;
  settled_at: string | null;
  actual_home_score: number | null;
  actual_away_score: number | null;
}

export interface BashiriPickAnalytics {
  summary: BashiriPickAnalyticsSummary;
  market_breakdown: MarketBreakdown[];
  league_breakdown: LeagueBreakdown[];
  confidence_breakdown: ConfidenceBreakdown[];
  daily_trend: DailyTrend[];
  recent_picks: RecentPick[];
}

export function getBashiriPickAnalytics(params?: {
  league?: string;
  range?: "last_7_days" | "last_30_days" | "last_90_days" | "custom";
  start_date?: string;
  end_date?: string;
  min_confidence?: number;
  max_confidence?: number;
}) {
  const query = new URLSearchParams();
  if (params?.league) query.append("league", params.league);
  if (params?.range) query.append("range", params.range);
  if (params?.start_date) query.append("start_date", params.start_date);
  if (params?.end_date) query.append("end_date", params.end_date);
  if (params?.min_confidence) query.append("min_confidence", params.min_confidence.toString());
  if (params?.max_confidence) query.append("max_confidence", params.max_confidence.toString());
  return apiClient<BashiriPickAnalytics>(`/predictions/bashiri-pick-analytics/${query ? '?' + query : ''}`, { skipAuth: true });
}

// High Confidence Analytics types
export interface HighConfidenceAnalyticsSummary {
  total_picks: number;
  settled_picks: number;
  won: number;
  lost: number;
  accuracy: number;
  current_streak: number;
  best_streak: number;
  date_range: {
    start: string;
    end: string;
  };
  filters_applied: {
    league: string | null;
    range: string;
    min_confidence: string | null;
    max_confidence: string | null;
  };
}

export interface HighConfidenceLeagueBreakdown {
  league: string;
  total: number;
  won: number;
  lost: number;
  accuracy: number;
}

export interface HighConfidenceConfidenceBreakdown {
  label: string;
  total: number;
  won: number;
  lost: number;
  accuracy: number;
}

export interface HighConfidenceDailyTrend {
  date: string;
  accuracy: number;
  total: number;
  won: number;
  lost: number;
}

export interface HighConfidenceRecentPick {
  snapshot_id: number;
  match_id: number;
  home_team: string;
  away_team: string;
  league: string;
  winner: string;
  confidence: number;
  status: string;
  created_at: string;
  settled_at: string | null;
  actual_home_score: number | null;
  actual_away_score: number | null;
}

export interface HighConfidenceAnalytics {
  summary: HighConfidenceAnalyticsSummary;
  league_breakdown: HighConfidenceLeagueBreakdown[];
  confidence_breakdown: HighConfidenceConfidenceBreakdown[];
  daily_trend: HighConfidenceDailyTrend[];
  recent_picks: HighConfidenceRecentPick[];
}

export function getHighConfidenceAnalytics(params?: {
  league?: string;
  range?: "last_7_days" | "last_30_days" | "last_90_days" | "custom";
  start_date?: string;
  end_date?: string;
  min_confidence?: number;
  max_confidence?: number;
}) {
  const query = new URLSearchParams();
  if (params?.league) query.append("league", params.league);
  if (params?.range) query.append("range", params.range);
  if (params?.start_date) query.append("start_date", params.start_date);
  if (params?.end_date) query.append("end_date", params.end_date);
  if (params?.min_confidence) query.append("min_confidence", params.min_confidence.toString());
  if (params?.max_confidence) query.append("max_confidence", params.max_confidence.toString());
  return apiClient<HighConfidenceAnalytics>(`/predictions/high-confidence-analytics/${query ? '?' + query : ''}`, { skipAuth: true });
}