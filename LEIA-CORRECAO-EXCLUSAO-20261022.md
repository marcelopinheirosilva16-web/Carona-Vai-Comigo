# Correção das permissões de exclusão de conta

## Diagnóstico
O JavaScript grava pedidos em `solicitacoesExclusao/{uid}`, mas faltava a regra Firestore para essa coleção. A regra de `usuarios/{uid}` também impedia exclusão pelo próprio titular.

## Aplicação
1. Faça backup das regras atualmente publicadas.
2. No Firebase Console > Firestore Database > Regras, substitua pelo conteúdo COMPLETO de `firestore.rules` e publique.
3. Publique os arquivos do projeto e atualize a página com Ctrl+F5.
4. Teste com conta fictícia com histórico: confirme a senha e verifique `solicitacoesExclusao/{uid}` com status `pendente`. A conta continuará ativa até o atendimento do pedido.
5. Teste com conta fictícia sem histórico. Confirme se o perfil, autenticação e veículo foram excluídos.

## Limites importantes
- Pedidos com histórico NÃO apagam automaticamente a conta. Exigem processo administrativo seguro de revisão, anonimização e exclusão.
- A exclusão direta no navegador não é atômica entre Firestore, Storage e Authentication. Faça testes e implemente backend seguro antes de produção.
- A regra de exclusão do perfil permite a exclusão pelo titular não administrador; ainda não verifica ausência de obrigações ou registros associados. Para produção, use backend privilegiado que aplique essa validação.
- Não use `allow read, write: if true`.
