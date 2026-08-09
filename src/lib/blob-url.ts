export function proxiedBlobUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith(".blob.vercel-storage.com")) {
      return `/api/download/blob?url=${encodeURIComponent(url)}`;
    }
  } catch {
    return url;
  }
  return url;
}
