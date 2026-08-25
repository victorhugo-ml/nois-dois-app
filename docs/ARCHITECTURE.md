# Arquitetura atual

Este documento descreve a estrutura técnica do repositório. O contexto de autoria e o papel central da IA generativa na implementação estão registrados no [`README.md`](../README.md).

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

### Autenticação e sessão
`services/auth.js` centraliza normalização de e-mail, allowlist, login, observação de sessão, reset de senha, usuário atual, validação da senha, logout e limpeza do estado local relacionado à sessão.

A interface deixa de chamar Firebase Auth diretamente. O `app.js` passa a depender da API `window.__auth`, reduzindo acoplamento entre componentes React e infraestrutura.

### Backend
`functions/index.js` contém Cloud Functions executadas no ambiente Firebase/Node.js.

### PWA
`firebase-messaging-sw.js` e `manifest.webmanifest` suportam instalação, cache e notificações.

### Android
`capacitor-bridge.js`, `capacitor.config.json` e os scripts em `scripts/` fazem a ponte entre a aplicação web e APIs nativas.

## Compatibilidade durante a migração

```text
window.__ALLOWED_USERS
window.__fb
window.__fcm
window.__auth
```

Cada PR extrai uma responsabilidade e preserva o comportamento existente.

## Testes

`tests/auth-service.test.js` cobre a nova camada com mocks simples, sem acessar Firebase real.

## Próximas extrações sugeridas

1. separar acesso ao banco por domínio;
2. extrair notificações;
3. modularizar funcionalidades estáveis do `app.js`;
4. ampliar testes para serviços e regras críticas.
