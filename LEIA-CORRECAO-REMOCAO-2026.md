# Correção — Remover do histórico

## Passageiro
Viagens concluídas têm botão **Remover do meu histórico**, inclusive quando o pagamento ainda está pendente. A remoção atualiza apenas `solicitacoes.ocultadaPassageiro=true`, sem excluir a viagem nem o pagamento do Firestore. Solicitações pendentes continuam com a ação de cancelar e remover. Canceladas não aparecem na lista de alterações.

## Motorista
Viagens concluídas têm botão **Remover do histórico**. A ação atualiza `viagens.ocultadaMotorista=true` sem apagar os registros.

## IMPORTANTE — Firebase
**É necessário publicar as regras atualizadas do arquivo `firestore.rules` no Console Firebase → Firestore Database → Regras → Publicar.** Caso contrário, o Firestore pode retornar `permission-denied` na remoção do passageiro. Antes de publicar, compare com as regras atualmente implantadas para não sobrescrever alterações posteriores.

## Testes
1. Teste com contas distintas de motorista e passageiro.
2. Conclua uma viagem e, no passageiro, clique em Remover do meu histórico.
3. Atualize a página: a viagem não deve reaparecer.
4. No motorista, clique em Remover do histórico e atualize.
5. Confira no Firebase se a viagem, a solicitação e os registros financeiros continuam disponíveis.

Esta alteração não apaga permanentemente documentos, nem altera o status de pagamento. Não houve teste com conexão ao Firebase real.
