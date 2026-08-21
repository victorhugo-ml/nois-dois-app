const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const calls = [];
const forbiddenCalls = [];
const credentials = { username: "user@example.com", password: "test-password" };

const biometricPlugin = {
  isAvailable: async () => ({ isAvailable: true }),
  setCredentials: async (options) => {
    calls.push({ method: "setCredentials", options });
  },
  getSecureCredentials: async (options) => {
    calls.push({ method: "getSecureCredentials", options });
    return credentials;
  },
  deleteCredentials: async (options) => {
    calls.push({ method: "deleteCredentials", options });
  },
  verifyIdentity: async () => {
    forbiddenCalls.push("verifyIdentity");
  },
  getCredentials: async () => {
    forbiddenCalls.push("getCredentials");
    return credentials;
  }
};

const context = {
  window: {
    Capacitor: {
      isNativePlatform: () => true,
      getPlatform: () => "android",
      Plugins: { NativeBiometric: biometricPlugin }
    }
  },
  navigator: {},
  document: { getElementById: () => null },
  setTimeout: () => 0,
  console,
  Promise
};

vm.runInNewContext(
  fs.readFileSync(path.resolve(__dirname, "..", "capacitor-bridge.js"), "utf8"),
  context,
  { filename: "capacitor-bridge.js" }
);

(async () => {
  assert.strictEqual(await context.window.__native.biometricAvailable(), true);

  await context.window.__native.biometricSaveCredentials(credentials.username, credentials.password);
  const save = calls.find((call) => call.method === "setCredentials");
  assert.ok(save, "setCredentials deve ser chamado");
  assert.strictEqual(save.options.accessControl, 1, "deve usar BIOMETRY_CURRENT_SET");
  assert.strictEqual(save.options.authValidityDuration, 0, "deve exigir biometria em cada leitura");

  const result = await context.window.__native.biometricGetCredentials("Entrar com biometria");
  assert.deepStrictEqual(result, credentials);
  const read = calls.find((call) => call.method === "getSecureCredentials");
  assert.ok(read, "getSecureCredentials deve ser chamado");
  assert.strictEqual(read.options.server, "com.nosdois.app");
  assert.deepStrictEqual(forbiddenCalls, [], "o fluxo legado inseguro não pode ser usado");

  await context.window.__native.biometricDeleteCredentials();
  assert.ok(calls.some((call) => call.method === "deleteCredentials"));

  console.log("capacitor-biometric.test.js: OK");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
