import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./style.css";
import "@/lib/editor-settings";

createApp(App).use(router).mount("#app");
