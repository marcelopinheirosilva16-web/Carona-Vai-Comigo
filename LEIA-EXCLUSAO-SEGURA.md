# Correção do pedido de exclusão

1. Publique o arquivo `vaicomigo/firestore.rules` INTEIRO no Firebase Console > Firestore Database > Regras.
2. Atualize os arquivos do site e pressione Ctrl+F5.
3. Teste com conta comum (não administrativa) e senha válida.
4. O botão registra ou renova um pedido pendente em `solicitacoesExclusao/{uid}`. Não exclui automaticamente Auth, dados de terceiros ou históricos financeiros.
5. O administrador deve tratar o pedido com procedimento seguro e verificar as obrigações de retenção e LGPD. O Firebase Spark não disponibiliza, neste pacote, um backend de exclusão integral automática.
6. Se o usuário já tiver uma solicitação concluída, deverá contatar o suporte.

Esta alteração evita consultas a coleções operacionais no navegador durante o pedido, preservando as regras de viagens, vagas e pagamentos. Não é uma solução completa de processamento de exclusão.
