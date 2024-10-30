import { defineConfig } from 'vite';
import RubyPlugin from 'vite-plugin-ruby';

export default defineConfig({
  plugins: [RubyPlugin()],
  esbuild: {
    jsxInject: `import React from 'react'`, // Explicitly inject React in JSX files
  },
});
