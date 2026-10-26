# Exclusão de conta — VaiComigo

Implementada em Meu Perfil para contas não administrativas. Requer senha atual, impede exclusão quando encontra viagens, solicitações ou avaliações associadas, e tenta apagar foto de perfil, veículo, documento do perfil e usuário do Firebase Auth.

**ATENÇÃO: implantação e limitações**
- Publique o arquivo `firestore.rules` atualizado no console Firebase. Sem isso a exclusão do perfil será bloqueada.
- Faça testes com conta descartável sem vínculos, incluindo recuperação de erros.
- O aplicativo pode possuir outras coleções com dados pessoais (mensagens, denúncias, pagamentos, auditoria, notificações etc.). A exclusão integral/anonimização e a retenção legal exigem fluxo de backend seguro, não coberto por esta versão. Para contas com vínculos, a interface encaminha ao e-mail de suporte.
- Uma falha de rede após excluir perfil e antes de excluir Authentication pode deixar conta parcialmente excluída. Para produção, implemente processamento atômico/administrado em backend e inventário de dados.
- Não declare conformidade integral com LGPD antes de revisão jurídica e técnica.
