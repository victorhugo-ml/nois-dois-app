/**
 * Camada de integração com Firebase.
 *
 * Responsabilidade:
 * - inicializar Firebase;
 * - expor os adaptadores já consumidos pelo app.js;
 * - configurar persistência da autenticação;
 * - encapsular Firebase Cloud Messaging.
 *
 * Esta extração mantém window.__fb e window.__fcm para preservar
 * compatibilidade com o restante do app durante a refatoração incremental.
 */
(function () {
  "use strict";

  try {
    if (!window.__APP_CONFIG) {
      throw new Error("Configuração pública não carregada.");
    }

    if (typeof firebase === "undefined") {
      throw new Error("Firebase SDK não carregado.");
    }

    var cfg = window.__APP_CONFIG.firebase;
    var vapidKey = window.__APP_CONFIG.vapidKey;

    firebase.initializeApp(cfg);

    var db = firebase.database();
    var storage = firebase.storage();
    var auth = firebase.auth();

    try {
      auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    } catch (error) {
      console.warn("[firebase] Não foi possível configurar persistência.", error);
    }

    var messaging = null;
    try {
      messaging = firebase.messaging();
    } catch (error) {
      console.warn("[firebase] Cloud Messaging indisponível neste ambiente.", error);
    }

    window.__fcm = {
      vapid: vapidKey,
      msg: messaging,

      getToken: function (callback) {
        if (!messaging) {
          callback(null);
          return;
        }

        messaging
          .getToken({ vapidKey: vapidKey })
          .then(function (token) {
            callback(token || null);
          })
          .catch(function () {
            callback(null);
          });
      },

      saveToken: function (token, name) {
        if (!token || !name) return;

        var updates = {};
        updates["fcm_tokens/" + name.toLowerCase()] = token;

        try {
          db.ref().update(updates);
        } catch (error) {
          console.warn("[firebase] Não foi possível salvar o token FCM.", error);
        }
      }
    };

    window.__fb = {
      db: db,
      auth: auth,

      ref: function (database, path) {
        return database.ref(path);
      },

      onValue: function (reference, callback) {
        var handler = function (snapshot) {
          callback(snapshot);
        };

        reference.on("value", handler);

        return function () {
          reference.off("value", handler);
        };
      },

      set: function (reference, value) {
        return reference.set(value);
      },

      push: function (reference, value) {
        return reference.push(value);
      },

      remove: function (reference) {
        return reference.remove();
      },

      update: function (reference, value) {
        return reference.update(value);
      },

      get: function (reference) {
        return reference.once("value");
      },

      upload: function (path, dataUrl, onDone, onError) {
        try {
          var reference = storage.ref(path);
          var commaIndex = dataUrl.indexOf(",");
          var mime = dataUrl.substring(5, dataUrl.indexOf(";"));
          var base64 = dataUrl.substring(commaIndex + 1);

          reference
            .putString(base64, "base64", { contentType: mime })
            .then(function (snapshot) {
              snapshot.ref
                .getDownloadURL()
                .then(function (url) {
                  onDone(url);
                })
                .catch(onError);
            })
            .catch(onError);
        } catch (error) {
          onError(error);
        }
      }
    };
  } catch (error) {
    console.error("[firebase]", error);
  }
})();
