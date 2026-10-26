/* VaiComigo - Painel administrativo */
iniciarPagina(function (user, dados) {
  if (!dados.admin) {
    document.getElementById("sem-acesso").style.display = "block";
    return;
  }
  document.getElementById("conteudo").style.display = "block";
  carregarMetricas();
  carregarUsuarios();
  carregarDenuncias();
  carregarViagensAdmin();
  carregarAvaliacoesApp();
  carregarAuditoria();
});

function carregarMetricas() {
  db.collection(USUARIOS_COLLECTION).get().then(function (s) {
    var ativos = 0;
    s.forEach(function (doc) {
      var usuario = doc.data() || {};
      if (usuario.contaEncerrada !== true && usuario.excluido !== true && usuario.status !== "excluida" && usuario.status !== "encerrada") ativos++;
    });
    document.getElementById("m-usuarios").textContent = ativos;
  });
  db.collection(VIAGENS_COLLECTION).get().then(function (s) {
    document.getElementById("m-viagens").textContent = s.size;
  });
  db.collection(DENUNCIAS_COLLECTION).where("status", "==", "pendente").get().then(function (s) {
    document.getElementById("m-denuncias").textContent = s.size;
  });
}

function carregarUsuarios() {
  db.collection(USUARIOS_COLLECTION).orderBy("criadoEm", "desc").limit(50).get().then(function (snap) {
    var html = "<table><thead><tr><th>Nome</th><th>E-mail</th><th>Papel</th><th>Status</th><th></th></tr></thead><tbody>";
    snap.forEach(function (d) {
      var u = d.data();
      var papel = u.admin ? "admin" : (u.motorista ? "motorista" : "passageiro");
      var encerrada = u.contaEncerrada === true || u.excluido === true || u.status === "excluida" || u.status === "encerrada";
      html += "<tr><td>" + escapeHtml(u.nome) + "</td><td>" + escapeHtml(u.email) +
        "</td><td>" + papel + "</td><td>" +
        (encerrada ? "<span class='badge cancelada'>encerrada</span>" : (u.bloqueado ? "<span class='badge cancelada'>bloqueado</span>" : "<span class='badge aceita'>ativo</span>")) +
        "</td><td>" +
        (u.admin ? "Conta protegida" : encerrada ? "—" : u.bloqueado
          ? "<button class='btn sm verde' onclick=\"alternarBloqueio('" + d.id + "',false)\">Desbloquear</button>"
          : "<button class='btn sm vermelho' onclick=\"alternarBloqueio('" + d.id + "',true)\">Bloquear</button>") +
        (encerrada || u.admin ? "" : " <span title='A verificação do Authentication exige servidor seguro' class='meta'>Encerramento: suporte</span>") + "</td></tr>";
    });
    document.getElementById("tab-usuarios").innerHTML = html + "</tbody></table>";
  });
}

// Encerramento de perfis órfãos não é feito pelo navegador: somente um
// backend com Firebase Admin SDK pode comprovar ausência no Authentication.
function marcarPerfilAntigoEncerrado() {
  err("Por segurança, confirme e encerre perfis órfãos por rotina administrativa no servidor.");
}

function alternarBloqueio(uid, bloquear) {
  db.collection(USUARIOS_COLLECTION).doc(uid).get().then(function (snap) {
    if (!snap.exists) throw new Error("Usuário não encontrado.");
    var dados = snap.data() || {};
    if (dados.admin === true) throw new Error("A conta administrativa é protegida.");
    if (dados.contaEncerrada === true || dados.status === "encerrada") throw new Error("Conta encerrada.");
    return snap.ref.update({ bloqueado: bloquear });
  })
    .then(function () {
      return registrarAuditoria(bloquear ? "bloqueio" : "desbloqueio", "usuario " + uid);
    })
    .then(function () { ok(bloquear ? "Usuario bloqueado." : "Usuario desbloqueado."); carregarUsuarios(); carregarAuditoria(); })
    .catch(function (e) { err(e.message || "Não foi possível atualizar."); });
}

