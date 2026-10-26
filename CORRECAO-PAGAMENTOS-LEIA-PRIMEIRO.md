# Correção de permissões — VaiComigo

## O que foi corrigido

As regras de `pagamentosPassageiro` e `taxasPlataforma` agora permitem que o usuário autorizado consulte pelo ID um documento que ainda não existe, usando a solicitação ou viagem original para validar o acesso. Isso evita que a leitura inicial bloqueie toda a interface de pagamento. A consulta em lista continua restrita ao proprietário ou administrador.

## Instalação obrigatória

1. Faça backup do projeto e das regras atuais no Firebase.
2. Abra **Firebase Console > Firestore Database > Regras**.
3. Copie o conteúdo do arquivo `firestore.rules` deste ZIP e publique. **Salvar o arquivo no VS Code não publica regras no Firebase.**
4. Execute com Live Server e atualize com Ctrl+F5; entre com contas distintas de motorista e passageiro.
5. Teste: viagem concluída + solicitação com `status: "aceita"` + `viagemId` correto; no passageiro escolha forma de pagamento. Em seguida confira a confirmação manual do motorista.
6. Para taxa de 2%, confirme que o perfil administrativo em `usuarios/{uid}` tem `admin: true`, configurado por administrador autorizado.

## Limites e observações

Não houve alteração nos dados financeiros, GPS ou registros históricos. O código existente só mostra opções para solicitações aceitas ligadas a viagens com status `concluida`. Viagens concluídas sem solicitação aceita não geram pagamento para passageiro.

A taxa de 2% atualmente é calculada no código a partir de `viagens.valor` (valor unitário da viagem), e não necessariamente do total recebido por todos os passageiros. Revise a regra de negócio antes de uso real.

Se o erro continuar, registre a mensagem exata do console e a operação negada. As regras não foram publicadas nem testadas em seu projeto Firebase por este ZIP.
