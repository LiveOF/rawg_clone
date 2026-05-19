<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { useAuthStore } from "../stores/auth";
import GameCard from "../components/GameCard.vue";
import api from "../api/client";

const auth = useAuthStore();
const recommendations = ref([]);
const recLoading = ref(false);
const recError = ref("");

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

const normalizeCategory = (value) => {
  if (!value) return null;
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
};

const pickTopCategories = () => {
  const counts = new Map();
  auth.favorites.forEach((fav) => {
    const normalized = normalizeCategory(fav.genre);
    if (!normalized || !categories.includes(normalized)) return;
    counts.set(normalized, (counts.get(normalized) || 0) + 1);
  });
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key)
    .slice(0, 3);
};

const loadRecommendations = async () => {
  if (!auth.isAuthenticated || auth.favorites.length === 0) {
    recommendations.value = [];
    return;
  }

  const topCategories = pickTopCategories();
  if (topCategories.length === 0) {
    recommendations.value = [];
    return;
  }

  try {
    recLoading.value = true;
    recError.value = "";
    const savedIds = new Set(auth.favorites.map((fav) => fav.gameId));
    const responses = await Promise.all(
      topCategories.map((category) =>
        api.get("/api/games", {
          params: { category, sortBy: "popularity", pageSize: 6 }
        })
      )
    );
    const seen = new Set();
    const pool = [];
    responses.forEach((response) => {
      response.data.items.forEach((game) => {
        if (savedIds.has(game.id) || seen.has(game.id)) return;
        seen.add(game.id);
        pool.push(game);
      });
    });
    recommendations.value = pool.slice(0, 6);
  } catch (err) {
    recError.value = "Could not load recommendations.";
  } finally {
    recLoading.value = false;
  }
};

onMounted(() => {
  if (!auth.isAuthenticated) return;
  auth.fetchFavorites().then(() => loadRecommendations());
});

watch(
  () => auth.favorites.map((fav) => fav.gameId).join(","),
  () => {
    if (auth.isAuthenticated) {
      loadRecommendations();
    }
  }
);

const favoritesAsGames = computed(() =>
  auth.favorites.map((fav) => ({
    id: fav.gameId,
    title: fav.title,
    thumbnail: fav.thumbnail,
    short_description: fav.shortDescription,
    genre: fav.genre,
    platform: fav.platform
  }))
);
</script>

<template>
  <section class="container">
    <div v-if="!auth.isAuthenticated" class="panel">
      <h2>Profile</h2>
      <p class="muted">Sign in to manage your collection.</p>
      <RouterLink class="button" to="/login">Sign in</RouterLink>
    </div>

    <div v-else>
      <div class="panel" style="margin-bottom: 24px;">
        <h2>{{ auth.user?.displayName }}</h2>
        <p class="muted">{{ auth.user?.email }}</p>
        <p class="muted">Saved games: {{ auth.favorites.length }}</p>
      </div>

      <h2>Saved games</h2>
      <div v-if="favoritesAsGames.length === 0" class="notice">
        Nothing saved yet. Add games from the catalog.
      </div>
      <div v-else class="grid">
        <GameCard v-for="game in favoritesAsGames" :key="game.id" :game="game" />
      </div>

      <section class="section">
        <div class="section__header">
          <h2 class="section__title">May be interesting for you</h2>
        </div>
        <div v-if="recError" class="notice notice--error">{{ recError }}</div>
        <div v-else-if="recLoading" class="notice">Loading recommendations...</div>
        <div v-else-if="recommendations.length === 0" class="notice">
          Save a few games to unlock recommendations.
        </div>
        <div v-else class="grid">
          <GameCard v-for="game in recommendations" :key="game.id" :game="game" />
        </div>
      </section>
    </div>
  </section>
</template>
