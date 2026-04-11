const HN_BASE = "https://hacker-news.firebaseio.com/v0";

export interface NewsItem {
  id: number;
  title: string;
  url?: string;
  by: string;
  score: number;
  time: number;
  descendants?: number;
}

export async function fetchTopNews(limit = 12): Promise<NewsItem[]> {
  const idsRes = await fetch(`${HN_BASE}/topstories.json`);
  if (!idsRes.ok) throw new Error("Failed to fetch story ids");
  const ids: number[] = await idsRes.json();

  const top = ids.slice(0, limit);
  const items = await Promise.all(
    top.map(async (id) => {
      const r = await fetch(`${HN_BASE}/item/${id}.json`);
      return r.ok ? ((await r.json()) as NewsItem) : null;
    })
  );
  return items.filter((x): x is NewsItem => !!x && !!x.title);
}
