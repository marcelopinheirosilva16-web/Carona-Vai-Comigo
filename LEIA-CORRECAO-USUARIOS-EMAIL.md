# Correção pontual — painel administrativo e confirmação de e-mail

- Painel admin: novo botão **Encerrar antigo**, somente para perfis não administrativos ainda ativos. Antes de usar, compare o UID do documento com a lista do Firebase Authentication. O botão NÃO verifica automaticamente o Authentication; use SOMENTE quando tiver certeza de que a conta não existe mais. Mantém documentos de viagens e pagamentos.
- A contagem passa a excluir o perfil após ele ser marcado como encerrado.
- Cadastro: remove URL local de confirmação, mantém envio padrão do Firebase e mostra o código real quando o envio falha, sem mensagem posterior enganosa de sucesso.
- Recuperação de senha e regras do Firestore não foram alteradas.

## Instalação
Substitua os arquivos do site pelos deste ZIP, sem mudar as regras do Firebase. Recarregue com Ctrl+F5. O código não foi testado em sua conta Firebase; verifique o Console caso haja erro.

**Atenção:** o botão de encerramento é uma ação administrativa manual, não sincronização com Firebase Authentication. A listagem do Auth só pode ser conferida com privilégios de servidor (Admin SDK). Não marque usuários que ainda tenham conta no Auth.
