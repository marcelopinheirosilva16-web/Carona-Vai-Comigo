# VaiComigo — diagnóstico inicial de estabilização

Base analisada: VaiComigo-Sem-Pagamento-Coletivo(10).zip.

## Problema crítico identificado

`js/passageiro.js`, função `pjLerPendentes()`, consulta globalmente `solicitacoes` filtrando `status == pendente`. As regras de `firestore.rules` permitem leitura apenas pelo passageiro, motorista ou administrador associado. Uma consulta global não é autorizada; a função captura `permission-denied` e zera o contador de pendências. Assim, a interface pode mostrar vagas que já foram solicitadas.

## Inconsistência no modelo

`js/motorista.js` desconta `vagasDisponiveis` apenas quando aceita a solicitação, enquanto o requisito de negócio exige reserva desde a solicitação pendente. Para funcionar de forma concorrente e segura, a reserva, alteração, recusa e cancelamento precisam atualizar um contador autoritativo em transações ou backend confiável. Apenas mudar a consulta ou liberar leitura global não corrige a concorrência.

## Validações realizadas

Arquivos JavaScript inspecionados quanto à sintaxe com `node --check` (sem erros relatados). Não foram realizados testes autenticados com Firebase, emuladores ou testes ponta a ponta.

## Próximos passos para liberação

1. Implementar um modelo único e transacional de vagas reservadas e confirmadas, com regras Firestore compatíveis.
2. Testar concorrência, alteração de quantidade, cancelamento, recusa e aceitação em dois navegadores.
3. Testar permissões por perfil e impedir modificações financeiras indevidas.
4. Testar pagamentos manuais, notificações, GPS e chat sem regressões.
5. Publicar em ambiente de homologação antes da produção.

**Status: NÃO HOMOLOGADO PARA PRODUÇÃO.** Este documento não altera o funcionamento do projeto.
