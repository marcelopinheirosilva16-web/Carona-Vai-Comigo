// ==========================================
// ACOMPANHAMENTO.JS - MAPA E GPS EM TEMPO REAL
// ==========================================

let mapaAcompanhamento = null;
let marcadorVeiculo = null;
let intervaloAcompanhamento = null; // Variável para controlar eventuais loops ou temporizadores

// Inicializar o mapa de acompanhamento ao carregar a página
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("mapa-acompanhamento")) {
    mapaAcompanhamento = L.map("mapa-acompanhamento").setView([-18.188, -42.925], 14);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(mapaAcompanhamento);
  }
});

function iniciarAcompanhamentoUsuario() {
  // Não simular localização: o acompanhamento real usa o documento da viagem no Firestore.
  const status = document.getElementById("status-viagem");
  const local = document.getElementById("localizacao-veiculo");
  const ultima = document.getElementById("ultima-atualizacao");
  if (status) { status.className = "status-viagem status-offline";
    status.textContent = "Selecione uma viagem em andamento para acompanhar o GPS real."; }
  if (local) local.textContent = "Aguardando coordenadas reais do motorista.";
  if (ultima) ultima.textContent = "Nenhuma localização recebida.";
}

function pararAcompanhamentoUsuario() {
  const statusViagem = document.getElementById("status-viagem");
  const localizacaoVeiculo = document.getElementById("localizacao-veiculo");
  const ultimaAtualizacao = document.getElementById("ultima-atualizacao");

  // 1. Repor o estado visual para offline
  if (statusViagem) {
    statusViagem.className = "status-viagem status-offline";
    statusViagem.innerHTML = "⚪ Nenhuma viagem sendo acompanhada.";
  }

  // 2. Limpar textos de localização e atualização
  if (localizacaoVeiculo) {
    localizacaoVeiculo.innerText = "Aguardando localização...";
  }

  if (ultimaAtualizacao) {
    ultimaAtualizacao.innerText = "";
  }

  // 3. Remover o marcador do veículo do mapa
  if (mapaAcompanhamento && marcadorVeiculo) {
    mapaAcompanhamento.removeLayer(marcadorVeiculo);
    marcadorVeiculo = null;
    mapaAcompanhamento.setView([-18.188, -42.925], 14);
  }

  // 4. Parar qualquer temporizador ou loop ativo
  if (intervaloAcompanhamento) {
    clearInterval(intervaloAcompanhamento);
    intervaloAcompanhamento = null;
  }

  console.log("Acompanhamento parado com sucesso.");
}