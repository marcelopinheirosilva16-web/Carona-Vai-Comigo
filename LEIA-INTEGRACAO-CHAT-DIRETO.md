# Chat integrado diretamente às viagens

- Motorista: em Gerenciar Solicitações, cada solicitação aceita tem botão Conversar.
- Passageiro: na Área do Passageiro, Conversas das viagens aceitas apresenta botões diretos; após encerrar a viagem, o cartão de pagamento também oferece Conversar.
- O link abre chat.html com a conversa da solicitação selecionada.
- Não foi alterada a lógica de pagamentos, GPS, histórico ou reserva de vagas.
- Antes de testar, confira e publique as regras do Firestore do pacote, mesclando com suas regras existentes.
- Teste com contas distintas e uma solicitação aceita. A integração não foi testada contra seu projeto Firebase online.
- Mensagens consomem leituras e gravações do Firestore.
