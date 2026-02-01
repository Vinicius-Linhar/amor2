import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    define: {
      // Stringify the object once for injection, but note that the value itself 
      // is a JSON string in .env, so we need to be careful. 
      // If env.FIREBASE_CONFIG is '{"apiKey":...}', then JSON.stringify(env.FIREBASE_CONFIG)
      // becomes '"{\"apiKey\":...}"', which is what we want for the variable replacement.
      __firebase_config: JSON.stringify(env.FIREBASE_CONFIG || "{}"),
      __app_id: JSON.stringify("meu-projeto-amor"),
      __initial_auth_token: JSON.stringify("")
    }
  }
})
