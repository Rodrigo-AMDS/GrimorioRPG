# TASK-20261016-project-workflow

- **Status:** Concluída
- **Área/tela:** Processo geral do projeto e documentação
- **Responsável pela integração:** Codex
- **Specs afetadas:** Estrutura de specs, tela da ficha e banco/autorização
- **Origem/decisão:** pedido para organizar agents, specs e tasks; criar padrão de especificação de tela; manter uma task por entrega e um commit por task; deixar o push para o usuário.

## Objetivo

Criar uma estrutura pequena e repetível para documentar responsabilidades, comportamento do produto e entregas.

## Escopo

### Inclui

- Diretórios `agents/`, `spec/` e `tasks/`.
- Modelo de spec de tela e uma spec inicial para a ficha alterada recentemente.
- Specs globais para banco e segurança/dados.
- Regras de task, commit e push no `AGENTS.md`.
- Preparar a base Git local e apontar para o remoto sem publicar alterações.

### Não inclui

- Push para o GitHub.
- DDL ou alteração do banco remoto.
- Mudar stack, requisitos aprovados ou decisões de design.

## Critérios de aceite

- [x] Papéis e fluxo de uso estão descritos em `agents/`.
- [x] Modelo de spec descreve comportamento, autorização, dados, estados e qualidade.
- [x] Specs globais separam responsabilidades de tela, banco e segurança.
- [x] A spec de ficha reflete as mudanças já entregues.
- [x] Tasks futuras têm modelo, status, critérios, verificações e commit.
- [x] Repositório local consegue criar commits de task sem incluir `.env`.
- [x] Nenhum push é feito.

## Plano e decisões

As referências gerais aprovadas continuam em `docs/PRODUCT_SPEC.md` e `docs/FIGMA.md`; specs novas detalham a aplicação desses requisitos. O diretório local não tinha `.git`, então o código existente precisa ser preservado ao montar o histórico com o remoto que contém README e LICENSE.

## Verificações

- `git ls-remote --heads`: confirmou a branch remota `main`.
- `git status` e `git diff --cached`: revisados antes do commit; `.env` e artefatos gerados são ignorados.
- Não foi executado push.

## Entrega

- **Commit:** `docs: establish project task workflow` (hash no `git log`).
- **Observações/limitações:**
