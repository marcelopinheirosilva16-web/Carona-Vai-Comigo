# VaiComigo — Fase 1: viagens entre cidades (protótipo)

## Alterações feitas
- Motorista: origem e destino devem estar no formato `Cidade - UF`, e ser diferentes.
- Motorista: novas viagens recebem `tipoViagem`, `origemCidade`, `origemUF`, `destinoCidade` e `destinoUF`, preservando os campos anteriores para compatibilidade.
- Passageiro: sugestões de municípios para pesquisar; ainda é possível digitar outras cidades.
- Não foram alteradas as regras do Firestore, pagamentos, histórico, GPS ou o painel administrativo.
- As viagens antigas continuam com o formato anterior e não foram migradas.

## Teste
1. Faça backup da pasta atual e do projeto Firebase antes de substituir arquivos.
2. Abra `motorista.html`, crie uma viagem de `Santa Maria do Suaçuí - MG` para `Governador Valadares - MG`.
3. Confira os novos campos no Firestore e pesquise na tela de passageiro.
4. Teste aceitação, encerramento e pagamento usando contas de teste.

## Limites desta fase
Esta é a primeira etapa funcional, não um lançamento comercial pronto. Não há validação geográfica oficial dos municípios, verificação documental, auditoria completa de permissões, nem homologação regulatória. A lista de sugestões é local e editável. Consulte o DER-MG e orientação jurídica antes de intermediar viagens reais ou cobrar taxas.
