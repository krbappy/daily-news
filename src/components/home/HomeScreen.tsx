import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fetchTopNews, type NewsItem } from "../../api/news";
import { useAppStore } from "../../store/useAppStore";

function SkeletonCard() {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 animate-pulse">
      <div className="h-3 w-24 bg-white/10 rounded mb-3" />
      <div className="h-4 w-full bg-white/10 rounded mb-2" />
      <div className="h-4 w-4/5 bg-white/10 rounded" />
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const domain = item.url ? new URL(item.url).hostname.replace(/^www\./, "") : null;
  const when = formatDistanceToNow(new Date(item.time * 1000), {
    addSuffix: true,
  });

  const body = (
    <>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-zinc-500 mb-2">
        {domain && <span className="truncate max-w-[60%]">{domain}</span>}
        {domain && <span>·</span>}
        <span>{when}</span>
      </div>
      <h3 className="text-white text-[15px] font-semibold leading-snug mb-3 group-hover:text-accent-bright transition">
        {item.title}
      </h3>
      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
          </svg>
          {item.score}
        </span>
        <span>{item.descendants ?? 0} comments</span>
        <span className="truncate">by {item.by}</span>
      </div>
    </>
  );

  return item.url ? (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-accent/30 rounded-2xl p-5 transition"
    >
      {body}
    </a>
  ) : (
    <div className="group bg-white/[0.03] border border-white/5 rounded-2xl p-5">
      {body}
    </div>
  );
}

export default function HomeScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAppStore((s) => s.currentUser);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as { welcome?: boolean } | null;
    if (state?.welcome) {
      setToast(`Welcome back${currentUser ? `, ${currentUser.display_name || currentUser.username}` : ""}!`);
      window.history.replaceState({}, document.title);
      const id = window.setTimeout(() => setToast(null), 3500);
      return () => window.clearTimeout(id);
    }
  }, [location.state, currentUser]);

  useEffect(() => {
    let cancelled = false;
    fetchTopNews(12)
      .then((data) => !cancelled && setItems(data))
      .catch((e) => !cancelled && setError(e?.message ?? "Failed to load"));
    return () => {
      cancelled = true;
    };
  }, []);

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="min-h-[100dvh] bg-ink-950 text-white relative overflow-hidden">
      <div
        className="pointer-events-none absolute -top-40 -left-20 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-20 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-15"
        style={{ background: "radial-gradient(circle, #5b21b6, transparent)" }}
      />

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-message-in">
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-xl text-emerald-300 px-4 py-2.5 rounded-2xl shadow-xl shadow-emerald-500/10">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span className="text-sm font-medium">{toast}</span>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-20 bg-ink-950/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-full hover:bg-white/5 transition"
            aria-label="Open menu"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-white text-lg font-semibold leading-tight">
              Daily News
            </h1>
            <p className="text-xs text-zinc-500">{today}</p>
          </div>
        </div>
      </header>

      <main className="relative max-w-3xl mx-auto px-5 py-6 pb-24">
        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
            {error}
          </div>
        )}

        <div className="grid gap-3">
          {items === null && !error
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : items?.map((item) => <NewsCard key={item.id} item={item} />)}
        </div>

        <p className="text-[11px] text-zinc-600 text-center mt-8">
          Stories from Hacker News · refreshes on reload
        </p>
      </main>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="absolute top-0 left-0 bottom-0 w-72 max-w-[80vw] bg-ink-900 border-r border-white/10 p-6 flex flex-col gap-6 animate-message-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-white text-base font-semibold">Menu</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/5"
                aria-label="Close menu"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {isAuthenticated && currentUser ? (
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
                  style={{
                    backgroundColor: currentUser.avatar_color || "#7c3aed",
                  }}
                >
                  {(currentUser.display_name || currentUser.username || "?")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-white text-sm font-semibold truncate">
                    {currentUser.display_name || currentUser.username}
                  </div>
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Signed in
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  navigate("/login");
                }}
                className="w-full bg-gradient-to-br from-accent-bright to-accent-deep text-white font-semibold rounded-2xl py-3 shadow-lg shadow-accent/30 hover:shadow-accent/50 transition text-sm"
              >
                See Someone's News
              </button>
            )}

            <p className="text-xs text-zinc-500 leading-relaxed">
              {isAuthenticated
                ? "You're signed in. Enjoy the daily feed."
                : "A private view for returning readers. Sign in to continue where you left off."}
            </p>

            <div className="mt-auto text-[11px] text-zinc-600">
              v0.1 · Daily News
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
