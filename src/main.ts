import { createApp } from "vue";
import { createPinia } from "pinia";

import "./assets/index.css";
import App from "./App.vue";
import router from "./router";
import { useAuthState } from "./store/authState";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);

// Initialize Auth State
const authState = useAuthState(pinia);
authState.initialize().then(async () => {
  await router.isReady();
  app.mount("#app");
});
