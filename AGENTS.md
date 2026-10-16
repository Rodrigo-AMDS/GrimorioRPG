# AGENTS.md — O Grimório do Mestre

Este repositório implementa uma plataforma web de RPG de mesa, com dois papéis: MESTRE (administra campanhas) e JOGADOR (acessa somente campanhas/personagens autorizados). Idioma da interface: pt-BR. Use `docs/PRODUCT_SPEC.md` como fonte de requisitos e `docs/FIGMA.md` como fonte de design. Se houver conflito, peça confirmação antes de alterar uma decisão aprovada.

## Regras inegociáveis
- Autenticação por **nome de usuário e senha**. O Mestre cadastra contas; não exigir e-mail, convites ou autoinscrição.
- Isolamento por campanha e autorização no servidor, incluindo queries, download de arquivos e broadcasts WebSocket. Nunca enviar segredos do Mestre ao cliente do jogador.
- Mestre edita dados estruturais da ficha; jogador usa ações operacionais autorizadas. Suportar múltiplas habilidades por personagem.
- Itens possuem imagens e podem ter documentos anexados, legíveis em visualizador mediante autorização. Modelos do Arsenal distintos de instâncias no inventário. Itens manuais de jogador não concedem bônus mecânicos automaticamente.
- Mapas draft/prepared/published; só versões publicadas acessíveis a jogadores. Névoa é **manual**; movimento de token nunca revela áreas.
- Combate assistido, com aprovação do Mestre quando exigida; idempotência para impedir dupla aplicação. Distinguir rolagens digitais verificadas e rolagens físicas declaradas.
- Teia do Destino/Crônicas privadas do Mestre; publicação seletiva explícita. Mural dos jogadores é separado e suas hipóteses não são automaticamente validadas.
- Chat textual público e sussurros jogador↔Mestre. Sem chat privado jogador↔jogador ou voz na V1.
- D&D 5e revisão 2024; não copiar integralmente textos de livros proprietários. Identificar fontes licenciadas/abertas e pontos pendentes de regra.

## Engenharia
- Stack proposta: Next.js/React/TypeScript; PostgreSQL + Prisma; WebSocket; storage privado para mídia. Não assumir que tecnologias ainda não confirmadas foram aprovadas definitivamente.
- Usar o esquema Prisma v0.2 existente como **ponto de partida**, não como migração validada. Executar validação e testes antes de modificar banco.
- **Nunca executar `prisma db push`, `migrate reset`, DROP/TRUNCATE, nem migrações contra banco remoto sem inspecionar schema, obter backup e aprovação explícita.**
- Nunca colocar senhas, URLs com credenciais, tokens ou arquivos `.env` no código, logs, commits ou respostas. A credencial Aiven foi exposta numa imagem anterior: usar somente a senha rotacionada via secret local.
- Criar testes para autorização cruzada entre campanhas, sigilo de arquivos e idempotência de combate. Documentar alterações e comandos executados.
- Antes de implementar, conferir design no Figma via MCP; se MCP indisponível, pedir acesso ou trabalhar com documentação sem inventar detalhes visuais.

## Fluxo inicial recomendado
1. Inspecionar repositório e arquivos existentes; não sobrescrever código sem revisão.
2. Validar `schema.prisma` localmente e corrigir incompatibilidades.
3. Definir estrutura monorepo e scripts, configurar `.env.example` sem segredos.
4. Confirmar banco remoto e backup antes de qualquer DDL.
5. Implementar autenticação, campanhas, memberships e políticas de autorização com testes.
6. Evoluir em incrementos seguindo `docs/PRODUCT_SPEC.md`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
