# Confirmação de e-mail para novos cadastros

- Usa o Firebase Authentication do plano Spark e envia **link de confirmação**, não código de 6 dígitos.
- Contas anteriores sem o campo `exigeConfirmacaoEmail` não são bloqueadas.
- Novas contas recebem `exigeConfirmacaoEmail: true` no documento `usuarios/{uid}`.
- A recuperação de senha existente não foi alterada.
- Configure o domínio de hospedagem em Firebase Authentication > Settings > Authorized domains.
- Teste cadastro, envio, confirmação, reenvio e login com uma conta nova.

**Atenção de segurança:** a proteção implementada no front-end impede o fluxo normal de login e redireciona páginas, mas não impede chamadas diretas ao Firestore feitas por um cliente modificado. Antes de produção, endureça as regras Firestore para exigir `email_verified` nas operações protegidas dos novos cadastros, preservando a exceção de contas antigas, e revise os demais serviços.
