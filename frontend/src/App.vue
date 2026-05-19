<script setup>
import { onMounted } from "vue";
import { RouterView } from "vue-router";
import NavBar from "./components/NavBar.vue";
import { useAuthStore } from "./stores/auth";

const auth = useAuthStore();

onMounted(() => {
  auth.init();
});
</script>

<template>
  <div class="app">
    <NavBar />
    <main class="main">
      <RouterView />
    </main>
    <footer class="footer">
      <div class="container">Orbit F2P</div>
    </footer>
  </div>
</template>
