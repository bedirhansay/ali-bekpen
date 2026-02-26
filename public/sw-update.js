// Service Worker — only register in production builds.
// In development (localhost), SW is skipped so Vite HMR works correctly.
if ('serviceWorker' in navigator && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);

        // Check for updates every 30 seconds
        setInterval(() => {
          registration.update();
        }, 30000);

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          console.log('New service worker found, updating...');
          const newWorker = registration.installing;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('New content available, reloading...');
                window.location.reload();
              }
            }
          });
        });
      })
      .catch((err) => {
        console.log('SW registration failed: ', err);
      });
  });
}
