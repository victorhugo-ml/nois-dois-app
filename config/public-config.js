/**
 * Configuração pública de portfólio.
 *
 * Esta cópia usa apenas placeholders e contas fictícias.
 * A configuração real deve permanecer somente no ambiente privado de deploy.
 */
(function () {
  "use strict";

  var config = {
    allowedUsers: {
      "user1@example.com": "user1",
      "user2@example.com": "user2"
    },

    firebase: {
      apiKey: "YOUR_FIREBASE_API_KEY",
      authDomain: "YOUR_PROJECT.firebaseapp.com",
      databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
      projectId: "YOUR_PROJECT",
      storageBucket: "YOUR_PROJECT.firebasestorage.app",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_FIREBASE_APP_ID"
    },

    vapidKey: "YOUR_PUBLIC_VAPID_KEY"
  };

  window.__APP_CONFIG = Object.freeze(config);

  // Mantém o contrato já utilizado pelo app.js sem exigir uma grande
  // reescrita nesta primeira etapa da refatoração.
  window.__ALLOWED_USERS = config.allowedUsers;
})();
