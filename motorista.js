/* =====================================================
   VIAGENS-MOTORISTA.JS  (VaiComigo)
   Lista "Minhas viagens" em tempo real + Excluir viagem.
   Gerenciamento de solicitações corrigido e integrado.
   Início de Viagem e Transmissão de GPS em tempo real.
   ===================================================== */

function vmObterMotorista() {
  if (typeof USUARIO_ATUAL !== "undefined" && USUARIO_ATUAL && USUARIO_ATUAL.uid) {
    return { uid: USUARIO_ATUAL.uid, nome: USUARIO_ATUAL.nome || USUARIO_ATUAL.displayName || "Motorista" };
  }
  try {
    if (firebase && firebase.auth && firebase.auth().currentUser) {
      var u = firebase.auth().currentUser;
      return { uid: u.uid, nome: u.displayName || "Motorista" };
    }
  } catch (e) {}
  return null;
}
function vmColViagens() { return (typeof VIAGENS_COLLECTION !== "undefined" && VIAGENS_COLLECTION) ? VIAGENS_COLLECTION : "viagens"; }
function vmColSolic() { return (typeof SOLICITACOES_COLLECTION !== "undefined" && SOLICITACOES_COLLECTION) ? SOLICITACOES_COLLECTION : "solicitacoes"; }
function vmEsc(s){ if(s==null) return ""; return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"); }
function vmToast(m,t){ if(typeof mostrarToast==="function"){mostrarToast(m,t||"info");} else { alert(m); } }
function vmMillis(ts){ if(!ts) return 0; if(typeof ts.toMillis==="function") return ts.toMillis(); if(ts.seconds!==undefined) return Number(ts.seconds)*1000; if(ts instanceof Date) return ts.getTime(); return 0; }

var vmListenerViagens = null;

function carregarMinhasViagens() {
  var box = document.getElementById("minhas-viagens");
  if (!box) return;
  if (typeof db === "undefined" || !db) return;
  var mot = vmObterMotorista();
  if (!mot) return;

  if (vmListenerViagens) { vmListenerViagens(); vmListenerViagens = null; }

  vmListenerViagens = db.collection(vmColViagens())
    .where("motoristaUid", "==", mot.uid)
    .onSnapshot(function (snap) {
      var viagens = [];
      snap.forEach(function (doc) { var d = doc.data(); d.id = doc.id; if (d.ocultadaMotorista !== true) viagens.push(d); });
      viagens.sort(function (a, b) { return vmMillis(a.dataHora) - vmMillis(b.dataHora); });
      renderMinhasViagens(viagens);
    }, function (erro) {
      console.error("Erro ao carregar minhas viagens:", erro);
      box.innerHTML = "<p class='vazio'>❌ Erro ao carregar suas viagens.<br><small>" + vmEsc(erro.message || "") + "</small></p>";
    });
}

function renderMinhasViagens(viagens) {
  var box = document.getElementById("minhas-viagens");
  if (!box) return;

  if (!viagens.length) {
    box.innerHTML = "<p class='vazio'>Nenhuma viagem visível. Viagens concluídas ocultadas permanecem no Firebase.</p>";
    return;
  }

  var html = "<table><thead><tr>" +
    "<th>Origem → Destino</th><th>Data</th><th>Vagas disponíveis / total</th><th>Valor</th><th>Status</th><th>Ações</th>" +
    "</tr></thead><tbody>";

  viagens.forEach(function (v) {
    var dt = vmMillis(v.dataHora) ? new Date(vmMillis(v.dataHora)) : null;
    var dataTxt = dt
      ? dt.toLocaleDateString("pt-BR") + " " + dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      : "-";
    var valor = Number(v.valor || 0);
    var valorTxt = valor > 0 ? "R$ " + valor.toFixed(2).replace(".", ",") + " por pessoa" : "Grátis";
    var statusAtual = v.status || "aberta";

    html += "<tr>" +
      "<td>" + vmEsc(v.origem || "-") + " → " + vmEsc(v.destino || "-") + "</td>" +
      "<td>" + dataTxt + "</td>" +
      "<td>" + Number(v.vagasDisponiveis || 0) + " / " + Number(v.vagasTotais || v.vagas || v.vagasDisponiveis || 0) + "</td>" +
      "<td>" + valorTxt + "</td>" +
      "<td>" + vmEsc(statusAtual) + "</td>" +
      "<td>" +
        "<button type='button' class='btn' onclick=\"verSolicitacoes('" + vmEsc(v.id) + "')\">👥 Solicitações</button> ";
        
    if (statusAtual === "em_andamento") {
        html += "<button type='button' class='btn btn-vermelho' onclick=\"encerrarViagem('" + vmEsc(v.id) + "')\">⏹️ Encerrar viagem</button> ";
    } else if (statusAtual === "aberta") {
        html += "<button type='button' class='btn verde' onclick=\"iniciarViagemEGPS('" + vmEsc(v.id) + "')\">🚀 Iniciar viagem</button> ";
    } else {
        html += "<span class='badge-status'>" + vmEsc(statusAtual.replace(/_/g, " ")) + "</span> ";
    }

    html += (statusAtual === "concluida"
      ? "<button type='button' class='btn' onclick=\"ocultarViagemMotorista('" + vmEsc(v.id) + "')\">🗑️ Remover do histórico</button>"
      : "<button type='button' class='btn btn-vermelho' onclick=\"excluirViagem('" + vmEsc(v.id) + "')\">🗑️ Excluir</button>") +
      "</td>" +
    "</tr>";
  });

  html += "</tbody></table>";
  box.innerHTML = html;
}

function ocultarViagemMotorista(viagemId) {
  var mot = vmObterMotorista();
  if (!mot || !viagemId) { vmToast("Faça login como motorista.", "err"); return; }
  if (!window.confirm("Ocultar esta viagem concluída da sua lista? Os registros financeiros serão mantidos.")) return;
  var ref = db.collection(vmColViagens()).doc(viagemId);
  db.runTransaction(function(tx) {
    return tx.get(ref).then(function(doc) {
      if (!doc.exists) throw new Error("Viagem não encontrada.");
      var v = doc.data();
      if (v.motoristaUid !== mot.uid || v.status !== "concluida") {
        throw new Error("Somente o motorista responsável pode ocultar uma viagem concluída.");
      }
      tx.update(ref, { ocultadaMotorista: true });
    });
  }).then(function() { vmToast("Viagem ocultada. Registros preservados.", "ok"); })
    .catch(function(e) { console.error("Erro ao ocultar viagem:", e); vmToast(e.message, "err"); });
}
window.ocultarViagemMotorista = ocultarViagemMotorista;

function excluirViagem(viagemId) {
  if (!viagemId) return;
  // Viagens concluídas precisam permanecer para auditoria das taxas.
  db.collection(vmColViagens()).doc(viagemId).get().then(function(d){
    if (d.exists && d.data().status === "concluida") vmToast("Viagens concluídas não podem ser excluídas: há registros financeiros vinculados.", "err");
    else excluirViagemNaoConcluida(viagemId);
  }).catch(function(e){ vmToast(e.message, "err"); });
}
function excluirViagemNaoConcluida(viagemId) {
  var mot = vmObterMotorista();
  if (!mot) { vmToast("Faça login como motorista.", "err"); return; }

  if (!window.confirm("Deseja realmente excluir esta viagem? As solicitações dela também serão removidas.")) return;

  var refViagem = db.collection(vmColViagens()).doc(viagemId);

  db.collection(vmColSolic())
    .where("motoristaUid", "==", mot.uid)
    .get()
    .then(function (snap) {
      var batch = db.batch();
      snap.forEach(function (doc) {
        if (doc.data().viagemId === viagemId) batch.delete(doc.ref);
      });
      batch.delete(refViagem);
      return batch.commit();
    })
    .then(function () { vmToast("🗑️ Viagem excluída com sucesso.", "ok"); })
    .catch(function (erro) {
      console.error("Erro ao excluir viagem:", erro);
      vmToast("Não foi possível excluir a viagem.", "err");
    });
}

/* Criar Viagem */
if (typeof window.criarViagem !== "function") {
  window.criarViagem = function (e) {
    if (e && e.preventDefault) e.preventDefault();
    var mot = vmObterMotorista();
    if (!mot) { vmToast("Faça login como motorista.", "err"); return; }

    var origem = (document.getElementById("t-origem").value || "").trim();
    var destino = (document.getElementById("t-destino").value || "").trim();
    var dataStr = document.getElementById("t-data").value;
    var horaStr = document.getElementById("t-hora").value;
    var vagas = Number(document.getElementById("t-vagas").value || 0);
    var valor = Number(document.getElementById("t-valor").value || 0);
    var rota = document.getElementById("t-rota") ? (document.getElementById("t-rota").value || "").trim() : "";
    var regras = document.getElementById("t-regras") ? (document.getElementById("t-regras").value || "").trim() : "";
    var obs = document.getElementById("t-obs") ? (document.getElementById("t-obs").value || "").trim() : "";

    if (!origem || !destino || !dataStr || !horaStr || !Number.isFinite(vagas) || vagas <= 0) {
      vmToast("Preencha origem, destino, data, horário e uma quantidade válida de vagas.", "err");
      return;
    }
    // Fase intermunicipal: exigir cidade e UF explícitas. Não alterar viagens antigas.
    var padraoCidadeUF = /^.{2,}\s-\s[A-Za-z]{2}$/;
    if (!padraoCidadeUF.test(origem) || !padraoCidadeUF.test(destino)) {
      vmToast("Informe origem e destino no formato Cidade - UF (ex.: Peçanha - MG).", "err");
      return;
    }
    if (origem.toLocaleLowerCase() === destino.toLocaleLowerCase()) {
      vmToast("A origem e o destino precisam ser diferentes.", "err");
      return;
    }
    if (!Number.isFinite(valor) || valor < 0) {
      vmToast("Informe um valor válido. Para carona gratuita, use 0.", "err");
      return;
    }

    var quando = new Date(dataStr + "T" + horaStr + ":00");
    if (!Number.isFinite(quando.getTime()) || quando.getTime() <= Date.now()) {
      vmToast("A data e o horário da viagem precisam estar no futuro.", "err");
      return;
    }

    db.collection(vmColViagens()).add({
      tipoViagem: "intermunicipal",
      origemCidade: origem.replace(/\s-\s[A-Za-z]{2}$/, ""),
      origemUF: origem.slice(-2).toUpperCase(),
      destinoCidade: destino.replace(/\s-\s[A-Za-z]{2}$/, ""),
      destinoUF: destino.slice(-2).toUpperCase(),
      origem: origem,
      destino: destino,
      origemBusca: origem.toLowerCase(),
      destinoBusca: destino.toLowerCase(),
      dataHora: firebase.firestore.Timestamp.fromDate(quando),
      vagasDisponiveis: vagas,
      vagasTotais: vagas,
      vagasOcupadas: 0,
      vagas: vagas,
      valor: valor,
      rota: rota,
      regras: regras,
      observacoes: obs,
      status: "aberta",
      motoristaUid: mot.uid,
      motoristaNome: mot.nome,
      criadoEm: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function () {
      vmToast("🚗 Viagem publicada!", "ok");
      if (e && e.target && e.target.reset) e.target.reset();
    }).catch(function (erro) {
      console.error("Erro ao criar viagem:", erro);
      vmToast("Não foi possível publicar a viagem.", "err");
    });
  };
}

/* Salvar Veículo */
if (typeof window.salvarVeiculo !== "function") {
  window.salvarVeiculo = function (e) {
    if (e && e.preventDefault) e.preventDefault();
    var mot = vmObterMotorista();
    if (!mot) { vmToast("Faça login como motorista.", "err"); return; }

    var col = (typeof VEICULOS_COLLECTION !== "undefined" && VEICULOS_COLLECTION) ? VEICULOS_COLLECTION : "veiculos";

    db.collection(col).doc(mot.uid).set({
      modelo: (document.getElementById("v-modelo").value || "").trim(),
      cor: (document.getElementById("v-cor").value || "").trim(),
      placa: (document.getElementById("v-placa").value || "").trim().toUpperCase(),
      lugares: Number(document.getElementById("v-lugares").value || 0),
      motoristaUid: mot.uid,
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).then(function () {
      vmToast("💾 Veículo salvo!", "ok");
    }).catch(function (erro) {
      console.error("Erro ao salvar veículo:", erro);
      vmToast("Não foi possível salvar o veículo.", "err");
    });
  };
}

/* =====================================================
   COMPARTILHAMENTO DE LOCALIZAÇÃO E INÍCIO DA VIAGEM
   ===================================================== */
var vmWatchId = null;
var vmGPSUltimoEnvio = 0;
var vmGPSUltimaPosicao = null;
var vmGPSEnviando = false;
function vmDistanciaGPS(a, b) {
  var r = Math.PI / 180, dLat = (b.latitude-a.latitude)*r, dLon=(b.longitude-a.longitude)*r;
  var h = Math.sin(dLat/2)**2 + Math.cos(a.latitude*r)*Math.cos(b.latitude*r)*Math.sin(dLon/2)**2;
  return 12742000 * Math.asin(Math.min(1, Math.sqrt(h)));
}
function vmPararGPS() {
  if (vmWatchId !== null && navigator.geolocation) navigator.geolocation.clearWatch(vmWatchId);
  vmWatchId = null; vmGPSUltimaPosicao = null; vmGPSUltimoEnvio = 0;
}


window.iniciarViagemEGPS = function (viagemId) {
    var mot = vmObterMotorista();
    if (!mot) { vmToast("Faça login como motorista.", "err"); return; }
    if (!viagemId) { vmToast("ID da viagem inválido.", "err"); return; }
    if (!navigator.geolocation) { vmToast("Seu navegador não suporta geolocalização.", "err"); return; }
    vmPararGPS();

    // A viagem somente pode iniciar após o motorista aceitar ao menos uma solicitação.
    db.collection(vmColSolic()).where("motoristaUid", "==", mot.uid).get().then(function (snap) {
      var aceitas = 0;
      snap.forEach(function (d) {
        var x = d.data();
        if (x.viagemId === viagemId && (x.status === "aceita" || x.status === "aceito")) aceitas++;
      });
      if (!aceitas) throw new Error("Nenhum passageiro selecionado. Clique em Aceitar em pelo menos uma solicitação antes de iniciar a viagem.");
      vmToast("Solicitando localização para iniciar a viagem...", "info");
      navigator.geolocation.getCurrentPosition(function (position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        var refViagem = db.collection(vmColViagens()).doc(viagemId);

        refViagem.get().then(function (doc) {
            if (!doc.exists) throw new Error("Viagem não encontrada.");
            var viagem = doc.data();
            if (viagem.motoristaUid !== mot.uid) throw new Error("Você não tem permissão para iniciar esta viagem.");
            if (viagem.status !== "aberta") throw new Error("Somente viagens abertas podem ser iniciadas.");
            return refViagem.update({
                status: "em_andamento",
                "localizacaoAtual.latitude": lat,
                "localizacaoAtual.longitude": lng,
                "localizacaoAtual.accuracy": position.coords.accuracy,
                "localizacaoAtual.atualizadoEm": firebase.firestore.FieldValue.serverTimestamp(),
                atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
            });
        }).then(function () {
            vmToast("Viagem iniciada! O acompanhamento por GPS está ativo.", "ok");
            vmGPSUltimaPosicao = { latitude: lat, longitude: lng };
            vmGPSUltimoEnvio = Date.now();
            vmWatchId = navigator.geolocation.watchPosition(function (pos) {
                var c = pos.coords, agora = Date.now();
                if (!Number.isFinite(c.latitude) || !Number.isFinite(c.longitude) ||
                    !Number.isFinite(c.accuracy) || c.accuracy > 150 || vmGPSEnviando) return;
                var nova = { latitude: c.latitude, longitude: c.longitude };
                var distancia = vmGPSUltimaPosicao ? vmDistanciaGPS(vmGPSUltimaPosicao, nova) : Infinity;
                // Reduz gravações e descarta oscilações do GPS com o veículo parado.
                if (agora - vmGPSUltimoEnvio < 8000 ||
                    (distancia < Math.max(15, c.accuracy) && agora - vmGPSUltimoEnvio < 30000)) return;
                vmGPSEnviando = true;
                refViagem.update({
                    "localizacaoAtual.latitude": c.latitude,
                    "localizacaoAtual.longitude": c.longitude,
                    "localizacaoAtual.accuracy": c.accuracy,
                    "localizacaoAtual.atualizadoEm": firebase.firestore.FieldValue.serverTimestamp()
                }).then(function () {
                    vmGPSUltimaPosicao = nova; vmGPSUltimoEnvio = Date.now();
                }).catch(function (err) {
                    console.error("Erro ao atualizar GPS:", err);
                }).finally(function () { vmGPSEnviando = false; });
            }, function (error) {
                console.error("Erro no GPS em tempo real:", error);
                if (error.code === 1) vmToast("Permissão de localização negada. Ative o GPS para compartilhar a posição.", "err");
                else console.warn("GPS temporariamente indisponível; aguardando nova posição.");
            }, { enableHighAccuracy: true, maximumAge: 3000, timeout: 20000 });
        }).catch(function (err) {
            console.error("Erro ao iniciar viagem:", err);
            vmToast(err.message || "Não foi possível iniciar a viagem.", "err");
        });
    }, function (err) {
        console.error("Erro ao obter GPS inicial:", err);
        vmToast("Permita o acesso à localização para iniciar a viagem.", "err");
      }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
    }).catch(function (e) { console.error(e); vmToast(e.message || "Não foi possível verificar os passageiros.", "err"); alert(e.message || "Não foi possível iniciar a viagem."); });
};

window.encerrarViagem = function (viagemId) {
    if (!viagemId) return;
    if (!window.confirm("Deseja encerrar esta viagem?")) return;

    vmPararGPS();

    var mot = vmObterMotorista();
    if (!mot) { vmToast("Faça login como motorista.", "err"); return; }
    var refViagem = db.collection(vmColViagens()).doc(viagemId);
    refViagem.get().then(function (doc) {
      if (!doc.exists) throw new Error("Viagem não encontrada.");
      if (doc.data().motoristaUid !== mot.uid) throw new Error("Você não tem permissão para encerrar esta viagem.");
      if (doc.data().status !== "em_andamento") throw new Error("Esta viagem não está em andamento.");
      return refViagem.update({
        status: "concluida",
        encerradoEm: firebase.firestore.FieldValue.serverTimestamp(),
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });
    }).then(function () {
        vmToast("🏁 Viagem encerrada com sucesso!", "ok");
    }).catch(function (err) {
        console.error("Erro ao encerrar viagem:", err);
        vmToast("Erro ao encerrar viagem.", "err");
    });
};

/* =====================================================
   PAINEL DE SOLICITAÇÕES DO MOTORISTA
   ===================================================== */
function verSolicitacoes(viagemId) {
    var motorista = vmObterMotorista();
    if (!viagemId || !motorista || typeof db === "undefined" || !db) return;

    db.collection(vmColSolic())
      .where("motoristaUid", "==", motorista.uid)
      .get()
      .then(function (snap) {
          var solicitacoes = [];
          snap.forEach(function (doc) {
              var d = doc.data();
              if (String(d.viagemId || "") !== String(viagemId)) return;
              d.id = doc.id;
              solicitacoes.push(d);
          });
          // Completa nomes antigos consultando o perfil pelo UID, sem modificar solicitações.
          // Se a conta foi excluída/anonimizada, preserva o nome histórico quando existir.
          return Promise.all(solicitacoes.map(function (sol) {
              var nome = String(sol.passageiroNome || '').trim();
              if (nome && nome.toLowerCase() !== 'passageiro' && nome.toLowerCase() !== 'usuário desativado') return Promise.resolve();
              if (!sol.passageiroUid) return Promise.resolve();
              return db.collection(USUARIOS_COLLECTION).doc(sol.passageiroUid).get()
                  .then(function (perfil) {
                      if (!perfil.exists) return;
                      var p = perfil.data() || {};
                      var encontrado = String(p.nome || '').trim();
                      if (encontrado && encontrado.toLowerCase() !== 'usuário desativado') sol.passageiroNome = encontrado;
                  }).catch(function (e) { console.warn('Nome do passageiro indisponível:', e); });
          })).then(function () { renderPainelSolicitacoes(viagemId, solicitacoes); });
      })
      .catch(function (erro) {
          console.error("Erro ao carregar solicitações:", erro);
          vmToast("Erro ao carregar solicitações.", "err");
      });
}

function renderPainelSolicitacoes(viagemId, solicitacoes) {
    var containerId = "painel-solicitacoes-modal";
    var painel = document.getElementById(containerId);

    if (!painel) {
        painel = document.createElement("div");
        painel.id = containerId;
        painel.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:9999;";
        document.body.appendChild(painel);
    }

    var htmlConteudo = `
        <div style="background:white; padding:25px; border-radius:10px; width:90%; max-width:600px; max-height:80vh; overflow-y:auto; box-shadow:0 4px 15px rgba(0,0,0,0.3);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h3 style="margin:0;">Gerenciar Solicitações</h3>
                <button type="button" onclick="fecharPainelSolicitacoes()" style="background:none; border:none; font-size:18px; cursor:pointer;">❌</button>
            </div>
    `;

    if (solicitacoes.length === 0) {
        htmlConteudo += "<p style='color:#666;'>Nenhum passageiro solicitou vaga nesta viagem ainda.</p>";
    } else {
        htmlConteudo += "<table style='width:100%; border-collapse:collapse;'><thead><tr style='border-bottom:1px solid #ddd; text-align:left;'><th>Passageiro</th><th>Vagas pedidas</th><th>Status</th><th>Ações</th></tr></thead><tbody>";
        
        solicitacoes.forEach(function (s) {
            var statusBadge = s.status || "pendente";
            var corStatus = (statusBadge === "aceita" || statusBadge === "aceito") ? "green" : ((statusBadge === "recusada" || statusBadge === "recusado") ? "red" : "orange");

            var qtdPedida = Math.max(1, Number(s.vagasSolicitadas || 1));
            htmlConteudo += `<tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px;">${vmEsc(s.passageiroNome || "Passageiro")}</td>
                <td style="padding:10px;">${qtdPedida} ${qtdPedida === 1 ? "vaga" : "vagas"}</td>
                <td style="padding:10px; color:${corStatus}; font-weight:bold;">${vmEsc(statusBadge)}</td>
                <td style="padding:10px;">`;
            
            if (statusBadge === "pendente") {
                htmlConteudo += `
                    <button type="button" onclick="responderSolicitacao('${vmEsc(s.id)}', 'aceita', '${vmEsc(viagemId)}')" style="background:green; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; margin-right:5px;">Aceitar</button>
                    <button type="button" onclick="responderSolicitacao('${vmEsc(s.id)}', 'recusada', '${vmEsc(viagemId)}')" style="background:#b91c1c; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Recusar</button>
                `;
            } else if ((statusBadge === "aceita" || statusBadge === "aceito") && s.alteracaoVagasPendente) {
                htmlConteudo += `<div style="font-size:12px">Alterar de ${qtdPedida} para ${Number(s.novaQuantidadeVagas)} vaga(s)</div>
                  <button type="button" onclick="responderAlteracaoVagas('${vmEsc(s.id)}', '${vmEsc(viagemId)}', true)">Aprovar alteração</button>
                  <button type="button" onclick="responderAlteracaoVagas('${vmEsc(s.id)}', '${vmEsc(viagemId)}', false)">Recusar alteração</button>`;
            } else {
                htmlConteudo += `<span style="font-size:12px; color:#888;">${statusBadge.toUpperCase()}</span>`;
            }

            if (statusBadge === "aceita" || statusBadge === "aceito") {
                htmlConteudo += `<a class="btn" style="display:inline-block;margin-top:6px;padding:6px 10px" href="chat.html?solicitacao=${encodeURIComponent(s.id)}">💬 Conversar</a>`;
                htmlConteudo += s.embarcado === true
                  ? `<span style="display:block;color:green">✅ Passageiro embarcado</span>`
                  : `<button type="button" class="btn" style="display:block;margin-top:6px" onclick="confirmarEmbarqueMotorista('${vmEsc(s.id)}', '${vmEsc(viagemId)}')">✅ Confirmar embarque</button>`;
            }
            htmlConteudo += `</td></tr>`;
        });

        htmlConteudo += "</tbody></table>";
    }

    htmlConteudo += `</div>`;
    painel.innerHTML = htmlConteudo;
    painel.style.display = "flex";
}

window.fecharPainelSolicitacoes = function () {
    var painel = document.getElementById("painel-solicitacoes-modal");
    if (painel) {
        painel.style.display = "none";
    }
};


window.responderAlteracaoVagas = function(solicitacaoId, viagemId, aprovar) {
  var mot = vmObterMotorista();
  if (!mot) return vmToast("Motorista não autenticado.", "err");
  var sr = db.collection(vmColSolic()).doc(solicitacaoId);
  var vr = db.collection(vmColViagens()).doc(viagemId);
  db.runTransaction(async function(tx) {
    var docs = await Promise.all([tx.get(sr), tx.get(vr)]);
    if (!docs[0].exists || !docs[1].exists) throw new Error("Dados não encontrados.");
    var s = docs[0].data(), v = docs[1].data();
    if (s.motoristaUid !== mot.uid || v.motoristaUid !== mot.uid || s.viagemId !== viagemId) throw new Error("Acesso negado.");
    if (!["aceita", "aceito"].includes(s.status) || !s.alteracaoVagasPendente || v.status !== "aberta") throw new Error("Alteração não está mais disponível.");
    var anterior = Number(s.vagasSolicitadas || 1), nova = Number(s.novaQuantidadeVagas);
    if (!Number.isInteger(nova) || nova < 1 || nova > 4) throw new Error("Quantidade inválida.");
    if (aprovar) {
      var livres = Number(v.vagasDisponiveis || 0), delta = nova - anterior;
      if (delta > livres) throw new Error("Não há vagas suficientes para aprovar.");
      tx.update(vr, {vagasDisponiveis:livres-delta, vagasOcupadas:Number(v.vagasOcupadas || 0)+delta});
    }
    var update = {alteracaoVagasPendente:false, novaQuantidadeVagas:firebase.firestore.FieldValue.delete(), alteracaoRespondidaEm:firebase.firestore.FieldValue.serverTimestamp()};
    if (aprovar) update.vagasSolicitadas = nova;
    tx.update(sr, update);
  }).then(function(){vmToast(aprovar ? "Alteração aprovada." : "Alteração recusada.","ok");verSolicitacoes(viagemId);})
    .catch(function(e){console.error(e);vmToast(e.message || "Erro ao responder alteração.","err");});
};

window.responderSolicitacao = function (solicitacaoId, novoStatus, viagemId) {
    var mot = vmObterMotorista();
    if (!mot || !solicitacaoId || !viagemId) {
      vmToast("Não foi possível identificar o motorista ou a viagem.", "err");
      return;
    }
    if (novoStatus !== "aceita" && novoStatus !== "recusada") {
      vmToast("Status de solicitação inválido.", "err");
      return;
    }

    var refSolic = db.collection(vmColSolic()).doc(solicitacaoId);
    var refViagem = db.collection(vmColViagens()).doc(viagemId);

    db.runTransaction(function (tx) {
      return Promise.all([tx.get(refSolic), tx.get(refViagem)]).then(function (docs) {
        var docSolic = docs[0];
        var docViagem = docs[1];
        if (!docSolic.exists || !docViagem.exists) throw new Error("Solicitação ou viagem não encontrada.");
        var solicitacao = docSolic.data();
        var viagem = docViagem.data();
        if (solicitacao.motoristaUid !== mot.uid || viagem.motoristaUid !== mot.uid) {
          throw new Error("Você não tem permissão para alterar esta solicitação.");
        }
        if (String(solicitacao.viagemId || "") !== String(viagemId)) {
          throw new Error("A solicitação pertence a outra viagem. Atualize a lista de solicitações.");
        }
        if (String(solicitacao.status || "").trim().toLowerCase() !== "pendente") {
          throw new Error("Esta solicitação está com status '" + (solicitacao.status || "indefinido") + "'. Atualize a lista antes de responder.");
        }
        var atualizacoes = {
          status: novoStatus,
          atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
        };
        if (novoStatus === "aceita") {
          var vagas = Number(viagem.vagasDisponiveis || 0);
          var qtdSolicitada = Number(solicitacao.vagasSolicitadas || 1);
          if (!Number.isInteger(qtdSolicitada) || qtdSolicitada < 1 || qtdSolicitada > 4) {
            throw new Error("Quantidade solicitada inválida. Peça ao passageiro para corrigir.");
          }
          if (String(viagem.status || "").trim().toLowerCase() !== "aberta") {
            throw new Error("A viagem não está aberta (status: " + viagem.status + "). Não é possível reservar vagas.");
          }
          if (!Number.isFinite(vagas) || vagas < 0 || vagas < qtdSolicitada) {
            throw new Error("Não há vagas suficientes. Disponíveis agora: " + vagas + ". Solicitação: " + qtdSolicitada + ".");
          }
          var totalVagas = Number(viagem.vagasTotais || viagem.vagas || (vagas + Number(viagem.vagasOcupadas || 0)));
          var ocupadas = Number(viagem.vagasOcupadas || Math.max(0, totalVagas - vagas));
          tx.update(refViagem, {
            vagasDisponiveis: vagas - qtdSolicitada,
            vagasTotais: totalVagas,
            vagasOcupadas: ocupadas + qtdSolicitada
          });
        }
        tx.update(refSolic, atualizacoes);
      });
    }).then(function () {
      vmToast(novoStatus === "aceita" ? "Solicitação aceita: " + "vaga(s) reservada(s)." : "Solicitação recusada.", "ok");
      verSolicitacoes(viagemId);
    }).catch(function (erro) {
      verSolicitacoes(viagemId); // atualiza o modal quando o documento mudou em outra tela
      console.error("Erro ao processar solicitação:", erro);
      vmToast(erro.message || "Erro ao processar solicitação. Verifique as regras do Firestore.", "err");
    });
};

(function () {
  function tentar() {
    if (vmObterMotorista() && typeof db !== "undefined" && db) {
      carregarMinhasViagens();
      return true;
    }
    return false;
  }
  function loop() {
    var n = 0;
    var iv = setInterval(function () {
      n++;
      if (tentar() || n >= 20) { clearInterval(iv); }
    }, 500);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loop);
  } else {
    loop();
  }
})();

window.carregarMinhasViagens = carregarMinhasViagens;
window.excluirViagem = excluirViagem;
window.verSolicitacoes = verSolicitacoes;
// Confirmação individual pelo motorista, sem participação do passageiro.
window.confirmarEmbarqueMotorista = function (solicitacaoId, viagemId) {
  var mot = vmObterMotorista();
  if (!mot || !solicitacaoId || !viagemId) return;
  if (!confirm("Confirmar que este passageiro embarcou?")) return;
  var ref = db.collection(vmColSolic()).doc(solicitacaoId);
  ref.get().then(function (doc) {
    if (!doc.exists) throw new Error("Solicitação não encontrada.");
    var s = doc.data();
    if (s.motoristaUid !== mot.uid || s.viagemId !== viagemId || !["aceita", "aceito"].includes(s.status))
      throw new Error("Somente o motorista pode confirmar o embarque de um passageiro aceito.");
    if (s.embarcado === true) return;
    return ref.update({embarcado: true, embarcadoEm: firebase.firestore.FieldValue.serverTimestamp()});
  }).then(function () {
    vmToast("Embarque confirmado!", "ok");
    if (typeof window.abrirPainelSolicitacoes === "function") window.abrirPainelSolicitacoes(viagemId);
  }).catch(function (e) { console.error(e); vmToast(e.message || "Erro ao confirmar embarque.", "err"); });
};
