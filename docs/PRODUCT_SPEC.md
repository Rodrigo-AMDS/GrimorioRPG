# O Grimório do Mestre — Especificação de produto consolidada

## Visão e perfis
Plataforma web de RPG de mesa D&D 5e revisão 2024, múltiplas campanhas, um Mestre administrador e jogadores. O Mestre cadastra contas por username e senha, vincula jogadores às campanhas e aos personagens. Jogador vê na Home apenas campanhas autorizadas; dentro da campanha vê apenas informações e ferramentas a que tem acesso. O Mestre administra campanhas, fichas, bestiário, Arsenal, cartografia, sessões, narrativa e permissões.

## Home e navegação
Home híbrida cinematográfica e funcional, com campanhas como mundos/grimórios e atividade recente. Mestre: Biblioteca dos Mundos → Centro de Comando → ferramentas/sessões. Jogador: Minhas Campanhas → Painel do Aventureiro → ficha, inventário, diário, mural, chat e mesa. Menu lateral recolhível desktop, navegação compacta mobile. Destacar sessão ativa.

## Personagens
Fichas completas 2024: atributos, perícias, salvaguardas, espécie, classe/subclasse, antecedentes, nível, proficiências, PV, CA, iniciativa, deslocamento, ataques, habilidades **ilimitadas**, recursos, magias, equipamento, retrato, narrativa. Diferenciar atributos-base, modificadores permanentes/temporários, equipamento, condições e overrides do Mestre. Jogadores não editam a estrutura da ficha.

## Arsenal e inventário
Catálogo de templates exclusivo do Mestre, instâncias por personagem. Transferência de itens em tempo real, quantidade, peso, valor, raridade, imagem e fallback. Itens abrem uma página/modal de detalhes. Anexos (PDF, documentos, imagens) são abertos para leitura mediante autorização; armazenar arquivos em storage privado, não URL pública permanente. Efeitos de itens estruturados podem alterar stats ao equipar; remover/retirar equipamento reverte o efeito. Itens manuais criados por jogadores são descritivos, sem efeito automático sem aprovação.

## Cartografia e sessão
Importação de mapas, grade configurável, tokens, camadas e névoa manual. Estados draft → prepared → published; jogador só recebe mapas publicados. Névoa por pincel/retângulo/desenho livre, esconder/revelar tudo, undo/redo; mover token **nunca** revela névoa. Dados secretos ocultos não podem ser enviados ao cliente. Tokens vinculados a modelos, mas instâncias independentes por sessão. Jogador move próprio token apenas com permissão. Mesa ao vivo: mapa central, ferramentas à esquerda, contexto à direita, chat/dados/eventos abaixo, controles de sessão acima. Editor top-down realista com terreno, paredes, portas, móveis e props em fase posterior.

## Bestiário, combate e dados
Bestiário do Mestre com templates de monstros, instâncias em encontros. Iniciativa, turnos, rodadas, ataques, dano, cura, condições, recursos, concentração conforme regras suportadas. Combate assistido: sistema propõe resultado; Mestre aprova/edita/rejeita quando arbitragem exigida. Eventos idempotentes e auditáveis. Dados d4/d6/d8/d10/d12/d20/d100; rolagens digitais verificadas pelo servidor e físicas inseridas manualmente, com visibilidade pública, privada ou secreta e histórico.

## Narrativa
Crônicas: wiki rica do Mestre, NPCs, lugares, facções, pistas, segredos, missões, acontecimentos e vínculos com mapas, sessões e itens. Teia do Destino: grafo privado com nós, relações tipadas, backlinks, busca, layout e revisões. Publicação explícita e seletiva de pistas/handouts para jogadores; não publicar segredos por associação. Diário dos Aventureiros: entradas pessoais/compartilhadas/publicadas, autoria e revisões. Mural das Conspirações: cartões e ligações de pistas conhecidas, personagens, locais, teorias e perguntas; hipóteses não são automaticamente confirmadas. Mural separado da Teia privada.

## Comunicação
Sussurro Arcano: chat somente texto, público por campanha e privado jogador↔Mestre; mensagens estruturadas de dados/sistema, filtros e notificações. Sem áudio/voz nem chat privado entre jogadores na V1.

## Segurança e arquitetura
Backend autoritativo para regras, dados, autorização e broadcasts. Isolamento por campanha; validação de membro, papel, proprietário e permissão em todas as leituras/escritas, anexos e canais. Dados secretos nunca enviados a cliente não autorizado. Transações, logs de auditoria, idempotência, rate limiting, backups, acessibilidade, redução de movimento e testes. Stack proposta: Next.js, TypeScript, PostgreSQL, Prisma, WebSocket, storage privado, TipTap/React Flow/Canvas 2D (bibliotecas a validar).

## Entidades conceituais (36)
User, CampaignMember, Campaign, Character, CharacterFeature, CharacterResource, ItemTemplate, ItemInstance, Asset, ItemAttachment, Session, SessionEvent, Map, MapVersion, MapLayer, Token, FogMask, MapAccessGrant, Encounter, Combatant, ActionProposal, DiceRoll, NarrativeNode, NarrativeEdge, NarrativePublication, PublicationRecipient, JournalEntry, JournalRevision, InvestigationCard, InvestigationEdge, ChatChannel, ChatMessage, Notification, AuditEvent, MessageRead, SessionParticipant.

Os nomes são referência conceitual: confrontar com o schema real e corrigir inconsistências antes da migração. Entidades adicionais podem ser necessárias (spells, permissions, conditions etc.).

## Roadmap
1. Fundação: auth, campanhas, memberships, RBAC, auditoria.
2. Fichas 2024 e múltiplas habilidades.
3. Arsenal, instâncias, imagens, anexos privados, inventário.
4. Mesa jogável: mapas publicados, tokens, névoa manual, dados e chat em tempo real.
5. Combate assistido e histórico.
6. Narrativa: Crônicas, Teia, Diário, Mural e publicação seletiva.
7. Editor avançado, performance, responsividade, acessibilidade e operação.

## Decisões ainda pendentes — NÃO inventar
Regras 2024/licenciamento e cobertura de magias, opções homebrew, Mestre pode ler anotações pessoais dos jogadores?, edição colaborativa e conflitos, matriz detalhada de aprovação em combate, descanso/recuperação, exclusão/arquivamento, hospedagem/custos, SLAs, limites de upload, backups e testes. Resolver progressivamente com o usuário.

## Materiais anteriores
Existe um PDF do Livro do Jogador anexado ao projeto ChatGPT; não presumir que Codex possa acessá-lo. Não reproduzir conteúdo integral protegido por direitos autorais.
