# VaiComigo — encerramento de conta com preservação do Firestore

1. Publique **todo** o arquivo `firestore.rules` no Firebase Console > Firestore Database > Regras. Faça backup das regras atuais antes.
2. Substitua os arquivos do site e atualize a página com Ctrl+F5.
3. Teste somente com conta fictícia sem viagens ou pagamentos pendentes.

## Comportamento
Após reautenticar por senha, o sistema anonimiza os campos básicos do documento `usuarios/{uid}` e solicita ao Firebase Authentication a exclusão do usuário. **Viagens, solicitações, mensagens e pagamentos continuam no Firestore**.

## Limitações importantes
- Isto **não é uma exclusão integral de dados pessoais**: registros preservados podem conter nomes, localização, mensagens e outros dados identificáveis. Requer política de retenção e procedimento complementar para LGPD.
- Não há backend para transação atômica entre Firestore e Authentication. Se a exclusão do Auth falhar após anonimização do perfil, é necessária intervenção para finalizar; não considere a operação concluída.
- A aplicação não verifica automaticamente pendências financeiras ou viagens em andamento. Usuários devem resolvê-las antes; para produção, implemente validação confiável em backend.
- Fotos no Storage, PIX e veículo podem exigir tratamento adicional. Não foram removidos nesta versão.
- Não testado no Firebase de produção.
