# Tasks

Cada entrega tem um arquivo `TASK-YYYYMMDD-slug.md`. A task é a unidade de planejamento, revisão e commit. A mensagem do commit fica registrada na task; o hash é consultado no `git log` para evitar criar um segundo commit só para gravar o hash do próprio commit.

## Ciclo obrigatório

1. Criar task antes de editar código, com objetivo, escopo, specs/telas afetadas e critérios de aceite.
2. Marcar `Em andamento` e registrar decisões ou bloqueios concretos.
3. Implementar somente o escopo aceito. Atualizar as specs para refletir o resultado entregue.
4. Fazer as verificações relevantes e anotar comandos e resultados. Para mudanças de tela, conferir interação no navegador quando disponível; para banco, seguir `spec/system/database.md` e `AGENTS.md`.
5. Marcar a task como `Concluída`, preencher a mensagem de commit e revisar `git diff --cached` para excluir segredos e arquivos fora do escopo.
6. Criar **um commit por task**, incluindo código, specs e registro da task. Tasks independentes não compartilham commit.
7. Não fazer push até o usuário pedir. Ao receber autorização para push, enviar os commits locais para o repositório remoto configurado.

## Modelo de task

Copie `TASK-TEMPLATE.md`. IDs usam data local e slug curto. Tasks gerais devem identificar área, por exemplo Banco, Segurança ou Arquitetura. Tasks de tela devem linkar a spec correspondente.

## Status

- `Planejada`: escopo e critérios registrados.
- `Em andamento`: implementação iniciada.
- `Bloqueada`: falta uma decisão ou dependência externa concreta; registrar qual e manter o trabalho independente avançando.
- `Concluída`: critérios atendidos, specs atualizadas, verificações registradas e commit criado.

## Tarefas concluídas

- [TASK-20261016-character-equipment-feedback.md](TASK-20261016-character-equipment-feedback.md)
- [TASK-20261016-project-workflow.md](TASK-20261016-project-workflow.md)
