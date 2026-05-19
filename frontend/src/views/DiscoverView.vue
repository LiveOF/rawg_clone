<script setup>
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import api from "../api/client";
import GameCard from "../components/GameCard.vue";

const popular = ref([]);
const latest = ref([]);
const browser = ref([]);
const error = ref("");
const loading = ref(false);

const genres = [
  "mmorpg",
  "shooter",
  "strategy",
  "moba",
  "racing",
  "sports",
  "survival",
  "open-world",
  "battle-royale",
  "fantasy",
  "sci-fi"
];

const formatCategory = (value) =>
  value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const loadDiscover = async () => {
  try {
    loading.value = true;
    error.value = "";
    const [popularRes, latestRes, browserRes] = await Promise.all([
      api.get("/api/games", { params: { sortBy: "popularity", pageSize: 6 } }),
      api.get("/api/games", { params: { sortBy: "release-date", pageSize: 6 } }),
      api.get("/api/games", {
        params: { platform: "browser", sortBy: "popularity", pageSize: 6 }
      })
    ]);
    popular.value = popularRes.data.items;
    latest.value = latestRes.data.items;
    browser.value = browserRes.data.items;
  } catch (err) {
    error.value = "Could not load discovery sections.";
  } finally {
    loading.value = false;
  }
};

onMounted(loadDiscover);
</script>

<template>
  <section class="container hero">
    <div class="hero__inner">
      <div>
        <p class="eyebrow">Discover new worlds</p>
        <h1>Explore the F2P universe</h1>
        <p class="muted">
          Handpicked sections, curated genres, and quick access to the best free-to-play
          games.
        </p>
      </div>
      <div class="hero__card">
        <h2>Quick genre jumps</h2>
        <div class="chips">
          <RouterLink
            v-for="genre in genres"
            :key="genre"
            class="chip"
            :to="{ name: 'catalog', query: { category: genre } }"
          >
            {{ formatCategory(genre) }}
          </RouterLink>
        </div>
      </div>
    </div>
  </section>

  <section class="container">
    <div v-if="error" class="notice notice--error">{{ error }}</div>
    <div v-else-if="loading" class="notice">Loading discovery...</div>

    <div v-else>
      <div class="section">
        <div class="section__header">
          <h2 class="section__title">Popular now</h2>
          <RouterLink class="button button--ghost" :to="{ name: 'catalog' }">
            View all
          </RouterLink>
        </div>
        <div class="grid">
          <GameCard v-for="game in popular" :key="game.id" :game="game" />
        </div>
      </div>

      <div class="section">
        <div class="section__header">
          <h2 class="section__title">New releases</h2>
          <RouterLink
            class="button button--ghost"
            :to="{ name: 'catalog', query: { sortBy: 'release-date' } }"
          >
            View all
          </RouterLink>
        </div>
        <div class="grid">
          <GameCard v-for="game in latest" :key="game.id" :game="game" />
        </div>
      </div>

      <div class="section">
        <div class="section__header">
          <h2 class="section__title">Browser picks</h2>
          <RouterLink
            class="button button--ghost"
            :to="{ name: 'catalog', query: { platform: 'browser' } }"
          >
            View all
          </RouterLink>
        </div>
        <div class="grid">
          <GameCard v-for="game in browser" :key="game.id" :game="game" />
        </div>
      </div>
    </div>
  </section>
</template>
