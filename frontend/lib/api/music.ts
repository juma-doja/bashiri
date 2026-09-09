import { apiClient } from "./client";

export interface MusicTrack {
  id: number;
  title: string;
  artist: string;
  genre: string;
  genre_label: string;
  audio_url: string;
  duration_seconds: number;
  file_size_bytes: number;
  owner: number;
  owner_name: string | null;
  created_at: string;
}

export interface MusicUploadSignature {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
  resource_type: "video";
  max_bytes: number;
}

export function getMusicUploadSignature() {
  return apiClient<MusicUploadSignature>("/music/upload-signature/");
}

export function getMyMusicTracks() {
  return apiClient<MusicTrack[]>("/music/tracks/");
}

export function createMusicTrack(payload: {
  title: string;
  artist: string;
  genre: string;
  audio_url: string;
  cloudinary_public_id: string;
  duration_seconds: number;
  file_size_bytes: number;
}) {
  return apiClient<MusicTrack>("/music/tracks/", { method: "POST", body: JSON.stringify(payload) });
}

export function deleteMusicTrack(trackId: number) {
  return apiClient(`/music/tracks/${trackId}/`, { method: "DELETE" });
}

export async function uploadMusicToCloudinary(file: File, signature: MusicUploadSignature) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signature.api_key);
  formData.append("timestamp", String(signature.timestamp));
  formData.append("signature", signature.signature);
  formData.append("folder", signature.folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloud_name}/video/upload`, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || `Imeshindwa kupakia wimbo (${response.status}).`);
  }
  return {
    audio_url: data.secure_url as string,
    cloudinary_public_id: data.public_id as string,
    duration_seconds: Math.round(Number(data.duration || 0)),
    file_size_bytes: Number(data.bytes || file.size),
  };
}
