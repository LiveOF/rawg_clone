<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../api/client";
import GameCard from "../components/GameCard.vue";

const route = useRoute();
const router = useRouter();

const games = ref([]);
const totalPages = ref(1);
const loading = ref(false);
const error = ref("");
const page = ref(1);
const pageSize = ref(24);

const filters = reactive({
  search: "",
  platform: "all",
  category: "all",
  sortBy: "popularity"
});

const allowedPlatforms = ["all", "pc", "browser"];
const allowedSort = ["popularity", "release-date", "alphabetical", "relevance"];

const categories = [
  "mmorpg",
  "shooter",
  "strategy",
  "moba",
  "racing",
  "sports",
  "social",
  "sandbox",
  "open-world",
  "survival",
  "pvp",
  "pve",
  "pixel",
  "zombie",
  "turn-based",
  "first-person",
  "third-person",
  "top-down",
  "space",
  "fantasy",
  "sci-fi",
  "fighting",
  "action",
  "battle-royale"
];

const formatCategory = (value) =>
  value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const loadGames = async () => {
  try {
    loading.value = true;
    error.value = "";
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      sortBy: filters.sortBy
    };
    if (filters.platform !== "all") params.platform = filters.platform;
    if (filters.category !== "all") params.category = filters.category;
    if (filters.search) params.search = filters.search;

    const response = await api.get("/api/games", { params });
    games.value = response.data.items;
    totalPages.value = response.data.totalPages;
  } catch (err) {
    error.value = "Could not load the catalog. Please try again.";
  } finally {
    loading.value = false;
  }
};

const isSyncing = ref(false);
const isApplying = ref(false);

const buildQuery = () => {
  const query = {};
  if (filters.search) query.search = filters.search;
  if (filters.platform !== "all") query.platform = filters.platform;
  if (filters.category !== "all") query.category = filters.category;
  if (filters.sortBy !== "popularity") query.sortBy = filters.sortBy;
  if (page.value !== 1) query.page = String(page.value);
  return query;
};

const isSameQuery = (a, b) => {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => String(a[key]) === String(b[key]));
};

const updateRoute = () => {
  const nextQuery = buildQuery();
  if (isSameQuery(route.query, nextQuery)) return;
  isSyncing.value = true;
  router.replace({ query: nextQuery }).finally(() => {
    isSyncing.value = false;
  });
};

const applyQuery = (query) => {
  isApplying.value = true;
  const nextSearch = typeof query.search === "string" ? query.search : "";
  const nextPlatform =
    typeof query.platform === "string" && allowedPlatforms.includes(query.platform)
      ? query.platform
      : "all";
  const nextCategory =
    typeof query.category === "string" && categories.includes(query.category)
      ? query.category
      : "all";
  const nextSort =
    typeof query.sortBy === "string" && allowedSort.includes(query.sortBy)
      ? query.sortBy
      : "popularity";
  const nextPage = Math.max(parseInt(query.page, 10) || 1, 1);

  filters.search = nextSearch;
  filters.platform = nextPlatform;
  filters.category = nextCategory;
  filters.sortBy = nextSort;
  page.value = nextPage;
  isApplying.value = false;
};

const syncAndLoad = () => {
  updateRoute();
  loadGames();
};

const triggerRefresh = () => {
  if (page.value === 1) {
    syncAndLoad();
  } else {
    page.value = 1;
  }
};

let searchTimeout;
watch(
  () => filters.search,
  () => {
    if (isApplying.value) return;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      triggerRefresh();
    }, 350);
  }
);

watch(
  [() => filters.platform, () => filters.category, () => filters.sortBy],
  () => {
    if (isApplying.value) return;
    triggerRefresh();
  }
);

watch(page, () => {
  if (isApplying.value) return;
  syncAndLoad();
});

watch(
  () => route.query,
  (query) => {
    if (isSyncing.value) return;
    applyQuery(query);
    loadGames();
  }
);

onMounted(() => {
  applyQuery(route.query);
  loadGames();
});
</script>

<template>
  <section class="hero">
    <div class="container hero__inner">
      <div>
        <p class="eyebrow">Free-to-play hub</p>
        <h1>Orbit F2P</h1>
        <p class="muted">
          Curated F2P catalog with fast search, smart filters, and personal collections.
        </p>
      </div>
      <div class="hero__card">
        <h2>Build your library</h2>
        <p class="muted">
          Save favorites, track releases, and explore by genre and platform.
        </p>
      </div>
    </div>
  </section>

  <section class="container">
    <div class="filters">
      <input
        class="input"
        v-model="filters.search"
        type="text"
        placeholder="Search by title"
      />
      <select class="select" v-model="filters.platform">
        <option value="all">All platforms</option>
        <option value="pc">PC</option>
        <option value="browser">Browser</option>
      </select>
      <select class="select" v-model="filters.category">
        <option value="all">Genres</option>
        <option v-for="category in categories" :key="category" :value="category">
          {{ formatCategory(category) }}
        </option>
      </select>
      <select class="select" v-model="filters.sortBy">
        <option value="popularity">Popularity</option>
        <option value="release-date">Release date</option>
        <option value="alphabetical">Alphabetical</option>
        <option value="relevance">Relevance</option>
      </select>
    </div>

    <div v-if="error" class="notice notice--error">{{ error }}</div>
    <div v-if="loading" class="notice">Loading catalog...</div>

    <div v-else class="grid">
      <GameCard v-for="game in games" :key="game.id" :game="game" />
    </div>

    <div class="pagination">
      <button class="button button--ghost" :disabled="page === 1" @click="page--">
        Previous
      </button>
      <span class="muted">Page {{ page }} / {{ totalPages }}</span>
      <button
        class="button button--ghost"
        :disabled="page === totalPages"
        @click="page++"
      >
        Next
      </button>
    </div>
  </section>
</template>
