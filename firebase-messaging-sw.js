// Service Worker — Nós Dois
// Faz duas coisas:
//   1. Cache de app shell (offline + boot rápido)
//   2. Firebase Cloud Messaging (notificações em background)

// ───── 1. CACHE DE APP SHELL ────────────────────────────────────────────────

const CACHE_VERSION = 'nd-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function(cache) {
      return cache.addAll(APP_SHELL).catch(function() {});
    }).then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) {
        if (k !== CACHE_VERSION) return caches.delete(k);
      }));
    }).then(function() { return self.clients.claim(); })
  );
});

// Estratégia:
//   - HTML (navegação): network-first, cai pro cache se offline
//   - Estáticos (fonts, imagens, scripts): cache-first
//   - Firebase API / database: passa direto (sem cache)
self.addEventListener('fetch', function(event) {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Não interfere em requests do Firebase / Google APIs
  if (
    url.hostname.indexOf('firebaseio.com') !== -1 ||
    url.hostname.indexOf('firebasestorage.app') !== -1 ||
    url.hostname.indexOf('googleapis.com') !== -1 ||
    url.hostname.indexOf('gstatic.com') !== -1 ||
    url.hostname.indexOf('google.com') !== -1
  ) return;

  // HTML / navegação: network-first
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').indexOf('text/html') !== -1) {
    event.respondWith(
      fetch(req).then(function(res) {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then(function(c) { c.put(req, copy).catch(function(){}); });
        return res;
      }).catch(function() {
        return caches.match(req).then(function(c) { return c || caches.match('/index.html'); });
      })
    );
    return;
  }

  // Estáticos: cache-first
  event.respondWith(
    caches.match(req).then(function(cached) {
      if (cached) return cached;
      return fetch(req).then(function(res) {
        if (res && res.status === 200 && res.type !== 'opaque') {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(function(c) { c.put(req, copy).catch(function(){}); });
        }
        return res;
      }).catch(function() { return cached; });
    })
  );
});

// Permite forçar atualização via mensagem postMessage({type:'SKIP_WAITING'})
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// ───── 2. FIREBASE CLOUD MESSAGING ──────────────────────────────────────────

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

try {
  firebase.initializeApp({
    apiKey: 'YOUR_FIREBASE_API_KEY',
    authDomain: 'YOUR_PROJECT.firebaseapp.com',
    databaseURL: 'https://YOUR_PROJECT-default-rtdb.firebaseio.com',
    projectId: 'YOUR_PROJECT',
    storageBucket: 'YOUR_PROJECT.firebasestorage.app',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: '1:YOUR_MESSAGING_SENDER_ID:web:c0ba455ee5e67a71fef12e'
  });

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage(function(payload) {
    const data = payload.data || payload.notification || {};
    const title = data.title || 'Nós Dois 💕';
    const body  = data.body  || '';
    self.registration.showNotification(title, {
      body: body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: data.tag || 'nosdois',
      data: { url: data.url || '/' },
      vibrate: [80, 40, 80]
    });
  });
} catch(e) {}

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (let i = 0; i < list.length; i++) {
        const c = list[i];
        if (c.url.indexOf(url) !== -1 && 'focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
