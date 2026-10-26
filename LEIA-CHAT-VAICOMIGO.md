# Chat VaiComigo — instalação e testes

- Nova página `chat.html` e `js/chat.js`, com mensagens em tempo real usando Firestore.
- Links adicionados às áreas de motorista e passageiro.
- Apenas solicitações com status `aceita` ou `aceito` aparecem; chat individual por solicitação.
- Publique o conteúdo de `firestore.rules` em Firebase Console > Firestore Database > Regras, conferindo as regras existentes antes de substituir. **Sem publicar as regras, as mensagens podem ser negadas.**
- Abra como motorista e passageiro em navegadores separados, aceite uma solicitação, acesse Conversas e teste envio/recebimento.
- Mensagens ficam armazenadas no Firestore e consomem cotas gratuitas; sem notificação push, sem anexos e sem moderação automática.
- **Segurança:** regras impedem leitura por terceiros e edição/exclusão de mensagens; mensagens são acessíveis enquanto a solicitação estiver aceita. Para operação pública, implementar bloqueio, denúncia de mensagem, retenção de dados e prevenção de abuso.
