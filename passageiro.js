/* =====================================================
   VaiComigo - passageiro.js
   Busca de caronas + detalhes + solicitar vaga + avaliação.
   Trabalha com o esquema salvo pelo motorista:
   status="aberta", origem/destino, origemBusca/destinoBusca,
   dataHora (Timestamp), vagasDisponiveis, valor,
   motoristaUid, motoristaNome.
   ===================================================== */

/* ---------- Helpers ---------- */
function pjColViagens() { return (typeof VIAGENS_COLLECTION !== "undefined" && VIAGENS_COLLECTION) ? VIAGENS_COLLECTION : "viagens"; }
function pjColSolic()   { return (typeof SOLICITACOES_COLLECTION !== "undefined" && SOLICITACOES_COLLECTION) ? SOLICITACOES_COLLECTION : "solicitacoes"; }
function pjColAval()    { return (typeof AVALIACOES_COLLECTION !== "undefined" && AVALIACOES_COLLECTION) ? AVALIACOES_COLLECTION : "avaliacoes"; }

function pjEsc(s){ if(s==null) return ""; return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"); }
function pjToast(m,t){ if(typeof mostrarToast==="function"){ mostrarToast(m,t||"info"); } }
function pjMillis(ts){ if(!ts) return 0; if(typeof ts.toMillis==="function") return ts.toMillis(); if(ts.seconds!==undefined) return Number(ts.seconds)*1000; if(ts instanceof Date) return ts.getTime(); return 0; }
function pjNorm(s){ return String(s||"").trim().toLowerCase(); }

function pjPassageiro() {
  if (typeof USUARIO_ATUAL !== "undefined" && USUARIO_ATUAL && USUARIO_ATUAL.uid) {
    return { uid: USUARIO_ATUAL.uid, nome: USUARIO_ATUAL.nome || USUARIO_ATUAL.displayName || "Passageiro" };
  }
  try {
    if (firebase && firebase.auth && firebase.auth().currentUser) {
      var u = firebase.auth().currentUser;
      return { uid: u.uid, nome: u.displayName || "Passageiro" };
    }
  } catch (e) {}
  return null;
}

/* Cache das viagens encontradas (para abrir detalhes) */
var pjViagens = {};

/* Vagas pendentes ainda não aceitas: descontar apenas na exibição. */
var pjPendentesPorViagem = {};
var pjPendentesAcessiveis = false;
function pjLivres(v) {
  return Math.max(0, Number(v.vagasDisponiveis || 0) - Number(pjPendentesPorViagem[v.id] || 0));
}
function pjLerPendentes() {
  return db.collection(pjColSolic()).where("status", "==", "pendente").get().then(function (snap) {
    var mapa = {};
    snap.forEach(function (doc) {
      var s = doc.data(), id = String(s.viagemId || "");
      if (id) mapa[id] = (mapa[id] || 0) + Math.max(1, Number(s.vagasSolicitadas || 1));
    });
    pjPendentesPorViagem = mapa;
    pjPendentesAcessiveis = true;
  }).catch(function (erro) {
    if (erro && erro.code === "permission-denied") {
      console.warn("Consulta global de solicitações não autorizada; usando vagas confirmadas.");
      pjPendentesPorViagem = {};
      pjPendentesAcessiveis = false;
      return;
    }
    throw erro;
  });
}

/* ---------- BUSCAR VIAGENS ---------- */
function buscarViagens() {
  var box = document.getElementById("resultados");
  if (!box) return;
  if (typeof db === "undefined" || !db) {
    box.innerHTML = "<p class='vazio'>Conexão com o banco de dados indisponível.</p>";
    return;
  }

  box.innerHTML = "<p class='vazio'>🔄 Buscando caronas...</p>";

  var fOrigem  = pjNorm(document.getElementById("f-origem")  ? document.getElementById("f-origem").value  : "");
  var fDestino = pjNorm(document.getElementById("f-destino") ? document.getElementById("f-destino").value : "");
  var fData    = document.getElementById("f-data")  ? document.getElementById("f-data").value  : "";
  var fVagas   = Number(document.getElementById("f-vagas") ? document.getElementById("f-vagas").value : 1) || 1;
  var fValorEl = document.getElementById("f-valor");
  var fValor   = (fValorEl && fValorEl.value !== "") ? Number(fValorEl.value) : null;

  pjLerPendentes().then(function () {
    return db.collection(pjColViagens()).where("status", "==", "aberta").get();
  })
    .then(function (snap) {
      var lista = [];
      pjViagens = {};

      snap.forEach(function (doc) {
        var v = doc.data();
        v.id = doc.id;

        // Nunca oferecer uma viagem removida da visualização pelo motorista.
        if (v.ocultadaMotorista === true || v.ocultadaPassageiro === true) return;
        // Viagens antigas ainda marcadas como "aberta" no banco não são ofertadas.
        // Não alterar o registro financeiro nem excluir dados do Firestore.
        var horarioViagem = pjMillis(v.dataHora);
        if (horarioViagem && horarioViagem < Date.now()) return;

        var ob = pjNorm(v.origemBusca || v.origem);
        var dbs = pjNorm(v.destinoBusca || v.destino);

        /* filtros no cliente */
        if (fOrigem  && ob.indexOf(fOrigem)   === -1) return;
        if (fDestino && dbs.indexOf(fDestino) === -1) return;

        if (fData) {
          var ms = pjMillis(v.dataHora);
          if (ms) {
            var dv = new Date(ms);
            var y = dv.getFullYear();
            var m = ("0" + (dv.getMonth() + 1)).slice(-2);
            var d = ("0" + dv.getDate()).slice(-2);
            if ((y + "-" + m + "-" + d) !== fData) return;
          }
        }

        if (pjLivres(v) < fVagas) return;
        if (fValor !== null && Number(v.valor || 0) > fValor) return;

        lista.push(v);
        pjViagens[v.id] = v;
      });

      lista.sort(function (a, b) { return pjMillis(a.dataHora) - pjMillis(b.dataHora); });
      renderResultados(lista);
      if (!pjPendentesAcessiveis && lista.length) {
        var aviso = document.createElement("p");
        aviso.className = "vazio";
        aviso.textContent = "Atenção: vagas pendentes de confirmação não estão incluídas na contagem. Consulte o motorista antes de solicitar.";
        box.insertBefore(aviso, box.firstChild);
      }
    })
    .catch(function (erro) {
      console.error("Erro ao buscar viagens:", erro);
      if (erro && erro.code === "permission-denied") {
        box.innerHTML = "<p class='vazio'>❌ As regras do Firestore bloquearam a leitura das viagens.</p>";
      } else {
        box.innerHTML = "<p class='vazio'>❌ Erro ao buscar caronas.<br><small>" + pjEsc(erro.message || "") + "</small></p>";
      }
    });
}

/* ---------- RENDER RESULTADOS ---------- */
function renderResultados(lista) {
  var box = document.getElementById("resultados");
  if (!box) return;

  if (!lista.length) {
    box.innerHTML = "<p class='vazio'>Nenhuma carona encontrada para esses filtros.</p>";
    return;
  }

  var html = "";
  lista.forEach(function (v) {
    var dt = pjMillis(v.dataHora) ? new Date(pjMillis(v.dataHora)) : null;
    var dataTxt = dt
      ? dt.toLocaleDateString("pt-BR") + " " + dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      : "-";
    var valor = Number(v.valor || 0);
    var valorTxt = valor > 0 ? "R$ " + valor.toFixed(2).replace(".", ",") : "Grátis";

    html += "<div class='card'>" +
      "<h3 style='margin-bottom:6px'>" + pjEsc(v.origem || "-") + " → " + pjEsc(v.destino || "-") + "</h3>" +
      "<p class='meta'>👤 " + pjEsc(v.motoristaNome || "Motorista") + "</p>" +
      "<p style='margin-top:8px'>🗓️ " + dataTxt + "</p>" +
      "<p>💺 " + pjLivres(v) + " vaga(s) · 💰 " + valorTxt + "</p>" +
      "<button type='button' class='btn block' style='margin-top:12px' onclick=\"abrirDetalhesPassageiro('" + pjEsc(v.id) + "')\">Ver detalhes</button>" +
    "</div>";
  });

  box.innerHTML = html;
}

/* ---------- LIMPAR FILTROS ---------- */
function limparFiltrosPassageiro() {
  ["f-origem","f-destino","f-data","f-valor"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.value = "";
  });
  var vg = document.getElementById("f-vagas");
  if (vg) vg.value = "1";
  buscarViagens();
}

