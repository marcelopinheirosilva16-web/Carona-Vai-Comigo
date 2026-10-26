# VaiComigo — Melhoria 02 (incremental e conservadora)

Esta versão preserva o PWA e todos os arquivos da versão anterior.

## Alterações aplicadas
- Passageiro: valida que a quantidade solicitada seja um número inteiro entre 1 e 4, antes de criar o pedido.
- Motorista: valida a quantidade da solicitação dentro da transação de aceitação; rejeita quantidades inválidas e valores de vagas inconsistentes.

## Limitação importante
O projeto atual desconta solicitações pendentes na interface por consulta separada. Isso NÃO garante bloqueio atômico das vagas pendentes sob solicitações simultâneas. O bloqueio transacional existente é feito na aceitação pelo motorista. Uma reserva atômica já na solicitação exige migrar o esquema de contadores e coordenar criação, alteração, cancelamento, aceitação e recusa com regras do Firestore (idealmente usando backend confiável). Esta etapa não altera o esquema de dados para evitar quebrar fluxos existentes.

## Testes recomendados
1. Criar viagem com 4 vagas; solicitar 2; aceitar e confirmar saldo de 2.
2. Tentar aceitar pedidos que excedam o saldo: a transação deve recusar.
3. Alterar e cancelar pedidos e verificar que saldos continuam consistentes.
4. Validar notificações, chat, pagamentos, GPS e PWA.

Não foram executados testes com Firebase real; valide primeiro no projeto de testes.
