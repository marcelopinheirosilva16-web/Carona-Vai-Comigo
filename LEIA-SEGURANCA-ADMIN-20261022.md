# Atualização de segurança administrativa — VaiComigo

- Botões Bloquear e Desbloquear preservados para contas não administrativas.
- Conta administrativa protegida contra bloqueio/encerramento na interface; regras do Firestore impedem exclusão de seu documento e mudanças de campos de segurança via aplicativo.
- Encerrar antigo não pode verificar usuários do Authentication pelo navegador; ação insegura foi desativada. Para encerramento automático real é necessário backend com Firebase Admin SDK.
- Novos formulários na página admin.html permitem mudar senha e solicitar verificação do novo e-mail, mediante senha atual.
- Após confirmar a troca de e-mail, o campo email do perfil Firestore pode permanecer com o valor antigo; sincronize-o de modo autenticado e seguro antes de usá-lo como fonte de contato.
- A exclusão direta pelo Firebase Console ou por Admin SDK não é impedida por regras Firestore. Para impedir isso, controle de acesso de operadores/servidor é necessário.

## Publicação
1. Faça backup do projeto e das regras atuais.
2. Substitua os arquivos do projeto.
3. Revise e publique `firestore.rules` no Firebase Console, testando no emulador antes de publicar em produção.
4. Teste: admin não pode ser bloqueado; usuário comum pode ser bloqueado/desbloqueado; alteração de senha; verificação de novo e-mail; login; viagens; pagamentos.
5. O código não foi testado contra seu Firebase em tempo real.
