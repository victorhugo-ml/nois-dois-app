# Nós Dois

Aplicação pessoal multiplataforma para organização compartilhada de rotina, finanças, metas, memórias e eventos.

O projeto começou como uma aplicação web e evoluiu para uma experiência instalável via **PWA** e **Android/Capacitor**, com autenticação, sincronização em tempo real, notificações e recursos nativos.

## Principais funcionalidades

- agenda e lembretes compartilhados;
- registro e recorrência de gastos;
- metas e acompanhamento de progresso;
- diário, bilhetes e galeria;
- autenticação com Firebase Authentication;
- sincronização com Firebase Realtime Database;
- uploads com Firebase Storage;
- notificações web e push nativo;
- Cloud Functions para rotinas automáticas;
- PWA com service worker e cache offline;
- integração Android via Capacitor;
- câmera, haptics, notificações e biometria no app nativo.

## Stack

**Frontend:** JavaScript, React no browser, HTML e CSS  
**Backend/serviços:** Firebase Authentication, Realtime Database, Storage, Cloud Messaging e Cloud Functions  
**Mobile:** Capacitor + Android  
**Runtime das funções:** Node.js 20

## Arquitetura resumida

```text
Web / PWA / Android (Capacitor)
          |
          v
      Frontend
          |
    +-----+------+----------------+
    |            |                |
Firebase Auth  Realtime DB   Firebase Storage
    |            |                |
    +------------+----------------+
                 |
          Cloud Functions
                 |
        Push / rotinas automáticas
```

O frontend mantém a experiência e o estado de interface, enquanto o Firebase fornece autenticação, persistência e sincronização. As Cloud Functions executam tarefas que não devem depender do dispositivo do usuário, como notificações e rotinas recorrentes.


## Privacidade da versão pública

Este repositório contém **somente código e documentação sanitizados**. Mensagens, fotos, diário, dados financeiros, backups e demais conteúdos pessoais da aplicação privada não estão incluídos. Veja [`PRIVACY.md`](PRIVACY.md).

## Segurança e configuração

Esta versão do repositório foi preparada para publicação e **não contém os identificadores pessoais nem a configuração do projeto Firebase original**.

Antes de executar, substitua os valores `YOUR_*` encontrados em:

- `index.html`
- `firebase-messaging-sw.js`
- `.firebaserc`
- `database.rules.json`
- `storage.rules`

Nunca publique senhas, credenciais administrativas ou service-account keys.

> A configuração web do Firebase não funciona como uma senha secreta, mas regras de acesso e credenciais administrativas devem continuar protegidas e revisadas antes de qualquer deploy público.

## Executando

Instale as dependências:

```bash
npm install
cd functions && npm install
```

Para preparar/sincronizar o projeto Android:

```bash
npm run cap:sync
```

Para abrir o projeto Android:

```bash
npm run cap:open
```

As instruções adicionais estão em `SETUP.md` e `CAPACITOR-SETUP.md`.

## Decisões de engenharia

O projeto concentra grande parte da interface em `app.js`. Isso funcionou durante a prototipação e evolução rápida do produto, mas a próxima etapa planejada é modularizar o frontend em componentes e serviços menores, separando responsabilidades como:

- autenticação;
- acesso ao Firebase;
- agenda e eventos;
- finanças;
- notificações;
- galeria;
- configurações;
- integração nativa.

Essa refatoração deve melhorar testabilidade, manutenção e legibilidade sem alterar o comportamento do produto.

## Contexto do projeto

Projeto pessoal desenvolvido de forma iterativa com forte uso de ferramentas de IA para acelerar prototipação e implementação. O foco atual é consolidar o entendimento técnico da arquitetura, revisar segurança e evoluir a base de código para uma estrutura mais modular.

## Próximos passos

- modularizar o frontend;
- adicionar testes automatizados para regras e funções críticas;
- separar configuração por ambiente;
- revisar regras do Firebase com emuladores;
- melhorar documentação técnica;
- configurar CI para validações básicas.

## Licença

Projeto pessoal. Consulte o autor antes de reutilizar código ou recursos.
