# VaiComigo — Integração financeira experimental

## O que foi incluído
- Motorista: geração de uma taxa de 2% **por viagem concluída**, com arredondamento em centavos, chave Pix e referência do comprovante.
- Administrador: configuração da chave Pix e WhatsApp, lista de taxas e confirmação manual de recebimento.
- Passageiro: escolha de Pix, dinheiro ou maquininha para solicitação aceita de viagem concluída. **A escolha não representa pagamento confirmado**.
- Firestore: novas coleções `taxasPlataforma`, `configFinanceira`, `pagamentosPassageiro` com regras de acesso.

## Instalação
1. Faça backup do projeto e das regras atuais.
2. No Firebase Console, Firestore Database > Regras, publique o conteúdo do `firestore.rules` incluído. Revise antes de publicar.
3. Execute pelo VS Code com Live Server, preferencialmente em localhost. Entre como administrador em `admin.html` e cadastre a chave Pix e WhatsApp.
4. Teste com contas separadas de motorista, passageiro e administrador, usando uma viagem de teste concluída.
5. Verifique no Firestore as coleções novas e os status `pendente`, `comprovante_enviado` e `paga`.

## Limitações importantes
- Não há API de pagamentos: nenhuma transação Pix é executada ou verificada automaticamente.
- O motorista informa uma **referência textual** do comprovante no sistema. A imagem do comprovante pode ser encaminhada ao WhatsApp cadastrado, mas **não é anexada ao Firebase**.
- A chave Pix do motorista não é coletada; o Pix da viagem é combinado diretamente entre passageiro e motorista.
- Uma taxa é criada por viagem concluída (não por passageiro). Confirme se essa é sua regra comercial antes de publicar.
- Não foi realizado teste ponta a ponta com seu projeto Firebase real. Valide regras e permissões em ambiente de testes.
- Viagens concluídas não podem mais ser excluídas pelo motorista, preservando o vínculo financeiro.
- Regras permitem que administradores editem registros financeiros; mantenha controle de acesso administrativo rigoroso.

## Correção de visibilidade
A escolha de Pix, dinheiro ou maquininha agora aparece na Área do Passageiro assim que a solicitação for aceita pelo motorista. Antes da aceitação, não aparece. Atualize as regras Firestore incluídas neste ZIP para permitir registrar a escolha antes da conclusão. A taxa de 2% permanece gerada apenas após a conclusão.
