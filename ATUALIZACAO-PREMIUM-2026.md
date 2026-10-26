# VaiComigo — atualização Premium 2026

## O que foi refinado nesta entrega

- Preservada a estrutura HTML, CSS e JavaScript existente, o Firebase Compat, as coleções do Firestore e as páginas de passageiro, motorista, perfil, segurança e administração.
- Criada uma camada visual premium responsiva, com hierarquia visual mais clara, superfícies e sombras refinadas, botões com gradientes discretos, estados de foco acessíveis e melhor rolagem horizontal de tabelas em telas pequenas.
- Acrescentados metadados de descrição e cor do navegador às páginas principais.
- Corrigida a exibição de ações das viagens do motorista: viagens concluídas não exibem mais o botão de iniciar novamente.
- Fortalecida a validação de publicação de viagens: origem e destino diferentes, preço válido e data/hora futura.
- Melhorado o fluxo de início de viagem: verifica o proprietário e o status da viagem antes de iniciar; só começa a enviar GPS após a atualização ser confirmada.
- Melhorado o encerramento: verifica o proprietário e o estado atual, registra `encerradoEm` e `atualizadoEm`, e encerra o rastreamento GPS.
- Corrigidas as regras do Firestore para permitir que a transação de aceite atualize `vagasDisponiveis`, `vagasTotais` e `vagasOcupadas`, com validação de valores não negativos.
- Reforçadas as regras para impedir solicitações de quantidade de vagas inválida ou maior que as vagas atualmente disponíveis, e limitar as transições de estado das viagens.

## Como instalar

1. Extraia o ZIP e abra a pasta `vaicomigo` no VS Code.
2. Execute `index.html` pelo Live Server; não abra o HTML com `file://`.
3. A configuração existente em `js/firebase-config.js` foi mantida.
4. Antes de testar as mudanças de segurança, faça backup das regras publicadas no Firebase Console. Depois, publique `firestore.rules` em **Firestore Database → Regras**.
5. Se usar fotos de perfil, confira também as regras de `storage.rules` em **Firebase Storage → Regras**.

## Testes recomendados antes de produção

- Cadastro e login com contas de teste.
- Publicação de viagem com data futura e validação de campos.
- Solicitação de uma ou mais vagas, aceite concorrente de solicitações e confirmação de que a quantidade restante não fica negativa.
- Início de viagem, permissão de GPS, acompanhamento pelo passageiro e encerramento.
- Cancelamento de solicitação, foto de perfil, avaliações e operações administrativas.
- Conferência de índices e permissões no Console do Firebase.

## Limites desta entrega

Os arquivos JavaScript foram verificados com `node --check` e os caminhos locais referenciados nos HTMLs foram conferidos. A autenticação real, regras publicadas, índices, permissões de Storage e GPS precisam ser testados no navegador com o projeto Firebase ativo. Nenhum sistema pode ser considerado pronto para produção apenas com validação estática.
