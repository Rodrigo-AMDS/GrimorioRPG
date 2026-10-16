# Ficha do aventureiro (visão do Mestre)

> Estado: atual
> Última atualização: 2026-10-16
> Task mais recente: [TASK-20261016-character-equipment-feedback](../../tasks/TASK-20261016-character-equipment-feedback.md)

## Identificação

- **Rota:** `/campanhas/[id]/mestre/personagens/[characterId]`
- **Papel autorizado:** Mestre com permissão de gerenciamento da campanha; a autorização é conferida no servidor.
- **Objetivo:** consultar e editar a ficha estrutural do aventureiro e administrar seus itens.
- **Fonte de design:** referências gerais em `docs/FIGMA.md`; o MCP do Figma não estava disponível na última consulta. Esta spec registra o comportamento existente, sem criar decisões visuais novas.
- **Requisitos relacionados:** `docs/PRODUCT_SPEC.md`, `spec/system/security-and-data.md`.

## Estrutura e conteúdo

A ficha é dividida em Identidade, Condição, Equipamento e Habilidades. A página mostra o nome, classe, nível e espécie do personagem. Identidade contém campos estruturais e atributos; as demais seções aparecem na aba correspondente. Há um comando para salvar a ficha.

Equipamento mostra slots, a mochila do personagem, itens do Arsenal que podem ser adicionados e um cartão de inspeção para detalhes do item. Armas podem ser destinadas aos conjuntos principal ou secundário e a slots de uma ou duas mãos; itens com slot configurado usam esse slot. A ação de desequipar também está disponível na inspeção do item.

## Estados

- **Inicial/carregando:** a rota aguarda sessão, campanha e dados da ficha. A navegação da campanha solicita prefetch da ficha em produção. Não há fallback de carregamento específico documentado nesta rota.
- **Conteúdo disponível:** mostra dados do personagem, listas de usuários ativos e catálogo da campanha, além do inventário.
- **Vazio:** slots sem item exibem “Vazio”; mochila vazia orienta adicionar itens do Arsenal.
- **Erro e recuperação:** falha de uma ação de equipamento restaura o inventário local anterior e exibe aviso de erro. A falha ao carregar a ficha é tratada pelo erro de servidor do Next.js.
- **Ação em andamento/sucesso:** equipar/desequipar atualiza os slots imediatamente, fecha a inspeção, mostra o estado pendente e desabilita controles de equipamento. A confirmação de sucesso aparece quando o servidor conclui a gravação.
- **Sem autorização:** sem sessão redireciona para `/entrar`; campanha ou personagem inexistente resulta em not-found; permissão insuficiente é negada no servidor.

## Interações e regras

- O Mestre altera os dados estruturais e salva a ficha.
- Ao equipar, o cliente faz atualização otimista; uma falha restaura o snapshot anterior.
- A ação no servidor valida sessão, permissão de gerenciamento, campanha, personagem, item e slot. Slots incompatíveis são liberados e o equipamento novo é persistido na mesma transação.
- Ao desequipar, o servidor valida o mesmo escopo e limpa o slot. Nenhuma revalidação completa da rota é necessária para concluir essas duas ações.
- O estado final de equipamento é confirmado após recarregar a ficha. A confirmação depende da disponibilidade do banco remoto.

## Dados e autorização

- **Dados lidos/escritos:** personagem, atributos e overrides, habilidades, itens do personagem, modelos do Arsenal, usuários ativos e imagens relacionadas.
- **Escopo de campanha/personagem:** consultas de item e personagem incluem campanha e personagem da rota.
- **Checagem no servidor:** `currentSession` e `requireCampaignAccess(..., "manage")` antes da persistência.
- **Arquivos/broadcasts envolvidos:** imagens são servidas por rota de asset privada e autorizada por campanha; esta tela não documenta broadcasts.
- **Dados que nunca podem ir ao cliente:** senha, hashes e segredos do Mestre.

## Requisitos de qualidade

- Acessibilidade e teclado: ações são controles de botão; avisos usam `status` ou `alert`.
- Responsividade: comportamento visual responsivo ainda precisa de conferência no Figma/navegador em larguras alvo.
- Desempenho percebido/medido: equipamento atualiza visualmente antes da resposta remota. Requisições locais à ficha variaram de 1,7 a 6,5 s e ações de equipamento de 2,9 a 3,2 s nas medições de desenvolvimento; a conexão com o banco falhou intermitentemente depois. Consulte `docs/PERFORMANCE.md`.
- Testes e verificações: `npx tsc --noEmit`; `npm test`; navegação e equipar/desequipar verificados no navegador. Testes de autorização entre campanhas e sigilo de assets continuam obrigatórios conforme `AGENTS.md`.

## Decisões pendentes e limitações

- Investigar a disponibilidade/latência do banco remoto e reduzir o tempo até a ficha completa aparecer. O prefetch explícito da rota é mais efetivo em produção; `next dev` não reproduz esse ganho.
- Rever estados de carregamento e responsividade junto à referência Figma disponível.

## Histórico

| Data | Task | Mudança entregue |
|---|---|---|
| 2026-10-16 | TASK-20261016-character-equipment-feedback | Atualização otimista, fechamento do cartão, aviso de resultado e prefetch da ficha. |
