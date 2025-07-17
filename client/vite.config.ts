import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'PassportPal',
        short_name: 'PassportPal',
        start_url: '.',
        display: 'standalone',
        background_color: '#10b981',
        theme_color: '#10b981',
        icons: [
          {
            src: '/brand_images/Kpicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: '/brand_images/Kpicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
    }),
  ],
}); 