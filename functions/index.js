// Cloud Functions — Nós Dois
// 4 funções:
//   1. monthlyRecurrence   — duplica gastos recorrentes no início do mês
//   2. dailyEventReminders — envia push de eventos do dia + amanhã
//   3. onNotifTrigger      — quando partner escreve em /notif_triggers/<nome>, dispara push
//   4. cleanupOldNotifs    — limpa triggers antigos (>3 dias)

const admin = require('firebase-admin');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onValueCreated } = require('firebase-functions/v2/database');
const { logger } = require('firebase-functions/v2');

admin.initializeApp();
const db = admin.database();
const messaging = admin.messaging();
const storage = admin.storage();

const TZ = 'America/Sao_Paulo';
const REGION = 'us-central1';

// ─────── Helpers ────────────────────────────────────────────────────────

function brNow() {
  const fmt = new Intl.DateTimeFormat('pt-BR', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
  const parts = fmt.formatToParts(new Date()).reduce((a, p) => {
    if (p.type !== 'literal') a[p.type] = p.value;
    return a;
  }, {});
  return new Date(`${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:00`);
}

function dk(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dy}`;
}

function mk(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${m}`;
}

async function pushTo(name, title, body, tag) {
  const tokenSnap = await db.ref(`fcm_tokens/${(name || '').toLowerCase()}`).get();
  const token = tokenSnap.val();
  if (!token) { logger.info(`[push] sem token para ${name}`); return; }
  try {
    await messaging.send({
      token,
      // Quando passamos só `data`, o app nativo pega via onPushReceived e o canal
      // do Android cuida do som/vibração customizados (canal "nosdois_default").
      // Pra web push (PWA), a notificação é montada pelo SW.
      notification: { title, body },
      data: { title, body, tag: tag || 'nosdois' },
      android: {
        priority: 'high',
        notification: {
          channelId: 'nosdois_default',
          sound: 'notification',     // res/raw/notification.wav
          color: '#e8836a',
          defaultVibrateTimings: false,
          vibrateTimingsMillis: [0, 80, 40, 80]
        }
      },
      webpush: {
        headers: { Urgency: 'high' },
        notification: {
          icon: '/icon.svg',
          badge: '/icon.svg',
          vibrate: [80, 40, 80],
          tag: tag || 'nosdois'
        }
      }
    });
  } catch (e) {
    logger.warn(`[push] falhou para ${name}:`, e.message);
    if (e.code === 'messaging/registration-token-not-registered') {
      await db.ref(`fcm_tokens/${(name || '').toLowerCase()}`).remove().catch(() => {});
    }
  }
}

async function pushAll(title, body, tag) {
  const snap = await db.ref('fcm_tokens').get();
  const tokens = snap.val() || {};
  await Promise.all(Object.keys(tokens).map(name => pushTo(name, title, body, tag)));
}

// ─────── 1. RECORRÊNCIA MENSAL ──────────────────────────────────────────
// Roda dia 1 às 6h (BRT)
exports.monthlyRecurrence = onSchedule(
  { schedule: '0 6 1 * *', timeZone: TZ, region: REGION },
  async () => {
    const today = brNow();
    const curMk = mk(today);
    const prevD = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const prevMk = mk(prevD);

    const snap = await db.ref('gastos').get();
    const all = snap.val() || {};
    const entries = Object.entries(all);

    const prevRecorr = entries.filter(([, g]) =>
      g.recorr && g.recorr !== 'nunca' &&
      (g.mk === prevMk || (!g.mk && (g.date || '').indexOf(prevMk) === 0))
    );

    const curKeys = {};
    entries.forEach(([, g]) => {
      if (g.mk === curMk && g.auto) {
        curKeys[`${g.desc || g.name || ''}|${g.cat}`] = true;
      }
    });

    let count = 0;
    for (const [, g] of prevRecorr) {
      const key = `${g.desc || g.name || ''}|${g.cat}`;
      if (curKeys[key]) continue;
      await db.ref('gastos').push({
        desc: g.desc || g.name || '', val: g.val, cat: g.cat,
        who: g.who, recorr: g.recorr, mk: curMk, ts: Date.now(), auto: true
      });
      count++;
    }

    logger.info(`[monthlyRecurrence] ${count} gastos lançados`);
    if (count > 0) {
      await pushAll('💸 Gastos recorrentes lançados', `${count} item(s) duplicado(s) para ${curMk}`, 'recorr-' + curMk);
    }
  }
);

