# TASK-20261016-character-equipment-feedback

- **Status:** Concluída
- **Área/tela:** Ficha do aventureiro, seção Equipamento
- **Responsável pela integração:** Codex
- **Specs afetadas:** [Ficha do aventureiro](../spec/screens/character-sheet.md), [Segurança e dados](../spec/system/security-and-data.md)
- **Origem/decisão:** pedido para tornar a ficha e as ações de equipamento mais rápidas, dar feedback e fechar o cartão após equipar/desequipar.

## Objetivo

Dar resposta imediata ao equipar/desequipar e reduzir a espera na abertura da ficha.

## Escopo

### Inclui

- Atualização otimista do inventário, fechamento do cartão, feedback pendente/sucesso/erro e rollback.
- Ações de servidor com autorização mantida, sem revalidar toda a rota após equipar/desequipar.
- Consultas de autorização e item em paralelo nas ações e prefetch da ficha pelo cartão do aventureiro.
- Registro de medições e limitações encontradas.

### Não inclui

- Alterar a estrutura do banco ou executar DDL.
- Resolver a instabilidade do banco remoto ou garantir tempos de rede.

## Critérios de aceite

- [x] O slot atualiza imediatamente após equipar/desequipar.
- [x] O cartão fecha após a ação.
- [x] A interface exibe pendência, sucesso e erro; falha restaura o estado anterior.
- [x] Permissão de gerenciamento, campanha e personagem continuam validados no servidor.
- [x] A posição salva reaparece após recarregar a ficha.
- [x] A spec da tela e `docs/PERFORMANCE.md` registram comportamento e limitações.

## Plano e decisões

A ação não revalida toda a página. O cliente confia somente no resultado da Server Action; não há cache compartilhado de dados privados. Banco remoto intermitente pode atrasar ou impedir a confirmação.

## Verificações

- `npx tsc --noEmit`: passou.
- `npm test`: 6 testes em 3 arquivos passaram.
- Navegador local: cartão fechou e a atualização otimista apareceu; a posição foi restaurada ao slot anterior após testar.
- Banco remoto: houve falhas intermitentes P1001; numa ação afetada, o cliente mostrou erro e restaurou o estado local. Sem DDL executado.

## Entrega

- **Commit:** `docs: record character equipment task` (registro retroativo após importação inicial; as alterações de código já estavam no baseline sem histórico Git).
- **Observações/limitações:** ficha no ambiente de desenvolvimento variou de 1,7 a 6,5 s. A ação de equipamento depende de conectividade com o banco remoto.
