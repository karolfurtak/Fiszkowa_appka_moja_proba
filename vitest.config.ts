import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/pages/api/**/*.ts"],
      exclude: ["node_modules", "tests"],
    },
    testTimeout: 10000,
    env: {
      OPENROUTER_API_KEY: "test-openrouter-key",
      PUBLIC_SUPABASE_URL: "http://localhost:54321",
      PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "import.meta.env.OPENROUTER_API_KEY": JSON.stringify("test-openrouter-key"),
    "import.meta.env.PUBLIC_SUPABASE_URL": JSON.stringify("http://localhost:54321"),
    "import.meta.env.PUBLIC_SUPABASE_ANON_KEY": JSON.stringify("test-anon-key"),
  },
});
