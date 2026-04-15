import { defineConfig, loadEnv } from "vite";
import fs from "node:fs";
import react from "@vitejs/plugin-react";

function resolveHttpsConfig(env) {
  const enabled = env.VITE_DEV_HTTPS === "true";
  if (!enabled) return false;

  const keyPath = env.VITE_DEV_SSL_KEY || "";
  const certPath = env.VITE_DEV_SSL_CERT || "";

  if (keyPath && certPath && fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
  }

  return true;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const https = resolveHttpsConfig(env);

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: env.VITE_DEV_HOST || "127.0.0.1",
      https,
      hmr: env.VITE_HMR_HOST
        ? {
            host: env.VITE_HMR_HOST,
            protocol: https ? "wss" : "ws"
          }
        : undefined
    },
    preview: {
      port: 4173,
      host: env.VITE_DEV_HOST || "127.0.0.1",
      https
    },
    test: {
      environment: "jsdom",
      setupFiles: "./src/test/setup.js"
    }
  };
});
