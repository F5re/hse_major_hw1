import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "."), "server-only": path.resolve(import.meta.dirname, "tests/server-only.ts") } },
  test: { environment: "node", exclude: ["e2e/**", "node_modules/**"], coverage: { reporter: ["text", "html"] } }
});
