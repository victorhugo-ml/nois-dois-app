# Arquitetura atual

## Camadas

### Interface
`index.html`, `app.js` e `app.css` concentram a experiência web.

### Firebase
O frontend integra Authentication, Realtime Database, Storage e Cloud Messaging.

### Backend
`functions/index.js` contém Cloud Functions executadas no ambiente Firebase/Node.js.

### PWA
`firebase-messaging-sw.js` e `manifest.webmanifest` suportam instalação, cache e notificações.

### Android
`capacitor-bridge.js`, `capacitor.config.json` e os scripts em `scripts/` fazem a ponte entre a aplicação web e APIs nativas.

## Débito técnico principal

`app.js` possui milhares de linhas e múltiplas responsabilidades. Para uma evolução de portfólio, a prioridade é separar o código por domínio e por camada.

Uma possível direção futura:

```text
src/
  app/
  components/
  features/
    agenda/
    finances/
    goals/
    journal/
    gallery/
  services/
    auth/
    database/
    storage/
    notifications/
  native/
```

A proposta é incremental: primeiro extrair serviços e funcionalidades estáveis, depois componentes de interface.
