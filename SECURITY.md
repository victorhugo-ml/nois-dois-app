# Security

## Antes de publicar ou fazer deploy

- Não comite senhas, tokens privados, service-account JSON ou chaves administrativas.
- Revise `database.rules.json` e `storage.rules`.
- Use somente contas de teste em uma versão pública.
- Caso dados pessoais tenham sido publicados anteriormente, remova-os da versão atual e considere reescrever o histórico Git antes de tornar o repositório público.
- Restrinja a Firebase API key aos domínios/APIs apropriados no Google Cloud quando aplicável.
- Valide regras com Firebase Emulator Suite antes de alterações em produção.
- Instale dependências pelo `package-lock.json` e execute `npm run audit:deps` antes de publicar uma build. O override de `uuid` corrige a dependência transitiva legada usada pelo utilitário `xcode` do Capacitor CLI; valide novamente a geração nativa ao alterar esse override.

## Biometria

A integração nativa usa `@capgo/capacitor-native-biometric` 8.6.6 ou superior, que contém a correção para o advisory `GHSA-vx5f-vmr6-32wf`. As credenciais são armazenadas com `BIOMETRY_CURRENT_SET`, exigem autenticação nova em cada leitura (`authValidityDuration: 0`) e são recuperadas somente por `getSecureCredentials()`, vinculando o prompt à chave criptográfica no Android.

Não reduza a versão do plugin nem substitua esse fluxo por `verifyIdentity()` seguido de `getCredentials()`. Depois de atualizar uma instalação antiga, o usuário deve entrar com senha e ativar a biometria novamente. Valide ativação, login, cancelamento, alteração das biometrias cadastradas e logout em um dispositivo Android antes de distribuir o aplicativo.
