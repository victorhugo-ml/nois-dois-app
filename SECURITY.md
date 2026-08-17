# Security

## Antes de publicar ou fazer deploy

- Não comite senhas, tokens privados, service-account JSON ou chaves administrativas.
- Revise `database.rules.json` e `storage.rules`.
- Use somente contas de teste em uma versão pública.
- Caso dados pessoais tenham sido publicados anteriormente, remova-os da versão atual e considere reescrever o histórico Git antes de tornar o repositório público.
- Restrinja a Firebase API key aos domínios/APIs apropriados no Google Cloud quando aplicável.
- Valide regras com Firebase Emulator Suite antes de alterações em produção.

## Biometria

A integração nativa usa o armazenamento seguro oferecido pelo plugin biométrico para reutilizar credenciais no dispositivo. Essa área merece revisão específica antes de distribuir o aplicativo para terceiros.
