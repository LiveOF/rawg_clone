<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const auth = useAuthStore();
const displayName = ref("");
const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const submit = async () => {
  try {
    loading.value = true;
    error.value = "";
    await auth.register({
      displayName: displayName.value,
      email: email.value,
      password: password.value
    });
    router.push("/profile");
  } catch (err) {
    error.value = "Could not create an account. Check your details.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <section class="container">
    <div class="panel" style="max-width: 520px; margin: 0 auto;">
      <h2>Create account</h2>
      <p class="muted">Create a profile and save your favorite games.</p>
      <form class="form" @submit.prevent="submit">
        <input
          class="input"
          v-model="displayName"
          type="text"
          placeholder="Display name"
          required
        />
        <input class="input" v-model="email" type="email" placeholder="Email" required />
        <input
          class="input"
          v-model="password"
          type="password"
          placeholder="Password (at least 6 characters)"
          required
        />
        <div v-if="error" class="notice notice--error">{{ error }}</div>
        <button class="button" type="submit" :disabled="loading">Create account</button>
      </form>
    </div>
  </section>
</template>
