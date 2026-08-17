/* ── POLYFILLS (Android WebView compat) ─────────────────────────── */
if (!Array.from) {
    Array.from = function(arrayLike, mapFn) {
        var arr = [];
        var len = arrayLike.length !== undefined ? arrayLike.length : 0;
        for (var i = 0; i < len; i++) {
            arr.push(mapFn ? mapFn(arrayLike[i], i) : arrayLike[i]);
        }
        return arr;
    };
}
if (!Array.isArray) {
    Array.isArray = function(a) { return Object.prototype.toString.call(a) === '[object Array]'; };
}
if (!Object.assign) {
    Object.assign = function(target) {
        for (var i = 1; i < arguments.length; i++) {
            var src = arguments[i];
            if (!src) continue;
            for (var k in src) { if (Object.prototype.hasOwnProperty.call(src, k)) target[k] = src[k]; }
        }
        return target;
    };
}
if (!Object.entries) {
    Object.entries = function(obj) {
        var arr = [];
        for (var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) arr.push([k, obj[k]]); }
        return arr;
    };
}
if (!Object.values) {
    Object.values = function(obj) {
        var arr = [];
        for (var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) arr.push(obj[k]); }
        return arr;
    };
}
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(s) { return this.indexOf(s) === 0; };
}
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(s) { return this.slice(-s.length) === s; };
}
if (!String.prototype.includes) {
    String.prototype.includes = function(s) { return this.indexOf(s) !== -1; };
}
if (!Array.prototype.includes) {
    Array.prototype.includes = function(v) { return this.indexOf(v) !== -1; };
}
if (!String.prototype.padStart) {
    String.prototype.padStart = function(n, ch) {
        var s = String(this);
        if (!ch) ch = ' ';
        while (s.length < n) s = ch + s;
        return s;
    };
}
if (!String.prototype.padEnd) {
    String.prototype.padEnd = function(n, ch) {
        var s = String(this);
        if (!ch) ch = ' ';
        while (s.length < n) s = s + ch;
        return s;
    };
}
/* ── END POLYFILLS ──────────────────────────────────────────────── */

/* NOS-DOIS v4.0 - SettingsContext fix */

var useState    = React.useState;
var useEffect   = React.useEffect;
var useRef      = React.useRef;
var useMemo     = React.useMemo;
/* ── CONSTANTS ──────────────────────────────────────────────────────── */
var MN = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
var WD = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
var WF = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
var CEV = { compromisso: { e: '📅', c: '#c97b5a' }, lazer: { e: '🎉', c: 'var(--sage)' }, saude: { e: '🏥', c: 'var(--sky)' }, viagem: { e: '✈️', c: 'var(--gold)' }, aniversario: { e: '🎂', c: 'var(--rose)' }, outro: { e: '📌', c: 'var(--purple)' } };
var CG = { alimentacao: { e: '🍔', c: '#c97b5a', bg: 'rgba(201,123,90,.15)' }, transporte: { e: '🚗', c: 'var(--sky)', bg: 'rgba(123,163,196,.15)' }, lazer: { e: '🎬', c: 'var(--sage)', bg: 'rgba(138,171,142,.15)' }, saude: { e: '💊', c: 'var(--sky)', bg: 'rgba(123,163,196,.15)' }, moradia: { e: '🏠', c: 'var(--gold)', bg: 'rgba(201,168,76,.15)' }, compras: { e: '🛍️', c: 'var(--rose)', bg: 'rgba(232,121,170,.15)' }, viagem: { e: '✈️', c: 'var(--gold)', bg: 'rgba(201,168,76,.15)' }, outro: { e: '📦', c: 'var(--purple)', bg: 'rgba(154,138,171,.15)' } };
function getMyName() { return (localStorage.getItem('myName') || 'user1').toLowerCase(); }
// Retorna o nome do parceiro em lowercase (pra usar em notificações)
function getPartnerName() {
    try {
        var s = JSON.parse(localStorage.getItem('nd2_settings') || '{}');
        var me = getMyName();
        var nm = (s.myName || '').toLowerCase();
        var pn = (s.partnerName || '').toLowerCase();
        if (!nm || !pn) return me === 'user1' ? 'user2' : 'user1';
        return me === nm ? pn : nm;
    } catch(e) { return getMyName() === 'user1' ? 'user2' : 'user1'; }
}
// Manda notificação push pro parceiro
function notifyPartner(type, title, body) {
    try {
        var p = getPartnerName();
        if (window._sendNotif && p) window._sendNotif(p, type, { title: title, body: body });
    } catch(e) {}
}
// Pega foto via câmera/galeria nativa (APK) ou fallback pro file input (web).
// Retorna Promise de dataUrl. Se cancelado, rejeita.
// opts: { source: 'camera'|'gallery'|'ask', width: 1200 }
function pickPhotoUnified(opts) {
    opts = opts || {};
    return new Promise(function(resolve, reject) {
        var native = window.__native && window.__native.isNative;
        if (native) {
            var src = opts.source;
            if (!src || src === 'ask') {
                src = confirm('Tirar foto agora?\n(Cancelar = escolher da galeria)') ? 'camera' : 'gallery';
            }
            var fn = src === 'camera' ? window.__native.takePhoto : window.__native.pickPhoto;
            fn({ width: opts.width || 1200, quality: opts.quality || 82 })
                .then(resolve).catch(reject);
            return;
        }
        // Web: cria input file temporário
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        if (opts.source === 'camera') input.capture = 'environment';
        input.style.display = 'none';
        input.addEventListener('change', function() {
            var f = input.files && input.files[0];
            if (!f) { reject(new Error('canceled')); return; }
            var r = new FileReader();
            r.onload = function(e) { resolve(e.target.result); };
            r.onerror = function() { reject(new Error('read-failed')); };
            r.readAsDataURL(f);
        });
        document.body.appendChild(input);
        input.click();
        setTimeout(function() { try { document.body.removeChild(input); } catch(e) {} }, 60000);
    });
}
function _getS() { try { var s = localStorage.getItem('nd2_settings'); return s ? JSON.parse(s) : {}; } catch(e) { return {}; } }
var MOODS = [{ e: '😊', l: 'Feliz' }, { e: '🥰', l: 'Amoroso' }, { e: '😌', l: 'Em paz' }, { e: '😔', l: 'Saudade' }, { e: '😤', l: 'Cansado' }, { e: '😂', l: 'Animado' }, { e: '🤒', l: 'Mal' }, { e: '😴', l: 'Sonolento' }, { e: '🔥', l: 'Empolgado' }, { e: '🫶', l: 'Grato' }]
var MOODS_F = { '🥰': 'Amorosa', '😤': 'Cansada', '😂': 'Animada', '😴': 'Sonolenta', '🔥': 'Empolgada', '🫶': 'Grata' };
var MOODS_PREP = { '😔': 'com ', '😌': '' };;
var REACTS = [{ e: '❤️', l: 'Amor' }, { e: '😘', l: 'Beijo' }, { e: '🥺', l: 'Saudade' }, { e: '🔥', l: 'Paixão' }, { e: '🫂', l: 'Abraço' }, { e: '✨', l: 'Orgulho' }];
var SHOP_CATS = ['🛒 Mercado', '💊 Farmácia', '🧹 Limpeza', '🍕 Delivery', '👗 Roupas', '📦 Outro'];
var WISHLIST_CATS = ['🍽️ Restaurante', '🎬 Cinema/Show', '✈️ Viagem', '🏠 Casa', '🛍️ Compra', '🎮 Lazer', '❓ Outro'];
var DESAFIOS = [
    { e: '💌', t: 'Escrevam uma carta de amor um para o outro — sem celular, no papel.', tag: 'Romance' },
    { e: '🍳', t: 'Cozinhem juntos uma receita nova esta semana.', tag: 'Dia a dia' },
    { e: '🌅', t: 'Acordem cedo e assistam o nascer do sol juntos.', tag: 'Aventura' },
    { e: '📵', t: 'Passem um dia inteiro sem redes sociais, só vocês dois.', tag: 'Conexão' },
    { e: '🎲', t: 'Joguem um jogo de tabuleiro ou cartas por 1 hora.', tag: 'Diversão' },
    { e: '📸', t: 'Tirem 10 fotos um do outro no mesmo lugar — caprichem!', tag: 'Memória' },
    { e: '🎵', t: 'Cada um escolhe 5 músicas e montam uma playlist juntos.', tag: 'Música' },
    { e: '🚶', t: 'Deem uma caminhada de 30min sem destino — só conversando.', tag: 'Conexão' },
    { e: '🍦', t: 'Experimentem um sorvete ou sobremesa que nunca comeram.', tag: 'Aventura' },
    { e: '💆', t: 'Se massageiem por 10 minutos cada — relaxem juntos.', tag: 'Romance' },
    { e: '⭐', t: 'Contem 3 qualidades um do outro que mais admiram.', tag: 'Amor' },
    { e: '🎨', t: 'Desenhem um retrato um do outro — sem olhar o papel!', tag: 'Diversão' },
    { e: '🎬', t: 'Assistam um filme que nenhum dos dois conhece — escolham aleatório.', tag: 'Diversão' },
    { e: '📝', t: 'Cada um escreve 5 planos para o próximo mês juntos.', tag: 'Conexão' },
    { e: '🌃', t: 'Saiam para jantar num lugar novo que nunca foram.', tag: 'Aventura' },
    { e: '🎤', t: 'Cantem uma música juntos — seja no karaokê ou em casa!', tag: 'Diversão' },
    { e: '💐', t: 'Um surpreende o outro com um mimo sem motivo especial.', tag: 'Romance' },
    { e: '🧩', t: 'Montem um quebra-cabeça juntos até o final.', tag: 'Conexão' },
    { e: '☕', t: 'Preparem o café da manhã especial um para o outro.', tag: 'Dia a dia' },
    { e: '🌊', t: 'Assistam ao pôr do sol juntos — sem pressa, sem celular.', tag: 'Momento' },
];
var FRASES_CASAL = [
    { e: '💌', t: 'O amor não precisa de razão. Vocês dois são a razão um do outro.', tag: 'Amor' },
    { e: '🌹', t: 'Cada dia com você é um capítulo favorito de uma história linda.', tag: 'Gratidão' },
    { e: '✨', t: 'Nas pequenas coisas — um abraço, um olhar — mora a grandeza do amor.', tag: 'Momento' },
    { e: '🫶', t: 'Amar é escolher todos os dias. E eu te escolho.', tag: 'Escolha' },
    { e: '🌙', t: 'Que bom que encontrei você para dividir o cotidiano e os sonhos.', tag: 'Parceiro/a' },
    { e: '💫', t: 'O melhor lugar do mundo é perto de você.', tag: 'Presença' },
    { e: '🌸', t: 'Você é o lar que eu carrego no coração.', tag: 'Lar' },
    { e: '🔥', t: 'Juntos somos mais fortes, mais felizes, mais inteiros.', tag: 'Juntos' },
    { e: '🎶', t: 'Nossa história ainda está sendo escrita — e eu amo cada linha.', tag: 'Jornada' },
    { e: '🤍', t: 'O segredo do amor é a atenção. Estou aqui, presente, só pra você.', tag: 'Presença' },
    { e: '🌊', t: 'Com você aprendi que o amor não é uma chegada, é uma viagem.', tag: 'Amor' },
    { e: '🦋', t: 'Você me faz querer ser a melhor versão de mim mesmo/a.', tag: 'Crescimento' },
    { e: '☕', t: 'Os melhores dias começam e terminam com você.', tag: 'Cotidiano' },
    { e: '🌟', t: 'Não existe distância quando o coração já encontrou seu lugar.', tag: 'Conexão' },
];
/* ── UTILS ──────────────────────────────────────────────────────────── */
function mk(d) { var m = d.getMonth() + 1; return d.getFullYear() + '-' + (m < 10 ? '0' + m : '' + m); }
function dk(d) { var m = d.getMonth() + 1; var dy = d.getDate(); return d.getFullYear() + '-' + (m < 10 ? '0' + m : '' + m) + '-' + (dy < 10 ? '0' + dy : '' + dy); }
var fR = function(v) { return 'R$\u202f' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
// Brasília = UTC-3: converte new Date() para o dia correto em BRT
function _brt(d) {
    var off = -3 * 60; // BRT offset em minutos
    var utc = d.getTime() + d.getTimezoneOffset() * 60000;
    return new Date(utc + off * 60000);
}
function td() { var t = _brt(new Date()); t.setHours(0, 0, 0, 0); return t; }
// Scroll-to-focused input para Android WebView
document.addEventListener('focusin', function(e) {
    var el = e.target;
    if (!el) return;
    var tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        setTimeout(function() { try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch(x){} }, 380);
    }
});
// Prevenir scroll do body no overlay escuro do modal
document.addEventListener('touchmove', function(e) {
    var mo = e.target.closest ? e.target.closest('.mo') : null;
    var md = e.target.closest ? e.target.closest('.md') : null;
    if (mo && !md) { e.preventDefault(); }
}, { passive: false });
function vib(ms) {
    try {
        if (window.__native && window.__native.isNative) {
            window.__native.haptic(ms);
        } else if (navigator.vibrate) {
            navigator.vibrate(ms);
        }
    } catch(e) {}
}
var dif = function(a, b) { return Math.floor((b - a) / (864e5)); };
var _tt;
function toast(msg, d, undoCb) {
    if (d === undefined) d = 2200;
    if (undoCb === undefined) undoCb = null;
    var el     = document.getElementById('toast');
    var msgEl  = document.getElementById('toast-msg');
    var undoEl = document.getElementById('toast-undo');
    if (msgEl) msgEl.textContent = msg; else el.textContent = msg;
    if (undoEl) {
        undoEl.style.display = undoCb ? 'inline-block' : 'none';
        undoEl.onclick = undoCb ? function() { undoCb(); el.classList.remove('show'); } : null;
    }
    el.style.pointerEvents = undoCb ? 'auto' : 'none';
    el.classList.add('show');
    clearTimeout(_tt);
    _tt = setTimeout(function() { el.classList.remove('show'); }, d);
}
var _rt;
function showReactToast(emoji, name, photo) {
    var el = document.getElementById('react-toast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'react-toast';
        el.style.cssText = 'position:fixed;bottom:calc(52px + var(--sab) + 52px);left:50%;transform:translateX(-50%) translateY(12px);background:var(--card2);border:1px solid rgba(232,131,106,.3);color:var(--cream);padding:8px 14px 8px 10px;border-radius:20px;font-size:.78rem;font-weight:700;opacity:0;transition:all .25s;z-index:9998;white-space:nowrap;box-shadow:0 4px 20px rgba(0,0,0,.5);display:flex;align-items:center;gap:7px;pointer-events:none;';
        document.body.appendChild(el);
    }
    if (photo) {
        el.innerHTML = '<img src="' + photo + '" style="width:24px;height:24px;border-radius:50%;object-fit:cover;border:1.5px solid var(--rose);flex-shrink:0"/><span>' + name + ' mandou ' + emoji + '</span>';
    } else {
        el.innerHTML = '<span style="font-size:1.1rem">' + emoji + '</span><span>' + name + ' mandou ' + emoji + '</span>';
    }
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(_rt);
    _rt = setTimeout(function() { el.style.opacity = '0'; el.style.transform = 'translateX(-50%) translateY(12px)'; }, 2800);
}
/* ── FIREBASE ───────────────────────────────────────────────────────── */
function notifyIfNeeded(events, settings, moods, checks) {
if (!('Notification' in window) || Notification.permission !== 'granted') return;
var today    = dk(_brt(new Date()));
var _lastN   = localStorage.getItem('lastEventCheck');
if (_lastN === today) return;
localStorage.setItem('lastEventCheck', today);
var myN2     = (localStorage.getItem('myName') || '').toLowerCase();
var partN2   = '';
if (settings) {
  var sMyLow2 = (settings.myName||'').toLowerCase();
  var sParLow2 = (settings.partnerName||'').toLowerCase();
  partN2 = myN2 === sMyLow2 ? sParLow2 : sMyLow2;
}
function _pushLocal(title, body, tag) {
  try { new Notification(title, { body: body, icon: '/icon-192.png', tag: tag }); } catch(e2) {}
}
function _pushFCM(title, body, tag) {
  if (window._sendNotif && myN2) window._sendNotif(myN2, tag, { title: title, body: body });
}
function _notify(title, body, tag) { _pushLocal(title, body, tag); _pushFCM(title, body, tag); }
// Eventos de hoje
var todayEvs = Object.values(events || {}).filter(function(e2) { return e2.date === today; });
if (todayEvs.length > 0) {
  var names = todayEvs.map(function(e2) { return e2.name; }).join(', ');
  _notify('📅 Hoje no agenda', 'Hoje: ' + names, 'nosdois-hoje');
}
// Eventos de amanhã
var tomorrow = dk(new Date(_brt(new Date()).getTime() + 864e5));
var tmrEvs   = Object.values(events || {}).filter(function(e2) { return e2.date === tomorrow; });
if (tmrEvs.length > 0) {
  var names2 = tmrEvs.map(function(e2) { return e2.name; }).join(', ');
  _notify('⏰ Amanhã', names2, 'nosdois-amanha');
}
// Aniversário do casal
if (settings && settings.startDate) {
  try {
    var parts3 = settings.startDate.split('-');
    var y3 = Number(parts3[0]); var m3 = Number(parts3[1]); var d3 = Number(parts3[2]);
    var now3 = _brt(new Date());
    if (now3.getMonth() === m3 - 1 && now3.getDate() === d3) {
      var anos3 = now3.getFullYear() - y3;
      _notify('🎉 Feliz aniversário!', 'Hoje faz ' + anos3 + ' ano' + (anos3 !== 1 ? 's' : '') + ' juntos!', 'nosdois-aniv');
    }
  } catch(e3) {}
}
// Aniversário próximo (7 dias)
if (settings && settings.anivDate) {
  try {
    var ap = settings.anivDate.split('-');
    var nowA = _brt(new Date());
    var thisYear = new Date(nowA.getFullYear(), Number(ap[1])-1, Number(ap[2]));
    var diffA = Math.round((thisYear - nowA) / 864e5);
    if (diffA === 7) _notify('💍 Aniversário em 7 dias!', 'Prepare algo especial!', 'nosdois-aniv7');
    if (diffA === 1) _notify('💍 Aniversário amanhã!', 'Não esqueça!', 'nosdois-aniv1');
  } catch(e4) {}
}
}
// Cache local para evitar flash de carregamento
function _ck(path) { return 'nd2_' + path.replace(/[^a-zA-Z0-9]/g, '_'); }
function _cget(path) {
    try {
        var k = _ck(path);
        var v = localStorage.getItem(k);
        return v ? JSON.parse(v) : null;
    } catch(e) { return null; }
}
function _cset(path, v) {
    try {
        var str = JSON.stringify(v);
        if (str.length > 102400) return;
        localStorage.setItem(_ck(path), str);
    } catch(e) {
        try {
            var keys = Object.keys(localStorage).filter(function(k) { return k.startsWith('nd2_') && k !== _ck('settings'); });
            keys.forEach(function(k) { localStorage.removeItem(k); });
            var str2 = JSON.stringify(v);
            if (str2.length <= 102400) localStorage.setItem(_ck(path), str2);
        } catch(e2) {}
    }
}
// Aguarda window.__fb estar pronto, com até 30 tentativas (7.5s)
function _waitFb(cb, tries) {
    if (tries === undefined) tries = 0;
    if (window.__fb) {
        cb();
    } else if (tries < 30) {
        setTimeout(function() { _waitFb(cb, tries + 1); }, 250);
    }
}
function useList(path) {
    var _d = useState(function() { return _cget(path) || {}; });
    var d = _d[0]; var s = _d[1];
    useEffect(function() {
        var unsub = null;
        var t;
        var alive = true;
        _waitFb(function() {
            if (!alive) return;
            var db = window.__fb.db; var ref = window.__fb.ref; var onValue = window.__fb.onValue;
            unsub = onValue(ref(db, path), function(snap) {
                var v = snap.val() || {};
                clearTimeout(t);
                t = setTimeout(function() { if (alive) { s(v); _cset(path, v); } }, 40);
            });
        });
        return function() { alive = false; if (typeof unsub === 'function') unsub(); clearTimeout(t); };
    }, [path]);
    return d;
}
function useVal(path, def) {
    if (def === undefined) def = null;
    var _d = useState(function() { var c = _cget(path); return c !== null ? c : def; });
    var d = _d[0]; var s = _d[1];
    useEffect(function() {
        var unsub = null;
        var t;
        var alive = true;
        _waitFb(function() {
            if (!alive) return;
            var db = window.__fb.db; var ref = window.__fb.ref; var onValue = window.__fb.onValue;
            unsub = onValue(ref(db, path), function(snap) {
                var raw = snap.val();
                var v   = raw !== null && raw !== undefined ? raw : def;
                clearTimeout(t);
                t = setTimeout(function() { if (alive) { s(v); _cset(path, v); } }, 40);
            });
        });
        return function() { alive = false; if (typeof unsub === 'function') unsub(); clearTimeout(t); };
    }, [path]);
    return d;
}
/* ── PAGINAÇÃO ──────────────────────────────────────────────────────── */
function usePagination(list, pageSize, resetKey) {
    if (pageSize === undefined) pageSize = 15;
    list = list || [];
    var _pg = useState(1); var pg = _pg[0]; var setPg = _pg[1];
    useEffect(function() { setPg(1); }, [resetKey]);
    var total   = list.length;
    var pages   = Math.max(1, Math.ceil(total / pageSize));
    var pgSafe  = Math.min(pg, pages);
    var start   = (pgSafe - 1) * pageSize;
    var slice   = list.slice(start, start + pageSize);
    return { slice: slice, pg: pgSafe, pages: pages, total: total, setPg: setPg, pageSize: pageSize };
}
function PgBar(props) {
    var pg     = props.pg;
    var pages  = props.pages;
    var total  = props.total;
    var setPg  = props.setPg;
    var label  = props.label || 'itens';
    if (pages <= 1) return null;
    return React.createElement('div', {
        style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '6px 0 2px', flexWrap: 'wrap' }
    },
        React.createElement('button', {
            onClick: function() { setPg(function(p) { return Math.max(1, p - 1); }); },
            disabled: pg <= 1,
            style: { background: 'none', border: '1px solid var(--b2)', color: pg <= 1 ? 'var(--muted)' : 'var(--rose)', borderRadius: '8px', padding: '4px 11px', fontSize: '.75rem', cursor: pg <= 1 ? 'default' : 'pointer', opacity: pg <= 1 ? .35 : 1 }
        }, '‹'),
        React.createElement('span', { style: { fontSize: '.62rem', color: 'var(--muted)', minWidth: '80px', textAlign: 'center' } },
            pg + ' / ' + pages + '  ·  ' + total + ' ' + label
        ),
        React.createElement('button', {
            onClick: function() { setPg(function(p) { return Math.min(pages, p + 1); }); },
            disabled: pg >= pages,
            style: { background: 'none', border: '1px solid var(--b2)', color: pg >= pages ? 'var(--muted)' : 'var(--rose)', borderRadius: '8px', padding: '4px 11px', fontSize: '.75rem', cursor: pg >= pages ? 'default' : 'pointer', opacity: pg >= pages ? .35 : 1 }
        }, '›')
    );
}
var fbs = function(p, v) { return new Promise(function(res, rej) { _waitFb(function() { var db = window.__fb.db; var ref = window.__fb.ref; var set = window.__fb.set; set(ref(db, p), v).then(res).catch(function(e) { console.warn('fbs', e); toast('Erro ao salvar, tente novamente'); rej(e); }); }); }); };
var fbp = function(p, v) { return new Promise(function(res, rej) { _waitFb(function() { var db = window.__fb.db; var ref = window.__fb.ref; var push = window.__fb.push; push(ref(db, p), v).then(res).catch(function(e) { console.warn('fbp', e); toast('Erro ao salvar, tente novamente'); rej(e); }); }); }); };
var fbr = function(p)    { return new Promise(function(res, rej) { _waitFb(function() { var db = window.__fb.db; var ref = window.__fb.ref; var remove = window.__fb.remove; remove(ref(db, p)).then(res).catch(function(e) { console.warn('fbr', e); toast('Erro ao deletar, tente novamente'); rej(e); }); }); }); };
// Soft-delete: copia pra /_trash/<tipo>/<id> antes de apagar do path original.
// Cloud Function cleanupTrash apaga após 30 dias.
var fbSoftDel = function(path) {
    return new Promise(function(res, rej) {
        var parts = (path || '').split('/');
        if (parts.length !== 2 || !parts[0] || !parts[1]) return fbr(path).then(res, rej);
        var type = parts[0], id = parts[1];
        _waitFb(function() {
            var db = window.__fb.db;
            db.ref(path).once('value').then(function(snap) {
                var v = snap.val();
                if (v == null) return res();
                var trashed = (typeof v === 'object' && !Array.isArray(v))
                    ? Object.assign({}, v, { _deletedAt: Date.now(), _origPath: path })
                    : { _value: v, _deletedAt: Date.now(), _origPath: path };
                db.ref('_trash/' + type + '/' + id).set(trashed).then(function() {
                    db.ref(path).remove().then(res).catch(rej);
                }).catch(function(e) {
                    // Se trash falhar, ainda assim deleta para não bloquear o usuário
                    console.warn('soft-delete fallback', e);
                    db.ref(path).remove().then(res).catch(rej);
                });
            }).catch(rej);
        });
    });
};
var fbu = function(p, v) { return new Promise(function(res, rej) { _waitFb(function() { var db = window.__fb.db; var ref = window.__fb.ref; var update = window.__fb.update; update(ref(db, p), v).then(res).catch(function(e) { console.warn('fbu', e); toast('Erro ao salvar, tente novamente'); rej(e); }); }); }); };
var fbUpload = function(path, dataUrl, onDone, onErr) {
  _waitFb(function() {
    if (window.__fb && window.__fb.upload) {
      window.__fb.upload(path, dataUrl, onDone, onErr || function(e){console.error('[fbUpload]',e);});
    } else {
      (onErr || function(){})(new Error('Storage not ready'));
    }
  });
};
/* ── IMG COMPRESS ──────────────────────────────────────────────────── */

/* ── RIPPLE ─────────────────────────────────────────────────────────── */
function rip(e) {
    var el = e.currentTarget;
    var r  = document.createElement('span');
    var rc = el.getBoundingClientRect();
    var sz = Math.max(rc.width, rc.height);
    r.className = 'rp';
    r.style.cssText = 'width:' + sz + 'px;height:' + sz + 'px;left:' + (e.clientX - rc.left - sz / 2) + 'px;top:' + (e.clientY - rc.top - sz / 2) + 'px;';
    el.appendChild(r);
    setTimeout(function() { r.remove(); }, 500);
}
/* ── SWIPE DELETE ───────────────────────────────────────────────────── */
/* ── BADGE ──────────────────────────────────────────────────────────── */
function WB(props) {
    var who = props.who;
    var nV  = props.nV;
    var nN  = props.nN;
    var _nV = nV || _getS().myName      || 'Pessoa 1';
    var _nN = nN || _getS().partnerName || 'Pessoa 2';
    var m   = { user1: { c: 'v', l: _nV }, user2: { c: 'n', l: _nN }, ambos: { c: 'b', l: 'Ambos' } };
    var d   = m[who] || m.ambos;
    return React.createElement('span', { className: 'bdg ' + d.c }, d.l);
}
/* ── MODAL ──────────────────────────────────────────────────────────── */
function Modal(props) {
    var open     = props.open;
    var onClose  = props.onClose;
    var title    = props.title;
    var children = props.children;
    var mdRef = React.useRef(null);
    useEffect(function() {
        var vv = window.visualViewport;
        function upd() {
            var h = vv ? Math.round(vv.height) : window.innerHeight;
            document.documentElement.style.setProperty('--vvh', h + 'px');
        }
        upd();
        if (vv) {
            vv.addEventListener('resize', upd);
            return function() { vv.removeEventListener('resize', upd); };
        }
    }, []);
    useEffect(function() {
        if (!open) return;
        var t = setTimeout(function() {
            var md = mdRef.current;
            if (!md) return;
            var focused = md.querySelector('input:focus, textarea:focus, select:focus');
            if (focused) focused.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }, 320);
        return function() { clearTimeout(t); };
    }, [open]);
    return React.createElement('div', {
        className: 'mo' + (open ? ' open' : ''), role: 'dialog', 'aria-modal': 'true',
        onClick: function(e) { if (e.target === e.currentTarget) onClose(); }
    },
        React.createElement('div', { className: 'md', ref: mdRef },
            React.createElement('div', { className: 'mh' }),
            title ? React.createElement('div', { className: 'mt' }, title) : null,
            children
        )
    );
}
/* ═══════════════════════════════════════════
   🏠 HOME
═══════════════════════════════════════════ */
/* ── DATE BR HELPER ─────────────────────── */
function DateBR(props) {
    var value     = props.value;
    var onChange  = props.onChange;
    var className = props.className;
    var maxYear   = props.maxYear;
    var minYear   = props.minYear;

    var MESES  = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    var anoAt  = new Date().getFullYear();
    var yearMax = maxYear !== undefined ? maxYear : anoAt + 2;
    var yearMin = minYear !== undefined ? minYear : anoAt - 29;
    var anos = [];
    for (var yi = yearMax; yi >= yearMin; yi--) anos.push(yi);

    var ext = value ? value.split('-') : ['0','0','0'];
    var _d = useState(Number(ext[2]) || 0); var d = _d[0]; var setD = _d[1];
    var _m = useState(Number(ext[1]) || 0); var m = _m[0]; var setM = _m[1];
    var _y = useState(Number(ext[0]) || 0); var y = _y[0]; var setY = _y[1];

    useEffect(function() {
        var p = value ? value.split('-') : ['0','0','0'];
        setD(Number(p[2]) || 0); setM(Number(p[1]) || 0); setY(Number(p[0]) || 0);
    }, [value]);

    var daysInMonth = m && y ? new Date(y, m, 0).getDate() : 31;

    function padTwo(n) { return n < 10 ? '0' + n : '' + n; }

    function emit(nd, nm, ny) {
        if (nd && nm && ny) {
            var maxDay  = new Date(ny, nm, 0).getDate();
            var safeDay = Math.min(nd, maxDay);
            onChange(ny + '-' + padTwo(nm) + '-' + padTwo(safeDay));
        }
    }
    function pickD(nd) { setD(nd); emit(nd, m, y); }
    function pickM(nm) {
        setM(nm);
        var maxDay = new Date(y || anoAt, nm, 0).getDate();
        var safeD  = Math.min(d, maxDay) || d;
        if (safeD !== d) setD(safeD);
        emit(safeD || d, nm, y);
    }
    function pickY(ny) { setY(ny); emit(d, m, ny); }

    var days = [];
    for (var di = 1; di <= daysInMonth; di++) days.push(di);

    return React.createElement('div', { style: { display: 'flex', gap: '6px', width: '100%' } },
        React.createElement('select', { className: className || 'f', value: d || '', onChange: function(e) { pickD(Number(e.target.value)); }, style: { flex: '1 1 0', minWidth: 0 } },
            React.createElement('option', { value: '' }, 'Dia'),
            days.map(function(n) { return React.createElement('option', { key: n, value: n }, n); })
        ),
        React.createElement('select', { className: className || 'f', value: m || '', onChange: function(e) { pickM(Number(e.target.value)); }, style: { flex: '2 1 0', minWidth: 0 } },
            React.createElement('option', { value: '' }, 'Mês'),
            MESES.map(function(mn, i) { return React.createElement('option', { key: i, value: i + 1 }, mn); })
        ),
        React.createElement('select', { className: className || 'f', value: y || '', onChange: function(e) { pickY(Number(e.target.value)); }, style: { flex: '2 1 0', minWidth: 0 } },
            React.createElement('option', { value: '' }, 'Ano'),
            anos.map(function(yn) { return React.createElement('option', { key: yn, value: yn }, yn); })
        )
    );
}

function Home(props) {
    var cur       = props.cur;
    var evRProp   = props.evRProp;
    var gastRProp = props.gastRProp;
    var petsRProp = props.petsRProp;

    var settings = useVal('settings', {});
    var s        = _getS();
    var myNameSett = (settings && settings.myName)      ? settings.myName      : (s.myName      || 'Pessoa 1');
    var partnerN   = (settings && settings.partnerName) ? settings.partnerName : (s.partnerName || 'Pessoa 2');

    var _petsOwn = useList('pets');
    var petsR    = petsRProp !== undefined ? petsRProp : _petsOwn;
    var _evOwn   = useList('events');
    var evR      = evRProp   !== undefined ? evRProp   : _evOwn;
    var _gastOwn = useList('gastos');
    var gastR    = gastRProp !== undefined ? gastRProp : _gastOwn;
    var reactR   = useList('reacts');
    var moodsR   = useVal('moods', {});
    var diaryR   = useList('diario');
    var galeriaR = useList('galeria');
    var musicaR  = useVal('musica_momento', null);
    var _musicEdit = useState(false); var musicEdit = _musicEdit[0]; var setMusicEdit = _musicEdit[1];
    var _musicTxt  = useState('');    var musicTxt  = _musicTxt[0];  var setMusicTxt  = _musicTxt[1];
    var moods    = moodsR || {};
    var postitR  = useVal('postit', null);

    var today  = td();
    var todayK = dk(today);

    var _myNameOvr = useState(function() { return localStorage.getItem('myName') || ''; });
    var myNameOvr  = _myNameOvr[0]; var setMyNameOvr = _myNameOvr[1];
    useEffect(function() {
        function onId() {
            var stored = localStorage.getItem('myName') || '';
            if (stored) setMyNameOvr(stored);
        }
        window.addEventListener('nos2:identity', onId);
        return function() { window.removeEventListener('nos2:identity', onId); };
    }, []);
    var myName = (myNameOvr || myNameSett).toLowerCase();
    var sMyLow = myNameSett.toLowerCase();
    var sParLow = partnerN.toLowerCase();
    var iAmUser1 = (myName === sMyLow);
    var realMyName   = iAmUser1 ? myNameSett : partnerN;
    var realPartnerN = iAmUser1 ? partnerN   : myNameSett;
    var mvK = myName;
    var mnK = iAmUser1 ? sParLow : sMyLow;

    var events = useMemo(function() {
        if (!evR) return [];
        return Object.entries(evR).map(function(e2) { return Object.assign({ id: e2[0] }, e2[1]); });
    }, [evR]);
    var gastos = useMemo(function() {
        if (!gastR) return [];
        return Object.entries(gastR).map(function(e2) { return Object.assign({ id: e2[0] }, e2[1]); });
    }, [gastR]);
    var pets = useMemo(function() {
        if (!petsR) return [];
        return Object.entries(petsR).map(function(e2) { return Object.assign({ id: e2[0] }, e2[1]); });
    }, [petsR]);
    var reacts = useMemo(function() {
        if (!reactR) return [];
        return Object.entries(reactR).map(function(e2) { return Object.assign({ id: e2[0] }, e2[1]); });
    }, [reactR]);

    useEffect(function() {
        if (evR && Object.keys(evR).length > 0) {
            try { notifyIfNeeded(evR, settings, null, null); } catch(ex) {}
        }
    }, [evR, settings]);

    // ── Listener de notificações FCM cross-device ──────────────
    useEffect(function() {
        var myN3 = (localStorage.getItem('myName') || '').toLowerCase();
        if (!myN3) return;
        var ref3 = window.__fb && window.__fb.db && window.__fb.db.ref('notif_triggers/' + myN3);
        if (!ref3) return;
        var lastTs = 0;
        var handler = function(snap) {
            var d = snap.val();
            if (!d || !d.ts || d.ts <= lastTs) return;
            lastTs = d.ts;
            var title = d.title || 'Nos Dois';
            var body  = d.body  || '';
            if (Notification.permission === 'granted') {
                try {
                    navigator.serviceWorker.ready.then(function(reg) {
                        reg.showNotification(title, {
                            body: body,
                            icon: '/icon-192.png',
                            tag: d.type || 'nosdois',
                            vibrate: [200, 100, 200]
                        });
                    }).catch(function(){});
                } catch(e5) {}
            }
        };
        ref3.on('value', handler);
        return function() { try { ref3.off('value', handler); } catch(e6) {} };
    }, [myName]);



    var _anivInput = useState((settings && settings.anivDate) ? settings.anivDate : '');
    var anivInput  = _anivInput[0]; var setAnivInput = _anivInput[1];

    var anivDate = null;
    if (settings && settings.anivDate) {
        var anivParts = settings.anivDate.split('-').map(Number);
        var ad = new Date(anivParts[0], anivParts[1]-1, anivParts[2]);
        if (!isNaN(ad.getTime())) anivDate = ad;
    }

    var days = 0, months = 0, years = 0, dToAniv = 0, nextAniv = null;
    if (anivDate) {
        days   = dif(anivDate, today);
        months = Math.floor(days / 30);
        years  = Math.floor(days / 365);
        var ty = new Date(today.getFullYear(), anivDate.getMonth(), anivDate.getDate());
        nextAniv = ty <= today
            ? new Date(today.getFullYear()+1, anivDate.getMonth(), anivDate.getDate())
            : ty;
        dToAniv = dif(today, nextAniv);
    }

    var _dispDays   = useState(0); var dispDays   = _dispDays[0];   var setDispDays   = _dispDays[1];
    var _dispMonths = useState(0); var dispMonths = _dispMonths[0]; var setDispMonths = _dispMonths[1];
    var _dispYears  = useState(0); var dispYears  = _dispYears[0];  var setDispYears  = _dispYears[1];
    useEffect(function() {
        var tgt = { d: days || 0, m2: months || 0, y2: years || 0 };
        if (tgt.d === 0) return;
        var start = null, dur = 900;
        function step(ts) {
            if (!start) start = ts;
            var p    = Math.min((ts - start) / dur, 1);
            var ease = 1 - Math.pow(1 - p, 3);
            setDispDays(Math.round(tgt.d  * ease));
            setDispMonths(Math.round(tgt.m2 * ease));
            setDispYears(Math.round(tgt.y2 * ease));
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }, [days, months, years]);

    var _showConf = useState(false); var showConf = _showConf[0]; var setShowConf = _showConf[1];
    useEffect(function() {
        if (anivDate) {
            var n = _brt(new Date());
            if (n.getDate() === anivDate.getDate() && n.getMonth() === anivDate.getMonth()) {
                setTimeout(function() { setShowConf(true); }, 600);
            }
        }
    }, []);

    var _clima = useState(null); var clima = _clima[0]; var setClima = _clima[1];
    useEffect(function() {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(function(pos) {
            var lat = pos.coords.latitude, lon = pos.coords.longitude;
            fetch('https://wttr.in/' + lat + ',' + lon + '?format=j1')
                .then(function(r) { return r.json(); })
                .then(function(d) {
                    var c = d && d.current_condition && d.current_condition[0];
                    if (c) {
                        var desc = (c.weatherDesc && c.weatherDesc[0] && c.weatherDesc[0].value) || '';
                        setClima({ t: parseInt(c.temp_C), desc: desc });
                    }
                })
                .catch(function() {});
        }, function() {}, { timeout: 5000 });
    }, []);

    var moodToday        = moods[todayK+':'+mvK] || moods[todayK] || null;
    var moodUser1Today   = moods[todayK+':'+sMyLow]  || null;
    var moodUser2Today   = moods[todayK+':'+sParLow] || null;
    var partnerMoodToday = iAmUser1 ? moodUser2Today : moodUser1Today;
    var partnerNameLabel = iAmUser1 ? partnerN : myNameSett;
    var partnerPhotoToday = iAmUser1 ? (settings&&settings.photoUser2) : (settings&&settings.photoUser1);

    var MOOD_SCORE = { '😊':5,'🥰':5,'😌':4,'😂':5,'🔥':5,'🫶':5,'😔':2,'😤':2,'🤒':1,'😴':2 };
    var MOOD_COLOR = { '😊':'var(--gold)','🥰':'#f43f5e','😌':'#10b981','😂':'var(--gold)','🔥':'var(--danger)','🫶':'#ec4899','😔':'#6b7280','😤':'#f97316','🤒':'#84cc16','😴':'var(--purple)' };

    var moodHistory = useMemo(function() {
        var res = [];
        for (var i = 6; i >= 0; i--) {
            var d2  = new Date(today); d2.setDate(d2.getDate() - i);
            var k2  = dk(d2);
            var mv2 = moods[k2+':'+mvK] || (i===0 ? moods[k2] : null) || null;
            var mn2 = moods[k2+':'+mnK] || null;
            var sv2 = mv2 ? (MOOD_SCORE[mv2] || 3) : 0;
            var sn2 = mn2 ? (MOOD_SCORE[mn2] || 3) : 0;
            var dayL = ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'][d2.getDay()];
            res.push({
                k: k2, day: dayL, v: sv2, n: sn2, lv: mv2, ln: mn2,
                cv: mv2 ? (MOOD_COLOR[mv2]||'#333') : '#333',
                cn: mn2 ? (MOOD_COLOR[mn2]||'#333') : '#333',
                isSynced: mv2 && mn2 && mv2 === mn2
            });
        }
        return res;
    }, [moods, todayK, mvK, mnK]);

    var streak = useMemo(function() {
        var ss = 0;
        for (var i = 0; i < 30; i++) {
            var d2 = new Date(today); d2.setDate(d2.getDate()-i);
            var k2 = dk(d2);
            if ((moods[k2+':'+mvK] || moods[k2]) && moods[k2+':'+mnK]) ss++;
            else break;
        }
        return ss;
    }, [moods, todayK, mvK, mnK]);

    var streakV = useMemo(function() {
        var ss = 0;
        for (var i = 0; i < 30; i++) {
            var d2 = new Date(today); d2.setDate(d2.getDate()-i);
            var k2 = dk(d2);
            if (moods[k2+':'+mvK] || moods[k2]) ss++;
            else break;
        }
        return ss;
    }, [moods, todayK, mvK]);

    var streakN = useMemo(function() {
        var ss = 0;
        for (var i = 0; i < 30; i++) {
            var d2 = new Date(today); d2.setDate(d2.getDate()-i);
            var k2 = dk(d2);
            if (moods[k2+':'+mnK]) ss++;
            else break;
        }
        return ss;
    }, [moods, todayK, mnK]);

    var prevReactsCount = React.useRef(0);
    useEffect(function() {
        var total = reacts.length;
        if (total > prevReactsCount.current && prevReactsCount.current > 0) {
            vib([15,10,15,10,30]);
            var latest = reacts.slice().sort(function(a,b){ return (b.ts||0)-(a.ts||0); })[0];
            if (latest && latest.de !== myName) {
                var partnerLbl = realPartnerN;
                var pPhoto     = iAmUser1
                    ? (settings && settings.photoUser2)
                    : (settings && settings.photoUser1);
                try { showReactToast(latest.e, partnerLbl, pPhoto); } catch(ex) {}
            }
        }
        prevReactsCount.current = total;
    }, [reacts.length]);

    useEffect(function() {
        if (!reactR) return;
        Object.entries(reactR).forEach(function(e2) {
            if (Date.now() - (e2[1].ts||0) > 30000) {
                try { fbr('reacts/'+e2[0]); } catch(ex) {}
            }
        });
    }, [reactR]);

    function sendReact(emoji, el) {
        vib(40);
        try {
            fbp('reacts', { e: emoji, ts: Date.now(), de: myName });
            notifyPartner('reaction', emoji + ' de ' + (myName || 'você'), 'Mandou uma reação 💕');
        } catch(ex) {}
        toast(emoji + ' enviado!');
        if (el) {
            el.classList.add('pulse');
            setTimeout(function() { el.classList.remove('pulse'); }, 450);
        }
        setTimeout(function() {
            if (!reactR) return;
            Object.entries(reactR).forEach(function(e2) {
                if (Date.now() - (e2[1].ts||0) > 8000) {
                    try { fbr('reacts/'+e2[0]); } catch(ex) {}
                }
            });
        }, 9000);
    }

    function setMood(m2) {
        var key = todayK + ':' + myName;
        var upd = {};
        upd[key] = m2;
        try { fbu('moods', upd); } catch(ex) {}
        toast('Humor salvo! ' + m2);
        try {
            var mLbl = (MOODS.filter(function(x){return x.e===m2;})[0]||{l:m2}).l;
            if (window._sendNotif) window._sendNotif(mnK, 'mood', {
                title: realMyName + ' registrou o humor',
                body: realMyName + ' esta ' + mLbl + ' hoje ' + m2
            });
        } catch(ex2) {}
        var cutoff = new Date(); cutoff.setDate(cutoff.getDate()-90);
        var cutoffK = dk(cutoff);
        var toDel = {};
        Object.keys(moods).forEach(function(mk2) {
            var dayK = mk2.split(':')[0];
            if (dayK < cutoffK) toDel[mk2] = null;
        });
        if (Object.keys(toDel).length > 0) { try { fbu('moods', toDel); } catch(ex) {} }
    }

    function saveAniv() {
        if (!anivInput) return;
        try { fbu('settings', { anivDate: anivInput }); } catch(ex) {}
        toast('Data salva!');
    }

    var _piEdit = useState(false); var piEdit = _piEdit[0]; var setPiEdit = _piEdit[1];
    var _piTxt  = useState('');    var piTxt  = _piTxt[0];  var setPiTxt  = _piTxt[1];

    function savePiTxt() {
        var v = piTxt.trim();
        if (!v) return;
        try {
            fbs('postit', { msg: v, by: myName, ts: Date.now() });
            var preview = v.length > 60 ? v.slice(0, 60) + '…' : v;
            notifyPartner('postit', '📌 Recado de ' + (myName || 'você'), preview);
        } catch(ex) {}
        setPiEdit(false);
        setPiTxt('');
    }

    var _fraseExp = useState(false); var fraseExp = _fraseExp[0]; var setFraseExp = _fraseExp[1];
    var dayOfYear = Math.floor((_brt(new Date()) - new Date(_brt(new Date()).getFullYear(),0,0)) / 864e5);
    var frase     = FRASES_CASAL[dayOfYear % FRASES_CASAL.length];

    var mkC        = mk(cur);
    var monthTotal = gastos.filter(function(g) { return g.date && g.date.indexOf(mkC)===0; })
                           .reduce(function(ss,g){ return ss+(g.val||0); }, 0);
    var evCount    = events.filter(function(e2) { return e2.date && e2.date.indexOf(mkC)===0; }).length;
    var upcoming2  = events.filter(function(e2) { return e2.date >= todayK; })
                           .sort(function(a,b){
                               var _mn = myName;
                               var aMe = a.who===_mn||a.who==='ambos';
                               var bMe = b.who===_mn||b.who==='ambos';
                               if (aMe && !bMe) return -1;
                               if (!aMe && bMe) return 1;
                               return a.date>b.date?1:-1;
                           });

    // ── Resumo mensal ─────────────────────────────
    var moodDaysV  = Object.keys(moodsR||{}).filter(function(k){ return k.indexOf(mkC)===0 && k.indexOf(':'+sMyLow)>0; }).length;
    var moodDaysN  = Object.keys(moodsR||{}).filter(function(k){ return k.indexOf(mkC)===0 && k.indexOf(':'+sParLow)>0; }).length;
    var diaryCount = Object.values(diaryR||{}).filter(function(d2){ return (d2.date||'').indexOf(mkC)===0; }).length;
    var fotosCount = Object.values(galeriaR||{}).filter(function(f2){ return mk(new Date(f2.ts||0))===mkC; }).length;
    var prevMkC    = mk(new Date(cur.getFullYear(), cur.getMonth()-1, 1));
    var prevTotal  = gastos.filter(function(g){ return g.date&&g.date.indexOf(prevMkC)===0; }).reduce(function(s,g){return s+(g.val||0);},0);
    var gastDiff   = prevTotal > 0 ? Math.round((monthTotal - prevTotal)/prevTotal*100) : null;


    var nextEv     = upcoming2[0] || null;

    var now2     = _brt(new Date());
    var calY     = now2.getFullYear(), calM = now2.getMonth();
    var calFirst = new Date(calY, calM, 1).getDay();
    var calDim   = new Date(calY, calM+1, 0).getDate();
    var calDip   = new Date(calY, calM, 0).getDate();
    var calCells = [];
    var evDates  = {};
    events.forEach(function(e2) { if (e2.date) evDates[e2.date] = true; });
    for (var ci = calFirst-1; ci >= 0; ci--)
        calCells.push({ d: calDip-ci, cur: false, hasEv: false, isToday: false });
    for (var cd = 1; cd <= calDim; cd++) {
        var ck2 = calY+'-'+String(calM+1).padStart(2,'0')+'-'+String(cd).padStart(2,'0');
        calCells.push({ d: cd, cur: true, hasEv: !!evDates[ck2], isToday: cd===now2.getDate() });
    }
    while (calCells.length % 7 !== 0)
        calCells.push({ d: calCells.length - calDim - calFirst + 2, cur: false, hasEv: false, isToday: false });
    var WDS = ['D','S','T','Q','Q','S','S'];

    var filledH = moodHistory.filter(function(d2){ return d2.v>0||d2.n>0; });
    var syncedH = moodHistory.filter(function(d2){ return d2.isSynced; });
    var syncPct = moodHistory.length > 0 ? Math.round(syncedH.length/moodHistory.length*100) : 0;
    var topMoodVmap = {}, topMoodNmap = {};
    moodHistory.forEach(function(d2) {
        if (d2.lv) topMoodVmap[d2.lv] = (topMoodVmap[d2.lv]||0)+1;
        if (d2.ln) topMoodNmap[d2.ln] = (topMoodNmap[d2.ln]||0)+1;
    });
    var topMoodVarr = Object.entries(topMoodVmap).sort(function(a,b){return b[1]-a[1];});
    var topMoodNarr = Object.entries(topMoodNmap).sort(function(a,b){return b[1]-a[1];});
    var topV = topMoodVarr.length > 0 ? topMoodVarr[0][0] : null;
    var topN = topMoodNarr.length > 0 ? topMoodNarr[0][0] : null;

    var moodHvsV = moodHistory.filter(function(d2){return d2.v>0;});
    var trendV = 0;
    if (moodHvsV.length >= 3) {
        var mid = Math.floor(moodHvsV.length/2);
        var a1  = moodHvsV.slice(0,mid).reduce(function(ss,d2){return ss+d2.v;},0)/mid;
        var a2  = moodHvsV.slice(mid).reduce(function(ss,d2){return ss+d2.v;},0)/(moodHvsV.length-mid);
        trendV  = a2 - a1;
    }

    var moodHvsN = moodHistory.filter(function(d2){return d2.n>0;});
    var trendN = 0;
    if (moodHvsN.length >= 3) {
        var midN = Math.floor(moodHvsN.length/2);
        var an1  = moodHvsN.slice(0,midN).reduce(function(ss,d2){return ss+d2.n;},0)/midN;
        var an2  = moodHvsN.slice(midN).reduce(function(ss,d2){return ss+d2.n;},0)/(moodHvsN.length-midN);
        trendN   = an2 - an1;
    }
    var isMyNote = postitR && ((postitR.by||'').toLowerCase() === myName);

    var MARCOS = [{d:100,l:'100 dias juntos!'},{d:200,l:'200 dias!'},{d:365,l:'1 ano de amor!'},{d:500,l:'500 dias!'},{d:730,l:'2 anos!'},{d:1000,l:'1000 dias juntos!'},{d:1461,l:'4 anos!'},{d:1825,l:'5 anos!'}];
    var proxMarco = null;
    for (var mi = 0; mi < MARCOS.length; mi++) {
        if (MARCOS[mi].d > days) { proxMarco = MARCOS[mi]; break; }
    }
    var faltamMarco = proxMarco ? proxMarco.d - days : 0;

    var CONF_CHARS = ['🎊','🎉','💕','✨','🌹','💫','🥂','🎀'];
    var confPieces = useMemo(function() {
        var arr = [];
        for (var i2 = 0; i2 < 28; i2++) {
            arr.push({ id: i2, ch: CONF_CHARS[i2%CONF_CHARS.length], x: Math.round(Math.random()*100), delay: Math.round(Math.random()*20)/10, size: 0.9+Math.round(Math.random()*8)/10, speed: 2+Math.round(Math.random()*30)/10 });
        }
        return arr;
    }, []);

    return React.createElement('div', { className: 'ps', style: { gap: '14px' } },

        showConf ? React.createElement('div', { style: { position:'fixed',inset:0,zIndex:9990,pointerEvents:'none',overflow:'hidden' } },
            React.createElement('style', null, '@keyframes fall{0%{transform:translateY(-10vh) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}'),
            confPieces.map(function(p) {
                return React.createElement('div', { key: p.id, style: { position:'absolute',top:0,left:p.x+'%',fontSize:p.size+'rem',animation:'fall '+p.speed+'s '+p.delay+'s ease-in infinite',willChange:'transform' } }, p.ch);
            }),
            React.createElement('div', { onClick: function(){ setShowConf(false); }, style: { position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'all' } },
                React.createElement('div', { style: { background:'linear-gradient(135deg,rgba(26,8,20,.97),rgba(45,12,30,.97))',border:'2px solid rgba(232,131,106,.4)',borderRadius:'var(--r)',padding:'28px 24px',textAlign:'center',maxWidth:280,boxShadow:'0 8px 60px rgba(0,0,0,.8)' } },
                    React.createElement('div', { style: { fontSize:'3rem',marginBottom:'8px' } }, '🎉'),
                    React.createElement('div', { style: { fontFamily:"'Cormorant Garamond',serif",fontSize:'1.6rem',color:'var(--rose)',fontStyle:'italic',marginBottom:'6px' } }, 'Feliz Aniversario!'),
                    React.createElement('div', { style: { fontSize:'.85rem',color:'rgba(255,255,255,.7)',marginBottom:'4px' } }, 'de namoro'),
                    React.createElement('div', { style: { fontFamily:"'Cormorant Garamond',serif",fontSize:'1.1rem',color:'var(--cream)',marginBottom:'20px' } }, myNameSett, React.createElement('span',{style:{color:'var(--rose)'}}, ' ♥ '), partnerN),
                    React.createElement('div', { style: { fontSize:'.75rem',color:'var(--muted)',marginBottom:'16px' } }, days + ' dias de muito amor'),
                    React.createElement('button', { onClick: function(){ setShowConf(false); }, style: { padding:'10px 24px',background:'linear-gradient(135deg,var(--rose),var(--rose2))',border:'none',borderRadius:'20px',color:'var(--fg)',fontWeight:700,fontSize:'.85rem',cursor:'pointer' } }, 'Celebrar!')
                )
            )
        ) : null,

        (settings && settings.couplePhoto) ? React.createElement('div', { style: { position:'relative',borderRadius:'var(--rm)',overflow:'hidden',aspectRatio:'16/7',boxShadow:'0 8px 40px rgba(0,0,0,.6)' } },
            React.createElement('img', { loading:'lazy', decoding:'async', src: settings.couplePhoto, style: { width:'100%',height:'100%',objectFit:'cover',display:'block' } }),
            React.createElement('div', { style: { position:'absolute',inset:0,background:'linear-gradient(to top,rgba(13,4,8,.9) 0%,rgba(0,0,0,.1) 50%,transparent 100%)' } }),
            React.createElement('div', { style: { position:'absolute',bottom:'12px',left:'16px',right:'16px',display:'flex',justifyContent:'space-between',alignItems:'flex-end' } },
                React.createElement('div', null,
                    (settings.myName && settings.partnerName) ? React.createElement('div', { style: { fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic',fontSize:'1.1rem',color:'var(--fg)',textShadow:'0 2px 12px rgba(0,0,0,.8)' } }, settings.myName, React.createElement('span',{style:{color:'var(--rose)',opacity:.9}}, ' ♥ '), settings.partnerName) : null,
                    anivDate ? React.createElement('div', { style: { fontSize:'.6rem',color:'rgba(255,255,255,.6)',marginTop:'2px',letterSpacing:'.06em' } }, days + ' dias juntos') : null
                )
            )
        ) : null,

        React.createElement('div', { className: 'hero' },
            (settings && settings.couplePhoto) ? React.createElement(React.Fragment, null,
                React.createElement('img', { loading:'lazy', decoding:'async', src: settings.couplePhoto, style: { position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:.32,borderRadius:'var(--rm)',pointerEvents:'none',zIndex:0,filter:'saturate(0.9) blur(0.3px)' } }),
                React.createElement('div', { style: { position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(13,4,8,.15) 0%,rgba(13,4,8,.82) 70%)',borderRadius:'var(--rm)',zIndex:0,pointerEvents:'none' } }),
                React.createElement('div', { style: { position:'absolute',top:10,right:12,zIndex:2,width:52,height:52,borderRadius:'50%',overflow:'hidden',border:'2px solid rgba(232,131,106,.6)',boxShadow:'0 2px 12px rgba(0,0,0,.6)' } },
                    React.createElement('img', { loading:'lazy', decoding:'async', src: settings.couplePhoto, style: { width:'100%',height:'100%',objectFit:'cover' } })
                )
            ) : null,
            React.createElement('div', { style: { position:'relative',zIndex:1,paddingBottom:'2px' } },
                React.createElement('div', { className: 'hn', style: { fontSize:'1.35rem',fontStyle:'italic',textShadow:'0 2px 12px rgba(0,0,0,.8)' } }, myNameSett, React.createElement('span',{style:{color:'var(--rose)',opacity:.8}}, ' ♥ '), partnerN),
                anivDate
                    ? React.createElement(React.Fragment, null,
                        React.createElement('div', { className: 'hs' }, 'juntos desde ' + anivDate.toLocaleDateString('pt-BR')),
                        React.createElement('div', { className: 'hctr' },
                            React.createElement('div', { className:'hcb',style:{borderColor:'rgba(232,131,106,.15)'} }, React.createElement('div',{className:'hcv'}, dispDays), React.createElement('div',{className:'hcl'}, 'Dias')),
                            React.createElement('div', { className:'hcb',style:{borderColor:'rgba(212,168,83,.15)'} }, React.createElement('div',{className:'hcv',style:{color:'var(--gold)'}}, dispMonths), React.createElement('div',{className:'hcl'}, 'Meses')),
                            React.createElement('div', { className:'hcb',style:{borderColor:'rgba(176,144,216,.15)'} }, React.createElement('div',{className:'hcv',style:{color:'var(--purple)'}}, years), React.createElement('div',{className:'hcl'}, 'Anos'))
                        ),
                        proxMarco && faltamMarco <= 60 ? React.createElement('div', { style: { marginTop:'6px',padding:'5px 8px',borderRadius:'6px',background:'rgba(212,168,83,.12)',border:'1px solid rgba(212,168,83,.2)',fontSize:'.65rem',color:'var(--gold)',textAlign:'center' } },
                            'Faltam ', React.createElement('b',null,faltamMarco), ' ' + (faltamMarco===1?'dia':'dias') + ' para ' + proxMarco.l
                        ) : null,
                        nextEv && (function() {
                            var p2   = nextEv.date.split('-');
                            var nd   = new Date(parseInt(p2[0]), parseInt(p2[1])-1, parseInt(p2[2]));
                            var dist = dif(today, nd);
                            var catO = CEV[nextEv.cat] || CEV.outro;
                            var urgC = dist===0?'var(--rose)':dist<=3?'var(--gold)':'var(--vic)';
                            return React.createElement('div', { style: { marginTop:'8px',padding:'10px 12px',borderRadius:'10px',background: catO.c+'11',border:'1px solid '+catO.c+'33',display:'flex',alignItems:'center',gap:'10px' } },
                                React.createElement('div',{style:{fontSize:'1.5rem',flexShrink:0}}, catO.e),
                                React.createElement('div',{style:{flex:1,minWidth:0}},
                                    React.createElement('div',{style:{fontSize:'.7rem',fontWeight:700,color:'var(--cream)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}, nextEv.name),
                                    React.createElement('div',{style:{fontSize:'.6rem',color:'var(--muted)',marginTop:'1px'}}, nd.toLocaleDateString('pt-BR',{day:'2-digit',month:'long'}))
                                ),
                                React.createElement('div',{style:{textAlign:'center',flexShrink:0}},
                                    React.createElement('div',{style:{fontSize:dist>99?'1rem':'1.4rem',fontWeight:800,color:urgC,lineHeight:1}}, dist===0?'🎉':dist),
                                    React.createElement('div',{style:{fontSize:'.5rem',color:'var(--muted)',fontWeight:600}}, dist===0?'HOJE':'dias')
                                )
                            );
                        })()
                    )
                    : React.createElement(React.Fragment, null,
                        React.createElement('div', { className:'hctr',style:{marginTop:'10px',opacity:.35} },
                            React.createElement('div',{className:'hcb'}, React.createElement('div',{className:'hcv'}, '-'), React.createElement('div',{className:'hcl'}, 'Dias')),
                            React.createElement('div',{className:'hcb'}, React.createElement('div',{className:'hcv'}, '-'), React.createElement('div',{className:'hcl'}, 'Meses')),
                            React.createElement('div',{className:'hcb'}, React.createElement('div',{className:'hcv'}, '-'), React.createElement('div',{className:'hcl'}, 'Anos'))
                        ),
                        React.createElement('div', { style: { marginTop:'10px' } },
                            React.createElement('div',{style:{fontSize:'.72rem',color:'var(--muted)',marginBottom:'6px',textAlign:'center'}}, 'Quando voces ficaram juntos?'),
                            React.createElement('div',{className:'fr'},
                                React.createElement(DateBR, { value: anivInput, onChange: setAnivInput }),
                                React.createElement('button',{className:'bp',style:{width:'auto',padding:'0 14px'},onClick:saveAniv}, '💾 Salvar')
                            )
                        )
                    )
            )
        ),

        dToAniv === 0 ? React.createElement('div', { className:'anb',style:{borderColor:'rgba(232,131,106,.4)',background:'linear-gradient(135deg,#3d1500,#1e0500)'} },
            React.createElement('div',{className:'anbi'}, '🎉'),
            React.createElement('div',null, React.createElement('div',{className:'anbt',style:{color:'var(--rose)'}}, 'Feliz Aniversario de Namoro!'), React.createElement('div',{className:'anbs'}, 'Hoje e um dia especial'))
        ) : null,
        dToAniv > 0 && dToAniv <= 30 ? React.createElement('div', { className:'anb' },
            React.createElement('div',{className:'anbi'}, '🎂'),
            React.createElement('div',{style:{flex:1}},
                React.createElement('div',{className:'anbt'}, 'Aniversario em ' + dToAniv + (dToAniv===1?' dia':' dias') + '!'),
                React.createElement('div',{className:'anbs'}, (nextAniv ? nextAniv.toLocaleDateString('pt-BR') : '') + ' - ja marquem algo especial')
            ),
            React.createElement('div',{style:{background:'rgba(212,168,83,.15)',border:'1px solid rgba(212,168,83,.3)',borderRadius:'8px',padding:'5px 9px',textAlign:'center',flexShrink:0}},
                React.createElement('div',{style:{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.3rem',color:'var(--gold)',lineHeight:1}}, dToAniv),
                React.createElement('div',{style:{fontSize:'.46rem',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.04em'}}, 'dias')
            )
        ) : null,
        anivDate && dToAniv > 30 ? React.createElement('div', { className:'anb',style:{background:'rgba(20,7,0,.6)',borderColor:'var(--b2)'} },
            React.createElement('div',{className:'anbi',style:{fontSize:'1.1rem'}}, '💍'),
            React.createElement('div',{style:{flex:1}},
                React.createElement('div',{className:'anbt',style:{color:'var(--cream)',fontWeight:600}}, 'Próximo aniversário'),
                React.createElement('div',{className:'anbs'}, (nextAniv ? nextAniv.toLocaleDateString('pt-BR') : '') + ' - ' + dToAniv + ' dias')
            )
        ) : null,

        pets.filter(function(pet) { return !!pet.birthday; }).map(function(pet) {
            var pp    = pet.birthday.split('-').map(Number);
            var hoje2 = today;
            var prox2 = new Date(hoje2.getFullYear(), pp[1]-1, pp[2]);
            if (prox2 < hoje2) prox2.setFullYear(hoje2.getFullYear()+1);
            var faltam = dif(hoje2, prox2);
            if (faltam > 7) return null;
            var idadeBase = hoje2.getFullYear() - pp[0] - (hoje2 < new Date(hoje2.getFullYear(), pp[1]-1, pp[2]) ? 1 : 0);
            return React.createElement('div', { key: pet.id, style: { background:'linear-gradient(135deg,rgba(212,168,83,.1),rgba(212,168,83,.05))',border:'1px solid rgba(212,168,83,.3)',borderRadius:'var(--r)',padding:'10px 12px',display:'flex',alignItems:'center',gap:'10px' } },
                React.createElement('div',{style:{fontSize:'1.6rem'}}, faltam===0?'🎂':(pet.emoji||'🐾')),
                React.createElement('div',{style:{flex:1}},
                    React.createElement('div',{style:{fontSize:'.78rem',fontWeight:700,color:'var(--gold)'}}, faltam===0 ? 'Feliz aniversario, '+pet.name+'!' : pet.name+' faz aniversario em '+faltam+(faltam!==1?' dias':' dia')+'!'),
                    React.createElement('div',{style:{fontSize:'.6rem',color:'var(--muted)',marginTop:'1px'}}, faltam===0 ? 'Hoje faz '+idadeBase+(idadeBase!==1?' anos':' ano')+'!' : prox2.toLocaleDateString('pt-BR')+' - '+(idadeBase+1)+((idadeBase+1)!==1?' anos':' ano'))
                )
            );
        }),

        pets.length > 0 ? React.createElement('div', { className:'card',style:{padding:'10px 14px'} },
            React.createElement('div',{style:{display:'flex',alignItems:'center',gap:'10px'}},
                React.createElement('div',{style:{fontSize:'.7rem',color:'var(--muted)',fontWeight:700,flexShrink:0}}, 'Nossos pets'),
                React.createElement('div',{style:{display:'flex',gap:'8px',flexWrap:'wrap'}},
                    pets.map(function(pet) {
                        return React.createElement('div',{key:pet.id,style:{display:'flex',alignItems:'center',gap:'5px',background:'rgba(255,255,255,.04)',borderRadius:'20px',padding:'4px 10px 4px 4px',border:'1px solid var(--b2)'}},
                            pet.photo ? React.createElement('img',{loading:'lazy',decoding:'async',src:pet.photo,style:{width:24,height:24,borderRadius:'50%',objectFit:'cover',flexShrink:0}}) : React.createElement('span',{style:{fontSize:'1.1rem'}}, pet.emoji||'🐾'),
                            React.createElement('span',{style:{fontSize:'.68rem',color:'var(--cream)',fontWeight:600}}, pet.name)
                        );
                    })
                )
            )
        ) : null,

        clima ? React.createElement('div', { className:'card',style:{padding:'10px 14px'} },
            React.createElement('div',{style:{display:'flex',alignItems:'center',gap:'10px'}},
                React.createElement('div',{style:{fontSize:'1.8rem'}}, clima.t<=15?'🧥':clima.t<=22?'😎':'☀️'),
                React.createElement('div',{style:{flex:1}},
                    React.createElement('div',{style:{fontSize:'.75rem',color:'var(--cream)',fontWeight:700}}, clima.t + 'C - ' + clima.desc),
                    React.createElement('div',{style:{fontSize:'.6rem',color:'var(--muted)'}}, 'Clima agora na sua cidade')
                )
            )
        ) : null,

        React.createElement('div', { className:'card',style:{padding:'12px 14px'} },
            React.createElement('div',{className:'ct',style:{marginBottom:'8px'}}, MN[calM]),
            React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'2px',marginBottom:'4px'}},
                WDS.map(function(w,i2){ return React.createElement('div',{key:i2,style:{textAlign:'center',fontSize:'.55rem',color:'var(--muted)',fontWeight:700,padding:'2px 0'}}, w); })
            ),
            React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'2px'}},
                calCells.map(function(cc,i2) {
                    return React.createElement('div',{key:i2,style:{textAlign:'center',padding:'3px 1px',borderRadius:'6px',background:cc.isToday?'linear-gradient(135deg,var(--rose),var(--rose2))':cc.hasEv&&cc.cur?'rgba(232,131,106,.1)':'transparent',opacity:cc.cur?1:.25}},
                        React.createElement('div',{style:{fontSize:'.65rem',fontWeight:cc.isToday?700:400,color:cc.isToday?'var(--fg)':'var(--text)'}}, cc.d),
                        cc.hasEv && !cc.isToday ? React.createElement('div',{style:{width:4,height:4,borderRadius:'50%',background:'var(--rose)',margin:'0 auto',marginTop:'1px'}}) : null
                    );
                })
            )
        ),

        nextEv && (function() {
            var p2    = nextEv.date.split('-');
            var evD2  = new Date(parseInt(p2[0]), parseInt(p2[1])-1, parseInt(p2[2]));
            var dLeft = Math.ceil((evD2.getTime()-today.getTime())/864e5);
            var isT   = dLeft===0, isTom = dLeft===1;
            var M3loc = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
            return React.createElement('div',{className:'card',style:{padding:'12px 14px',borderColor:isT?'rgba(232,131,106,.4)':'var(--b2)',background:isT?'linear-gradient(135deg,rgba(232,131,106,.08),rgba(176,144,216,.04))':'var(--card)'}},
                React.createElement('div',{style:{display:'flex',alignItems:'center',gap:'10px'}},
                    React.createElement('div',{style:{width:44,height:44,borderRadius:'10px',background:isT?'linear-gradient(135deg,var(--rose),var(--rose2))':'rgba(255,255,255,.06)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0,border:'1px solid '+(isT?'transparent':'var(--b2)')}},
                        React.createElement('div',{style:{fontSize:'.5rem',color:isT?'rgba(255,255,255,.8)':'var(--muted)',fontWeight:800,textTransform:'uppercase',letterSpacing:'.05em'}}, M3loc[evD2.getMonth()]),
                        React.createElement('div',{style:{fontSize:'1.1rem',fontWeight:800,color:isT?'var(--fg)':'var(--cream)',lineHeight:1}}, evD2.getDate())
                    ),
                    React.createElement('div',{style:{flex:1,minWidth:0}},
                        React.createElement('div',{style:{display:'flex',alignItems:'center',gap:'5px',marginBottom:'2px'}},
                            React.createElement('span',{style:{fontSize:'.6rem',fontWeight:800,color:isT?'var(--rose)':'var(--gold)',textTransform:'uppercase',letterSpacing:'.06em'}}, isT?'Hoje!':isTom?'Amanha!':dLeft+' dias'),
                            React.createElement('span',{style:{fontSize:'.55rem',color:'var(--muted)'}}, (CEV[nextEv.cat]&&CEV[nextEv.cat].e)||'')
                        ),
                        React.createElement('div',{style:{fontSize:'.8rem',fontWeight:700,color:'var(--cream)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}, nextEv.name),
                        nextEv.time ? React.createElement('div',{style:{fontSize:'.6rem',color:'var(--muted)',marginTop:'2px'}}, nextEv.time) : null
                    ),
                    isT ? React.createElement('div',{style:{fontSize:'1.5rem'}}, '🎊') : null
                )
            );
        })(),

        React.createElement('div', { className:'sr' },
            React.createElement('div',{className:'sb'}, React.createElement('div',{className:'sv'}, evCount), React.createElement('div',{className:'sl'}, 'eventos ' + MN[cur.getMonth()])),
            React.createElement('div',{className:'sb'}, React.createElement('div',{className:'sv',style:{color:'var(--gold)'}}, fR(monthTotal)), React.createElement('div',{className:'sl'}, 'gastos ' + MN[cur.getMonth()]))
        ),

        // ── Resumo do mês ──────────────────────────────────────
        React.createElement('div', { className:'card', style:{ padding:'14px 16px', marginTop:'2px' } },
            React.createElement('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' } },
                React.createElement('div', { style:{ fontSize:'.72rem', fontWeight:800, color:'var(--cream)', letterSpacing:'.04em' } }, '📊 Resumo de ' + MN[cur.getMonth()]),
                gastDiff !== null ? React.createElement('span', { style:{ fontSize:'.6rem', fontWeight:700, color: gastDiff > 0 ? 'var(--danger)' : 'var(--ok)', background: gastDiff > 0 ? 'rgba(239,68,68,.1)' : 'rgba(16,185,129,.1)', borderRadius:'8px', padding:'2px 7px' } },
                    (gastDiff > 0 ? '↑' : '↓') + Math.abs(gastDiff) + '% gastos vs mês anterior'
                ) : null
            ),
            React.createElement('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' } },
                React.createElement('div', { style:{ background:'rgba(255,255,255,.04)', borderRadius:'10px', padding:'10px 12px' } },
                    React.createElement('div', { style:{ fontSize:'1.4rem', fontWeight:800, color:'var(--rose)' } }, evCount),
                    React.createElement('div', { style:{ fontSize:'.58rem', color:'var(--muted)', marginTop:'2px' } }, 'eventos este mês')
                ),
                React.createElement('div', { style:{ background:'rgba(255,255,255,.04)', borderRadius:'10px', padding:'10px 12px' } },
                    React.createElement('div', { style:{ fontSize:'1.4rem', fontWeight:800, color:'var(--gold)' } }, fotosCount),
                    React.createElement('div', { style:{ fontSize:'.58rem', color:'var(--muted)', marginTop:'2px' } }, 'fotos na galeria')
                ),
                React.createElement('div', { style:{ background:'rgba(255,255,255,.04)', borderRadius:'10px', padding:'10px 12px' } },
                    React.createElement('div', { style:{ fontSize:'1.4rem', fontWeight:800, color:'var(--purple)' } }, diaryCount),
                    React.createElement('div', { style:{ fontSize:'.58rem', color:'var(--muted)', marginTop:'2px' } }, 'entradas no diário')
                ),
                React.createElement('div', { style:{ background:'rgba(255,255,255,.04)', borderRadius:'10px', padding:'10px 12px' } },
                    React.createElement('div', { style:{ fontSize:'1.4rem', fontWeight:800, color:'var(--sage)' } }, syncPct + '%'),
                    React.createElement('div', { style:{ fontSize:'.58rem', color:'var(--muted)', marginTop:'2px' } }, 'dias em sintonia')
                )
            ),
            // Humor do mês por pessoa
            React.createElement('div', { style:{ display:'flex', gap:'10px', marginTop:'10px' } },
                React.createElement('div', { style:{ flex:1, background:'rgba(232,131,106,.06)', borderRadius:'10px', padding:'8px 12px', border:'1px solid rgba(232,131,106,.1)' } },
                    React.createElement('div', { style:{ fontSize:'.6rem', fontWeight:700, color:'var(--rose)', marginBottom:'4px' } }, realMyName),
                    React.createElement('div', { style:{ fontSize:'.72rem', color:'var(--muted)' } }, moodDaysV + ' dias registrados')
                ),
                React.createElement('div', { style:{ flex:1, background:'rgba(176,144,216,.06)', borderRadius:'10px', padding:'8px 12px', border:'1px solid rgba(176,144,216,.1)' } },
                    React.createElement('div', { style:{ fontSize:'.6rem', fontWeight:700, color:'var(--purple)', marginBottom:'4px' } }, realPartnerN),
                    React.createElement('div', { style:{ fontSize:'.72rem', color:'var(--muted)' } }, moodDaysN + ' dias registrados')
                )
            )
        ),


        React.createElement('div', { style: { position:'relative',background:'linear-gradient(135deg,rgba(212,168,83,.08),rgba(212,168,83,.04))',border:'1px solid rgba(212,168,83,.2)',borderRadius:'var(--r)',padding:'12px 14px',width:'100%',boxSizing:'border-box',flexShrink:0 } },
            React.createElement('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'7px'}},
                React.createElement('div',{style:{fontSize:'.62rem',fontWeight:700,color:'var(--gold)',textTransform:'uppercase',letterSpacing:'.06em'}}, 'Recado do Dia'),
                React.createElement('div',{style:{display:'flex',gap:'4px'}},
                    isMyNote && postitR && postitR.msg ? React.createElement('button',{className:'bico',style:{fontSize:'.85rem',opacity:.6,color:'var(--danger)'},onClick:function(){ try{fbr('postit');}catch(ex){} toast('Recado apagado'); }}, '🗑️') : null,
                    React.createElement('button',{className:'bico',style:{fontSize:'.85rem',opacity:.6},onClick:function(){ setPiTxt((postitR&&postitR.msg)||''); setPiEdit(true); }}, '✏️')
                )
            ),
            piEdit
                ? React.createElement('div',{className:'fr',style:{gap:'6px'}},
                    React.createElement('input',{className:'f',style:{fontSize:'.8rem'},placeholder:'Deixa um recado...',value:piTxt,onChange:function(e2){setPiTxt(e2.target.value);},onKeyDown:function(e2){if(e2.key==='Enter') savePiTxt();}}),
                    React.createElement('button',{className:'bp',style:{width:'auto',padding:'0 12px',flexShrink:0},onClick:savePiTxt}, 'OK')
                )
                : React.createElement('div',null,
                    (postitR && postitR.msg)
                        ? React.createElement('div',null,
                            React.createElement('div',{style:{fontSize:'.82rem',color:'var(--cream)',fontStyle:'italic',lineHeight:1.5}}, '"' + postitR.msg + '"'),
                            React.createElement('div',{style:{fontSize:'.58rem',color:'var(--muted)',marginTop:'5px'}},
                                (isMyNote ? realMyName : realPartnerN) + ' - ' + (postitR.ts ? new Date(postitR.ts).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) : '')
                            )
                        )
                        : React.createElement('div',{style:{fontSize:'.75rem',color:'var(--muted)',textAlign:'center',padding:'6px 0',fontStyle:'italic'}}, 'Nenhum recado ainda... deixa um!')
                )
        ),

        React.createElement('div', { className:'card' },
            React.createElement('div',{className:'ct'}, 'Manda um Sinal'),
            React.createElement('div',{className:'rs'},
                REACTS.map(function(r) {
                    return React.createElement('button',{key:r.e,className:'rb rw',onClick:function(e2){ rip(e2); sendReact(r.e, e2.currentTarget); }},
                        React.createElement('span',{style:{fontSize:'1.25rem',lineHeight:1}}, r.e)
                    );
                })
            )
        ),

        React.createElement('div', { className:'card' },

        // ── Música do momento ───────────────────────────────────
        React.createElement('div', { style: { position:'relative', background:'linear-gradient(135deg,rgba(176,144,216,.08),rgba(111,168,200,.05))', borderRadius:'var(--rc)', padding:'12px 14px', border:'1px solid rgba(176,144,216,.12)' } },
            React.createElement('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: (musicaR && musicaR.song && !musicEdit) ? '6px' : '0' } },
                React.createElement('div', { style:{ fontSize:'.62rem', fontWeight:700, color:'var(--purple)', textTransform:'uppercase', letterSpacing:'.06em' } }, '🎵 Nossa Música'),
                React.createElement('div', { style:{ display:'flex', gap:'4px' } },
                    musicaR && musicaR.song && !musicEdit ? React.createElement('button', { className:'bico', style:{ fontSize:'.85rem', opacity:.6 }, onClick:function(){ setMusicTxt(musicaR.song); setMusicEdit(true); } }, '✏️') : null,
                    musicaR && musicaR.song && !musicEdit ? React.createElement('button', { className:'bico', style:{ fontSize:'.85rem', opacity:.6, color:'var(--danger)' }, onClick:function(){ if(window.confirm('Remover música?')) { try{fbs('musica_momento',null);}catch(e){} } } }, '🗑️') : null,
                    !musicEdit ? React.createElement('button', { className:'bico', style:{ fontSize:'.85rem', opacity:.6 }, onClick:function(){ setMusicTxt(''); setMusicEdit(true); } }, musicaR && musicaR.song ? '' : '➕') : null
                )
            ),
            musicEdit
            ? React.createElement('div', { className:'fr', style:{ gap:'6px', marginTop:'8px' } },
                React.createElement('input', { className:'f', style:{ fontSize:'.8rem' }, placeholder:'Artista - Nome da música…', value:musicTxt, onChange:function(e){ setMusicTxt(e.target.value); } }),
                React.createElement('button', { className:'bp', style:{ width:'auto', padding:'0 12px', flexShrink:0 }, onClick:function(){
                    if (musicTxt.trim()) { try{ fbs('musica_momento', { song: musicTxt.trim(), by: myName, ts: Date.now() }); }catch(e){} }
                    setMusicEdit(false); setMusicTxt('');
                } }, 'OK'),
                React.createElement('button', { className:'bs', style:{ width:'auto', padding:'0 12px', flexShrink:0 }, onClick:function(){ setMusicEdit(false); setMusicTxt(''); } }, '✕')
            )
            : (musicaR && musicaR.song)
                ? React.createElement('div', null,
                    React.createElement('div', { style:{ fontSize:'.9rem', fontWeight:600, color:'var(--cream)', display:'flex', alignItems:'center', gap:'8px' } },
                        React.createElement('span', { style:{ fontSize:'1.2rem' } }, '🎶'),
                        musicaR.song
                    ),
                    musicaR.by ? React.createElement('div', { style:{ fontSize:'.58rem', color:'var(--muted)', marginTop:'3px' } }, 'adicionado por ' + musicaR.by) : null
                  )
                : React.createElement('div', { style:{ fontSize:'.72rem', color:'var(--muted)', fontStyle:'italic', marginTop:'4px' } }, 'Qual música representa vocês agora? 🎵')
        ),

            React.createElement('div',{className:'ct'},
                'Humor de Hoje',
                React.createElement('span',{style:{marginLeft:'auto',display:'flex',alignItems:'center',gap:'6px'}},
                    streak >= 2 ? React.createElement('span',{style:{fontSize:'.6rem',fontWeight:700,color:'var(--gold)',display:'flex',alignItems:'center',gap:'2px',background:'rgba(212,168,83,.1)',border:'1px solid rgba(212,168,83,.2)',borderRadius:'10px',padding:'1px 6px'}}, 'juntos '+streak) : null,
                    streak < 2 && streakV >= 2 ? React.createElement('span',{style:{fontSize:'.55rem',fontWeight:700,color:'var(--vic)',background:'rgba(111,168,200,.08)',border:'1px solid rgba(111,168,200,.2)',borderRadius:'10px',padding:'1px 5px'}}, streakV+'d') : null,
                    streak < 2 && streakN >= 2 ? React.createElement('span',{style:{fontSize:'.55rem',fontWeight:700,color:'var(--nay)',background:'rgba(232,131,106,.08)',border:'1px solid rgba(232,131,106,.2)',borderRadius:'10px',padding:'1px 5px'}}, streakN+'d') : null
                )
            ),
            React.createElement('div',{className:'mdr'},
                MOODS.map(function(m2) {
                    return React.createElement('button',{key:m2.e,className:'mb'+(moodToday===m2.e?' sel':''),onClick:function(){ setMood(m2.e); }},
                        m2.e, React.createElement('span',null, (!iAmUser1 && MOODS_F[m2.e]) ? MOODS_F[m2.e] : m2.l)
                    );
                })
            ),
            React.createElement('div',{style:{marginTop:'12px',paddingTop:'12px',borderTop:'1px solid var(--b1)',display:'flex',alignItems:'center',gap:'10px'}},
                partnerMoodToday
                    ? React.createElement(React.Fragment, null,
                        partnerPhotoToday
                            ? React.createElement('img',{src:partnerPhotoToday,style:{width:'32px',height:'32px',borderRadius:'50%',objectFit:'cover',border:'2px solid var(--purple)',flexShrink:0}})
                            : React.createElement('div',{style:{width:'32px',height:'32px',borderRadius:'50%',background:'rgba(176,144,216,.15)',border:'2px solid var(--purple)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.75rem',fontWeight:800,color:'var(--purple)',flexShrink:0}}, partnerNameLabel.charAt(0)),
                        React.createElement('div',{style:{flex:1}},
                            React.createElement('div',{style:{fontSize:'.58rem',color:'var(--muted)',fontWeight:600,marginBottom:'2px'}}, partnerNameLabel + ' está hoje'),
                            React.createElement('div',{style:{display:'flex',alignItems:'center',gap:'6px'}},
                                React.createElement('span',{style:{fontSize:'1.6rem',lineHeight:1}}, partnerMoodToday),
                                React.createElement('span',{style:{fontSize:'.78rem',color:'var(--cream)',fontWeight:600}},
                                    (function(){
                                        var ml = (MOODS.filter(function(m2){return m2.e===partnerMoodToday;})[0]||{l:''}).l;
                                        var isPartnerFemale = iAmUser1;
                                        var genLabel = isPartnerFemale ? (MOODS_F[partnerMoodToday] || ml) : ml;
                                        var prep = MOODS_PREP[partnerMoodToday] || '';
                                        return prep + genLabel;
                                    })()
                                )
                            )
                        )
                      )
                    : React.createElement(React.Fragment, null,
                        React.createElement('div',{style:{width:'32px',height:'32px',borderRadius:'50%',background:'rgba(255,255,255,.04)',border:'2px dashed var(--b2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',flexShrink:0}}, '?'),
                        React.createElement('div',{style:{flex:1}},
                            React.createElement('div',{style:{fontSize:'.58rem',color:'var(--muted)',fontWeight:600,marginBottom:'2px'}}, partnerNameLabel + ' ainda não registrou'),
                            React.createElement('div',{style:{fontSize:'.72rem',color:'var(--muted)',fontStyle:'italic'}}, 'aguardando o humor de hoje…')
                        )
                      )
            )
        ),

        filledH.length > 0 ? React.createElement('div', { className:'card' },
            React.createElement('div',{className:'ct',style:{marginBottom:'10px'}}, 'Histórico de Humor'),
            React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px',marginBottom:'12px'}},
                React.createElement('div',{style:{background:'rgba(244,63,94,.07)',border:'1px solid rgba(244,63,94,.15)',borderRadius:'8px',padding:'7px 8px',textAlign:'center'}},
                    React.createElement('div',{style:{fontSize:'1.1rem'}}, topV||'-'),
                    React.createElement('div',{style:{fontSize:'.52rem',color:'var(--muted)',marginTop:'2px',fontWeight:600}}, realMyName),
                    React.createElement('div',{style:{fontSize:'.5rem',color:'var(--muted)',opacity:.7}}, 'humor mais comum')
                ),
                React.createElement('div',{style:{background:'rgba(139,92,246,.07)',border:'1px solid rgba(139,92,246,.15)',borderRadius:'8px',padding:'7px 8px',textAlign:'center'}},
                    React.createElement('div',{style:{fontSize:'1rem',fontWeight:700,color:syncPct>=70?'var(--ok)':syncPct>=40?'var(--gold)':'var(--muted)'}}, syncPct+'%'),
                    React.createElement('div',{style:{fontSize:'.52rem',color:'var(--muted)',marginTop:'2px',fontWeight:600}}, 'em sintonia'),
                    React.createElement('div',{style:{fontSize:'.5rem',color:'var(--muted)',opacity:.7}}, 'dias c/ ambos')
                ),
                React.createElement('div',{style:{background:'rgba(139,92,246,.07)',border:'1px solid rgba(139,92,246,.15)',borderRadius:'8px',padding:'7px 8px',textAlign:'center'}},
                    React.createElement('div',{style:{fontSize:'1.1rem'}}, topN||'-'),
                    React.createElement('div',{style:{fontSize:'.52rem',color:'var(--muted)',marginTop:'2px',fontWeight:600}}, realPartnerN),
                    React.createElement('div',{style:{fontSize:'.5rem',color:'var(--muted)',opacity:.7}}, 'humor mais comum')
                )
            ),
            (function() {
                var myPhoto  = iAmUser1 ? (settings&&settings.photoUser1) : (settings&&settings.photoUser2);
                var parPhoto = iAmUser1 ? (settings&&settings.photoUser2) : (settings&&settings.photoUser1);
                var rows = [
                    { emojiK:'lv', barK:'v', color:'var(--rose)',   nome: realMyName,   photo: myPhoto,  trend: trendV },
                    { emojiK:'ln', barK:'n', color:'var(--purple)', nome: realPartnerN, photo: parPhoto, trend: trendN }
                ];
                var maxH2 = 40;
                return React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:'8px'}},
                    rows.map(function(row) {
                        return React.createElement(React.Fragment, {key:row.nome},
                            React.createElement('div',{style:{display:'flex',alignItems:'flex-end',gap:'6px'}},
                                React.createElement('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',flexShrink:0,width:'28px',paddingBottom:'14px'}},
                                    row.photo
                                        ? React.createElement('img',{loading:'lazy',decoding:'async',src:row.photo,style:{width:'22px',height:'22px',borderRadius:'50%',objectFit:'cover',border:'2px solid '+row.color}})
                                        : React.createElement('div',{style:{width:'22px',height:'22px',borderRadius:'50%',background:'rgba(255,255,255,.08)',border:'2px solid '+row.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.6rem',fontWeight:800,color:row.color}}, row.nome.charAt(0)),
                                    React.createElement('span',{style:{fontSize:'.48rem',fontWeight:700,color:row.color,textAlign:'center',lineHeight:1.1,maxWidth:'100%',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}, row.nome)
                                ),
                                React.createElement('div',{style:{flex:1,display:'flex',gap:'3px',alignItems:'flex-end',height:(maxH2+14)+'px',overflow:'hidden'}},
                                    moodHistory.map(function(d2, hi) {
                                        var score = d2[row.barK];
                                        var em    = d2[row.emojiK];
                                        var h2    = score ? Math.max(5, Math.round(score/5*maxH2)) : 0;
                                        var isT2  = hi === moodHistory.length-1;
                                        return React.createElement('div',{key:d2.k,style:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',gap:'2px',height:'100%'}},
                                            React.createElement('span',{style:{fontSize:score?'.9rem':'.65rem',lineHeight:1,filter:isT2?'none':'grayscale(25%)',opacity:isT2?1:(score?0.72:0.3)}}, em||'.'),
                                            score>0 ? React.createElement('div',{style:{width:'100%',height:h2+'px',background:row.color,borderRadius:'3px 3px 0 0',opacity:isT2?1:.55,minHeight:'3px'}}) : React.createElement('div',{style:{width:'100%',height:'3px',background:'var(--b1)',borderRadius:'2px',opacity:.5}}),
                                            React.createElement('div',{style:{fontSize:'.44rem',color:isT2?row.color:'var(--muted)',fontWeight:isT2?700:400,textAlign:'center'}}, d2.day)
                                        );
                                    })
                                )
                            ),
                            row.trend !== 0 ? React.createElement('div',{style:{fontSize:'.62rem',color:'var(--muted)',display:'flex',alignItems:'center',gap:'5px',paddingLeft:'34px',marginTop:'-2px',marginBottom:'4px'}},
                                row.trend > 0.5
                                    ? React.createElement(React.Fragment,null, React.createElement('span',{style:{color:'var(--ok)',fontSize:'.75rem'}}, '↑'), ' ', row.nome, ' está ', React.createElement('b',{style:{color:'var(--ok)'}}, 'melhorando'), ' esta semana')
                                    : row.trend < -0.5
                                        ? React.createElement(React.Fragment,null, React.createElement('span',{style:{color:'var(--rose)',fontSize:'.75rem'}}, '↓'), ' ', row.nome, ' está ', React.createElement('b',{style:{color:'var(--rose)'}}, 'caindo'), ' esta semana')
                                        : React.createElement(React.Fragment,null, React.createElement('span',{style:{opacity:.5}}, '→'), ' ', row.nome, ' estável esta semana')
                            ) : null
                        );
                    }),
                    React.createElement('div',{style:{fontSize:'.58rem',color:'var(--muted)',display:'flex',alignItems:'center',gap:'5px',paddingLeft:'34px',marginTop:'4px',paddingBottom:'4px'}},
                        React.createElement('span',{style:{width:'6px',height:'6px',borderRadius:'50%',background:'var(--ok)',display:'inline-block',flexShrink:0}}),
                        syncPct + '% dos dias em sintonia'
                    )
                );
            })()
        ) : null,

        React.createElement('div', { onClick: function(){ setFraseExp(function(x){ return !x; }); }, style: { background:fraseExp?'linear-gradient(135deg,rgba(232,131,106,.12),rgba(176,144,216,.08))':'linear-gradient(135deg,rgba(232,131,106,.07),rgba(176,144,216,.04))',border:'1px solid rgba(232,131,106,.16)',borderRadius:'var(--rm)',padding:'14px 16px',cursor:'pointer',transition:'all .2s',width:'100%',boxSizing:'border-box',flexShrink:0 } },
            React.createElement('div',{style:{fontSize:'.56rem',color:'var(--rose)',fontWeight:800,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:'8px'}}, 'Frase do Dia'),
            React.createElement('div',{style:{display:'flex',gap:'12px',alignItems:'center'}},
                React.createElement('span',{style:{fontSize:'1.9rem',flexShrink:0,filter:'drop-shadow(0 2px 6px rgba(232,131,106,.3))'}}, frase.e),
                React.createElement('div',{style:{flex:1}},
                    React.createElement('div',{style:Object.assign({fontSize:fraseExp?'.85rem':'.78rem',color:'var(--cream)',fontStyle:'italic',lineHeight:1.6,transition:'all .2s'},fraseExp?{}:{overflow:'hidden',display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical'})}, frase.t),
                    React.createElement('div',{style:{fontSize:'.58rem',color:'var(--muted)',marginTop:'5px',fontWeight:700,letterSpacing:'.05em',display:'flex',alignItems:'center',justifyContent:'space-between'}},
                        React.createElement('span',null, frase.tag.toUpperCase()),
                        React.createElement('span',{style:{opacity:.5}}, fraseExp?'▲':'▼')
                    )
                )
            )
        )
    );
}

/* ═══════════════════════════════════════════
   🗓 AGENDA
═══════════════════════════════════════════ */
function Agenda(props) {
    var cur     = props.cur;
    var evRProp = props.evRProp;

    var s   = _getS();
    var aNV = s.myName      || 'Pessoa 1';
    var aNN = s.partnerName || 'Pessoa 2';

    var _evROwn = useList('events');
    var evR     = evRProp !== undefined ? evRProp : _evROwn;

    var events = useMemo(function() {
        if (!evR) return [];
        return Object.entries(evR).map(function(e2) { return Object.assign({ id: e2[0] }, e2[1]); });
    }, [evR]);

    var y   = cur.getFullYear();
    var m   = cur.getMonth();
    var tk  = dk(td());

    // calendario cells
    var cells = useMemo(function() {
        var first = new Date(y, m, 1).getDay();
        var dim   = new Date(y, m+1, 0).getDate();
        var dip   = new Date(y, m, 0).getDate();
        var cs    = [];
        for (var i = first-1; i >= 0; i--)
            cs.push({ d: dip-i, mo: m-1, yr: m===0?y-1:y, o: true });
        for (var d2 = 1; d2 <= dim; d2++)
            cs.push({ d: d2, mo: m, yr: y, o: false });
        while (cs.length % 7 !== 0)
            cs.push({ d: cs.length - dim - first + 1, mo: m+1, yr: m===11?y+1:y, o: true });
        return cs;
    }, [y, m]);

    function ck(c) {
        return c.yr + '-' + String(c.mo+1).padStart(2,'0') + '-' + String(c.d).padStart(2,'0');
    }

    // tela: 'main' | 'form' | 'edit'
    var _tela  = useState('main'); var tela   = _tela[0];  var setTela  = _tela[1];
    var _sel   = useState(dk(_brt(new Date()))); var sel = _sel[0]; var setSel = _sel[1];
    var _busca = useState('');     var busca  = _busca[0]; var setBusca = _busca[1];

    // form novo evento
    var _fName  = useState('');            var fName  = _fName[0];  var setFName  = _fName[1];
    var _fTime  = useState('');            var fTime  = _fTime[0];  var setFTime  = _fTime[1];
    var _fCat   = useState('compromisso'); var fCat   = _fCat[0];   var setFCat   = _fCat[1];
    var _fWho   = useState('ambos');       var fWho   = _fWho[0];   var setFWho   = _fWho[1];
    var _fRecur = useState('nenhuma');     var fRecur = _fRecur[0]; var setFRecur = _fRecur[1];
    var _fPhoto = useState(null);          var fPhoto = _fPhoto[0]; var setFPhoto = _fPhoto[1];
    var _fDate  = useState(null);          var fDate  = _fDate[0];  var setFDate  = _fDate[1];

    // form editar evento
    var _editId   = useState(null); var editId   = _editId[0];   var setEditId   = _editId[1];
    var _eName    = useState('');   var eName    = _eName[0];    var setEName    = _eName[1];
    var _eTime    = useState('');   var eTime    = _eTime[0];    var setETime    = _eTime[1];
    var _eCat     = useState('');   var eCat     = _eCat[0];     var setECat     = _eCat[1];
    var _eWho     = useState('');   var eWho     = _eWho[0];     var setEWho     = _eWho[1];
    var _eDate    = useState('');   var eDate    = _eDate[0];    var setEDate    = _eDate[1];

    // input file ref para foto (necessário para acionar o picker)
    var fileRef = React.useRef(null);

    function handlePhotoFile(ev) {
        var file = ev.target.files && ev.target.files[0];
        ev.target.value = '';
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(re) {
            var img = new window.Image();
            img.onload = function() {
                var max = 900;
                var sc  = Math.min(max/img.width, max/img.height, 1);
                var canvas = document.createElement('canvas');
                canvas.width  = Math.round(img.width  * sc);
                canvas.height = Math.round(img.height * sc);
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                var dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                var path = 'eventos/' + Date.now() + '_' + Math.random().toString(36).slice(2) + '.jpg';
                fbUpload(path, dataUrl,
                    function(url) { setFPhoto(url); },
                    function(err) { console.error(err); toast('Erro ao enviar foto ☁️'); }
                );
            };
            img.onerror = function() { toast('Erro ao carregar imagem'); };
            img.src = re.target.result;
        };
        reader.onerror = function() { toast('Erro ao ler arquivo'); };
        reader.readAsDataURL(file);
    }

    function openAdd(dateSel) {
        setFName(''); setFTime(''); setFCat('compromisso');
        setFWho('ambos'); setFRecur('nenhuma'); setFPhoto(null);
        setFDate(dateSel || sel);
        setTela('form');
    }

    function saveEv() {
        if (!fName.trim()) { toast('Preencha a descrição! 📝'); return; }
        vib(30);
        var baseData = { name: fName.trim(), time: fTime, cat: fCat, who: fWho };
        if (fPhoto) baseData.photo = fPhoto;
        var dateToUse = fDate || sel;

        try { fbp('events', Object.assign({ date: dateToUse }, baseData)); } catch(ex) {}

        if (fRecur !== 'nenhuma') {
            var parts = dateToUse.split('-');
            var dd = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
            var maxRep = fRecur === 'anual' ? 5 : fRecur === 'diario' ? 30 : 11;
            for (var i = 1; i <= maxRep; i++) {
                if      (fRecur === 'semanal')   dd.setDate(dd.getDate()+7);
                else if (fRecur === 'quinzenal')  dd.setDate(dd.getDate()+14);
                else if (fRecur === 'mensal')     dd.setMonth(dd.getMonth()+1);
                else if (fRecur === 'anual')      dd.setFullYear(dd.getFullYear()+1);
        else if (fRecur === 'diario')     dd.setDate(dd.getDate()+1);
                try { fbp('events', Object.assign({ date: dk(dd) }, baseData)); } catch(ex) {}
            }
            toast('Evento recorrente criado! 🔁');
        } else {
            toast('Evento adicionado! 📅');
        }
        setTela('main');
    }

    function openEdit(ev) {
        setEditId(ev.id);
        setEName(ev.name  || '');
        setETime(ev.time  || '');
        setECat(ev.cat    || 'compromisso');
        setEWho(ev.who    || 'ambos');
        setEDate(ev.date  || sel);
        setTela('edit');
    }

    function saveEdit() {
        if (!eName.trim()) { toast('Preencha a descrição! 📝'); return; }
        try { fbu('events/' + editId, { name: eName.trim(), date: eDate || sel, time: eTime, cat: eCat, who: eWho }); } catch(ex) {}
        toast('Evento atualizado! ✅');
        setTela('main'); setEditId(null);
    }

    function delEv(ev) {
        if (!window.confirm('Apagar este evento?')) return;
        vib(35);
        var saved = Object.assign({}, ev);
        try { fbr('events/' + ev.id); } catch(ex) {}
        toast('Evento removido', 4000, function() {
            try { fbp('events', saved); } catch(ex) {}
        });
    }

    var selEvs  = events.filter(function(e) { return e.date === sel; })
                        .sort(function(a, b) { return (a.time||'') > (b.time||'') ? 1 : -1; });
    var selParts = sel.split('-');
    var selD     = new Date(parseInt(selParts[0]), parseInt(selParts[1])-1, parseInt(selParts[2]));
    var selL     = WF[selD.getDay()] + ', ' + selD.getDate() + ' de ' + MN[selD.getMonth()];

    var upcoming = events.filter(function(e) { return e.date >= tk; })
        .sort(function(a, b) {
            var _mn2 = getMyName();
            var aMe = a.who===_mn2||a.who==='ambos';
            var bMe = b.who===_mn2||b.who==='ambos';
            if (aMe && !bMe) return -1;
            if (!aMe && bMe) return 1;
            return a.date > b.date ? 1 : -1;
        })
        .slice(0, 6);

    var buscaLow    = busca.toLowerCase().trim();
    var buscaResult = buscaLow
        ? events.filter(function(e) { return (e.name||'').toLowerCase().indexOf(buscaLow) >= 0; })
                .sort(function(a, b) { return a.date > b.date ? 1 : -1; })
                .slice(0, 8)
        : [];

    var RECURS = [
        ['nenhuma',   'Único'],
        ['semanal',   'Semanal (12x)'],
        ['quinzenal', 'Quinzenal (12x)'],
        ['mensal',    'Todo mês (12x)'],
        ['anual',     'Todo ano (5x)'],
        ['diario',    'Todo dia (30x)']
    ];

    var cevKeys = Object.keys(CEV);

    // ── Tela: form novo evento ─────────────────────────────────────────
    if (tela === 'form') {
        return React.createElement('div', { className: 'fg', style: { gap: '12px' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                React.createElement('button', { onClick: function() { setTela('main'); }, style: { background: 'none', border: 'none', color: 'var(--rose)', fontSize: '1rem', cursor: 'pointer', padding: '4px 0', flexShrink: 0 } }, '← Voltar'),
                React.createElement('div', { className: 'sec-title', style: { flex: 1 } }, '📅 Novo Evento')
            ),
            React.createElement('div', { className: 'card fg', style: { gap: '11px' } },
                React.createElement('input', { className: 'f', placeholder: 'Descrição do evento...', value: fName, onChange: function(e) { setFName(e.target.value); }, autoFocus: true }),
                React.createElement('div', { style: { display: 'flex', gap: '8px' } },
                    React.createElement('input', { type: 'time', className: 'f', style: { flex: 1 }, value: fTime, onChange: function(e) { setFTime(e.target.value); } }),
                    React.createElement('select', { className: 'f', style: { flex: '0 0 140px' }, value: fCat, onChange: function(e) { setFCat(e.target.value); } },
                        cevKeys.map(function(k) {
                            return React.createElement('option', { key: k, value: k }, (CEV[k]?CEV[k].e:'') + ' ' + k.charAt(0).toUpperCase()+k.slice(1));
                        })
                    )
                ),
                React.createElement('div', { style: { fontSize: '.68rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '2px' } }, '📆 Data:'),
                React.createElement(DateBR, { value: fDate || sel, onChange: setFDate }),
                React.createElement('div', { style: { fontSize: '.68rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '2px' } }, '👤 Quem:'),
                React.createElement('div', { className: 'wt' },
                    React.createElement('button', { className: 'wb v' + (fWho === 'user1' ? ' on' : ''), onClick: function() { setFWho('user1'); } }, gNomeBtn(aNV)),
                    React.createElement('button', { className: 'wb n' + (fWho === 'user2'  ? ' on' : ''), onClick: function() { setFWho('user2');  } }, gNomeBtn(aNN)),
                    React.createElement('button', { className: 'wb b' + (fWho === 'ambos'  ? ' on' : ''), onClick: function() { setFWho('ambos');  } }, 'Ambos')
                ),
                // Foto
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                    React.createElement('button', { type: 'button', onClick: function() { if (fileRef.current) fileRef.current.click(); }, style: { flex: '0 0 auto', padding: '8px 12px', background: 'var(--s1)', border: '1px solid var(--b2)', color: 'var(--text)', borderRadius: 'var(--rs)', fontSize: '.78rem', cursor: 'pointer', fontWeight: 600 } }, fPhoto ? 'Trocar foto' : 'Adicionar foto'),
                    React.createElement('input', { ref: fileRef, type: 'file', accept: 'image/*', style: { display: 'none' }, onChange: handlePhotoFile }),
                    fPhoto ? React.createElement('div', { style: { position: 'relative', flexShrink: 0 } },
                        React.createElement('img', { src: fPhoto, style: { width: 36, height: 36, borderRadius: 6, objectFit: 'cover', border: '1.5px solid var(--rose)', display: 'block' } }),
                        React.createElement('button', { onClick: function() { setFPhoto(null); }, style: { position: 'absolute', top: -5, right: -5, background: 'var(--danger)', color: 'var(--fg)', border: 'none', borderRadius: '50%', width: 16, height: 16, fontSize: '.5rem', cursor: 'pointer', lineHeight: '16px', textAlign: 'center', padding: 0 } }, 'x')
                    ) : null
                ),
                // Recorrência
                React.createElement('div', { style: { fontSize: '.68rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '2px' } }, '🔁 Recorrência:'),
                React.createElement('select', { className: 'f', value: fRecur, onChange: function(e) { setFRecur(e.target.value); } },
                    RECURS.map(function(r) { return React.createElement('option', { key: r[0], value: r[0] }, r[1]); })
                ),
                React.createElement('div', { style: { display: 'flex', gap: '8px', marginTop: '4px' } },
                    React.createElement('button', { className: 'bs', style: { flex: 1 }, onClick: function() { setTela('main'); } }, '✕ Cancelar'),
                    React.createElement('button', { className: 'bp', style: { flex: 1 }, onClick: saveEv }, '📅 Adicionar')
                )
            )
        );
    }

    // ── Tela: editar evento ────────────────────────────────────────────
    if (tela === 'edit') {
        return React.createElement('div', { className: 'fg', style: { gap: '12px' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                React.createElement('button', { onClick: function() { setTela('main'); setEditId(null); }, style: { background: 'none', border: 'none', color: 'var(--rose)', fontSize: '1rem', cursor: 'pointer', padding: '4px 0', flexShrink: 0 } }, '← Voltar'),
                React.createElement('div', { className: 'sec-title', style: { flex: 1 } }, '✏️ Editar Evento')
            ),
            React.createElement('div', { className: 'card fg', style: { gap: '11px' } },
                React.createElement('input', { className: 'f', placeholder: 'Descrição...', value: eName, onChange: function(e) { setEName(e.target.value); }, autoFocus: true }),
                React.createElement('div', { style: { display: 'flex', gap: '8px' } },
                    React.createElement('input', { type: 'time', className: 'f', style: { flex: 1 }, value: eTime, onChange: function(e) { setETime(e.target.value); } }),
                    React.createElement('select', { className: 'f', style: { flex: '0 0 140px' }, value: eCat, onChange: function(e) { setECat(e.target.value); } },
                        cevKeys.map(function(k) {
                            return React.createElement('option', { key: k, value: k }, (CEV[k]?CEV[k].e:'') + ' ' + k.charAt(0).toUpperCase()+k.slice(1));
                        })
                    )
                ),
                React.createElement('div', { style: { fontSize: '.68rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '2px' } }, '📆 Data:'),
                React.createElement(DateBR, { value: eDate, onChange: setEDate }),
                React.createElement('div', { style: { fontSize: '.68rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '2px' } }, '👤 Quem:'),
                React.createElement('div', { className: 'wt' },
                    React.createElement('button', { className: 'wb v' + (eWho === 'user1' ? ' on' : ''), onClick: function() { setEWho('user1'); } }, gNomeBtn(aNV)),
                    React.createElement('button', { className: 'wb n' + (eWho === 'user2'  ? ' on' : ''), onClick: function() { setEWho('user2');  } }, gNomeBtn(aNN)),
                    React.createElement('button', { className: 'wb b' + (eWho === 'ambos'  ? ' on' : ''), onClick: function() { setEWho('ambos');  } }, 'Ambos')
                ),
                React.createElement('div', { style: { display: 'flex', gap: '8px', marginTop: '4px' } },
                    React.createElement('button', { className: 'bs', style: { flex: 1 }, onClick: function() { setTela('main'); setEditId(null); } }, '✕ Cancelar'),
                    React.createElement('button', { className: 'bp', style: { flex: 1 }, onClick: saveEdit }, '💾 Salvar')
                )
            )
        );
    }

    // ── Tela: main ────────────────────────────────────────────────────
    return React.createElement('div', { className: 'ps' },

        // Busca
        React.createElement('div', { style: { position: 'relative' } },
            React.createElement('input', { className: 'f', value: busca, onChange: function(e) { setBusca(e.target.value); }, placeholder: 'Buscar evento...', style: { paddingRight: busca ? '36px' : '12px' } }),
            busca ? React.createElement('button', { onClick: function() { setBusca(''); }, style: { position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', fontSize: '1rem', cursor: 'pointer', padding: '2px' } }, 'x') : null
        ),

        // Resultados de busca
        busca ? React.createElement('div', { className: 'card', style: { padding: '8px 12px' } },
            buscaResult.length === 0
                ? React.createElement('div', { style: { fontSize: '.75rem', color: 'var(--muted)', textAlign: 'center', padding: '8px' } }, 'Nenhum evento encontrado')
                : buscaResult.map(function(ev) {
                    var p    = (ev.date || '').split('-');
                    var past = ev.date < tk;
                    var catC = ev.cat && CEV[ev.cat] ? CEV[ev.cat] : CEV.outro;
                    return React.createElement('div', { key: ev.id, style: { display: 'flex', gap: '10px', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--b2)', opacity: past ? 0.45 : 1 } },
                        React.createElement('div', { style: { width: 32, height: 32, borderRadius: '8px', background: 'rgba(255,255,255,.06)', border: '1px solid var(--b2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } },
                            React.createElement('div', { style: { fontSize: '.45rem', color: 'var(--muted)', fontWeight: 700 } }, ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][parseInt(p[1])-1] || ''),
                            React.createElement('div', { style: { fontSize: '.78rem', fontWeight: 700, color: 'var(--cream)', lineHeight: 1 } }, p[2] || '')
                        ),
                        React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                            React.createElement('div', { style: { fontSize: '.75rem', fontWeight: 700, color: 'var(--cream)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, (catC.e ? catC.e + ' ' : '') + ev.name),
                            React.createElement('div', { style: { fontSize: '.6rem', color: 'var(--muted)' } }, (ev.time || 'Dia todo') + ' · ' + (p[2]||'') + '/' + (p[1]||'') + '/' + (p[0]||''))
                        )
                    );
                })
        ) : null,

        // Calendario
        React.createElement('div', { className: 'card' },
            React.createElement('div', { className: 'cwd' }, WD.map(function(w, i) { return React.createElement('span', { key: i }, w); })),
            React.createElement('div', { className: 'cg' },
                cells.map(function(c, i) {
                    var d2   = ck(c);
                    var dots = [];
                    var seen = {};
                    events.filter(function(e) { return e.date === d2; }).forEach(function(e) {
                        var col = (CEV[e.cat] && CEV[e.cat].c) ? CEV[e.cat].c : 'var(--muted)';
                        if (!seen[col] && dots.length < 3) { seen[col] = true; dots.push(col); }
                    });
                    return React.createElement('div', {
                        key: i,
                        className: 'cc' + (c.o?' ot':'') + (d2===tk?' td':'') + (d2===sel?' sel':''),
                        onClick: function() { setSel(d2); vib(18); }
                    },
                        React.createElement('span', { className: 'dn' }, c.d),
                        React.createElement('div', { className: 'dd' },
                            dots.map(function(col, j) { return React.createElement('span', { key: j, className: 'dot', style: { background: col } }); })
                        )
                    );
                })
            )
        ),

        // Eventos do dia selecionado
        React.createElement('div', { className: 'card' },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' } },
                React.createElement('div', { className: 'ct', style: { marginBottom: 0 } }, selL),
                React.createElement('button', { className: 'bp', style: { width: 'auto', padding: '7px 12px', fontSize: '.75rem', flexShrink: 0 }, onClick: function() { openAdd(sel); } }, '+ Evento')
            ),
            selEvs.length === 0
                ? React.createElement('div', { className: 'empty' },
                    React.createElement('span', { className: 'ei' }, '🌙'),
                    'Nenhum evento'
                )
                : React.createElement('div', null,
                    selEvs.map(function(ev, idx) {
                        var catC  = (ev.cat && CEV[ev.cat]) ? CEV[ev.cat] : CEV.outro;
                        var isLast = idx === selEvs.length - 1;
                        return React.createElement('div', { key: ev.id, style: { borderBottom: isLast ? 'none' : '1px solid var(--b1)' } },
                            React.createElement('div', { className: 'li', style: { borderRadius: 0, flexDirection: 'column', gap: 0, padding: 0 } },
                                ev.photo ? React.createElement('img', { loading: 'lazy', decoding: 'async', src: ev.photo, style: { width: '100%', maxHeight: 100, objectFit: 'cover', borderRadius: '8px 8px 0 0', display: 'block' } }) : null,
                                React.createElement('div', { style: { display: 'flex', alignItems: 'center', padding: '8px 10px', gap: '8px' } },
                                    React.createElement('div', { className: 'lbar', style: { background: catC.c || 'var(--muted)' } }),
                                    React.createElement('div', { className: 'lb', style: { flex: 1 } },
                                        React.createElement('div', { className: 'ln' },
                                            (ev.recorr && ev.recorr !== 'nunca') ? React.createElement('span', { style: { marginRight: '3px' } }, '🔁 ') : null,
                                            ev.name
                                        ),
                                        React.createElement('div', { className: 'lm' }, (ev.time ? ev.time : 'Dia todo') + ' · ' + (catC.e ? catC.e + ' ' : '') + (ev.cat||'').charAt(0).toUpperCase()+(ev.cat||'').slice(1))
                                    ),
                                    React.createElement(WB, { who: ev.who }),
                                    React.createElement('button', { onClick: function() { openEdit(ev); }, style: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: '.85rem', cursor: 'pointer', padding: '4px', opacity: .7 } }, '✏️'),
                                    React.createElement('button', { onClick: function() { delEv(ev); }, style: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: '.85rem', cursor: 'pointer', padding: '4px', opacity: .6 } }, '🗑️')
                                )
                            )
                        );
                    })
                )
        ),

        // Proximos eventos
        upcoming.length > 0 ? React.createElement('div', { className: 'card' },
            React.createElement('div', { className: 'ct' }, 'Proximos'),
            upcoming.map(function(ev, idx) {
                var p     = (ev.date || '').split('-');
                var dist  = dif(td(), new Date(parseInt(p[0]), parseInt(p[1])-1, parseInt(p[2])));
                var catC  = (ev.cat && CEV[ev.cat]) ? CEV[ev.cat] : CEV.outro;
                var isLast = idx === upcoming.length - 1;
                var distL  = dist === 0 ? 'Hoje' : dist === 1 ? 'Amanha' : dist + 'd';
                return React.createElement('div', { key: ev.id, style: { display: 'flex', gap: '8px', alignItems: 'center', padding: '9px 0', borderBottom: isLast ? 'none' : '1px solid var(--b1)', cursor: 'pointer' }, onClick: function() { setSel(ev.date || sel); } },
                    React.createElement('div', { className: 'lbar', style: { background: catC.c || 'var(--muted)', alignSelf: 'stretch', borderRadius: 2 } }),
                    React.createElement('div', { className: 'lb', style: { flex: 1 } },
                        React.createElement('div', { className: 'ln' }, ev.name),
                        React.createElement('div', { className: 'lm' }, (p[2]||'') + '/' + (p[1]||'') + ' · ' + (catC.e ? catC.e + ' ' : '') + distL)
                    ),
                    React.createElement(WB, { who: ev.who }),
                    React.createElement('button', { onClick: function(e) { e.stopPropagation(); openEdit(ev); }, style: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: '.85rem', cursor: 'pointer', padding: '4px', opacity: .7 } }, '✏️'),
                    React.createElement('button', { onClick: function(e) { e.stopPropagation(); delEv(ev); }, style: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: '.85rem', cursor: 'pointer', padding: '4px', opacity: .6 } }, '🗑️')
                );
            })
        ) : null
    );
}

// helper para label do botão quem (nomes curtos)
function gNomeBtn(nome) { return nome && nome.length > 8 ? nome.slice(0,8) + '…' : (nome || '?'); }

/* ═══════════════════════════════════════════
   💸 GASTOS
═══════════════════════════════════════════ */
function GastosLista(props) {
var sorted   = props.sorted || [];
    var openEdit = props.openEdit;
    var delGasto = props.delGasto;
var _gpg   = usePagination(sorted, 20, sorted.length);
    var gSlice = _gpg.slice; var gPg = _gpg.pg; var gPages = _gpg.pages; var gTotal = _gpg.total; var gSetPg = _gpg.setPg;
    return React.createElement('div', null,
        gSlice.map(function(g) {
            var p   = (g.date || '').split('-');
            var cgG = CG[g.cat] || {};
            return React.createElement('div', { key: g.id, style: { borderBottom: '1px solid var(--b1)' } },
                React.createElement('div', { className: 'gi', style: { borderRadius: 0 } },
                    React.createElement('div', { className: 'gc', style: { background: cgG.bg || 'rgba(255,255,255,.05)' } }, cgG.e || ''),
                    React.createElement('div', { className: 'ginfo' },
                        React.createElement('div', { className: 'gn' }, g.desc),
                        React.createElement('div', { className: 'gm' },
                            (p[2] || '') + '/' + (p[1] || ''),
                            React.createElement(WB, { who: g.who }),
                            g.nota ? React.createElement('span', { style: { display: 'block', fontSize: '.6rem', color: 'var(--muted)', marginTop: '1px', fontStyle: 'italic' } }, g.nota) : null
                        )
                    ),
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 } },
                        React.createElement('div', { className: 'gv', style: { color: cgG.c || 'var(--gold)' } }, fR(g.val)),
                        React.createElement('button', { onClick: function() { openEdit(g); }, style: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: '.85rem', cursor: 'pointer', padding: '4px', opacity: .7 } }, '✏️'),
                        React.createElement('button', { onClick: function() { delGasto(g.id); }, style: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: '.85rem', cursor: 'pointer', padding: '4px', opacity: .6 } }, '🗑️')
                    )
                )
            );
        }),
        React.createElement(PgBar, { pg: gPg, pages: gPages, total: gTotal, setPg: gSetPg, label: 'gastos' })
    );
}
function Gastos(props) {
    var cur = props.cur;
    var mkC = mk(cur);
    var mkKey = mkC.replace('-', '_');

    var s   = _getS();
    var gNV = s.myName      || 'Pessoa 1';
    var gNN = s.partnerName || 'Pessoa 2';

    var gastR  = useList('gastos');
    var budRaw = useVal('budget_' + mkC, 0);
    var budLeg = useVal('budget', 0);
    var budV   = budRaw || budLeg || 0;

    var gastos = useMemo(function() {
        if (!gastR) return [];
        return Object.entries(gastR).map(function(e2) { return Object.assign({ id: e2[0] }, e2[1]); });
    }, [gastR]);

    var mg = useMemo(function() {
        return gastos.filter(function(g) { return g.date && g.date.indexOf(mkC) === 0; });
    }, [gastos, mkC]);

    var total = useMemo(function() {
        return mg.reduce(function(sum, g) { return sum + (g.val || 0); }, 0);
    }, [mg]);

    // tela: 'main' | 'form' | 'edit'
    var _tela   = useState('main'); var tela    = _tela[0];   var setTela   = _tela[1];

    // form novo gasto
    var _fDesc   = useState('');                  var fDesc   = _fDesc[0];   var setFDesc   = _fDesc[1];
    var _fVal    = useState('');                  var fVal    = _fVal[0];    var setFVal    = _fVal[1];
    var _fCat    = useState('alimentacao');       var fCat    = _fCat[0];    var setFCat    = _fCat[1];
    var _fDate   = useState(dk(_brt(new Date()))); var fDate  = _fDate[0];   var setFDate   = _fDate[1];
    var _fWho    = useState('ambos');             var fWho    = _fWho[0];    var setFWho    = _fWho[1];
    var _fNota   = useState('');                  var fNota   = _fNota[0];   var setFNota   = _fNota[1];
    var _fRecorr = useState('nunca');             var fRecorr = _fRecorr[0]; var setFRecorr = _fRecorr[1];

    // form editar gasto
    var _editId   = useState(null); var editId   = _editId[0];   var setEditId   = _editId[1];
    var _eDesc    = useState('');   var eDesc    = _eDesc[0];    var setEDesc    = _eDesc[1];
    var _eVal     = useState('');   var eVal     = _eVal[0];     var setEVal     = _eVal[1];
    var _eCat     = useState('');   var eCat     = _eCat[0];     var setECat     = _eCat[1];
    var _eDate    = useState('');   var eDate    = _eDate[0];    var setEDate    = _eDate[1];

    // estado tela main
    var _fcat       = useState('');    var fcat       = _fcat[0];       var setFcat       = _fcat[1];
    var _splitPct   = useState(function() { var ss = _getS(); return ss.splitPct !== undefined ? ss.splitPct : 50; });
    var splitPct    = _splitPct[0]; var setSplitPct = _splitPct[1];
    var _contaVal   = useState('');    var contaVal   = _contaVal[0];   var setContaVal   = _contaVal[1];
    var _budInput   = useState(budV ? String(budV) : ''); var budInput = _budInput[0]; var setBudInput = _budInput[1];
    var _gphSel     = useState(null);  var gphSel     = _gphSel[0];     var setGphSel     = _gphSel[1];

    // Sincroniza budInput quando o mês muda ou o orçamento é carregado do Firebase
    useEffect(function() {
        setBudInput(budV ? String(budV) : '');
    }, [budV, mkC]);

    // grafico 6 meses simples
    var gph = useMemo(function() {
        var arr = [];
        for (var i = 0; i < 6; i++) {
            var d = new Date(cur.getFullYear(), cur.getMonth() - 5 + i, 1);
            var k = mk(d);
            var t = gastos.filter(function(g) { return g.date && g.date.indexOf(k) === 0; })
                          .reduce(function(sg, g) { return sg + (g.val||0); }, 0);
            arr.push({ t: t, l: MN[d.getMonth()], cur: i === 5 });
        }
        return arr;
    }, [gastos, cur]);
    var maxG = 1;
    gph.forEach(function(g) { if (g.t > maxG) maxG = g.t; });

    var bud = budV || 0;
    var pct = bud > 0 ? Math.min(Math.round(total / bud * 100), 100) : 0;
    var bc  = pct > 85 ? 'var(--danger)' : pct > 65 ? 'var(--gold)' : 'var(--sage)';

    // por categoria
    var cats = {};
    mg.forEach(function(g) { if (g.cat && CG[g.cat]) { cats[g.cat] = (cats[g.cat]||0) + (g.val||0); } });
    var sc = Object.entries(cats).sort(function(a, b) { return b[1] - a[1]; });
    var mc = sc.length > 0 ? sc[0][1] : 1;

    // divisao
    var vicPaga  = mg.filter(function(g){ return g.who === gNV.toLowerCase(); }).reduce(function(s,g){ return s+(g.val||0); }, 0);
    var nayPaga  = mg.filter(function(g){ return g.who === gNN.toLowerCase(); }).reduce(function(s,g){ return s+(g.val||0); }, 0);
    var ambPaga  = mg.filter(function(g){ return g.who === 'ambos';           }).reduce(function(s,g){ return s+(g.val||0); }, 0);
    var vicTotal = vicPaga + ambPaga / 2;
    var nayTotal = nayPaga + ambPaga / 2;
    var diff     = vicTotal - nayTotal;
    var idealV   = total * (splitPct / 100);
    var idealN   = total * ((100 - splitPct) / 100);
    var balV     = vicTotal - idealV;
    var balN     = nayTotal - idealN;

    var filtered = fcat ? mg.filter(function(g){ return g.cat === fcat; }) : mg;
    var sorted   = filtered.slice().sort(function(a, b) { return (b.date||'') > (a.date||'') ? 1 : -1; });

    // helpers
    function tds() {
        var t = _brt(new Date());
        return t.getFullYear() + '-' + String(t.getMonth()+1).padStart(2,'0') + '-' + String(t.getDate()).padStart(2,'0');
    }

    function saveSplit(v) { setSplitPct(v); try { fbu('settings', { splitPct: v }); } catch(ex) {} }

    function saveBud() {
        var v = parseFloat(budInput) || 0;
        try { fbs('budget_' + mkC, v); fbs('budget', v); } catch(ex) {}
        toast('Orçamento salvo! 💰');
    }

    function exportCSV() {
        var rows = [['Data','Descricao','Valor','Categoria','Quem','Nota']];
        mg.forEach(function(g) { rows.push([g.date||'', g.desc||'', g.val||0, g.cat||'', g.who||'', g.nota||'']); });
        var csv = rows.map(function(r) { return r.map(function(v) { return '"' + String(v).replace(/"/g,'""') + '"'; }).join(','); }).join('\n');
        try {
            var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            var url  = URL.createObjectURL(blob);
            var a    = document.createElement('a');
            a.href = url; a.download = 'gastos_' + mkC + '.csv'; a.click();
            URL.revokeObjectURL(url);
            toast('CSV exportado!');
            vib(20);
        } catch(ex) { toast('Erro ao exportar'); }
    }

    // ── Adicionar gasto ────────────────────────────────────────────────
    function openAdd() {
        setFDesc(''); setFVal(''); setFCat('alimentacao');
        setFDate(dk(_brt(new Date()))); setFWho('ambos'); setFNota(''); setFRecorr('nunca');
        setTela('form');
    }

    function saveGasto() {
        if (!fDesc.trim()) { toast('Preencha a descrição! 📝'); return; }
        var v = parseFloat(fVal);
        if (!v || v <= 0) { toast('Valor inválido! 💸'); return; }
        vib(28);
        var d = { desc: fDesc.trim(), val: v, cat: fCat, date: fDate || tds(), who: fWho, nota: fNota.trim() };
        if (fRecorr !== 'nunca') d.recorr = fRecorr;
        try { fbp('gastos', d); } catch(ex) {}
        toast(fRecorr !== 'nunca' ? 'Gasto recorrente salvo! 🔁' : 'Gasto registrado! 💸');
        setTela('main');
    }

    // ── Editar gasto ────────────────────────────────────────────────────
    function openEdit(g) {
        setEditId(g.id);
        setEDesc(g.desc || '');
        setEVal(g.val ? String(g.val) : '');
        setECat(g.cat || 'alimentacao');
        setEDate(g.date || '');
        setTela('edit');
    }

    function saveEdit() {
        if (!eDesc.trim()) { toast('Preencha a descrição! 📝'); return; }
        var v = parseFloat(eVal);
        if (!v || v <= 0) { toast('Valor inválido! 💸'); return; }
        try { fbu('gastos/' + editId, { desc: eDesc.trim(), val: v, cat: eCat, date: eDate }); } catch(ex) {}
        toast('Gasto atualizado! ✅');
        setTela('main');
    }

    function delGasto(id) {
        if (!window.confirm('Apagar este gasto?')) return;
        vib(35);
        try { fbr('gastos/' + id); } catch(ex) {}
        toast('Removido');
    }

    // Categoria: todas as chaves de CG
    var cgKeys = Object.keys(CG);

    function renderDonut() {
        if (sc.length === 0) return null;
        var total2 = sc.reduce(function(s, e2) { return s + e2[1]; }, 0);
        if (!total2) return null;
        var acc    = 0;
        var R = 52, cx = 60, cy = 60;
        function arc(start, end, r) {
            if (end - start >= 0.9999) return 'M'+cx+','+(cy-r)+' A'+r+','+r+',0,1,1,'+(cx-.01)+','+(cy-r)+' Z';
            var a1 = start*2*Math.PI - Math.PI/2;
            var a2 = end  *2*Math.PI - Math.PI/2;
            var x1 = cx+r*Math.cos(a1), y1 = cy+r*Math.sin(a1);
            var x2 = cx+r*Math.cos(a2), y2 = cy+r*Math.sin(a2);
            return 'M'+cx+','+cy+' L'+x1+','+y1+' A'+r+','+r+',0,'+(end-start>.5?1:0)+',1,'+x2+','+y2+' Z';
        }
var slices = sc.slice(0,6).filter(function(e2){return !!(CG[e2[0]]);}).map(function(e2) {
            var catK = e2[0], val = e2[1];
            var p = val/total2, start = acc;
            acc += p;
            return { cat: catK, val: val, pct: p, start: start };
        });
        return React.createElement('div', { className: 'card', style: { padding: '12px 14px' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' } },
                React.createElement('div', { className: 'ct', style: { marginBottom: 0 } }, 'Por Categoria'),
                React.createElement('button', { onClick: function() {
                    var csvLines = ['Gastos ' + MN[cur.getMonth()] + ' ' + cur.getFullYear()];
                    slices.forEach(function(x) { csvLines.push((CG[x.cat]?CG[x.cat].e:'') + ' ' + x.cat + ': ' + fR(x.val)); });
                    csvLines.push('Total: ' + fR(total2));
                    var text = csvLines.join('\n');
                    if (navigator.share) { navigator.share({ title: 'Gastos', text: text }).catch(function(){}); }
                    else if (navigator.clipboard) { navigator.clipboard.writeText(text).then(function(){ toast('Copiado!'); }); }
                }, style: { padding: '4px 10px', borderRadius: '10px', border: '1px solid var(--b2)', background: 'transparent', color: 'var(--muted)', fontSize: '.65rem', fontWeight: 700, cursor: 'pointer' } }, 'Compartilhar')
            ),
            React.createElement('div', { style: { display: 'flex', gap: '12px', alignItems: 'center' } },
                React.createElement('svg', { width: '120', height: '120', viewBox: '0 0 120 120', style: { flexShrink: 0 } },
                    slices.map(function(sl, i) {
                        return React.createElement('path', { key: sl.cat, d: arc(sl.start, sl.start+sl.pct, R), fill: (CG[sl.cat]?CG[sl.cat].c:'#666'), opacity: fcat === sl.cat || !fcat ? 1 : .4, style: { cursor: 'pointer', transition: 'opacity .15s' }, onClick: function(){ setFcat(fcat === sl.cat ? '' : sl.cat); } });
                    }),
                    React.createElement('circle', { cx: cx, cy: cy, r: '30', fill: 'var(--card)', stroke: 'var(--b2)', strokeWidth: '1' }),
                    React.createElement('circle', { cx: cx, cy: cy, r: '28', fill: 'var(--card)' }),
                    React.createElement('text', { x: cx, y: cy-6, textAnchor: 'middle', fontSize: '8', fill: 'var(--muted)', fontWeight: '700' }, 'TOTAL'),
                    React.createElement('text', { x: cx, y: cy+8, textAnchor: 'middle', fontSize: '9', fill: 'var(--rose)', fontWeight: '800' }, Number(total2).toLocaleString('pt-BR',{minimumFractionDigits:0,maximumFractionDigits:0}))
                ),
                React.createElement('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' } },
                    slices.map(function(sl) {
                        return React.createElement('div', { key: sl.cat, onClick: function(){ setFcat(fcat===sl.cat?'':sl.cat); }, style: { cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', borderRadius: '6px', padding: '2px 4px', background: fcat===sl.cat?'rgba(232,131,106,.07)':'' } },
                            React.createElement('div', { style: { width: '8px', height: '8px', borderRadius: '50%', background: (CG[sl.cat]?CG[sl.cat].c:'var(--muted)'), flexShrink: 0 } }),
                            React.createElement('span', { style: { fontSize: '.6rem', color: 'var(--muted)', flex: 1 } }, (CG[sl.cat]?CG[sl.cat].e:'') + ' ' + sl.cat.charAt(0).toUpperCase()+sl.cat.slice(1)),
                            React.createElement('span', { style: { fontSize: '.65rem', color: 'var(--cream)', fontWeight: 700 } }, Math.round(sl.pct*100)+'%')
                        );
                    })
                )
            ),
sc.filter(function(e2){return !!(CG[e2[0]]);}).map(function(e2) {
                var catK = e2[0], val = e2[1];
                return React.createElement('div', { key: catK, className: 'cbr', onClick: function(){ setFcat(fcat===catK?'':catK); }, style: { cursor: 'pointer', borderRadius: '8px', padding: '3px', background: fcat===catK?'rgba(232,131,106,.07)':'' } },
                    React.createElement('div', { className: 'cbl' }, (CG[catK]?CG[catK].e:'') + ' ' + catK.charAt(0).toUpperCase()+catK.slice(1)),
                    React.createElement('div', { className: 'cbt' },
                        React.createElement('div', { className: 'cbf', style: { width: Math.round(val/mc*100)+'%', background: (CG[catK]?CG[catK].c:'var(--muted)') } })
                    ),
                    React.createElement('div', { className: 'cbv' }, fR(val))
                );
            }),
            fcat ? React.createElement('div', { style: { fontSize: '.72rem', color: 'var(--rose)', textAlign: 'center', marginTop: '4px', cursor: 'pointer' }, onClick: function(){ setFcat(''); } }, 'Filtrando: ' + fcat + ' · toque para limpar') : null
        );
    }

    function renderContaDiv() {
        var cv  = parseFloat(String(contaVal).replace(',','.')) || 0;
        if (cv <= 0) return null;
        var cvV = cv * (splitPct / 100);
        var cvN = cv * ((100 - splitPct) / 100);
        return React.createElement('div', { style: { display: 'flex', gap: '8px' } },
            React.createElement('div', { style: { flex: 1, background: 'rgba(111,168,200,.1)', borderRadius: '10px', padding: '8px', textAlign: 'center' } },
                React.createElement('div', { style: { fontSize: '.6rem', color: 'var(--muted)', marginBottom: '2px' } }, gNV),
                React.createElement('div', { style: { fontSize: '1rem', fontWeight: 800, color: 'var(--vic)' } }, fR(cvV)),
                React.createElement('div', { style: { fontSize: '.58rem', color: 'var(--muted)' } }, splitPct + '%')
            ),
            React.createElement('div', { style: { flex: 1, background: 'rgba(200,111,168,.1)', borderRadius: '10px', padding: '8px', textAlign: 'center' } },
                React.createElement('div', { style: { fontSize: '.6rem', color: 'var(--muted)', marginBottom: '2px' } }, gNN),
                React.createElement('div', { style: { fontSize: '1rem', fontWeight: 800, color: 'var(--nay)' } }, fR(cvN)),
                React.createElement('div', { style: { fontSize: '.58rem', color: 'var(--muted)' } }, (100-splitPct) + '%')
            )
        );
    }

    // ── Tela: form novo gasto ──────────────────────────────────────────
    if (tela === 'form') {
        var RECORRS = [['nunca','Único'],['mensal','Todo mês'],['anual','Todo ano']];
        return React.createElement('div', { className: 'fg', style: { gap: '12px' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                React.createElement('button', { onClick: function() { setTela('main'); }, style: { background: 'none', border: 'none', color: 'var(--rose)', fontSize: '1rem', cursor: 'pointer', padding: '4px 0', flexShrink: 0 } }, '← Voltar'),
                React.createElement('div', { className: 'sec-title', style: { flex: 1 } }, '💸 Novo Gasto')
            ),
            React.createElement('div', { className: 'card fg', style: { gap: '11px' } },
                React.createElement('input', { className: 'f', placeholder: 'Descrição...', value: fDesc, onChange: function(e){ setFDesc(e.target.value); }, autoFocus: true }),
                React.createElement('div', { style: { display: 'flex', gap: '8px' } },
                    React.createElement('input', { type: 'number', className: 'f', placeholder: 'R$ 0,00', step: '0.01', min: '0.01', style: { flex: 1 }, value: fVal, onChange: function(e){ setFVal(e.target.value); } }),
                    React.createElement('select', { className: 'f', style: { flex: '0 0 130px' }, value: fCat, onChange: function(e){ setFCat(e.target.value); } },
                        cgKeys.map(function(k) {
                            return React.createElement('option', { key: k, value: k }, (CG[k] ? CG[k].e : '') + ' ' + k.charAt(0).toUpperCase() + k.slice(1));
                        })
                    )
                ),
                React.createElement(DateBR, { value: fDate, onChange: setFDate }),
                React.createElement('div', { style: { fontSize: '.68rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '2px' } }, '👤 Quem pagou:'),
                React.createElement('div', { style: { display: 'flex', gap: '6px' } },
                    [['ambos','Ambos'],['user1', gNV],['user2', gNN]].map(function(opt) {
                        var sel = fWho === opt[0];
                        return React.createElement('button', { key: opt[0], onClick: function(){ setFWho(opt[0]); }, style: { flex: 1, padding: '6px 4px', borderRadius: '8px', border: '1.5px solid', borderColor: sel?'var(--rose)':'var(--b2)', background: sel?'rgba(232,131,106,.14)':'transparent', color: sel?'var(--rose3)':'var(--muted)', fontSize: '.68rem', fontWeight: 700, cursor: 'pointer' } }, opt[1]);
                    })
                ),
                React.createElement('input', { className: 'f', placeholder: 'Observacao (opcional)...', style: { fontSize: '.8rem' }, value: fNota, onChange: function(e){ setFNota(e.target.value); } }),
                React.createElement('div', { style: { fontSize: '.68rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '2px' } }, '🔁 Recorrência:'),
                React.createElement('div', { style: { display: 'flex', gap: '6px' } },
                    RECORRS.map(function(r) {
                        var sel = fRecorr === r[0];
                        return React.createElement('button', { key: r[0], onClick: function(){ setFRecorr(r[0]); }, style: { flex: 1, padding: '6px 4px', borderRadius: '8px', border: '1.5px solid', borderColor: sel?'var(--rose)':'var(--b2)', background: sel?'rgba(232,131,106,.14)':'transparent', color: sel?'var(--rose3)':'var(--muted)', fontSize: '.68rem', fontWeight: 700, cursor: 'pointer' } }, r[1]);
                    })
                ),
                React.createElement('div', { style: { display: 'flex', gap: '8px', marginTop: '4px' } },
                    React.createElement('button', { className: 'bs', style: { flex: 1 }, onClick: function() { setTela('main'); } }, '✕ Cancelar'),
                    React.createElement('button', { className: 'bp', style: { flex: 1 }, onClick: saveGasto }, '💰 Registrar')
                )
            )
        );
    }

    // ── Tela: editar gasto ─────────────────────────────────────────────
    if (tela === 'edit') {
        return React.createElement('div', { className: 'fg', style: { gap: '12px' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                React.createElement('button', { onClick: function() { setTela('main'); setEditId(null); }, style: { background: 'none', border: 'none', color: 'var(--rose)', fontSize: '1rem', cursor: 'pointer', padding: '4px 0', flexShrink: 0 } }, '← Voltar'),
                React.createElement('div', { className: 'sec-title', style: { flex: 1 } }, '✏️ Editar Gasto')
            ),
            React.createElement('div', { className: 'card fg', style: { gap: '11px' } },
                React.createElement('input', { className: 'f', placeholder: 'Descrição...', value: eDesc, onChange: function(e){ setEDesc(e.target.value); }, autoFocus: true }),
                React.createElement('div', { style: { display: 'flex', gap: '8px' } },
                    React.createElement('input', { type: 'number', className: 'f', placeholder: 'R$ 0,00', step: '0.01', min: '0.01', style: { flex: 1 }, value: eVal, onChange: function(e){ setEVal(e.target.value); } }),
                    React.createElement('select', { className: 'f', style: { flex: '0 0 130px' }, value: eCat, onChange: function(e){ setECat(e.target.value); } },
                        cgKeys.map(function(k) {
                            return React.createElement('option', { key: k, value: k }, (CG[k] ? CG[k].e : '') + ' ' + k.charAt(0).toUpperCase() + k.slice(1));
                        })
                    )
                ),
                React.createElement('input', { type: 'date', className: 'f', style: { colorScheme: 'dark' }, value: eDate, onChange: function(e){ setEDate(e.target.value); } }),
                React.createElement('div', { style: { display: 'flex', gap: '8px', marginTop: '4px' } },
                    React.createElement('button', { className: 'bs', style: { flex: 1 }, onClick: function() { setTela('main'); setEditId(null); } }, '✕ Cancelar'),
                    React.createElement('button', { className: 'bp', style: { flex: 1 }, onClick: saveEdit }, '💾 Salvar')
                )
            )
        );
    }

    // ── Tela: main ────────────────────────────────────────────────────
    return React.createElement('div', { className: 'ps' },

        // Resumo topo
        React.createElement('div', { className: 'sr' },
            React.createElement('div', { className: 'sb' },
                React.createElement('div', { className: 'sv', style: { color: 'var(--gold)', fontSize: '1.2rem' } }, fR(total)),
                React.createElement('div', { className: 'sl' }, 'total ' + MN[cur.getMonth()])
            ),
            React.createElement('div', { className: 'sb' },
                React.createElement('div', { className: 'sv', style: { color: total > bud && bud > 0 ? 'var(--danger)' : 'var(--sage)', fontSize: '1.2rem' } }, fR(Math.max(bud - total, 0))),
                React.createElement('div', { className: 'sl' }, 'disponivel')
            )
        ),

        // Grafico 6 meses
        React.createElement('div', { className: 'card' },
            React.createElement('div', { className: 'ct' }, 'Ultimos 6 Meses'),
            React.createElement('div', { className: 'gph' },
                gph.map(function(g, i) {
                    return React.createElement('div', { key: g.l, className: 'gbc', onClick: function() { setGphSel(gphSel === i ? null : i); }, style: { cursor: 'pointer' } },
                        React.createElement('div', { className: 'gbb', style: { height: (Math.round(g.t/maxG*50)+2)+'px', background: g.cur ? 'var(--rose)' : gphSel === i ? 'var(--gold)' : 'rgba(232,131,106,.35)', transition: 'background .15s', position: 'relative' } },
                            (gphSel === i && g.t > 0) ? React.createElement('div', { style: { fontSize: '.5rem', color: 'var(--gold)', fontWeight: 700, textAlign: 'center', position: 'absolute', bottom: '18px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', background: 'var(--card)', padding: '1px 4px', borderRadius: '4px', border: '1px solid var(--b2)' } }, fR(g.t)) : null
                        ),
                        React.createElement('div', { className: 'gbl', style: { color: g.cur ? 'var(--rose)' : 'var(--muted)' } }, g.l)
                    );
                })
            )
        ),

        // Orcamento
        React.createElement('div', { className: 'card' },
            React.createElement('div', { className: 'ct' }, '💰 Orçamento'),
            React.createElement('div', { style: { display: 'flex', gap: '8px' } },
                React.createElement('input', { type: 'number', className: 'f', placeholder: 'Limite mensal...', step: '0.01', style: { flex: 1 }, value: budInput, onChange: function(e){ setBudInput(e.target.value); } }),
                React.createElement('button', { className: 'bp', style: { width: 'auto', padding: '0 16px', minHeight: 'auto', flexShrink: 0 }, onClick: saveBud }, '💾 Salvar')
            ),
            bud > 0 ? React.createElement('div', null,
                React.createElement('div', { className: 'btr' },
                    React.createElement('div', { className: 'bfi', style: { width: pct+'%', background: bc } })
                ),
                React.createElement('div', { className: 'bll' },
                    React.createElement('span', { style: { color: bc } }, (pct >= 85 ? 'ATENCAO ' : pct >= 65 ? 'Cuidado ' : '') + pct + '% usado'),
                    React.createElement('span', null, fR(total) + ' / ' + fR(bud))
                )
            ) : null
        ),

        // Divisao de gastos
        React.createElement('div', { className: 'card' },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' } },
                React.createElement('div', { className: 'ct', style: { marginBottom: 0 } }, 'Divisao de Gastos'),
                React.createElement('div', { style: { fontSize: '.58rem', color: 'var(--muted)' } }, splitPct + '% / ' + (100-splitPct) + '%')
            ),
            React.createElement('div', { style: { marginBottom: '10px' } },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '.58rem', marginBottom: '3px' } },
                    React.createElement('span', { style: { color: 'var(--vic)', fontWeight: 700 } }, gNV + ' ' + splitPct + '%'),
                    React.createElement('span', { style: { color: 'var(--nay)', fontWeight: 700 } }, (100-splitPct) + '% ' + gNN)
                ),
                React.createElement('input', { type: 'range', min: '0', max: '100', step: '5', value: splitPct, onChange: function(e){ saveSplit(parseInt(e.target.value)||50); }, style: { width: '100%', accentColor: 'var(--rose)', height: '4px' } })
            ),
            React.createElement('div', { className: 'dvc' },
                React.createElement('div', { className: 'dvc-row' },
                    React.createElement('span', { className: 'dvc-who', style: { color: 'var(--vic)' } }, gNV + ' pagou'),
                    React.createElement('span', { className: 'dvc-amt', style: { color: 'var(--vic)' } }, fR(vicPaga))
                ),
                React.createElement('div', { className: 'dvc-row' },
                    React.createElement('span', { className: 'dvc-who', style: { color: 'var(--nay)' } }, gNN + ' pagou'),
                    React.createElement('span', { className: 'dvc-amt', style: { color: 'var(--nay)' } }, fR(nayPaga))
                ),
                ambPaga > 0 ? React.createElement('div', { className: 'dvc-row' },
                    React.createElement('span', { className: 'dvc-who', style: { color: 'var(--both)' } }, 'Juntos'),
                    React.createElement('span', { className: 'dvc-amt', style: { color: 'var(--both)' } }, fR(ambPaga))
                ) : null,
                total > 0 ? React.createElement('div', { style: { marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--b2)', display: 'flex', gap: '8px' } },
                    React.createElement('div', { style: { flex: 1, background: 'rgba(111,168,200,.08)', borderRadius: '8px', padding: '7px', textAlign: 'center' } },
                        React.createElement('div', { style: { fontSize: '.6rem', color: 'var(--muted)' } }, 'Ideal ' + gNV),
                        React.createElement('div', { style: { fontSize: '.8rem', fontWeight: 700, color: Math.abs(balV) < 1 ? 'var(--ok)' : balV > 0 ? 'var(--rose)' : 'var(--vic)' } }, fR(idealV)),
                        React.createElement('div', { style: { fontSize: '.55rem', color: 'var(--muted)' } }, balV > 1 ? 'deve ' + fR(balV) : balV < -1 ? 'a receber ' + fR(-balV) : 'quitado')
                    ),
                    React.createElement('div', { style: { flex: 1, background: 'rgba(200,111,168,.08)', borderRadius: '8px', padding: '7px', textAlign: 'center' } },
                        React.createElement('div', { style: { fontSize: '.6rem', color: 'var(--muted)' } }, 'Ideal ' + gNN),
                        React.createElement('div', { style: { fontSize: '.8rem', fontWeight: 700, color: Math.abs(balN) < 1 ? 'var(--ok)' : balN > 0 ? 'var(--rose)' : 'var(--nay)' } }, fR(idealN)),
                        React.createElement('div', { style: { fontSize: '.55rem', color: 'var(--muted)' } }, balN > 1 ? 'deve ' + fR(balN) : balN < -1 ? 'a receber ' + fR(-balN) : 'quitado')
                    )
                ) : null
            ),
            // Dividir conta agora
            React.createElement('div', { style: { marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--b2)' } },
                React.createElement('div', { style: { fontSize: '.65rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '6px' } }, 'Dividir conta agora'),
                React.createElement('div', { style: { display: 'flex', gap: '6px', marginBottom: '6px' } },
                    React.createElement('input', { className: 'f', type: 'number', placeholder: 'R$ valor da conta...', value: contaVal, onChange: function(e){ setContaVal(e.target.value); }, style: { flex: 1, fontSize: '.8rem' } }),
                    contaVal ? React.createElement('button', { className: 'bico', onClick: function(){ setContaVal(''); }, style: { fontSize: '.75rem' } }, 'x') : null
                ),
                renderContaDiv()
            )
        ),

        // Grafico donut por categoria
        renderDonut(),

        // Lista de gastos do mes
        React.createElement('div', { className: 'card' },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' } },
                React.createElement('div', { className: 'ct', style: { marginBottom: 0 } }, MN[cur.getMonth()]),
                React.createElement('div', { style: { display: 'flex', gap: '5px' } },
                    React.createElement('button', { className: 'bs', style: { width: 'auto', padding: '7px 10px', fontSize: '.75rem', flexShrink: 0 }, onClick: exportCSV }, 'CSV'),
                    React.createElement('button', { className: 'bp', style: { width: 'auto', padding: '7px 12px', fontSize: '.75rem', flexShrink: 0 }, onClick: openAdd }, '+ Gasto')
                )
            ),
            sorted.length === 0
                ? React.createElement('div', { className: 'empty' },
                    React.createElement('span', { className: 'ei' }, '💸'),
                    'Nenhum gasto'
                )
                : React.createElement(GastosLista, { sorted: sorted, openEdit: openEdit, delGasto: delGasto })
        )
    );
}

/* ═══════════════════════════════════════════
   ✨ PLANEJAR
═══════════════════════════════════════════ */
function Planejar(props) {
    var cur        = props.cur;
    var evRProp    = props.evRProp;
    var gastRProp  = props.gastRProp;

    var mkC = mk(cur);
    var mkKey = mkC.replace('-', '_');

    var s   = _getS();
    var pNV = s.myName      || 'Pessoa 1';
    var pNN = s.partnerName || 'Pessoa 2';

    // Firebase data
    var _evROwn   = useList('events');
    var _gastROwn = useList('gastos');
    var evR       = evRProp   !== undefined ? evRProp   : _evROwn;
    var gastR     = gastRProp !== undefined ? gastRProp : _gastROwn;
    var chkR      = useList('checks/' + mkC);
    var drR       = useList('dreams');
    var goalR     = useList('goals');
    var memo      = useVal('memos/' + mkKey, '') || '';
    var budRawP   = useVal('budget_' + mkC, 0);
    var budLegP   = useVal('budget', 0);
    var budV      = budRawP || budLegP || 0;

    var events = useMemo(function() {
        if (!evR) return [];
        return Object.entries(evR).map(function(e2) { return Object.assign({ id: e2[0] }, e2[1]); });
    }, [evR]);
    var gastos = useMemo(function() {
        if (!gastR) return [];
        return Object.entries(gastR).map(function(e2) { return Object.assign({ id: e2[0] }, e2[1]); });
    }, [gastR]);
    var chks = useMemo(function() {
        if (!chkR) return [];
        return Object.entries(chkR).map(function(e2) { return Object.assign({ id: e2[0] }, e2[1]); });
    }, [chkR]);
    var dreams = useMemo(function() {
        if (!drR) return [];
        return Object.entries(drR).map(function(e2) { return Object.assign({ id: e2[0] }, e2[1]); });
    }, [drR]);
    var goals = useMemo(function() {
        if (!goalR) return [];
        return Object.entries(goalR).map(function(e2) { return Object.assign({ id: e2[0] }, e2[1]); });
    }, [goalR]);

    // stats do mês
    var ev  = events.filter(function(e2) { return e2.date && e2.date.indexOf(mkC) === 0; }).length;
    var gt  = gastos.filter(function(g)  { return g.date  && g.date.indexOf(mkC) === 0;  }).reduce(function(s2, g) { return s2 + (g.val || 0); }, 0);
    var dn  = chks.filter(function(c)    { return c.done; }).length;
    var bud = budV;

    // tela: 'main' | 'tarefa_form' | 'goal_form'
    var _tela   = useState('main'); var tela    = _tela[0];   var setTela   = _tela[1];

    // form tarefa
    var _fChkTxt  = useState('');      var fChkTxt  = _fChkTxt[0];  var setFChkTxt  = _fChkTxt[1];
    var _fChkWho  = useState('ambos'); var fChkWho  = _fChkWho[0];  var setFChkWho  = _fChkWho[1];
    var _fChkPrio = useState('normal');var fChkPrio = _fChkPrio[0]; var setFChkPrio = _fChkPrio[1];
    var _fChkDue  = useState('');      var fChkDue  = _fChkDue[0];  var setFChkDue  = _fChkDue[1];

    // form goal (metas de economia)
    var _fGoalId   = useState(null);  var fGoalId   = _fGoalId[0];   var setFGoalId   = _fGoalId[1];
    var _fGoalName = useState('');    var fGoalName = _fGoalName[0];  var setFGoalName = _fGoalName[1];
    var _fGoalTgt  = useState('');    var fGoalTgt  = _fGoalTgt[0];  var setFGoalTgt  = _fGoalTgt[1];
    var _fGoalCat  = useState('');    var fGoalCat  = _fGoalCat[0];  var setFGoalCat  = _fGoalCat[1];

    // adicionar valor em meta de economia
    var _addAmt = useState({}); var addAmt = _addAmt[0]; var setAddAmt = _addAmt[1];

    // memo debounce timer
    var memoTimer = React.useRef(null);

    // sonhos input
    var _dreamTxt = useState(''); var dreamTxt = _dreamTxt[0]; var setDreamTxt = _dreamTxt[1];

    var GOAL_CATS = [
        { v: '', l: 'Categoria...' },
        { v: 'viagem',     l: 'Viagem'    },
        { v: 'casa',       l: 'Casa'      },
        { v: 'presente',   l: 'Presente'  },
        { v: 'transporte', l: 'Transporte'},
        { v: 'evento',     l: 'Evento'    },
        { v: 'reserva',    l: 'Reserva'   }
    ];
    var GOAL_CAT_EMOJIS = { viagem: '✈️', casa: '🏠', presente: '🎁', transporte: '🚗', evento: '🎉', reserva: '💰' };

    function getCatEmoji(cat) { return GOAL_CAT_EMOJIS[cat] || '🎯'; }

    // ── Tarefas ────────────────────────────────────────────────────────
    function openAddTarefa() {
        setFChkTxt(''); setFChkWho('ambos'); setFChkPrio('normal'); setFChkDue('');
        setTela('tarefa_form');
    }

    function saveTarefa() {
        if (!fChkTxt.trim()) { toast('Digite o texto da tarefa!'); return; }
        vib(24);
        var d = { text: fChkTxt.trim(), who: fChkWho, done: false, prio: fChkPrio };
        if (fChkDue) d.due = fChkDue;
        try { fbp('checks/' + mkC, d); } catch(ex) {}
        toast('Tarefa adicionada!');
        setTela('main');
    }

    function togChk(id, done) {
        vib(done ? [10,10,10] : 28);
        try { fbu('checks/' + mkC + '/' + id, { done: !done }); } catch(ex) {}
    }

    function delChk(id) {
        vib(35);
        try { fbr('checks/' + mkC + '/' + id); } catch(ex) {}
    }

    // ── Metas de Economia ──────────────────────────────────────────────
    function openAddGoal() {
        setFGoalId(null); setFGoalName(''); setFGoalTgt(''); setFGoalCat('viagem');
        setTela('goal_form');
    }

    function openEditGoal(g) {
        setFGoalId(g.id);
        setFGoalName(g.name || '');
        setFGoalTgt(g.target ? String(g.target) : '');
        setFGoalCat(g.cat || 'viagem');
        setTela('goal_form');
    }

    function saveGoal() {
        if (!fGoalName.trim()) { toast('Digite o nome da meta!'); return; }
        var tgt = parseFloat(fGoalTgt);
        if (!tgt || tgt <= 0) { toast('Digite o valor alvo!'); return; }
        vib(24);
        if (fGoalId) {
            try { fbu('goals/' + fGoalId, { name: fGoalName.trim(), target: tgt, cat: fGoalCat }); } catch(ex) {}
            toast('Meta atualizada!');
        } else {
            try { fbp('goals', { name: fGoalName.trim(), target: tgt, current: 0, cat: fGoalCat }); } catch(ex) {}
            toast('Meta criada!');
        }
        setTela('main');
    }

    function addToGoal(id, cur2, tgt) {
        var a = parseFloat(addAmt[id] || 0);
        if (!a || a <= 0) { toast('Digite um valor!'); return; }
        var novo = {};
        novo[id] = '';
        var n = Math.min(cur2 + a, tgt);
        try { fbu('goals/' + id, { current: n }); } catch(ex) {}
        setAddAmt(function(p) { var r = {}; for (var k in p) r[k] = p[k]; r[id] = ''; return r; });
        toast('+' + fR(a) + ' adicionado!');
        if (n >= tgt) toast('Meta atingida! Parabens!');
    }

    function delGoal(id) {
        vib(35);
        try { fbr('goals/' + id); } catch(ex) {}
    }

    // ── Memo ───────────────────────────────────────────────────────────
    function onMemo(e) {
        var val = e.target.value;
        if (memoTimer.current) clearTimeout(memoTimer.current);
        memoTimer.current = setTimeout(function() {
            try { fbs('memos/' + mkKey, val); } catch(ex) {}
        }, 900);
    }

    // ── Sonhos ─────────────────────────────────────────────────────────
    function addDream() {
        if (!dreamTxt.trim()) return;
        vib(24);
        try { fbp('dreams', { text: dreamTxt.trim() }); } catch(ex) {}
        setDreamTxt('');
        toast('Sonho adicionado!');
    }

    function toggleLikeDream(d) {
        vib(18);
        var myN = getMyName().toLowerCase();
        var liked = d.likedBy || [];
        var found = false;
        for (var i = 0; i < liked.length; i++) { if (liked[i] === myN) { found = true; break; } }
        if (found) {
            var newLiked = liked.filter(function(n) { return n !== myN; });
            try { fbu('dreams/' + d.id, { likedBy: newLiked, likes: Math.max((d.likes||0)-1, 0) }); } catch(ex) {}
        } else {
            var newLiked2 = liked.concat([myN]);
            try { fbu('dreams/' + d.id, { likedBy: newLiked2, likes: (d.likes||0)+1 }); } catch(ex) {}
        }
    }

    function delDream(id) {
        vib(24);
        try { fbr('dreams/' + id); } catch(ex) {}
    }

    // Sorted dreams
    var sortedDreams = dreams.slice().sort(function(a, b) {
        return ((b.likes||0)+(b.likesP||0)) - ((a.likes||0)+(a.likesP||0));
    });

    // Sorted chks: alta primeiro, depois por done
    var chksPend = chks.filter(function(c) { return !c.done; });
    var chksDone = chks.filter(function(c) { return  c.done; });
    chksPend.sort(function(a,b) {
        var o = { alta: 0, normal: 1, baixa: 2 };
        return (o[a.prio]||1) - (o[b.prio]||1);
    });
    var sortedChks = chksPend.concat(chksDone);

    // ── Tela: form tarefa ──────────────────────────────────────────────
    if (tela === 'tarefa_form') {
        var PRIOS = [
            { v: 'alta',   l: 'Alta',   bg: 'var(--danger)' },
            { v: 'normal', l: 'Normal', bg: 'var(--rose)'   },
            { v: 'baixa',  l: 'Baixa',  bg: '#22c55e'       }
        ];
        return React.createElement('div', { className: 'fg', style: { gap: '12px' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                React.createElement('button', { onClick: function() { setTela('main'); }, style: { background: 'none', border: 'none', color: 'var(--rose)', fontSize: '1rem', cursor: 'pointer', padding: '4px 0', flexShrink: 0 } }, '← Voltar'),
                React.createElement('div', { className: 'sec-title', style: { flex: 1 } }, '✅ Nova Tarefa')
            ),
            React.createElement('div', { className: 'card fg', style: { gap: '11px' } },
                React.createElement('input', {
                    className: 'f', placeholder: 'Texto da tarefa…',
                    value: fChkTxt, onChange: function(e) { setFChkTxt(e.target.value); }, autoFocus: true
                }),
                // Prioridade
                React.createElement('div', { style: { fontSize: '.68rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '2px' } }, 'Prioridade:'),
                React.createElement('div', { style: { display: 'flex', gap: '6px' } },
                    PRIOS.map(function(p) {
                        var sel = fChkPrio === p.v;
                        return React.createElement('button', {
                            key: p.v,
                            onClick: function() { setFChkPrio(p.v); },
                            style: {
                                flex: 1, padding: '6px 4px', borderRadius: '8px',
                                border: '1.5px solid', borderColor: sel ? p.bg : 'var(--b2)',
                                background: sel ? p.bg + '22' : 'transparent',
                                color: sel ? p.bg : 'var(--muted)',
                                fontSize: '.68rem', fontWeight: 700, cursor: 'pointer'
                            }
                        }, p.l);
                    })
                ),
                // Quem
                React.createElement('div', { style: { fontSize: '.68rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '2px' } }, 'Responsável:'),
                React.createElement('div', { style: { display: 'flex', gap: '6px' } },
                    [['ambos','Ambos'],['user1', pNV],['user2', pNN]].map(function(opt) {
                        var sel = fChkWho === opt[0];
                        return React.createElement('button', {
                            key: opt[0],
                            onClick: function() { setFChkWho(opt[0]); },
                            style: {
                                flex: 1, padding: '6px 4px', borderRadius: '8px',
                                border: '1.5px solid', borderColor: sel ? 'var(--rose)' : 'var(--b2)',
                                background: sel ? 'rgba(232,131,106,.14)' : 'transparent',
                                color: sel ? 'var(--rose3)' : 'var(--muted)',
                                fontSize: '.68rem', fontWeight: 700, cursor: 'pointer'
                            }
                        }, opt[1]);
                    })
                ),
                // Prazo
                React.createElement('div', { style: { fontSize: '.68rem', color: 'var(--muted)', fontWeight: 700 } }, '📅 Prazo (opcional):'),
                React.createElement(DateBR, { value: fChkDue, onChange: setFChkDue }),
                React.createElement('div', { style: { display: 'flex', gap: '8px', marginTop: '4px' } },
                    React.createElement('button', { className: 'bs', style: { flex: 1 }, onClick: function() { setTela('main'); } }, '✕ Cancelar'),
                    React.createElement('button', { className: 'bp', style: { flex: 1 }, onClick: saveTarefa }, '✅ Adicionar')
                )
            )
        );
    }

    // ── Tela: form meta de economia ────────────────────────────────────
    if (tela === 'goal_form') {
        return React.createElement('div', { className: 'fg', style: { gap: '12px' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                React.createElement('button', { onClick: function() { setTela('main'); }, style: { background: 'none', border: 'none', color: 'var(--rose)', fontSize: '1rem', cursor: 'pointer', padding: '4px 0', flexShrink: 0 } }, '← Voltar'),
                React.createElement('div', { className: 'sec-title', style: { flex: 1 } }, fGoalId ? '✏️ Editar Meta' : '💰 Nova Meta de Economia')
            ),
            React.createElement('div', { className: 'card fg', style: { gap: '11px' } },
                React.createElement('input', {
                    className: 'f', placeholder: 'Ex: Viagem para a praia…',
                    value: fGoalName, onChange: function(e) { setFGoalName(e.target.value); }, autoFocus: true
                }),
                React.createElement('input', {
                    type: 'number', className: 'f', placeholder: 'Valor total (ex: 2000)',
                    min: '0', step: '0.01',
                    value: fGoalTgt, onChange: function(e) { setFGoalTgt(e.target.value); }
                }),
                React.createElement('div', { style: { fontSize: '.68rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '2px' } }, 'Categoria:'),
                React.createElement('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
                    GOAL_CATS.slice(1).map(function(c) {
                        var sel = fGoalCat === c.v;
                        return React.createElement('button', {
                            key: c.v,
                            onClick: function() { setFGoalCat(c.v); },
                            style: {
                                padding: '6px 10px', borderRadius: '10px', border: '1.5px solid',
                                borderColor: sel ? 'var(--gold)' : 'var(--b2)',
                                background:  sel ? 'rgba(212,168,83,.14)' : 'transparent',
                                color:       sel ? 'var(--gold)' : 'var(--muted)',
                                fontSize: '.68rem', fontWeight: 700, cursor: 'pointer'
                            }
                        }, getCatEmoji(c.v) + ' ' + c.l);
                    })
                ),
                React.createElement('div', { style: { display: 'flex', gap: '8px', marginTop: '4px' } },
                    React.createElement('button', { className: 'bs', style: { flex: 1 }, onClick: function() { setTela('main'); } }, '✕ Cancelar'),
                    React.createElement('button', { className: 'bp', style: { flex: 1 }, onClick: saveGoal }, fGoalId ? '✓ Salvar' : '💰 Criar Meta')
                )
            )
        );
    }

    // ── Tela: main ────────────────────────────────────────────────────
    return React.createElement('div', { className: 'ps' },

        // Resumo do mês
        React.createElement('div', { className: 'smb' },
            React.createElement('h2', null, 'Resumo — ' + MN[cur.getMonth()] + ' ' + cur.getFullYear()),
            React.createElement('div', { className: 'smg' },
                React.createElement('div', { className: 'smi' },
                    React.createElement('div', { className: 'sml' }, 'Eventos'),
                    React.createElement('div', { className: 'smv' }, ev)
                ),
                React.createElement('div', { className: 'smi' },
                    React.createElement('div', { className: 'sml' }, 'Gastos'),
                    React.createElement('div', { className: 'smv', style: { color: 'var(--gold)' } }, fR(gt))
                ),
                React.createElement('div', { className: 'smi' },
                    React.createElement('div', { className: 'sml' }, 'Tarefas'),
                    React.createElement('div', { className: 'smv' }, dn + '/' + chks.length)
                ),
                React.createElement('div', { className: 'smi' },
                    React.createElement('div', { className: 'sml' }, 'Saldo'),
                    React.createElement('div', { className: 'smv', style: { color: bud > 0 && gt > bud ? 'var(--danger)' : 'var(--sage)' } },
                        bud > 0 ? fR(bud - gt) : '—'
                    )
                )
            )
        ),

        // Tarefas do Mês
        React.createElement('div', { className: 'card' },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' } },
                React.createElement('div', { className: 'ct', style: { marginBottom: 0 } },
                    '✅ Tarefas do Mês',
                    chks.length > 0 ? React.createElement('span', { style: { marginLeft: '8px', fontSize: '.6rem', color: 'var(--muted)' } }, dn + '/' + chks.length) : null
                ),
                React.createElement('button', { className: 'bp', style: { width: 'auto', padding: '7px 12px', fontSize: '.75rem', flexShrink: 0 }, onClick: openAddTarefa }, '+ Tarefa')
            ),
            chks.length === 0
                ? React.createElement('div', { className: 'empty', style: { padding: '10px 0' } },
                    React.createElement('span', { className: 'ei' }, '📝'),
                    'Sem tarefas — adicione uma!'
                )
                : React.createElement('div', { style: { marginBottom: '4px' } },
                    sortedChks.map(function(c, idx) {
                        var isLast = idx === sortedChks.length - 1;
                        var pCor   = c.prio === 'alta' ? 'var(--danger)' : c.prio === 'baixa' ? '#22c55e' : 'transparent';
                        var dl     = c.due && !c.done ? dif(td(), new Date(c.due + 'T12:00:00')) : null;
                        var dlStr  = dl === null ? null
                            : dl < 0   ? 'Vencida!'
                            : dl === 0 ? 'Vence hoje!'
                            : dl === 1 ? 'Amanha'
                            : 'em ' + dl + ' dias';
                        var dlCor  = dl === null ? 'var(--muted)'
                            : dl < 0   ? 'var(--danger)'
                            : dl <= 1  ? 'var(--gold)'
                            : dl <= 3  ? 'var(--rose)'
                            : 'var(--muted)';
                        return React.createElement('div', {
                            key: c.id,
                            style: {
                                display: 'flex', alignItems: 'flex-start', gap: '10px',
                                padding: '10px 0', borderBottom: isLast ? 'none' : '1px solid var(--b1)',
                                opacity: c.done ? .5 : 1, transition: 'opacity .2s'
                            }
                        },
                            // prioridade stripe
                            c.prio === 'alta' && !c.done ? React.createElement('div', { style: { width: '3px', alignSelf: 'stretch', background: pCor, borderRadius: '2px', flexShrink: 0, marginTop: '2px' } }) : null,
                            React.createElement('div', {
                                className: 'chc' + (c.done ? ' done' : ''),
                                onClick: function() { togChk(c.id, c.done); },
                                style: { cursor: 'pointer', flexShrink: 0, marginTop: '2px' }
                            }, c.done ? '✓' : ''),
                            React.createElement('div', { style: { flex: 1, minWidth: 0, cursor: 'pointer' }, onClick: function() { togChk(c.id, c.done); } },
                                React.createElement('span', { className: 'cht', style: c.done ? { textDecoration: 'line-through', color: 'var(--muted)' } : {} }, c.text),
                                React.createElement('div', { style: { display: 'flex', gap: '6px', marginTop: '3px', alignItems: 'center', flexWrap: 'wrap' } },
                                    React.createElement(WB, { who: c.who === 'user1' ? 'user1' : c.who === 'user2' ? 'user2' : 'ambos' }),
                                    dlStr ? React.createElement('span', { style: { fontSize: '.58rem', color: dlCor, fontWeight: dl <= 1 ? 700 : 400 } }, dlStr) : null
                                )
                            ),
                            React.createElement('button', { onClick: function() { delChk(c.id); }, style: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: '.75rem', cursor: 'pointer', padding: '4px', flexShrink: 0, opacity: .6 } }, '✕')
                        );
                    })
                )
        ),

        // Metas de Economia
        React.createElement('div', { className: 'card' },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' } },
                React.createElement('div', { className: 'ct', style: { marginBottom: 0 } }, '💰 Metas de Economia'),
                React.createElement('button', { className: 'bp', style: { width: 'auto', padding: '7px 12px', fontSize: '.75rem', flexShrink: 0 }, onClick: openAddGoal }, '+ Meta')
            ),
            goals.length === 0
                ? React.createElement('div', { className: 'empty', style: { padding: '10px 0' } },
                    React.createElement('span', { className: 'ei' }, '💰'),
                    'Sem metas ainda'
                )
                : goals.map(function(g) {
                    var pct2 = g.target > 0 ? Math.min(Math.round((g.current||0)/g.target*100), 100) : 0;
                    var catE = getCatEmoji(g.cat);
                    return React.createElement('div', { key: g.id, className: 'goal' },
                        React.createElement('div', { className: 'goal-top' },
                            React.createElement('span', { className: 'goal-name' }, catE + ' ' + g.name),
                            React.createElement('span', { className: 'goal-pct' }, pct2 + '%')
                        ),
                        React.createElement('div', { className: 'goal-bar-t' },
                            React.createElement('div', { className: 'goal-bar-f', style: { width: pct2 + '%' } })
                        ),
                        React.createElement('div', { className: 'goal-vals' },
                            React.createElement('span', null, fR(g.current||0)),
                            React.createElement('span', null, fR(g.target))
                        ),
                        pct2 < 100 ? React.createElement('div', { style: { display: 'flex', gap: '6px', marginTop: '8px' } },
                            React.createElement('input', {
                                type: 'number', className: 'f',
                                style: { fontSize: '14px', padding: '9px', flex: 1 },
                                placeholder: 'Adicionar…',
                                value: addAmt[g.id] || '',
                                onChange: function(e) {
                                    var v = e.target.value;
                                    setAddAmt(function(p) { var r = {}; for (var k in p) r[k] = p[k]; r[g.id] = v; return r; });
                                }
                            }),
                            React.createElement('button', { className: 'bp', style: { width: 'auto', padding: '0 12px', minHeight: '42px', fontSize: '.8rem' }, onClick: function() { addToGoal(g.id, g.current||0, g.target); } }, '+ Add'),
                            React.createElement('button', { className: 'bico', style: { minHeight: '42px', opacity: .7 }, onClick: function() { openEditGoal(g); } }, '✏️'),
                            React.createElement('button', { className: 'bs', style: { width: 'auto', padding: '0 10px', minHeight: '42px' }, onClick: function() { delGoal(g.id); } }, '🗑️')
                        ) : null,
                        pct2 >= 100 ? React.createElement('div', { style: { textAlign: 'center', color: 'var(--sage)', fontSize: '.82rem', fontWeight: 700, marginTop: '6px' } }, '🎉 Meta atingida!') : null
                    );
                })
        ),

        // Notas do Mês
        React.createElement('div', { className: 'card' },
            React.createElement('div', { className: 'ct' }, '📓 Notas do Mês'),
            React.createElement('textarea', { className: 'memo', placeholder: 'Combinados, lembretes, planos…', defaultValue: memo, key: mkC, onChange: onMemo }),
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '.68rem', color: 'var(--muted)', marginTop: '5px' } },
                React.createElement('span', { style: { width: '5px', height: '5px', borderRadius: '50%', background: 'var(--sage)', display: 'inline-block' } }),
                'Salvo automaticamente'
            )
        ),

        // Sonhos do Casal
        React.createElement('div', { className: 'card' },
            React.createElement('div', { className: 'ct' }, '🌙 Sonhos do Casal'),
            sortedDreams.length === 0
                ? React.createElement('div', { className: 'empty', style: { padding: '8px 0' } },
                    React.createElement('span', { className: 'ei' }, '✨'),
                    'Sem sonhos ainda'
                )
                : React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' } },
                    sortedDreams.map(function(d) {
                        var myN     = getMyName().toLowerCase();
                        var liked   = d.likedBy || [];
                        var myLiked = false;
                        for (var i = 0; i < liked.length; i++) { if (liked[i] === myN) { myLiked = true; break; } }
                        var totalLikes = (d.likes||0) + (d.likesP||0);
                        return React.createElement('div', {
                            key: d.id, className: 'dt',
                            style: {
                                justifyContent: 'space-between', padding: '7px 10px',
                                background: totalLikes >= 2 ? 'rgba(212,168,83,.06)' : 'transparent',
                                borderColor: totalLikes >= 2 ? 'rgba(212,168,83,.3)' : undefined
                            }
                        },
                            React.createElement('span', { style: { flex: 1, lineHeight: 1.4 } },
                                totalLikes >= 2 ? React.createElement('span', { style: { marginRight: '4px' } }, '⭐') : null,
                                d.text
                            ),
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0, marginLeft: '6px' } },
                                React.createElement('button', {
                                    onClick: function() { toggleLikeDream(d); },
                                    style: {
                                        background: myLiked ? 'rgba(232,131,106,.15)' : 'transparent',
                                        border: '1.5px solid', borderColor: myLiked ? 'var(--rose)' : 'var(--b2)',
                                        borderRadius: '20px', padding: '3px 7px', fontSize: '.65rem',
                                        color: myLiked ? 'var(--rose)' : 'var(--muted)',
                                        display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 700, cursor: 'pointer'
                                    }
                                }, '❤️ ' + (totalLikes > 0 ? totalLikes : '')),
                                React.createElement('button', {
                                    onClick: function() { delDream(d.id); },
                                    style: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: '.8rem', padding: '2px', cursor: 'pointer', minWidth: '18px', minHeight: '18px' }
                                }, '✕')
                            )
                        );
                    })
                ),
            React.createElement('div', { className: 'fr' },
                React.createElement('input', {
                    className: 'f', placeholder: 'Ex: Viagem para o Nordeste…',
                    value: dreamTxt, onChange: function(e) { setDreamTxt(e.target.value); }
                }),
                React.createElement('button', { className: 'bp', style: { width: 'auto', padding: '0 14px', minHeight: '48px' }, onClick: addDream }, '+')
            )
        )
    );
}

/* ═══════════════════════════════════════════
   🛒 LISTA DE COMPRAS
═══════════════════════════════════════════ */
function Compras(props) {
    var itensProp = props ? props.itensProp : undefined;
    var _itROwn = useList('compras');
    var itR = itensProp !== undefined ? itensProp : _itROwn;

    var items = useMemo(function() {
        if (!itR) return [];
        return Object.entries(itR).map(function(e2) { return Object.assign({ id: e2[0] }, e2[1]); });
    }, [itR]);

    var frequent = useMemo(function() {
        if (!itR) return [];
        var all = Object.values(itR);
        var activeNames = {};
        all.forEach(function(i) { if (!i.done && i.name) activeNames[(i.name||'').toLowerCase().trim()] = true; });
        var freq = {};
        all.forEach(function(i) {
            if (!i.done || !i.name) return;
            var k = (i.name||'').toLowerCase().trim();
            if (activeNames[k]) return;
            if (!freq[k]) freq[k] = { count: 0, name: i.name, cat: i.cat||'', price: i.price||null };
            freq[k].count++;
        });
        return Object.values(freq).sort(function(a,b){ return b.count - a.count; }).slice(0,8);
    }, [itR]);

    // tela: 'lista' | 'form' | 'clear'
    var _tela   = useState('lista'); var tela    = _tela[0];   var setTela   = _tela[1];
    var _editId = useState(null);    var editId  = _editId[0]; var setEditId = _editId[1];
    var _busca  = useState('');      var busca   = _busca[0];  var setBusca  = _busca[1];
    var _fName  = useState('');           var fName  = _fName[0];  var setFName  = _fName[1];
    var _fQty   = useState('1');          var fQty   = _fQty[0];   var setFQty   = _fQty[1];
    var _fPrice = useState('');           var fPrice = _fPrice[0]; var setFPrice = _fPrice[1];
    var _fCat   = useState(SHOP_CATS[0]); var fCat   = _fCat[0];   var setFCat   = _fCat[1];

    function resetForm() { setFName(''); setFQty('1'); setFPrice(''); setFCat(SHOP_CATS[0]); }
    function openAdd()    { resetForm(); setEditId(null); setTela('form'); }
    function cancelForm() { setTela('lista'); setEditId(null); }

    function openEdit(it) {
        setFName(it.name || '');
        setFQty(String(it.qty || '1'));
        setFPrice(it.price ? String(it.price) : '');
        setFCat(it.cat || SHOP_CATS[0]);
        setEditId(it.id);
        setTela('form');
    }

    function saveItem() {
        if (!fName.trim()) { toast('Digite o nome do item! 🛒'); return; }
        vib(24);
        var pr = parseFloat(fPrice) || null;
        if (editId) {
            try { fbu('compras/' + editId, { name: fName.trim(), qty: fQty||'1', cat: fCat, price: pr }); } catch(ex) {}
            toast('Item atualizado! ✏️');
        } else {
            try {
                fbp('compras', { name: fName.trim(), cat: fCat, qty: fQty||'1', price: pr, done: false });
                notifyPartner('compras', '🛒 Novo item na lista', fName.trim() + (fQty && fQty !== '1' ? ' (×' + fQty + ')' : ''));
            } catch(ex) {}
            toast('Adicionado à lista! 🛒');
        }
        resetForm(); setTela('lista'); setEditId(null);
    }

    function tog(id, done) {
        vib(done ? [10,10] : 24);
        try { fbu('compras/' + id, { done: !done }); } catch(ex) {}
    }

    function delItem(id) {
        vib(35);
        try { fbr('compras/' + id); } catch(ex) {}
    }

    function clearDone() {
        items.forEach(function(i) { if (i.done) { try { fbr('compras/' + i.id); } catch(ex) {} } });
        toast('Lista limpa! 🧹');
        setTela('lista');
    }

    var buscaLow  = busca.toLowerCase().trim();
    var itemsFilt = buscaLow
        ? items.filter(function(i) { return (i.name||'').toLowerCase().indexOf(buscaLow) >= 0; })
        : items;

    var catOrder = {};
    SHOP_CATS.forEach(function(c, i) { catOrder[c] = i; });
    var byCat = {};
    itemsFilt.forEach(function(i) {
        var c = i.cat || SHOP_CATS[SHOP_CATS.length-1];
        if (!byCat[c]) byCat[c] = [];
        byCat[c].push(i);
    });
    var catKeys = Object.keys(byCat).sort(function(a,b) {
        return (catOrder[a]!==undefined?catOrder[a]:99)-(catOrder[b]!==undefined?catOrder[b]:99);
    });

    var pending  = items.filter(function(i){ return !i.done; }).length;
    var bought   = items.length - pending;
    var pct      = items.length > 0 ? Math.round(bought/items.length*100) : 0;
    var hasDone  = bought > 0;
    var totalEst = 0;
    items.forEach(function(i){ if (!i.done && i.price) totalEst += i.price * (parseFloat(i.qty)||1); });

    // ── Tela: confirmar limpar ──────────────────────────────────────
    if (tela === 'clear') {
        return React.createElement('div', { className:'fg', style:{ gap:'12px' } },
            React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:'8px' } },
                React.createElement('button', { onClick:function(){ setTela('lista'); }, style:{ background:'none', border:'none', color:'var(--rose)', fontSize:'1rem', cursor:'pointer', padding:'4px 0' } }, '← Voltar'),
                React.createElement('div', { className:'sec-title', style:{ flex:1 } }, '🗑️ Limpar comprados?')
            ),
            React.createElement('div', { className:'card', style:{ padding:'24px 16px', textAlign:'center' } },
                React.createElement('div', { style:{ fontSize:'2rem', marginBottom:'10px' } }, '🧹'),
                React.createElement('div', { style:{ fontSize:'.82rem', color:'var(--muted)', marginBottom:'20px' } },
                    'Remover os ' + bought + ' item' + (bought!==1?'ns':'') + ' já comprados da lista?'
                ),
                React.createElement('div', { style:{ display:'flex', gap:'8px' } },
                    React.createElement('button', { className:'bs', style:{ flex:1 }, onClick:function(){ setTela('lista'); } }, '✕ Cancelar'),
                    React.createElement('button', { className:'bp', style:{ flex:1 }, onClick:clearDone }, '🗑️ Confirmar')
                )
            )
        );
    }

    // ── Tela: formulário ─────────────────────────────────────────────
    if (tela === 'form') {
        return React.createElement('div', { className:'fg', style:{ gap:'12px' } },
            React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:'8px' } },
                React.createElement('button', { onClick:cancelForm, style:{ background:'none', border:'none', color:'var(--rose)', fontSize:'1rem', cursor:'pointer', padding:'4px 0', flexShrink:0 } }, '← Voltar'),
                React.createElement('div', { className:'sec-title', style:{ flex:1 } }, editId ? '✏️ Editar Item' : '🛒 Adicionar Item')
            ),
            React.createElement('div', { className:'card fg', style:{ gap:'11px' } },
                !editId && frequent.length > 0 ? React.createElement('div', null,
                    React.createElement('div', { style:{ fontSize:'.6rem', color:'var(--muted)', fontWeight:700, marginBottom:'6px' } }, '⚡ Frequentes:'),
                    React.createElement('div', { style:{ display:'flex', flexWrap:'wrap', gap:'5px' } },
                        frequent.map(function(f) {
                            return React.createElement('button', {
                                key: f.name,
                                onClick: function() { setFName(f.name); if(f.cat) setFCat(f.cat); if(f.price) setFPrice(String(f.price)); },
                                style: { padding:'3px 10px', borderRadius:'12px', border:'1px solid var(--b2)', background:'var(--b1)', fontSize:'.62rem', color:'var(--muted)', cursor:'pointer' }
                            }, f.name);
                        })
                    )
                ) : null,
                React.createElement('input', { className:'f', placeholder:'Nome do item…', value:fName, onChange:function(e){ setFName(e.target.value); }, autoFocus:true }),
                React.createElement('div', { style:{ display:'flex', gap:'8px' } },
                    React.createElement('input', { type:'number', className:'f', placeholder:'Qtd', min:'1', style:{ flex:'0 0 70px' }, value:fQty, onChange:function(e){ setFQty(e.target.value); } }),
                    React.createElement('input', { type:'number', className:'f', placeholder:'R$ preço', min:'0', step:'0.01', style:{ flex:'0 0 110px' }, value:fPrice, onChange:function(e){ setFPrice(e.target.value); } }),
                    React.createElement('select', { className:'f', style:{ flex:1 }, value:fCat, onChange:function(e){ setFCat(e.target.value); } },
                        SHOP_CATS.map(function(c){ return React.createElement('option',{ key:c, value:c }, c); })
                    )
                ),
                React.createElement('div', { style:{ display:'flex', gap:'8px', marginTop:'4px' } },
                    React.createElement('button', { className:'bs', style:{ flex:1 }, onClick:cancelForm }, '✕ Cancelar'),
                    React.createElement('button', { className:'bp', style:{ flex:1 }, onClick:saveItem }, editId ? '💾 Salvar' : '🛒 Adicionar')
                )
            )
        );
    }

    // ── Tela: lista ───────────────────────────────────────────────────
    return React.createElement('div', { className:'ps', style:{ gap:'10px' } },
        React.createElement('div', { className:'card', style:{ background:'linear-gradient(135deg,#1a0e04,#0e0500)', padding:'14px' } },
            React.createElement('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' } },
                React.createElement('div', null,
                    React.createElement('div', { style:{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.05rem', color:'var(--cream)' } }, 'Lista de Compras 🛒'),
                    React.createElement('div', { style:{ fontSize:'.62rem', color:'var(--muted)', marginTop:'2px', display:'flex', gap:'8px', flexWrap:'wrap' } },
                        React.createElement('span', null, pending + (pending!==1?' pendentes':' pendente')),
                        bought > 0 ? React.createElement('span', { style:{ color:'var(--sage)' } }, '✓ ' + bought + (bought!==1?' comprados':' comprado')) : null,
                        totalEst > 0 ? React.createElement('span', { style:{ color:'var(--gold)' } }, '≈ ' + fR(totalEst)) : null
                    )
                ),
                React.createElement('button', { className:'bp', style:{ width:'auto', padding:'9px 14px', fontSize:'.82rem', flexShrink:0 }, onClick:openAdd }, '+ Item')
            ),
            React.createElement('div', { style:{ display:'flex', gap:'5px', alignItems:'center', marginBottom: items.length > 0 ? '10px' : '0' } },
                React.createElement('input', { className:'f', placeholder:'🔍 Buscar item…', value:busca, onChange:function(e){ setBusca(e.target.value); }, style:{ fontSize:'.8rem', flex:1 } }),
                busca ? React.createElement('button', { className:'bico', onClick:function(){ setBusca(''); }, style:{ fontSize:'.75rem', flexShrink:0 } }, '✕') : null
            ),
            items.length > 0 ? React.createElement('div', null,
                React.createElement('div', { className:'btr' },
                    React.createElement('div', { className:'bfi', style:{ width:pct+'%', background:'var(--sage)' } })
                ),
                React.createElement('div', { className:'bll' },
                    React.createElement('span', null, pct + '% comprado'),
                    React.createElement('span', null, bought + '/' + items.length + ' itens')
                )
            ) : null,
            hasDone ? React.createElement('button', { className:'bs', style:{ marginTop:'10px', fontSize:'.78rem', padding:'7px', width:'100%' }, onClick:function(){ setTela('clear'); vib(20); } }, '🗑️ Limpar comprados') : null
        ),

        items.length === 0 ? React.createElement('div', { className:'empty' },
            React.createElement('span', { className:'ei' }, '🛒'),
            'Lista vazia — tudo comprado? 😄'
        ) : null,

        catKeys.map(function(cat) {
            var its  = byCat[cat];
            var pend = its.filter(function(i){ return !i.done; });
            var catTot = 0;
            its.forEach(function(i){ if(i.price) catTot += i.price * (parseFloat(i.qty)||1); });
            var sorted = pend.concat(its.filter(function(i){ return i.done; }));

            return React.createElement('div', { key:cat },
                React.createElement('div', { className:'shop-cat' },
                    cat,
                    React.createElement('span', { style:{ float:'right', display:'flex', gap:'8px', alignItems:'center' } },
                        catTot > 0 ? React.createElement('span', { style:{ color:'var(--sage)', fontSize:'.65rem', fontWeight:700 } }, fR(catTot)) : null,
                        React.createElement('span', { style:{ color: pend.length===0?'var(--sage)':'var(--muted)', fontSize:'.65rem' } },
                            (its.length - pend.length) + '/' + its.length
                        )
                    )
                ),
                React.createElement('div', { className:'card', style:{ padding:'4px 0', margin:0 } },
                    sorted.map(function(it, idx) {
                        var isLast = idx === sorted.length - 1;
                        return React.createElement('div', {
                            key: it.id,
                            style: { display:'flex', alignItems:'center', gap:'10px', padding:'11px 14px', borderBottom: isLast?'none':'1px solid var(--b1)', opacity: it.done?0.45:1, transition:'opacity .2s' }
                        },
                            React.createElement('div', {
    className:'chc'+(it.done?' done':''),
    onClick:function(){ tog(it.id,it.done); },
    style:{
        cursor:'pointer', flexShrink:0,
        width:'22px', height:'22px',
        borderRadius:'50%',
        border: it.done ? '2px solid var(--ok)' : '2px solid var(--b2)',
        background: it.done ? 'rgba(74,222,128,.15)' : 'transparent',
        display:'flex', alignItems:'center', justifyContent:'center',
        transition:'all .2s'
    }
}, it.done ? React.createElement('span', { style:{ color:'var(--ok)', fontSize:'.85rem', fontWeight:800, lineHeight:1 } }, '✓') : null),
                            React.createElement('div', { style:{ flex:1, minWidth:0, cursor:'pointer' }, onClick:function(){ tog(it.id,it.done); } },
                                React.createElement('span', { className:'cht', style: it.done?{ textDecoration:'line-through', color:'var(--muted)' }:{} }, it.name),
                                React.createElement('div', { style:{ display:'flex', gap:'8px', marginTop:'2px', alignItems:'center' } },
                                    React.createElement('span', { style:{ fontSize:'.65rem', color:'var(--muted)' } }, '×'+(it.qty||'1')),
                                    it.price ? React.createElement('span', { style:{ fontSize:'.63rem', color:'var(--sage)', fontWeight:700 } }, fR(it.price*(parseFloat(it.qty)||1))) : null
                                )
                            ),
                            React.createElement('div', { style:{ display:'flex', gap:'2px', flexShrink:0 } },
                                React.createElement('button', { onClick:function(){ openEdit(it); }, style:{ background:'none', border:'none', color:'var(--muted)', fontSize:'.78rem', cursor:'pointer', padding:'4px 5px', borderRadius:'6px', opacity:.7 } }, '✏️'),
                                React.createElement('button', { onClick:function(){ delItem(it.id); }, style:{ background:'none', border:'none', color:'var(--muted)', fontSize:'.78rem', cursor:'pointer', padding:'4px 5px', borderRadius:'6px', opacity:.6 } }, '🗑️')
                            )
                        );
                    })
                )
            );
        })
    );
}

/* ═══════════════════════════════════════════
   📸 GALERIA DE FOTOS
═══════════════════════════════════════════ */
function GaleriaGrid(props) {
    var fotos  = props.fotos || [];
    var onOpen = props.onOpen;
    var _gpg   = usePagination(fotos, 12, fotos.length);
    var gSlice = _gpg.slice; var gPg = _gpg.pg; var gPages = _gpg.pages; var gTotal = _gpg.total; var gSetPg = _gpg.setPg;
    return React.createElement('div', null,
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' } },
            gSlice.map(function(f) {
                return React.createElement('div', {
                    key: f.id,
                    style: { position: 'relative', cursor: 'pointer', borderRadius: '13px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,.45)', border: '1px solid var(--b1)', transition: 'transform .15s' },
                    onClick: function() { onOpen(f); }
                },
                    React.createElement('img', { loading: 'lazy', decoding: 'async', src: f.url, alt: f.caption || '', style: { width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' } }),
                    React.createElement('div', { style: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.65) 0%, transparent 55%)', pointerEvents: 'none' } }),
                    f.caption
                        ? React.createElement('div', { style: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 8px 8px', fontSize: '.6rem', color: 'rgba(255,255,255,.92)', lineHeight: 1.3, fontStyle: 'italic' } }, f.caption)
                        : React.createElement('div', { style: { position: 'absolute', bottom: '7px', right: '8px', fontSize: '.7rem', opacity: .45 } }, '♥')
                );
            })
        ),
        React.createElement(PgBar, { pg: gPg, pages: gPages, total: gTotal, setPg: gSetPg, label: 'fotos' })
    );
}
function Galeria() {
    var fotsR  = useList('galeria');
    var fotos  = useMemo(function() {
        if (!fotsR) return [];
        return Object.entries(fotsR).map(function(e2) { return Object.assign({ id: e2[0] }, e2[1]); })
            .sort(function(a, b) { return (b.ts || 0) - (a.ts || 0); });
    }, [fotsR]);

    var s       = _getS();
    var myN     = (s.myName || '').toLowerCase() || 'você';

    // tela: 'grid' | 'add' | 'view'
    var _t = useState('grid');  var tela    = _t[0]; var setTela    = _t[1];
    var _p = useState(null);    var preview = _p[0]; var setPreview = _p[1];
    var _c = useState('');      var caption = _c[0]; var setCaption = _c[1];
    var _u = useState(false);   var loading = _u[0]; var setLoading = _u[1];
    var _f = useState(null);    var selFoto = _f[0]; var setSelFoto = _f[1];
    var _e = useState(false);   var editCap = _e[0]; var setEditCap = _e[1];
    var _ec= useState('');      var editTxt = _ec[0];var setEditTxt = _ec[1];

    var fileRef = useRef(null);

    function processDataUrl(dataUrl) {
        var img = new window.Image();
        img.onload = function() {
            var maxW = 1000;
            var sc   = Math.min(maxW / img.width, maxW / img.height, 1);
            var canvas = document.createElement('canvas');
            canvas.width  = Math.round(img.width  * sc);
            canvas.height = Math.round(img.height * sc);
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            var b64 = canvas.toDataURL('image/jpeg', 0.82);
            setPreview(b64);
            setCaption('');
            setLoading(false);
            setTela('add');
        };
        img.onerror = function() { setLoading(false); toast('Erro ao carregar imagem 😕'); };
        img.src = dataUrl;
    }

    function triggerPick() {
        setLoading(true);
        pickPhotoUnified({ source: 'ask', width: 1400, quality: 82 })
            .then(processDataUrl)
            .catch(function() { setLoading(false); });
    }

    function handleFile(ev) {
        // mantido pra compat — ainda funciona se alguém chamar
        var f = ev.target.files && ev.target.files[0];
        ev.target.value = '';
        if (!f) return;
        if (f.size > 10 * 1024 * 1024) { toast('Foto muito grande! Máx 10MB 😅'); return; }
        setLoading(true);
        var reader = new FileReader();
        reader.onload = function(re) { processDataUrl(re.target.result); };
        reader.onerror = function() { setLoading(false); toast('Erro ao ler arquivo 😕'); };
        reader.readAsDataURL(f);
    }

    function savePhoto() {
        if (!preview) return;
        vib(30);
        setLoading(true);
        var path = 'galeria/' + Date.now() + '_' + Math.random().toString(36).slice(2) + '.jpg';
        fbUpload(path, preview,
            function(url) {
                try {
                    fbp('galeria', { url: url, caption: caption.trim(), by: myN, ts: Date.now() });
                    var t = '📸 ' + (myN || 'você') + ' postou uma foto';
                    notifyPartner('galeria', t, caption.trim() || 'Toca pra ver 💕');
                } catch(e) {}
                setPreview(null);
                setCaption('');
                setTela('grid'); setTimeout(function(){ var el=document.querySelector('.tab-scroll'); if(el) el.scrollTop=0; }, 50);
                setLoading(false);
                toast('Foto adicionada! 📸');
            },
            function(err) {
                console.error(err);
                setLoading(false);
                toast('Erro ao enviar foto ☁️');
            }
        );
    }

    function cancelAdd() {
        setPreview(null);
        setCaption('');
        setTela('grid');
    }

    function openFoto(f) {
        setSelFoto(f);
        setEditCap(false);
        setEditTxt(f.caption || '');
        setTela('view');
    }

    function closeFoto() {
        setSelFoto(null);
        setEditCap(false);
        setTela('grid');
    }

    function saveCaption() {
        if (!selFoto) return;
        try { fbu('galeria/' + selFoto.id, { caption: editTxt.trim() }); } catch(e) {}
        setSelFoto(function(p) { return p ? Object.assign({}, p, { caption: editTxt.trim() }) : p; });
        setEditCap(false);
        toast('Legenda salva! ✏️');
    }

    function removerFoto() {
        if (!selFoto) return;
        if (!window.confirm('Apagar esta foto?')) return;
        var saved = Object.assign({}, selFoto);
        try { fbSoftDel('galeria/' + saved.id); } catch(e) {}
        setSelFoto(null);
        setTela('grid');
        toast('Foto removida', 4000, function() {
            try { fbp('galeria', { url: saved.url, caption: saved.caption || '', by: saved.by || '', ts: saved.ts || Date.now() }); } catch(e) {}
        });
    }

    function baixarFoto() {
        if (!selFoto) return;
        try {
            var a = document.createElement('a');
            a.href = selFoto.url;
            a.download = 'nos-dois-' + Date.now() + '.jpg';
            a.click();
            toast('Baixando foto… 💾');
        } catch(e) { toast('Erro ao baixar 😕'); }
    }

    // ── Tela: adicionar nova foto ──────────────────────────────────────
    if (tela === 'add') {
        return React.createElement('div', { className: 'fg', style: { gap: '12px' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                React.createElement('button', { onClick: cancelAdd, style: { background: 'none', border: 'none', color: 'var(--rose)', fontSize: '1rem', cursor: 'pointer', padding: '4px 0', flexShrink: 0 } }, '← Voltar'),
                React.createElement('div', { className: 'sec-title', style: { flex: 1 } }, '📷 Nova Foto')
            ),
            preview ? React.createElement('div', { style: { borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,.5)', border: '1px solid var(--b2)' } },
                React.createElement('img', { src: preview, style: { width: '100%', maxHeight: '320px', objectFit: 'cover', display: 'block' } })
            ) : null,
            React.createElement('div', { className: 'card fg', style: { gap: '10px' } },
                React.createElement('input', {
                    className: 'f',
                    placeholder: 'Legenda (opcional)…',
                    value: caption,
                    onChange: function(e) { setCaption(e.target.value); }
                }),
                React.createElement('button', { className: 'bp', onClick: savePhoto, disabled: loading }, loading ? '⏳ Enviando…' : '💾 Salvar Foto'),
                React.createElement('button', { className: 'bs', onClick: cancelAdd }, '✕ Cancelar')
            )
        );
    }

    // ── Tela: visualizar foto ──────────────────────────────────────────
    if (tela === 'view' && selFoto) {
        return React.createElement('div', { className: 'fg', style: { gap: '12px' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                React.createElement('button', { onClick: closeFoto, style: { background: 'none', border: 'none', color: 'var(--rose)', fontSize: '1rem', cursor: 'pointer', padding: '4px 0', flexShrink: 0 } }, '← Voltar'),
                React.createElement('div', { className: 'sec-title', style: { flex: 1 } }, '🖼️ Foto')
            ),
            React.createElement('div', { style: { borderRadius: '16px', overflow: 'hidden', boxShadow: '0 6px 24px rgba(0,0,0,.6)', border: '1px solid var(--b2)' } },
                React.createElement('img', { src: selFoto.url, loading: 'lazy', style: { width: '100%', maxHeight: '60vh', objectFit: 'contain', display: 'block', background: 'rgba(0,0,0,.3)' } })
            ),
            // Legenda
            React.createElement('div', { className: 'card', style: { padding: '10px 14px' } },
                editCap
                    ? React.createElement('div', { style: { display: 'flex', gap: '6px' } },
                        React.createElement('input', { className: 'f', value: editTxt, onChange: function(e) { setEditTxt(e.target.value); }, placeholder: 'Legenda da foto…', style: { flex: 1 }, autoFocus: true }),
                        React.createElement('button', { className: 'bp', style: { padding: '0 12px', flexShrink: 0 }, onClick: saveCaption }, '✓'),
                        React.createElement('button', { onClick: function() { setEditCap(false); }, style: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: '1.1rem', cursor: 'pointer', padding: '0 4px' } }, '✕')
                      )
                    : React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }, onClick: function() { setEditTxt(selFoto.caption || ''); setEditCap(true); } },
                        selFoto.caption
                            ? React.createElement('div', { style: { flex: 1, fontSize: '.82rem', color: 'var(--text)', fontStyle: 'italic', lineHeight: 1.4 } }, selFoto.caption)
                            : React.createElement('div', { style: { flex: 1, fontSize: '.75rem', color: 'var(--b3)' } }, '+ Adicionar legenda…'),
                        React.createElement('span', { style: { fontSize: '.65rem', opacity: .5 } }, '✏️')
                      ),
                React.createElement('div', { style: { fontSize: '.6rem', color: 'var(--muted)', marginTop: '6px' } },
                    new Date(selFoto.ts || 0).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
                    selFoto.by ? ' · ' + selFoto.by : ''
                )
            ),
            // Ações
            React.createElement('div', { style: { display: 'flex', gap: '8px' } },
                React.createElement('button', { className: 'bp', style: { flex: 1 }, onClick: baixarFoto }, '📥 Salvar'),
                React.createElement('button', { className: 'bs', style: { flex: 1, color: 'var(--danger)', borderColor: 'var(--danger)' }, onClick: removerFoto }, '🗑️ Remover')
            )
        );
    }

    // ── Tela: grade de fotos ───────────────────────────────────────────
    return React.createElement('div', { className: 'fg', style: { gap: '12px' } },
        // Cabeçalho
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
            React.createElement('div', { className: 'sec-title' }, '📸 Galeria do Casal'),
            React.createElement('button', {
                className: 'bp',
                style: { width: 'auto', padding: '7px 16px', fontSize: '.75rem' },
                onClick: triggerPick,
                disabled: loading
            }, loading ? '⏳ Carregando…' : '+ Foto')
        ),
        React.createElement('input', { ref: fileRef, type: 'file', accept: 'image/*', capture: 'environment', style: { display: 'none' }, onChange: handleFile }),

        // Vazio
        fotos.length === 0 ? React.createElement('div', { className: 'card', style: { padding: '40px 20px', textAlign: 'center' } },
            React.createElement('div', { style: { fontSize: '2.8rem', marginBottom: '10px' } }, '📷'),
            React.createElement('div', { style: { color: 'var(--muted)', fontSize: '.82rem', lineHeight: 1.5 } },
                'Nenhuma foto ainda', React.createElement('br'), 'Adicionem a primeira! 💕'
            )
        ) : null,

        // Grade com paginação
        fotos.length > 0 ? React.createElement(GaleriaGrid, { fotos: fotos, onOpen: openFoto }) : null,

        // Contador
        fotos.length > 0 ? React.createElement('div', { style: { textAlign: 'center', fontSize: '.62rem', color: 'var(--muted)', paddingBottom: '4px' } },
            fotos.length + (fotos.length === 1 ? ' foto' : ' fotos') + ' na galeria 💕'
        ) : null
    );
}
/* ═══════════════════════════════════════════
   🕰️ LINHA DO TEMPO
═══════════════════════════════════════════ */
function Timeline() {
    var marcosR = useList('marcos');
    var marcos  = useMemo(function() {
        if (!marcosR) return [];
        return Object.entries(marcosR)
            .map(function(e2) { return Object.assign({ id: e2[0] }, e2[1]); })
            .sort(function(a, b) {
                if (a.date !== b.date) return a.date > b.date ? 1 : -1;
                return (a.ts || 0) - (b.ts || 0);
            });
    }, [marcosR]);

    // tela: 'lista' | 'form' | 'zoom'
    var _tela    = useState('lista'); var tela    = _tela[0];    var setTela    = _tela[1];
    var _zoomSrc = useState(null);    var zoomSrc = _zoomSrc[0]; var setZoomSrc = _zoomSrc[1];

    // form state
    var _fEmoji = useState('💫');  var fEmoji = _fEmoji[0]; var setFEmoji = _fEmoji[1];
    var _fTitle = useState('');    var fTitle = _fTitle[0]; var setFTitle = _fTitle[1];
    var _fDate  = useState('');    var fDate  = _fDate[0];  var setFDate  = _fDate[1];
    var _fPhoto = useState(null);  var fPhoto = _fPhoto[0]; var setFPhoto = _fPhoto[1];
    var _fLoad  = useState(false); var fLoad  = _fLoad[0];  var setFLoad  = _fLoad[1];

    var photoRef = useRef(null);

    var todayStr = dk(td());

var passados = marcos.filter(function(m) { return m.date <= todayStr; });
var futuros  = marcos.filter(function(m) { return m.date >  todayStr; });
var _tpg    = usePagination(passados, 20, passados.length);
var tSlice  = _tpg.slice; var tPg = _tpg.pg; var tPages = _tpg.pages; var tTotal = _tpg.total; var tSetPg = _tpg.setPg;

    var EMOJI_SUGS = ['💫','💕','💍','🏡','✈️','🎂','🐾','🎉','🌟','❤️','🥂','🌅'];

    function resetForm() {
        setFEmoji('💫'); setFTitle(''); setFDate(''); setFPhoto(null);
    }

    function openAdd() { resetForm(); setTela('form'); }
    function cancelForm() { setTela('lista'); }

    function _processMarcoPhoto(dataUrl) {
        var img = new window.Image();
        img.onload = function() {
            var max = 600;
            var sc  = Math.min(max / img.width, max / img.height, 1);
            var c   = document.createElement('canvas');
            c.width  = Math.round(img.width  * sc);
            c.height = Math.round(img.height * sc);
            c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
            setFPhoto(c.toDataURL('image/jpeg', 0.78));
            setFLoad(false);
        };
        img.onerror = function() { setFLoad(false); };
        img.src = dataUrl;
    }

    function pickPhoto() {
        setFLoad(true);
        pickPhotoUnified({ source: 'ask', width: 800, quality: 80 })
            .then(_processMarcoPhoto)
            .catch(function() { setFLoad(false); });
    }

    function handlePhoto(ev) {
        var f = ev.target.files && ev.target.files[0];
        ev.target.value = '';
        if (!f) return;
        setFLoad(true);
        var reader = new FileReader();
        reader.onload = function(re) { _processMarcoPhoto(re.target.result); };
        reader.onerror = function() { setFLoad(false); };
        reader.readAsDataURL(f);
    }

    function saveMarco() {
        if (!fTitle.trim()) { toast('Escreva o título do marco! 🌟'); return; }
        if (!fDate)         { toast('Escolha a data! 📅'); return; }
        vib(30);
        var data = { title: fTitle.trim(), date: fDate, emoji: fEmoji || '💫', ts: Date.now() };
        if (fPhoto) data.photo = fPhoto;
        try {
            fbp('marcos', data);
            notifyPartner('marco', '✨ Novo marco: ' + data.emoji + ' ' + data.title, 'Confere a linha do tempo 💕');
        } catch(ex) {}
        toast('Marco adicionado! ✨');
        resetForm();
        setTela('lista');
    }

    function delMarco(id) {
        vib(35);
        try { fbSoftDel('marcos/' + id); } catch(ex) {}
        toast('Marco removido');
    }

    // ── Tela: zoom foto ──────────────────────────────────────────────
    if (tela === 'zoom' && zoomSrc) {
        return React.createElement('div', {
            onClick: function() { setTela('lista'); setZoomSrc(null); },
            style: { position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,.96)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', cursor: 'zoom-out' }
        },
            React.createElement('img', {
                src: zoomSrc, loading: 'lazy',
                style: { maxWidth: '100%', maxHeight: '100%', borderRadius: '12px', objectFit: 'contain' },
                onClick: function(e) { e.stopPropagation(); }
            }),
            React.createElement('button', {
                onClick: function() { setTela('lista'); setZoomSrc(null); },
                style: { position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', borderRadius: '50%', width: 36, height: 36, fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }
            }, '✕')
        );
    }

    // ── Tela: formulário ─────────────────────────────────────────────
    if (tela === 'form') {
        return React.createElement('div', { className: 'fg', style: { gap: '12px' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                React.createElement('button', { onClick: cancelForm, style: { background: 'none', border: 'none', color: 'var(--rose)', fontSize: '1rem', cursor: 'pointer', padding: '4px 0', flexShrink: 0 } }, '← Voltar'),
                React.createElement('div', { className: 'sec-title', style: { flex: 1 } }, '🌟 Novo Marco')
            ),
            React.createElement('input', { ref: photoRef, type: 'file', accept: 'image/*', style: { display: 'none' }, onChange: handlePhoto }),

            React.createElement('div', { className: 'card fg', style: { gap: '11px' } },
                // Emoji picker
                React.createElement('div', null,
                    React.createElement('div', { style: { fontSize: '.7rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '8px' } }, 'Emoji do marco:'),
                    React.createElement('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' } },
                        EMOJI_SUGS.map(function(em) {
                            return React.createElement('button', {
                                key: em,
                                onClick: function() { setFEmoji(em); },
                                style: {
                                    width: 38, height: 38, borderRadius: '10px',
                                    border: '2px solid',
                                    borderColor: fEmoji === em ? 'var(--rose)' : 'var(--b2)',
                                    background:  fEmoji === em ? 'rgba(232,131,106,.15)' : 'rgba(255,255,255,.03)',
                                    fontSize: '1.2rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }
                            }, em);
                        }),
                        // Custom emoji input
                        React.createElement('input', {
                            className: 'f',
                            value: fEmoji,
                            onChange: function(e) { var v = e.target.value; setFEmoji(v || '💫'); },
                            maxLength: 2,
                            style: { width: 38, height: 38, textAlign: 'center', fontSize: '1.2rem', padding: '0', flexShrink: 0 }
                        })
                    )
                ),

                // Título
                React.createElement('input', {
                    className: 'f',
                    placeholder: 'Título do marco… (ex: Primeiro beijo)',
                    value: fTitle,
                    onChange: function(e) { setFTitle(e.target.value); }
                }),

                // Data
                React.createElement('div', { style: { fontSize: '.7rem', color: 'var(--muted)', fontWeight: 700 } }, '📅 Data:'),
                React.createElement(DateBR, { value: fDate, onChange: setFDate }),

                // Foto
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                    React.createElement('button', {
                        className: 'bs', style: { flex: 1 },
                        onClick: pickPhoto, disabled: fLoad
                    }, fLoad ? '⏳ Carregando…' : fPhoto ? '🖼️ Trocar foto' : '📷 Foto (opcional)'),
                    fPhoto ? React.createElement('img', {
                        src: fPhoto, loading: 'lazy',
                        style: { width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '2px solid var(--rose)', flexShrink: 0, cursor: 'pointer' },
                        onClick: function() { setZoomSrc(fPhoto); setTela('zoom'); }
                    }) : null
                ),

                // Ações
                React.createElement('div', { style: { display: 'flex', gap: '8px', marginTop: '4px' } },
                    React.createElement('button', { className: 'bs', style: { flex: 1 }, onClick: cancelForm }, '✕ Cancelar'),
                    React.createElement('button', { className: 'bp', style: { flex: 1 }, onClick: saveMarco }, '✨ Adicionar Marco')
                )
            )
        );
    }

    // ── Tela: lista / linha do tempo ─────────────────────────────────

    return React.createElement('div', { className: 'fg', style: { gap: '12px' } },
        // Cabeçalho
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
            React.createElement('div', { className: 'sec-title' }, '🌟 Linha do Tempo'),
            React.createElement('button', { className: 'bp', style: { width: 'auto', padding: '7px 14px', fontSize: '.75rem' }, onClick: openAdd }, '+ Marco')
        ),

        // Vazio
        marcos.length === 0 ? React.createElement('div', { className: 'card', style: { padding: '40px 20px', textAlign: 'center' } },
            React.createElement('div', { style: { fontSize: '2.8rem', marginBottom: '10px' } }, '🌟'),
            React.createElement('div', { style: { color: 'var(--muted)', fontSize: '.82rem', lineHeight: 1.6 } },
                'Adicionem os marcos do relacionamento!', React.createElement('br'),
                React.createElement('span', { style: { fontSize: '.75rem' } }, 'Primeiro beijo, viagens, conquistas…')
            )
        ) : null,

        // Passados
        passados.length > 0 ? React.createElement('div', { style: { position: 'relative', paddingLeft: '26px' } },
            React.createElement('div', { style: { position: 'absolute', left: '11px', top: '8px', bottom: '8px', width: '2px', background: 'linear-gradient(to bottom,var(--rose),var(--gold))', borderRadius: '2px', opacity: .4 } }),
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
                tSlice.map(function(m) {
                    var d = m.date ? new Date(m.date + 'T12:00:00') : null;
                    var dateStr = d ? d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
                    return React.createElement('div', { key: m.id, style: { position: 'relative', display: 'flex', gap: '12px', alignItems: 'flex-start' } },
                        // Bolinha na linha
                        React.createElement('div', { style: { position: 'absolute', left: '-19px', top: '6px', width: 10, height: 10, borderRadius: '50%', background: 'var(--rose)', border: '2px solid var(--bg)', boxShadow: '0 0 6px rgba(232,131,106,.4)', flexShrink: 0 } }),
                        // Card do marco
                        React.createElement('div', { className: 'card', style: { flex: 1, margin: 0, padding: '11px 13px', overflow: 'hidden' } },
                            React.createElement('div', { style: { display: 'flex', alignItems: 'flex-start', gap: '10px' } },
                                React.createElement('div', { style: { fontSize: '1.7rem', lineHeight: 1, flexShrink: 0 } }, m.emoji || '💫'),
                                React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                                    React.createElement('div', { style: { fontSize: '.82rem', fontWeight: 700, color: 'var(--cream)', lineHeight: 1.3 } }, m.title),
                                    React.createElement('div', { style: { fontSize: '.6rem', color: 'var(--muted)', marginTop: '3px' } }, dateStr)
                                ),
                                React.createElement('button', {
                                    onClick: function() { delMarco(m.id); },
                                    style: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: '.75rem', cursor: 'pointer', padding: '2px 4px', borderRadius: '6px', flexShrink: 0, opacity: .6 }
                                }, '✕')
                            ),
                            m.photo ? React.createElement('div', {
                                style: { marginTop: '10px', borderRadius: '9px', overflow: 'hidden', border: '1px solid var(--b1)', cursor: 'zoom-in' },
                                onClick: function() { setZoomSrc(m.photo); setTela('zoom'); }
                            },
                                React.createElement('img', { src: m.photo, loading: 'lazy', decoding: 'async', style: { width: '100%', maxHeight: '130px', objectFit: 'cover', display: 'block' } })
                            ) : null
                        )
                    );
                })
            )
        ) : null,

        // Paginação passados
        passados.length > 0 ? React.createElement(PgBar, { pg: tPg, pages: tPages, total: tTotal, setPg: tSetPg, label: 'marcos' }) : null,

        // Futuros (planos)
        futuros.length > 0 ? React.createElement('div', null,
            React.createElement('div', { style: { fontSize: '.7rem', color: 'var(--gold)', fontWeight: 700, padding: '2px 2px 8px', display: 'flex', alignItems: 'center', gap: '5px' } },
                '✨ Em breve — ' + futuros.length + (futuros.length === 1 ? ' plano' : ' planos')
            ),
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
                futuros.map(function(m) {
                    var d = m.date ? new Date(m.date + 'T12:00:00') : null;
                    var dateStr = d ? d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
                    return React.createElement('div', { key: m.id, className: 'card', style: { margin: 0, padding: '11px 13px', borderColor: 'rgba(212,168,83,.2)', background: 'rgba(212,168,83,.04)', opacity: .75 } },
                        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                            React.createElement('div', { style: { fontSize: '1.5rem', flexShrink: 0 } }, m.emoji || '💫'),
                            React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                                React.createElement('div', { style: { fontSize: '.8rem', fontWeight: 700, color: 'var(--muted)', lineHeight: 1.3 } }, m.title),
                                React.createElement('div', { style: { fontSize: '.6rem', color: 'var(--gold)', marginTop: '3px', fontWeight: 700 } }, '📅 ' + dateStr)
                            ),
                            React.createElement('button', {
                                onClick: function() { delMarco(m.id); },
                                style: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: '.75rem', cursor: 'pointer', padding: '2px 4px', borderRadius: '6px', flexShrink: 0, opacity: .6 }
                            }, '✕')
                        )
                    );
                })
            )
        ) : null,

        // Contador
        marcos.length > 0 ? React.createElement('div', { style: { textAlign: 'center', fontSize: '.62rem', color: 'var(--muted)', paddingBottom: '4px' } },
            passados.length + (passados.length === 1 ? ' marco' : ' marcos') + ' · ' +
            futuros.length + (futuros.length === 1 ? ' plano' : ' planos') + ' 💕'
        ) : null
    );
}
/* ═══════════════════════════════════════════
   💕 NÓIS (Diário + Wishlist + Cápsula + Desafios + Roleta)
═══════════════════════════════════════════ */
function Bilhete() {
    var s          = _getS();
    var bNV        = s.myName      || 'Pessoa 1';
    var bNN        = s.partnerName || 'Pessoa 2';
    var myKey      = getMyName();
    var partnerKey = myKey === 'user1' ? 'user2' : 'user1';
    var myLabel    = myKey === 'user1' ? bNV : bNN;
    var partnerLabel = myKey === 'user1' ? bNN : bNV;

    var bilhetesR = useList('bilhetes');
    var bilhetes  = useMemo(function() {
        if (!bilhetesR) return [];
        return Object.entries(bilhetesR)
            .map(function(e2) { return Object.assign({ id: e2[0] }, e2[1]); })
            .sort(function(a, b) { return b.ts - a.ts; });
    }, [bilhetesR]);

    var _tela   = useState('lista'); var tela   = _tela[0];   var setTela   = _tela[1];
    var _fMsg   = useState('');      var fMsg   = _fMsg[0];   var setFMsg   = _fMsg[1];
    var _fPara  = useState(null);    var fPara  = _fPara[0];  var setFPara  = _fPara[1];
    var _fEmoji = useState('💌');    var fEmoji = _fEmoji[0]; var setFEmoji = _fEmoji[1];

    var EMOJIS = ['💌','💕','🌹','✨','🤍','💋','🥰','🌙','⭐','🦋','🌸','💫'];

    var bilheteIds = bilhetes.map(function(b) { return b.id; }).join(',');
    useEffect(function() {
        bilhetes.forEach(function(b) {
            if (b.para === myKey && !b.lido) {
                try { fbu('bilhetes/' + b.id, { lido: true }); } catch(ex) {}
            }
        });
    }, [bilheteIds]);

    function openForm() {
        setFMsg('');
        setFPara(partnerKey);
        setFEmoji('💌');
        setTela('form');
    }
    function cancelForm() { setTela('lista'); }

    function enviar() {
        if (!fMsg.trim()) { toast('Escreva uma mensagem! 💌'); return; }
        var para = fPara !== null ? fPara : partnerKey;
        vib([20, 50, 20]);
        try { fbp('bilhetes', { msg: fMsg.trim(), para: para, de: myKey, emoji: fEmoji, ts: Date.now(), lido: false }); } catch(ex) {}
        toast('Bilhete enviado! 💌');
    if (window._sendNotif) window._sendNotif(para, 'bilhete', {
        title: 'Novo bilhete 💌',
        body: myKey.charAt(0).toUpperCase()+myKey.slice(1) + ' te mandou um bilhete!'
    });
        setTela('lista');
    }

    function delBilhete(id) {
        if (!window.confirm('Apagar este bilhete?')) return;
        vib(30);
        try { fbSoftDel('bilhetes/' + id); } catch(ex) {}
        toast('Removido');
    }

    var paraCurrent = fPara !== null ? fPara : partnerKey;

    if (tela === 'form') {
        var pkCls = partnerKey === 'user2' ? 'n' : 'v';
        var mkCls = myKey      === 'user2' ? 'n' : 'v';

        return React.createElement('div', { className: 'fg', style: { gap: '12px' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                React.createElement('button', { onClick: cancelForm, style: { background: 'none', border: 'none', color: 'var(--rose)', fontSize: '1rem', cursor: 'pointer', padding: '4px 0', flexShrink: 0 } }, '← Voltar'),
                React.createElement('div', { className: 'sec-title', style: { flex: 1 } }, '💌 Escrever Bilhete')
            ),
            React.createElement('div', { className: 'card fg', style: { gap: '12px' } },
                React.createElement('div', null,
                    React.createElement('div', { style: { fontSize: '.68rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '8px' } }, 'Escolha um emoji:'),
                    React.createElement('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
                        EMOJIS.map(function(em) {
                            return React.createElement('button', {
                                key: em,
                                onClick: function() { setFEmoji(em); },
                                style: {
                                    fontSize: '1.3rem', padding: '5px 7px', borderRadius: '10px',
                                    border: '1.5px solid',
                                    borderColor: fEmoji === em ? 'var(--rose)' : 'var(--b2)',
                                    background:  fEmoji === em ? 'rgba(232,131,106,.14)' : 'transparent',
                                    cursor: 'pointer', lineHeight: 1
                                }
                            }, em);
                        })
                    )
                ),
                React.createElement('div', null,
                    React.createElement('div', { style: { fontSize: '.68rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '6px' } }, 'Para:'),
                    React.createElement('div', { className: 'wt' },
                        React.createElement('button', {
                            className: 'wb ' + pkCls + (paraCurrent === partnerKey ? ' on' : ''),
                            onClick: function() { setFPara(partnerKey); }
                        }, '👤 ' + partnerLabel),
                        React.createElement('button', {
                            className: 'wb ' + mkCls + (paraCurrent === myKey ? ' on' : ''),
                            onClick: function() { setFPara(myKey); }
                        }, '👤 ' + myLabel + ' (eu)')
                    )
                ),
                React.createElement('textarea', {
                    className: 'f',
                    placeholder: 'Escreva sua mensagem… 💌',
                    style: { minHeight: '90px', resize: 'none', lineHeight: 1.6 },
                    value: fMsg,
                    onChange: function(e) { setFMsg(e.target.value); }
                }),
                fMsg.trim() ? React.createElement('div', {
                    style: {
                        padding: '10px 14px', borderRadius: '10px',
                        background: 'linear-gradient(135deg,rgba(232,131,106,.1),rgba(176,96,160,.07))',
                        border: '1px solid rgba(232,131,106,.2)',
                        fontSize: '.75rem', color: 'var(--cream)', lineHeight: 1.6, fontStyle: 'italic'
                    }
                },
                    React.createElement('span', { style: { fontSize: '1rem', marginRight: '6px' } }, fEmoji),
                    '"' + fMsg.trim() + '"'
                ) : null,
                React.createElement('div', { style: { display: 'flex', gap: '8px' } },
                    React.createElement('button', { className: 'bs', style: { flex: 1 }, onClick: cancelForm }, '✕ Cancelar'),
                    React.createElement('button', { className: 'bp', style: { flex: 1 }, onClick: enviar }, '💌 Enviar')
                )
            )
        );
    }

    var naoLidos = bilhetes.filter(function(b) { return b.para === myKey && !b.lido; }).length;

    return React.createElement('div', { className: 'fg', style: { gap: '12px' } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                React.createElement('div', { className: 'sec-title' }, '💌 Bilhetes'),
                naoLidos > 0 ? React.createElement('span', {
                    style: { fontSize: '.6rem', fontWeight: 800, background: 'var(--rose)', color: '#fff', borderRadius: '10px', padding: '2px 7px' }
                }, naoLidos + ' novo' + (naoLidos > 1 ? 's' : '')) : null
            ),
            React.createElement('button', { className: 'bp', style: { width: 'auto', padding: '7px 14px', fontSize: '.78rem' }, onClick: openForm }, '+ Escrever')
        ),
        React.createElement('div', { style: { fontSize: '.62rem', color: 'var(--muted)' } }, 'Mensagens surpresa um para o outro ♥'),
        bilhetes.length === 0 ? React.createElement('div', { className: 'card', style: { padding: '40px 20px', textAlign: 'center' } },
            React.createElement('div', { style: { fontSize: '2.8rem', marginBottom: '10px' } }, '💌'),
            React.createElement('div', { style: { color: 'var(--muted)', fontSize: '.82rem', lineHeight: 1.6 } },
                'Nenhum bilhete ainda…', React.createElement('br'),
                React.createElement('span', { style: { fontSize: '.75rem' } }, 'Escreva uma mensagem surpresa!')
            )
        ) : null,
        bilhetes.length > 0 ? React.createElement(BilhetesLista, { bilhetes: bilhetes, bNV: bNV, bNN: bNN, myKey: myKey, delBilhete: delBilhete }) : null,
        bilhetes.length > 0 ? React.createElement('div', { style: { textAlign: 'center', fontSize: '.62rem', color: 'var(--muted)', paddingBottom: '4px' } },
            bilhetes.length + (bilhetes.length === 1 ? ' bilhete' : ' bilhetes') + ' trocados 💕'
        ) : null
    );
}
function BilhetesLista(props) {
    var bilhetes   = props.bilhetes || [];
    var bNV        = props.bNV;
    var bNN        = props.bNN;
    var myKey      = props.myKey;
    var delBilhete = props.delBilhete;
    var _bpg   = usePagination(bilhetes, 15, bilhetes.length);
    var bSlice = _bpg.slice; var bPg = _bpg.pg; var bPages = _bpg.pages; var bTotal = _bpg.total; var bSetPg = _bpg.setPg;
    return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
        bSlice.map(function(b) {
            var deLabel   = b.de   === 'user1' ? bNV : bNN;
            var paraLabel = b.para === 'user1' ? bNV : bNN;
            var isNew     = b.para === myKey && !b.lido;
            var isFromMe  = b.de === myKey;
            var dt        = new Date(b.ts);
            var dtStr     = dt.toLocaleDateString('pt-BR') + ' ' + dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            return React.createElement('div', {
                key: b.id,
                className: 'card',
                style: {
                    padding: '13px 14px', margin: 0,
                    background: isNew
                        ? 'linear-gradient(135deg,rgba(232,131,106,.13),rgba(176,96,160,.09))'
                        : 'linear-gradient(135deg,rgba(232,131,106,.04),rgba(176,96,160,.02))',
                    borderColor: isNew ? 'rgba(232,131,106,.4)' : undefined,
                    borderWidth: isNew ? '1.5px' : undefined
                }
            },
                React.createElement('div', { style: { display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' } },
                    React.createElement('span', { style: { fontSize: '1.5rem', lineHeight: 1, flexShrink: 0 } }, b.emoji || '💌'),
                    React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                        React.createElement('div', { style: { fontSize: '.65rem', fontWeight: 700, color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' } },
                            'De ' + deLabel + ' \u2192 Para ' + paraLabel,
                            isNew ? React.createElement('span', { style: { fontSize: '.52rem', background: 'var(--rose)', color: '#fff', borderRadius: '6px', padding: '1px 6px', fontWeight: 800 } }, 'NOVO') : null,
                            isFromMe && !isNew ? React.createElement('span', { style: { fontSize: '.52rem', color: b.lido ? 'var(--sage)' : 'var(--muted)', fontWeight: 700 } }, b.lido ? '\u2714\uFE0F Lido' : '\u23F3 Enviado') : null
                        ),
                        React.createElement('div', { style: { fontSize: '.56rem', color: 'var(--muted)', marginTop: '2px' } }, dtStr)
                    ),
                    React.createElement('button', {
                        onClick: function() { delBilhete(b.id); },
                        style: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: '.8rem', cursor: 'pointer', padding: '2px 4px', borderRadius: '6px', flexShrink: 0, opacity: .6 }
                    }, '\u2715')
                ),
                React.createElement('div', { style: { fontSize: '.8rem', color: 'var(--cream)', lineHeight: 1.65, fontStyle: 'italic', whiteSpace: 'pre-wrap' } },
                    '\u201C' + b.msg + '\u201D'
                )
            );
        }),
        React.createElement(PgBar, { pg: bPg, pages: bPages, total: bTotal, setPg: bSetPg, label: 'bilhetes' })
    );
}
function Chat() {
    var s       = _getS();
    var myName  = getMyName();
    var partN   = myName === (s.myName||'').toLowerCase() ? (s.partnerName||'') : (s.myName||'');
    var myDisp  = myName === (s.myName||'').toLowerCase() ? (s.myName||'') : (s.partnerName||'');
    var msgsR   = useList('chat');
    var _txt    = useState('');  var txt    = _txt[0];  var setTxt    = _txt[1];
    var _sending= useState(false); var sending = _sending[0]; var setSending = _sending[1];

    var msgs = useMemo(function() {
        if (!msgsR) return [];
        var list = Object.entries(msgsR).map(function(e2) {
            return Object.assign({ id: e2[0] }, e2[1]);
        });
        list.sort(function(a,b){ return (a.ts||0)-(b.ts||0); });
        // Only keep last 7 days
        var cutoff = Date.now() - 7*24*60*60*1000;
        return list.filter(function(m2){ return (m2.ts||0) > cutoff; });
    }, [msgsR]);

    // Auto-scroll to bottom on new messages
    var bottomRef = useRef(null);
    useEffect(function() {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [msgs.length]);

    function sendMsg() {
        var t = txt.trim();
        if (!t || sending) return;
        setSending(true);
        try {
            fbp('chat', { text: t, de: myName, ts: Date.now() });
            var preview = t.length > 60 ? t.slice(0, 60) + '…' : t;
            notifyPartner('chat', '💬 ' + (myDisp || myName), preview);
        } catch(ex) {}
        setTxt('');
        setSending(false);
        vib(20);
    }

    function delMsg(id) {
        if (!window.confirm('Apagar mensagem?')) return;
        try { fbr('chat/' + id); } catch(ex) {}
    }

    function formatTime(ts) {
        if (!ts) return '';
        var d = _brt(new Date(ts));
        var now = _brt(new Date());
        var isToday = dk(d) === dk(now);
        var h = String(d.getHours()).padStart(2,'0');
        var m = String(d.getMinutes()).padStart(2,'0');
        if (isToday) return h + ':' + m;
        var days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'];
        return days[d.getDay()] + ' ' + h + ':' + m;
    }

    return React.createElement('div', { style: { display:'flex', flexDirection:'column', height:'100%', minHeight:'0' } },

        React.createElement('div', { style: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px', flexShrink:0 } },
            React.createElement('div', { className:'sec-title' }, '💬 Chat'),
            React.createElement('div', { style: { fontSize:'.6rem', color:'var(--muted)' } }, 'Mensagens somem após 7 dias')
        ),

        React.createElement('div', {
            style: { flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:'8px',
                     padding:'4px 2px', minHeight:'0', maxHeight:'420px' }
        },
            msgs.length === 0
                ? React.createElement('div', { style:{ textAlign:'center', padding:'40px 20px', color:'var(--muted)', fontSize:'.8rem' } },
                    React.createElement('div', { style:{ fontSize:'2.5rem', marginBottom:'10px' } }, '💬'),
                    'Comecem a conversar!'
                  )
                : msgs.map(function(m2) {
                    var isMe = m2.de === myName;
                    return React.createElement('div', {
                        key: m2.id,
                        style: { display:'flex', flexDirection:'column', alignItems: isMe ? 'flex-end' : 'flex-start' }
                    },
                        React.createElement('div', {
                            style: {
                                maxWidth: '78%', padding: '8px 12px', borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                                background: isMe ? 'linear-gradient(135deg,var(--rose),var(--purple))' : 'rgba(255,255,255,.08)',
                                color: '#fff', fontSize: '.82rem', lineHeight: 1.45, wordBreak: 'break-word',
                                boxShadow: isMe ? '0 2px 12px rgba(232,131,106,.25)' : '0 1px 4px rgba(0,0,0,.2)'
                            },
                            onLongPress: function() { delMsg(m2.id); }
                        },
                            m2.text
                        ),
                        React.createElement('div', { style:{ fontSize:'.52rem', color:'var(--muted)', marginTop:'3px', paddingLeft:'4px', paddingRight:'4px' } },
                            formatTime(m2.ts)
                        )
                    );
                  }),
            React.createElement('div', { ref: bottomRef })
        ),

        React.createElement('div', { style: { display:'flex', gap:'8px', alignItems:'flex-end', paddingTop:'10px', flexShrink:0 } },
            React.createElement('textarea', {
                className: 'f',
                placeholder: 'Digite uma mensagem…',
                value: txt,
                rows: 1,
                onChange: function(e) { setTxt(e.target.value); },
                onKeyDown: function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } },
                style: { flex:1, resize:'none', minHeight:'38px', maxHeight:'90px', overflowY:'auto',
                         fontSize:'.82rem', lineHeight:1.4, padding:'9px 12px' }
            }),
            React.createElement('button', {
                onClick: sendMsg,
                disabled: !txt.trim() || sending,
                style: { width:'42px', height:'42px', borderRadius:'50%', border:'none', cursor:'pointer', flexShrink:0,
                         background: txt.trim() ? 'linear-gradient(135deg,var(--rose),var(--purple))' : 'rgba(255,255,255,.08)',
                         color:'#fff', fontSize:'1.1rem', display:'flex', alignItems:'center', justifyContent:'center',
                         transition:'all .15s', boxShadow: txt.trim() ? '0 2px 12px rgba(232,131,106,.3)' : 'none' }
            }, '➤')
        )
    );
}

function Nois() {
    var _sub = useState(function() { return localStorage.getItem('nois_sub') || 'diario'; });
    var sub  = _sub[0];
    var setSub = _sub[1];

    function setSubP(s) { localStorage.setItem('nois_sub', s); setSub(s); }

    var SUBS = [
        { id: 'diario',   l: '📖 Diário'  },
        { id: 'wishlist', l: '✨ Wishlist' },
        { id: 'capsula',  l: '⏳ Cápsula' },
        { id: 'galeria',  l: '📸 Fotos'   },
        { id: 'timeline', l: '🌟 Timeline' },
        { id: 'bilhete',  l: '💌 Bilhete' },
        { id: 'desafio',  l: '🎯 Desafio' },
        { id: 'roleta',   l: '🎡 Roleta'  },
        { id: 'metas',    l: '🏆 Metas'   },
    { id: 'chat',     l: '💬 Chat'    },
    ];
    var SUB_MAP = { diario: Diario, wishlist: Wishlist, capsula: Capsula, galeria: Galeria, timeline: Timeline, bilhete: Bilhete, desafio: Desafio, roleta: Roleta, metas: Metas, chat: Chat };
    var ActiveComp = SUB_MAP[sub] || Diario;

    return React.createElement('div', { className: 'ps', style: { padding: '13px 13px 20px', gap: '11px' } },
        React.createElement('div', { style: { flexShrink: 0 } },
            React.createElement('div', { style: { display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '3px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none' } },
                SUBS.map(function(s) {
                    var isSel = sub === s.id;
                    return React.createElement('button', {
                        key: s.id,
                        onClick: function() { setSubP(s.id); },
                        style: {
                            flex: '0 0 auto', padding: '7px 14px', borderRadius: '20px',
                            border: '1.5px solid',
                            borderColor: isSel ? 'rgba(232,131,106,.5)' : 'var(--b2)',
                            background:  isSel ? 'linear-gradient(135deg,rgba(232,131,106,.2),rgba(200,80,120,.1))' : 'rgba(255,255,255,.03)',
                            color:       isSel ? 'var(--rose3)' : 'var(--muted)',
                            fontSize: '.72rem', fontWeight: 700, whiteSpace: 'nowrap', minHeight: '34px',
                            boxShadow: isSel ? '0 2px 12px rgba(232,131,106,.12)' : 'none',
                            transition: 'all .16s', cursor: 'pointer'
                        }
                    }, s.l);
                })
            )
        ),
        React.createElement(ActiveComp, { key: sub })
    );
}
function Diario() {
    var s    = _getS();
    var dNV  = s.myName      || 'Pessoa 1';
    var dNN  = s.partnerName || 'Pessoa 2';

    var entR  = useList('diario');
    var petsR = useList('pets');

    var allEntries = useMemo(function() {
        if (!entR) return [];
        return Object.entries(entR).map(function(e2) { return Object.assign({ id: e2[0] }, e2[1]); })
            .sort(function(a, b) { return b.date > a.date ? 1 : -1; });
    }, [entR]);

    var pets = useMemo(function() {
        if (!petsR) return [];
        return Object.entries(petsR).map(function(e2) { return Object.assign({ id: e2[0] }, e2[1]); });
    }, [petsR]);

    // tela: 'lista' | 'form' | 'view'
    var _tela = useState('lista'); var tela = _tela[0]; var setTela = _tela[1];
    var _search = useState(''); var search = _search[0]; var setSearch = _search[1];
    var _mFilt = useState('');  var mFilt  = _mFilt[0];  var setMFilt  = _mFilt[1];
    var _selEntry = useState(null); var selEntry = _selEntry[0]; var setSelEntry = _selEntry[1];

    // form state
    var _fTitle   = useState(''); var fTitle   = _fTitle[0];   var setFTitle   = _fTitle[1];
    var _fText    = useState(''); var fText    = _fText[0];    var setFText    = _fText[1];
    var _fDate    = useState(dk(_brt(new Date()))); var fDate = _fDate[0]; var setFDate = _fDate[1];
    var _fWho     = useState(getMyName()); var fWho  = _fWho[0];  var setFWho   = _fWho[1];
    var _fPhoto   = useState(null); var fPhoto  = _fPhoto[0];  var setFPhoto   = _fPhoto[1];
    var _fPets    = useState([]); var fPets    = _fPets[0];    var setFPets    = _fPets[1];
    var _fLoading = useState(false); var fLoading = _fLoading[0]; var setFLoading = _fLoading[1];
    var _isEdit   = useState(null); var isEdit  = _isEdit[0];  var setIsEdit   = _isEdit[1];
    var _fLoc     = useState('');    var fLoc    = _fLoc[0];    var setFLoc     = _fLoc[1];

    var photoFileRef = useRef(null);

    // streak
    var streak = useMemo(function() {
        var dates = {};
        allEntries.forEach(function(e2) { if (e2.date) dates[e2.date] = true; });
        var count = 0;
        var d = _brt(new Date());
        while (true) {
            if (dates[dk(d)]) { count++; d.setDate(d.getDate() - 1); } else break;
        }
        return count;
    }, [allEntries]);

    var entries = useMemo(function() {
        var base = allEntries;
        if (mFilt) base = base.filter(function(e2) { return (e2.date || '').indexOf(mFilt) === 0; });
        if (!search.trim()) return base;
        var q = search.toLowerCase();
        return base.filter(function(e2) {
            return (e2.title || '').toLowerCase().indexOf(q) !== -1 ||
                   (e2.text  || '').toLowerCase().indexOf(q) !== -1;
        });
    }, [allEntries, search, mFilt]);

    var _dpg = usePagination(entries, 15, search + mFilt);
    var dSlice = _dpg.slice; var dPg = _dpg.pg; var dPages = _dpg.pages; var dTotal = _dpg.total; var dSetPg = _dpg.setPg;

    function openAdd() {
        setIsEdit(null);
        setFTitle(''); setFText(''); setFLoc('');
        setFDate(dk(_brt(new Date())));
        setFWho(getMyName());
        setFPhoto(null); setFPets([]);
        setTela('form');
    }

    function openEdit(e2) {
        setIsEdit(e2);
        setFTitle(e2.title || '');
        setFText(e2.text  || '');
        setFDate(e2.date  || dk(_brt(new Date())));
        setFWho(e2.who    || getMyName());
        setFPhoto(e2.photo || null);
        setFPets(e2.pets  || []);
        setTela('form');
        setFLoc(e2.loc   || '');
    }

    function openView(e2) {
        setSelEntry(e2);
        setTela('view');
    }

    function saveEntry() {
        if (!fTitle.trim()) { toast('Escreva um título! 📝'); return; }
        vib(24);
        var data = {
            title: fTitle.trim(),
            text:  fText.trim(),
            date:  fDate || dk(_brt(new Date())),
            who:   fWho,
            ts:    Date.now()
        };
        if (fPhoto)        data.photo = fPhoto;
        if (fPets.length)  data.pets  = fPets;
    if (fLoc.trim())   data.loc   = fLoc.trim();
        if (isEdit) {
            try { fbu('diario/' + isEdit.id, data); } catch(ex) {}
            toast('Memória editada! ✏️');
        } else {
            try {
                fbp('diario', data);
                var who = (data.who || getMyName());
                var title = '📖 ' + who.charAt(0).toUpperCase() + who.slice(1) + ' escreveu no diário';
                var preview = (data.text || '').slice(0, 80) || 'Nova memória 💕';
                notifyPartner('diario', title, preview);
            } catch(ex) {}
            toast('Memória salva! 📖');
        }
        setTela('lista'); setTimeout(function(){ var el=document.querySelector('.tab-scroll'); if(el) el.scrollTop=0; }, 50);
        setIsEdit(null);
    }

    function delEntry(id) {
        if (!window.confirm('Apagar esta memória?')) return;
        try { fbSoftDel('diario/' + id); } catch(ex) {}
        toast('Memória apagada');
        vib([20, 30, 20]);
        if (tela === 'view') setTela('lista');
    }

    function uploadDataUrl(dataUrl) {
        var img = new window.Image();
        img.onload = function() {
            var maxW   = 1200;
            var sc     = Math.min(maxW / img.width, maxW / img.height, 1);
            var canvas = document.createElement('canvas');
            canvas.width  = Math.round(img.width  * sc);
            canvas.height = Math.round(img.height * sc);
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            var compressed = canvas.toDataURL('image/jpeg', 0.85);
            var path = 'diario/' + Date.now() + '_' + Math.random().toString(36).slice(2) + '.jpg';
            fbUpload(path, compressed,
                function(url) { setFPhoto(url); setFLoading(false); },
                function(err) { console.error(err); toast('Erro ao enviar foto ☁️'); setFLoading(false); }
            );
        };
        img.onerror = function() { setFLoading(false); toast('Erro ao ler imagem'); };
        img.src = dataUrl;
    }

    function pickPhoto() {
        setFLoading(true);
        pickPhotoUnified({ source: 'ask', width: 1400, quality: 85 })
            .then(uploadDataUrl)
            .catch(function() { setFLoading(false); });
    }

    function handlePhotoFile(ev) {
        var f = ev.target.files && ev.target.files[0];
        ev.target.value = '';
        if (!f) return;
        if (f.size > 10 * 1024 * 1024) { toast('Foto muito grande! Máx 10MB'); return; }
        setFLoading(true);
        var reader = new FileReader();
        reader.onload = function(re) { uploadDataUrl(re.target.result); };
        reader.onerror = function() { setFLoading(false); };
        reader.readAsDataURL(f);
    }

    function togglePet(pid) {
        setFPets(function(prev) {
            return prev.indexOf(pid) !== -1
                ? prev.filter(function(x) { return x !== pid; })
                : prev.concat([pid]);
        });
    }

    var whoOpts = [
        { val: 'user1', cls: 'v', lbl: '\uD83D\uDC64 ' + dNV },
        { val: 'user2',  cls: 'n', lbl: '\uD83D\uDC64 ' + dNN },
        { val: 'ambos',  cls: 'b', lbl: '\uD83D\uDC6B Ambos'  }
    ];

    // ── Tela: formulário (nova/editar memória) ─────────────────────────
    if (tela === 'form') {
        return React.createElement('div', { className: 'fg', style: { gap: '12px' } },
            // Cabeçalho
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                React.createElement('button', { onClick: function() { setTela('lista'); setIsEdit(null); }, style: { background: 'none', border: 'none', color: 'var(--rose)', fontSize: '1rem', cursor: 'pointer', padding: '4px 0', flexShrink: 0 } }, '← Voltar'),
                React.createElement('div', { className: 'sec-title', style: { flex: 1 } }, isEdit ? '✏️ Editar Memória' : '📝 Nova Memória')
            ),
            React.createElement('input', { ref: photoFileRef, type: 'file', accept: 'image/*', style: { display: 'none' }, onChange: handlePhotoFile }),

            React.createElement('div', { className: 'card fg', style: { gap: '11px' } },
                // Título
                React.createElement('input', {
                    className: 'f',
                    placeholder: 'Título da memória…',
                    value: fTitle,
                    onChange: function(e) { setFTitle(e.target.value); }
                }),
                // Texto
                React.createElement('textarea', {
                    className: 'memo',
                    style: { minHeight: '90px', resize: 'none' },
                    placeholder: 'Conta mais sobre esse momento especial…',
                    value: fText,
                    onChange: function(e) { setFText(e.target.value); }
                }),
                // Data
// Local
React.createElement('input', {
    className: 'f',
    placeholder: '📍 Local (opcional, ex: Parque Ibirapuera)…',
    value: fLoc,
    onChange: function(e) { setFLoc(e.target.value); }
}),
                React.createElement('div', { style: { fontSize: '.7rem', color: 'var(--muted)', fontWeight: 700 } }, '📅 Data:'),
                React.createElement(DateBR, { value: fDate, onChange: setFDate }),

                // Quem
                React.createElement('div', { style: { fontSize: '.7rem', color: 'var(--muted)', fontWeight: 700 } }, '👤 Quem escreveu:'),
                React.createElement('div', { className: 'wt' },
                    whoOpts.map(function(o) {
                        return React.createElement('button', {
                            key: o.val,
                            className: 'wb ' + o.cls + (fWho === o.val ? ' on' : ''),
                            onClick: function() { setFWho(o.val); }
                        }, o.lbl);
                    })
                ),

                // Pets
                pets.length > 0 ? React.createElement('div', null,
                    React.createElement('div', { style: { fontSize: '.7rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '6px' } }, '🐾 Marcar pet:'),
                    React.createElement('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
                        pets.map(function(p) {
                            var sel = fPets.indexOf(p.id) !== -1;
                            return React.createElement('button', {
                                key: p.id,
                                onClick: function() { togglePet(p.id); },
                                style: {
                                    padding: '5px 11px', borderRadius: '12px',
                                    border: '1.5px solid',
                                    borderColor: sel ? 'var(--rose)' : 'var(--b2)',
                                    background:  sel ? 'rgba(232,131,106,.15)' : 'transparent',
                                    color: 'var(--text)', fontSize: '.72rem', cursor: 'pointer'
                                }
                            }, '🐾 ' + p.name);
                        })
                    )
                ) : null,

                // Foto preview
                fPhoto ? React.createElement('div', { style: { borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--b2)' } },
                    React.createElement('img', { src: fPhoto, loading: 'lazy', style: { width: '100%', maxHeight: '180px', objectFit: 'cover', display: 'block' } })
                ) : null,

                // Botões
                React.createElement('div', { style: { display: 'flex', gap: '8px' } },
                    React.createElement('button', {
                        className: 'bs',
                        style: { flex: 1 },
                        onClick: pickPhoto,
                        disabled: fLoading
                    }, fLoading ? '⏳ Comprimindo…' : fPhoto ? '🖼️ Trocar foto' : '📷 Adicionar foto'),
                    React.createElement('button', {
                        className: 'bp',
                        style: { flex: 1 },
                        onClick: saveEntry
                    }, isEdit ? 'Salvar' : '📖 Registrar')
                )
            )
        );
    }

    // ── Tela: visualizar memória ───────────────────────────────────────
    if (tela === 'view' && selEntry) {
        var e3 = selEntry;
        var d3 = e3.date ? new Date(e3.date + 'T12:00:00') : null;
        return React.createElement('div', { className: 'fg', style: { gap: '12px' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                React.createElement('button', { onClick: function() { setTela('lista'); setSelEntry(null); }, style: { background: 'none', border: 'none', color: 'var(--rose)', fontSize: '1rem', cursor: 'pointer', padding: '4px 0', flexShrink: 0 } }, '← Voltar'),
                React.createElement('div', { className: 'sec-title', style: { flex: 1 } }, '📖 Memória')
            ),
            React.createElement('div', { className: 'card', style: { padding: '16px' } },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' } },
                    React.createElement('div', { style: { fontFamily: "'Cormorant Garamond',serif", fontSize: '1.15rem', fontWeight: 600, color: 'var(--cream)', flex: 1, lineHeight: 1.3 } }, e3.title),
                    React.createElement('div', { style: { fontSize: '.6rem', color: 'var(--muted)', flexShrink: 0, marginLeft: '10px', marginTop: '3px' } },
                        d3 ? d3.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : e3.date
                    )
                ),
                e3.photo ? React.createElement('div', { style: { borderRadius: '12px', overflow: 'hidden', marginBottom: '12px', border: '1px solid var(--b1)' } },
                    React.createElement('img', { src: e3.photo, loading: 'lazy', style: { width: '100%', maxHeight: '260px', objectFit: 'cover', display: 'block' } })
                ) : null,
                e3.text ? React.createElement('div', { style: { fontSize: '.82rem', color: 'var(--text)', lineHeight: 1.7, marginBottom: '12px', whiteSpace: 'pre-wrap' } }, e3.text) : null,
                React.createElement('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' } },
e3.loc ? React.createElement('a', { href: 'https://www.google.com/maps/search/' + encodeURIComponent(e3.loc), target: '_blank', rel: 'noopener noreferrer', style: { display:'flex', alignItems:'center', gap:'4px', fontSize:'.68rem', color:'var(--rose)', textDecoration:'none', marginBottom:'6px' } }, '📍', e3.loc) : null,
                    React.createElement(WB, { who: e3.who || 'ambos' }),
                    (e3.pets && e3.pets.length > 0) ? e3.pets.map(function(pid) {
                        var p = pets.find(function(x) { return x.id === pid; });
                        return p ? React.createElement('span', { key: pid, style: { fontSize: '.6rem', color: 'var(--muted)', background: 'rgba(255,255,255,.05)', padding: '2px 8px', borderRadius: '10px' } }, '🐾 ' + p.name) : null;
                    }) : null
                )
            ),
            React.createElement('div', { style: { display: 'flex', gap: '8px' } },
                React.createElement('button', { className: 'bs', style: { flex: 1 }, onClick: function() { openEdit(e3); } }, '✏️ Editar'),
                React.createElement('button', { className: 'bs', style: { flex: 1, color: 'var(--danger)', borderColor: 'var(--danger)' }, onClick: function() { delEntry(e3.id); } }, '🗑️ Apagar')
            )
        );
    }

    // ── Tela: lista ────────────────────────────────────────────────────

    return React.createElement('div', { className: 'fg', style: { gap: '12px' } },
        // Cabeçalho
        React.createElement('div', { className: 'card' },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' } },
                React.createElement('div', { className: 'sec-title', style: { marginBottom: 0 } }, '📖 Diário do Casal'),
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                    streak > 0 ? React.createElement('span', { style: { fontSize: '.63rem', color: 'var(--rose)', fontWeight: 700, background: 'rgba(232,131,106,.1)', padding: '3px 8px', borderRadius: '10px', border: '1px solid rgba(232,131,106,.2)' } }, '🔥 ' + streak + 'd') : null,
                    React.createElement('button', { className: 'bp', style: { padding: '6px 14px', fontSize: '.75rem' }, onClick: openAdd }, '+ Nova')
                )
            ),
            React.createElement('input', {
                className: 'f',
                placeholder: '🔍 Buscar memórias…',
                value: search,
                onChange: function(e) { setSearch(e.target.value); }
            })
        ),

        React.createElement('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' } },
            React.createElement('button', {
                onClick: function() { setMFilt(''); },
                style: { fontSize: '.65rem', padding: '3px 10px', borderRadius: '10px', border: '1px solid var(--b2)',
                    background: !mFilt ? 'var(--purple)' : 'transparent', color: !mFilt ? '#fff' : 'var(--muted)', cursor: 'pointer' }
            }, 'Todos'),
            (function() {
                var months = {};
                allEntries.forEach(function(e2) {
                    if (e2.date) { var mk3 = e2.date.slice(0,7); months[mk3] = true; }
                });
                return Object.keys(months).sort().reverse().slice(0,6).map(function(mk3) {
                    var p = mk3.split('-');
                    var lbl = MN[Number(p[1])-1] + ' ' + p[0];
                    return React.createElement('button', {
                        key: mk3,
                        onClick: function() { setMFilt(mk3); },
                        style: { fontSize: '.65rem', padding: '3px 10px', borderRadius: '10px', border: '1px solid var(--b2)',
                            background: mFilt === mk3 ? 'var(--purple)' : 'transparent', color: mFilt === mk3 ? '#fff' : 'var(--muted)', cursor: 'pointer' }
                    }, lbl);
                });
            })()
        ),


        // Estado vazio
        entries.length === 0 && !search ? React.createElement('div', { className: 'card', style: { padding: '40px 20px', textAlign: 'center' } },
            React.createElement('div', { style: { fontSize: '2.8rem', marginBottom: '10px' } }, '📖'),
            React.createElement('div', { style: { color: 'var(--muted)', fontSize: '.82rem', lineHeight: 1.5 } },
                'Registrem suas memórias juntos!', React.createElement('br'), 'Cada momento conta 💕'
            )
        ) : null,
        entries.length === 0 && search ? React.createElement('div', { style: { textAlign: 'center', padding: '24px', color: 'var(--muted)', fontSize: '.78rem' } },
            'Nenhuma memória para "' + search + '"'
        ) : null,

        // Lista de entradas
        entries.length > 0 ? React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
            dSlice.map(function(e2) {
                var dateStr = e2.date || '';
                var d2 = dateStr ? new Date(dateStr + 'T12:00:00') : null;
                var formattedDate = d2
                    ? d2.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
                    : dateStr;
                return React.createElement('div', {
                    key: e2.id,
                    className: 'card',
                    style: { cursor: 'pointer', padding: '13px 14px', margin: 0 },
                    onClick: function() { openView(e2); }
                },
                    // Linha superior: título + data
                    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: e2.photo || e2.text ? '8px' : '6px' } },
                        React.createElement('div', { style: { fontWeight: 700, color: 'var(--cream)', fontSize: '.85rem', flex: 1, lineHeight: 1.3 } }, e2.title),
                        React.createElement('div', { style: { fontSize: '.58rem', color: 'var(--muted)', flexShrink: 0, marginLeft: '10px', marginTop: '2px' } }, formattedDate)
                    ),
                    // Foto (thumbnail)
                    e2.photo ? React.createElement('div', { style: { borderRadius: '9px', overflow: 'hidden', marginBottom: '8px', border: '1px solid var(--b1)' } },
                        React.createElement('img', { src: e2.photo, loading: 'lazy', decoding: 'async', style: { width: '100%', maxHeight: '140px', objectFit: 'cover', display: 'block' } })
                    ) : null,
                    // Texto (preview)
                    e2.text ? React.createElement('div', { style: { fontSize: '.76rem', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } }, e2.text) : null,
                    // Badges
                    React.createElement('div', { style: { display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' } },
                        React.createElement(WB, { who: e2.who || 'ambos' }),
                        (e2.pets && e2.pets.length > 0) ? e2.pets.map(function(pid) {
                            var p = pets.find(function(x) { return x.id === pid; });
                            return p ? React.createElement('span', { key: pid, style: { fontSize: '.58rem', color: 'var(--muted)', background: 'rgba(255,255,255,.05)', padding: '1px 7px', borderRadius: '9px' } }, '🐾 ' + p.name) : null;
                        }) : null,
                        // Editar / apagar inline
                        React.createElement('div', { style: { marginLeft: 'auto', display: 'flex', gap: '4px' }, onClick: function(ev) { ev.stopPropagation(); } },
                            React.createElement('button', { onClick: function() { openEdit(e2); }, style: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: '.75rem', cursor: 'pointer', padding: '3px 6px', borderRadius: '6px' } }, '✏️'),
                            React.createElement('button', { onClick: function() { delEntry(e2.id); }, style: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: '.75rem', cursor: 'pointer', padding: '3px 6px', borderRadius: '6px' } }, '🗑️')
                        )
                    )
                );
            })
        ) : null,

        // Paginação + Contador
        entries.length > 0 ? React.createElement(PgBar, { pg: dPg, pages: dPages, total: dTotal, setPg: dSetPg, label: 'memórias' }) : null,
        entries.length > 0 ? React.createElement('div', { style: { textAlign: 'center', fontSize: '.62rem', color: 'var(--muted)', paddingBottom: '4px' } },
            allEntries.length + (allEntries.length === 1 ? ' memória' : ' memórias') + ' registradas 💕'
        ) : null
    );
}

function WishlistPending(props) {
    var items      = props.items || [];
    var delItem    = props.delItem;
    var toggleDone = props.toggleDone;
    var _wpg   = usePagination(items, 15, items.length);
    var wSlice = _wpg.slice; var wPg = _wpg.pg; var wPages = _wpg.pages; var wTotal = _wpg.total; var wSetPg = _wpg.setPg;
    return React.createElement('div', null,
        React.createElement('div', { className: 'card', style: { padding: '4px 0' } },
            wSlice.map(function(it, idx) {
                var ico   = (it.cat || '❓').split(' ')[0];
                var dtStr = it.dtAlvo ? it.dtAlvo.split('-').reverse().join('/') : '';
                var isLast = idx === wSlice.length - 1;
                return React.createElement('div', {
                    key: it.id,
                    style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderBottom: isLast ? 'none' : '1px solid var(--b1)' }
                },
                    React.createElement('div', { style: { fontSize: '1.1rem', width: '28px', textAlign: 'center', flexShrink: 0 } }, ico),
                    React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' } },
                            React.createElement('div', { style: { fontSize: '.8rem', fontWeight: 600, color: 'var(--cream)' } }, it.name),
                            it.prio === 'alta'  ? React.createElement('span', { style: { fontSize: '.52rem', fontWeight: 700, color: 'var(--danger)', background: 'rgba(224,88,112,.12)', borderRadius: '4px', padding: '1px 5px', flexShrink: 0 } }, 'ALTA')  : null,
                            it.prio === 'baixa' ? React.createElement('span', { style: { fontSize: '.52rem', fontWeight: 700, color: 'var(--sage)',   background: 'rgba(142,196,160,.1)', borderRadius: '4px', padding: '1px 5px', flexShrink: 0 } }, 'BAIXA') : null
                        ),
                        it.note ? React.createElement('div', { style: { fontSize: '.62rem', color: 'var(--muted)', marginTop: '2px' } }, it.note) : null,
                        it.link ? React.createElement('a', { href: it.link, target: '_blank', rel: 'noopener noreferrer', onClick: function(e) { e.stopPropagation(); }, style: { fontSize: '.6rem', color: 'var(--sky)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px', marginTop: '2px', fontWeight: 600 } }, '🔗 abrir link ↗') : null,
                        dtStr ? React.createElement('div', { style: { fontSize: '.58rem', color: 'var(--gold)', marginTop: '2px' } }, '📅 Até ' + dtStr) : null,
                        React.createElement('div', { style: { marginTop: '4px' } }, React.createElement(WB, { who: it.who || 'ambos' }))
                    ),
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 } },
                        React.createElement('button', { onClick: function() { delItem(it.id); }, style: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: '.85rem', cursor: 'pointer', padding: '4px', borderRadius: '6px', opacity: .6 } }, '🗑️'),
                        React.createElement('div', { className: 'wli-ck', onClick: function() { toggleDone(it); } }, '✓')
                    )
                );
            })
        ),
        React.createElement(PgBar, { pg: wPg, pages: wPages, total: wTotal, setPg: wSetPg, label: 'desejos' })
    );
}
function WishlistDone(props) {
    var items   = props.items || [];
    var delItem = props.delItem;
    var _dpg   = usePagination(items, 15, items.length);
    var dSlice = _dpg.slice; var dPg = _dpg.pg; var dPages = _dpg.pages; var dTotal = _dpg.total; var dSetPg = _dpg.setPg;
    return React.createElement('div', null,
        React.createElement('div', { style: { fontSize: '.72rem', color: 'var(--muted)', padding: '2px 2px 6px', fontWeight: 700 } }, '✅ Já fizemos! (' + items.length + ')'),
        React.createElement('div', { className: 'card', style: { padding: '4px 0' } },
            dSlice.map(function(it, idx) {
                var ico    = (it.cat || '❓').split(' ')[0];
                var isLast = idx === dSlice.length - 1;
                return React.createElement('div', {
                    key: it.id,
                    style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', opacity: .5, borderBottom: isLast ? 'none' : '1px solid var(--b1)' }
                },
                    React.createElement('div', { style: { fontSize: '1rem', width: '28px', textAlign: 'center', flexShrink: 0 } }, ico),
                    React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                        React.createElement('div', { style: { fontSize: '.78rem', fontWeight: 600, color: 'var(--muted)', textDecoration: 'line-through' } }, it.name),
                        it.doneDate ? React.createElement('div', { style: { fontSize: '.58rem', color: 'var(--muted)', marginTop: '2px' } }, 'feito em ' + it.doneDate.split('-').reverse().join('/')) : null
                    ),
                    React.createElement('button', { onClick: function() { delItem(it.id); }, style: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: '1rem', cursor: 'pointer', padding: '4px', flexShrink: 0 } }, '✕')
                );
            })
        ),
        React.createElement(PgBar, { pg: dPg, pages: dPages, total: dTotal, setPg: dSetPg, label: 'realizados' })
    );
}
function Wishlist() {
    var s   = _getS();
    var wNV = s.myName      || 'Pessoa 1';
    var wNN = s.partnerName || 'Pessoa 2';

    var itR   = useList('wishlist');
    var items = useMemo(function() {
        if (!itR) return [];
        return Object.entries(itR).map(function(e2) { return Object.assign({ id: e2[0] }, e2[1]); });
    }, [itR]);

    // tela: 'lista' | 'form'
    var _tela = useState('lista'); var tela = _tela[0]; var setTela = _tela[1];

    // filtros
    var _fw = useState('todos'); var filterWho = _fw[0]; var setFilterWho = _fw[1];
    var _fc = useState('');      var filterCat  = _fc[0];  var setFilterCat  = _fc[1];
    var _fp2 = useState('');     var filterPrio = _fp2[0]; var setFilterPrio = _fp2[1];

    // form fields
    var _fn   = useState('');           var fName   = _fn[0];   var setFName   = _fn[1];
    var _fnot = useState('');           var fNote   = _fnot[0]; var setFNote   = _fnot[1];
    var _flnk = useState('');           var fLink   = _flnk[0]; var setFLink   = _flnk[1];
    var _fcat = useState(WISHLIST_CATS[0]); var fCat = _fcat[0]; var setFCat   = _fcat[1];
    var _fp   = useState('normal');     var fPrio   = _fp[0];   var setFPrio   = _fp[1];
    var _fdt  = useState('');           var fDtAlvo = _fdt[0];  var setFDtAlvo = _fdt[1];
    var _fwho = useState(getMyName());  var fWho    = _fwho[0]; var setFWho    = _fwho[1];

    function resetForm() {
        setFName(''); setFNote(''); setFLink('');
        setFCat(WISHLIST_CATS[0]); setFPrio('normal');
        setFDtAlvo(''); setFWho(getMyName());
    }

    function openAdd() { resetForm(); setTela('form'); }
    function cancelForm() { setTela('lista'); }

    function saveItem() {
        if (!fName.trim()) { toast('Escreva o nome do item! ⭐'); return; }
        vib(24);
        try {
            fbp('wishlist', {
                name:    fName.trim(),
                note:    fNote.trim(),
                link:    fLink.trim() || null,
                cat:     fCat,
                prio:    fPrio,
                dtAlvo:  fDtAlvo || '',
                who:     fWho,
                done:    false,
                ts:      Date.now()
            });
        } catch(ex) {}
        toast('Adicionado à wishlist! ⭐');
        resetForm();
        setTela('lista');
    }

    function toggleDone(it) {
        var nowDone = !it.done;
        vib(28);
        try { fbu('wishlist/' + it.id, { done: nowDone, doneDate: nowDone ? dk(_brt(new Date())) : null }); } catch(ex) {}
        if (nowDone) toast('Feito! 🎉 Que saudade vai dar…');
    }

    function delItem(id) {
        vib(35);
        try { fbr('wishlist/' + id); } catch(ex) {}
    }

    // listas computadas
    var myName2    = getMyName();
    var partnerN2  = myName2 === 'user1' ? 'user2' : 'user1';
    var pending    = items.filter(function(it) { return !it.done; });
    var doneItems  = items.filter(function(it) { return  it.done; });

    var filteredPending = pending.filter(function(it) {
        if (filterWho === 'mine' && (it.who || 'ambos') !== 'ambos' && it.who !== myName2) return false;
        if (filterWho === 'partner' && (it.who || 'ambos') !== 'ambos' && it.who !== partnerN2) return false;
        if (filterCat && it.cat !== filterCat) return false;
    if (filterPrio && (it.prio || 'normal') !== filterPrio) return false;
        return true;
}).sort(function(a, b) {
    var prioOrder = { alta: 0, normal: 1, baixa: 2 };
    var pa = prioOrder[a.prio || 'normal'] || 1;
    var pb = prioOrder[b.prio || 'normal'] || 1;
    if (pa !== pb) return pa - pb;
    return (b.ts || 0) - (a.ts || 0);
});

    var cats = [];
    items.forEach(function(it) { if (it.cat && cats.indexOf(it.cat) === -1) cats.push(it.cat); });

    var prioOpts = [['alta','🔴 Alta'],['normal','🟡 Normal'],['baixa','🟢 Baixa']];
    var whoOpts  = [
        { val: 'user1', cls: 'v', lbl: '👤 ' + wNV },
        { val: 'user2',  cls: 'n', lbl: '👤 ' + wNN },
        { val: 'ambos',  cls: 'b', lbl: '👫 Ambos'  }
    ];

    // ── Tela: formulário ────────────────────────────────────────────────
    if (tela === 'form') {
        return React.createElement('div', { className: 'fg', style: { gap: '12px' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                React.createElement('button', { onClick: cancelForm, style: { background: 'none', border: 'none', color: 'var(--rose)', fontSize: '1rem', cursor: 'pointer', padding: '4px 0', flexShrink: 0 } }, '← Voltar'),
                React.createElement('div', { className: 'sec-title', style: { flex: 1 } }, '⭐ Novo Item')
            ),
            React.createElement('div', { className: 'card fg', style: { gap: '11px' } },
                // Nome
                React.createElement('input', {
                    className: 'f',
                    placeholder: 'Ex: Jantar japonês, Cinema IMAX, Viagem…',
                    value: fName,
                    onChange: function(e) { setFName(e.target.value); },
                    autoFocus: true
                }),
                // Nota
                React.createElement('input', {
                    className: 'f',
                    placeholder: 'Notas (opcional)…',
                    value: fNote,
                    onChange: function(e) { setFNote(e.target.value); }
                }),
                // Link
                React.createElement('input', {
                    className: 'f',
                    placeholder: '🔗 Link (opcional)…',
                    type: 'url',
                    value: fLink,
                    onChange: function(e) { setFLink(e.target.value); }
                }),
                // Categoria
                React.createElement('select', {
                    className: 'f',
                    value: fCat,
                    onChange: function(e) { setFCat(e.target.value); }
                },
                    WISHLIST_CATS.map(function(c) { return React.createElement('option', { key: c, value: c }, c); })
                ),
                // Prioridade
                React.createElement('div', { style: { fontSize: '.7rem', color: 'var(--muted)', fontWeight: 700 } }, 'Prioridade:'),
                React.createElement('div', { style: { display: 'flex', gap: '5px' } },
                    prioOpts.map(function(po) {
                        var sel = fPrio === po[0];
                        return React.createElement('button', {
                            key: po[0],
                            onClick: function() { setFPrio(po[0]); },
                            style: {
                                flex: 1, padding: '7px 4px', borderRadius: '8px',
                                border: '1.5px solid',
                                borderColor: sel ? 'var(--rose)' : 'var(--b2)',
                                background:  sel ? 'rgba(232,131,106,.12)' : 'transparent',
                                color:       sel ? 'var(--rose)' : 'var(--muted)',
                                fontSize: '.68rem', fontWeight: 700, cursor: 'pointer'
                            }
                        }, po[1]);
                    })
                ),
                // Data alvo
                React.createElement('div', { style: { fontSize: '.7rem', color: 'var(--muted)', fontWeight: 700 } }, '📅 Data alvo (opcional):'),
                React.createElement(DateBR, { value: fDtAlvo, onChange: setFDtAlvo }),
                // Quem
                React.createElement('div', { style: { fontSize: '.7rem', color: 'var(--muted)', fontWeight: 700 } }, '👤 De quem:'),
                React.createElement('div', { className: 'wt' },
                    whoOpts.map(function(o) {
                        return React.createElement('button', {
                            key: o.val,
                            className: 'wb ' + o.cls + (fWho === o.val ? ' on' : ''),
                            onClick: function() { setFWho(o.val); }
                        }, o.lbl);
                    })
                ),
                // Ações
                React.createElement('div', { style: { display: 'flex', gap: '8px', marginTop: '4px' } },
                    React.createElement('button', { className: 'bs', style: { flex: 1 }, onClick: cancelForm }, '✕ Cancelar'),
                    React.createElement('button', { className: 'bp', style: { flex: 1 }, onClick: saveItem }, '✨ Adicionar')
                )
            )
        );
    }

    // ── Tela: lista ──────────────────────────────────────────────────────
    return React.createElement('div', { className: 'fg', style: { gap: '12px' } },
        // Cabeçalho
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
            React.createElement('div', { className: 'sec-title' }, '⭐ Wishlist do Casal'),
            React.createElement('button', { className: 'bp', style: { width: 'auto', padding: '7px 14px', fontSize: '.78rem' }, onClick: openAdd }, '+ Item')
        ),

        // Filtros (só se tiver itens)
        items.length > 1 ? React.createElement('div', { style: { display: 'flex', gap: '5px', flexWrap: 'wrap' } },
            React.createElement('button', { className: 'wf-pill' + (filterWho === 'todos' ? ' on' : ''), onClick: function() { setFilterWho('todos'); } }, 'Todos'),
            React.createElement('button', { className: 'wf-pill' + (filterWho === 'mine' ? ' on' : ''), onClick: function() { setFilterWho('mine'); } }, 'Meus'),
            React.createElement('button', { className: 'wf-pill' + (filterWho === 'partner' ? ' on' : ''), onClick: function() { setFilterWho('partner'); } }, 'Parceiro/a'),
            cats.map(function(cat) {
                return React.createElement('button', {
                    key: cat,
                    className: 'wf-pill' + (filterCat === cat ? ' on' : ''),
                    onClick: function() { setFilterCat(filterCat === cat ? '' : cat); }
                }, (cat || '').split(' ')[0]);
            }),
        React.createElement('button', { className: 'wf-pill' + (filterPrio === 'alta'   ? ' on' : ''), onClick: function() { setFilterPrio(filterPrio === 'alta'   ? '' : 'alta');   }, style:{fontSize:'.85rem'} }, '🔴'),
        React.createElement('button', { className: 'wf-pill' + (filterPrio === 'normal' ? ' on' : ''), onClick: function() { setFilterPrio(filterPrio === 'normal' ? '' : 'normal'); }, style:{fontSize:'.85rem'} }, '🟡'),
        React.createElement('button', { className: 'wf-pill' + (filterPrio === 'baixa'  ? ' on' : ''), onClick: function() { setFilterPrio(filterPrio === 'baixa'  ? '' : 'baixa');  }, style:{fontSize:'.85rem'} }, '🟢')
        ) : null,

        // Vazio
        items.length === 0 ? React.createElement('div', { className: 'card', style: { padding: '40px 20px', textAlign: 'center' } },
            React.createElement('div', { style: { fontSize: '2.8rem', marginBottom: '10px' } }, '⭐'),
            React.createElement('div', { style: { color: 'var(--muted)', fontSize: '.82rem', lineHeight: 1.6 } },
                'Sem desejos ainda…', React.createElement('br'),
                React.createElement('span', { style: { fontSize: '.75rem' } }, 'Restaurantes, filmes, viagens, compras…')
            )
        ) : null,

        // Pendentes
        filteredPending.length > 0 ? React.createElement(WishlistPending, { items: filteredPending, delItem: delItem, toggleDone: toggleDone }) : null,
        // Já fizemos!
        doneItems.length > 0 ? React.createElement(WishlistDone, { items: doneItems, delItem: delItem }) : null,

        // Contador
        items.length > 0 ? React.createElement('div', { style: { textAlign: 'center', fontSize: '.62rem', color: 'var(--muted)', paddingBottom: '4px' } },
            pending.length + ' pendente' + (pending.length !== 1 ? 's' : '') +
            ' · ' + doneItems.length + ' realizado' + (doneItems.length !== 1 ? 's' : '') + ' 💕'
        ) : null
    );
}
function Capsula() {
    var s    = _getS();
    var cNV  = s.myName      || 'Pessoa 1';
    var cNN  = s.partnerName || 'Pessoa 2';

    var capR = useList('capsulas');
    var caps = useMemo(function() {
        if (!capR) return [];
        return Object.entries(capR).map(function(e2) { return Object.assign({ id: e2[0] }, e2[1]); })
            .sort(function(a, b) { return (a.openDate || '') > (b.openDate || '') ? 1 : -1; });
    }, [capR]);

    // tela: 'lista' | 'form' | 'edit' | 'zoom'
    var _tela = useState('lista'); var tela = _tela[0]; var setTela = _tela[1];
    var _editId = useState(null);  var editId = _editId[0]; var setEditId = _editId[1];
    var _zoomSrc = useState(null); var zoomSrc = _zoomSrc[0]; var setZoomSrc = _zoomSrc[1];

    // form state
    var _fTitle = useState('');     var fTitle = _fTitle[0]; var setFTitle = _fTitle[1];
    var _fMsg   = useState('');     var fMsg   = _fMsg[0];   var setFMsg   = _fMsg[1];
    var _fDate  = useState('');     var fDate  = _fDate[0];  var setFDate  = _fDate[1];
    var _fWho   = useState('ambos');var fWho   = _fWho[0];   var setFWho   = _fWho[1];
    var _fPhoto = useState(null);   var fPhoto = _fPhoto[0]; var setFPhoto = _fPhoto[1];
    var _fLoad  = useState(false);  var fLoad  = _fLoad[0];  var setFLoad  = _fLoad[1];

    // edit state
    var _eMsg = useState(''); var eMsg = _eMsg[0]; var setEMsg = _eMsg[1];

    var photoRef = useRef(null);

    function resetForm() {
        setFTitle(''); setFMsg(''); setFDate('');
        setFWho('ambos'); setFPhoto(null);
    }

    function openAdd() { resetForm(); setTela('form'); }
    function cancelForm() { setTela('lista'); }

    function pickPhoto() { if (photoRef.current) photoRef.current.click(); }

    function handlePhoto(ev) {
        var f = ev.target.files && ev.target.files[0];
        ev.target.value = '';
        if (!f) return;
        setFLoad(true);
        var reader = new FileReader();
        reader.onload = function(re) {
            var img = new window.Image();
            img.onload = function() {
                var max = 700;
                var sc  = Math.min(max / img.width, max / img.height, 1);
                var c   = document.createElement('canvas');
                c.width  = Math.round(img.width  * sc);
                c.height = Math.round(img.height * sc);
                c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
                setFPhoto(c.toDataURL('image/jpeg', 0.78));
                setFLoad(false);
            };
            img.onerror = function() { setFLoad(false); };
            img.src = re.target.result;
        };
        reader.onerror = function() { setFLoad(false); };
        reader.readAsDataURL(f);
    }

    function saveCap() {
        if (!fMsg.trim())  { toast('Escreva a mensagem! 💌'); return; }
        if (!fDate)        { toast('Escolha a data de abertura! 📅'); return; }
        if (fDate <= dk(td())) { toast('Escolha uma data futura! ⏳'); return; }
        vib(24);
        var data = {
            title:    fTitle.trim() || 'Mensagem do Futuro',
            msg:      fMsg.trim(),
            openDate: fDate,
            who:      fWho,
            created:  dk(_brt(new Date())),
            ts:       Date.now()
        };
        if (fPhoto) data.photo = fPhoto;
        try { fbp('capsulas', data); } catch(ex) {}
        toast('Cápsula criada! 🔮');
        resetForm();
        setTela('lista');
    }

    function saveEdit() {
        if (!eMsg.trim()) { toast('Mensagem não pode ser vazia!'); return; }
        try { fbu('capsulas/' + editId, { msg: eMsg.trim() }); } catch(ex) {}
        vib(20);
        toast('Mensagem atualizada! ✨');
        setTela('lista');
        setEditId(null);
    }

    function delCap(id) {
        vib(35);
        try { fbSoftDel('capsulas/' + id); } catch(ex) {}
        toast('Cápsula removida');
    }

    function countdownLabel(openDate) {
        var open    = new Date(openDate + 'T12:00:00');
        var msLeft  = open.getTime() - _brt(new Date()).getTime();
        if (msLeft <= 0) return null;
        var daysL   = Math.floor(msLeft / 864e5);
        var hoursL  = Math.floor((msLeft % 864e5) / 36e5);
        var minsL   = Math.floor((msLeft % 36e5)  / 6e4);
        if (daysL > 0)   return '🔒 Abre em ' + daysL + 'd ' + hoursL + 'h';
        if (hoursL > 0)  return '🔒 Menos de 24h! ' + hoursL + 'h ' + minsL + 'm';
        return '🔒 Abre hoje! ' + minsL + 'min';
    }

    var whoOpts = [
        { val: 'user1', cls: 'v', lbl: '👤 ' + cNV },
        { val: 'user2',  cls: 'n', lbl: '👤 ' + cNN },
        { val: 'ambos',  cls: 'b', lbl: '👫 Ambos'  }
    ];

    // ── Tela: formulário nova cápsula ──────────────────────────────────
    if (tela === 'form') {
        return React.createElement('div', { className: 'fg', style: { gap: '12px' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                React.createElement('button', { onClick: cancelForm, style: { background: 'none', border: 'none', color: 'var(--rose)', fontSize: '1rem', cursor: 'pointer', padding: '4px 0', flexShrink: 0 } }, '← Voltar'),
                React.createElement('div', { className: 'sec-title', style: { flex: 1 } }, '🔮 Nova Cápsula')
            ),
            React.createElement('input', { ref: photoRef, type: 'file', accept: 'image/*', style: { display: 'none' }, onChange: handlePhoto }),
            React.createElement('div', { className: 'card fg', style: { gap: '11px' } },
                React.createElement('input', {
                    className: 'f',
                    placeholder: 'Título (ex: Para nosso 1 ano…)',
                    value: fTitle,
                    onChange: function(e) { setFTitle(e.target.value); }
                }),
                React.createElement('textarea', {
                    className: 'memo',
                    style: { minHeight: '100px', resize: 'none' },
                    placeholder: 'Escreva sua mensagem para o futuro… 💌',
                    value: fMsg,
                    onChange: function(e) { setFMsg(e.target.value); }
                }),
                React.createElement('div', { style: { fontSize: '.7rem', color: 'var(--muted)', fontWeight: 700 } }, '📅 Abre na data:'),
                React.createElement(DateBR, { value: fDate, onChange: setFDate }),
                fDate ? React.createElement('div', { style: { fontSize: '.7rem', color: 'var(--rose3)', textAlign: 'center', marginTop: '-4px' } },
                    '✓ ' + fDate.split('-').reverse().join('/')
                ) : null,
                React.createElement('div', { style: { fontSize: '.7rem', color: 'var(--muted)', fontWeight: 700 } }, '👤 De quem:'),
                React.createElement('div', { className: 'wt' },
                    whoOpts.map(function(o) {
                        return React.createElement('button', {
                            key: o.val,
                            className: 'wb ' + o.cls + (fWho === o.val ? ' on' : ''),
                            onClick: function() { setFWho(o.val); }
                        }, o.lbl);
                    })
                ),
                // Foto
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                    React.createElement('button', {
                        className: 'bs',
                        style: { flex: 1 },
                        onClick: pickPhoto,
                        disabled: fLoad
                    }, fLoad ? '⏳ Carregando…' : fPhoto ? '🖼️ Trocar foto' : '📷 Foto (opcional)'),
                    fPhoto ? React.createElement('img', {
                        src: fPhoto, loading: 'lazy',
                        style: { width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '2px solid var(--rose)', flexShrink: 0 }
                    }) : null
                ),
                React.createElement('div', { style: { display: 'flex', gap: '8px', marginTop: '4px' } },
                    React.createElement('button', { className: 'bs', style: { flex: 1 }, onClick: cancelForm }, '✕ Cancelar'),
                    React.createElement('button', { className: 'bp', style: { flex: 1 }, onClick: saveCap }, '🔒 Selar Cápsula')
                )
            )
        );
    }

    // ── Tela: editar mensagem ──────────────────────────────────────────
    if (tela === 'edit') {
        return React.createElement('div', { className: 'fg', style: { gap: '12px' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                React.createElement('button', { onClick: function() { setTela('lista'); setEditId(null); }, style: { background: 'none', border: 'none', color: 'var(--rose)', fontSize: '1rem', cursor: 'pointer', padding: '4px 0', flexShrink: 0 } }, '← Voltar'),
                React.createElement('div', { className: 'sec-title', style: { flex: 1 } }, '✏️ Editar Mensagem')
            ),
            React.createElement('div', { className: 'card fg', style: { gap: '10px' } },
                React.createElement('textarea', {
                    className: 'memo',
                    style: { minHeight: '100px', resize: 'none' },
                    value: eMsg,
                    onChange: function(e) { setEMsg(e.target.value); },
                    placeholder: 'Sua mensagem para o futuro…'
                }),
                React.createElement('div', { style: { display: 'flex', gap: '8px' } },
                    React.createElement('button', { className: 'bs', style: { flex: 1 }, onClick: function() { setTela('lista'); setEditId(null); } }, '✕ Cancelar'),
                    React.createElement('button', { className: 'bp', style: { flex: 1 }, onClick: saveEdit }, '💾 Salvar')
                )
            )
        );
    }

    // ── Zoom de foto ───────────────────────────────────────────────────
    if (tela === 'zoom' && zoomSrc) {
        return React.createElement('div', {
            onClick: function() { setTela('lista'); setZoomSrc(null); },
            style: { position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,.96)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', cursor: 'zoom-out' }
        },
            React.createElement('img', {
                src: zoomSrc, loading: 'lazy',
                style: { maxWidth: '100%', maxHeight: '100%', borderRadius: '12px', objectFit: 'contain' },
                onClick: function(e) { e.stopPropagation(); }
            }),
            React.createElement('button', {
                onClick: function() { setTela('lista'); setZoomSrc(null); },
                style: { position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', borderRadius: '50%', width: 36, height: 36, fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }
            }, '✕')
        );
    }

    // ── Tela: lista ────────────────────────────────────────────────────
    var today2 = td();

    return React.createElement('div', { className: 'fg', style: { gap: '12px' } },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
            React.createElement('div', { className: 'sec-title' }, '⏳ Cápsula do Tempo'),
            React.createElement('button', { className: 'bp', style: { width: 'auto', padding: '7px 14px', fontSize: '.78rem' }, onClick: openAdd }, '⏳ Criar cápsula')
        ),

        caps.length === 0 ? React.createElement('div', { className: 'card', style: { padding: '40px 20px', textAlign: 'center' } },
            React.createElement('div', { style: { fontSize: '2.8rem', marginBottom: '10px' } }, '🔮'),
            React.createElement('div', { style: { color: 'var(--muted)', fontSize: '.82rem', lineHeight: 1.6 } },
                'Sem cápsulas ainda…', React.createElement('br'),
                React.createElement('span', { style: { fontSize: '.75rem' } }, 'Escrevam mensagens para o futuro!')
            )
        ) : null,

        caps.map(function(c) {
            var open   = new Date(c.openDate + 'T12:00:00');
            var locked = open > today2;
            var cdLabel = locked ? countdownLabel(c.openDate) : null;

            // barra de progresso
            var pct = 0;
            if (locked && c.created) {
                var created = new Date(c.created + 'T12:00:00').getTime();
                var total   = open.getTime() - created;
                var elapsed = Date.now() - created;
                pct = total > 0 ? Math.min(100, Math.max(0, Math.round(elapsed / total * 100))) : 0;
            }

            return React.createElement('div', {
                key: c.id,
                className: 'cap',
                style: {
                    borderColor: locked ? 'rgba(176,144,216,.25)' : 'rgba(142,196,160,.25)',
                    background:  locked ? 'linear-gradient(145deg,#1a1040,#0e0820)' : 'linear-gradient(145deg,#0e2018,#081408)'
                }
            },
                // Status / countdown
                React.createElement('div', { className: 'cap-date', style: { color: locked ? 'var(--purple)' : 'var(--sage)' } },
                    locked
                        ? cdLabel
                        : '🔓 Aberta — ' + open.toLocaleDateString('pt-BR')
                ),

                // Título
                React.createElement('div', { style: { fontWeight: 600, color: 'var(--cream)', fontSize: '.88rem', marginBottom: '6px' } }, c.title || 'Mensagem do Futuro'),

                // Barra de progresso (só quando trancada)
                locked ? React.createElement('div', { style: { marginBottom: '10px' } },
                    React.createElement('div', { style: { height: 3, borderRadius: 2, background: 'rgba(255,255,255,.08)', overflow: 'hidden' } },
                        React.createElement('div', { style: { height: '100%', width: pct + '%', background: 'linear-gradient(90deg,var(--purple),var(--rose))', borderRadius: 2, transition: 'width 1s ease' } })
                    ),
                    React.createElement('div', { style: { fontSize: '.55rem', color: 'var(--muted)', marginTop: '3px', textAlign: 'right' } }, pct + '% do tempo passou')
                ) : null,

                // Conteúdo trancado
                locked ? React.createElement('div', { className: 'cap-locked' },
                    '🔒 ',
                    React.createElement('span', null, 'Mensagem secreta até ' + open.toLocaleDateString('pt-BR'))
                ) : null,

                // Conteúdo aberto
                !locked ? React.createElement('div', { style: { animation: 'fu .6s ease both' } },
                    React.createElement('div', { style: { textAlign: 'center', marginBottom: '10px', padding: '8px', borderRadius: '10px', background: 'linear-gradient(135deg,rgba(142,196,160,.12),rgba(134,187,134,.06))', border: '1px solid rgba(142,196,160,.2)' } },
                        React.createElement('div', { style: { fontSize: '1.6rem', marginBottom: '4px' } }, '🔓✨'),
                        React.createElement('div', { style: { fontSize: '.72rem', fontWeight: 800, color: 'var(--sage)' } }, 'CÁPSULA ABERTA!'),
                        React.createElement('div', { style: { fontSize: '.6rem', color: 'var(--muted)', marginTop: '2px' } }, 'Aberta em ' + open.toLocaleDateString('pt-BR'))
                    ),
                    c.photo ? React.createElement('img', {
                        loading: 'lazy', decoding: 'async', src: c.photo,
                        style: { width: '100%', borderRadius: '10px', maxHeight: 150, objectFit: 'cover', marginBottom: '10px', cursor: 'zoom-in', display: 'block' },
                        onClick: function() { setZoomSrc(c.photo); setTela('zoom'); }
                    }) : null,
                    React.createElement('div', { className: 'cap-preview' }, '"' + c.msg + '"'),
                    React.createElement('button', {
                        className: 'bs',
                        style: { width: '100%', marginTop: '10px', fontSize: '.72rem' },
                        onClick: function() {
                            var txt = '🔓 Cápsula do Tempo aberta!\n\n"' + c.msg + '"\n\n— nós dois, ' + open.toLocaleDateString('pt-BR') + ' ♥';
                            if (navigator.share) {
                                navigator.share({ title: 'Cápsula do Tempo', text: txt }).catch(function() {});
                            } else if (navigator.clipboard) {
                                navigator.clipboard.writeText(txt).then(function() { toast('Copiado! 📋'); });
                            }
                        }
                    }, '📤 Compartilhar mensagem')
                ) : null,

                // Rodapé: quem + ações
                React.createElement('div', { style: { marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
                    React.createElement(WB, { who: c.who || 'ambos' }),
                    React.createElement('div', { style: { display: 'flex', gap: '4px' } },
                        locked ? React.createElement('button', {
                            className: 'bico',
                            style: { fontSize: '.75rem', opacity: .65 },
                            onClick: function() { setEMsg(c.msg); setEditId(c.id); setTela('edit'); vib(14); }
                        }, '✏️') : null,
                        React.createElement('button', {
                            className: 'bico',
                            style: { fontSize: '.8rem' },
                            onClick: function() { delCap(c.id); }
                        }, '✕')
                    )
                )
            );
        })
    );
}
function Desafio() {
    var _idx  = useState(function() { return Math.floor(Math.random() * DESAFIOS.length); });
    var idx    = _idx[0];  var setIdx  = _idx[1];
    var _done = useState(false);  var done    = _done[0]; var setDone = _done[1];
    var _tela = useState('main'); var tela    = _tela[0]; var setTela = _tela[1];
    var _newT = useState('');     var newTxt  = _newT[0]; var setNewTxt = _newT[1];
    var _anim = useState(0);      var animKey = _anim[0]; var setAnimKey = _anim[1];

    var histR = useList('desafios_hist');
    var hist  = useMemo(function() {
        if (!histR) return [];
        return Object.entries(histR)
            .map(function(e2) { return Object.assign({ id: e2[0] }, e2[1]); })
            .sort(function(a, b) { return b.ts - a.ts; });
    }, [histR]);

    var customR   = useVal('desafios_custom', null);
    var customArr = useMemo(function() {
        if (!customR) return [];
        return Object.entries(customR).map(function(e2) { return Object.assign({ id: e2[0] }, e2[1]); });
    }, [customR]);

    var pool    = customArr.length > 0 ? DESAFIOS.concat(customArr) : DESAFIOS;
    var desafio = pool[idx % pool.length] || pool[0];

    function sortear() {
        var ni = Math.floor(Math.random() * pool.length);
        setIdx(ni);
        setDone(false);
        setAnimKey(function(k) { return k + 1; });
        vib(30);
    }

    function aceitar() {
        if (done) return;
        setDone(true);
        vib(40);
        try { fbp('desafios_hist', { e: desafio.e, t: desafio.t, tag: desafio.tag || 'Desafio', ts: Date.now() }); } catch(e) {}
        toast('Desafio aceito! 💪');
    }

    function addCustom() {
        var t = newTxt.trim();
        if (!t) return;
        try { fbp('desafios_custom', { e: '✨', t: t, tag: 'Pessoal' }); } catch(e) {}
        setNewTxt('');
        toast('Desafio adicionado! ✨');
        vib(20);
    }

    function delCustom(id) {
        try { fbr('desafios_custom/' + id); } catch(e) {}
        vib(20);
        toast('Removido');
    }

    // ── Tela: Histórico
    if (tela === 'hist') {
        return React.createElement(React.Fragment, null,
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' } },
                React.createElement('button', { onClick: function() { setTela('main'); }, style: { background: 'none', border: 'none', color: 'var(--rose)', fontSize: '1rem', cursor: 'pointer', padding: '4px 0' } }, '← Voltar'),
                React.createElement('div', { className: 'sec-title', style: { flex: 1 } }, '📋 Histórico')
            ),
            React.createElement('div', { className: 'card', style: { padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '0' } },
                hist.length === 0
                    ? React.createElement('div', { style: { textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: '.78rem' } },
                        React.createElement('div', { style: { fontSize: '2rem', marginBottom: '8px' } }, '🎯'),
                        'Nenhum desafio aceito ainda!')
                    : hist.map(function(h, i) {
                        return React.createElement('div', { key: h.id, style: { display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 0', borderBottom: i < hist.length - 1 ? '1px solid var(--b1)' : 'none' } },
                            React.createElement('div', { style: { fontSize: '1.4rem', flexShrink: 0 } }, h.e || '🎯'),
                            React.createElement('div', { style: { flex: 1 } },
                                React.createElement('div', { style: { fontSize: '.75rem', color: 'var(--cream)', fontWeight: 600, lineHeight: 1.4 } }, h.t),
                                React.createElement('div', { style: { display: 'flex', gap: '6px', marginTop: '4px', alignItems: 'center' } },
                                    h.tag ? React.createElement('span', { style: { fontSize: '.55rem', color: 'var(--purple)', background: 'rgba(176,144,216,.12)', borderRadius: '4px', padding: '1px 6px', fontWeight: 700 } }, h.tag) : null,
                                    React.createElement('span', { style: { fontSize: '.55rem', color: 'var(--muted)' } }, new Date(h.ts).toLocaleDateString('pt-BR'))
                                )
                            ),
                            React.createElement('span', { style: { fontSize: '.9rem', color: 'var(--sage)' } }, '✓')
                        );
                    })
            )
        );
    }

    // ── Tela: Adicionar desafio personalizado
    if (tela === 'add') {
        return React.createElement(React.Fragment, null,
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' } },
                React.createElement('button', { onClick: function() { setTela('main'); }, style: { background: 'none', border: 'none', color: 'var(--rose)', fontSize: '1rem', cursor: 'pointer', padding: '4px 0' } }, '← Voltar'),
                React.createElement('div', { className: 'sec-title', style: { flex: 1 } }, '✨ Nossos Desafios')
            ),
            React.createElement('div', { className: 'card fg' },
                React.createElement('textarea', { className: 'memo', placeholder: 'Escreva um desafio especial para vocês dois...', value: newTxt, onChange: function(e) { setNewTxt(e.target.value); }, style: { minHeight: '70px', resize: 'none' } }),
                React.createElement('button', { className: 'bp', onClick: addCustom }, '✨ Adicionar desafio')
            ),
            customArr.length > 0 ? React.createElement('div', { className: 'card', style: { padding: '12px 14px' } },
                React.createElement('div', { style: { fontSize: '.65rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.06em' } }, 'Personalizados (' + customArr.length + ')'),
                React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
                    customArr.map(function(c) {
                        return React.createElement('div', { key: c.id, style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: 'rgba(255,255,255,.04)', borderRadius: '9px' } },
                            React.createElement('span', { style: { flex: 1, fontSize: '.75rem', color: 'var(--text)', lineHeight: 1.4 } }, c.t),
                            React.createElement('button', { onClick: function() { delCustom(c.id); }, style: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: '1rem', cursor: 'pointer', padding: '4px', borderRadius: '6px', flexShrink: 0 } }, '✕')
                        );
                    })
                )
            ) : null
        );
    }

    // ── Tela principal
    return React.createElement(React.Fragment, null,
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
            React.createElement('div', { className: 'sec-title' }, '🎯 Desafio do Casal'),
            React.createElement('button', { onClick: function() { setTela('hist'); }, style: { background: 'transparent', border: '1px solid var(--b2)', borderRadius: '10px', padding: '4px 10px', fontSize: '.63rem', color: 'var(--muted)', cursor: 'pointer', fontWeight: 700 } }, '📋 ' + hist.length + ' feitos')
        ),
        React.createElement('div', { key: animKey, className: 'desafio-card', style: { animation: 'fu .25s ease both' } },
            React.createElement('div', { className: 'desafio-ico' }, desafio.e),
            React.createElement('div', { className: 'tag-pill', style: { marginBottom: '12px' } }, desafio.tag || 'Desafio'),
            React.createElement('div', { className: 'desafio-txt' }, desafio.t),
            !done
                ? React.createElement('button', { className: 'bp', style: { marginTop: '6px' }, onClick: aceitar }, '✅ Aceitar Desafio')
                : React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--sage)', fontWeight: 700, fontSize: '.9rem', padding: '10px 0' } },
                    React.createElement('span', null, '🎉'),
                    'Desafio aceito! Boa sorte!'
                )
        ),
        React.createElement('button', { className: 'bs', onClick: sortear }, '🎲 Sortear outro desafio'),
        React.createElement('button', { className: 'bs', style: { fontSize: '.72rem', opacity: .75 }, onClick: function() { setTela('add'); } }, '✏️ Adicionar nossos desafios')
    );
}
/* ═══════════════════════════════════════════
   🗣️ QUEM DISSE ISSO?
═══════════════════════════════════════════ */
/* ═══════════════════════════════════════════
   🎯 METAS DO CASAL
═══════════════════════════════════════════ */
function Metas() {
    var s   = _getS();
    var nV  = s.myName      || 'Pessoa 1';
    var nN  = s.partnerName || 'Pessoa 2';

    var metasR = useList('metas_casal');
    var metas  = useMemo(function() {
        if (!metasR) return [];
        return Object.entries(metasR)
            .map(function(e2) { return Object.assign({ id: e2[0] }, e2[1]); })
            .sort(function(a, b) { return (a.ts || 0) - (b.ts || 0); });
    }, [metasR]);

    // tela: 'lista' | 'form'
    var _tela   = useState('lista'); var tela    = _tela[0];   var setTela   = _tela[1];
    var _editId = useState(null);    var editId  = _editId[0]; var setEditId = _editId[1];

    // form state
    var _fTitulo = useState('');    var fTitulo = _fTitulo[0]; var setFTitulo = _fTitulo[1];
    var _fDesc   = useState('');    var fDesc   = _fDesc[0];   var setFDesc   = _fDesc[1];
    var _fCat    = useState('outro'); var fCat  = _fCat[0];    var setFCat    = _fCat[1];
    var _fPrazo  = useState('');    var fPrazo  = _fPrazo[0];  var setFPrazo  = _fPrazo[1];

    var META_CATS = [
        { k: 'viagem',  e: '✈️',  l: 'Viagem'   },
        { k: 'finance', e: '💰',  l: 'Finanças'  },
        { k: 'saude',   e: '💪',  l: 'Saúde'     },
        { k: 'casa',    e: '🏠',  l: 'Casa'      },
        { k: 'romance', e: '💕',  l: 'Romance'   },
        { k: 'outro',   e: '🎯',  l: 'Outro'     }
    ];

    function getCatEmoji(k) {
        for (var i = 0; i < META_CATS.length; i++) {
            if (META_CATS[i].k === k) return META_CATS[i].e;
        }
        return '🎯';
    }

    function openAdd() {
        setEditId(null);
        setFTitulo(''); setFDesc(''); setFCat('outro'); setFPrazo('');
        setTela('form');
    }

    function openEdit(m) {
        setEditId(m.id);
        setFTitulo(m.titulo || '');
        setFDesc(m.desc    || '');
        setFCat(m.cat      || 'outro');
        setFPrazo(m.prazo  || '');
        setTela('form');
    }

    function cancelForm() { setTela('lista'); setEditId(null); }

    function saveMeta() {
        if (!fTitulo.trim()) { toast('Digite o título da meta! 🎯'); return; }
        vib(24);
        var editMeta = null;
        metas.forEach(function(m) { if (m.id === editId) editMeta = m; });
        var d = {
            titulo:   fTitulo.trim(),
            desc:     fDesc.trim(),
            prazo:    fPrazo || '',
            cat:      fCat,
            progress: editMeta ? (editMeta.progress || 0) : 0,
            ts:       editMeta ? (editMeta.ts || Date.now()) : Date.now()
        };
        if (editId) {
            try { fbu('metas_casal/' + editId, d); } catch(ex) {}
            toast('Meta atualizada! ✏️');
        } else {
            try { fbp('metas_casal', d); } catch(ex) {}
            toast('Meta criada! 🎯');
        }
        setTela('lista');
        setEditId(null);
    }

    function setProgress(id, val) {
        try { fbu('metas_casal/' + id, { progress: val }); } catch(ex) {}
        vib(20);
        if (val >= 100) toast('Meta conquistada! 🏆');
    }

    function delMeta(id) {
        try { fbr('metas_casal/' + id); } catch(ex) {}
        vib(20);
        toast('Meta removida');
    }

    var active = metas.filter(function(m) { return (m.progress || 0) < 100; });
    var done   = metas.filter(function(m) { return (m.progress || 0) >= 100; });

    // ── Tela: formulário ─────────────────────────────────────────────
    if (tela === 'form') {
        return React.createElement('div', { className: 'fg', style: { gap: '12px' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                React.createElement('button', { onClick: cancelForm, style: { background: 'none', border: 'none', color: 'var(--rose)', fontSize: '1rem', cursor: 'pointer', padding: '4px 0', flexShrink: 0 } }, '← Voltar'),
                React.createElement('div', { className: 'sec-title', style: { flex: 1 } }, editId ? '✏️ Editar Meta' : '🎯 Nova Meta')
            ),
            React.createElement('div', { className: 'card fg', style: { gap: '11px' } },
                // Título
                React.createElement('input', {
                    className: 'f',
                    placeholder: 'Título da meta… (ex: Viagem para o NE)',
                    value: fTitulo,
                    onChange: function(e) { setFTitulo(e.target.value); },
                    autoFocus: true
                }),
                // Descrição
                React.createElement('input', {
                    className: 'f',
                    placeholder: 'Descrição (opcional)…',
                    value: fDesc,
                    onChange: function(e) { setFDesc(e.target.value); }
                }),
                // Categoria
                React.createElement('div', { style: { fontSize: '.68rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '2px' } }, 'Categoria:'),
                React.createElement('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
                    META_CATS.map(function(c) {
                        var sel = fCat === c.k;
                        return React.createElement('button', {
                            key: c.k,
                            onClick: function() { setFCat(c.k); },
                            style: {
                                padding: '6px 10px', borderRadius: '10px', border: '1.5px solid',
                                borderColor: sel ? 'var(--rose)' : 'var(--b2)',
                                background:  sel ? 'rgba(232,131,106,.14)' : 'transparent',
                                color:       sel ? 'var(--rose3)' : 'var(--muted)',
                                fontSize: '.68rem', fontWeight: 700, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '4px'
                            }
                        }, c.e + ' ' + c.l);
                    })
                ),
                // Prazo
                React.createElement('div', { style: { fontSize: '.68rem', color: 'var(--muted)', fontWeight: 700 } }, '📅 Prazo (opcional):'),
                React.createElement(DateBR, { value: fPrazo, onChange: setFPrazo }),
                // Ações
                React.createElement('div', { style: { display: 'flex', gap: '8px', marginTop: '4px' } },
                    React.createElement('button', { className: 'bs', style: { flex: 1 }, onClick: cancelForm }, '✕ Cancelar'),
                    React.createElement('button', { className: 'bp', style: { flex: 1 }, onClick: saveMeta }, '🎯 Salvar')
                )
            )
        );
    }

    // ── Tela: lista ───────────────────────────────────────────────────
    return React.createElement('div', { className: 'fg', style: { gap: '12px' } },
        // Cabeçalho
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
            React.createElement('div', { className: 'sec-title' }, '🏆 Metas do Casal'),
            React.createElement('button', { className: 'bp', style: { width: 'auto', padding: '7px 14px', fontSize: '.78rem' }, onClick: openAdd }, '+ Meta')
        ),

        // Vazio
        metas.length === 0 ? React.createElement('div', { className: 'card', style: { padding: '40px 20px', textAlign: 'center' } },
            React.createElement('div', { style: { fontSize: '2.8rem', marginBottom: '10px' } }, '🏆'),
            React.createElement('div', { style: { color: 'var(--muted)', fontSize: '.82rem', lineHeight: 1.6 } },
                'Nenhuma meta ainda…', React.createElement('br'),
                React.createElement('span', { style: { fontSize: '.75rem' } }, 'Criem juntos os objetivos de vocês!')
            )
        ) : null,

        // Em andamento
        active.length > 0 ? React.createElement('div', null,
            React.createElement('div', { style: { fontSize: '.7rem', color: 'var(--muted)', fontWeight: 700, padding: '2px 2px 8px' } },
                '🚀 Em andamento (' + active.length + ')'
            ),
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
                active.map(function(m) {
                    var pct    = m.progress || 0;
                    var catE   = getCatEmoji(m.cat);
                    var prazoStr = m.prazo ? new Date(m.prazo + 'T00:00').toLocaleDateString('pt-BR') : '';
                    var STEPS  = [0, 25, 50, 75, 100];

                    return React.createElement('div', {
                        key: m.id,
                        className: 'card',
                        style: { padding: '13px 14px', margin: 0 }
                    },
                        // Linha título + ações
                        React.createElement('div', { style: { display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' } },
                            React.createElement('div', { style: { fontSize: '1.3rem', flexShrink: 0, lineHeight: 1 } }, catE),
                            React.createElement('div', { style: { flex: 1, minWidth: 0 } },
                                React.createElement('div', { style: { fontSize: '.8rem', fontWeight: 700, color: 'var(--cream)', lineHeight: 1.3 } }, m.titulo),
                                m.desc ? React.createElement('div', { style: { fontSize: '.63rem', color: 'var(--muted)', marginTop: '2px' } }, m.desc) : null,
                                prazoStr ? React.createElement('div', { style: { fontSize: '.6rem', color: 'var(--gold)', marginTop: '2px', fontWeight: 700 } }, '📅 até ' + prazoStr) : null
                            ),
                            React.createElement('div', { style: { display: 'flex', gap: '4px', flexShrink: 0 } },
                                React.createElement('button', {
                                    onClick: function() { openEdit(m); },
                                    style: { background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '.78rem', padding: '2px 4px', borderRadius: '6px' }
                                }, '✏️'),
                                React.createElement('button', {
                                    onClick: function() { delMeta(m.id); },
                                    style: { background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '.78rem', padding: '2px 4px', borderRadius: '6px', opacity: .6 }
                                }, '🗑️')
                            )
                        ),
                        // Barra de progresso
                        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } },
                            React.createElement('div', { style: { flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,.08)', overflow: 'hidden' } },
                                React.createElement('div', { style: { height: '100%', width: pct + '%', background: 'linear-gradient(90deg,var(--rose),var(--gold))', borderRadius: 4, transition: 'width .4s ease' } })
                            ),
                            React.createElement('span', { style: { fontSize: '.65rem', fontWeight: 700, color: 'var(--gold)', minWidth: 28, textAlign: 'right' } }, pct + '%')
                        ),
                        // Botões de progresso
                        React.createElement('div', { style: { display: 'flex', gap: '5px' } },
                            STEPS.map(function(v) {
                                var ativo = pct >= v;
                                return React.createElement('button', {
                                    key: v,
                                    onClick: function() { setProgress(m.id, v); },
                                    style: {
                                        flex: 1, padding: '4px 0', borderRadius: '8px', border: '1.5px solid',
                                        borderColor: ativo ? 'var(--rose)' : 'var(--b2)',
                                        background:  ativo ? 'rgba(232,131,106,.14)' : 'transparent',
                                        color:       ativo ? 'var(--rose3)' : 'var(--muted)',
                                        fontSize: '.6rem', fontWeight: 700, cursor: 'pointer'
                                    }
                                }, v === 100 ? '🏆' : v + '%');
                            })
                        )
                    );
                })
            )
        ) : null,

        // Conquistadas
        done.length > 0 ? React.createElement('div', null,
            React.createElement('div', { style: { fontSize: '.7rem', color: 'var(--sage)', fontWeight: 700, padding: '2px 2px 8px' } },
                '✅ Conquistadas (' + done.length + ')'
            ),
            React.createElement('div', { className: 'card', style: { padding: '4px 0' } },
                done.map(function(m, idx) {
                    var catE  = getCatEmoji(m.cat);
                    var isLast = idx === done.length - 1;
                    return React.createElement('div', {
                        key: m.id,
                        style: {
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 14px', opacity: .6,
                            borderBottom: isLast ? 'none' : '1px solid var(--b1)'
                        }
                    },
                        React.createElement('span', { style: { fontSize: '1rem', flexShrink: 0 } }, catE),
                        React.createElement('div', { style: { flex: 1, fontSize: '.74rem', color: 'var(--muted)', textDecoration: 'line-through' } }, m.titulo),
                        React.createElement('span', { style: { fontSize: '.75rem', color: 'var(--sage)', flexShrink: 0 } }, '✓'),
                        React.createElement('button', {
                            onClick: function() { delMeta(m.id); },
                            style: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: '.75rem', cursor: 'pointer', padding: '2px 4px', flexShrink: 0, opacity: .5 }
                        }, '✕')
                    );
                })
            )
        ) : null,

        // Contador
        metas.length > 0 ? React.createElement('div', { style: { textAlign: 'center', fontSize: '.62rem', color: 'var(--muted)', paddingBottom: '4px' } },
            active.length + ' em andamento · ' + done.length + ' conquistada' + (done.length !== 1 ? 's' : '') + ' 💕'
        ) : null
    );
}
/* ═══════════════════════════════════════════
   🏛️ BANCO DOS RÉUS
═══════════════════════════════════════════ */
function Roleta() {
    var DEFAULTS = ['Pizza', 'Sushi', 'Churrasco', 'Hambúrguer', 'Japonês', 'Italiano'];
    var PRESETS = {
        comida:    ['Pizza', 'Sushi', 'Churrasco', 'Hambúrguer', 'Japonês', 'Italiano', 'Mexicano', 'Árabe'],
        atividade: ['Cinema', 'Caminhada', 'Jogo em casa', 'Sorvete', 'Parque', 'Passeio de carro', 'Museu', 'Piquenique'],
        date:      ['Jantar surpresa', 'Filmes em casa', 'Cozinhar juntos', 'Spa em casa', 'Piquenique', 'Karaokê', 'Boliche', 'Algo novo'],
    };
    var COLORS = ['#e8836a','#c06840','#d4a853','#7eb886','#7ab4cc','#b090d8','#e06090','#60b0d4'];

    var savedOpts = useVal('roleta_opts', null);
    var histR     = useList('roleta_hist');
    var roletaAtual = useVal('roleta_atual', null);

    var opts = Array.isArray(savedOpts) && savedOpts.length >= 2 ? savedOpts : DEFAULTS;
    var hist = useMemo(function() {
        if (!histR) return [];
        return Object.entries(histR).map(function(e2) { return Object.assign({id:e2[0]}, e2[1]); })
            .sort(function(a,b){ return (b.ts||0)-(a.ts||0); }).slice(0,20);
    }, [histR]);

    // Contagem de vezes que cada opção saiu
    var contagem = useMemo(function() {
        if (!histR) return {};
        var cnt = {};
        Object.values(histR).forEach(function(h) {
            if (h.item) cnt[h.item] = (cnt[h.item] || 0) + 1;
        });
        return cnt;
    }, [histR]);

    var _s = useState(0);    var angle  = _s[0]; var setAngle  = _s[1];
    var _p = useState(false);var spin   = _p[0]; var setSpin   = _p[1];
    var _r = useState('');   var result = _r[0]; var setResult = _r[1];
    var _n = useState('');   var newOpt = _n[0]; var setNewOpt = _n[1];
    var _t = useState('main');var tela  = _t[0]; var setTela   = _t[1];

    var timerRef = useRef(null);

    function saveOpts(v) { try { fbs('roleta_opts', v); } catch(e){} }

    function girar() {
        if (spin) return;
        if (opts.length < 2) { toast('Adicione pelo menos 2 opções! 😊'); return; }
        if (timerRef.current) clearTimeout(timerRef.current);
        setSpin(true);
        setResult('');
        vib(30);

        var chosen = Math.floor(Math.random() * opts.length);
        var item   = opts[chosen];

        // Ponteiro está no topo (12h). Cada fatia tem 360/n graus.
        // Para que a fatia `chosen` pare no topo, rotacionamos o disco de forma que
        // o centro da fatia chosen fique a 0° (topo), mais várias voltas inteiras.
        var sliceAngle  = 360 / opts.length;
        var centerOfChosen = chosen * sliceAngle + sliceAngle / 2; // ângulo do centro da fatia a partir das 12h
        // queremos que o disco gire para que centerOfChosen fique no topo
        // acrescentamos 5-8 voltas completas para efeito visual
        var extraSpins  = (5 + Math.floor(Math.random() * 4)) * 360;
        var delta       = extraSpins + (360 - (angle % 360) % 360) + (360 - centerOfChosen);
        // simplify: just set a large absolute angle that lands on chosen
        var currentNorm = ((angle % 360) + 360) % 360;
        var needed      = (360 - centerOfChosen - currentNorm + 360) % 360;
        if (needed === 0) needed = 360;
        var totalDelta  = extraSpins + needed;

        setAngle(function(a){ return a + totalDelta; });

        timerRef.current = setTimeout(function() {
            setSpin(false);
            setResult(item);
            vib([40, 20, 40, 20, 80]);
            toast('🎉 ' + item + ' venceu!');
            try { fbp('roleta_hist', { item: item, ts: Date.now(), date: dk(new Date()) }); } catch(e){}
            try { fbs('roleta_atual', { item: item, ts: Date.now() }); } catch(e){}
        }, 3400);
    }

    function addOpt() {
        var t = newOpt.trim();
        if (!t) return;
        if (opts.indexOf(t) !== -1) { toast('Já existe!'); return; }
        saveOpts(opts.concat([t]));
        setNewOpt('');
        vib(15);
    }

    function rmOpt(idx2) {
        if (spin) return;
        var next = opts.filter(function(_,i){ return i !== idx2; });
        if (next.length < 2) { toast('Precisa de pelo menos 2 opções!'); return; }
        saveOpts(next);
        setResult('');
    }

    function applyPreset(key) {
        saveOpts(PRESETS[key]);
        setResult('');
        vib(15);
    }

    function limparHist() {
        if (!histR) return;
        Object.keys(histR).forEach(function(id){ try{ fbr('roleta_hist/'+id); }catch(e){} });
        toast('Histórico limpo');
    }

    // ── SVG Wheel ──
    var n  = opts.length;
    var CX = 120, CY = 120, R = 108;

    function slicePath(i) {
        if (n === 1) return 'M'+CX+','+CY+' m-'+R+',0 a'+R+','+R+',0,1,1,'+(R*2)+',0 a'+R+','+R+',0,1,1,-'+(R*2)+',0';
        var a1 = (i / n) * 2 * Math.PI - Math.PI / 2;
        var a2 = ((i+1) / n) * 2 * Math.PI - Math.PI / 2;
        var x1 = CX + R * Math.cos(a1), y1 = CY + R * Math.sin(a1);
        var x2 = CX + R * Math.cos(a2), y2 = CY + R * Math.sin(a2);
        var large = (1/n) > 0.5 ? 1 : 0;
        return 'M'+CX+','+CY+' L'+x1+','+y1+' A'+R+','+R+',0,'+large+',1,'+x2+','+y2+' Z';
    }

    function labelPos(i) {
        var a = (i + 0.5) / n * 2 * Math.PI - Math.PI / 2;
        var dist = n <= 4 ? R * 0.6 : R * 0.68;
        return { x: CX + dist * Math.cos(a), y: CY + dist * Math.sin(a), rot: (i + 0.5) / n * 360 };
    }

    var maxLabelLen = n <= 4 ? 9 : n <= 6 ? 8 : 7;
    var fontSize    = n <= 4 ? 11 : n <= 6 ? 9.5 : n <= 8 ? 8.5 : 7.5;

    // ── Tela histórico ──
    if (tela === 'hist') {
        return React.createElement(React.Fragment, null,
            React.createElement('div', { style: { display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' } },
                React.createElement('button', { onClick: function(){ setTela('main'); }, style: { background:'none', border:'none', color:'var(--rose)', fontSize:'1rem', cursor:'pointer', padding:'4px 0' } }, '← Voltar'),
                React.createElement('div', { className:'sec-title', style:{ flex:1 } }, '📜 Histórico da Roleta')
            ),
            React.createElement('div', { className:'card', style:{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:'0' } },
                hist.length === 0
                    ? React.createElement('div', { style:{ textAlign:'center', padding:'24px 0', color:'var(--muted)', fontSize:'.78rem' } },
                        React.createElement('div', { style:{ fontSize:'2rem', marginBottom:'8px' } }, '🎡'),
                        'Nenhum sorteio ainda!'
                      )
                    : hist.map(function(h, i) {
                        return React.createElement('div', { key: h.id, style:{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 0', borderBottom: i < hist.length-1 ? '1px solid var(--b1)' : 'none' } },
                            React.createElement('div', { style:{ fontSize:'1.2rem', flexShrink:0 } }, i === 0 ? '🥇' : '🎡'),
                            React.createElement('div', { style:{ flex:1, fontSize:'.78rem', color: i === 0 ? 'var(--rose)' : 'var(--cream)', fontWeight: i === 0 ? 700 : 500 } }, h.item || '—'),
                            React.createElement('div', { style:{ fontSize:'.58rem', color:'var(--muted)' } }, h.date || '')
                        );
                      })
            ),
            // Ranking
            Object.keys(contagem).length > 0 ? React.createElement('div', { style:{ marginBottom:'12px', padding:'10px 12px', background:'rgba(255,255,255,.03)', borderRadius:'10px', border:'1px solid var(--b1)' } },
                React.createElement('div', { style:{ fontSize:'.65rem', fontWeight:700, color:'var(--muted)', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'.05em' } }, '🏆 Mais sorteadas'),
                Object.entries(contagem).sort(function(a,b){return b[1]-a[1];}).slice(0,5).map(function(entry, ri) {
                    var colors2 = ['var(--gold)','var(--cream)','var(--muted)','var(--muted)','var(--muted)'];
                    var medals  = ['🥇','🥈','🥉','4.','5.'];
                    return React.createElement('div', { key: entry[0], style:{ display:'flex', alignItems:'center', gap:'8px', padding:'4px 0', borderBottom: ri < 4 ? '1px solid rgba(255,255,255,.04)' : 'none' } },
                        React.createElement('span', { style:{ fontSize:'.8rem', flexShrink:0 } }, medals[ri]),
                        React.createElement('span', { style:{ flex:1, fontSize:'.72rem', color:'var(--cream)' } }, entry[0]),
                        React.createElement('span', { style:{ fontSize:'.68rem', fontWeight:700, color: colors2[ri] } }, entry[1] + 'x')
                    );
                })
            ) : null,
            hist.length > 0 ? React.createElement('button', { className:'bs', style:{ fontSize:'.7rem', opacity:.6 }, onClick: limparHist }, '🗑️ Limpar histórico') : null
        );
    }

    // ── Tela principal ──
    return React.createElement(React.Fragment, null,
        React.createElement('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center' } },
            React.createElement('div', { className:'sec-title' }, '🎡 Roleta de Decisão'),
            React.createElement('button', { onClick: function(){ setTela('hist'); }, style:{ background:'transparent', border:'1px solid var(--b2)', borderRadius:'10px', padding:'4px 10px', fontSize:'.63rem', color:'var(--muted)', cursor:'pointer', fontWeight:700 } },
                '📜 ' + hist.length + (hist.length === 1 ? ' sorteio' : ' sorteios')
            )
        ),

        // Roda + resultado + botão
        React.createElement('div', { className:'card', style:{ display:'flex', flexDirection:'column', alignItems:'center', gap:'12px', padding:'16px 14px' } },
            React.createElement('div', { style:{ position:'relative', width:'240px', height:'240px' } },
                React.createElement('svg', { viewBox:'0 0 240 240', width:'240', height:'240', style:{ overflow:'visible', display:'block' } },
                    // Sombra da roda
                    React.createElement('circle', { cx:CX, cy:CY, r:R+4, fill:'rgba(0,0,0,.25)' }),
                    // Grupo giratório
                    React.createElement('g', {
                        style:{
                            transform: 'rotate('+angle+'deg)',
                            transformOrigin: CX+'px '+CY+'px',
                            transition: spin ? 'transform 3.4s cubic-bezier(.15,.65,.1,1)' : 'none'
                        }
                    },
                        opts.map(function(o, i) {
                            var lp = labelPos(i);
                            var label = o.length > maxLabelLen ? o.slice(0, maxLabelLen-1)+'…' : o;
                            return React.createElement('g', { key: i },
                                React.createElement('path', { d: slicePath(i), fill: COLORS[i % COLORS.length], stroke:'rgba(0,0,0,.35)', strokeWidth:'1.5' }),
                                React.createElement('text', {
                                    x: lp.x, y: lp.y,
                                    textAnchor:'middle', dominantBaseline:'middle',
                                    fontSize: fontSize, fill:'#fff', fontWeight:'800',
                                    fontFamily:'Nunito,sans-serif',
                                    transform:'rotate('+lp.rot+','+lp.x+','+lp.y+')',
                                    style:{ pointerEvents:'none', letterSpacing:'.01em' }
                                }, label)
                            );
                        }),
                        // Centro
                        React.createElement('circle', { cx:CX, cy:CY, r:16, fill:'var(--card)', stroke:'rgba(255,255,255,.12)', strokeWidth:'2' }),
                        React.createElement('text', { x:CX, y:CY, textAnchor:'middle', dominantBaseline:'middle', fontSize:'11' }, '🎡')
                    ),
                    // Aro externo
                    React.createElement('circle', { cx:CX, cy:CY, r:R, fill:'none', stroke:'rgba(255,255,255,.08)', strokeWidth:'2.5' }),
                    // Ponteiro (triângulo no topo)
                    React.createElement('polygon', {
                        points:(CX)+',4 '+(CX-9)+',22 '+(CX+9)+',22',
                        fill:'var(--rose)',
                        stroke:'var(--card)', strokeWidth:'2'
                    }),
                    React.createElement('circle', { cx:CX, cy:22, r:4, fill:'var(--rose)', stroke:'var(--card)', strokeWidth:'1.5' })
                )
            ),

            // Resultado (sincronizado via Firebase)
            (function() {
                var fbItem = roletaAtual && roletaAtual.item && (Date.now() - (roletaAtual.ts||0) < 300000) ? roletaAtual.item : null;
                var shown  = spin ? null : (result || fbItem);
                var isNew  = shown && shown === result && !spin;
                return shown
                    ? React.createElement('div', { style:{ fontFamily:"'Cormorant Garamond',serif", fontSize:'1.35rem', color:'var(--rose)', fontWeight:600, animation: isNew ? 'fu .3s ease' : 'none', textAlign:'center', lineHeight:1.3 } },
                        '🎉 ', shown, '!'
                      )
                    : React.createElement('div', { style:{ minHeight:'32px' } });
            })(),

            React.createElement('button', { className:'bp', onClick: girar, disabled: spin, style:{ width:'170px' } },
                spin ? '🎰 Girando…' : '🎲 Girar a roleta!'
            )
        ),

        // Opções
        React.createElement('div', { className:'card', style:{ padding:'12px 14px' } },
            // Título + presets
            React.createElement('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' } },
                React.createElement('div', { className:'ct', style:{ marginBottom:0 } }, 'Opções ('+n+')'),
                React.createElement('div', { style:{ display:'flex', gap:'4px' } },
                    [['comida','🍕'],['atividade','🎯'],['date','💑']].map(function(p) {
                        return React.createElement('button', { key:p[0], onClick: function(){ applyPreset(p[0]); }, style:{ padding:'3px 8px', borderRadius:'10px', border:'1.5px solid var(--b2)', background:'rgba(255,255,255,.04)', color:'var(--muted)', fontSize:'.6rem', fontWeight:700, cursor:'pointer' } }, p[1]);
                    })
                )
            ),
            // Tags das opções
            React.createElement('div', { className:'roleta-opts', style:{ marginBottom:'10px' } },
                opts.map(function(o, i) {
                    var cnt2 = contagem[o] || 0;
                    return React.createElement('div', { key: i, className:'roleta-tag', style:{ borderColor: COLORS[i%COLORS.length]+'55' } },
                        React.createElement('span', { style:{ width:'8px', height:'8px', borderRadius:'50%', background: COLORS[i%COLORS.length], flexShrink:0, display:'inline-block' } }),
                        o,
                        cnt2 > 0 ? React.createElement('span', { style:{ fontSize:'.55rem', fontWeight:700, color: COLORS[i%COLORS.length], background:'rgba(0,0,0,.2)', borderRadius:'8px', padding:'1px 5px', marginLeft:'2px' } }, cnt2 + 'x') : null,
                        React.createElement('button', { onClick: function(){ rmOpt(i); }, style:{ background:'none', border:'none', color:'var(--muted)', fontSize:'.78rem', cursor:'pointer', padding:'0 2px', lineHeight:1 } }, '✕')
                    );
                })
            ),
            // Input nova opção
            React.createElement('div', { className:'fr' },
                React.createElement('input', { className:'f', value: newOpt, onChange: function(e){ setNewOpt(e.target.value); }, placeholder:'Nova opção…', onKeyDown: function(e){ if(e.key==='Enter') addOpt(); } }),
                React.createElement('button', { className:'bp', style:{ width:'auto', padding:'0 16px', flexShrink:0 }, onClick: addOpt }, '+')
            )
        )
    );
}
/* ── MONITOR DE BANCO FIREBASE ──────────────────────────────────────── */
function BancoMonitor() {
    var _data    = useState(null);  var data    = _data[0];    var setData    = _data[1];
    var _loading = useState(false); var loading = _loading[0]; var setLoading = _loading[1];
    var _err     = useState('');    var err     = _err[0];     var setErr     = _err[1];
    var _stData  = useState(null);  var stData  = _stData[0];  var setStData  = _stData[1];
    var _stLoad  = useState(false); var stLoad  = _stLoad[0];  var setStLoad  = _stLoad[1];
    var _migLog  = useState([]);    var migLog  = _migLog[0];  var setMigLog  = _migLog[1];
    var _migRun  = useState(false); var migRun  = _migRun[0];  var setMigRun  = _migRun[1];
    var _migDone = useState(0);     var migDone = _migDone[0]; var setMigDone = _migDone[1];
    var _migTot  = useState(0);     var migTot  = _migTot[0];  var setMigTot  = _migTot[1];

    var COLECOES = [
        { path: 'gastos',          label: '💸 Gastos',       fotoField: null },
        { path: 'diario',          label: '📖 Diário',       fotoField: 'photo' },
        { path: 'galeria',         label: '📸 Galeria',      fotoField: 'url' },
        { path: 'marcos',          label: '🌟 Timeline',     fotoField: 'photo' },
        { path: 'capsulas',        label: '⏳ Cápsulas',     fotoField: null },
        { path: 'wishlist',        label: '✨ Wishlist',      fotoField: null },
        { path: 'bilhetes',        label: '💌 Bilhetes',     fotoField: null },
        { path: 'events',          label: '📅 Eventos',      fotoField: null },
        { path: 'compras',         label: '🛒 Compras',      fotoField: null },
        { path: 'dreams',          label: '💭 Sonhos',       fotoField: null },
        { path: 'goals',           label: '🏆 Metas',        fotoField: null },
        { path: 'pets',            label: '🐾 Pets',         fotoField: 'photo' },
        { path: 'settings',        label: '⚙️ Config',       fotoField: null },
        { path: 'presence',        label: '🟢 Presença',     fotoField: null },
        { path: 'reacts',          label: '💝 Reacts',       fotoField: null },
        { path: 'moods',           label: '😊 Humores',      fotoField: null },
        { path: 'desafios_hist',   label: '🎯 Desafios',     fotoField: null },
        { path: 'roleta_hist',     label: '🎡 Roleta',       fotoField: null },
        { path: 'metas_casal',     label: '🏆 Metas Casal',  fotoField: null },
    ];

    function calcSize(obj) {
        try { return JSON.stringify(obj).length; } catch(e) { return 0; }
    }

    function fmtBytes(n) {
        if (n < 1024)           return n + ' B';
        if (n < 1024 * 1024)    return (n / 1024).toFixed(1) + ' KB';
        return (n / (1024 * 1024)).toFixed(2) + ' MB';
    }

    function countFotos(obj, field) {
        if (!obj || !field) return 0;
        var count = 0;
        var vals = Object.values(obj);
        for (var i = 0; i < vals.length; i++) {
            var v = vals[i];
            if (v && v[field] && typeof v[field] === 'string' && v[field].indexOf('data:') === 0) count++;
        }
        return count;
    }

    function scanBanco() {
        setLoading(true);
        setErr('');
        setData(null);
        _waitFb(function() {
            var db      = window.__fb.db;
            var ref     = window.__fb.ref;
            var get     = window.__fb.get;
            var results = [];
            var pending = COLECOES.length;
            var totalBytes = 0;

            function oneDone(col, val) {
                var sz     = calcSize(val);
                var count  = val && typeof val === 'object' ? Object.keys(val).length : (val ? 1 : 0);
                var fotos  = countFotos(val, col.fotoField);
                var fotoSz = 0;
                if (col.fotoField && val && typeof val === 'object') {
                    var vals2 = Object.values(val);
                    for (var i = 0; i < vals2.length; i++) {
                        var v2 = vals2[i];
                        if (v2 && v2[col.fotoField] && typeof v2[col.fotoField] === 'string' && v2[col.fotoField].indexOf('data:') === 0) {
                            fotoSz += v2[col.fotoField].length;
                        }
                    }
                }
                totalBytes += sz;
                results.push({ label: col.label, sz: sz, count: count, fotos: fotos, fotoSz: fotoSz });
                pending--;
                if (pending === 0) {
                    results.sort(function(a, b) { return b.sz - a.sz; });
                    setData({ rows: results, total: totalBytes });
                    setLoading(false);
                }
            }

            COLECOES.forEach(function(col) {
                get(ref(db, col.path)).then(function(snap) {
                    oneDone(col, snap.val());
                }).catch(function() {
                    oneDone(col, null);
                });
            });
        });
    }

    var LIMITE_ST = 5 * 1024 * 1024 * 1024; // 5 GB Storage gratuito
    var LIMITE_FB = 1 * 1024 * 1024 * 1024; // 1 GB plano gratuito

    function scanStorage() {
        setStLoad(true);
        setStData(null);
        _waitFb(function() {
            try {
                var st = firebase.storage();
                var pastas = ['galeria', 'diario', 'eventos', 'perfil', 'pets'];
                var results = [];
                var pending = pastas.length;
                var totalBytes = 0;
                function pastaDone(pasta, bytes, count) {
                    totalBytes += bytes;
                    results.push({ pasta: pasta, bytes: bytes, count: count });
                    pending--;
                    if (pending === 0) {
                        results.sort(function(a,b){return b.bytes-a.bytes;});
                        setStData({ rows: results, total: totalBytes });
                        setStLoad(false);
                    }
                }
                pastas.forEach(function(pasta) {
                    st.ref(pasta).listAll().then(function(res) {
                        var items = res.items;
                        if (items.length === 0) { pastaDone(pasta, 0, 0); return; }
                        var total = 0;
                        var done2 = 0;
                        items.forEach(function(item) {
                            item.getMetadata().then(function(meta) {
                                total += meta.size || 0;
                                done2++;
                                if (done2 === items.length) pastaDone(pasta, total, items.length);
                            }).catch(function() {
                                done2++;
                                if (done2 === items.length) pastaDone(pasta, total, items.length);
                            });
                        });
                    }).catch(function() { pastaDone(pasta, 0, 0); });
                });
            } catch(e) { setStLoad(false); }
        });
    }

    function runMigration() {
        setMigRun(true);
        setMigLog([]);
        setMigDone(0);
        setMigTot(0);
        _waitFb(function() {
            try {
                var db3 = window.__fb && window.__fb.db;
                var st3 = firebase.storage();
                if (!db3 || !st3) { setMigRun(false); return; }
                // Paths that may contain base64 images
                var paths = ['galeria', 'diario', 'eventos', 'settings'];
                var found = [];
                var checked = 0;
                function checkPath(path) {
                    db3.ref(path).once('value').then(function(snap) {
                        var val = snap.val();
                        if (!val) { checkDone(); return; }
                        // Walk all entries looking for base64 strings
                        Object.entries(val).forEach(function(entry) {
                            var key = entry[0];
                            var item = entry[1];
                            if (typeof item === 'object' && item !== null) {
                                // Check url, photo, photoUser1, photoUser2 fields
                                ['url','photo','photoUser1','photoUser2','img'].forEach(function(field) {
                                    if (item[field] && typeof item[field] === 'string' && item[field].indexOf('data:image') === 0) {
                                        found.push({ path: path + '/' + key, field: field, data: item[field] });
                                    }
                                });
                            } else if (typeof item === 'string' && item.indexOf('data:image') === 0) {
                                found.push({ path: path + '/' + key, field: null, data: item });
                            }
                        });
                        // settings is a flat object — check directly
                        if (path === 'settings' && typeof val === 'object') {
                            ['photoUser1','photoUser2'].forEach(function(field) {
                                if (val[field] && val[field].indexOf('data:image') === 0) {
                                    found.push({ path: 'settings', field: field, data: val[field] });
                                }
                            });
                        }
                        checkDone();
                    }).catch(function() { checkDone(); });
                }
                function checkDone() {
                    checked++;
                    if (checked < paths.length) return;
                    // Remove settings duplicate entries
                    var seen = {};
                    found = found.filter(function(f) {
                        var k = f.path + '/' + (f.field||'');
                        if (seen[k]) return false;
                        seen[k] = true;
                        return true;
                    });
                    setMigTot(found.length);
                    if (found.length === 0) {
                        setMigLog(['Nenhuma foto em base64 encontrada no banco.']);
                        setMigRun(false);
                        return;
                    }
                    setMigLog(['Encontradas ' + found.length + ' fotos para migrar...']);
                    migrateNext(found, 0);
                }
                function migrateNext(items, idx) {
                    if (idx >= items.length) {
                        setMigLog(function(prev) { return prev.concat(['✅ Migração concluída!']); });
                        setMigRun(false);
                        return;
                    }
                    var item = items[idx];
                    var folder = item.path.split('/')[0];
                    var stPath = folder + '/migrated_' + Date.now() + '_' + idx + '.jpg';
                    fbUpload(stPath, item.data,
                        function(url) {
                            // Update Firebase with new URL
                            var upd = {};
                            if (item.field) {
                                upd[item.path.replace('/', '/') + '/' + item.field] = url;
                                db3.ref(item.path + '/' + item.field).set(url).then(function() {
                                    setMigDone(function(p) { return p + 1; });
                                    setMigLog(function(prev) { return prev.concat(['✅ ' + item.path + ' migrado']); });
                                    migrateNext(items, idx + 1);
                                }).catch(function() {
                                    setMigLog(function(prev) { return prev.concat(['❌ Erro em ' + item.path]); });
                                    migrateNext(items, idx + 1);
                                });
                            } else {
                                db3.ref(item.path + '/url').set(url).then(function() {
                                    setMigDone(function(p) { return p + 1; });
                                    setMigLog(function(prev) { return prev.concat(['✅ ' + item.path + ' migrado']); });
                                    migrateNext(items, idx + 1);
                                }).catch(function() {
                                    setMigLog(function(prev) { return prev.concat(['❌ Erro em ' + item.path]); });
                                    migrateNext(items, idx + 1);
                                });
                            }
                        },
                        function(err2) {
                            setMigLog(function(prev) { return prev.concat(['❌ Upload falhou: ' + item.path]); });
                            migrateNext(items, idx + 1);
                        }
                    );
                }
                paths.forEach(function(p) { checkPath(p); });
            } catch(e7) { setMigRun(false); }
        });
    }

    return React.createElement('div', { className: 'card' },
        React.createElement('div', { className: 'ct' }, '📊 Monitor do Banco'),

        // Botão escanear
        React.createElement('button', {
            className: loading ? 'bs' : 'bp',
            style: { marginBottom: '12px' },
            onClick: scanBanco,
            disabled: loading
        }, loading ? '⏳ Escaneando…' : data ? '🔄 Atualizar' : '🔍 Escanear banco'),

        err ? React.createElement('div', { style: { fontSize: '.72rem', color: 'var(--danger)', marginBottom: '8px' } }, err) : null,

        // Resultado
        data ? React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },

            // Total geral
            React.createElement('div', { style: { background: 'rgba(255,255,255,.04)', borderRadius: '10px', padding: '10px 12px', border: '1px solid var(--b2)' } },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' } },
                    React.createElement('span', { style: { fontSize: '.72rem', fontWeight: 700, color: 'var(--cream)' } }, 'Total estimado'),
                    React.createElement('span', { style: { fontFamily: "'Cormorant Garamond',serif", fontSize: '1rem', color: data.total > 50 * 1024 * 1024 ? 'var(--danger)' : 'var(--sage)' } }, fmtBytes(data.total))
                ),
                React.createElement('div', { style: { height: '5px', background: 'rgba(255,255,255,.06)', borderRadius: '3px', overflow: 'hidden' } },
                    React.createElement('div', { style: { height: '100%', borderRadius: '3px', width: Math.min(100, (data.total / LIMITE_FB) * 100) + '%', background: data.total > 50 * 1024 * 1024 ? 'var(--danger)' : 'var(--sage)', transition: 'width .6s' } })
                ),
                React.createElement('div', { style: { fontSize: '.58rem', color: 'var(--muted)', marginTop: '4px', textAlign: 'right' } }, fmtBytes(data.total) + ' de 1 GB (plano gratuito)')
            ),

            // Aviso fotos base64 se volumoso
            (function() {
                var totalFotoSz = 0;
                var rows = data.rows;
                for (var i = 0; i < rows.length; i++) { totalFotoSz += rows[i].fotoSz || 0; }
                if (totalFotoSz < 500 * 1024) return null;
                return React.createElement('div', { style: { background: 'rgba(212,168,83,.08)', border: '1px solid rgba(212,168,83,.3)', borderRadius: '10px', padding: '10px 12px' } },
                    React.createElement('div', { style: { fontSize: '.72rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '4px' } }, '⚠️ Atenção: Fotos em base64'),
                    React.createElement('div', { style: { fontSize: '.65rem', color: 'var(--muted)', lineHeight: 1.5 } },
                        fmtBytes(totalFotoSz) + ' de fotos armazenadas direto no banco. Isso consome cota rapidamente. Considere limpar fotos antigas ou compactar mais ao adicionar.'
                    )
                );
            })(),

            // Tabela por coleção
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '1px' } },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '4px 8px', fontSize: '.58rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' } },
                    React.createElement('span', null, 'Coleção'),
                    React.createElement('span', null, 'Itens'),
                    React.createElement('span', null, 'Tamanho')
                ),
                data.rows.map(function(r) {
                    var pct   = data.total > 0 ? (r.sz / data.total) * 100 : 0;
                    var isBig = r.fotoSz > 100 * 1024;
                    return React.createElement('div', {
                        key: r.label,
                        style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 8px', borderRadius: '7px', background: isBig ? 'rgba(212,168,83,.06)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,.03)' }
                    },
                        React.createElement('span', { style: { flex: 1, fontSize: '.7rem', color: 'var(--text)' } },
                            r.label,
                            isBig ? React.createElement('span', { style: { marginLeft: '4px', fontSize: '.55rem', color: 'var(--gold)', fontWeight: 700 } }, '📷 ' + fmtBytes(r.fotoSz)) : null
                        ),
                        React.createElement('span', { style: { fontSize: '.62rem', color: 'var(--muted)', minWidth: '28px', textAlign: 'right' } }, r.count > 0 ? r.count : '—'),
                        React.createElement('span', { style: { fontSize: '.65rem', color: pct > 15 ? 'var(--rose)' : 'var(--muted)', minWidth: '54px', textAlign: 'right', fontWeight: pct > 15 ? 700 : 400 } }, fmtBytes(r.sz))
                    );
                })
            )
        ) : null,

        !data && !loading ? React.createElement('div', { style: { fontSize: '.7rem', color: 'var(--muted)', lineHeight: 1.6 } },
            'Analisa quanto espaço cada coleção ocupa no Firebase. Útil para monitorar o crescimento de fotos base64 e evitar atingir o limite gratuito de 1 GB.'
        ) : null,

        React.createElement('div', { style: { marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--b1)' } },
            React.createElement('div', { style: { fontSize: '.72rem', fontWeight: 700, color: 'var(--cream)', marginBottom: '10px' } }, '☁️ Firebase Storage'),
            React.createElement('button', {
                className: stLoad ? 'bs' : 'bp',
                style: { marginBottom: '10px' },
                onClick: scanStorage,
                disabled: stLoad
            }, stLoad ? '⏳ Escaneando…' : stData ? '🔄 Atualizar' : '🔍 Escanear Storage'),

            stData ? React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
                React.createElement('div', { style: { background: 'rgba(255,255,255,.04)', borderRadius: '10px', padding: '10px 12px', border: '1px solid var(--b2)' } },
                    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' } },
                        React.createElement('span', { style: { fontSize: '.72rem', fontWeight: 700, color: 'var(--cream)' } }, 'Total no Storage'),
                        React.createElement('span', { style: { fontFamily: "'Cormorant Garamond',serif", fontSize: '1rem', color: stData.total > 500*1024*1024 ? 'var(--danger)' : 'var(--sage)' } }, fmtBytes(stData.total))
                    ),
                    React.createElement('div', { style: { height: '5px', background: 'rgba(255,255,255,.06)', borderRadius: '3px', overflow: 'hidden' } },
                        React.createElement('div', { style: { height: '100%', borderRadius: '3px', width: Math.min(100, (stData.total / LIMITE_ST) * 100) + '%', background: stData.total > 500*1024*1024 ? 'var(--danger)' : 'var(--sage)', transition: 'width .6s' } })
                    ),
                    React.createElement('div', { style: { fontSize: '.58rem', color: 'var(--muted)', marginTop: '4px', textAlign: 'right' } }, fmtBytes(stData.total) + ' de 5 GB (plano gratuito)')
                ),
                React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '1px' } },
                    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '4px 8px', fontSize: '.58rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' } },
                        React.createElement('span', null, 'Pasta'),
                        React.createElement('span', null, 'Arquivos'),
                        React.createElement('span', null, 'Tamanho')
                    ),
                    stData.rows.map(function(r) {
                        var pct = stData.total > 0 ? (r.bytes / stData.total) * 100 : 0;
                        return React.createElement('div', { key: r.pasta, style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 8px', borderRadius: '7px', borderBottom: '1px solid rgba(255,255,255,.03)' } },
                            React.createElement('span', { style: { flex: 1, fontSize: '.7rem', color: 'var(--text)' } }, r.pasta),
                            React.createElement('span', { style: { fontSize: '.62rem', color: 'var(--muted)', minWidth: '28px', textAlign: 'right' } }, r.count > 0 ? r.count : '—'),
                            React.createElement('span', { style: { fontSize: '.65rem', color: pct > 20 ? 'var(--rose)' : 'var(--muted)', minWidth: '54px', textAlign: 'right', fontWeight: pct > 20 ? 700 : 400 } }, r.bytes > 0 ? fmtBytes(r.bytes) : '—')
                        );
                    })
                )
            ) : null,

            !stData && !stLoad ? React.createElement('div', { style: { fontSize: '.7rem', color: 'var(--muted)', lineHeight: 1.6 } },
                'Mostra quantas fotos e quantos MB cada pasta ocupa no Firebase Storage (limite gratuito: 5 GB).'
            ) : null
        ),

        React.createElement('div', { style: { marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--b1)' } },
            React.createElement('div', { style: { fontSize: '.72rem', fontWeight: 700, color: 'var(--cream)', marginBottom: '6px' } }, '🔄 Migrar fotos antigas'),
            React.createElement('div', { style: { fontSize: '.68rem', color: 'var(--muted)', marginBottom: '10px', lineHeight: 1.5 } },
                'Move fotos salvas em base64 no banco para o Storage, liberando espaço no Realtime Database.'
            ),
            React.createElement('button', {
                className: migRun ? 'bs' : 'bp',
                disabled: migRun,
                onClick: runMigration,
                style: { marginBottom: '10px' }
            }, migRun ? '⏳ Migrando...' : '🔄 Iniciar migração'),

            migTot > 0 ? React.createElement('div', { style: { marginBottom: '8px' } },
                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '.65rem', color: 'var(--muted)', marginBottom: '4px' } },
                    React.createElement('span', null, migDone + ' de ' + migTot + ' fotos migradas'),
                    React.createElement('span', null, Math.round(migDone/migTot*100) + '%')
                ),
                React.createElement('div', { style: { height: '4px', background: 'rgba(255,255,255,.06)', borderRadius: '2px', overflow: 'hidden' } },
                    React.createElement('div', { style: { height: '100%', borderRadius: '2px', width: Math.round(migDone/migTot*100)+'%', background: 'var(--sage)', transition: 'width .4s' } })
                )
            ) : null,

            migLog.length > 0 ? React.createElement('div', { style: { maxHeight: '120px', overflowY: 'auto', background: 'rgba(255,255,255,.03)', borderRadius: '8px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '3px' } },
                migLog.map(function(msg, i) {
                    return React.createElement('div', { key: i, style: { fontSize: '.62rem', color: msg.indexOf('✅') === 0 ? 'var(--sage)' : msg.indexOf('❌') === 0 ? 'var(--danger)' : 'var(--muted)' } }, msg);
                })
            ) : null
        )
    );
}
function Config() {
    var settingsR = useVal('settings', {});
    var petsR     = useList('pets');
    var pets      = useMemo(function() {
        return Object.entries(petsR || {}).map(function(e2) { return Object.assign({ id: e2[0] }, e2[1]); });
    }, [petsR]);

    var _sub = useState('perfil'); var sub = _sub[0]; var setSub = _sub[1];

    var CSUBS = [
        { id: 'perfil',  l: 'Perfil'   },
        { id: 'fotos',   l: 'Fotos'    },
        { id: 'pets',    l: 'Pets'     },
        { id: 'banco',   l: '📊 Banco' },
        { id: 'backup',  l: 'Backup'   },
        { id: 'lixeira', l: '🗑️ Lixeira' },
    ];

    var trashR = useVal('_trash', {});

    var nomeV = (settingsR && settingsR.myName)      ? settingsR.myName      : 'Voce';
    var nomeN = (settingsR && settingsR.partnerName) ? settingsR.partnerName : 'Parceiro(a)';

    // ── Perfil ──────────────────────────────────────────────────────
    var _myName      = useState(''); var myName      = _myName[0];      var setMyName      = _myName[1];
    var _partnerName = useState(''); var partnerName = _partnerName[0]; var setPartnerName = _partnerName[1];
    var _startDate   = useState(''); var startDate   = _startDate[0];   var setStartDate   = _startDate[1];
    var _saved       = useState(false); var saved     = _saved[0];       var setSaved       = _saved[1];

    useEffect(function() {
        setMyName(settingsR && settingsR.myName      ? settingsR.myName      : '');
        setPartnerName(settingsR && settingsR.partnerName ? settingsR.partnerName : '');
        setStartDate(settingsR && settingsR.startDate ? settingsR.startDate : '');
    }, [settingsR && settingsR.myName, settingsR && settingsR.partnerName, settingsR && settingsR.startDate]);

    function savePerfil() {
        if (!myName.trim() || !partnerName.trim()) { toast('Preencha os nomes!'); return; }
        var upd = { myName: myName.trim(), partnerName: partnerName.trim() };
        if (startDate) { upd.startDate = startDate; upd.anivDate = startDate; }
        try { fbu('settings', upd); } catch(ex) {}
        try { localStorage.setItem('nd2_settings', JSON.stringify(Object.assign({}, settingsR, upd))); } catch(ex) {}
        setSaved(true);
        setTimeout(function() { setSaved(false); }, 2000);
        toast('Salvo!'); vib(20);
    }

    // ── Fotos ────────────────────────────────────────────────────────
    // Compressao manual via FileReader + canvas (sem async/await)
    function compressAndSave(key, file) {
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(re) {
            var img = new window.Image();
            img.onload = function() {
                var max    = 400;
                var sc     = Math.min(max / img.width, max / img.height, 1);
                var canvas = document.createElement('canvas');
                canvas.width  = Math.round(img.width  * sc);
                canvas.height = Math.round(img.height * sc);
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                var dataUrl = canvas.toDataURL('image/jpeg', 0.80);
                var path = 'perfil/' + key + '_' + Date.now() + '.jpg';
                fbUpload(path, dataUrl,
                    function(url) {
                        var upd = {};
                        upd[key] = url;
                        try { fbu('settings', upd); } catch(ex) {}
                        toast('Foto salva! ✅'); vib(20);
                    },
                    function(err) { console.error(err); toast('Erro ao enviar foto ☁️'); }
                );
            };
            img.onerror = function() { toast('Erro ao carregar imagem'); };
            img.src = re.target.result;
        };
        reader.onerror = function() { toast('Erro ao ler arquivo'); };
        reader.readAsDataURL(file);
    }

    // ── Pets ─────────────────────────────────────────────────────────
    // sub-tela pets: 'lista' | 'form'
    var _petTela   = useState('lista'); var petTela   = _petTela[0];   var setPetTela   = _petTela[1];
    var _editPetId = useState(null);    var editPetId = _editPetId[0]; var setEditPetId = _editPetId[1];
    var _petName   = useState('');      var petName   = _petName[0];   var setPetName   = _petName[1];
    var _petEmoji  = useState('🐶');    var petEmoji  = _petEmoji[0];  var setPetEmoji  = _petEmoji[1];
    var _petBday   = useState('');      var petBday   = _petBday[0];   var setPetBday   = _petBday[1];
    var _petPhoto  = useState(null);    var petPhoto  = _petPhoto[0];  var setPetPhoto  = _petPhoto[1];

    var PET_EMOJIS = ['🐶','🐱','🐰','🐹','🦜','🐟','🐢','🐍','🦮','🐾'];

    function openPetForm(pet) {
        setEditPetId(pet ? pet.id : null);
        setPetName(pet ? (pet.name  || '')    : '');
        setPetEmoji(pet ? (pet.emoji || '🐶') : '🐶');
        setPetBday(pet ? (pet.birthday || '')  : '');
        setPetPhoto(pet ? (pet.photo  || null) : null);
        setPetTela('form');
    }

    function compressPetPhoto(file) {
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(re) {
            var img = new window.Image();
            img.onload = function() {
                var max    = 300;
                var sc     = Math.min(max / img.width, max / img.height, 1);
                var canvas = document.createElement('canvas');
                canvas.width  = Math.round(img.width  * sc);
                canvas.height = Math.round(img.height * sc);
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                var dataUrl = canvas.toDataURL('image/jpeg', 0.80);
                var path = 'pets/' + Date.now() + '_' + Math.random().toString(36).slice(2) + '.jpg';
                fbUpload(path, dataUrl,
                    function(url) { setPetPhoto(url); },
                    function(err) { console.error(err); toast('Erro ao enviar foto ☁️'); }
                );
            };
            img.src = re.target.result;
        };
        reader.readAsDataURL(file);
    }

    function savePet() {
        if (!petName.trim()) { toast('Nome do pet!'); return; }
        var data = { name: petName.trim(), emoji: petEmoji, birthday: petBday, ts: Date.now() };
        if (petPhoto) data.photo = petPhoto;
        try {
            if (editPetId) fbu('pets/' + editPetId, data);
            else fbp('pets', data);
        } catch(ex) {}
        toast('Pet salvo!'); vib(20);
        setPetTela('lista');
    }

    function delPet(id) {
        try { fbr('pets/' + id); } catch(ex) {}
        toast('Pet removido'); vib(15);
    }

    // ── Backup ───────────────────────────────────────────────────────
    var _restoreData = useState(null); var restoreData = _restoreData[0]; var setRestoreData = _restoreData[1];

    function doBackup() {
        var db = window.__fb && window.__fb.db;
        if (!db) { toast('Firebase nao conectado'); return; }
        var ref = window.__fb.ref, get = window.__fb.get;
        get(ref(db, '/')).then(function(snap) {
            var json = JSON.stringify(snap.val() || {}, null, 2);
            var a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
            a.download = 'nosdois_backup_' + dk(new Date()) + '.json';
            a.click();
            toast('Backup feito!'); vib(20);
        }).catch(function() { toast('Erro no backup'); });
    }

    function onRestoreFile(file) {
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
            try { setRestoreData(JSON.parse(ev.target.result)); }
            catch(ex) { toast('Arquivo invalido'); }
        };
        reader.readAsText(file);
    }

    function confirmRestore() {
        if (!restoreData) return;
        var db  = window.__fb.db;
        var ref = window.__fb.ref;
        var set = window.__fb.set;
        set(ref(db, '/'), restoreData).then(function() {
            toast('Restaurado!'); setRestoreData(null); vib([20,20,40]);
        }).catch(function() { toast('Erro ao restaurar'); });
    }

    // ─────────────────────────────────────────────────────────────────
    return React.createElement('div', { className: 'ps', style: { padding: '13px 13px 80px', gap: '12px' } },

        // Sub-nav tabs
        React.createElement('div', { style: { display: 'flex', gap: '5px', flexWrap: 'wrap' } },
            CSUBS.map(function(s) {
                var isSel = sub === s.id;
                return React.createElement('button', {
                    key: s.id,
                    onClick: function() { setSub(s.id); if (s.id === 'pets') setPetTela('lista'); },
                    style: {
                        flex: '1 1 auto', padding: '7px 4px', borderRadius: '10px',
                        border: '1.5px solid', borderColor: isSel ? 'var(--rose)' : 'var(--b2)',
                        background: isSel ? 'rgba(232,131,106,.12)' : 'transparent',
                        color: isSel ? 'var(--rose3)' : 'var(--muted)',
                        fontSize: '.68rem', fontWeight: 700, cursor: 'pointer'
                    }
                }, s.l);
            })
        ),

        // ── PERFIL ──────────────────────────────────────────────────
        sub === 'perfil' ? React.createElement('div', { className: 'card' },
            React.createElement('div', { className: 'ct' }, 'Nosso Relacionamento'),
            React.createElement('div', { className: 'fg', style: { gap: '10px', paddingTop: '2px' } },
                React.createElement('div', null,
                    React.createElement('div', { style: { fontSize: '.7rem', color: 'var(--muted)', marginBottom: '4px', fontWeight: 700 } }, 'Seu nome'),
                    React.createElement('input', { className: 'f', placeholder: 'Seu nome...', value: myName, onChange: function(e) { setMyName(e.target.value); } })
                ),
                React.createElement('div', null,
                    React.createElement('div', { style: { fontSize: '.7rem', color: 'var(--muted)', marginBottom: '4px', fontWeight: 700 } }, 'Nome do(a) parceiro(a)'),
                    React.createElement('input', { className: 'f', placeholder: 'Nome do(a) parceiro(a)...', value: partnerName, onChange: function(e) { setPartnerName(e.target.value); } })
                ),
                React.createElement('div', null,
                    React.createElement('div', { style: { fontSize: '.7rem', color: 'var(--muted)', marginBottom: '4px', fontWeight: 700 } }, 'Data de inicio do relacionamento'),
                    React.createElement('input', { className: 'f', type: 'date', style: { colorScheme: 'dark' }, value: startDate, onChange: function(e) { setStartDate(e.target.value); } })
                ),
                React.createElement('button', {
                    className: 'bp', onClick: savePerfil,
                    style: { background: saved ? 'var(--ok)' : undefined, transition: 'background .3s' }
                }, saved ? '✅ Salvo!' : '💾 Salvar'),
                React.createElement('div', { style: { borderTop: '1px solid var(--b2)', marginTop: '8px', paddingTop: '12px' } },
                    React.createElement('div', { style: { fontSize: '.66rem', color: 'var(--muted)', marginBottom: '8px' } },
                        'Logado como ',
                        React.createElement('b', { style: { color: 'var(--rose3)' } },
                            (window.__auth && window.__auth.currentEmail && window.__auth.currentEmail()) || '—'
                        )
                    ),
                    window.__native && window.__native.isNative ? React.createElement('button', {
                        className: 'bs',
                        style: { width: '100%', marginBottom: '8px', fontSize: '.78rem' },
                        onClick: function() {
                            var enabled = localStorage.getItem('bio_enabled') === '1';
                            if (enabled) {
                                if (!confirm('Desativar entrada por biometria?')) return;
                                if (window.__native.biometricDeleteCredentials) window.__native.biometricDeleteCredentials();
                                localStorage.removeItem('bio_enabled');
                                localStorage.removeItem('bio_declined');
                                toast('Biometria desativada');
                            } else {
                                window.__native.biometricAvailable().then(function(avail) {
                                    if (!avail) { toast('Seu celular não tem biometria configurada'); return; }
                                    var pwd = prompt('Digite sua senha pra ativar a biometria:');
                                    if (!pwd) return;
                                    var em = window.__auth && window.__auth.currentEmail && window.__auth.currentEmail();
                                    if (!em) { toast('Sem usuário logado'); return; }
                                    // valida senha pelo serviço de autenticação
                                    window.__auth.verifyCurrentPassword(pwd).then(function() {
                                        return window.__native.biometricSaveCredentials(em, pwd);
                                    }).then(function() {
                                        localStorage.setItem('bio_enabled', '1');
                                        localStorage.removeItem('bio_declined');
                                        toast('Biometria ativada ✓');
                                    }).catch(function() { toast('Senha incorreta ou erro'); });
                                });
                            }
                        }
                    }, (localStorage.getItem('bio_enabled') === '1' ? '🚫 Desativar' : '👆 Ativar') + ' biometria') : null,
                    React.createElement('button', {
                        className: 'bs',
                        style: { color: 'var(--danger)', borderColor: 'rgba(224,88,112,.4)', width: '100%' },
                        onClick: function() {
                            if (!confirm('Sair da conta? Você precisará fazer login novamente.')) return;
                            try {
                                if (window.__auth) window.__auth.signOut().catch(function() {});
                                if (window.__native && window.__native.biometricDeleteCredentials) window.__native.biometricDeleteCredentials();
                                if (window.__auth) {
                                    window.__auth.clearLocalSession();
                                } else {
                                    localStorage.removeItem('myName');
                                    localStorage.removeItem('bio_enabled');
                                    localStorage.removeItem('bio_declined');
                                }
                            } catch(ex) {}
                            location.reload();
                        }
                    }, '🚪 Sair da conta')
                )
            )
        ) : null,

        // ── FOTOS ───────────────────────────────────────────────────
        sub === 'fotos' ? React.createElement('div', { className: 'card' },
            React.createElement('div', { className: 'ct' }, 'Fotos'),
            React.createElement('div', { className: 'fg', style: { gap: '14px', paddingTop: '2px' } },
                // Foto do casal
                React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' } },
                    (settingsR && settingsR.couplePhoto)
                        ? React.createElement('img', { src: settingsR.couplePhoto, style: { width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--rose)' } })
                        : React.createElement('div', { style: { width: '90px', height: '90px', borderRadius: '50%', background: 'var(--b1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem' } }, 'casal'),
                    React.createElement('div', { style: { fontSize: '.65rem', color: 'var(--muted)' } }, 'Foto do casal'),
                    React.createElement('label', { className: 'bs', style: { cursor: 'pointer', fontSize: '.7rem' } },
                        'Alterar',
                        React.createElement('input', { type: 'file', accept: 'image/*', style: { display: 'none' }, onChange: function(e) { compressAndSave('couplePhoto', e.target.files && e.target.files[0]); } })
                    ),
                    (settingsR && settingsR.couplePhoto) ? React.createElement('button', { className: 'bs', style: { fontSize: '.65rem', color: 'var(--danger)', padding: '4px 10px' }, onClick: function() { var upd = { couplePhoto: null }; try { fbu('settings', upd); } catch(ex) {} toast('Foto removida'); } }, '🗑️ Remover foto') : null
                ),
                // Fotos individuais
                React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' } },
                    // Foto de quem (nomeV)
                    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' } },
                        (settingsR && settingsR.photoUser1)
                            ? React.createElement('img', { src: settingsR.photoUser1, style: { width: '65px', height: '65px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--rose)' } })
                            : React.createElement('div', { style: { width: '65px', height: '65px', borderRadius: '50%', background: 'var(--b1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' } }, 'eu'),
                        React.createElement('div', { style: { fontSize: '.62rem', color: 'var(--muted)' } }, nomeV),
                        React.createElement('label', { className: 'bs', style: { cursor: 'pointer', fontSize: '.65rem' } },
'📷 Foto',
                            React.createElement('input', { type: 'file', accept: 'image/*', style: { display: 'none' }, onChange: function(e) { compressAndSave('photoUser1', e.target.files && e.target.files[0]); } })
                        )
                    ),
                    // Foto do parceiro (nomeN)
                    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' } },
                        (settingsR && settingsR.photoUser2)
                            ? React.createElement('img', { src: settingsR.photoUser2, style: { width: '65px', height: '65px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--purple)' } })
                            : React.createElement('div', { style: { width: '65px', height: '65px', borderRadius: '50%', background: 'var(--b1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' } }, 'amor'),
                        React.createElement('div', { style: { fontSize: '.62rem', color: 'var(--muted)' } }, nomeN),
                        React.createElement('label', { className: 'bs', style: { cursor: 'pointer', fontSize: '.65rem' } },
'📷 Foto',
                            React.createElement('input', { type: 'file', accept: 'image/*', style: { display: 'none' }, onChange: function(e) { compressAndSave('photoUser2', e.target.files && e.target.files[0]); } })
                        )
                    )
                )
            )
        ) : null,

        // ── PETS ────────────────────────────────────────────────────
        sub === 'pets' && (function() {
            // sub-tela form pet
            if (petTela === 'form') {
                return React.createElement('div', { className: 'fg', style: { gap: '12px' } },
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                        React.createElement('button', { onClick: function() { setPetTela('lista'); }, style: { background: 'none', border: 'none', color: 'var(--rose)', fontSize: '1rem', cursor: 'pointer', padding: '4px 0', flexShrink: 0 } }, '← Voltar'),
                        React.createElement('div', { className: 'sec-title', style: { flex: 1 } }, editPetId ? 'Editar Pet' : 'Novo Pet')
                    ),
                    React.createElement('div', { className: 'card fg', style: { gap: '11px' } },
                        React.createElement('div', null,
                            React.createElement('div', { style: { fontSize: '.7rem', color: 'var(--muted)', marginBottom: '4px' } }, 'Nome'),
                            React.createElement('input', { className: 'f', placeholder: 'Nome do pet...', value: petName, onChange: function(e) { setPetName(e.target.value); }, autoFocus: true })
                        ),
                        React.createElement('div', null,
                            React.createElement('div', { style: { fontSize: '.7rem', color: 'var(--muted)', marginBottom: '6px' } }, 'Emoji'),
                            React.createElement('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
                                PET_EMOJIS.map(function(em) {
                                    return React.createElement('button', {
                                        key: em, onClick: function() { setPetEmoji(em); },
                                        style: { fontSize: '1.3rem', padding: '4px 6px', borderRadius: '8px', border: '2px solid', borderColor: petEmoji === em ? 'var(--rose)' : 'transparent', background: 'var(--b1)', cursor: 'pointer' }
                                    }, em);
                                })
                            )
                        ),
                        React.createElement('div', null,
                            React.createElement('div', { style: { fontSize: '.7rem', color: 'var(--muted)', marginBottom: '4px' } }, 'Aniversario (opcional)'),
                            React.createElement(DateBR, { value: petBday, onChange: setPetBday })
                        ),
                        // Foto do pet
                        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                            petPhoto ? React.createElement('img', { src: petPhoto, style: { width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--rose)', flexShrink: 0 } }) : null,
                            React.createElement('label', { className: 'bs', style: { cursor: 'pointer', flex: 1, textAlign: 'center' } },
                                petPhoto ? 'Trocar foto' : 'Adicionar foto',
                                React.createElement('input', { type: 'file', accept: 'image/*', style: { display: 'none' }, onChange: function(e) { compressPetPhoto(e.target.files && e.target.files[0]); } })
                            ),
                            petPhoto ? React.createElement('button', { className: 'bico', style: { color: 'var(--danger)', fontSize: '.85rem' }, onClick: function() { setPetPhoto(null); } }, '🗑️') : null
                        ),
                        React.createElement('div', { style: { display: 'flex', gap: '8px', marginTop: '4px' } },
                            React.createElement('button', { className: 'bs', style: { flex: 1 }, onClick: function() { setPetTela('lista'); } }, '✕ Cancelar'),
                            React.createElement('button', { className: 'bp', style: { flex: 1 }, onClick: savePet }, editPetId ? '💾 Salvar' : '🐾 Adicionar pet')
                        )
                    )
                );
            }
            // sub-tela lista
            return React.createElement('div', { className: 'card' },
                React.createElement('div', { className: 'ct' },
                    'Nossos Pets',
                    React.createElement('button', { className: 'bico', onClick: function() { openPetForm(null); }, style: { marginLeft: 'auto', fontSize: '.72rem' } }, '🐾 + Novo')
                ),
                pets.length === 0
                    ? React.createElement('div', { style: { textAlign: 'center', padding: '20px', color: 'var(--muted)', fontSize: '.75rem' } }, 'Nenhum pet ainda')
                    : React.createElement('div', { className: 'fg', style: { gap: '8px', paddingTop: '4px' } },
                        pets.map(function(pet) {
                            return React.createElement('div', { key: pet.id, style: { display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--b1)', borderRadius: '10px', padding: '10px' } },
                                pet.photo
                                    ? React.createElement('img', { src: pet.photo, style: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 } })
                                    : React.createElement('div', { style: { width: '40px', height: '40px', borderRadius: '50%', background: 'var(--b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 } }, pet.emoji || 'paw'),
                                React.createElement('div', { style: { flex: 1 } },
                                    React.createElement('div', { style: { fontWeight: 700, fontSize: '.8rem' } }, pet.name),
                                    pet.birthday ? React.createElement('div', { style: { fontSize: '.63rem', color: 'var(--muted)' } }, (function(){ var p=pet.birthday.split('-'); return p[2]+'/'+p[1]+'/'+p[0]; })()) : null
                                ),
                                React.createElement('button', { className: 'bico', onClick: function() { openPetForm(pet); }, style: { fontSize: '.85rem' } }, '✏️'),
                                React.createElement('button', { className: 'bico', onClick: function() { delPet(pet.id); }, style: { fontSize: '.85rem', color: 'var(--danger)' } }, '🗑️')
                            );
                        })
                    )
            );
        })(),

        // ── BANCO ────────────────────────────────────────────────────
        sub === 'banco' ? React.createElement(BancoMonitor, null) : null,

        // ── BACKUP ──────────────────────────────────────────────────
        sub === 'backup' ? React.createElement('div', { className: 'card' },
            React.createElement('div', { className: 'ct' }, 'Backup e Restauracao'),
            React.createElement('div', { className: 'fg', style: { gap: '10px', paddingTop: '2px' } },
                React.createElement('div', { style: { fontSize: '.72rem', color: 'var(--muted)', lineHeight: 1.5 } }, 'Faça backup de todos os dados ou restaure um backup anterior.'),
                React.createElement('button', { className: 'bp', onClick: doBackup }, 'Fazer Backup (JSON)'),
                React.createElement('div', { style: { borderTop: '1px solid var(--b2)', paddingTop: '10px' } },
                    React.createElement('div', { style: { fontSize: '.7rem', color: 'var(--muted)', marginBottom: '8px', fontWeight: 700 } }, 'Restaurar backup'),
                    React.createElement('label', { className: 'bs', style: { cursor: 'pointer', textAlign: 'center', display: 'block' } },
                        'Selecionar arquivo .json',
                        React.createElement('input', { type: 'file', accept: '.json', style: { display: 'none' }, onChange: function(e) { onRestoreFile(e.target.files && e.target.files[0]); } })
                    )
                ),
                restoreData ? React.createElement('div', { style: { background: 'rgba(244,63,94,.08)', border: '1px solid rgba(244,63,94,.3)', borderRadius: '10px', padding: '12px' } },
                    React.createElement('div', { style: { fontSize: '.75rem', marginBottom: '10px', color: 'var(--rose3)' } }, 'ATENÇÃO: Isso substituirá TODOS os dados atuais. Tem certeza?'),
                    React.createElement('div', { style: { display: 'flex', gap: '8px' } },
                        React.createElement('button', { className: 'bp', style: { background: 'var(--danger)', flex: 1 }, onClick: confirmRestore }, 'Restaurar'),
                        React.createElement('button', { className: 'bs', style: { flex: 1 }, onClick: function() { setRestoreData(null); } }, '✕ Cancelar')
                    )
                ) : null
            )
        ) : null,

        // ── LIXEIRA ─────────────────────────────────────────────────
        sub === 'lixeira' ? (function() {
            var TRASH_LABELS = {
                diario: 'Diário', galeria: 'Galeria', marcos: 'Linha do tempo',
                bilhetes: 'Bilhetes', capsulas: 'Cápsulas'
            };
            var items = [];
            Object.keys(trashR || {}).forEach(function(type) {
                var typeItems = trashR[type] || {};
                Object.keys(typeItems).forEach(function(id) {
                    var v = typeItems[id];
                    if (!v || !v._deletedAt) return;
                    items.push({ type: type, id: id, data: v });
                });
            });
            items.sort(function(a, b) { return b.data._deletedAt - a.data._deletedAt; });

            function restore(item) {
                if (!confirm('Restaurar este item?')) return;
                var data = Object.assign({}, item.data);
                delete data._deletedAt;
                delete data._origPath;
                fbs(item.type + '/' + item.id, data).then(function() {
                    fbr('_trash/' + item.type + '/' + item.id);
                    toast('Restaurado ✓');
                });
            }
            function purge(item) {
                if (!confirm('Apagar para sempre? Não dá pra recuperar depois.')) return;
                fbr('_trash/' + item.type + '/' + item.id).then(function() { toast('Apagado'); });
            }

            return React.createElement('div', { className: 'card' },
                React.createElement('div', { className: 'ct' }, 'Lixeira'),
                React.createElement('div', { className: 'fg', style: { gap: '8px', paddingTop: '2px' } },
                    React.createElement('div', { style: { fontSize: '.7rem', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '6px' } },
                        'Itens apagados ficam aqui por 30 dias antes de sumirem de vez.'
                    ),
                    items.length === 0
                        ? React.createElement('div', { style: { textAlign: 'center', padding: '24px 12px', color: 'var(--muted)', fontSize: '.78rem' } }, '🪶 Lixeira vazia')
                        : items.map(function(it) {
                            var d = new Date(it.data._deletedAt);
                            var preview = it.data.text || it.data.title || it.data.name || it.data.descricao || it.data.desc || '(sem título)';
                            if (typeof preview === 'string' && preview.length > 60) preview = preview.slice(0, 60) + '…';
                            return React.createElement('div', {
                                key: it.type + '-' + it.id,
                                style: { background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: '12px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }
                            },
                                React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'baseline' } },
                                    React.createElement('span', { style: { fontSize: '.65rem', color: 'var(--rose3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' } }, TRASH_LABELS[it.type] || it.type),
                                    React.createElement('span', { style: { fontSize: '.62rem', color: 'var(--muted)' } }, d.toLocaleDateString('pt-BR'))
                                ),
                                React.createElement('div', { style: { fontSize: '.78rem', color: 'var(--text)' } }, preview),
                                React.createElement('div', { style: { display: 'flex', gap: '8px', marginTop: '4px' } },
                                    React.createElement('button', { className: 'bs', style: { flex: 1, fontSize: '.7rem', color: 'var(--ok)', borderColor: 'var(--ok)' }, onClick: function() { restore(it); } }, '↩ Restaurar'),
                                    React.createElement('button', { className: 'bs', style: { flex: 1, fontSize: '.7rem', color: 'var(--danger)', borderColor: 'rgba(224,88,112,.4)' }, onClick: function() { purge(it); } }, '✕ Apagar')
                                )
                            );
                        })
                )
            );
        })() : null
    );
}

function Onboarding(props) {
    var onDone = props.onDone;

    var _step    = useState(0);  var step    = _step[0];    var setStep    = _step[1];
    var _name    = useState(''); var name    = _name[0];    var setName    = _name[1];
    var _partner = useState(''); var partner = _partner[0]; var setPartner = _partner[1];
    var _dt      = useState(''); var dt      = _dt[0];      var setDt      = _dt[1];

    function finish() {
        if (!name.trim() || !partner.trim() || !dt) { toast('Preencha tudo! 💕'); return; }
        try { fbs('settings', { myName: name.trim(), partnerName: partner.trim(), startDate: dt, anivDate: dt }); } catch(e) {}
        localStorage.setItem('myName', name.trim().toLowerCase());
        localStorage.setItem('partnerName', partner.trim().toLowerCase());
        vib([30, 20, 30, 20, 60]);
        onDone();
    }

    // Selectores de data reutilizáveis para o step 3
    var parts = dt ? dt.split('-') : ['0','0','0'];
    var py2 = Number(parts[0]) || 0;
    var pm2 = Number(parts[1]) || 0;
    var pd2 = Number(parts[2]) || 0;

    var dias2  = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
    var meses2 = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    var anoAt  = new Date().getFullYear();
    var anos2  = [];
    for (var ai = 0; ai < 30; ai++) { anos2.push(anoAt - ai); }

    function upd2(d3, m3, y3) {
        if (d3 && m3 && y3) {
            var ms = String(m3).length < 2 ? '0' + String(m3) : String(m3);
            var ds = String(d3).length < 2 ? '0' + String(d3) : String(d3);
            setDt(String(y3) + '-' + ms + '-' + ds);
        } else {
            setDt('');
        }
    }

    function renderStep() {
        if (step === 0) return React.createElement('div', { className: 'ob-step' },
            React.createElement('div', { className: 'ob-emoji', style: { animation: 'hp 1.5s ease-in-out infinite' } }, '🤍'),
            React.createElement('div', { style: { fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2.2rem', color: 'var(--cream)', textAlign: 'center', lineHeight: 1.2, textShadow: '0 0 40px rgba(232,131,106,.3)' } }, 'nós dois'),
            React.createElement('div', { className: 'ob-sub', style: { maxWidth: '280px', fontSize: '.9rem', color: 'var(--muted)', lineHeight: 1.7 } }, 'O app do casal — feito com amor para guardar cada memória, cada momento, cada sonho de vocês dois.'),
            React.createElement('button', { className: 'bp', style: { maxWidth: '200px' }, onClick: function() { setStep(1); } }, 'Começar 💕')
        );

        if (step === 1) return React.createElement('div', { className: 'ob-step' },
            React.createElement('div', { className: 'ob-emoji' }, '👤'),
            React.createElement('div', { className: 'ob-title' }, 'Qual é o seu nome?'),
            React.createElement('input', { className: 'f', value: name, onChange: function(e) { setName(e.target.value); }, placeholder: 'Ex: Pessoa 1', autoFocus: true, style: { textAlign: 'center', fontSize: '1.1rem' } }),
            React.createElement('button', { className: 'bp', onClick: function() { if (name.trim()) setStep(2); }, style: { opacity: name.trim() ? 1 : .5 } }, 'Próximo →')
        );

        if (step === 2) return React.createElement('div', { className: 'ob-step' },
            React.createElement('div', { className: 'ob-emoji' }, '💕'),
            React.createElement('div', { className: 'ob-title' }, 'Nome do(a) seu amor?'),
            React.createElement('input', { className: 'f', value: partner, onChange: function(e) { setPartner(e.target.value); }, placeholder: 'Ex: Pessoa 2', style: { textAlign: 'center', fontSize: '1.1rem' } }),
            React.createElement('button', { className: 'bp', onClick: function() { if (partner.trim()) setStep(3); }, style: { opacity: partner.trim() ? 1 : .5 } }, 'Próximo →')
        );

        // step === 3
        return React.createElement('div', { className: 'ob-step' },
            React.createElement('div', { className: 'ob-emoji' }, '📅'),
            React.createElement('div', { className: 'ob-title' }, 'Quando começou a história de vocês?'),
            React.createElement('div', { style: { fontSize: '.8rem', color: 'var(--muted)', marginBottom: '8px' } }, 'Data de início do relacionamento'),
            React.createElement('div', { style: { display: 'flex', gap: '6px', marginBottom: '4px' } },
                React.createElement('select', { className: 'f', value: pd2 || '', onChange: function(e) { upd2(Number(e.target.value), pm2, py2); }, style: { flex: 1 } },
                    React.createElement('option', { value: '' }, 'Dia'),
                    dias2.map(function(d3) { return React.createElement('option', { key: d3, value: d3 }, d3); })
                ),
                React.createElement('select', { className: 'f', value: pm2 || '', onChange: function(e) { upd2(pd2, Number(e.target.value), py2); }, style: { flex: 2 } },
                    React.createElement('option', { value: '' }, 'Mês'),
                    meses2.map(function(m3, i) { return React.createElement('option', { key: i, value: i + 1 }, m3); })
                ),
                React.createElement('select', { className: 'f', value: py2 || '', onChange: function(e) { upd2(pd2, pm2, Number(e.target.value)); }, style: { flex: 2 } },
                    React.createElement('option', { value: '' }, 'Ano'),
                    anos2.map(function(y3) { return React.createElement('option', { key: y3, value: y3 }, y3); })
                )
            ),
            React.createElement('button', { className: 'bp', onClick: finish, style: { opacity: dt ? 1 : .5 } }, 'Criar nosso app 🤍')
        );
    }

    return React.createElement('div', { className: 'ob-wrap', style: { background: 'radial-gradient(ellipse 120% 80% at 50% 30%,#2a0a18 0%,#0d0408 60%)' } },
        React.createElement('div', { className: 'ob-dots' },
            [0, 1, 2, 3].map(function(i) {
                var cls = 'ob-dot' + (i === step ? ' on' : i < step ? ' done' : '');
                return React.createElement('div', { key: i, className: cls });
            })
        ),
        renderStep()
    );
}
/* ── PRESENÇA ONLINE ─────────────────────────────────────── */
function usePresence(myName, authReady) {
    useEffect(function() {
        if (!myName || !authReady) return;
        var intervalId = null;
        var visHandler = null;
        var byeHandler = null;
        var presRef = null;
        _waitFb(function() {
            var db   = window.__fb.db;
            var ref  = window.__fb.ref;
            var set  = window.__fb.set;
            presRef = ref(db, 'presence/' + myName);
            try {
                db.ref('presence/' + myName).onDisconnect().set({ online: false, ts: Date.now(), name: myName });
            } catch(e) { console.warn('[presence] onDisconnect', e); }
            function ping() {
                set(presRef, { online: true, ts: Date.now(), name: myName })
                    .catch(function(e) { console.warn('[presence] ping falhou:', e && e.message); });
            }
            function bye() {
                set(presRef, { online: false, ts: Date.now(), name: myName }).catch(function(){});
            }
            visHandler = function() { if (document.hidden) bye(); else ping(); };
            byeHandler = bye;
            ping();
            intervalId = setInterval(ping, 25000);
            window.addEventListener('beforeunload', byeHandler);
            document.addEventListener('visibilitychange', visHandler);
        });
        return function() {
            if (intervalId) clearInterval(intervalId);
            if (byeHandler) window.removeEventListener('beforeunload', byeHandler);
            if (visHandler) document.removeEventListener('visibilitychange', visHandler);
        };
    }, [myName, authReady]);
}
function PresenceDots(props) {
    var settingsR    = props.settingsR;
    var onSwitchUser = props.onSwitchUser;
    var presenceProp = props.presenceProp;

    var _presROwn = useVal('presence', {});
    var presR     = presenceProp !== undefined ? presenceProp : (_presROwn || {});

    var _showPanel  = useState(false);
    var showPanel   = _showPanel[0];
    var setShowPanel = _showPanel[1];

    var now     = Date.now();
    var user1Key  = ((settingsR && settingsR.myName)      || 'user1').toLowerCase();
    var user2Key  = ((settingsR && settingsR.partnerName) || 'user2').toLowerCase();
    var meKey   = (localStorage.getItem('myName') || '').toLowerCase();
    var TIMEOUT = 90000;

    function isOnline(key) {
        var p = presR && presR[key];
        return p && p.online && (now - (p.ts || 0)) < TIMEOUT;
    }
    function lastSeen(key) {
        var p = presR && presR[key];
        if (!p || !p.ts) return 'nunca';
        var diff = Math.floor((now - p.ts) / 60000);
        if (diff < 1)  return 'agora';
        if (diff < 60) return diff + 'min';
        var h = Math.floor(diff / 60);
        if (h < 24)    return h + 'h';
        return Math.floor(h / 24) + 'd';
    }

    var user1On  = isOnline(user1Key);
    var user2On  = isOnline(user2Key);
    var isMe   = meKey === user1Key;
    var partnerKey  = isMe ? user2Key : user1Key;
    var partnerName = isMe ? ((settingsR && settingsR.partnerName) || 'Pessoa 2') : ((settingsR && settingsR.myName) || 'Pessoa 1');
    var partnerOn   = isOnline(partnerKey);

    var dots = [
        { key: user1Key, nome: (settingsR && settingsR.myName)      || 'Pessoa 1', on: user1On, cor: 'var(--ok)'   },
        { key: user2Key, nome: (settingsR && settingsR.partnerName) || 'Pessoa 2',  on: user2On, cor: 'var(--rose)' },
    ];

    return React.createElement('div', { style: { position: 'relative' } },
        React.createElement('button', {
            onClick: function() { setShowPanel(function(p) { return !p; }); },
            style: { display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: '12px', transition: 'background .15s' }
        },
            React.createElement('div', { style: { display: 'flex', gap: '3px', alignItems: 'center' } },
                React.createElement('span', { style: { width: 8, height: 8, borderRadius: '50%', background: user1On ? 'var(--ok)' : 'var(--b2)', boxShadow: user1On ? '0 0 6px #4ade80' : 'none', flexShrink: 0, display: 'block' } }),
                React.createElement('span', { style: { width: 8, height: 8, borderRadius: '50%', background: user2On ? 'var(--rose)' : 'var(--b2)', boxShadow: user2On ? '0 0 6px #f472b6' : 'none', flexShrink: 0, display: 'block' } })
            ),
            partnerOn ? React.createElement('span', { style: { fontSize: '.58rem', color: isMe ? 'var(--rose)' : 'var(--ok)', fontWeight: 700, animation: 'pulse 2s infinite' } }, partnerName + ' online') : null
        ),
        showPanel ? React.createElement('div', { onClick: function() { setShowPanel(false); }, style: { position: 'fixed', inset: 0, zIndex: 8998 } }) : null,
        showPanel ? React.createElement('div', { style: { position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 'var(--rm)', padding: '12px 14px', zIndex: 8999, minWidth: 180, boxShadow: '0 8px 32px rgba(0,0,0,.5)' } },
            React.createElement('div', { style: { fontSize: '.62rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '10px' } }, 'Casal Online'),
            dots.map(function(d) {
                return React.createElement('div', { key: d.key, style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } },
                    React.createElement('span', { style: { width: 10, height: 10, borderRadius: '50%', background: d.on ? d.cor : 'var(--b2)', boxShadow: d.on ? '0 0 8px ' + d.cor : 'none', flexShrink: 0, display: 'block' } }),
                    React.createElement('div', { style: { flex: 1 } },
                        React.createElement('div', { style: { fontSize: '.72rem', color: 'var(--cream)', fontWeight: 600 } },
                            d.nome,
                            d.key === meKey ? React.createElement('span', { style: { fontSize: '.55rem', color: 'var(--muted)', marginLeft: '4px' } }, '(você)') : null
                        ),
                        React.createElement('div', { style: { fontSize: '.6rem', color: d.on ? d.cor : 'var(--muted)' } }, d.on ? 'online agora' : (d.key === user2Key ? 'vista ' : 'visto ') + lastSeen(d.key))
                    )
                );
            }),
            React.createElement('div', { style: { borderTop: '1px solid var(--b2)', paddingTop: '8px', marginTop: '4px' } },
                React.createElement('button', {
                    onClick: function() { setShowPanel(false); onSwitchUser(); },
                    style: { width: '100%', padding: '6px', background: 'rgba(255,255,255,.05)', border: '1px solid var(--b2)', borderRadius: '8px', color: 'var(--muted)', fontSize: '.65rem', cursor: 'pointer', fontWeight: 700 }
                }, 'Trocar perfil')
            )
        ) : null
    );
}
class ErrBound extends React.Component {
    constructor(p) {
        super(p);
        this.state = { err: null };
        this.handleReload = this.handleReload.bind(this);
    }
    static getDerivedStateFromError(e) {
        return { err: e };
    }
    handleReload() {
        this.setState({ err: null });
        window.location.reload();
    }
    render() {
        if (this.state.err) {
            var msg = (this.state.err && this.state.err.message) || 'Erro desconhecido';
            return React.createElement('div', { style: { padding: '24px', color: '#e88', fontFamily: 'monospace', fontSize: '.8rem', background: '#100', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', justifyContent: 'center' } },
                React.createElement('div', { style: { fontSize: '2rem' } }, '⚠️'),
                React.createElement('div', { style: { fontWeight: 700, color: 'var(--rose3)' } }, 'Algo deu errado'),
                React.createElement('div', { style: { opacity: .7, maxWidth: '300px', textAlign: 'center' } }, msg),
                React.createElement('button', { onClick: this.handleReload, style: { marginTop: '8px', padding: '10px 20px', background: 'var(--rose)', color: 'var(--fg)', border: 'none', borderRadius: '8px', fontWeight: 700 } }, 'Recarregar app')
            );
        }
        return this.props.children;
    }
}
/* ═══════════════════════════════════════════
   👤 USER PICKER — identifica quem está usando
═══════════════════════════════════════════ */
function LoginScreen(props) {
    var onLogin = props.onLogin;
    var _email  = useState(''); var email  = _email[0];  var setEmail  = _email[1];
    var _pwd    = useState(''); var pwd    = _pwd[0];    var setPwd    = _pwd[1];
    var _err    = useState(''); var err    = _err[0];    var setErr    = _err[1];
    var _busy   = useState(false); var busy = _busy[0];  var setBusy   = _busy[1];
    var _reset  = useState(false); var reset = _reset[0];var setReset  = _reset[1];
    var _bioOk  = useState(false); var bioOk = _bioOk[0]; var setBioOk = _bioOk[1];
    var _autoTried = useState(false); var autoTried = _autoTried[0]; var setAutoTried = _autoTried[1];

    // Detecta se biometria tá disponível + tem credenciais salvas
    useEffect(function() {
        if (!window.__native || !window.__native.isNative) return;
        if (localStorage.getItem('bio_enabled') !== '1') return;
        window.__native.biometricAvailable().then(function(avail) {
            if (avail) setBioOk(true);
        });
    }, []);

    function loginWithCreds(em, password) {
        var authService = window.__auth;
        if (!authService) {
            setErr('Auth indisponível');
            return Promise.reject(new Error('Auth indisponível'));
        }

        setBusy(true);
        setErr('');

        return authService.signIn(em, password).then(function(result) {
            var displayName = result.identity;
            try { localStorage.setItem('myName', displayName); } catch(e2) {}
            setBusy(false);
            if (onLogin) onLogin(displayName, result.user, password);
            return result.credential;
        }).catch(function(e2) {
            setBusy(false);
            var msg = 'Erro ao entrar';
            if (e2 && e2.code) {
                if (e2.code === 'auth/not-allowed') msg = 'Este email não tem acesso ao app';
                else if (e2.code === 'auth/unavailable') msg = 'Auth indisponível';
                else if (e2.code === 'auth/wrong-password' || e2.code === 'auth/invalid-credential') msg = 'Senha incorreta';
                else if (e2.code === 'auth/user-not-found') msg = 'Conta não existe — peça pra criar no Firebase Console';
                else if (e2.code === 'auth/too-many-requests') msg = 'Muitas tentativas — aguarde uns minutos';
                else if (e2.code === 'auth/network-request-failed') msg = 'Sem conexão';
                else msg = e2.message || msg;
            }
            setErr(msg);
            throw e2;
        });
    }

    function tryBiometric() {
        if (!window.__native || !window.__native.isNative) return;
        setErr('');
        window.__native.biometricGetCredentials('Entrar no Nós Dois').then(function(c) {
            if (c && c.username && c.password) {
                return loginWithCreds(c.username.toLowerCase(), c.password);
            }
        }).catch(function(e2) {
            // Cancelado ou erro — silencioso, mantém o form aberto
        });
    }

    // Auto-tenta biometria assim que detecta disponível
    useEffect(function() {
        if (bioOk && !autoTried) { setAutoTried(true); tryBiometric(); }
    }, [bioOk]);

    function submit(e) {
        if (e && e.preventDefault) e.preventDefault();
        var em = (email || '').trim().toLowerCase();
        if (!em || !pwd) { setErr('Preencha email e senha'); return; }
        loginWithCreds(em, pwd).catch(function(){});
    }

    function doReset() {
        var em = (email || '').trim().toLowerCase();
        if (!em) { setErr('Digite o email primeiro'); return; }

        var authService = window.__auth;
        if (!authService) { setErr('Auth indisponível'); return; }

        authService.sendPasswordReset(em).then(function() {
            setReset(true); setErr('');
        }).catch(function(e2) {
            setErr((e2 && e2.message) || 'Erro ao enviar reset');
        });
    }

    return React.createElement('div', {
        style: { position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', background: 'var(--bg)', padding: '32px 24px', overflow: 'auto' }
    },
        React.createElement('div', { style: { textAlign: 'center', marginBottom: '28px' } },
            React.createElement('div', { style: { fontSize: '2.4rem', marginBottom: '12px' } }, '🤍'),
            React.createElement('div', { style: { fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '1.8rem', color: 'var(--cream)', marginBottom: '6px' } }, 'nós dois'),
            React.createElement('div', { style: { fontSize: '.78rem', color: 'var(--muted)' } }, 'Entre com seu email e senha')
        ),
        React.createElement('form', { onSubmit: submit, style: { display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '380px', width: '100%', alignSelf: 'center' } },
            React.createElement('input', {
                type: 'email', autoComplete: 'email', inputMode: 'email',
                placeholder: 'email', value: email,
                onChange: function(e) { setEmail(e.target.value); },
                style: { padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--b2)', background: 'var(--card)', color: 'var(--fg)', fontSize: '.92rem', fontFamily: 'inherit' }
            }),
            React.createElement('input', {
                type: 'password', autoComplete: 'current-password',
                placeholder: 'senha', value: pwd,
                onChange: function(e) { setPwd(e.target.value); },
                style: { padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--b2)', background: 'var(--card)', color: 'var(--fg)', fontSize: '.92rem', fontFamily: 'inherit' }
            }),
            err ? React.createElement('div', { style: { fontSize: '.74rem', color: 'var(--danger)', textAlign: 'center', padding: '4px 0' } }, err) : null,
            reset ? React.createElement('div', { style: { fontSize: '.74rem', color: 'var(--ok)', textAlign: 'center', padding: '4px 0' } }, 'Email de reset enviado ✓') : null,
            React.createElement('button', {
                type: 'submit', disabled: busy,
                style: { padding: '14px 16px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,var(--rose),var(--rose2))', color: '#fff', fontSize: '.92rem', fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer', opacity: busy ? .6 : 1 }
            }, busy ? 'Entrando…' : 'Entrar 💕'),
            bioOk ? React.createElement('button', {
                type: 'button', onClick: tryBiometric,
                style: { padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--b2)', background: 'transparent', color: 'var(--rose3)', fontSize: '.86rem', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }
            }, '👆 Entrar com biometria') : null,
            React.createElement('button', {
                type: 'button', onClick: doReset,
                style: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: '.72rem', cursor: 'pointer', padding: '8px', fontFamily: 'inherit' }
            }, 'Esqueci a senha')
        )
    );
}

function UserPicker(props) {
    var settingsR = props.settingsR;
    var onPick    = props.onPick;

    var nV = (settingsR && settingsR.myName)      || 'Pessoa 1';
    var nN = (settingsR && settingsR.partnerName) || 'Pessoa 2';
    var pV = settingsR && settingsR.photoUser1;
    var pN = settingsR && settingsR.photoUser2;

    var users = [
        { name: nV, photo: pV, color: 'var(--rose)'   },
        { name: nN, photo: pN, color: 'var(--purple)'  },
    ];

    return React.createElement('div', { style: { position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(6px)' } },
        React.createElement('div', { style: { background: 'var(--bg)', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', border: '1px solid var(--b2)', borderBottom: 'none' } },
            React.createElement('div', { style: { width: '36px', height: '4px', borderRadius: '2px', background: 'var(--b2)', margin: '0 auto 20px' } }),
            React.createElement('div', { style: { textAlign: 'center', marginBottom: '20px' } },
                React.createElement('div', { style: { fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '1.4rem', color: 'var(--cream)', marginBottom: '5px' } }, 'Olá! 🤍'),
                React.createElement('div', { style: { fontSize: '.74rem', color: 'var(--muted)', lineHeight: 1.6 } }, 'Quem está usando o app agora?')
            ),
            React.createElement('div', { style: { display: 'flex', gap: '12px' } },
                users.map(function(u) {
                    return React.createElement('button', {
                        key: u.name,
                        onClick: function() {
  var nm = u.name.toLowerCase();
  onPick(nm);
  if (window._fcmInit) window._fcmInit(nm);
},
                        style: { flex: 1, padding: '18px 8px', borderRadius: '18px', border: '2px solid ' + u.color, background: u.color + '18', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '11px', cursor: 'pointer', transition: 'all .15s', boxShadow: '0 4px 20px ' + u.color + '20' }
                    },
                        u.photo
                            ? React.createElement('img', { loading: 'lazy', decoding: 'async', src: u.photo, style: { width: '62px', height: '62px', borderRadius: '50%', objectFit: 'cover', border: '3px solid ' + u.color, boxShadow: '0 0 20px ' + u.color + '40' } })
                            : React.createElement('div', { style: { width: '62px', height: '62px', borderRadius: '50%', background: u.color + '20', border: '3px solid ' + u.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: '0 0 20px ' + u.color + '30' } }, '👤'),
                        React.createElement('span', { style: { fontSize: '.9rem', fontWeight: 800, color: 'var(--cream)', letterSpacing: '.01em' } }, u.name)
                    );
                })
            )
        )
    );
}
function OfflineBanner() {
    var _off = useState(!navigator.onLine);
    var offline    = _off[0];
    var setOffline = _off[1];

    useEffect(function() {
        function goOff() { setOffline(true);  }
        function goOn()  { setOffline(false); }
        window.addEventListener('offline', goOff);
        window.addEventListener('online',  goOn);
        return function() {
            window.removeEventListener('offline', goOff);
            window.removeEventListener('online',  goOn);
        };
    }, []);

    if (!offline) return null;
    return React.createElement('div', {
        style: {
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
            background: 'var(--danger)', color: 'var(--fg)',
            textAlign: 'center', fontSize: '.82rem', fontWeight: 700,
            padding: '8px 16px', letterSpacing: '.02em'
        }
    }, '📡 Sem conexão — alterações serão sincronizadas quando voltar');
}

function App() {
    var _tab     = useState('home'); var tab     = _tab[0];     var setTab     = _tab[1];
    var _prevTab = useState('home'); var prevTab = _prevTab[0]; var setPrevTab = _prevTab[1];
    var _animKey = useState(0);      var animKey = _animKey[0]; var setAnimKey = _animKey[1];
    var _cur     = useState(function() {
        var n = _brt(new Date());
        return new Date(n.getFullYear(), n.getMonth(), 1);
    });
    var cur = _cur[0]; var setCur = _cur[1];
    var _online = useState(false); var online = _online[0]; var setOnline = _online[1];
    var _showOb = useState(false); var showOb = _showOb[0]; var setShowOb = _showOb[1];
    var _np     = useState(function() {
        try { return typeof Notification !== 'undefined' ? Notification.permission : 'denied'; } catch(e) { return 'denied'; }
    });
    var np = _np[0]; var setNp = _np[1];

    var settingsR = useVal('settings', null);

    var _myIdentity = useState(function() { return localStorage.getItem('myName') || ''; });
    var myIdentity  = _myIdentity[0]; var setMyIdentity = _myIdentity[1];

    var _showUserPicker = useState(function() { return !localStorage.getItem('myName'); });
    var showUserPicker  = _showUserPicker[0]; var setShowUserPicker = _showUserPicker[1];

    // ── Auth state ────────────────────────────────────────────────────
    var _authUser  = useState(undefined); // undefined = ainda não checado, null = deslogado
    var authUser   = _authUser[0]; var setAuthUser = _authUser[1];

    useEffect(function() {
        var authService = window.__auth;
        if (!authService) { setAuthUser(null); return; }

        var unsub = authService.observeSession(function(session) {
            setAuthUser(session.user || null);

            if (session.user && session.identity) {
                var dn = session.identity;
                try { localStorage.setItem('myName', dn); } catch(e) {}
                setMyIdentity(dn);
                setShowUserPicker(false);
                if (window._fcmInit) window._fcmInit(dn);
            } else if (session.user && !session.allowed) {
                authService.signOut().catch(function() {});
                toast('Email sem permissão. Saindo.');
            }
        });

        return function() { try { unsub(); } catch(e) {} };
    }, []);

    function pickUser(n) {
        localStorage.setItem('myName', n);
        setMyIdentity(n);
        setShowUserPicker(false);
        window.dispatchEvent(new Event('nos2:identity'));
        vib([30, 20, 40]);
        toast('Olá, ' + n.charAt(0).toUpperCase() + n.slice(1) + '! 👋');
    }

    function handleLogin(displayName, user, password) {
        setMyIdentity(displayName);
        setShowUserPicker(false);
        window.dispatchEvent(new Event('nos2:identity'));
        vib([30, 20, 40]);
        toast('Olá, ' + displayName.charAt(0).toUpperCase() + displayName.slice(1) + '! 👋');

        // Oferece salvar biometria pra próximo login (somente APK + se ainda não salvou)
        try {
            if (window.__native && window.__native.isNative && password &&
                localStorage.getItem('bio_enabled') !== '1' &&
                localStorage.getItem('bio_declined') !== '1') {
                window.__native.biometricAvailable().then(function(avail) {
                    if (!avail) return;
                    setTimeout(function() {
                        if (confirm('Quer entrar com digital/face nas próximas vezes?')) {
                            window.__native.biometricSaveCredentials(user.email, password).then(function() {
                                localStorage.setItem('bio_enabled', '1');
                                toast('Biometria ativada ✓');
                            }).catch(function() {
                                toast('Não consegui salvar. Pode tentar de novo nas Configurações.');
                            });
                        } else {
                            localStorage.setItem('bio_declined', '1');
                        }
                    }, 1200);
                });
            }
        } catch(e) {}
    }

    var myNamePresence = (myIdentity || (settingsR && settingsR.myName) || 'user1').toLowerCase();
    usePresence(myNamePresence, !!authUser);

    // ── Recorrência automática de gastos: agora é Cloud Function (monthlyRecurrence)
    //     roda dia 1 de cada mês mesmo se ninguém abrir o app.

    // ── Conexão Firebase + splash ─────────────────────────────────────
    useEffect(function() {
        var connUnsub  = null;
        var splashDone = false;

        var t = setTimeout(function() {
            try {
                var db      = window.__fb.db;
                var ref     = window.__fb.ref;
                var onValue = window.__fb.onValue;
                connUnsub = onValue(ref(db, '.info/connected'), function(s) {
                    setOnline(!!s.val());
                });
            } catch(e) {}
        }, 600);

        function hideSplash() {
            if (splashDone) return;
            splashDone = true;
            var s = document.getElementById('splash');
            if (s) {
                s.classList.add('hide');
                setTimeout(function() { s.style.display = 'none'; }, 400);
            }
        }

        var splashTimer = setTimeout(hideSplash, 3000);
        _waitFb(function() {
            var db      = window.__fb.db;
            var ref     = window.__fb.ref;
            var onValue = window.__fb.onValue;
            onValue(ref(db, '.info/connected'), function(snap) {
                if (snap.val()) clearTimeout(splashTimer);
                setTimeout(hideSplash, 400);
            }, { onlyOnce: true });
        });

        document.body.style.overscrollBehavior = 'none';

        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            setTimeout(function() {
                Notification.requestPermission().then(function(r) { setNp(r); }).catch(function() {});
            }, 3000);
        }

        return function() { clearTimeout(t); if (connUnsub) connUnsub(); };
    }, []);

    // ── Onboarding trigger ────────────────────────────────────────────
    useEffect(function() {
        if (settingsR !== null && !(settingsR && settingsR.startDate)) {
            setShowOb(true);
        } else if (settingsR && settingsR.startDate) {
            setShowOb(false);
        }
    }, [settingsR]);

    // ── Dados globais ─────────────────────────────────────────────────
    var evRootR       = useList('events');
    var compRootR     = useList('compras');
    var diarioR       = useList('diario');
    var gastRRoot     = useList('gastos');
    var petsRRoot     = useList('pets');
    var presenceRRoot = useVal('presence', {});

    var todayEvs = useMemo(function() {
        return Object.values(evRootR || {}).filter(function(e) { return e.date === dk(td()); }).length;
    }, [evRootR]);

    var pendComp = useMemo(function() {
        return Object.values(compRootR || {}).filter(function(i) { return !i.done; }).length;
    }, [compRootR]);

    var lastSeenDiario = useMemo(function() {
        return parseInt(localStorage.getItem('lastSeenDiario') || '0');
    }, [tab]);

    var newDiario = useMemo(function() {
        var entries = Object.values(diarioR || {});
        return entries.filter(function(e) {
            return new Date(e.date || '2000-01-01').getTime() > lastSeenDiario;
        }).length;
    }, [diarioR, lastSeenDiario]);

    useEffect(function() {
        if (tab === 'nois') localStorage.setItem('lastSeenDiario', String(Date.now()));
    }, [tab]);

    // ── Lembretes de eventos: agora é Cloud Function (dailyEventReminders)
    //     dispara push às 8h BRT mesmo com o app fechado.

    // ── Constantes de render ──────────────────────────────────────────
    var TABS = [
        { id: 'home',     i: '🏠', l: 'Início'  },
        { id: 'agenda',   i: '🗓', l: 'Agenda',  badge: todayEvs },
        { id: 'gastos',   i: '💸', l: 'Gastos'  },
        { id: 'planejar', i: '✨', l: 'Planejar' },
        { id: 'compras',  i: '🛒', l: 'Compras', badge: pendComp },
        { id: 'nois',     i: '💕', l: 'Nóis',    badge: newDiario },
    ];
    var TAB_ORDER = ['home', 'agenda', 'gastos', 'planejar', 'compras', 'nois', 'config'];
    var showM     = ['agenda', 'gastos', 'planejar'].indexOf(tab) >= 0;
    var TAB_IDS   = ['home', 'agenda', 'gastos', 'planejar', 'compras', 'nois', 'config'];

    var NM_LABELS = { agenda: 'Agenda', gastos: 'Gastos', planejar: 'Planejar', compras: 'Compras', nois: 'Nóis', config: 'Config' };

    function goTab(id, e) {
        if (e) rip(e);
        setPrevTab(tab);
        setTab(id);
        setAnimKey(function(k) { return k + 1; });
        vib(14);
        requestAnimationFrame(function() {
            var ps = document.querySelector('[data-tab="' + id + '"] .ps');
            if (ps) ps.scrollTop = 0;
        });
    }

    function renderLogo() {
        if (NM_LABELS[tab]) {
            return React.createElement('span', { style: { fontSize: '.78rem', fontFamily: "'Nunito',sans-serif", fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', opacity: .8 } }, NM_LABELS[tab]);
        }
        return React.createElement('span', { style: { fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '1.15rem', letterSpacing: '.01em' } },
            React.createElement('span', { style: { background: 'linear-gradient(135deg,var(--cream),var(--rose3))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } }, 'nós'),
            ' ',
            React.createElement('b', { style: { fontStyle: 'normal', fontWeight: 700, background: 'linear-gradient(135deg,var(--rose3),var(--rose))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } }, 'dois 🤍')
        );
    }

    // Auth gate: enquanto auth ainda não checado, não renderiza nada (splash cobre)
    // Se deslogado, mostra LoginScreen.
    if (authUser === undefined) {
        return React.createElement(OfflineBanner, null);
    }
    if (authUser === null) {
        return React.createElement(React.Fragment, null,
            React.createElement(OfflineBanner, null),
            React.createElement(LoginScreen, { onLogin: handleLogin })
        );
    }

    return React.createElement(React.Fragment, null,
        React.createElement(OfflineBanner, null),
        showOb ? React.createElement(Onboarding, { onDone: function() { setShowOb(false); } }) : null,
        !showOb && showUserPicker && (settingsR && settingsR.startDate) ? React.createElement(UserPicker, { settingsR: settingsR, onPick: pickUser }) : null,

        React.createElement('div', { className: 'shell', style: { display: showOb ? 'none' : 'flex' } },

            // ── Header ─────────────────────────────────────────────────
            React.createElement('div', { className: 'hdr' },
                React.createElement('div', { className: 'hdr1' },
                    React.createElement('div', { className: 'logo' }, renderLogo()),
                    React.createElement(PresenceDots, { settingsR: settingsR, presenceProp: presenceRRoot, onSwitchUser: function() { setShowUserPicker(true); } }),
                    React.createElement('button', {
                        onClick: function() {
                            setTab('config'); vib(12);
                            requestAnimationFrame(function() {
                                var el = document.querySelector('[data-tab="config"]');
                                if (el) el.scrollTop = 0;
                            });
                        },
                        style: { background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', padding: '2px 6px', opacity: tab === 'config' ? .5 : .75, lineHeight: 1, transition: 'opacity .15s' }
                    }, '⚙️'),
                    !online ? React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '3px', fontSize: '.6rem', color: 'var(--danger)', opacity: .7, background: 'rgba(224,88,112,.1)', borderRadius: '8px', padding: '2px 7px', border: '1px solid rgba(224,88,112,.2)' } }, '📵 offline') : null
                ),
                showM ? React.createElement('div', { className: 'mnav' },
                    React.createElement('button', { className: 'mnbtn', onClick: function() { setCur(new Date(cur.getFullYear(), cur.getMonth() - 1, 1)); } }, '‹'),
                    React.createElement('span', { className: 'mnlbl' }, MN[cur.getMonth()] + ' ' + cur.getFullYear()),
                    React.createElement('button', { className: 'mnbtn', onClick: function() { setCur(new Date(cur.getFullYear(), cur.getMonth() + 1, 1)); } }, '›')
                ) : null
            ),

            // ── Tab panels ─────────────────────────────────────────────
            React.createElement('div', { style: { flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' } },
                TAB_IDS.map(function(id) {
                    var active   = tab === id;
                    var fromIdx  = TAB_ORDER.indexOf(prevTab);
                    var toIdx    = TAB_ORDER.indexOf(id);
                    var animCls  = active ? (fromIdx < toIdx ? 'tab-enter-right' : 'tab-enter-left') : '';
                    var panelStyle = { flex: 1, overflow: 'hidden', flexDirection: 'column', display: active ? 'flex' : 'none' };
                    return React.createElement(ErrBound, { key: id },
                        React.createElement('div', { style: panelStyle, 'data-tab': id, key: id, className: 'tab-scroll ' + animCls },
                            id === 'home' ? React.createElement(Home,     { cur: cur, evRProp: evRootR, gastRProp: gastRRoot, petsRProp: petsRRoot }) : null,
                            id === 'agenda' ? React.createElement(Agenda,   { cur: cur, evRProp: evRootR }) : null,
                            id === 'gastos' ? React.createElement(Gastos,   { cur: cur }) : null,
                            id === 'planejar' ? React.createElement(Planejar, { cur: cur, evRProp: evRootR, gastRProp: gastRRoot }) : null,
                            id === 'compras' ? React.createElement(Compras,  { itensProp: compRootR }) : null,
                            id === 'nois' ? React.createElement(Nois,     null) : null,
                            id === 'config' ? React.createElement('div', { className: 'ps', style: { padding: '13px 13px 20px', gap: '11px' } },
                                React.createElement(Config, null)
                            ) : null
                        )
                    );
                })
            ),

            // ── Bottom nav ─────────────────────────────────────────────
            React.createElement('nav', { className: 'bnav' },
                TABS.map(function(t) {
                    var badgeNum  = t.badge || 0;
                    var showBadge = badgeNum > 0 && tab !== t.id;
                    var badgeLbl  = badgeNum > 9 ? '9+' : String(badgeNum);
                    return React.createElement('button', {
                        key: t.id,
                        className: 'ntab rw' + (tab === t.id ? ' on' : ''),
                        onClick: function() { goTab(t.id); }
                    },
                        React.createElement('div', { className: 'nbar' }),
                        React.createElement('span', { style: { position: 'relative', display: 'inline-block' } },
                            React.createElement('span', { className: 'nico' }, t.i),
                            showBadge ? React.createElement('span', { style: { position: 'absolute', top: '-3px', right: '-5px', background: 'var(--rose)', color: 'var(--fg)', borderRadius: '50%', width: '11px', height: '11px', fontSize: '.42rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: '1' } }, badgeLbl) : null
                        ),
                        t.l
                    );
                })
            )
        )
    );
}

/* ── FCM INIT NO STARTUP ── */
(function(){
  var storedName = localStorage.getItem('myName');
  if (storedName && window._fcmInit) window._fcmInit(storedName);
})();

/* ── TRAVA DE ORIENTAÇÃO ── */
try {
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('portrait').catch(function(){});
  }
} catch(e) {}

/* ── SERVICE WORKER + FCM ─────────────────────────────────── */
(function() {
  if (!('serviceWorker' in navigator)) return;

  // Register SW
  navigator.serviceWorker.register('/firebase-messaging-sw.js').then(function(reg) {
    console.log('[SW] registrado');
    // Detecta nova versão e oferece atualização
    reg.addEventListener('updatefound', function() {
      var nw = reg.installing;
      if (!nw) return;
      nw.addEventListener('statechange', function() {
        if (nw.state === 'installed' && navigator.serviceWorker.controller) {
          if (typeof toast === 'function') {
            toast('Nova versão disponível — recarregando…', 1800);
          }
          setTimeout(function() {
            try { nw.postMessage({ type: 'SKIP_WAITING' }); } catch(e) {}
            setTimeout(function() { location.reload(); }, 400);
          }, 1800);
        }
      });
    });
    // Verifica updates a cada 30 min
    setInterval(function() { try { reg.update(); } catch(e) {} }, 30 * 60 * 1000);
  }).catch(function(e) { console.warn('[SW] erro', e); });

  // Request permission + get token when user is identified
  window._fcmInit = function(userName) {
    if (!userName) return;
    // No APK Capacitor, usa push nativo (que já registra token via capacitor-bridge)
    if (window.__native && window.__native.isNative) {
      try {
        window.__native.requestPushPermission();
        window.__native.onPushReceived(function(n) {
          if (typeof toast === 'function') toast((n && n.title) || 'Nova notificação 💕', 2400);
        });
      } catch(e) {}
      return;
    }
    if (Notification.permission === 'denied') return;
    Notification.requestPermission().then(function(perm) {
      if (perm !== 'granted') return;
      if (!window.__fcm || !window.__fcm.getToken) return;
      window.__fcm.getToken(function(token) {
        if (!token) return;
        window.__fcm.saveToken(token, userName);
        localStorage.setItem('fcm_token_'+userName.toLowerCase(), token);
      });
    }).catch(function(){});
  };

  // Send notification to partner via Firebase (saves to trigger)
  window._sendNotif = function(toName, type, payload) {
    if (!toName) return;
    var key = 'notif_triggers/'+toName.toLowerCase();
    var data = { type: type, ts: Date.now() };
    if (payload) { data.title = payload.title; data.body = payload.body; }
    try {
      var db2 = window.__fb && window.__fb.db;
      if (db2) db2.ref(key).set(data);
    } catch(e) {}
  };

  // Listen for incoming notifications (foreground)
  if (window.__fcm && window.__fcm.msg) {
    window.__fcm.msg.onMessage(function(payload) {
      var data = payload.data || payload.notification || {};
      var title = data.title || 'Nós Dois 💕';
      var body  = data.body  || '';
      if (Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(function(reg) {
          reg.showNotification(title, {
            body: body,
            icon: '/icon-192.png',
            tag: data.tag || 'nosdois-fg'
          });
        });
      }
    });
  }
})();

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(ErrBound, null,
    React.createElement(App, null)));

