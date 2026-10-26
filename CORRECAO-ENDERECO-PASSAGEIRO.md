# Correção do acompanhamento do passageiro

- O mapa continua usando Leaflet e OpenStreetMap.
- Foi adicionada uma linha que mostra o endereço aproximado (rua/bairro/cidade/estado), quando o serviço de geocodificação consegue identificar o local.
- O marcador do motorista mostra o mesmo endereço ao abrir o balão.
- As consultas de endereço são limitadas para não consultar o serviço em toda atualização do GPS.
- O motorista também grava a precisão informada pelo GPS em `localizacaoAtual.accuracy`.

**Importante:** o nome da rua depende dos dados cartográficos disponíveis no OpenStreetMap; em estradas rurais ou locais sem endereço mapeado, pode aparecer apenas bairro/cidade ou uma mensagem de endereço não identificado. A localização exata depende do GPS e das permissões do aparelho. O acompanhamento deve ser testado com o site servido por HTTPS ou em localhost.
