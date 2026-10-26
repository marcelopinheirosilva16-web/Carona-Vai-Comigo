# VaiComigo — pagamentos 100% manuais

1. Faça backup do projeto e das regras atuais do Firestore.
2. Abra esta pasta `vaicomigo` no VS Code e inicie pelo Live Server.
3. No Firebase Console > Firestore > Regras, revise e publique o conteúdo de `firestore.rules` deste pacote. **Não use `storage.rules` no Firestore.**
4. Motorista: cadastre chave Pix e WhatsApp com DDI e DDD (exemplo: 5531999999999).
5. Faça teste com duas contas distintas: motorista e passageiro. Solicite, aceite, inicie e conclua uma viagem de teste.
6. Somente após a conclusão, o passageiro pode escolher Pix, dinheiro ou maquininha. Para Pix, abre o WhatsApp do motorista com mensagem pronta; anexe o comprovante manualmente.
7. O motorista confere o recebimento real e clica em **Confirmar que recebi o pagamento**. O administrador confirma a taxa de 2% separadamente.
8. O Firebase registra declarações manuais; **não verifica transações bancárias**. Não trate comprovantes de WhatsApp como pagamento confirmado.

## Atenção
- Não substitua as regras sem revisar compatibilidade com outros módulos do seu projeto.
- A taxa de 2% é calculada sobre o valor anunciado da viagem no módulo atual; confirme se isso corresponde à regra de negócio desejada para viagens com múltiplas vagas.
- Em caso de erro `Missing or insufficient permissions`, verifique a operação no Console e se as regras publicadas são as mesmas do pacote.
- O envio de imagem pelo WhatsApp depende de ação manual do passageiro.
- Faça testes com contas e viagens de teste antes de usar com pagamentos reais.
