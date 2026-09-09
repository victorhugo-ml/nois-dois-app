# Nós Dois — Setup

## Etapa 1 — Auth + Rules (obrigatório, faça antes de subir)

### 1. Crie 2 contas no Firebase Console

1. Abra [Firebase Console → YOUR_PROJECT → Authentication](https://console.firebase.google.com/project/YOUR_PROJECT/authentication/providers)
2. Em **Sign-in method**, ative **Email/Password**
3. Em **Users**, clique **Add user** e crie duas contas de teste (Pessoa 1 e Pessoa 2) — escolha uma senha forte

### 2. Edite os emails em 3 lugares

Na sua cópia PRIVADA de deploy, substitua `user1@example.com` e `user2@example.com` pelas contas autorizadas. Não faça isso no repositório público:

- **`config/public-config.js`** (`allowedUsers`) — o valor à direita é a identidade usada pelo aplicativo (`'user1'`, `'user2'`); o arquivo disponibiliza essa configuração em `window.__ALLOWED_USERS`
- **`database.rules.json`** — 2 ocorrências
- **`storage.rules`** — 2 ocorrências

### 3. Deploy das rules

```bash
# instale a CLI uma vez
npm i -g firebase-tools

# login
firebase login

# deploy só das rules (rápido, não mexe em hosting)
firebase deploy --only database,storage
```

### 4. Pronto

Próxima vez que você abrir o app, vai aparecer a tela de login.
Os dados existentes continuam acessíveis após login.

---

---

## Etapa 2 — PWA real

Já está pronto, só publicar. Garanta que estes arquivos estejam publicados na raiz:

- `index.html`
- `manifest.webmanifest`
- `firebase-messaging-sw.js`
- `icon.svg`

No celular, ao abrir no Chrome, vai aparecer "Adicionar à tela inicial" — instala como PWA real (offline, ícone próprio, splash).

---

## Etapa 3 — Cloud Functions (recorrência + lembretes)

**Requer plano Blaze** (pay-as-you-go) no Firebase. Confira preços e cotas antes de publicar. Alertas de orçamento ajudam a acompanhar o consumo, mas não são um limite automático de cobrança.

### Deploy

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

Funções criadas:

| Função | Quando roda | O que faz |
|---|---|---|
| `monthlyRecurrence` | Dia 1 de cada mês, 6h BRT | Duplica gastos recorrentes |
| `dailyEventReminders` | Todo dia 8h BRT | Push pra eventos do dia + amanhã |
| `onNotifTrigger` | Sempre que algo é escrito em `/notif_triggers/<nome>` | Dispara push pro parceiro |
| `cleanupOldNotifs` | Todo dia 4h15 BRT | Remove triggers antigos |
| `cleanupTrash` | Todo dia 4h30 BRT | Apaga itens da lixeira > 30 dias |
| `weeklyBackup` | Domingo 3h BRT | Snapshot do DB no Storage `/backups/` (mantém 8 últimos) |

A lógica equivalente foi removida do client (não dependia mais do app aberto).

---

---

## Etapa 6 — Soft-delete (lixeira)

Já está pronto no app: ao apagar **Diário**, **Galeria**, **Linha do tempo**, **Bilhetes** ou **Cápsulas**, o item vai para `_trash/<tipo>/<id>` no DB com timestamp.

- **UI**: Config → 🗑️ Lixeira — listar, restaurar ou apagar pra sempre.
- **Limpeza automática**: Cloud Function `cleanupTrash` apaga itens > 30 dias.

Outros itens (gastos, compras, eventos, pets, metas etc) continuam com hard-delete — soft-delete está restrito ao que é mais difícil de recriar.

---

## Etapa 5 — Capacitor (APK nativo com biometria, câmera e tudo)

Recursos nativos disponíveis no APK:
- 👆 **Login com biometria** (digital/face) — credenciais salvas no Keystore Android
- 📸 **Câmera nativa direta** em Galeria, Diário e Marcos (escolhe câmera ou galeria)
- 🔔 **Push notifications** com som e vibração customizados
- ✨ **Splash screen nativa** + status bar
- 📳 **Haptics refinado** (não a vibração genérica)
- 🚪 **Botão voltar** do Android tratado pelo app

**Guia completo passo-a-passo (1-2 horas na primeira vez):** [CAPACITOR-SETUP.md](CAPACITOR-SETUP.md)

Resumo do workflow depois de configurado:

```bash
# editar index.html / app.js / app.css
npm run cap:sync       # sincroniza com android/
# clica Run no Android Studio → instala no celular
```

---

## Estrutura de arquivos

```
A:\Nois Dois\
├── index.html               ← shell HTML (110 linhas)
├── app.js                   ← React/lógica
├── app.css                  ← estilos
├── capacitor-bridge.js      ← bridge Capacitor → app (web fallback)
├── manifest.webmanifest     ← PWA
├── firebase-messaging-sw.js ← service worker (PWA + FCM)
├── icon.svg                 ← ícone do app
├── config/
│   └── public-config.js     ← configuração pública e allowlist fictícia
├── services/
│   ├── firebase.js          ← inicialização e adaptadores Firebase
│   └── auth.js              ← autenticação e sessão
├── database.rules.json      ← regras do Realtime Database
├── storage.rules            ← regras do Storage
├── firebase.json            ← config Firebase
├── .firebaserc              ← projeto default
├── package.json             ← Capacitor + scripts
├── capacitor.config.json    ← config Capacitor
├── scripts/
│   └── build-capacitor.mjs  ← copia web → www/
├── android-resources/       ← assets pra colar em android/app/src/main/res/
│   └── README.md            ← como adicionar som de notif + ícones
├── CAPACITOR-SETUP.md       ← guia detalhado Android Studio + Capacitor
├── functions/               ← Cloud Functions
│   ├── index.js
│   ├── package.json
│   └── .gitignore
├── www/                     ← (gerado) bundle pro Capacitor
├── android/                 ← (gerado) projeto Android Studio
└── SETUP.md
```

### O que sobe no Netlify

Apenas: `index.html`, `app.js`, `app.css`, `capacitor-bridge.js`, `manifest.webmanifest`, `firebase-messaging-sw.js`, `icon.svg`, `config/public-config.js`, `services/firebase.js` e `services/auth.js`.
Você pode adicionar um `.netlifyignore`:

```
node_modules
android
functions
scripts
www
*.md
```
