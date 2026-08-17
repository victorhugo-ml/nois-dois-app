# Arquitetura atual

## Objetivo da refatoração

O projeto cresceu rapidamente durante a prototipação e concentrou muitas responsabilidades em poucos arquivos. A estratégia escolhida para o portfólio é **refatoração incremental**, mantendo o comportamento existente enquanto responsabilidades estáveis são extraídas para módulos menores.

## Camadas

### Interface
`index.html`, `app.js` e `app.css` concentram a experiência web.

### Configuração pública
`config/public-config.js` contém apenas placeholders e contas fictícias da versão de portfólio.

A configuração real do Firebase permanece fora do repositório público.

### Integração Firebase
`services/firebase.js` inicializa Firebase Authentication, Realtime Database, Storage e Cloud Messaging e mantém os adaptadores `window.__fb` e `window.__fcm` consumidos pelo código legado.

Essa camada foi a **primeira extração da refatoração**: antes, inicialização, configuração e helpers do Firebase estavam diretamente em `index.html`.

### Backend
`functions/index.js` contém Cloud Functions executadas no ambiente Firebase/Node.js.

### PWA
`firebase-messaging-sw.js` e `manifest.webmanifest` suportam instalação, cache e notificações.

### Android
`capacitor-bridge.js`, `capacitor.config.json` e os scripts em `scripts/` fazem a ponte entre a aplicação web e APIs nativas.

## Compatibilidade durante a migração

A primeira etapa não altera as APIs globais já utilizadas por `app.js`.

```text
window.__ALLOWED_USERS
window.__fb
window.__fcm
```

Isso permite reduzir acoplamento gradualmente sem reescrever milhares de linhas de uma só vez.

## Próximas extrações sugeridas

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

Prioridades:

1. separar autenticação e sessão;
2. separar acesso ao banco por domínio;
3. extrair notificações;
4. modularizar funcionalidades estáveis do `app.js`;
5. adicionar testes para serviços e regras críticas.

A proposta continua incremental: **extrair, testar, preservar comportamento e só então avançar para a próxima responsabilidade**.