/* ---------- DETALHES DA VIAGEM ---------- */
function abrirDetalhesPassageiro(viagemId) {
  var v = pjViagens[viagemId];
  var alvo = document.getElementById("det-conteudo");
  var modal = document.getElementById("modal-det");
  if (!v || !alvo || !modal) return;

  var dt = pjMillis(v.dataHora) ? new Date(pjMillis(v.dataHora)) : null;
  var dataTxt = dt
    ? dt.toLocaleDateString("pt-BR") + " " + dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "-";
  var valor = Number(v.valor || 0);
  var valorTxt = valor > 0 ? "R$ " + valor.toFixed(2).replace(".", ",") : "Grátis";

  var html = "<h3>" + pjEsc(v.origem || "-") + " → " + pjEsc(v.destino || "-") + "</h3>" +
    "<p class='meta'>👤 Motorista: " + pjEsc(v.motoristaNome || "Motorista") + "</p>" +
    "<p style='margin-top:8px'>🗓️ <strong>" + dataTxt + "</strong></p>" +
    "<p>💺 " + pjLivres(v) + " vaga(s) · 💰 " + valorTxt + "</p>";

  if (v.rota)        html += "<p style='margin-top:8px'>🛣️ Rota: " + pjEsc(v.rota) + "</p>";
  if (v.regras)      html += "<p>📌 Regras: " + pjEsc(v.regras) + "</p>";
  if (v.observacoes) html += "<p>📝 Obs.: " + pjEsc(v.observacoes) + "</p>";

  var disponiveis = pjLivres(v);
  html += "<div style='margin-top:14px;max-width:220px'>" +
    "<label for='qtd-vagas-solicitadas' style='display:block;font-weight:600;margin-bottom:6px'>Quantas vagas você precisa?</label>" +
    "<select id='qtd-vagas-solicitadas' class='input' style='width:100%;padding:10px;border:1px solid #ccd5df;border-radius:8px' " + (disponiveis < 1 ? "disabled" : "") + ">";
  for (var q = 1; q <= disponiveis; q++) {
    html += "<option value='" + q + "'>" + q + (q === 1 ? " vaga" : " vagas") + "</option>";
  }
  html += "</select></div>";

  html += "<div style='display:flex;gap:8px;flex-wrap:wrap;margin-top:14px'>" +
    "<button type='button' class='btn verde' " + (disponiveis < 1 ? "disabled" : "") + " onclick=\"solicitarVaga('" + pjEsc(v.id) + "')\">✅ Solicitar vaga(s)</button>" +
    "<button type='button' class='btn' onclick=\"acompanharViagem('" + pjEsc(v.id) + "')\">📍 Acompanhar motorista</button>" +
  "</div>";

  alvo.innerHTML = html;

  /* esconde rastreamento até o passageiro clicar em acompanhar */
  var rast = document.getElementById("rastreamento-passageiro");
  if (rast) rast.style.display = "none";

  modal.classList.add("aberto");
  modal.style.display = "flex";
}

