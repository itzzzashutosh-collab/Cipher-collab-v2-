const LOCAL_STORAGE_KEY_YT_KEY = "ciphercollab_youtube_api_key_v1";

export function getStoredYouTubeKey(): string {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_YT_KEY);
    if (saved) return saved;
  } catch (err) {
    console.warn("Could not read YouTube key from localStorage:", err);
  }
  return (import.meta as any).env?.VITE_YOUTUBE_API_KEY || "";
}

export function saveStoredYouTubeKey(key: string): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_YT_KEY, key.trim());
  } catch (err) {
    console.error("Failed to save YouTube key to localStorage:", err);
  }
}

export async function testYouTubeKey(apiKey: string): Promise<{ success: boolean; message: string; channelSample?: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: "YouTube Data API key is required." };
  }

  try {
    // Quick probe search against YouTube Data API v3
    const res = await fetch(`/api/youtube/search?q=tech&maxResults=1`, {
      headers: {
        "x-youtube-key": apiKey.trim(),
      },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errData.error || `HTTP ${res.status}: Failed to authenticate key.`,
      };
    }

    const data = await res.json();
    if (data.source === "live_youtube_api") {
      return {
        success: true,
        message: "Google YouTube Data API v3 key verified and active!",
        channelSample: data.creators?.[0]?.name,
      };
    }

    return {
      success: true,
      message: "Key saved. Queries will route to Google YouTube API.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Network error validating YouTube API key.",
    };
  }
}
