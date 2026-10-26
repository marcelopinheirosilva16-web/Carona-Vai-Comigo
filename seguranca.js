/* VaiComigo — segurança da conta e envio de denúncias.
   Validação no navegador melhora a experiência; a autorização real deve estar nas regras do Firestore. */
(function () {
  "use strict";
  var envioEmAndamento = false;

  function texto(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || "").trim() : "";
  }
  function mensagem(tipo, msg) {
    if (tipo === "ok" && typeof ok === "function") return ok(msg);
    if (tipo !== "ok" && typeof err === "function") return err(msg);
    if (typeof mostrarToast === "function") return mostrarToast(msg, tipo === "ok" ? "success" : "error");
    window.alert(msg);
  }
  function uidAtual() {
    try {
      return (typeof USUARIO_ATUAL !== "undefined" && USUARIO_ATUAL && USUARIO_ATUAL.uid) ||
        (firebase.auth().currentUser && firebase.auth().currentUser.uid) || "";
    } catch (_) { return ""; }
  }

  window.enviarDenuncia = function (e) {
    if (e) e.preventDefault();
    if (envioEmAndamento) return;

    var uid = uidAtual();
    if (!uid) { mensagem("erro", "Entre na sua conta para enviar uma denúncia."); return; }
    if (typeof db === "undefined" || !db || typeof DENUNCIAS_COLLECTION === "undefined") {
      mensagem("erro", "O serviço de segurança não está disponível no momento."); return;
    }

    var alvo = texto("d-alvo");
    var desc = texto("d-desc");
    var motivo = texto("d-motivo");
    var motivosValidos = ["comportamento", "seguranca", "fraude", "assedio", "outro"];

    if (alvo.length < 2 || alvo.length > 120) {
      mensagem("erro", "Informe o nome ou identificador do denunciado (2 a 120 caracteres)."); return;
    }
    if (desc.length < 10 || desc.length > 2000) {
      mensagem("erro", "A descrição deve ter entre 10 e 2.000 caracteres."); return;
    }
    if (motivosValidos.indexOf(motivo) === -1) {
      mensagem("erro", "Selecione um motivo válido."); return;
    }

    var botao = e && e.submitter ? e.submitter : document.querySelector('form[onsubmit*="enviarDenuncia"] button[type="submit"]');
    envioEmAndamento = true;
    if (botao) { botao.disabled = true; botao.setAttribute("aria-busy", "true"); }

    var nome = "";
    try {
      nome = (typeof USUARIO_ATUAL !== "undefined" && USUARIO_ATUAL && USUARIO_ATUAL.nome) || "";
    } catch (_) {}

    db.collection(DENUNCIAS_COLLECTION).add({
      alvo: alvo,
      motivo: motivo,
      descricao: desc,
      denuncianteUid: uid,
      denuncianteNome: String(nome).slice(0, 120),
      status: "pendente",
      criadoEm: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function () {
      mensagem("ok", "Denúncia registrada. Nossa moderação vai analisar.");
      var alvoEl = document.getElementById("d-alvo");
      var descEl = document.getElementById("d-desc");
      if (alvoEl) alvoEl.value = "";
      if (descEl) descEl.value = "";
    }).catch(function (erro) {
      console.error("Falha ao registrar denúncia:", erro && erro.code ? erro.code : "erro");
      mensagem("erro", "Não foi possível registrar. Confira sua conexão e tente novamente.");
    }).then(function () {
      envioEmAndamento = false;
      if (botao) { botao.disabled = false; botao.removeAttribute("aria-busy"); }
    });
  };
})();