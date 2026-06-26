import { useEffect, useState } from "react";
import { searchGifs, trendingGifs, type GiphyGif } from "../../api/giphy";

export default function GifPicker({
  onSelect,
}: {
  onSelect: (url: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Trending by default; debounced search as the user types. Cancelled flag
  // avoids a slow earlier request overwriting a newer one.
  useEffect(() => {
    let cancelled = false;
    const q = query.trim();
    setLoading(true);
    setError(false);

    const handle = setTimeout(
      async () => {
        try {
          const data = q ? await searchGifs(q) : await trendingGifs();
          if (!cancelled) setGifs(data);
        } catch {
          if (!cancelled) setError(true);
        } finally {
          if (!cancelled) setLoading(false);
        }
      },
      q ? 350 : 0
    );

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query]);

  return (
    <div className="px-2 pt-2">
      <div className="bg-ink-800 rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search GIFs"
            autoComplete="off"
            autoFocus
            className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent/50 transition"
          />
        </div>

        <div
          className="h-72 overflow-y-auto px-2 pb-2 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {error ? (
            <div className="h-full flex items-center justify-center text-sm text-zinc-500">
              Couldn't load GIFs
            </div>
          ) : loading ? (
            <div className="h-full flex items-center justify-center text-sm text-zinc-500">
              Loading…
            </div>
          ) : gifs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-zinc-500">
              No GIFs found
            </div>
          ) : (
            <div className="columns-2 gap-2">
              {gifs.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => onSelect(g.sendUrl)}
                  className="mb-2 block w-full overflow-hidden rounded-lg bg-ink-700 hover:opacity-80 transition"
                >
                  <img
                    src={g.previewUrl}
                    alt={g.title}
                    loading="lazy"
                    className="w-full block"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-3 py-1.5 text-[10px] text-zinc-500 text-right border-t border-white/5">
          Powered by GIPHY
        </div>
      </div>
    </div>
  );
}
