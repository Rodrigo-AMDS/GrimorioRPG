# Segurança, autorização e dados

> Estado: atual, derivado das regras aprovadas em `AGENTS.md` e `docs/PRODUCT_SPEC.md`.
> Última atualização: 2026-10-16

## Autenticação

Contas usam nome de usuário e senha. O Mestre cadastra contas; não exigir e-mail, convite ou autoinscrição. Segredos e hashes nunca são expostos ao cliente.

## Autorização e isolamento

- Toda leitura ou escrita de dados da campanha deve estar no escopo da campanha e ser autorizada no servidor.
- Dados de personagem devem estar vinculados à campanha da rota e à membership/owner apropriada.
- Autorização cobre queries, ações, download/visualização de arquivos e broadcasts WebSocket.
- Jogadores acessam somente campanhas e personagens autorizados. Não incluir informação privada do Mestre no payload do jogador.
- Criar testes negativos de acesso cruzado entre campanhas para cada serviço/fluxo afetado.

## Arquivos

Mídia é privada e servida após autenticação e autorização da campanha. Documentos anexados só podem ser lidos no visualizador por usuários autorizados.

## Alterações de banco

O schema Prisma existente é ponto de partida, não migração validada. Antes de DDL: revisar schema e impacto, validar ambiente, obter backup e solicitar aprovação explícita para qualquer alteração remota. Nunca executar `prisma db push`, `migrate reset`, DROP ou TRUNCATE.

## Verificações

Registrar autorização exercitada, testes relevantes e qualquer alteração de schema em `tasks/`. Dados e logs de teste não devem conter senhas, URLs com credenciais ou tokens.
