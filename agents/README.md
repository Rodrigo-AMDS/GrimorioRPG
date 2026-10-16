# Agentes do projeto

Este diretório descreve responsabilidades que podem ser usadas para organizar análise e implementação. Ele não habilita delegação automática: só dividir o trabalho entre agentes quando o usuário pedir ou quando as instruções ativas permitirem.

Todo agente lê primeiro o `AGENTS.md`, identifica a task ativa em `tasks/` e consulta as specs relacionadas antes de editar arquivos.

## Papéis

- **Produto e especificação**: transforma pedidos em critérios verificáveis, mantém specs de telas e globais e identifica decisões aprovadas que não podem ser alteradas sem confirmação.
- **Interface**: implementa telas e componentes conforme a spec e o Figma; informa e atualiza a spec quando o comportamento real mudar.
- **Backend e dados**: implementa serviços, queries, ações e alterações de schema; preserva escopo de campanha, autorização e as regras de segurança do banco.
- **Segurança**: revisa autorização, isolamento entre campanhas, mídia privada, sessões e broadcasts; aponta riscos concretos e sugere correções.
- **Qualidade**: define verificações necessárias para critérios de aceite e executa testes relevantes; não substitui os testes de autorização exigidos pelo `AGENTS.md`.
- **Integração**: confere que task, código e specs formam uma entrega consistente, revisa o diff staged e registra o commit da task.

## Colaboração

Uma task pode envolver mais de um papel, mas tem um responsável pela integração e um único commit final. Não criar branches, worktrees, agentes executores ou commits intermediários sem necessidade do fluxo ou pedido do usuário.
