# Pagamento individual por pessoa — VaiComigo

O campo de publicação de viagem indica o valor **por pessoa/vaga**. Para cada solicitação aceita, o passageiro vê o preço unitário, a quantidade de vagas solicitadas e o total individual (preço unitário × vagas). Exemplo: R$ 25 × 2 = R$ 50.

Os pagamentos permanecem separados por ID de solicitação em `pagamentosPassageiro`; o motorista confirma cada pagamento individualmente. Não há pagamento coletivo.

**Atenção:** a taxa de manutenção de 2% e o relatório financeiro continuam com a lógica anterior, baseada em `viagens.valor`, que representa o preço unitário. Eles não foram alterados nesta atualização isolada. É necessário revisar essa apuração antes de usar os valores financeiros em produção.

Esta mudança não corrige a contagem de vagas pendentes. Teste com dois passageiros distintos no Firebase de testes antes de publicar.
