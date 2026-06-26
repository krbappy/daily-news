import { GiphyFetch } from "@giphy/js-fetch-api";
import type { IGif } from "@giphy/js-types";

const API_KEY = import.meta.env.VITE_GIPHY_API_KEY as string;

const gf = new GiphyFetch(API_KEY);

const LIMIT = 24;
const RATING = "pg-13";

export interface GiphyGif {
  id: string;
  title: string;
  previewUrl: string; // lightweight rendition for the picker grid
  sendUrl: string; // full-quality rendition stored on the message
}

function toGif(g: IGif): GiphyGif {
  return {
    id: String(g.id),
    title: g.title || "GIF",
    previewUrl: g.images.fixed_width.url,
    sendUrl: g.images.downsized_medium?.url ?? g.images.original.url,
  };
}

export async function trendingGifs(): Promise<GiphyGif[]> {
  const { data } = await gf.trending({ limit: LIMIT, rating: RATING });
  return data.map(toGif);
}

export async function searchGifs(query: string): Promise<GiphyGif[]> {
  const { data } = await gf.search(query, { limit: LIMIT, rating: RATING });
  return data.map(toGif);
}
