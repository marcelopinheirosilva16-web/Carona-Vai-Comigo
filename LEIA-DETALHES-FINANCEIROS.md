# Detalhes financeiros VaiComigo

Agora o motorista visualiza código, nome do passageiro, origem, destino e conclusão no recebimento. O administrador visualiza código, motorista, origem, destino e conclusão nas taxas e notificações.

Dados são lidos das coleções existentes `viagens`, `usuarios` e `solicitacoes`. Não houve alteração em regras Firestore, confirmações, valores ou forma de pagamento. Se o documento antigo não tiver data de conclusão, aparecerá "Não informada" (não será inventada).

As consultas extras dependem das permissões de leitura já existentes. Se um dado não estiver disponível, o painel exibe texto de indisponibilidade e continua funcional. Teste com motorista e administrador.