function carregarDenuncias() {
  db.collection(DENUNCIAS_COLLECTION).orderBy("criadoEm", "desc").limit(50).get().then(function (snap) {
    if (snap.empty) { document.getElementById("tab-denuncias").innerHTML = '<p class="vazio">Sem denuncias.</p>'; return; }
    var html = "<table><thead><tr><th>Alvo</th><th>Motivo</th><th>Descricao</th><th>Status</th><th></th></tr></thead><tbody>";
    snap.forEach(function (d) {
      var r = d.data();
      html += "<tr><td>" + escapeHtml(r.alvo) + "</td><td>" + escapeHtml(r.motivo) +
        "</td><td>" + escapeHtml((r.descricao || "").slice(0, 60)) +
        "</td><td><span class='badge " + (r.status === "pendente" ? "pendente" : "encerrada") + "'>" + r.status + "</span></td><td>" +
        (r.status === "pendente"
          ? "<button class='btn sm' onclick=\"moderarDenuncia('" + d.id + "','resolvida')\">Resolver</button> " +
            "<button class='btn sm ghost' onclick=\"moderarDenuncia('" + d.id + "','arquivada')\">Arquivar</button>"
          : "-") +
        "</td></tr>";
    });
    document.getElementById("tab-denuncias").innerHTML = html + "</tbody></table>";
  });
}

function moderarDenuncia(id, status) {
  db.collection(DENUNCIAS_COLLECTION).doc(id).update({ status: status })
    .then(function () { return registrarAuditoria("moderacao", "denuncia " + id + " -> " + status); })
    .then(function () { ok("Denuncia " + status + "."); carregarDenuncias(); carregarMetricas(); carregarAuditoria(); });
}

function carregarViagensAdmin() {
  db.collection(VIAGENS_COLLECTION).orderBy("criadoEm", "desc").limit(30).get().then(function (snap) {
    if (snap.empty) { document.getElementById("tab-viagens").innerHTML = '<p class="vazio">Sem viagens.</p>'; return; }
    var html = "<table><thead><tr><th>Trajeto</th><th>Motorista</th><th>Data</th><th>Status</th></tr></thead><tbody>";
    snap.forEach(function (d) {
      var t = d.data();
      html += "<tr><td>" + escapeHtml(t.origem) + " &rarr; " + escapeHtml(t.destino) +
        "</td><td>" + escapeHtml(t.motoristaNome || "-") +
        "</td><td>" + formatarData(t.dataHora) +
        "</td><td><span class='badge " + t.status + "'>" + t.status + "</span></td></tr>";
    });
    document.getElementById("tab-viagens").innerHTML = html + "</tbody></table>";
  });
}

function carregarAuditoria() {
  db.collection(AUDITORIA_COLLECTION).orderBy("criadoEm", "desc").limit(30).get().then(function (snap) {
    if (snap.empty) { document.getElementById("tab-auditoria").innerHTML = '<p class="vazio">Sem registros.</p>'; return; }
    var html = "<table><thead><tr><th>Acao</th><th>Detalhe</th><th>Por</th><th>Quando</th></tr></thead><tbody>";
    snap.forEach(function (d) {
      var a = d.data();
      html += "<tr><td>" + escapeHtml(a.acao) + "</td><td>" + escapeHtml(a.detalhe) +
        "</td><td>" + escapeHtml(a.porEmail || "-") + "</td><td>" + formatarData(a.criadoEm) + "</td></tr>";
    });
    document.getElementById("tab-auditoria").innerHTML = html + "</tbody></table>";
  });
}


