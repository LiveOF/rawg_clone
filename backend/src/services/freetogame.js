const BASE_URL = "https://www.freetogame.com/api";
const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map();

const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`FreeToGame API error: ${response.status}`);
  }
  return response.json();
};

const getCached = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const setCached = (key, data) => {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
};

const getGames = async ({ platform, category, sortBy, search, page, pageSize }) => {
  const params = new URLSearchParams();
  if (platform) params.set("platform", platform);
  if (category) params.set("category", category);
  if (sortBy) params.set("sort-by", sortBy);

  const cacheKey = params.toString() || "all";
  let games = getCached(cacheKey);
  if (!games) {
    const url = `${BASE_URL}/games${params.toString() ? `?${params.toString()}` : ""}`;
    games = await fetchJson(url);
    setCached(cacheKey, games);
  }

  let filtered = games;
  if (search) {
    const needle = search.toLowerCase();
    filtered = games.filter((game) => game.title.toLowerCase().includes(needle));
  }

  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const safePageSize = Math.min(Math.max(parseInt(pageSize, 10) || 24, 1), 60);
  const total = filtered.length;
  const totalPages = Math.max(Math.ceil(total / safePageSize), 1);
  const start = (safePage - 1) * safePageSize;
  const items = filtered.slice(start, start + safePageSize);

  return {
    items,
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages
  };
};

const getGameById = async (id) => {
  const url = `${BASE_URL}/game?id=${id}`;
  return fetchJson(url);
};

module.exports = { getGames, getGameById };
