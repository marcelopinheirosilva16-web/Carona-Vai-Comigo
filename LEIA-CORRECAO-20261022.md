# Correção de pagamentos e nomes — VaiComigo

1. **Pagamentos:** o formulário do passageiro voltou a enviar somente os campos permitidos pelas regras incluídas em `firestore.rules` (`passageiroUid`, `motoristaUid`, `viagemId`, `forma`, `status`, `criadoEm`). Os detalhes da viagem continuam sendo consultados nas coleções `viagens` e `solicitacoes`, sem duplicar dados no pagamento.
2. **Gerenciar Solicitações:** quando o nome não estiver preenchido na solicitação, o motorista tentará recuperá-lo em `usuarios/{passageiroUid}`. Caso a conta tenha sido apagada ou anonimizada e não haja nome histórico, continuará aparecendo o nome genérico.
3. **Pix:** uma falha isolada ao carregar a chave Pix não deve impedir a exibição dos demais pagamentos.

**IMPORTANTE:** confirme se as regras de `firestore.rules` estão publicadas no Firebase Console. O erro `Missing or insufficient permissions` pode persistir se as regras online forem diferentes das deste ZIP. Não publique regras sem comparar com as atuais, pois podem conter alterações posteriores. Não use regras de leitura pública para pagamentos.

Teste: solicitação aceita → motorista conclui viagem → passageiro escolhe pagamento → motorista confirma. Teste também uma solicitação antiga sem `passageiroNome`.
