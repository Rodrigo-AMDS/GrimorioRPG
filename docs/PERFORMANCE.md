# Desempenho da navegação

## Diagnóstico (16/10/2026)

- Em `next dev`, a primeira visita a uma rota também paga o custo de compilação. Uma abertura de campanha registrou 9,8 s de trabalho do Next.js antes da execução da página.
- Com a rota já compilada, a ficha de personagem registrava 2,4 a 3,8 s de execução no servidor. A página buscava personagem, usuários e catálogo em sequência; o personagem ainda carregava várias relações.
- O banco configurado no ambiente de desenvolvimento é acessado por rede. As leituras continuam sujeitas à latência e à variação dessa conexão.

## Alterações

- Depois da autorização da campanha, a ficha consulta personagem, usuários ativos e catálogo em paralelo. A autorização continua sendo verificada antes dessas consultas.
- O Prisma Client usa `relationJoins` para agregar relações em uma consulta SQL por leitura relacional. É uma funcionalidade Preview do Prisma 6.1; não altera o banco.
- Nenhum conteúdo privado foi colocado em cache compartilhado.

## Verificação

- `npm run prisma:validate` — passou.
- `npm run prisma:generate` — passou.
- `npm test` — 4 testes passaram.
- `npm run build` — passou. A primeira tentativa isolada encontrou um erro de permissão ao atualizar `.next`; a execução fora do isolamento concluiu.
- `npm run lint` — não executou as regras: o repositório ainda não tem `eslint.config.js`, exigido pelo ESLint 9.17.0. Esse problema de configuração já existia antes das alterações de desempenho.
- Navegação real na ficha após reiniciar o servidor — carregou sem erro. Em uma medição com a rota compilada, o servidor respondeu em 987 ms. Essa medição pontual não garante o mesmo tempo em todas as visitas.
- O MCP do Figma não respondeu à consulta. Nenhum detalhe visual novo permanece nesta alteração.

## Correção após uso no navegador

O estado de carregamento adicionado inicialmente foi removido depois que uma aba permaneceu exibindo “Abrindo o arquivo...”. Na reprodução, a campanha respondeu em cerca de 2 segundos e abriu normalmente em uma aba nova. A otimização das consultas permanece; a navegação voltou a usar o comportamento padrão do Next.js.

Nenhuma migração ou comando de alteração do banco foi executado.

## Equipamento e abertura do aventureiro

- O cartão do aventureiro passa a solicitar a ficha antecipadamente em produção por meio do prefetch do Next.js. No servidor de desenvolvimento, a compilação sob demanda ainda pode causar espera.
- Equipar e desequipar atualiza os slots localmente assim que a ação é acionada, fecha a inspeção e exibe o estado de envio. A resposta do servidor confirma o sucesso; em erro, o inventário anterior é restaurado e um aviso é mostrado.
- As ações de equipamento retornam um resultado pequeno e deixam de revalidar toda a ficha. Autenticação, autorização da campanha e escopo do personagem continuam no servidor. Os slots conflitantes são limpos na mesma transação do equipamento.
- `npx tsc --noEmit` passou; `npm test` passou com 6 testes em 3 arquivos. Dois testes novos verificam conflitos entre slots e atualização local ao equipar/desequipar.
- No navegador local, a inspeção fechou e os slots mudaram no primeiro estado após o clique. A confirmação chegou depois, e o item voltou ao slot original após o teste; uma recarga mostrou a posição persistida.
- Nessa execução local, o servidor ainda levou cerca de 2,9–3,2 s para confirmar cada alteração de equipamento; a interface responde antes disso. A ficha completa variou de 1,7 a 6,5 s em requisições de desenvolvimento, principalmente no código da aplicação que consulta o banco remoto.
- Depois, a conexão com o banco remoto falhou de forma intermitente (`P1001`). A tela exibiu a falha ao desequipar e restaurou os slots anteriores, confirmando o tratamento de erro. Não foi possível medir de modo confiável o ganho da leitura paralela nessa condição. O servidor local continua em execução.
