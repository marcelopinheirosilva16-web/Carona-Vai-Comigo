// ======================================================
// PAINEL.JS
// VAI COMIGO
// ======================================================

// ======================================================
// INICIAR PAINEL
// ======================================================

iniciarPagina(function (user, dados) {

    console.log("Painel iniciado para:", user.uid);

    // ==================================================
    // SAUDAÇÃO
    // ==================================================

    var elementoOla = document.getElementById("ola");

    if (elementoOla) {
        elementoOla.textContent =
            "Olá, " + (dados.nome || "usuário") + "!";
    }


    // ==================================================
    // RESUMO DO USUÁRIO
    // ==================================================

    var elementoResumo = document.getElementById("resumo");

    if (elementoResumo) {

        var papel = dados.motorista
            ? "passageiro e motorista"
            : "passageiro";

        var nota = dados.notaMedia
            ? Number(dados.notaMedia).toFixed(1)
            : "sem avaliações";

        elementoResumo.textContent =
            "Você está como " +
            papel +
            ". Nota média: " +
            nota +
            ".";
    }


    // ==================================================
    // ÁREA DAS SOLICITAÇÕES
    // ==================================================

    var box = document.getElementById("minhas-solic");

    if (!box) {

        console.warn(
            "Elemento minhas-solic não encontrado no painel."
        );

        return;
    }


    // ==================================================
    // MENSAGEM TEMPORÁRIA
    // ==================================================

    box.innerHTML =
        '<p class="vazio">Carregando suas solicitações...</p>';


    // ==================================================
    // VERIFICAR COLEÇÃO
    // ==================================================

    if (typeof SOLICITACOES_COLLECTION === "undefined") {

        console.error(
            "SOLICITACOES_COLLECTION não foi definida."
        );

        box.innerHTML =
            '<p class="vazio">' +
            'Não foi possível carregar as solicitações.' +
            '</p>';

        return;
    }


    // ==================================================
    // BUSCAR SOLICITAÇÕES
    // ==================================================
    //
    // IMPORTANTE:
    // Não usamos orderBy()
    // Não usamos limit()
    //
    // Assim essa consulta não precisa de índice
    // composto do Firestore.
    // ==================================================

    db.collection(SOLICITACOES_COLLECTION)
        .where("passageiroUid", "==", user.uid)
        .get()

        .then(function (snap) {

            console.log(
                "Solicitações encontradas:",
                snap.size
            );


            // ==========================================
            // NENHUMA SOLICITAÇÃO
            // ==========================================

            if (snap.empty) {

                box.innerHTML =
                    '<p class="vazio">' +
                    'Você ainda não solicitou nenhuma vaga.' +
                    '</p>';

                return;
            }


            // ==========================================
            // TRANSFORMAR EM ARRAY
            // ==========================================

            var solicitacoes = [];

            snap.forEach(function (doc) {

                var dadosSolicitacao = doc.data();

                dadosSolicitacao.id = doc.id;

                solicitacoes.push(
                    dadosSolicitacao
                );
            });


            // ==========================================
            // ORDENAR NO JAVASCRIPT
            // ==========================================

            solicitacoes.sort(function (a, b) {

                var dataA =
                    obterData(a.criadoEm);

                var dataB =
                    obterData(b.criadoEm);

                return dataB.getTime() -
                       dataA.getTime();
            });


            // ==========================================
            // PEGAR AS 20 MAIS RECENTES
            // ==========================================

            var quantidade = Math.min(
                solicitacoes.length,
                20
            );


            // ==========================================
            // MONTAR TABELA
            // ==========================================

            var linhas = "";


            for (var i = 0; i < quantidade; i++) {

                var s = solicitacoes[i];


                var origem =
                    s.viagemOrigem || s.origem || "-";

                var destino =
                    s.viagemDestino || s.destino || "-";

                var status =
                    s.status || "pendente";


                // ======================================
                // DATA DA VIAGEM
                // ======================================

                var dataViagem = "-";

                var dataSalva = s.dataHora || s.dataViagem || null;
                if (typeof formatarData === "function" && dataSalva) {
                    dataViagem = formatarData(dataSalva);
                }


                // ======================================
                // CRIAR LINHA
                // ======================================

                linhas +=
                    "<tr>" +

                    "<td>" +
                    escapeHtmlSeguro(origem) +
                    " &rarr; " +
                    escapeHtmlSeguro(destino) +
                    "</td>" +

                    "<td>" +
                    escapeHtmlSeguro(
                        dataViagem
                    ) +
                    "</td>" +

                    "<td>" +

                    "<span class='badge " +
                    escapeHtmlSeguro(status) +
                    "'>" +

                    escapeHtmlSeguro(status) +

                    "</span>" +
                    "<div style='font-size:12px;margin-top:4px'>Vagas confirmadas/pedidas: " + Number(s.vagasSolicitadas || 1) + (s.alteracaoVagasPendente ? " · Alteração solicitada: " + Number(s.novaQuantidadeVagas) : "") + "</div>" +
                    "</td>" +
                    "<td>" +
                    ((status === "pendente" || status === "aceita" || status === "aceito")
                      ? "<button type='button' class='btn btn-vermelho' onclick=\"cancelarSolicitacaoPainel('" + escapeHtmlSeguro(s.id) + "')\">Cancelar</button>"
                      : "—") +
                    ((status === "pendente" || status === "aceita" || status === "aceito")
                      ? " <button type='button' class='btn' onclick=\"alterarVagasPainel('" + escapeHtmlSeguro(s.id) + "')\">Alterar vagas</button>"
                      : "") +
                    ((status === "aceita" || status === "aceito")
                      ? " <a class='btn' href='passageiro.html?acompanhar=" + encodeURIComponent(s.viagemId) + "'>📍 Acompanhar motorista</a>"
                      : "") +
                    (s.embarcado === true ? " <span>✅ Embarque confirmado</span>" : "") +
                    "</td>" +
                    "</tr>";
            }


            // ==========================================
            // EXIBIR TABELA
            // ==========================================

            box.innerHTML =
                "<table>" +

                "<thead>" +

                "<tr>" +

                "<th>Trajeto</th>" +

                "<th>Data da viagem</th>" +

                "<th>Status</th>" +

                "<th>Ações</th>" +

                "</tr>" +

                "</thead>" +

                "<tbody>" +

                linhas +

                "</tbody>" +

                "</table>";


        })

        // ==================================================
        // ERRO
        // ==================================================

        .catch(function (erro) {

            console.error(
                "ERRO AO CARREGAR SOLICITAÇÕES:"
            );

            console.error(
                "Código:",
                erro.code
            );

            console.error(
                "Mensagem:",
                erro.message
            );

            console.error(
                "Erro completo:",
                erro
            );


            // ==========================================
            // MOSTRAR ERRO REAL NA TELA
            // ==========================================

            box.innerHTML =
                '<div class="vazio" style="padding:15px;">' +

                '<strong>Não foi possível carregar suas solicitações.</strong>' +

                '<br><br>' +

                '<small>' +

                'Código: ' +
                escapeHtmlSeguro(
                    erro.code || "desconhecido"
                ) +

                '<br><br>' +

                'Mensagem: ' +
                escapeHtmlSeguro(
                    erro.message || "Erro desconhecido"
                ) +

                '</small>' +

                '</div>';
        });

});



