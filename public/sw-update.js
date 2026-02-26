// Service Worker Update Handler
if ('serviceWorker' in navigator) {
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
                // New content is available, reload the page
                console.log('New content available, reloading...');
                window.location.reload();
              }
            }
          });
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
