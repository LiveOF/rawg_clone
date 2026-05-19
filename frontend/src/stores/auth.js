import { defineStore } from "pinia";
import api from "../api/client";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token"),
    user: null,
    favorites: [],
    error: null
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    favoriteIds: (state) => new Set(state.favorites.map((fav) => fav.gameId))
  },
  actions: {
    async init() {
      if (!this.token) return;
      try {
        await this.fetchMe();
        await this.fetchFavorites();
      } catch (error) {
        this.logout();
      }
    },
    async register(payload) {
      this.error = null;
      const response = await api.post("/api/auth/register", payload);
      this.token = response.data.token;
      localStorage.setItem("token", this.token);
      this.user = response.data.user;
      await this.fetchFavorites();
    },
    async login(payload) {
      this.error = null;
      const response = await api.post("/api/auth/login", payload);
      this.token = response.data.token;
      localStorage.setItem("token", this.token);
      this.user = response.data.user;
      await this.fetchFavorites();
    },
    async fetchMe() {
      if (!this.token) return;
      const response = await api.get("/api/auth/me");
      this.user = response.data.user;
    },
    async fetchFavorites() {
      if (!this.token) {
        this.favorites = [];
        return;
      }
      const response = await api.get("/api/favorites");
      this.favorites = response.data.favorites;
    },
    async addFavorite(gameId) {
      if (!this.token) {
        throw new Error("AUTH_REQUIRED");
      }
      const response = await api.post("/api/favorites", { gameId });
      this.favorites = response.data.favorites;
    },
    async removeFavorite(gameId) {
      if (!this.token) {
        throw new Error("AUTH_REQUIRED");
      }
      const response = await api.delete(`/api/favorites/${gameId}`);
      this.favorites = response.data.favorites;
    },
    logout() {
      this.token = null;
      this.user = null;
      this.favorites = [];
      localStorage.removeItem("token");
    }
  }
});
