# Melhoria 03 — Relatórios financeiros

Adicionado painel de relatórios ao administrador, com filtro por data e UID do motorista, totais, CSV compatível com Excel e impressão para salvar como PDF.

**Preservado:** pagamentos, confirmação, notificações, controle de vagas, GPS e regras Firestore.

**Importante:** o filtro de datas usa confirmadoEm, criadoEm, geradoEm ou atualizadoEm (nessa ordem). Registros sem data são incluídos apenas quando não há filtro de período. A exportação usa os dados que o Firestore retorna; não é conciliação bancária.

**Como testar:** abrir admin.html autenticado como administrador; consultar taxas, filtrar, exportar CSV e imprimir para PDF. Verificar permissão de pop-up no navegador. Não substitui testes de segurança das regras Firestore e testes de ponta a ponta.

**Reserva de vagas:** nenhuma alteração automática feita. Reservar vagas pendentes exige definição explícita de expiração, concorrência e regras transacionais, para não criar bloqueios indevidos.
