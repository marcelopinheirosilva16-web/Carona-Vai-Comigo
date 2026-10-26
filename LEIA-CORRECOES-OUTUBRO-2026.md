# VaiComigo — correções de teste

1. Abra `passageiro.html`: a seção **Minhas solicitações — alterar vagas** foi adicionada. Alterações em solicitações aceitas aparecem na área do motorista ao abrir **Gerenciar solicitações**. Não há push notification: a atualização é consultada ao abrir a lista.
2. Motorista: **Iniciar viagem** exige ao menos uma solicitação aceita. A checagem é no navegador; para produção, exigir validação também em backend confiável antes da mudança de status.
3. Depois de concluída a viagem, o passageiro escolhe a forma de pagamento. Quando o motorista confirma recebimento, aparece **Pagamento finalizado** e **Excluir do meu histórico**. Exclusão é ocultação, não apaga registros.
4. Publique o conteúdo de `firestore.rules` no Firebase Console > Firestore Database > Regras > Publicar. Faça backup antes.
5. Recarregue as páginas com Ctrl+F5. Teste com duas contas diferentes, primeiro como motorista e depois como passageiro.
6. Ambiente de testes: não use dinheiro real. Ainda é necessária auditoria das regras, transações e segurança antes de produção.