// ─────── 2. LEMBRETES DIÁRIOS ───────────────────────────────────────────
// Roda todo dia às 8h (BRT)
exports.dailyEventReminders = onSchedule(
  { schedule: '0 8 * * *', timeZone: TZ, region: REGION },
  async () => {
    const today = brNow();
    const todayStr = dk(today);
    const tmr = new Date(today);
    tmr.setDate(tmr.getDate() + 1);
    const tmrStr = dk(tmr);

    const snap = await db.ref('events').get();
    const evs = snap.val() || {};

    const todayEvs = [];
    const tmrEvs = [];
    Object.values(evs).forEach(ev => {
      if (!ev || !ev.name || !ev.date) return;
      if (ev.date === todayStr) todayEvs.push(ev);
      else if (ev.date === tmrStr) tmrEvs.push(ev);
    });

    if (todayEvs.length) {
      const names = todayEvs.map(e => e.name).join(', ');
      await pushAll(`🎉 Hoje: ${names}`, 'Não esqueçam de celebrar 💕', 'ev-today-' + todayStr);
    }
    if (tmrEvs.length) {
      const names = tmrEvs.map(e => e.name).join(', ');
      await pushAll(`📅 Amanhã: ${names}`, 'Lembrete pra preparar algo especial 💕', 'ev-tmrw-' + tmrStr);
    }

    logger.info(`[dailyEventReminders] hoje=${todayEvs.length} amanhã=${tmrEvs.length}`);
  }
);

// ─────── 3. NOTIFICAÇÃO ENTRE PARCEIROS ────────────────────────────────
// Quando alguém escreve em /notif_triggers/<nome>, manda push pra esse nome
exports.onNotifTrigger = onValueCreated(
  { ref: '/notif_triggers/{toName}', region: REGION },
  async (event) => {
    const toName = event.params.toName;
    const data = event.data.val() || {};
    const title = data.title || 'Nós Dois 💕';
    const body  = data.body  || '';
    const tag   = data.type ? `t-${data.type}-${data.ts || Date.now()}` : undefined;

    try {
      await pushTo(toName, title, body, tag);
    } finally {
      // remove o trigger pra não acumular
      await event.data.ref.remove().catch(() => {});
    }
  }
);

// ─────── 4. LIMPEZA ─────────────────────────────────────────────────────
// Remove triggers antigos toda madrugada
exports.cleanupOldNotifs = onSchedule(
  { schedule: '15 4 * * *', timeZone: TZ, region: REGION },
  async () => {
    const cutoff = Date.now() - (3 * 24 * 60 * 60 * 1000); // 3 dias
    const snap = await db.ref('notif_triggers').get();
    const all = snap.val() || {};
    const updates = {};
    Object.entries(all).forEach(([k, v]) => {
      if (!v || !v.ts || v.ts < cutoff) updates[k] = null;
    });
    if (Object.keys(updates).length) {
      await db.ref('notif_triggers').update(updates);
      logger.info(`[cleanupOldNotifs] removidos: ${Object.keys(updates).length}`);
    }
  }
);

// ─────── 5. LIXEIRA — APAGA APÓS 30 DIAS ───────────────────────────────
exports.cleanupTrash = onSchedule(
  { schedule: '30 4 * * *', timeZone: TZ, region: REGION },
  async () => {
    const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 dias
    const snap = await db.ref('_trash').get();
    const all = snap.val() || {};
    let removed = 0;
    for (const [type, items] of Object.entries(all)) {
      const updates = {};
      Object.entries(items || {}).forEach(([id, v]) => {
        if (!v || !v._deletedAt || v._deletedAt < cutoff) {
          updates[id] = null;
          removed++;
        }
      });
      if (Object.keys(updates).length) {
        await db.ref(`_trash/${type}`).update(updates);
      }
    }
    logger.info(`[cleanupTrash] removidos: ${removed}`);
  }
);

// ─────── 6. BACKUP SEMANAL ─────────────────────────────────────────────
// Toda domingo 3h BRT, snapshot completo do DB → Storage /backups/YYYY-MM-DD.json
// Mantém os últimos 8 (≈2 meses).
exports.weeklyBackup = onSchedule(
  { schedule: '0 3 * * 0', timeZone: TZ, region: REGION, memory: '512MiB' },
  async () => {
    const snap = await db.ref('/').get();
    const data = snap.val() || {};
    const today = brNow();
    const ymd = dk(today);
    const filename = `backups/${ymd}.json`;
    const bucket = storage.bucket();
    const file = bucket.file(filename);
    await file.save(JSON.stringify(data, null, 2), {
      contentType: 'application/json',
      metadata: { metadata: { createdAt: String(Date.now()), kind: 'auto-backup' } }
    });
    logger.info(`[weeklyBackup] salvo: ${filename}`);

    // retenção: mantém 8 mais novos
    const [files] = await bucket.getFiles({ prefix: 'backups/' });
    const sorted = files
      .filter(f => f.name.endsWith('.json'))
      .sort((a, b) => b.name.localeCompare(a.name));
    const toDelete = sorted.slice(8);
    for (const f of toDelete) {
      try { await f.delete(); logger.info(`[weeklyBackup] removido antigo: ${f.name}`); }
      catch(e) { logger.warn(`falha ao remover ${f.name}:`, e.message); }
    }
  }
);
