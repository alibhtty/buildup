// Cargar Workbox desde CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

if (workbox) {
  // Precarga archivos estáticos (manifest generado en build si usas Vite PWA o puedes dejarlo vacío)
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

  // Cache para JS y CSS (30 días)
  workbox.routing.registerRoute(
    /\.(?:js|css)$/,
    new workbox.strategies.CacheFirst({
      cacheName: 'js-css-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
        }),
      ],
    })
  );

  // Cache para imágenes (60 días)
  workbox.routing.registerRoute(
    /\.(?:png|jpg|jpeg|svg|gif)$/,
    new workbox.strategies.CacheFirst({
      cacheName: 'image-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 60 * 24 * 60 * 60, // 60 días
        }),
      ],
    })
  );

  // Cache para fuentes (90 días)
  workbox.routing.registerRoute(
    /\.(?:woff|woff2|ttf|eot)$/,
    new workbox.strategies.CacheFirst({
      cacheName: 'font-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 90 * 24 * 60 * 60, // 90 días
        }),
      ],
    })
  );

  // Instala inmediatamente
  self.addEventListener('install', (event) => {
    self.skipWaiting();
  });

  // Permitir actualización inmediata desde la app
  self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
      self.skipWaiting();
    }
  });
  
} else {
  console.error('Workbox no se cargó correctamente');
}
