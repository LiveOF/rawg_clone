<script setup>
import { computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { useAuthStore } from "../stores/auth";
import GameCard from "../components/GameCard.vue";

const auth = useAuthStore();

onMounted(() => {
  if (auth.isAuthenticated) {
    auth.fetchFavorites();
  }
});

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
    <h2>Saved games</h2>

    <div v-if="!auth.isAuthenticated" class="notice">
      To access saved games, please <RouterLink to="/login">sign in</RouterLink>.
    </div>

    <div v-else-if="favoritesAsGames.length === 0" class="notice">
      Nothing saved yet. Add games from the catalog.
    </div>

    <div v-else class="grid">
      <GameCard v-for="game in favoritesAsGames" :key="game.id" :game="game" />
    </div>
  </section>
</template>
