# VaiComigo — melhorias do mapa

## O que mudou
- Mantém Leaflet e OpenStreetMap, sem chave de API paga.
- Na área do motorista, o botão **Ver rota no mapa** busca origem/destino e desenha a rota estimada.
- O mapa do motorista agora é inicializado automaticamente; os botões de GPS e centralização passam a funcionar para mostrar a localização do dispositivo no mapa.
- Na área do passageiro, o mapa pode desenhar a rota da viagem acompanhada e reconhece tanto `latitudeMotorista`/`longitudeMotorista` quanto `localizacaoAtual.latitude`/`localizacaoAtual.longitude` no Firestore.
- Mantém a atribuição do OpenStreetMap visível.
- Melhora o uso do host oficial de tiles do OpenStreetMap.

## Serviços usados
- Mapa: OpenStreetMap + Leaflet.
- Busca pontual de endereços: Photon (`photon.komoot.io`).
- Cálculo de rota de carro: OSRM demo (`router.project-osrm.org`).

## Importante sobre custos e disponibilidade
Não é necessário cadastrar cartão nem inserir chave de API para este protótipo. Porém, os servidores públicos de tiles, geocodificação e rotas são serviços comunitários/demonstração: podem ter limites, ficar indisponíveis ou bloquear uso excessivo e não oferecem garantia de funcionamento para uma aplicação comercial em produção. Se o VaiComigo crescer, escolha um provedor com condições de uso compatíveis ou hospede os serviços.

## Teste
1. Abra o projeto com Live Server ou em hospedagem HTTPS.
2. Entre como motorista e informe origem e destino com cidade/estado, por exemplo `Santa Maria do Suaçuí, MG` e `Governador Valadares, MG`.
3. Clique em **Ver rota no mapa**. Confira a linha azul, os marcadores, a distância e o tempo estimado.
4. Clique em **Iniciar GPS** e permita a localização do navegador para ver o marcador atual.
5. Teste o acompanhamento como passageiro durante uma viagem ativa.

O cálculo de rota depende da qualidade do endereço informado e dos serviços externos. A estimativa não substitui um app de navegação dedicado.
