# Relatório da atualização

A atualização foi aplicada diretamente à versão enviada nesta conversa. O foco foi melhorar transparência de privacidade, validação de denúncias e validação de fotos sem reescrever o fluxo de viagens/mapas.

## Mudanças
- Adicionadas páginas de Política de Privacidade (modelo) e Segurança e Uso Responsável.
- Links legais adicionados às páginas principais.
- Formulário de denúncia exige autenticação, valida tamanhos e motivos permitidos, e evita duplo clique enquanto envia.
- Regras Firestore para denúncias verificam campos permitidos, UID do denunciante e tamanhos máximos.
- Regras Storage limitam fotos de perfil a 5 MiB e JPEG/PNG/WebP.

## O que não foi declarado como concluído
- Não foi publicado nada no Firebase.
- Não foi feito pentest nem auditoria jurídica.
- Rate limiting robusto e privacidade por campo nas coleções de perfil/veículo ainda exigem trabalho e testes específicos.
- O projeto Firebase existente e a chave de configuração foram mantidos; não foram adicionadas novas APIs pagas.