function fecharDetalhesPassageiro() {
  var modal = document.getElementById("modal-det");
  if (modal) { modal.classList.remove("aberto"); modal.style.display = "none"; }
  if (typeof pararRastreamentoPassageiro === "function") pararRastreamentoPassageiro();
}

/* ---------- SOLICITAR VAGA ---------- */
function solicitarVaga(viagemId) {
  var v = pjViagens[viagemId];
  if (!v) return;

  var pax = pjPassageiro();
  if (!pax) { pjToast("Faça login para solicitar uma vaga.", "err"); return; }

  var seletorQtd = document.getElementById("qtd-vagas-solicitadas");
  var vagasSolicitadas = Number(seletorQtd ? seletorQtd.value : 1);
  if (!Number.isInteger(vagasSolicitadas) || vagasSolicitadas < 1 || vagasSolicitadas > 4) {
    pjToast("Informe uma quantidade inteira entre 1 e 4 vagas.", "err");
    return;
  }
  var disponiveisAgora = pjLivres(v);
  if (vagasSolicitadas > disponiveisAgora || disponiveisAgora < 1) {
    pjToast("A quantidade de vagas solicitadas não está mais disponível. Atualize a busca.", "err");
    buscarViagens();
    return;
  }

  db.collection(pjColSolic())
    .where("passageiroUid", "==", pax.uid)
    .get()
    .then(function (snap) {
      var jaSolicitou = false;
      snap.forEach(function (doc) {
        if (doc.data().viagemId === viagemId && doc.data().status !== "cancelada") jaSolicitou = true;
      });
      if (jaSolicitou) {
        pjToast("Você já solicitou vaga nesta viagem.", "info");
        return null;
      }
      return pjLerPendentes().then(function () { return db.collection(pjColViagens()).doc(String(viagemId)).get(); }).then(function (docViagem) {
        if (!docViagem.exists) throw new Error("Viagem não encontrada.");
        var viagemAtual = docViagem.data();
        if (String(viagemAtual.status || "").toLowerCase() !== "aberta") {
          throw new Error("Esta viagem já foi iniciada ou encerrada.");
        }
        var livres = Math.max(0, Number(viagemAtual.vagasDisponiveis || 0) - Number(pjPendentesPorViagem[viagemId] || 0));
        if (livres < vagasSolicitadas) {
          throw new Error("Restam apenas " + livres + " vaga(s). Atualize a busca.");
        }
        return db.collection(pjColSolic()).add({
        viagemId: viagemId,
        viagemOrigem: v.origem || "",
        viagemDestino: v.destino || "",
        dataHora: v.dataHora || null,
        motoristaUid: v.motoristaUid || "",
        motoristaNome: v.motoristaNome || "",
        passageiroUid: pax.uid,
        passageiroNome: pax.nome,
        vagasSolicitadas: vagasSolicitadas,
        status: "pendente",
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });
      });
    })
    .then(function (res) {
      if (res) {
        pjToast("✅ Solicitação enviada ao motorista para " + vagasSolicitadas + (vagasSolicitadas === 1 ? " vaga." : " vagas."), "ok");
        fecharDetalhesPassageiro();
      }
    })
    .catch(function (erro) {
      console.error("Erro ao solicitar vaga:", erro);
      if (erro && erro.code === "permission-denied") {
        pjToast("As regras do Firestore bloquearam a solicitação.", "err");
      } else {
        pjToast((erro && erro.message) || "Não foi possível enviar a solicitação.", "err");
      }
    });
}

