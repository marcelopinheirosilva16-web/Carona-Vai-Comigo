# Integração GPS e embarque

- Em **Minhas solicitações** (painel), solicitações aceitas têm link para reabrir acompanhamento, inclusive após fechar a página. O vínculo é conferido novamente no Firestore.
- Em **Gerenciar solicitações**, o motorista pode confirmar individualmente o embarque de passageiros aceitos. A confirmação é gravada em `solicitacoes.embarcado` e `embarcadoEm`.
- O passageiro vê a indicação de embarque em Minhas solicitações.
- Tela de login: CSS adicional para celulares.

**IMPORTANTE:** publique também `firestore.rules` no console do Firebase, após revisar. Teste em ambiente de homologação com duas contas antes de publicar para usuários reais. O GPS do motorista em navegador/PWA depende de permissões e pode parar em segundo plano.
