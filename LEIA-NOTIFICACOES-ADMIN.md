# Notificações financeiras do administrador

- Arquivo restaurado: `js/notificacoes-admin-financeiro.js`, já referenciado por `admin.html`.
- O sino aparece somente após validar `usuarios/{uid}.admin == true`.
- Escuta em tempo real taxas em `taxasPlataforma` com `status = comprovante_enviado`.
- O contador mostra avisos ainda não lidos; clique em **Ver no financeiro** para conferir e confirmar manualmente no painel.
- A leitura é armazenada no navegador (localStorage), por administrador e taxa; não sincroniza entre dispositivos.
- O sininho não confirma pagamentos automaticamente. Confirme somente após conferência do extrato.
- Ambiente de testes: não realizar pagamentos reais.
- Teste: entre como motorista, registre referência do comprovante; entre como administrador e abra o sino.
- Publique todos os arquivos juntos, mantendo a estrutura `vaicomigo/`.
