# Fundação: autenticação, campanhas e permissões

## Escopo entregue

- Estrutura Next.js/TypeScript para a plataforma em pt-BR.
- Prisma configurado para o esquema local de referência, sem migração aplicada.
- Validação de username e senha; senhas são preparadas para hash bcrypt (custo 12).
- Serviço transacional para criar uma campanha, filiar seu Mestre e gravar auditoria.
- Serviço para vincular jogador ativo, restrito ao proprietário ou Mestre ativo.
- Política reutilizável de acesso por campanha e testes de isolamento entre campanhas.

## Segurança aplicada

Toda ação de domínio deve obter a campanha e a associação do usuário no servidor e chamar `requireCampaignAccess`. Esta fundação não envia dados de campanhas sem vínculo e não depende de controle visual do cliente.

## Banco de dados

Nenhuma migração, `db push`, DDL, reset ou conexão a banco remoto foi executada. O schema continha uma restrição `@@unique([campaignId, kind, participantKey])` com campo inexistente; ela foi removida para permitir a validação do arquivo de referência.

## Comandos de verificação

```powershell
npm install
npm run prisma:validate
npm run prisma:generate
npm test
npm run build
```

Antes de criar uma primeira migração, confirmar o banco-alvo, inspecionar o schema remoto, obter backup e aprovar explicitamente o DDL.
