# Ocultar viagens concluídas — VaiComigo

1. Faça backup do projeto e do arquivo de regras anterior.
2. Abra Firebase Console > Firestore Database > Regras. Substitua pelo conteúdo de `firestore.rules` deste pacote e clique em **Publicar**.
3. Abra a pasta `vaicomigo` no VS Code e execute com Live Server.
4. Entre com a conta do motorista. Em **Minhas viagens**, viagens concluídas terão **Ocultar viagem**.
5. Após confirmar, o documento continua em `viagens` com `status: "concluida"` e `ocultadaMotorista: true`. Solicitações, taxas e pagamentos não são apagados.
6. Para reexibir manualmente, no Firestore altere `ocultadaMotorista` para `false` (somente via console/admin).

A alteração não oculta viagens da área do passageiro: essa área deve continuar mostrando apenas viagens abertas e válidas.

**Atenção:** o arquivo de regras mantém as demais políticas anteriores, inclusive a permissão administrativa de excluir viagens. O painel do motorista não exclui viagens concluídas. Faça testes com contas de motorista, passageiro e administrador antes de publicar em produção.
