import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
// import devtools from "solid-devtools/vite";

export default defineConfig({
  plugins: [
    /* 
    Uncomment the following line to enable solid-devtools.
    For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
    */
    // devtools({
    //   autoname: true,
    // }),
    solidPlugin(),
  ],
  server: {
    host: "127.0.0.1",
    port: 62025,
    fs: {
      strict: false,
    },
    proxy: {
      "/api": {
        target: "http://127.0.0.1:50052",
        changeOrigin: true,
      },
    },
  },
  build: {
    target: "esnext",
  },
});
