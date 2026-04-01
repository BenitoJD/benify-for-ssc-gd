// Firebase Messaging Service Worker
// This file must be placed in the public directory and registered by the FCM service

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase (using same config as main app)
firebase.initializeApp({
  apiKey: 'demo-api-key',
  authDomain: 'demo-project.firebaseapp.com',
  projectId: 'demo-project',
  storageBucket: 'demo-project.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef',
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: payload.data?.tag || 'default',
    data: payload.data,
    vibrate: [100, 50, 100],
    requireInteraction: payload.data?.requireInteraction === 'true',
    actions: [
      { action: 'open', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click:', event);
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/dashboard';
  const requireInteraction = event.notification.data?.requireInteraction === 'true';

  if (requireInteraction) {
    // For high-priority notifications that require interaction
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        // Check if there's already a window open
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              data: event.notification.data,
            });
            return;
          }
        }
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  } else {
    // For silent push notifications, just update the app in background
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              data: event.notification.data,
            });
            return;
          }
        }
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});

// Handle push subscription change
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  if (!event.data) {
    console.log('No payload in push event');
    return;
  }

  const data = event.data.json();
  
  // Check if this is a silent push (no notification property)
  if (!data.notification) {
    console.log('Silent push received:', data);
    // Handle silent push - update app state without showing notification
    event.waitUntil(
      // Sync data in background
      self.registration.sync?.register('sync-notification-data').catch(() => {
        // Fallback if sync is not available
        console.log('Background sync not available');
      })
    );
  }
});
