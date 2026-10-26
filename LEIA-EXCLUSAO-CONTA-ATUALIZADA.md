# Exclusão de conta — atualização

1. Publique `firestore.rules` no Firebase Console > Firestore Database > Regras antes de testar.
2. Contas sem vínculos seguem o fluxo anterior de exclusão direta (sujeito a falhas parciais, não homologado para produção).
3. Contas com viagens, solicitações ou avaliações podem registrar um pedido em `solicitacoesExclusao/{uid}` após reautenticação por senha. O pedido **não exclui automaticamente a conta nem os dados**.
4. O administrador precisa tratar manualmente os pedidos no console Firestore e coordenar a remoção/anonimização segura dos dados, respeitando retenções necessárias. Não há processamento automático de pedidos nesta versão.
5. O cadastro de administradores não recebe a opção de exclusão no perfil.
6. Teste com contas fictícias. Para uso real, implemente processamento confiável no servidor, abrangendo Auth, Firestore, Storage, relações com terceiros e trilha de auditoria.