/* ---------- AVALIAÇÃO ---------- */
var pjNotaAval = 0;
var pjViagemAval = null;

function selecionarEstrela(n) {
  pjNotaAval = Number(n) || 0;
  var estrelas = document.querySelectorAll("#estrelas span");
  estrelas.forEach(function (el) {
    var val = Number(el.getAttribute("data-n"));
    if (val <= pjNotaAval) el.classList.add("ativo");
    else el.classList.remove("ativo");
  });
}

function enviarAvaliacao() {
  var pax = pjPassageiro();
  if (!pax) { pjToast("Faça login para avaliar.", "err"); return; }
  if (pjNotaAval < 1) { pjToast("Escolha uma nota de 1 a 5 estrelas.", "err"); return; }

  var coment = document.getElementById("aval-coment") ? document.getElementById("aval-coment").value.trim() : "";

  db.collection(pjColAval()).add({
    viagemId: pjViagemAval || null,
    passageiroUid: pax.uid,
    passageiroNome: pax.nome,
    nota: pjNotaAval,
    comentario: coment,
    criadoEm: firebase.firestore.FieldValue.serverTimestamp()
  }).then(function () {
    pjToast("⭐ Avaliação enviada. Obrigado!", "ok");
    pjNotaAval = 0;
    if (typeof fecharModal === "function") fecharModal("modal-aval");
    var el = document.getElementById("aval-coment"); if (el) el.value = "";
  }).catch(function (erro) {
    console.error("Erro ao enviar avaliação:", erro);
    pjToast("Não foi possível enviar a avaliação.", "err");
  });
}

/* ---------- CARGA INICIAL ---------- */
(function () {
  function tentar() {
    if (typeof db !== "undefined" && db && document.getElementById("resultados")) {
      buscarViagens();
      return true;
    }
    return false;
  }
  function loop() {
    var n = 0;
    var iv = setInterval(function () {
      n++;
      if (tentar() || n >= 20) clearInterval(iv);
    }, 500);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", loop);
  else loop();
})();

/* Expor no escopo global */
window.buscarViagens = buscarViagens;
window.limparFiltrosPassageiro = limparFiltrosPassageiro;
window.abrirDetalhesPassageiro = abrirDetalhesPassageiro;
window.fecharDetalhesPassageiro = fecharDetalhesPassageiro;
window.solicitarVaga = solicitarVaga;
window.selecionarEstrela = selecionarEstrela;
window.enviarAvaliacao = enviarAvaliacao;