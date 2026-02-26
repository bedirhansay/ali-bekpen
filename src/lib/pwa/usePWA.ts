import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface UseUpdateSWReturn {
  needRefresh: boolean;
  offlineReady: boolean;
  updateServiceWorker: () => Promise<void>;
}

export function useUpdateSW(): UseUpdateSWReturn {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration: ServiceWorkerRegistration | undefined) {
      console.log('SW Registered: ', registration);

      // Check for updates periodically
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute
      }
    },
    onRegisterError(error: any) {
      console.log('SW registration error', error);
    },
    onNeedRefresh() {
      console.log('SW needs refresh');
      setNeedRefresh(true);

      // Custom notification will be handled by App.tsx using the needRefresh flag
    },
    onOfflineReady() {
      console.log('SW offline ready');
      setOfflineReady(true);

      toast.success('Uygulama çevrimdışı kullanıma hazır!', {
        duration: 5000,
        position: 'bottom-right',
      });
    },
  });

  return {
    needRefresh,
    offlineReady,
    updateServiceWorker: async () => {
      await updateServiceWorker(true);
      setNeedRefresh(false);
    },
  };
}

// Online/Offline status hook
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('İnternet bağlantısı geri geldi!', {
        duration: 3000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast('İnternet bağlantısı kesildi!', {
        icon: '⚠️',
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// PWA Install Prompt Hook
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);

      toast.success('Uygulama başarıyla yüklendi!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptToInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  return {
    showInstallPrompt,
    promptToInstall,
  };
}
