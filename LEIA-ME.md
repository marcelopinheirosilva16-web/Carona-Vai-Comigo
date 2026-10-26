# VaiComigo

Plataforma web de caronas que conecta passageiros e motoristas com trajetos semelhantes.
Feito com **HTML + CSS + JavaScript + Firebase (Auth + Firestore)**, usando Firebase compat **v10.12.5**.

## Estrutura de arquivos

```
vaicomigo/
├── index.html          Login, cadastro e recuperacao de acesso
├── painel.html         Painel inicial (hub) + minhas solicitacoes
├── perfil.html         Perfil, reputacao, avaliacoes recebidas, logout
├── passageiro.html     Pesquisa de viagens, filtros, detalhes, solicitar vaga, avaliar
├── motorista.html      Cadastro de veiculo, criar viagem, gerenciar solicitacoes
├── seguranca.html      Denuncia, orientacoes e contatos de emergencia
├── admin.html          Usuarios, viagens, denuncias, metricas, bloqueios, auditoria
├── css/style.css       Estilos
├── js/
│   ├── firebase-config.js  Configuracao UNICA do Firebase (edite aqui)
│   ├── common.js           Toast, modal, guarda de rota, utilitarios
│   ├── nav.js              Menu dinamico + iniciarPagina()
│   ├── auth.js             Cadastro / Login / Recuperacao
│   ├── painel.js
│   ├── perfil.js
│   ├── passageiro.js
│   ├── motorista.js
│   ├── seguranca.js
│   └── admin.js
└── firestore.rules    Regras de seguranca do Firestore
```

## Colecoes do Firestore

- `usuarios`      dados do usuario, papel, nota media, flag bloqueado/admin
- `veiculos`      um veiculo por motorista (id = uid)
- `viagens`       origem, destino, dataHora, vagas, valor, rota, regras, status
- `solicitacoes`  pedidos de vaga (pendente / aceita / recusada)
- `avaliacoes`    nota (1-5) + comentario, com anti-duplicacao
- `denuncias`     denuncias para moderacao
- `auditoria`     registro das acoes administrativas

## Como rodar

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com).
2. **Authentication** > ative o metodo **E-mail/Senha**.
   - Sem isso aparece o erro `auth/configuration-not-found`.
3. **Firestore Database** > crie o banco.
4. Cole o conteudo de `firestore.rules` em Firestore > Regras > Publicar.
5. Abra `js/firebase-config.js` e preencha com os dados do seu app Web.
6. Sirva o site por **localhost** (ex.: extensao *Live Server* do VS Code).
   - Nao abra por `file://`, o login do Firebase nao funciona assim.

## Tornar-se administrador

O primeiro admin e definido manualmente: no Firestore, abra o documento do seu
usuario na colecao `usuarios` e mude o campo `admin` para `true`.

## Fluxo de uso

- **Passageiro:** busca viagens (com filtros), ve detalhes, solicita vaga e
  acompanha o status no painel. Apos a viagem, avalia a experiencia.
- **Motorista:** cadastra o veiculo, cria viagens (rota, horario, vagas, regras),
  e aceita/recusa solicitacoes (com controle automatico de vagas).
- **Admin:** consulta metricas, bloqueia/desbloqueia usuarios, modera denuncias
  e ve o log de auditoria.

## Observacao sobre indices

Algumas consultas (ordenacao + filtro) podem pedir a criacao de um indice
composto. O proprio console mostra um link direto para criar quando isso ocorrer.


## Atualização de manutenção (14/10/2026)

- O arquivo `js/motorista.js` já concentra viagens, GPS e solicitações; referências a arquivos ausentes foram removidas do `motorista.html`.
- A consulta de solicitações do motorista agora inclui `motoristaUid`, compatível com as regras de acesso por usuário.
- Ao aceitar uma solicitação, o sistema verifica a viagem e reserva uma vaga em uma transação do Firestore. Os estados novos são `aceita` e `recusada`; estados antigos continuam reconhecidos na exibição.
- `firestore.rules` foi reforçado para impedir autoelevação a administrador e limitar alterações de perfil.
- O CSS inclui ajustes de responsividade e uma tela de login sem usar `logo2.png` como fundo.

### Antes de publicar
1. Faça backup das regras atuais no Firebase Console.
2. Revise `firestore.rules` e publique-as em **Firestore Database > Regras**. Regras locais não são publicadas automaticamente.
3. Teste com duas contas de teste (motorista e passageiro): cadastro, publicação, solicitação, aceite/recusa, cancelamento, GPS e encerramento.
4. Verifique os índices indicados pelo próprio Firestore quando alguma consulta composta solicitar um índice.
5. A configuração web do Firebase é mantida para compatibilidade; proteja o projeto com regras corretas, limites e monitoramento no Console.

Esta atualização foi verificada estaticamente e os arquivos JavaScript foram submetidos à verificação de sintaxe. O teste real de autenticação, permissões e GPS depende de executar o projeto no seu navegador e no Firebase.


## Avaliações gerais do aplicativo

- O menu de usuários autenticados inclui **Avaliar o app**.
- `avaliar-app.html` e `js/avaliar-app.js` permitem escolher de 1 a 5 estrelas e enviar um comentário de 3 a 1000 caracteres.
- As avaliações são salvas na coleção `avaliacoes_app`, separada de `avaliacoes` (que continua sendo usada para avaliações entre passageiros e motoristas).
- Cada usuário tem um documento com o próprio UID, podendo editar sua avaliação sem criar várias avaliações duplicadas.
- A página exibe a média geral e os comentários mais recentes.
- O painel administrativo mostra a quantidade, a média e os comentários recebidos.

### Importante: publicar as regras do Firestore

Depois de substituir os arquivos, abra **Firebase Console > Firestore Database > Regras**, copie o conteúdo atualizado de `firestore.rules` e clique em **Publicar**. As regras que estão apenas no computador não são aplicadas automaticamente ao Firebase.

Teste com uma conta de passageiro e outra de motorista. O teste real de leitura e gravação depende das regras publicadas e do projeto Firebase estar ativo.


## Foto de perfil do usuário

A página `perfil.html` agora permite escolher e enviar uma foto de perfil. A imagem é armazenada no Firebase Storage, e a URL fica no campo `fotoUrl` do documento do usuário na coleção `usuarios`. A foto também é usada no link **Perfil** do menu.

### Ativação necessária no Firebase

1. No Firebase Console, abra **Storage** e configure/ative o bucket do projeto `carona-test`.
2. Em **Firestore Database > Regras**, publique o arquivo `firestore.rules` atualizado incluído neste projeto. Ele permite salvar os campos `fotoUrl` e `fotoAtualizadaEm` sem permitir que usuários alterem seus privilégios.
3. Na área **Storage > Regras**, publique o conteúdo do arquivo `storage.rules` incluído neste projeto. Essas regras limitam o envio ao próprio usuário autenticado e aceitam somente JPG, PNG ou WEBP de até 5 MB.
4. Confirme que o bucket configurado no Firebase corresponde ao projeto usado em `js/firebase-config.js`.
5. Abra `perfil.html` pelo Live Server, escolha uma foto e clique em **Enviar foto**.

A disponibilidade e as condições de cobrança do Firebase Storage dependem da configuração e do plano atual do projeto no Firebase. O arquivo de regras local não é publicado automaticamente. Faça backup das regras atuais antes de alterá-las.
