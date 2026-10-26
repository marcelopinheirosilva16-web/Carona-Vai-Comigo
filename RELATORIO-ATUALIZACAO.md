# VaiComigo — relatório de atualização

Data: 14/10/2026

## Alterações realizadas

- Mantida a estrutura original em HTML, CSS e JavaScript, com Firebase Compat e Leaflet.
- Removidas do `motorista.html` as referências para `js/viagens-motorista.js` e `js/solicitacoes-motorista.js`, que não existiam no pacote. As funções correspondentes já estão integradas em `js/motorista.js`.
- Corrigida a consulta do motorista para ler apenas solicitações vinculadas ao seu UID e filtrar pela viagem selecionada.
- Aceite/recusa agora usa os estados `aceita` e `recusada`, mantendo compatibilidade visual com estados antigos (`aceito`/`recusado`). O aceite usa uma transação Firestore para verificar a viagem e reservar uma vaga sem permitir que a contagem fique negativa.
- Exclusão de viagem remove primeiro as solicitações da viagem que pertencem ao motorista, usando lote do Firestore.
- Corrigida a listagem de solicitações no painel: agora usa `viagemOrigem`, `viagemDestino` e `dataHora`, que são os campos gravados pelo passageiro; adicionada opção de cancelar solicitação e corrigido o cabeçalho duplicado da tabela.
- Reforçadas as regras do Firestore para evitar autoelevação de administrador e limitar as alterações de perfil e de documentos de viagem/solicitação.
- Reduzidas consultas que combinavam filtros/ordenação e poderiam exigir índices compostos desnecessários.
- Modernizados detalhes visuais e responsividade; a tela de login não usa mais `logo2.png` como fundo e o texto foi atualizado para “Juntos vamos mais longe”.

## Como abrir

1. Extraia o ZIP em uma pasta no computador.
2. Abra a pasta `vaicomigo` no VS Code.
3. Execute com a extensão Live Server ou um servidor HTTP local; não abra os HTMLs diretamente pelo protocolo `file://`.
4. A configuração web do Firebase original foi preservada em `js/firebase-config.js`.

## Importante antes de usar em produção

1. No Firebase Console, faça backup das regras publicadas atualmente.
2. Revise e publique o arquivo `firestore.rules` em **Firestore Database → Regras**. Alterar o arquivo local não muda as regras do projeto na nuvem.
3. Teste o cadastro e login, publicar viagem, solicitar vaga, aceitar/recusar, cancelar, iniciar GPS, acompanhar e encerrar com duas contas de teste.
4. Se o Firebase informar `permission-denied`, verifique se as regras novas foram publicadas e se os documentos antigos contêm `motoristaUid`, `passageiroUid`, `viagemId` e `status`.
5. As regras não substituem testes no ambiente real. Esta entrega foi verificada por análise estática e `node --check`; autenticação, regras publicadas, índices e GPS dependem de teste no seu Firebase e navegador.
