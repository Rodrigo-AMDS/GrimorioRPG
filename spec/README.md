# Specs

As specs descrevem o comportamento aprovado e atual do produto. Uma task altera uma ou mais specs quando seu escopo muda comportamento, conteúdo, fluxo, regra ou contrato técnico.

## Pastas

- `screens/`: uma spec por tela ou fluxo de navegação, criada a partir de `templates/screen-spec.md`.
- `system/`: contratos globais, como arquitetura, autenticação/autorização e banco de dados.
- `templates/`: modelos obrigatórios para manter as specs consistentes.

## Fontes gerais já existentes

- `docs/PRODUCT_SPEC.md`: requisitos e regras de produto aprovadas.
- `docs/FIGMA.md`: links, referências e decisões de design.
- `docs/DATABASE_REVIEW.md`: revisão do schema Prisma e pontos pendentes.

Esses documentos continuam sendo as fontes gerais. As specs em `spec/` detalham como os requisitos se aplicam a uma tela ou sistema. Não copie a fonte inteira; faça links e resuma apenas o que a tela precisa.

## Ciclo de atualização

1. Criar a task em `tasks/` e listar as specs afetadas.
2. Ler a spec atual e os requisitos globais relacionados.
3. Implementar dentro dos critérios aprovados. Se o pedido revelar conflito com uma decisão aprovada, parar essa parte, documentar o conflito e pedir orientação.
4. Atualizar a spec na mesma task, refletindo o comportamento entregue e eventuais limitações conhecidas.
5. Registrar verificações e o commit na task; finalizar tudo em um único commit.

Specs descrevem o comportamento atual, não uma lista de desejos. Ideias futuras ficam em tasks abertas ou numa seção explícita de decisões pendentes.
