import { TMDBMovie } from "@/types";

const BASE = "https://api.themoviedb.org/3";

function apiKey() {
  return process.env.TMDB_API_KEY ?? "";
}

export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

interface TMDBSearchResult {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string;
  backdrop_path?: string;
  genre_ids?: number[];
  vote_average?: number;
  overview?: string;
}

interface TMDBDetailResult {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genres: { id: number; name: string }[];
  runtime: number | null;
  vote_average: number;
  credits: {
    cast: { name: string; character: string; order: number }[];
    crew: { name: string; job: string }[];
  };
}

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function searchMovie(
  title: string,
  year?: number
): Promise<TMDBMovie | null> {
  const key = apiKey();
  if (!key) return null;

  async function search(withYear: boolean) {
    const params = new URLSearchParams({
      api_key: key,
      query: title,
      language: "en-US",
      page: "1",
    });
    if (withYear && year) params.set("year", String(year));
    let res = await fetch(`${BASE}/search/movie?${params}`);
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 1000));
      res = await fetch(`${BASE}/search/movie?${params}`);
    }
    if (!res.ok) return null;
    const data = (await res.json()) as { results: TMDBSearchResult[] };
    return data.results?.length ? data.results : null;
  }

  const normalizedInput = normalize(title);

  let results = year ? await search(true) : null;
  if (!results?.length) results = await search(false);
  if (!results?.length) return null;

  const match =
    results.find((r) => normalize(r.title) === normalizedInput) ?? results[0];

  return fetchMovieDetails(match.id);
}

export async function fetchMovieDetails(id: number): Promise<TMDBMovie | null> {
  const key = apiKey();
  if (!key) return null;

  const params = new URLSearchParams({
    api_key: key,
    append_to_response: "credits",
    language: "en-US",
  });

  const res = await fetch(`${BASE}/movie/${id}?${params}`);
  if (!res.ok) return null;

  const d = (await res.json()) as TMDBDetailResult;

  const director =
    d.credits?.crew?.find((c) => c.job === "Director")?.name ?? null;
  const cast = (d.credits?.cast ?? [])
    .sort((a, b) => a.order - b.order)
    .slice(0, 5)
    .map((c) => ({ name: c.name, character: c.character }));

  return {
    id: d.id,
    title: d.title,
    overview: d.overview,
    releaseDate: d.release_date,
    posterPath: d.poster_path,
    backdropPath: d.backdrop_path,
    genres: d.genres ?? [],
    runtime: d.runtime ?? null,
    voteAverage: d.vote_average,
    cast,
    director,
  };
}
