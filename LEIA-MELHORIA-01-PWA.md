# Melhoria 01 — Instalação PWA

Esta versão mantém os scripts originais, Firebase, GPS, chat, vagas e pagamentos. Acrescenta apenas manifesto, ícones, registro de service worker e referências HTML.

## Como testar
1. Abra a pasta `vaicomigo` no VS Code e use Live Server ou publique em HTTPS.
2. Acesse o site pelo Chrome no Android e procure **Instalar app** no menu do navegador.
3. Confira em DevTools > Application > Manifest e Service Workers.
4. O aplicativo **precisa de internet**: nenhuma página ou dado privado foi colocado em cache.
5. Teste login, motorista, passageiro, administrador, notificações e pagamentos.

A instalação depende dos critérios e do navegador; não garante distribuição nas lojas. Não alteramos regras do Firestore nem a lógica das reservas nesta etapa.
