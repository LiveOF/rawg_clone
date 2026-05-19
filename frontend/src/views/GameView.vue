<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../api/client";
import { useAuthStore } from "../stores/auth";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const game = ref(null);
const loading = ref(false);
const error = ref("");
const busy = ref(false);

const loadGame = async () => {
  try {
    loading.value = true;
    error.value = "";
    const response = await api.get(`/api/games/${route.params.id}`);
    game.value = response.data;
  } catch (err) {
    error.value = "Could not load the game.";
  } finally {
    loading.value = false;
  }
};

const toggleFavorite = async () => {
  if (!auth.isAuthenticated) {
    router.push("/login");
    return;
  }

  try {
    busy.value = true;
    if (auth.favoriteIds.has(game.value.id)) {
      await auth.removeFavorite(game.value.id);
    } else {
      await auth.addFavorite(game.value.id);
    }
  } finally {
    busy.value = false;
  }
};

watch(
  () => route.params.id,
  () => {
    loadGame();
  }
);

onMounted(loadGame);
</script>

<template>
  <section class="container" v-if="game">
    <div class="split">
      <div>
        <img class="panel" :src="game.thumbnail" :alt="game.title" />
      </div>
      <div class="panel">
        <p class="eyebrow">{{ game.genre }}</p>
        <h1>{{ game.title }}</h1>
        <p class="muted">{{ game.short_description }}</p>
        <div class="notice">
          <p class="muted">Platform: {{ game.platform }}</p>
          <p class="muted">Publisher: {{ game.publisher }}</p>
          <p class="muted">Developer: {{ game.developer }}</p>
          <p class="muted">Release: {{ game.release_date }}</p>
        </div>
        <div class="detail-actions">
          <button class="button" :disabled="busy" @click="toggleFavorite">
            {{ auth.favoriteIds.has(game.id) ? "Remove from saved" : "Save to library" }}
          </button>
          <a
            class="button button--ghost"
            :href="game.game_url"
            target="_blank"
            rel="noreferrer"
          >
            Official page
          </a>
        </div>
      </div>
    </div>

    <section class="section" v-if="game.description">
      <div class="panel">
        <h2 class="section__title">About this game</h2>
        <p class="muted">{{ game.description }}</p>
      </div>
    </section>

    <section class="section" v-if="game.minimum_system_requirements">
      <div class="panel">
        <h2 class="section__title">Minimum system requirements</h2>
        <div class="notice">
          <p class="muted">OS: {{ game.minimum_system_requirements.os }}</p>
          <p class="muted">Processor: {{ game.minimum_system_requirements.processor }}</p>
          <p class="muted">Memory: {{ game.minimum_system_requirements.memory }}</p>
          <p class="muted">Graphics: {{ game.minimum_system_requirements.graphics }}</p>
          <p class="muted">Storage: {{ game.minimum_system_requirements.storage }}</p>
        </div>
      </div>
    </section>

    <section class="section" v-if="game.screenshots && game.screenshots.length">
      <div class="panel">
        <h2 class="section__title">Screenshots</h2>
        <div class="gallery">
          <img v-for="shot in game.screenshots" :key="shot.id" :src="shot.image" />
        </div>
      </div>
    </section>
  </section>

  <section class="container" v-else>
    <div v-if="error" class="notice notice--error">{{ error }}</div>
    <div v-else class="notice">Loading...</div>
  </section>
</template>
