/* =========================================================
   VaiComigo — melhorias de mapa sem chave de API
   Leaflet + OpenStreetMap + Photon + OSRM
   Nota: serviços públicos gratuitos são best-effort e têm
   políticas/limites próprios. Não são SLA de produção.
   ========================================================= */
(function () {
  "use strict";

  var TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  var atribuicao = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors';
  var mapaMotoristaMelhorado = null;
  var marcadorGPSMotorista = null;
  var watchGPSMapa = null;
  var camadaRotaMotorista = null;
  var camadaRotaPassageiro = null;
  var assinaturaRotaPassageiro = "";

  function mostrarMensagem(texto, tipo) {
    var toast = document.getElementById("toast");
    if (toast) {
      toast.textContent = texto;
      toast.className = "toast show";
      toast.style.display = "block";
      toast.style.background = tipo === "erro" ? "#b91c1c" : "#1565c0";
      window.setTimeout(function () { toast.style.display = "none"; }, 5000);
    } else {
      window.alert(texto);
    }
  }

  function adicionarCamadaBase(mapa) {
    L.tileLayer(TILE_URL, {
      maxZoom: 19,
      attribution: atribuicao
    }).addTo(mapa);
  }

  function iniciarMapaMotorista() {
    var elemento = document.getElementById("mapa-motorista");
    if (!elemento || !window.L || mapaMotoristaMelhorado) return;

    mapaMotoristaMelhorado = L.map(elemento, {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView([-18.188, -42.925], 12);

    adicionarCamadaBase(mapaMotoristaMelhorado);
    L.control.scale({ imperial: false }).addTo(mapaMotoristaMelhorado);
    window.mapaMotoristaMelhorado = mapaMotoristaMelhorado;

    window.setTimeout(function () {
      if (mapaMotoristaMelhorado) mapaMotoristaMelhorado.invalidateSize();
    }, 350);
  }

  function obterMapaPassageiro() {
    var elemento = document.getElementById("mapa-passageiro");
    if (!elemento || !window.L) return null;

    // Reaproveita o mapa já criado pelo módulo de rastreamento.
    if (typeof mapaPassageiro !== "undefined" && mapaPassageiro) return mapaPassageiro;

    mapaPassageiro = L.map(elemento, {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView([-18.188, -42.925], 12);
    adicionarCamadaBase(mapaPassageiro);
    L.control.scale({ imperial: false }).addTo(mapaPassageiro);
    window.setTimeout(function () {
      if (mapaPassageiro) mapaPassageiro.invalidateSize();
    }, 350);
    return mapaPassageiro;
  }

  async function geocodificar(endereco) {
    var consulta = String(endereco || "").trim();
    if (!consulta) throw new Error("Informe a origem e o destino.");
    if (!/brasil|brazil/i.test(consulta)) consulta += ", Brasil";

    var url = "https://photon.komoot.io/api/?q=" + encodeURIComponent(consulta) + "&limit=1&lang=pt";
    var resposta = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!resposta.ok) throw new Error("O serviço de busca de endereços está indisponível no momento.");
    var dados = await resposta.json();
    var item = dados && dados.features && dados.features[0];
    if (!item || !item.geometry || !item.geometry.coordinates) {
      throw new Error('Não encontrei o endereço "' + endereco + '". Tente informar cidade e estado.');
    }
    return {
      lon: Number(item.geometry.coordinates[0]),
      lat: Number(item.geometry.coordinates[1]),
      nome: [item.properties.name, item.properties.city, item.properties.state].filter(Boolean).join(", ") || consulta
    };
  }

  async function calcularRota(origemTexto, destinoTexto, mapa, tipo) {
    if (!mapa) throw new Error("O mapa ainda não está disponível.");
    var origem = await geocodificar(origemTexto);
    var destino = await geocodificar(destinoTexto);
    var url = "https://router.project-osrm.org/route/v1/driving/" +
      origem.lon + "," + origem.lat + ";" + destino.lon + "," + destino.lat +
      "?overview=full&geometries=geojson&steps=true";
    var resposta = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!resposta.ok) throw new Error("Não foi possível calcular a rota agora. Tente novamente mais tarde.");
    var dados = await resposta.json();
    if (!dados.routes || !dados.routes.length || !dados.routes[0].geometry) {
      throw new Error("Não foi encontrada uma rota de carro entre esses locais.");
    }

    var camada = tipo === "motorista" ? camadaRotaMotorista : camadaRotaPassageiro;
    if (camada) mapa.removeLayer(camada);
    camada = L.layerGroup().addTo(mapa);
    var coords = dados.routes[0].geometry.coordinates.map(function (p) { return [p[1], p[0]]; });
    L.polyline(coords, { color: "#1565c0", weight: 6, opacity: 0.88, lineJoin: "round" }).addTo(camada);
    L.marker([origem.lat, origem.lon]).addTo(camada).bindPopup("<strong>Origem</strong><br>" + escaparHTML(origemTexto));
    L.marker([destino.lat, destino.lon]).addTo(camada).bindPopup("<strong>Destino</strong><br>" + escaparHTML(destinoTexto));
    if (tipo === "motorista") camadaRotaMotorista = camada; else camadaRotaPassageiro = camada;
    mapa.fitBounds(L.latLngBounds(coords).pad(0.12));

    var km = (dados.routes[0].distance / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
    var minutos = Math.round(dados.routes[0].duration / 60);
    mostrarMensagem("Rota calculada: aproximadamente " + km + " km e " + minutos + " min. O tempo é estimado.", "ok");
  }

  function escaparHTML(texto) {
    return String(texto).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  window.preverRotaMotorista = async function () {
    var origem = document.getElementById("t-origem");
    var destino = document.getElementById("t-destino");
    if (!origem || !destino || !origem.value.trim() || !destino.value.trim()) {
      mostrarMensagem("Preencha a origem e o destino antes de calcular a rota.", "erro");
      return;
    }
    iniciarMapaMotorista();
    var botao = document.getElementById("btn-prever-rota-motorista");
    if (botao) { botao.disabled = true; botao.textContent = "Calculando rota..."; }
    try {
      await calcularRota(origem.value, destino.value, mapaMotoristaMelhorado, "motorista");
    } catch (erro) {
      console.error("Erro ao calcular rota do motorista:", erro);
      mostrarMensagem(erro.message || "Não foi possível calcular a rota.", "erro");
    } finally {
      if (botao) { botao.disabled = false; botao.textContent = "🗺️ Ver rota no mapa"; }
    }
  };

  window.vaiComigoDesenharRotaPassageiro = async function (origem, destino) {
    var mapa = obterMapaPassageiro();
    if (!mapa || !origem || !destino) return;
    var assinatura = String(origem).trim() + "|" + String(destino).trim();
    // O Firestore envia atualizações frequentes do GPS: não recalcular a rota a cada atualização.
    if (assinatura === assinaturaRotaPassageiro && camadaRotaPassageiro) return;
    try {
      await calcularRota(origem, destino, mapa, "passageiro");
      assinaturaRotaPassageiro = assinatura;
    } catch (erro) {
      console.warn("Rota da viagem não pôde ser desenhada:", erro.message);
    }
  };

  window.iniciarGPSMotoristaManual = function () {
    iniciarMapaMotorista();
    if (!navigator.geolocation) {
      mostrarMensagem("Este navegador não oferece geolocalização.", "erro");
      return;
    }
    if (watchGPSMapa !== null) navigator.geolocation.clearWatch(watchGPSMapa);
    var status = document.getElementById("gps-status");
    if (status) { status.className = "gps-status gps-online"; status.textContent = "📍 Obtendo localização do dispositivo..."; }

    watchGPSMapa = navigator.geolocation.watchPosition(function (pos) {
      var lat = pos.coords.latitude;
      var lon = pos.coords.longitude;
      var ponto = [lat, lon];
      if (!marcadorGPSMotorista) {
        marcadorGPSMotorista = L.marker(ponto).addTo(mapaMotoristaMelhorado).bindPopup("📍 Sua localização");
      } else {
        marcadorGPSMotorista.setLatLng(ponto);
      }
      mapaMotoristaMelhorado.setView(ponto, Math.max(mapaMotoristaMelhorado.getZoom(), 15));
      var coordenadas = document.getElementById("gps-coordenadas");
      if (coordenadas) coordenadas.textContent = "Latitude: " + lat.toFixed(6) + " | Longitude: " + lon.toFixed(6) + " | Precisão aproximada: " + Math.round(pos.coords.accuracy) + " m";
      if (status) { status.className = "gps-status gps-online"; status.textContent = "🟢 Localização atualizada no mapa. Para compartilhar com passageiros, inicie a viagem."; }
    }, function (erro) {
      console.error("GPS do mapa:", erro);
      if (status) { status.className = "gps-status gps-erro"; status.textContent = "Não foi possível acessar o GPS. Confira a permissão de localização e use HTTPS ou localhost."; }
      mostrarMensagem("Ative a permissão de localização do navegador e tente novamente.", "erro");
    }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 });
  };

  window.pararGPSMotoristaManual = function () {
    if (watchGPSMapa !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchGPSMapa);
    watchGPSMapa = null;
    var status = document.getElementById("gps-status");
    if (status) { status.className = "gps-status gps-offline"; status.textContent = "⚪ Atualização visual do GPS parada. A transmissão da viagem, se iniciada, é controlada pelo botão de encerrar viagem."; }
  };

  window.centralizarMotorista = function () {
    if (mapaMotoristaMelhorado && marcadorGPSMotorista) {
      mapaMotoristaMelhorado.setView(marcadorGPSMotorista.getLatLng(), 16);
    } else {
      mostrarMensagem("Clique em Iniciar GPS para localizar o dispositivo no mapa.", "erro");
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    iniciarMapaMotorista();
  });
})();
