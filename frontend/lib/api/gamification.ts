/**
 * Gamification API functions
 */
import { apiClient } from './client';
import type { Match } from './predictions';
import type { MarketDefinition } from '@/lib/types/tips';

export interface PredictionLeague {
  id: string;
  name: string;
  description: string;
  invite_code: string;
  owner_id: number;
  owner_name: string;
  member_count: number;
  is_active: boolean;
  created_at: string;
  ends_at: string;
  my_points: number;
  my_picks_count: number;
}

export interface LeagueMember {
  user_id: number;
  username: string;
  avatar_url: string;
  joined_at: string;
  points: number;
  picks_count: number;
  correct_count: number;
  incorrect_count: number;
  pending_count: number;
  void_count: number;
  accuracy: number | null;
}

export interface LeaguePick {
  id: number;
  user_id: number;
  username: string;
  avatar_url: string;
  match: Pick<Match, 'id' | 'kickoff_at' | 'status' | 'home_score' | 'away_score'> & {
    home_team: string;
    away_team: string;
    league: string;
  };
  market_key: string;
  market_label: string;
  selection_key: string;
  selection_label: string;
  status: 'PENDING' | 'CORRECT' | 'INCORRECT' | 'VOID';
  points: number;
  submitted_at: string;
  settled_at: string | null;
}

export interface PredictionLeagueDetail {
  league: PredictionLeague;
  is_open: boolean;
  standings: LeagueMember[];
  picks: LeaguePick[];
}

export function getPredictionLeagues() {
  return apiClient<{ results: PredictionLeague[] }>('/gamification/leagues/');
}

export function createPredictionLeague(payload: {
  name: string;
  description: string;
  duration_days: 7 | 30 | 90;
}) {
  return apiClient<PredictionLeague>('/gamification/leagues/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function joinPredictionLeague(invite_code: string) {
  return apiClient<{ joined: boolean; league: PredictionLeague }>('/gamification/leagues/join/', {
    method: 'POST',
    body: JSON.stringify({ invite_code }),
  });
}

export function getPredictionLeague(inviteCode: string) {
  return apiClient<PredictionLeagueDetail>(`/gamification/leagues/${encodeURIComponent(inviteCode)}/`);
}

export function createLeaguePick(
  inviteCode: string,
  payload: { match: number; market_key: string; selection_key: string },
) {
  return apiClient<LeaguePick>(`/gamification/leagues/${encodeURIComponent(inviteCode)}/picks/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getLeagueMarkets() {
  return apiClient<{ markets: MarketDefinition[]; categories: string[] }>('/tips/markets/', {
    skipAuth: true,
  });
}

export interface UserProgress {
  level: number;
  experience_points: number;
  current_level_xp: number;
  next_level_xp: number;
  total_tips_created: number;
  total_tips_correct: number;
  longest_streak: number;
  current_streak: number;
  ai_agreement_score: number;
  social_shares_count: number;
  referral_count: number;
  last_updated: string;
  level_progress: number;
}

export interface UserAchievement {
  id: number;
  achievement_type: string;
  earned_at: string;
  metadata: Record<string, any>;
}

export interface Referral {
  id: number;
  referral_code: string;
  status: string;
  reward_points: number;
  created_at: string;
  completed_at: string | null;
  expires_at: string | null;
}

export interface DailyChallenge {
  id: number;
  challenge_type: string;
  title: string;
  description: string;
  reward_xp: number;
  target_value: number;
  challenge_date: string;
  is_active: boolean;
}

export interface UserChallenge {
  id: number;
  challenge: DailyChallenge;
  current_value: number;
  completed: boolean;
  completed_at: string | null;
  started_at: string;
}

export interface SocialShare {
  id: number;
  share_type: string;
  content_type: string;
  content_id: number;
  shared_at: string;
  reward_xp: number;
}

export interface UserProgressResponse {
  progress: UserProgress;
  achievements: UserAchievement[];
  is_new: boolean;
}

export interface ChallengesResponse {
  challenges: DailyChallenge[];
  user_progress: UserChallenge[];
}

export async function getUserProgress(): Promise<UserProgressResponse> {
  return apiClient<UserProgressResponse>('/gamification/progress/');
}

export async function getAchievements(): Promise<{ achievements: UserAchievement[]; total_count: number }> {
  return apiClient<{ achievements: UserAchievement[]; total_count: number }>('/gamification/achievements/');
}

export async function generateReferralCode(): Promise<{ referral_code: string; referral_link: string; status: string }> {
  return apiClient<{ referral_code: string; referral_link: string; status: string }>('/gamification/referral/generate/', {
    method: 'POST',
  });
}

export async function validateReferralCode(referralCode: string): Promise<{ valid: boolean; referrer?: string }> {
  return apiClient<{ valid: boolean; referrer?: string }>('/gamification/referral/validate/', {
    method: 'POST',
    body: JSON.stringify({ referral_code: referralCode }),
  });
}

export async function completeReferral(referralCode: string): Promise<{ message: string; reward_points: number; referral: Referral }> {
  return apiClient<{ message: string; reward_points: number; referral: Referral }>('/gamification/referral/complete/', {
    method: 'POST',
    body: JSON.stringify({ referral_code: referralCode }),
  });
}

export async function recordSocialShare(shareType: string, contentType: string, contentId: number): Promise<{ message: string; reward_xp: number; share: SocialShare }> {
  return apiClient<{ message: string; reward_xp: number; share: SocialShare }>('/gamification/share/', {
    method: 'POST',
    body: JSON.stringify({
      share_type: shareType,
      content_type: contentType,
      content_id: contentId,
    }),
  });
}

export async function getDailyChallenges(): Promise<ChallengesResponse> {
  return apiClient<ChallengesResponse>('/gamification/challenges/');
}

export async function joinChallenge(challengeId: number): Promise<{ message: string; user_challenge: UserChallenge }> {
  return apiClient<{ message: string; user_challenge: UserChallenge }>('/gamification/challenges/join/', {
    method: 'POST',
    body: JSON.stringify({ challenge_id: challengeId }),
  });
}

export async function updateChallengeProgress(userChallengeId: number, increment: number = 1): Promise<{ message: string; user_challenge: UserChallenge }> {
  return apiClient<{ message: string; user_challenge: UserChallenge }>('/gamification/challenges/update/', {
    method: 'POST',
    body: JSON.stringify({
      user_challenge_id: userChallengeId,
      increment,
    }),
  });
}