/* Avaliações públicas do aplicativo VaiComigo.
   Uma avaliação por conta; o próprio usuário pode editar a sua. */
(function () {
  "use strict";

  var notaSelecionada = 0;
  var usuario = null;
  var avaliacaoExistente = false;
  var nomesNotas = {
    1: "Muito ruim",
    2: "Ruim",
    3: "Regular",
    4: "Muito bom",
    5: "Excelente"
  };

  function col() {
    return (typeof AVALIACOES_APP_COLLECTION !== "undefined" && AVALIACOES_APP_COLLECTION)
      ? AVALIACOES_APP_COLLECTION : "avaliacoes_app";
  }

  function esc(valor) {
    return String(valor == null ? "" : valor)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function aviso(mensagem, tipo) {
    if (typeof mostrarToast === "function") mostrarToast(mensagem, tipo || "info");
    else window.alert(mensagem);
  }

  function nomeUsuario() {
    return (usuario && (usuario.nome || usuario.displayName)) ||
      (auth.currentUser && auth.currentUser.displayName) || "Usuário VaiComigo";
  }

  function perfilUsuario() {
    var tipo = usuario && usuario.tipo;
    return ["passageiro", "motorista", "ambos"].indexOf(tipo) >= 0 ? tipo : "ambos";
  }

  function atualizarEstrelas(nota) {
    notaSelecionada = Number(nota) || 0;
    document.querySelectorAll(".app-star").forEach(function (botao) {
      var n = Number(botao.getAttribute("data-nota"));
      botao.classList.toggle("selected", n <= notaSelecionada);
      botao.setAttribute("aria-pressed", n === notaSelecionada ? "true" : "false");
    });
    document.getElementById("texto-nota").textContent = notaSelecionada
      ? nomesNotas[notaSelecionada] + " — " + notaSelecionada + " de 5 estrelas"
      : "Selecione as estrelas.";
  }

  function formatarData(ts) {
    if (!ts) return "Data não informada";
    var data = typeof ts.toDate === "function" ? ts.toDate()
      : (ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts));
    if (isNaN(data.getTime())) return "Data não informada";
    return data.toLocaleDateString("pt-BR");
  }

  function carregarResumo() {
    db.collection(col()).get().then(function (snap) {
      var itens = [];
      var soma = 0;
      snap.forEach(function (doc) {
        var a = doc.data();
        a._id = doc.id;
        a.nota = Math.max(1, Math.min(5, Number(a.nota) || 0));
        soma += a.nota;
        itens.push(a);
      });
      itens.sort(function (a, b) {
        var ta = a.criadoEm && a.criadoEm.toMillis ? a.criadoEm.toMillis() : 0;
        var tb = b.criadoEm && b.criadoEm.toMillis ? b.criadoEm.toMillis() : 0;
        return tb - ta;
      });

      var media = itens.length ? (soma / itens.length).toFixed(1).replace(".", ",") : "—";
      document.getElementById("resumo-avaliacoes-app").innerHTML =
        '<div class="app-rating-average">' + media + '</div><div>' +
        '<div class="app-rating-small-stars">★★★★★</div><div class="app-rating-hint">' +
        itens.length + (itens.length === 1 ? " avaliação" : " avaliações") + '</div></div>';

      var box = document.getElementById("lista-avaliacoes-app");
      if (!itens.length) {
        box.innerHTML = '<p class="app-rating-empty">Ainda não há avaliações. Seja a primeira pessoa a avaliar!</p>';
        return;
      }
      box.innerHTML = itens.slice(0, 20).map(function (a) {
        var estrelas = "★".repeat(a.nota) + "☆".repeat(5 - a.nota);
        var perfil = a.perfil === "motorista" ? "Motorista" :
          (a.perfil === "passageiro" ? "Passageiro" : "Passageiro/motorista");
        return '<article class="app-review"><div class="app-review-top"><span class="app-review-name">' +
          esc(a.nome || "Usuário VaiComigo") + ' <span class="app-rating-hint">· ' + perfil + '</span></span>' +
          '<span class="app-review-date">' + esc(formatarData(a.criadoEm || a.atualizadoEm)) + '</span></div>' +
          '<div class="app-review-stars" aria-label="' + a.nota + ' de 5 estrelas">' + estrelas + '</div>' +
          '<div class="app-review-comment">' + esc(a.comentario || "") + '</div></article>';
      }).join("");
    }).catch(function (erro) {
      console.error("Erro ao carregar avaliações do app:", erro);
      document.getElementById("resumo-avaliacoes-app").innerHTML =
        '<div class="app-rating-hint">Não foi possível carregar a média.</div>';
      document.getElementById("lista-avaliacoes-app").innerHTML =
        '<p class="app-rating-empty">Não foi possível carregar os comentários. Confira as regras do Firestore.</p>';
    });
  }

  function carregarMinhaAvaliacao() {
    if (!auth.currentUser) return;
    db.collection(col()).doc(auth.currentUser.uid).get().then(function (doc) {
      if (!doc.exists) return;
      var a = doc.data();
      avaliacaoExistente = true;
      atualizarEstrelas(a.nota);
      document.getElementById("comentario-app").value = a.comentario || "";
      document.getElementById("contador-comentario").textContent =
        (a.comentario || "").length;
      document.getElementById("titulo-formulario").textContent = "Edite sua avaliação";
      document.getElementById("btn-enviar-avaliacao").textContent = "Atualizar avaliação";
    }).catch(function (erro) {
      console.warn("Não foi possível consultar a avaliação atual:", erro);
    });
  }

  function enviar(evento) {
    evento.preventDefault();
    if (!auth.currentUser || !usuario) {
      aviso("Faça login para avaliar o aplicativo.", "err");
      return;
    }
    var comentario = document.getElementById("comentario-app").value.trim();
    if (notaSelecionada < 1 || notaSelecionada > 5) {
      aviso("Escolha de 1 a 5 estrelas.", "err");
      return;
    }
    if (comentario.length < 3 || comentario.length > 1000) {
      aviso("Escreva um comentário de 3 a 1000 caracteres.", "err");
      return;
    }

    var botao = document.getElementById("btn-enviar-avaliacao");
    botao.disabled = true;
    botao.textContent = "Salvando...";
    var referencia = db.collection(col()).doc(auth.currentUser.uid);
    var dados = {
      nota: notaSelecionada,
      comentario: comentario,
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    };

    var operacao;
    if (avaliacaoExistente) {
      operacao = referencia.update(dados);
    } else {
      dados.uid = auth.currentUser.uid;
      dados.nome = nomeUsuario();
      dados.perfil = perfilUsuario();
      dados.criadoEm = firebase.firestore.FieldValue.serverTimestamp();
      operacao = referencia.set(dados);
    }

    operacao.then(function () {
      avaliacaoExistente = true;
      document.getElementById("titulo-formulario").textContent = "Edite sua avaliação";
      botao.textContent = "Atualizar avaliação";
      aviso("Obrigado! Sua avaliação foi salva.", "ok");
      carregarResumo();
    }).catch(function (erro) {
      console.error("Erro ao salvar avaliação do aplicativo:", erro);
      aviso("Não foi possível salvar. Confira se as regras do Firestore foram atualizadas.", "err");
    }).finally(function () {
      botao.disabled = false;
      botao.textContent = avaliacaoExistente ? "Atualizar avaliação" : "Enviar avaliação";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".app-star").forEach(function (botao) {
      botao.addEventListener("click", function () {
        atualizarEstrelas(botao.getAttribute("data-nota"));
      });
    });
    document.getElementById("comentario-app").addEventListener("input", function () {
      document.getElementById("contador-comentario").textContent = this.value.length;
    });
    document.getElementById("form-avaliacao-app").addEventListener("submit", enviar);

    if (typeof iniciarPagina !== "function") {
      aviso("Não foi possível iniciar a página. Verifique os arquivos comuns.", "err");
      return;
    }
    iniciarPagina(function (user, dados) {
      usuario = dados || {};
      usuario.uid = user.uid;
      carregarMinhaAvaliacao();
      carregarResumo();
    });
  });
})();
