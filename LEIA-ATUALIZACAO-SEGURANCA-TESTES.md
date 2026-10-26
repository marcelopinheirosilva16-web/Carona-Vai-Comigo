# VaiComigo — atualização para ambiente de testes

## Alterações
- Painel financeiro: filtro de taxas confirmadas e pendentes; aviso de simulação.
- Confirmação administrativa: transação para evitar confirmar novamente taxa já paga; registro na coleção `auditoria` com identificador da viagem, administrador e horário.
- Mantidos os IDs originais no Firestore e a identificação visual abreviada.

## Importante
- Nenhuma regra do Firestore foi publicada automaticamente. O arquivo `firestore.rules` é apenas uma cópia local.
- Os dados de testes continuam no banco; não faça pagamentos PIX reais.
- O registro de auditoria ocorre após a transação financeira. Se a auditoria falhar, a confirmação pode já ter sido gravada: confira o status antes de tentar novamente.
- As regras atuais permitem leitura de todos os perfis por qualquer usuário autenticado; antes de produção, restrinja os campos privados.
- As regras de criação de `usuarios` exigem `tipo`, enquanto os cadastros existentes podem usar `papel`; revise antes de testar novos cadastros.
- Se o Realtime Database não for utilizado, desabilite leitura e escrita públicas nele depois de verificar dependências.

## Testes recomendados
1. Entre como administrador e abra `admin.html`.
2. Confira os totais e alterne o filtro de taxas.
3. Confirme uma taxa fictícia pendente e verifique seu status `paga`.
4. Confira o registro `confirmacao_taxa_teste` em `auditoria`.
5. Teste acesso ao painel com uma conta comum (não administradora).

Não há garantia de segurança completa apenas com estas mudanças; faça testes no Firebase Emulator Suite antes de implantar.
