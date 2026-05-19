<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const auth = useAuthStore();
const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const submit = async () => {
  try {
    loading.value = true;
    error.value = "";
    await auth.login({ email: email.value, password: password.value });
    router.push("/profile");
  } catch (err) {
    error.value = "Invalid email or password.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <section class="container">
    <div class="panel" style="max-width: 480px; margin: 0 auto;">
      <h2>Sign in</h2>
      <p class="muted">Access your saved library.</p>
      <form class="form" @submit.prevent="submit">
        <input class="input" v-model="email" type="email" placeholder="Email" required />
        <input
          class="input"
          v-model="password"
          type="password"
          placeholder="Password"
          required
        />
        <div v-if="error" class="notice notice--error">{{ error }}</div>
        <button class="button" type="submit" :disabled="loading">Sign in</button>
      </form>
    </div>
  </section>
</template>
