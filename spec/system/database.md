# Banco de dados

> Estado: atual, sujeito à revisão do schema local antes de qualquer alteração.
> Última atualização: 2026-10-16
> Referência: `schema.prisma` e `docs/DATABASE_REVIEW.md`.

## Princípios

- PostgreSQL e Prisma fazem parte da stack proposta; decisões ainda não aprovadas definitivamente devem continuar identificadas como propostas.
- O schema Prisma versionado é ponto de partida. Não presumir que o banco remoto está sincronizado com ele.
- Queries devem aplicar escopo de campanha e autorização. Preferir selecionar somente campos necessários, com joins ou consultas paralelas quando isso não enfraquecer a autorização.
- Modelos do Arsenal são templates; itens no inventário são instâncias relacionadas ao personagem.

## Processo de alteração

1. Ler `docs/DATABASE_REVIEW.md`, `schema.prisma`, migrations existentes e configuração local.
2. Descrever a mudança, compatibilidade, rollback e impacto em dados na task.
3. Validar schema e executar testes antes de alterar o banco.
4. Para DDL remoto, exigir inspeção do schema remoto, backup confirmado e aprovação explícita; as proibições listadas em `AGENTS.md` continuam valendo.
5. Atualizar esta spec, a task e documentação de implementação no mesmo commit.

## Histórico

Nenhuma migration remota é declarada por esta spec. Consulte o estado real do ambiente antes de executar comandos de banco.
