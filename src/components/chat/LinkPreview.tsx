import { useEffect, useState } from "react";
import { isFacebookUrl, facebookEmbedSrc } from "../../lib/linkDetection";
import { fetchLinkPreview, type LinkPreview as Preview } from "../../api/linkPreview";

interface Props {
  url: string;
}

export default function LinkPreview({ url }: Props) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(true);
  const [iframeFailed, setIframeFailed] = useState(false);

  const isFacebook = isFacebookUrl(url);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchLinkPreview(url).then((p) => {
      if (!cancelled) {
        setPreview(p);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (loading) {
    return <div className="mt-2 h-20 rounded-xl bg-white/5 animate-pulse" />;
  }

  // Facebook: use canonical URL from the resolved preview (handles share shortlinks)
  if (isFacebook && !iframeFailed) {
    const embedTarget = preview?.resolvedUrl || url;
    const w = preview?.videoWidth ?? preview?.imageWidth ?? null;
    const h = preview?.videoHeight ?? preview?.imageHeight ?? null;
    // Fall back to 9:16 (reels) only when we truly have nothing.
    const ratio = w && h ? `${w} / ${h}` : "9 / 16";
    const isPortrait = w && h ? h > w : true;
    // Cap portrait clips by height (so width shrinks) and landscape by width (natural).
    const boxStyle: React.CSSProperties = isPortrait
      ? { aspectRatio: ratio, height: "min(60vh, 480px)", maxWidth: "100%" }
      : { aspectRatio: ratio, width: "100%" };
    return (
      <div className="mt-2 rounded-xl overflow-hidden bg-black/30 border border-white/10 flex justify-center">
        <div className="relative" style={boxStyle}>
          <iframe
            src={facebookEmbedSrc(embedTarget)}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            scrolling="no"
            frameBorder="0"
            onError={() => setIframeFailed(true)}
          />
        </div>
      </div>
    );
  }

  if (!preview || (!preview.title && !preview.image)) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 block rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:bg-white/10 transition"
    >
      {preview.image && (
        <img
          src={preview.image}
          alt=""
          className="w-full max-h-60 object-cover"
          loading="lazy"
        />
      )}
      <div className="px-3 py-2">
        {preview.siteName && (
          <div className="text-[10px] uppercase tracking-wide text-white/50">
            {preview.siteName}
          </div>
        )}
        {preview.title && (
          <div className="text-sm font-medium text-white line-clamp-2">
            {preview.title}
          </div>
        )}
        {preview.description && (
          <div className="text-xs text-white/60 line-clamp-2 mt-0.5">
            {preview.description}
          </div>
        )}
      </div>
    </a>
  );
}
