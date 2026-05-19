<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const props = defineProps({
  game: { type: Object, required: true }
});

const auth = useAuthStore();
const router = useRouter();
const busy = ref(false);

const description = computed(
  () => props.game.short_description || props.game.shortDescription || ""
);

const isFavorite = computed(() => auth.favoriteIds.has(props.game.id || props.game.gameId));

const normalizeCategory = (value) => {
  if (!value) return null;
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
};

const similarCategory = computed(() => normalizeCategory(props.game.genre));

const toggleFavorite = async () => {
  if (!auth.isAuthenticated) {
    router.push("/login");
    return;
  }

  try {
    busy.value = true;
    const gameId = props.game.id || props.game.gameId;
    if (isFavorite.value) {
      await auth.removeFavorite(gameId);
    } else {
      await auth.addFavorite(gameId);
    }
  } finally {
    busy.value = false;
  }
};

const goToSimilar = () => {
  if (!similarCategory.value) return;
  router.push({
    name: "catalog",
    query: { category: similarCategory.value, sortBy: "relevance" }
  });
};

const goToDetails = () => {
  const id = props.game.id || props.game.gameId;
  router.push(`/games/${id}`);
};
</script>

<template>
  <div class="card-stack">
    <article
      class="card"
      role="button"
      tabindex="0"
      @click="goToDetails"
      @keydown.enter="goToDetails"
      @keydown.space.prevent="goToDetails"
    >
      <div class="card__media">
        <img :src="game.thumbnail" :alt="game.title" />
      </div>
      <div class="card__body">
        <div class="card__title-row">
          <h3>{{ game.title }}</h3>
          <span class="badge">{{ game.genre }}</span>
        </div>
        <p class="muted">{{ description }}</p>
        <div class="card__footer">
          <span class="muted">{{ game.platform }}</span>
          <button
            class="button button--tiny"
            type="button"
            :disabled="busy"
            @click.stop="toggleFavorite"
          >
            {{ isFavorite ? "Saved" : "Save" }}
          </button>
        </div>
      </div>
    </article>
    <div class="card-below">
      <button
        class="button button--ghost"
        type="button"
        :disabled="!similarCategory"
        @click.stop="goToSimilar"
      >
        More like this
      </button>
    </div>
  </div>
</template>
