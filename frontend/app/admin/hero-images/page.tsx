"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getHeroImageConfigs,
  updateHeroImageConfig,
  getHeroImageUploadSignature,
  uploadHeroImageToCloudinary,
  AdminHeroImageConfig,
} from "@/lib/api/admin";
import { BashiriButton } from "@/components/ui/Button";
import { Upload, ArrowLeft, RefreshCw } from "lucide-react";

const SLIDE_TYPE_LABELS: Record<string, string> = {
  top_pick: "Top Pick - Mechi ya Leo",
  derby: "Derby - Mechi Kubwa",
  track_record: "Track Record - Takwimu ya AI",
  pro: "PRO - Subscription Promotion",
  mic: "Fan of Match - MIC",
  did_you_know: "Did You Know - Facts",
};

export default function AdminHeroImagesPage() {
  const router = useRouter();
  const [configs, setConfigs] = useState<AdminHeroImageConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUloading] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const topPickRef = useRef<HTMLInputElement>(null);
  const derbyRef = useRef<HTMLInputElement>(null);
  const trackRecordRef = useRef<HTMLInputElement>(null);
  const proRef = useRef<HTMLInputElement>(null);
  const micRef = useRef<HTMLInputElement>(null);
  const didYouKnowRef = useRef<HTMLInputElement>(null);

  const fileInputRefs: Record<string, React.RefObject<HTMLInputElement | null>> = {
    top_pick: topPickRef,
    derby: derbyRef,
    track_record: trackRecordRef,
    pro: proRef,
    mic: micRef,
    did_you_know: didYouKnowRef,
  };

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getHeroImageConfigs();
      setConfigs(data);
    } catch (error) {
      console.error("Imeshindwa kupata hero images:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(slideType: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUloading((prev) => ({ ...prev, [slideType]: true }));
    try {
      const sig = await getHeroImageUploadSignature();
      const url = await uploadHeroImageToCloudinary(file, sig);
      
      // Update the config with new image URL
      await updateHeroImageConfig(slideType, { image_url: url });
      await load();
    } catch (error) {
      console.error("Imeshindwa kupakia picha:", error);
      alert("Imeshindwa kupakia picha. Tafadhali jaribu tena.");
    } finally {
      setUloading((prev) => ({ ...prev, [slideType]: false }));
    }
  }

  function triggerFileInput(slideType: string) {
    fileInputRefs[slideType]?.current?.click();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white/50">Inapakia...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} aria-label="Rudi nyuma">
            <ArrowLeft size={20} style={{ color: "rgba(255,255,255,0.6)" }} />
          </button>
          <h1 className="text-2xl font-black text-white">Picha za Hero Carousel</h1>
        </div>
        <BashiriButton size="md" onClick={load} loading={loading}>
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </BashiriButton>
      </div>

      <p className="text-xs mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
        Hizi ni picha za automatic slides (Top Pick, Derby, Track Record, PRO, Fan of Match, Did You Know).
        Admin anaweza kubadilisha picha hapa. Kama config haipo, system itatumia fallback images.
      </p>

      <div className="space-y-4">
        {Object.keys(SLIDE_TYPE_LABELS).map((slideType) => {
          const config = configs.find((c) => c.slide_type === slideType);
          const imageUrl = config?.image_url || "";
          const hasConfig = !!config;

          return (
            <div
              key={slideType}
              className="rounded-2xl overflow-hidden flex"
              style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="w-40 h-32 flex-shrink-0 relative">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={SLIDE_TYPE_LABELS[slideType]}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                    Hakuna Picha
                  </div>
                )}
                <div
                  className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: hasConfig ? "rgba(0,255,135,0.15)" : "rgba(255,71,87,0.15)",
                    color: hasConfig ? "#00FF87" : "#FF4757",
                  }}
                >
                  {hasConfig ? "Custom" : "Fallback"}
                </div>
              </div>

              <div className="flex-1 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-white">{SLIDE_TYPE_LABELS[slideType]}</p>
                  <p className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {slideType}
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    ref={(element) => {
                      const inputRef = fileInputRefs[slideType];
                      if (inputRef) inputRef.current = element;
                    }}
                    className="hidden"
                    onChange={(e) => handleFileUpload(slideType, e)}
                  />
                  <button
                    onClick={() => triggerFileInput(slideType)}
                    disabled={uploading[slideType]}
                    className="text-xs font-bold flex items-center gap-1 px-3 py-2 rounded-lg transition-all"
                    style={{
                      background: uploading[slideType] ? "#222" : "#151515",
                      border: "1px dashed rgba(255,255,255,0.15)",
                      color: uploading[slideType] ? "rgba(255,255,255,0.3)" : "#00FF87",
                    }}
                  >
                    {uploading[slideType] ? (
                      "Inapakia..."
                    ) : (
                      <>
                        <Upload size={12} />
                        Badilisha Picha
                      </>
                    )}
                  </button>

                  {imageUrl && (
                    <a
                      href={imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold px-3 py-2 rounded-lg"
                      style={{ color: "#3B82F6", textDecoration: "none" }}
                    >
                      Angalia Full
                    </a>
                  )}
                </div>

                {config?.updated_at && (
                  <p className="text-[10px] mt-2" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Updated: {new Date(config.updated_at).toLocaleDateString("sw-TZ")}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