// Alteração de vagas: pendente atualiza o pedido; aceita requer nova aprovação.
window.alterarVagasPainel = async function(id) {
  try {
    var usuario = firebase.auth().currentUser;
    if (!usuario) throw new Error("Faça login novamente.");
    var ref = db.collection("solicitacoes").doc(id);
    var doc = await ref.get();
    if (!doc.exists || doc.data().passageiroUid !== usuario.uid) throw new Error("Solicitação não encontrada.");
    var s = doc.data();
    if (!["pendente", "aceita", "aceito"].includes(s.status)) throw new Error("Esta solicitação não pode ser alterada.");
    var entrada = prompt("Quantas vagas você deseja no total? (1 a 4)", String(s.novaQuantidadeVagas || s.vagasSolicitadas || 1));
    if (entrada === null) return;
    var qtd = Number(entrada);
    if (!Number.isInteger(qtd) || qtd < 1 || qtd > 4) throw new Error("Informe um número inteiro de 1 a 4.");
    var viagem = await db.collection("viagens").doc(s.viagemId).get();
    if (!viagem.exists || viagem.data().status !== "aberta") throw new Error("A viagem não está mais aberta para alterações.");
    var atual = Number(s.vagasSolicitadas || 1);
    var livres = Number(viagem.data().vagasDisponiveis || 0);
    if (qtd > livres + (["aceita", "aceito"].includes(s.status) ? atual : 0)) throw new Error("Não há vagas disponíveis para essa quantidade.");
    if (qtd === atual && !s.alteracaoVagasPendente) return;
    if (s.status === "pendente") {
      await ref.update({vagasSolicitadas:qtd, atualizadoEm:firebase.firestore.FieldValue.serverTimestamp()});
      alert("Quantidade atualizada. Aguarde a aprovação do motorista.");
    } else {
      await ref.update({novaQuantidadeVagas:qtd, alteracaoVagasPendente:true, alteracaoSolicitadaEm:firebase.firestore.FieldValue.serverTimestamp()});
      alert("Pedido de alteração enviado ao motorista. Suas vagas atuais permanecem reservadas até a resposta.");
    }
    location.reload();
  } catch(e) { console.error(e); alert(e.message || "Não foi possível alterar as vagas."); }
};

// ======================================================
// CANCELAR SOLICITAÇÃO DO PASSAGEIRO
// ======================================================
function cancelarSolicitacaoPainel(solicitacaoId) {
    if (!solicitacaoId || !USUARIO_ATUAL || !USUARIO_ATUAL.uid) return;
    if (!window.confirm("Deseja cancelar esta solicitação?")) return;
    db.collection(SOLICITACOES_COLLECTION).doc(solicitacaoId).update({
        status: "cancelada",
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function () {
        mostrarToast("Solicitação cancelada.", "ok");
        window.location.reload();
    }).catch(function (erro) {
        console.error("Erro ao cancelar solicitação:", erro);
        mostrarToast("Não foi possível cancelar a solicitação.", "err");
    });
}
window.cancelarSolicitacaoPainel = cancelarSolicitacaoPainel;

// ======================================================
// CONVERTER DATA DO FIRESTORE
// ======================================================

function obterData(valor) {

    if (!valor) {
        return new Date(0);
    }


    // Timestamp do Firestore
    if (
        typeof valor.toDate === "function"
    ) {

        return valor.toDate();
    }


    // Timestamp em segundos
    if (
        typeof valor.seconds !== "undefined"
    ) {

        return new Date(
            valor.seconds * 1000
        );
    }


    // Data JavaScript
    if (
        valor instanceof Date
    ) {

        return valor;
    }


    // Texto ou número
    var data =
        new Date(valor);


    if (
        isNaN(data.getTime())
    ) {

        return new Date(0);
    }


    return data;
}


// ======================================================
// ESCAPAR TEXTO COM SEGURANÇA
// ======================================================

function escapeHtmlSeguro(valor) {

    if (
        valor === null ||
        typeof valor === "undefined"
    ) {

        return "";
    }

    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}