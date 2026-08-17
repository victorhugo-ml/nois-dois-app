/**
 * Serviço de autenticação e sessão.
 *
 * Centraliza Firebase Auth e a política de usuários permitidos para que
 * componentes de interface não dependam diretamente do SDK.
 */
(function () {
  "use strict";

  function getFirebaseAuth() {
    return window.__fb && window.__fb.auth;
  }

  function getAllowedUsers() {
    return window.__ALLOWED_USERS || {};
  }

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function identityForEmail(email) {
    return getAllowedUsers()[normalizeEmail(email)] || null;
  }

  function authError(code, message) {
    var error = new Error(message);
    error.code = code;
    return error;
  }

  function requireAuth() {
    var auth = getFirebaseAuth();
    if (!auth) throw authError("auth/unavailable", "Auth indisponível");
    return auth;
  }

  function signIn(email, password) {
    var normalized = normalizeEmail(email);
    var identity = identityForEmail(normalized);

    if (!identity) {
      return Promise.reject(authError("auth/not-allowed", "Este email não tem acesso ao app"));
    }

    var auth;
    try { auth = requireAuth(); }
    catch (error) { return Promise.reject(error); }

    return auth.signInWithEmailAndPassword(normalized, password).then(function (credential) {
      return {
        credential: credential,
        user: credential.user,
        identity: identity
      };
    });
  }

  function sendPasswordReset(email) {
    var auth;
    try { auth = requireAuth(); }
    catch (error) { return Promise.reject(error); }
    return auth.sendPasswordResetEmail(normalizeEmail(email));
  }

  function observeSession(callback) {
    var auth;
    try { auth = requireAuth(); }
    catch (error) {
      callback({ user: null, identity: null, allowed: false, reason: "unavailable" });
      return function () {};
    }

    return auth.onAuthStateChanged(function (user) {
      if (!user) {
        callback({ user: null, identity: null, allowed: true, reason: null });
        return;
      }

      var identity = identityForEmail(user.email);
      callback({
        user: user,
        identity: identity,
        allowed: !!identity,
        reason: identity ? null : "not-allowed"
      });
    });
  }

  function signOut() {
    var auth;
    try { auth = requireAuth(); }
    catch (error) { return Promise.reject(error); }
    return auth.signOut();
  }

  function currentUser() {
    var auth = getFirebaseAuth();
    return (auth && auth.currentUser) || null;
  }

  function currentEmail() {
    var user = currentUser();
    return (user && user.email) || null;
  }

  function verifyCurrentPassword(password) {
    var email = currentEmail();
    if (!email) {
      return Promise.reject(authError("auth/no-current-user", "Sem usuário logado"));
    }

    var auth;
    try { auth = requireAuth(); }
    catch (error) { return Promise.reject(error); }

    return auth.signInWithEmailAndPassword(email, password);
  }

  function clearLocalSession() {
    try {
      localStorage.removeItem("myName");
      localStorage.removeItem("bio_enabled");
      localStorage.removeItem("bio_declined");

      var keys = [];
      for (var i = 0; i < localStorage.length; i += 1) {
        keys.push(localStorage.key(i));
      }
      keys.forEach(function (key) {
        if (key && key.indexOf("fcm_token_") === 0) localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn("[auth] Não foi possível limpar a sessão local.", error);
    }
  }

  window.__auth = Object.freeze({
    normalizeEmail: normalizeEmail,
    identityForEmail: identityForEmail,
    signIn: signIn,
    sendPasswordReset: sendPasswordReset,
    observeSession: observeSession,
    signOut: signOut,
    currentUser: currentUser,
    currentEmail: currentEmail,
    verifyCurrentPassword: verifyCurrentPassword,
    clearLocalSession: clearLocalSession
  });
})();
