import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "http://localhost:50052/api/openapi.json",
  output: "./src/client",
  plugins: ["@hey-api/client-fetch"],
  experimentalParser: false, // https://github.com/hey-api/openapi-ts/issues/1561
});
