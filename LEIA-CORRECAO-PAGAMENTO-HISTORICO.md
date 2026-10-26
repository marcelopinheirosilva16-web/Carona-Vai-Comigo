VaiComigo — correção do histórico após pagamento

O botão Remover do meu histórico só aparece quando pagamentosPassageiro/{solicitacaoId}.status == recebido, isto é, quando o motorista confirma o recebimento.
O clique também consulta novamente o Firestore para impedir a remoção com status desatualizado.
A remoção oculta a solicitação do passageiro e preserva registros financeiros.
Se o motorista confirmar o pagamento enquanto a página estiver aberta, atualize a página para liberar o botão.
A proteção implementada é de interface; para segurança de produção, regras do Firestore também precisam impedir ocultação antecipada.
