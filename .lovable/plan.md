# Segundo admin (editor) com fluxo de aprovação

## Como vai funcionar

- **Você (aprovador)**: continua com acesso total — cria, edita, publica, aprova e rejeita.
- **Novo admin (editor)**: login próprio (email + senha). Pode criar e editar eventos, mas tudo que ele salvar entra como **pendente** e não aparece no site.
- **Site público**: mostra apenas eventos com status **aprovado**.
- **Painel de revisão**: nova aba "Aprovações" no admin, visível só para você, listando os pendentes com botões **Aprovar** e **Rejeitar** (com campo opcional de motivo).
- **Estados**: `pendente`, `aprovado`, `rejeitado`. O editor vê o status e o motivo da rejeição nos eventos dele e pode corrigir e reenviar (volta para pendente).
- **Aviso de pendências**: um contador (badge vermelho) na aba "Aprovações" mostrando quantos eventos aguardam sua análise, mais um aviso no topo do painel ao entrar. Notificação por email fica de fora nesta etapa (posso adicionar depois se quiser).

## Mudanças no banco

- Novo papel `editor` no tipo de papéis existente.
- Na tabela de eventos: campos `status` (padrão `pendente`), `criado_por`, `motivo_rejeicao`, `revisado_em`, `revisado_por`.
- Todos os eventos que já existem hoje viram `aprovado`, para nada sumir do site.
- Regras de acesso:
  - Leitura pública: só eventos `aprovado`.
  - Admin e editor autenticados: veem todos.
  - Editor: pode inserir/editar, mas nunca gravar status diferente de `pendente` (garantido por gatilho no banco, não só pela interface).
  - Só admin aprova, rejeita e apaga.

## Mudanças no código

- `src/types/index.ts`: campos de status no tipo `Evento`.
- `src/contexts/DBContext.tsx`: filtrar eventos aprovados para o site público; expor lista completa para o admin.
- `src/pages/Admin.tsx`: aceitar login de `admin` ou `editor`, guardar o papel em estado, esconder ações restritas do editor, nova aba "Aprovações" (só admin) com contador.
- Novo `src/pages/admin/TabAprovacoes.tsx`: lista de pendentes com aprovar/rejeitar + motivo.
- Formulário de evento: mostra o status atual e o motivo da rejeição quando houver.

## O que você precisa fazer depois

Criar a conta do segundo admin (email/senha) e me avisar o email — eu atribuo o papel `editor` a ele.
