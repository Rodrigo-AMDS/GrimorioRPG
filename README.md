# O Grimório do Mestre

Fundação do primeiro módulo: autenticação com nome de usuário e senha, campanhas, jogadores e controle de acesso por campanha.

## Desenvolvimento local

1. Copie `.env.example` para `.env` e preencha apenas credenciais locais.
2. Execute `npm install`.
3. Valide o schema: `npm run prisma:validate`.
4. Gere o cliente Prisma: `npm run prisma:generate`.
5. Para criar o primeiro Mestre, defina as variáveis `INITIAL_GM_*` em `.env` e execute `npm run db:seed`.
6. Execute os testes: `npm test`.
7. Inicie a interface: `npm run dev`.

Não há migração aplicada. Consulte [a documentação de implementação](docs/IMPLEMENTATION_AUTH_CAMPAIGNS.md) antes de conectar a qualquer banco.
