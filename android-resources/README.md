# Recursos Android adicionais

Após rodar `npm run cap:add android` (que cria a pasta `android/`), copia os arquivos abaixo pros lugares indicados.

## 🔊 Som customizado de notificação

1. Pega um som curto `.wav` (1-3 segundos). Sugestões grátis:
   - https://mixkit.co/free-sound-effects/notification/
   - https://www.zapsplat.com/sound-effect-category/notifications-and-prompts/
2. Renomeia o arquivo pra `notification.wav` (lowercase, sem espaços, sem maiúsculas)
3. Cria a pasta:
   ```
   android/app/src/main/res/raw/
   ```
4. Coloca `notification.wav` lá dentro.

A Cloud Function já tá configurada pra usar esse arquivo (`sound: 'notification'`).
O canal é criado automaticamente pelo `capacitor-bridge.js` no boot.

## 🎨 Ícone da notificação na status bar

O Android exige um ícone monocromático/branco em PNG. Sem ele, aparece um quadrado cinza.

1. Gera um ícone PNG branco com fundo transparente (24x24 mdpi até 96x96 xxxhdpi):
   - Use https://romannurik.github.io/AndroidAssetStudio/icons-notification.html
2. Baixa o ZIP, extrai e copia as pastas `drawable-*` pra:
   ```
   android/app/src/main/res/
   ```
   (vai mesclar com as pastas existentes)

## 🖼️ Splash nativa

Pra um splash bonito (não a tela em branco padrão):

1. Acessa https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
2. Faz upload do `icon.svg` (pasta raiz do projeto)
3. Baixa e extrai
4. Copia a pasta `mipmap-*` pra `android/app/src/main/res/`

Ou use o Capacitor `@capacitor/assets`:
```bash
npm i -D @capacitor/assets
npx capacitor-assets generate --android
```
Mas você precisa ter `assets/icon-only.png` (1024x1024) e `assets/splash.png` (2732x2732) na raiz.

## 🪪 Permissões

O Capacitor já adiciona automaticamente as permissões dos plugins instalados quando você roda `npx cap sync`. Verifique em:
```
android/app/src/main/AndroidManifest.xml
```
Deve conter (entre outras):
- `INTERNET`
- `CAMERA`
- `READ_EXTERNAL_STORAGE` / `READ_MEDIA_IMAGES`
- `USE_BIOMETRIC` / `USE_FINGERPRINT`
- `POST_NOTIFICATIONS` (Android 13+)
- `VIBRATE`
