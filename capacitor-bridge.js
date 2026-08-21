// Bridge entre o app e os plugins Capacitor.
// Carregado em todas as plataformas. No browser, vira um conjunto de no-ops com
// fallbacks web razoáveis (vibration API, file input, etc).
// No APK, conecta os plugins nativos.

(function() {
  var Cap = window.Capacitor;
  var isNative = Cap && typeof Cap.isNativePlatform === 'function' && Cap.isNativePlatform();

  function noop() {}
  function asyncNoop() { return Promise.resolve(); }
  function asyncFalse() { return Promise.resolve(false); }

  // ────────── Estado padrão (web fallback) ─────────────────────────
  window.__native = {
    isNative: false,
    platform: (Cap && Cap.getPlatform && Cap.getPlatform()) || 'web',

    // Haptics
    haptic: function(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch(e) {} },
    haptic_impact: function(style) {
      try { navigator.vibrate && navigator.vibrate(style === 'heavy' ? 30 : style === 'medium' ? 18 : 10); } catch(e) {}
    },
    haptic_notification: function(type) {
      var p = type === 'error' ? [40, 60, 40] : type === 'warning' ? [25, 50, 25] : [20];
      try { navigator.vibrate && navigator.vibrate(p); } catch(e) {}
    },

    // Status bar / splash
    setStatusBarStyle: noop,
    hideSplash: function() {
      var s = document.getElementById('splash');
      if (s) { s.classList.add('hide'); setTimeout(function() { s.style.display = 'none'; }, 300); }
    },

    // App lifecycle
    onAppStateChange: function(_cb) { return function() {}; },
    exitApp: noop,

    // Push notifications
    requestPushPermission: asyncNoop,
    onPushReceived: function(_cb) { return function() {}; },

    // Câmera (fallback: aciona um <input type="file"> que o chamador deve criar)
    takePhoto: function(_opts) {
      // Promise rejeitada — o chamador cai no input file convencional
      return Promise.reject(new Error('camera-not-native'));
    },
    pickPhoto: function() { return Promise.reject(new Error('gallery-not-native')); },

    // Biometria (fallback: não disponível no web)
    biometricAvailable: asyncFalse,
    biometricSaveCredentials: asyncNoop,
    biometricGetCredentials: function() { return Promise.reject(new Error('biometric-not-available')); },
    biometricDeleteCredentials: asyncNoop,

    // Compartilhar
    share: function(opts) {
      if (navigator.share) return navigator.share(opts || {});
      return Promise.reject(new Error('share-not-supported'));
    }
  };

  if (!isNative) return;

  var P = Cap.Plugins || {};
  window.__native.isNative = true;

  // ────────── Haptics nativo ───────────────────────────────────────
  if (P.Haptics) {
    window.__native.haptic = function(ms) {
      // qualquer chamada vira impact light, mais natural
      P.Haptics.impact({ style: 'LIGHT' }).catch(function(){});
    };
    window.__native.haptic_impact = function(style) {
      var s = (style || 'light').toUpperCase();
      P.Haptics.impact({ style: s }).catch(function(){});
    };
    window.__native.haptic_notification = function(type) {
      var t = (type || 'success').toUpperCase();
      P.Haptics.notification({ type: t }).catch(function(){});
    };
  }

  // ────────── Status bar ───────────────────────────────────────────
  if (P.StatusBar) {
    window.__native.setStatusBarStyle = function(style) {
      P.StatusBar.setStyle({ style: (style || 'DARK').toUpperCase() }).catch(function(){});
    };
    P.StatusBar.setOverlaysWebView({ overlay: false }).catch(function(){});
    P.StatusBar.setBackgroundColor({ color: '#0d0408' }).catch(function(){});
  }

  // ────────── Splash ───────────────────────────────────────────────
  if (P.SplashScreen) {
    window.__native.hideSplash = function() {
      P.SplashScreen.hide({ fadeOutDuration: 300 }).catch(function(){});
      var s = document.getElementById('splash');
      if (s) s.style.display = 'none';
    };
  }

  // ────────── App lifecycle ────────────────────────────────────────
  if (P.App) {
    window.__native.onAppStateChange = function(cb) {
      var sub = P.App.addListener('appStateChange', function(s) { cb && cb(!!s.isActive); });
      return function() { try { sub.remove(); } catch(e) {} };
    };
    P.App.addListener('backButton', function() {
      window.dispatchEvent(new Event('nd:backbutton'));
    });
    window.__native.exitApp = function() { try { P.App.exitApp(); } catch(e) {} };
  }

  // ────────── Push Notifications ───────────────────────────────────
  if (P.PushNotifications) {
    // Cria canal Android (necessário pra som customizado)
    try {
      P.PushNotifications.createChannel({
        id: 'nosdois_default',
        name: 'Nós Dois',
        description: 'Notificações entre vocês',
        importance: 4,
        visibility: 1,
        sound: 'notification.wav',
        vibration: true,
        lights: true,
        lightColor: '#e8836a'
      }).catch(function(){});
    } catch(e) {}

    window.__native.requestPushPermission = function() {
      return P.PushNotifications.requestPermissions().then(function(r) {
        if (r.receive === 'granted') return P.PushNotifications.register();
      });
    };

    window.__native.onPushReceived = function(cb) {
      var s1 = P.PushNotifications.addListener('pushNotificationReceived', function(n) { cb && cb(n); });
      var s2 = P.PushNotifications.addListener('registration', function(t) {
        try {
          var name = (localStorage.getItem('myName') || '').toLowerCase();
          if (name && window.__fb && window.__fb.db) {
            window.__fb.db.ref('fcm_tokens/' + name).set(t.value);
            localStorage.setItem('fcm_token_' + name, t.value);
          }
        } catch(e) {}
      });
      var s3 = P.PushNotifications.addListener('registrationError', function(e) {
        console.warn('[push] registrationError', e);
      });
      return function() { try { s1.remove(); s2.remove(); s3.remove(); } catch(e) {} };
    };
  }

  // ────────── Câmera nativa ────────────────────────────────────────
  if (P.Camera) {
    window.__native.takePhoto = function(opts) {
      opts = opts || {};
      return P.Camera.getPhoto({
        quality: opts.quality != null ? opts.quality : 80,
        allowEditing: false,
        resultType: 'dataUrl',     // retorna data:image/jpeg;base64,...
        source: 'CAMERA',
        saveToGallery: false,
        width: opts.width || 1200,
        correctOrientation: true
      }).then(function(p) { return p.dataUrl; });
    };
    window.__native.pickPhoto = function(opts) {
      opts = opts || {};
      return P.Camera.getPhoto({
        quality: opts.quality != null ? opts.quality : 80,
        allowEditing: false,
        resultType: 'dataUrl',
        source: 'PHOTOS',
        width: opts.width || 1200,
        correctOrientation: true
      }).then(function(p) { return p.dataUrl; });
    };
  }

  // ────────── Biometria ────────────────────────────────────────────
  // Plugin: @capgo/capacitor-native-biometric.
  // As credenciais ficam protegidas por biometria no Keychain/Keystore. O valor 1
  // corresponde a AccessControl.BIOMETRY_CURRENT_SET e invalida as credenciais
  // quando o conjunto de biometrias cadastradas no dispositivo muda.
  var Bio = P.NativeBiometric;
  var BIO_SERVER = 'com.nosdois.app';
  var BIO_ACCESS_CONTROL_CURRENT_SET = 1;

  if (Bio) {
    window.__native.biometricAvailable = function() {
      return Bio.isAvailable().then(function(r) { return !!(r && r.isAvailable); }).catch(function() { return false; });
    };
    window.__native.biometricSaveCredentials = function(email, password) {
      return Bio.setCredentials({
        username: email,
        password: password,
        server: BIO_SERVER,
        accessControl: BIO_ACCESS_CONTROL_CURRENT_SET,
        authValidityDuration: 0,
        title: 'Proteger acesso ao Nós Dois',
        negativeButtonText: 'Cancelar'
      });
    };
    window.__native.biometricGetCredentials = function(reason) {
      return Bio.getSecureCredentials({
        server: BIO_SERVER,
        reason: reason || 'Entrar no Nós Dois',
        title: 'Nós Dois 💕',
        subtitle: 'Toca o sensor pra entrar',
        description: '',
        negativeButtonText: 'Cancelar'
      });
    };
    window.__native.biometricDeleteCredentials = function() {
      return Bio.deleteCredentials({ server: BIO_SERVER }).catch(function(){});
    };
  }

  // ────────── Compartilhar ─────────────────────────────────────────
  if (P.Share) {
    window.__native.share = function(opts) {
      return P.Share.share({
        title: opts.title || 'Nós Dois',
        text: opts.text || '',
        url: opts.url,
        dialogTitle: opts.dialogTitle || 'Compartilhar'
      });
    };
  }

  // Esconde HTML splash após plugins carregarem
  setTimeout(window.__native.hideSplash, 600);
})();
