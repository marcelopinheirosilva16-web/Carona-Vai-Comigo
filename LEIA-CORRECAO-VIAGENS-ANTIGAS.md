# Correção de viagens antigas na busca do passageiro

A busca em `js/passageiro.js` agora ignora viagens marcadas como ocultas e viagens cuja data/hora já passou, mesmo que o status no Firestore continue `aberta`.

## Importante
- Isso é um filtro de exibição, não uma exclusão de dados do Firestore.
- O botão "Remover do histórico" do motorista apenas oculta viagens concluídas do próprio motorista; não exclui documentos.
- Se a viagem ainda estiver `aberta` e for futura, o motorista precisa excluí-la/cancelá-la de verdade para ela deixar de aparecer na busca.
- Atualize os arquivos no servidor e force a atualização da página do passageiro (Ctrl+F5).
- Confira no Firebase Console > Firestore > `viagens` o status e a dataHora do documento, se o problema persistir.
- Esta correção não modifica regras do Firestore, pagamentos, GPS ou notificações.
