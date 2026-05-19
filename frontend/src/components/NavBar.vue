<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const isAuth = computed(() => auth.isAuthenticated);

const logout = () => {
  auth.logout();
};
</script>

<template>
  <header class="nav">
    <div class="container nav__inner">
      <RouterLink class="brand" to="/">
        <span class="brand__dot" />
        Orbit F2P
      </RouterLink>
      <nav class="nav__links">
        <RouterLink to="/">Catalog</RouterLink>
        <RouterLink to="/discover">Discover</RouterLink>
        <RouterLink v-if="isAuth" to="/favorites">Saved</RouterLink>
        <RouterLink v-if="isAuth" to="/profile">Profile</RouterLink>
      </nav>
      <div class="nav__actions">
        <template v-if="!isAuth">
          <RouterLink class="button button--ghost" to="/login">Sign in</RouterLink>
          <RouterLink class="button" to="/register">Create account</RouterLink>
        </template>
        <template v-else>
          <span class="muted">{{ auth.user?.displayName }}</span>
          <button class="button button--ghost" type="button" @click="logout">Sign out</button>
        </template>
      </div>
    </div>
  </header>
</template>
