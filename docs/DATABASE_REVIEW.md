# Inspeção do banco remoto

Data da inspeção e aplicação: 12 de outubro de 2026.

A conexão configurada em `.env` foi consultada somente em modo de leitura com `prisma db pull --print`. O banco já contém um sistema distinto, com tabelas de viagens, despesas, participantes e usuários que usam e-mail e senha em campos incompatíveis com a fundação do Grimório.

Após autorização explícita para descartar o trabalho escolar, o schema `public` foi resetado e sincronizado com `schema.prisma` por `prisma db push --force-reset --accept-data-loss`. As tabelas anteriores foram removidas definitivamente.

O schema do Grimório agora é a fonte de verdade do banco. Para preparar o primeiro acesso, defina `INITIAL_GM_USERNAME` e `INITIAL_GM_PASSWORD` no `.env` local e execute `npm run db:seed`.
