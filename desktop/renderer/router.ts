import { createRouter, createWebHashHistory } from "vue-router";
import ImportSaveView from "@/views/ImportSaveView.vue";
import MainInterfaceView from "@/views/MainInterfaceView.vue";
import { hasLoadedSave } from "@/lib/app-state";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "import-save",
      component: ImportSaveView,
    },
    {
      path: "/editor",
      name: "editor",
      component: MainInterfaceView,
      beforeEnter: () => {
        if (!hasLoadedSave.value) {
          return "/";
        }
      },
    },
  ],
});

export default router;
