# Guia Capacitor + Android Studio do zero

Tempo total: 1-2 horas na primeira vez. Depois é só `npm run cap:sync` e clicar Run.

---

## 📦 Parte 1 — Instalar as ferramentas

### 1.1 Node.js

Se ainda não tem:
1. https://nodejs.org → baixa o **LTS** (botão verde)
2. Instala (Next, Next, Next)
3. Confirma no Prompt de Comando: `node --version` → deve mostrar `v20.x.x` ou superior

### 1.2 Java JDK 17

Capacitor 6 exige Java 17.

1. https://adoptium.net/ → baixa **Temurin 17 LTS** pro Windows (`.msi`)
2. Instala marcando "Set JAVA_HOME" e "Add to PATH"
3. Confirma: `java -version` → deve mostrar `17.x.x`

### 1.3 Android Studio

1. https://developer.android.com/studio → baixa
2. Instala com **Standard installation** (~3GB)
3. Abre o Android Studio. No primeiro boot ele baixa o Android SDK (~2GB) — deixa baixar tudo
4. Quando carregar, vai em **More Actions → SDK Manager**
5. Aba **SDK Platforms** → marca **Android 14 (API 34)**
6. Aba **SDK Tools** → confirma que estes estão instalados:
   - Android SDK Build-Tools
   - Android SDK Command-line Tools
   - Android SDK Platform-Tools
   - Android Emulator (opcional, se for testar sem celular físico)
7. **Apply** → aguarda baixar

### 1.4 Variáveis de ambiente (Windows)

Procura "**Editar variáveis de ambiente**" no menu Iniciar → **Variáveis de Ambiente** → na seção **Variáveis do usuário**:

- Cria `ANDROID_HOME` apontando pra `C:\Users\<você>\AppData\Local\Android\Sdk`
- Cria `JAVA_HOME` apontando pra onde o JDK foi instalado (ex: `C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot`)
- Edita a variável `Path` e adiciona:
  - `%ANDROID_HOME%\platform-tools`
  - `%ANDROID_HOME%\cmdline-tools\latest\bin`
  - `%JAVA_HOME%\bin`

Reabre o Prompt de Comando e confirma: `adb --version` deve funcionar.

---

## 🔥 Parte 2 — Configurar Firebase pro Android

Pra push notifications nativas funcionarem.

### 2.1 Adicionar app Android no Firebase Console

1. https://console.firebase.google.com → projeto **YOUR_PROJECT**
2. **Project Settings** (engrenagem no canto)
3. Aba **General** → role até **Your apps**
4. Clica no ícone do **Android** (robôzinho verde)
5. **Android package name:** `com.nosdois.app` *(tem que ser exatamente esse — é o que tá no `capacitor.config.json`)*
6. **App nickname:** Nós Dois
7. **Debug SHA-1** (opcional agora, pula)
8. **Register app**
9. **Download google-services.json** — guarda esse arquivo, vai precisar logo

### 2.2 Habilitar Cloud Messaging API

1. Ainda em Project Settings → aba **Cloud Messaging**
2. Se aparecer "Cloud Messaging API (V1)" como **Enabled**, beleza
3. Se aparecer "Cloud Messaging API (Legacy)" como **Disabled**, ignora (V1 é o que importa)

---

## 🚀 Parte 3 — Setup do projeto

Abre o Prompt de Comando e navega até a pasta do projeto:

```bash
cd "A:/Nois Dois"
```

### 3.1 Instalar as dependências

```bash
npm install
```

(Demora uns 2-5 minutos na primeira vez)

### 3.2 Criar a pasta android/

```bash
npm run cap:add
```

Isso roda 2 coisas:
1. `node scripts/build-capacitor.mjs` — copia os arquivos web pra `www/`
2. `npx cap add android` — cria a pasta `android/` com o projeto Android Studio

Se der certo, aparece:
```
✔ create android project
✔ Sync finished in X.XXs
```

### 3.3 Colocar o google-services.json

Pega aquele arquivo que você baixou no passo 2.1.9 e cola em:
```
A:\Nois Dois\android\app\google-services.json
```

### 3.4 Configurar o gradle pra usar o google-services

Abre `android/build.gradle` (raiz do projeto Android, **não** o `android/app/build.gradle`):

Procura a seção `buildscript { dependencies { ... } }` e adiciona uma linha:

```gradle
buildscript {
    dependencies {
        // outras linhas que já estão aí...
        classpath 'com.google.gms:google-services:4.4.2'
    }
}
```

Depois abre `android/app/build.gradle` (esse sim) e adiciona **no fim do arquivo** (depois de tudo):

```gradle
apply plugin: 'com.google.gms.google-services'
```

### 3.5 Adicionar som de notificação (opcional mas recomendado)

Veja [`android-resources/README.md`](android-resources/README.md). Resumo:

