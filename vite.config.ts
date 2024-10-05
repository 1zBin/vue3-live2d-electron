import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [vue()],
  server: {
    port: 47281,
    cors: true, // 允许跨域
    hmr: true, // 开启热更新
  },
});