/* Avaliações gerais do aplicativo, separadas das avaliações entre usuários. */
function carregarAvaliacoesApp() {
  var box = document.getElementById("tab-avaliacoes-app");
  if (!box) return;
  var colecao = (typeof AVALIACOES_APP_COLLECTION !== "undefined" && AVALIACOES_APP_COLLECTION)
    ? AVALIACOES_APP_COLLECTION : "avaliacoes_app";

  db.collection(colecao).get().then(function (snap) {
    var itens = [];
    var soma = 0;
    snap.forEach(function (doc) {
      var a = doc.data();
      a._id = doc.id;
      a.nota = Math.max(1, Math.min(5, Number(a.nota) || 0));
      soma += a.nota;
      itens.push(a);
    });
    function millis(ts) {
      if (!ts) return 0;
      if (typeof ts.toMillis === "function") return ts.toMillis();
      if (ts.seconds) return ts.seconds * 1000;
      return 0;
    }
    itens.sort(function (a, b) { return millis(b.criadoEm || b.atualizadoEm) - millis(a.criadoEm || a.atualizadoEm); });
    var media = itens.length ? (soma / itens.length).toFixed(1).replace(".", ",") + " / 5" : "—";
    var totalEl = document.getElementById("m-avaliacoes-app");
    var mediaEl = document.getElementById("m-media-app");
    if (totalEl) totalEl.textContent = String(itens.length);
    if (mediaEl) mediaEl.textContent = media;

    if (!itens.length) {
      box.innerHTML = '<p class="vazio">Ainda não há avaliações do aplicativo.</p>';
      return;
    }
    var html = "<div style='overflow-x:auto'><table><thead><tr><th>Usuário</th><th>Perfil</th><th>Nota</th><th>Comentário</th><th>Data</th></tr></thead><tbody>";
    itens.slice(0, 100).forEach(function (a) {
      var perfil = a.perfil === "motorista" ? "Motorista" :
        (a.perfil === "passageiro" ? "Passageiro" : "Passageiro/motorista");
      var estrelas = "★".repeat(a.nota) + "☆".repeat(5 - a.nota);
      html += "<tr><td>" + escapeHtml(a.nome || "Usuário") + "</td><td>" + perfil +
        "</td><td><span style='color:#e6a700;white-space:nowrap'>" + estrelas + "</span> (" + a.nota + "/5)</td>" +
        "<td style='min-width:220px;white-space:pre-wrap'>" + escapeHtml(a.comentario || "") + "</td><td>" +
        escapeHtml(formatarData(a.criadoEm || a.atualizadoEm)) + "</td></tr>";
    });
    html += "</tbody></table></div>";
    box.innerHTML = html;
  }).catch(function (erro) {
    console.error("Erro ao carregar avaliações do app:", erro);
    box.innerHTML = '<p class="vazio">Não foi possível carregar as avaliações. Verifique as regras do Firestore.</p>';
  });
}

// Segurança da conta administrativa: exige senha atual e reautenticação.
async function atualizarSenhaAdmin(event) {
  event.preventDefault();
  var atual = document.getElementById("admin-senha-atual").value;
  var nova = document.getElementById("admin-senha-nova").value;
  if (nova.length < 6) { err("A nova senha deve ter ao menos 6 caracteres."); return; }
  var user = auth.currentUser;
  try {
    if (!user || !user.email) throw new Error("Faça login novamente.");
    var doc = await db.collection(USUARIOS_COLLECTION).doc(user.uid).get();
    if (!doc.exists || doc.data().admin !== true) throw new Error("Acesso não autorizado.");
    await user.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(user.email, atual));
    await user.updatePassword(nova);
    document.getElementById("admin-form-senha").reset();
    ok("Senha administrativa atualizada.");
  } catch(e) { console.error(e); err("Não foi possível alterar a senha: " + (e.code || e.message)); }
}

async function atualizarEmailAdmin(event) {
  event.preventDefault();
  var senha = document.getElementById("admin-email-senha").value;
  var novoEmail = document.getElementById("admin-email-novo").value.trim();
  var user = auth.currentUser;
  try {
    if (!user || !user.email) throw new Error("Faça login novamente.");
    var doc = await db.collection(USUARIOS_COLLECTION).doc(user.uid).get();
    if (!doc.exists || doc.data().admin !== true) throw new Error("Acesso não autorizado.");
    if (novoEmail.toLowerCase() === user.email.toLowerCase()) throw new Error("Informe outro e-mail.");
    await user.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(user.email, senha));
    await user.verifyBeforeUpdateEmail(novoEmail);
    document.getElementById("admin-form-email").reset();
    ok("Verificação enviada ao novo e-mail. Confirme o link para concluir a alteração.");
  } catch(e) { console.error(e); err("Não foi possível solicitar alteração: " + (e.code || e.message)); }
}
