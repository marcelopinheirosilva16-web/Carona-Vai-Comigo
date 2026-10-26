# Atualização de Segurança e Privacidade — VaiComigo

Esta atualização foi aplicada à versão **VaiComigo-Passageiro-Endereço-e-Mapa-Corrigido** enviada nesta conversa. A estrutura, as páginas de motorista/passageiro, Firebase e integração de mapa foram mantidas.

## Arquivos adicionados/alterados
- `privacidade.html`: modelo de Política de Privacidade.
- `politica-seguranca.html`: orientações de uso responsável.
- `js/seguranca.js`: validação de denúncia, autenticação obrigatória e bloqueio de envio duplicado na interface.
- `seguranca.html`: validação dos campos e links legais.
- `firestore.rules`: validação dos campos de denúncias e limite de tamanho.
- `storage.rules`: validação de tipo e tamanho das fotos (até 5 MiB).
- Links para privacidade/segurança adicionados às páginas principais.

## Instalação segura
1. Faça uma cópia de segurança da pasta atual antes de substituir qualquer coisa.
2. Extraia o ZIP e abra a pasta `vaicomigo` no VS Code.
3. Confira `privacidade.html` e substitua TODOS os campos entre colchetes, incluindo nome do responsável, contato e data.
4. Revise a política para garantir que descreve exatamente os dados e serviços que o aplicativo realmente usa.
5. Teste primeiro em um projeto Firebase de desenvolvimento, se disponível.
6. No Firebase Console, abra Firestore Database → Regras. Compare e teste `firestore.rules` com o aplicativo. Só então publique.
7. Abra Storage → Regras, compare e teste `storage.rules`; publique somente após confirmar que upload, atualização e exclusão de fotos continuam funcionando.
8. Teste todas as áreas: cadastro, login, perfil, veículo, publicar viagem, solicitar/aceitar/cancelar, GPS, avaliações, denúncias e administração.

## Limitações conhecidas — leia antes de publicar
- A validação no JavaScript pode ser contornada; a autorização real deve estar nas regras do Firebase.
- As regras atualizadas de denúncia limitam campos e tamanho, mas **não implementam rate limit robusto**. Para limitar por usuário de forma resistente a abuso é necessário desenhar uma solução de servidor/transação e testar os fluxos.
- As regras atuais ainda permitem leitura de perfis e veículos por usuários autenticados, pois a aplicação pode depender disso para exibir nomes e dados da carona. Isso precisa de uma revisão de minimização de dados por campo/coleção e testes antes de restringir, para não quebrar as telas.
- As regras de viagens e solicitações existentes foram preservadas para reduzir risco de incompatibilidade. Elas precisam ser testadas com o esquema real de documentos.
- Uma API key de configuração web do Firebase não é uma senha de administrador; mesmo assim, restrinja-a por domínio quando apropriado e proteja o projeto com regras fortes. Nunca coloque service-account JSON ou chaves privadas no frontend.
- A política de privacidade é um modelo, não uma avaliação jurídica nem uma garantia de conformidade LGPD. Preencha os contatos e confirme finalidades, bases legais, retenção, compartilhamentos e processo para atender direitos dos titulares.
- Não há como garantir segurança total. Antes de disponibilizar ao público, faça revisão das regras e testes de acesso indevido.

## Testes mínimos
- Usuário A não consegue alterar perfil, veículo ou solicitações de usuário B.
- Passageiro não consegue aceitar solicitações como motorista.
- Motorista não consegue editar dados essenciais de viagem que não são permitidos pelas regras.
- Usuário comum não consegue ler/modificar denúncias de outras pessoas.
- Usuário não autenticado não consegue criar denúncia nem acessar páginas protegidas por dados.
- Foto inválida ou acima de 5 MiB é recusada pelo Storage.
- GPS deixa de ser compartilhado ao encerrar/cancelar a viagem, conforme o comportamento implementado no app.
- A aplicação continua funcionando nas telas de motorista e passageiro.

**Importante:** os arquivos de regras não são publicados automaticamente no Firebase por esta atualização.
