import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globals: true,
    server: {
      deps: {
        // Allow next/server to be processed by vite (handles missing .js extensions)
        inline: ["next", "next-auth"],
      },
    },
  },
});
