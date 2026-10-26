# Melhoria 04 — Pagamento coletivo (protótipo de integração)

Esta versão preserva os arquivos originais e adiciona `js/pagamento-coletivo.js` e regras para `pagamentosColetivos`.

**NÃO PUBLIQUE EM PRODUÇÃO.** Ainda exige validação no Firebase Emulator e revisão de segurança. Em especial:
- As regras atuais de `solicitacoes` impedem que um passageiro leia a lista de outros passageiros da viagem. A interface de seleção depende dessa leitura e poderá receber `permission-denied`. Não abra acesso indiscriminado a solicitações: implemente um diretório de participantes com dados mínimos e autorização adequada.
- O total financeiro do grupo precisa de verificação autoritativa, não apenas cálculo no navegador.
- A transação de confirmação precisa ser testada contra limites de acessos de regras (`getAfter`) e concorrência.
- Confirmar pagamentos individuais preexistentes e o histórico de viagens exigem testes de regressão.
- A taxa administrativa de 2% já existente é calculada por viagem; NÃO foi alterada.

O ZIP é uma base técnica de trabalho, não uma entrega pronta para substituir o projeto publicado. Faça backup e teste em projeto Firebase separado.
