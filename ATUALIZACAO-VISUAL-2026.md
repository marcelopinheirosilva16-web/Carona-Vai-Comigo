# VaiComigo — atualização visual responsiva

## O que foi feito
- Adicionada uma camada visual complementar em `css/style.css` para padronizar navegação, cartões, formulários, botões, tabelas, mapas e foco por teclado.
- Melhorada a adaptação da navegação e dos cartões em telas menores.
- Preservados os arquivos HTML e JavaScript de funcionalidades, as coleções Firestore, o Firebase Compat, o Leaflet e a configuração existente em `js/firebase-config.js`.
- Não foram publicadas nem alteradas regras no Firebase Console.
- Não foi ativada cobrança nem feita integração de pagamento.

## Antes de substituir a pasta
1. Faça uma cópia da pasta atual.
2. Extraia o projeto e abra a pasta `vaicomigo` no VS Code.
3. Execute com Live Server (não use `file://`).
4. Teste com contas de teste o login, cadastro, busca e publicação de viagens, solicitações, aceite/recusa, GPS, acompanhamento e perfil.
5. Se houver erros de permissão, compare as regras locais com as regras atuais do Console antes de publicar qualquer mudança.

## Foto de perfil
A tela de perfil deste pacote ainda usa Firebase Storage para enviar a foto. Como o projeto está no plano Spark e o Storage do Console solicita upgrade, o envio da foto continuará indisponível até que a configuração de armazenamento seja resolvida. O restante do sistema pode ser testado sem ativar essa função.

## Limites da validação
Os arquivos JavaScript foram verificados com `node --check`. Isso não substitui testes reais no navegador/Firebase, incluindo permissões, índices, GPS e funcionamento em celulares físicos.