1. Baixa um `.wav` curto (1-3s)
2. Cria a pasta `android/app/src/main/res/raw/`
3. Coloca o arquivo lá com nome `notification.wav` (lowercase)

### 3.6 Sincronizar tudo

```bash
npm run cap:sync
```

---

## 🔨 Parte 4 — Buildar o APK

### 4.1 Abrir no Android Studio

```bash
npm run cap:open
```

Vai abrir o Android Studio com o projeto carregado. **Aguarda o Gradle terminar de sincronizar** (canto inferior direito mostra a barra de progresso) — pode demorar 5-10 minutos na primeira vez.

Se aparecer popup pedindo pra atualizar Gradle ou plugins, aceita.

### 4.2 Conectar o celular

**Opção A — celular físico:**
1. No celular: **Configurações → Sobre o telefone** → toca 7x em "Número da versão" pra liberar Opções de Desenvolvedor
2. Em **Opções de Desenvolvedor** → ativa **Depuração USB**
3. Conecta o cabo USB no PC
4. No celular vai aparecer um pop-up perguntando se permite — **Permitir**

**Opção B — emulador:**
1. No Android Studio: **Tools → Device Manager → Create Virtual Device**
2. Escolhe um Pixel 6 → API 34 → Finish

### 4.3 Rodar (debug)

No Android Studio, no topo:
1. Selecione o dispositivo no dropdown (seu celular ou emulador)
2. Clique no botão **▶ Run** (triângulo verde)

O app vai compilar (~2 min) e abrir direto no celular. Pronto.

### 4.4 Gerar APK pra instalar manualmente (release)

Quando estiver tudo funcionando e quiser instalar fora do Android Studio:

#### Gerar a chave de assinatura (uma vez só):

```bash
cd "A:/Nois Dois/android"
keytool -genkey -v -keystore release.keystore -alias nosdois -keyalg RSA -keysize 2048 -validity 10000
```

Vai pedir senha (escolhe uma e **guarda**). Vai pedir nome, organização etc — preenche qualquer coisa.

#### Buildar o APK assinado:

No Android Studio: **Build → Generate Signed Bundle / APK → APK**
- Key store path: `A:\Nois Dois\android\release.keystore`
- Key alias: `nosdois`
- Senha: a que você definiu
- Build variant: `release`
- Signature versions: ✓ V1 e ✓ V2
- **Finish**

O APK fica em `android/app/release/app-release.apk`. Manda pelo WhatsApp pro celular dela e instala.

---

## 🔄 Parte 5 — Workflow de update

Quando você mexer em `index.html`, `app.js`, `app.css`, etc:

```bash
cd "A:/Nois Dois"
npm run cap:sync
```

Depois no Android Studio: **Run** novamente. Pronto.

Pra version do APK pra distribuir, gera novo APK assinado (passo 4.4).

---

## 🧪 Parte 6 — Testando os recursos nativos

### Biometria
1. Faz login com email + senha
2. Aparece o popup "Quer entrar com digital nas próximas vezes?" → **OK**
3. Mata o app (swipe nos recentes)
4. Reabre → aparece prompt de biometria automaticamente

### Câmera nativa
- Vai em **Galeria → 📸 +** → vai aparecer um diálogo "Tirar foto agora?" → câmera nativa abre

### Push notifications
1. Login no celular A
2. Login no celular B
3. No A: manda mensagem no chat
4. B recebe push (mesmo com app fechado), com som customizado

### Haptics
- Toque em qualquer botão — vibração mais sutil/refinada que `navigator.vibrate`

---

## 🐛 Troubleshooting comum

| Problema | Solução |
|---|---|
| `JAVA_HOME is not set` | Configura variável de ambiente (passo 1.4) |
| `SDK location not found` | Cria arquivo `android/local.properties` com `sdk.dir=C:\\Users\\<você>\\AppData\\Local\\Android\\Sdk` |
| Gradle sync falha com erro de versão Java | Confirma que JDK é 17, não 21 ou 11 |
| `google-services.json missing` | Refazer passo 3.3 |
| Push não chega | Confirma que o `google-services.json` é do mesmo `package_name` (`com.nosdois.app`) |
| Biometria não pede | Confirma que o celular tem digital cadastrada nas configs do Android |
| App abre branco | Confirma que `npm run cap:sync` foi executado depois das mudanças |
| Erro "duplicate class" | Em `android/build.gradle` aumenta `minSdkVersion` pra 23 ou superior |

---

## 📂 O que NÃO commita no git

Tudo já tá em `.gitignore`:
- `node_modules/`
- `android/` (gerado, dá pra recriar)
- `www/` (gerado)
- `*.keystore` (NUNCA commita keystore)

Mantenha o **keystore + senha em backup separado** (Drive, gerenciador de senhas, etc). Se perder, vai ter que publicar como "novo app" se um dia distribuir.
