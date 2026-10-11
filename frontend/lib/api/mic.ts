import { apiClient } from "./client";
import { Match } from "./predictions";
import { uploadVideoResilient } from "@/lib/cloudinary-upload";

export interface MicReaction {
  id: number;
  match: number;
  user: number;
  username: string;
  avatar_url: string;
  video_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  mood: string;
  team_side: string;
  is_fan_of_match: boolean;
  vote_count: number;
  user_voted: boolean;
  user_vote_emoji: string | null;
  vote_breakdown: Record<string, number>;
  created_at: string;
}

export interface ReelPost {
  id: number;
  user: number;
  username: string;
  avatar_url: string;
  match: number | null;
  match_details: {
    id: number;
    home_team: string;
    away_team: string;
    league: string;
    status: string;
    home_score: number | null;
    away_score: number | null;
  } | null;
  media_type: "IMAGE" | "VIDEO";
  media_url: string;
  thumbnail_url: string;
  caption: string;
  duration_seconds: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  user_liked: boolean;
  created_at: string;
}

export interface ReelComment {
  id: number;
  username: string;
  avatar_url: string;
  content: string;
  created_at: string;
}

export interface ReelFeedResponse {
  count: number;
  next_offset: number | null;
  results: ReelPost[];
}

interface UploadSignature {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
  resource_type?: "image" | "video";
}

export function getUploadSignature() {
  return apiClient<UploadSignature>("/mic/upload-signature/");
}

export { uploadVideoResilient } from "@/lib/cloudinary-upload";
export type { CloudinaryUploadResult } from "@/lib/cloudinary-upload";

export function createMicReaction(payload: {
  match: number;
  video_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  mood: string;
  team_side: string;
  bytes?: number;
}) {
  return apiClient<MicReaction>("/mic/", { method: "POST", body: JSON.stringify(payload) });
}

export function getMicReactions(matchId: number, teamSide?: string) {
  const q = teamSide ? `?team_side=${teamSide}` : "";
  return apiClient<MicReaction[]>(`/mic/${matchId}/${q}`, { skipAuth: true });
}

export function getMoodSummary(matchId: number) {
  return apiClient<{ total: number; breakdown: Record<string, number> }>(`/mic/${matchId}/mood-summary/`, { skipAuth: true });
}

export function canPost(matchId: number) {
  return apiClient<{ can_post: boolean; reason?: string }>(`/mic/${matchId}/can-post/`, { skipAuth: true });
}

export function voteOnReaction(reactionId: number, emoji: string) {
  return apiClient(`/mic/reactions/${reactionId}/vote/`, { method: "POST", body: JSON.stringify({ emoji }) });
}

export function getFanOfMatch(matchId: number) {
  return apiClient<MicReaction>(`/mic/${matchId}/fan-of-match/`, { skipAuth: true }).catch(() => null);
}

export function getActiveMicMatches() {
  return apiClient<{ match: Match; reaction_count: number }[]>("/mic/active-matches/", { skipAuth: true });
}

export function getUserMicReactions() {
  return apiClient<MicReaction[]>("/mic/my-reactions/");
}

export function deleteMicReaction(reactionId: number) {
  return apiClient(`/mic/reactions/${reactionId}/`, { method: "DELETE" });
}

export function getReels(limit = 12, offset = 0) {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return apiClient<ReelFeedResponse>(`/mic/reels/?${params}`, { skipAuth: true });
}

export function createReelPost(payload: {
  media_type: "IMAGE" | "VIDEO";
  media_url: string;
  thumbnail_url?: string;
  caption: string;
  duration_seconds?: number;
  match?: number | null;
}) {
  return apiClient<ReelPost>("/mic/reels/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function toggleReelLike(postId: number) {
  return apiClient<{ liked: boolean; likes_count: number }>(`/mic/reels/${postId}/like/`, {
    method: "POST",
  });
}

export function getReelComments(postId: number) {
  return apiClient<{ results: ReelComment[] }>(`/mic/reels/${postId}/comments/`, {
    skipAuth: true,
  });
}

export function addReelComment(postId: number, content: string) {
  return apiClient<ReelComment>(`/mic/reels/${postId}/comments/`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export function trackReelShare(postId: number, platform: "NATIVE" | "WHATSAPP" | "COPY" | "OTHER") {
  return apiClient<{ shares_count: number }>(`/mic/reels/${postId}/share/`, {
    method: "POST",
    body: JSON.stringify({ platform }),
  });
}

function inspectVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Imeshindikana kusoma muda wa video hii."));
    };
    video.src = url;
  });
}

export async function uploadReelMedia(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<{ media_type: "IMAGE" | "VIDEO"; media_url: string; duration_seconds: number; bytes: number }> {
  const isVideo = file.type.startsWith("video/");
  const isImage = file.type.startsWith("image/");
  if (!isVideo && !isImage) throw new Error("Chagua picha au video.");
  const maxBytes = (isVideo ? 50 : 20) * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`Faili limezidi ukubwa wa juu wa ${isVideo ? 50 : 20}MB.`);
  }

  let duration = 0;
  if (isVideo) {
    duration = await inspectVideoDuration(file);
    if (!Number.isFinite(duration) || duration < 1 || duration > 60) {
      throw new Error("Video lazima iwe kati ya sekunde 1 na 60.");
    }
  }

  const mediaType = isVideo ? "VIDEO" : "IMAGE";
  const signature = await apiClient<UploadSignature>(
    `/mic/reels/upload-signature/?media_type=${mediaType}`,
  );
  if (!signature) throw new Error("Ingia kwenye akaunti yako ili kupakia Reel.");

  if (isVideo) {
    const result = await uploadVideoResilient(file, signature, onProgress);
    return {
      media_type: mediaType,
      media_url: result.secure_url,
      duration_seconds: Math.round(result.duration || duration),
      bytes: result.bytes,
    };
  }

  const data = new FormData();
  data.append("file", file);
  data.append("api_key", signature.api_key);
  data.append("timestamp", String(signature.timestamp));
  data.append("signature", signature.signature);
  data.append("folder", signature.folder);
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloud_name}/image/upload`,
    { method: "POST", body: data },
  );
  const result = await response.json();
  if (!response.ok || !result.secure_url) {
    throw new Error(result.error?.message || "Imeshindikana kupakia picha. Jaribu tena.");
  }
  onProgress?.(100);
  return {
    media_type: mediaType,
    media_url: result.secure_url,
    duration_seconds: 0,
    bytes: result.bytes || file.size,
  };
}