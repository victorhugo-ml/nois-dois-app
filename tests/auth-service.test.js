const assert = require("assert");

function createLocalStorage(seed) {
  const data = Object.assign({}, seed || {});
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    setItem(key, value) { data[key] = String(value); },
    removeItem(key) { delete data[key]; },
    key(index) { return Object.keys(data)[index] || null; },
    get length() { return Object.keys(data).length; },
    _data: data
  };
}

async function main() {
  let signInCalls = [];
  let resetCalls = [];
  let signOutCalls = 0;
  let authListener = null;

  const authMock = {
    currentUser: { email: "user1@example.com" },
    signInWithEmailAndPassword(email, password) {
      signInCalls.push([email, password]);
      return Promise.resolve({ user: { email } });
    },
    sendPasswordResetEmail(email) {
      resetCalls.push(email);
      return Promise.resolve();
    },
    onAuthStateChanged(callback) {
      authListener = callback;
      return function unsubscribe() {};
    },
    signOut() {
      signOutCalls += 1;
      return Promise.resolve();
    }
  };

  global.localStorage = createLocalStorage({
    myName: "user1",
    bio_enabled: "1",
    bio_declined: "1",
    fcm_token_user1: "token",
    unrelated: "keep-me"
  });

  global.window = {
    __ALLOWED_USERS: {
      "user1@example.com": "user1",
      "user2@example.com": "user2"
    },
    __fb: { auth: authMock }
  };

  require("../services/auth.js");

  assert.strictEqual(window.__auth.normalizeEmail("  USER1@EXAMPLE.COM "), "user1@example.com");
  assert.strictEqual(window.__auth.identityForEmail("USER1@example.com"), "user1");
  assert.strictEqual(window.__auth.identityForEmail("unknown@example.com"), null);

  const loginResult = await window.__auth.signIn(" USER1@example.com ", "password");
  assert.strictEqual(loginResult.identity, "user1");
  assert.strictEqual(loginResult.user.email, "user1@example.com");
  assert.deepStrictEqual(signInCalls[0], ["user1@example.com", "password"]);

  await assert.rejects(
    () => window.__auth.signIn("unknown@example.com", "password"),
    (error) => error && error.code === "auth/not-allowed"
  );

  await window.__auth.sendPasswordReset(" USER2@example.com ");
  assert.deepStrictEqual(resetCalls, ["user2@example.com"]);

  const sessions = [];
  const unsubscribe = window.__auth.observeSession((session) => sessions.push(session));
  authListener({ email: "user2@example.com" });
  authListener({ email: "outsider@example.com" });
  authListener(null);

  assert.strictEqual(sessions[0].identity, "user2");
  assert.strictEqual(sessions[0].allowed, true);
  assert.strictEqual(sessions[1].identity, null);
  assert.strictEqual(sessions[1].allowed, false);
  assert.strictEqual(sessions[2].user, null);
  assert.strictEqual(typeof unsubscribe, "function");

  assert.strictEqual(window.__auth.currentEmail(), "user1@example.com");
  await window.__auth.verifyCurrentPassword("secret");
  assert.deepStrictEqual(signInCalls[1], ["user1@example.com", "secret"]);

  await window.__auth.signOut();
  assert.strictEqual(signOutCalls, 1);

  window.__auth.clearLocalSession();
  assert.strictEqual(localStorage.getItem("myName"), null);
  assert.strictEqual(localStorage.getItem("bio_enabled"), null);
  assert.strictEqual(localStorage.getItem("bio_declined"), null);
  assert.strictEqual(localStorage.getItem("fcm_token_user1"), null);
  assert.strictEqual(localStorage.getItem("unrelated"), "keep-me");

  console.log("auth-service.test.js: OK");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
