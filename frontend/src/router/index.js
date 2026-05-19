import { createRouter, createWebHistory } from "vue-router";
import CatalogView from "../views/CatalogView.vue";
import DiscoverView from "../views/DiscoverView.vue";
import GameView from "../views/GameView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import ProfileView from "../views/ProfileView.vue";
import FavoritesView from "../views/FavoritesView.vue";

const routes = [
  { path: "/", name: "catalog", component: CatalogView },
  { path: "/discover", name: "discover", component: DiscoverView },
  { path: "/games/:id", name: "game", component: GameView, props: true },
  { path: "/login", name: "login", component: LoginView },
  { path: "/register", name: "register", component: RegisterView },
  { path: "/profile", name: "profile", component: ProfileView },
  { path: "/favorites", name: "favorites", component: FavoritesView }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;
