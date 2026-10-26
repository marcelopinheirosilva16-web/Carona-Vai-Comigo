/* VaiComigo - Perfil do usuario */
iniciarPagina(function (user, dados) {
  document.getElementById("p-nome").value = dados.nome || "";
  var exclusao = document.getElementById("exclusao-conta-area");
  if (exclusao && dados.admin === true) exclusao.style.display = "none";
  var fotoAtual = dados.fotoUrl || user.photoURL || "";
  atualizarPreviewFoto(fotoAtual);
  var campoFoto = document.getElementById("p-foto");
  if (campoFoto) {
    campoFoto.addEventListener("change", selecionarFotoPerfil);
  }
  document.getElementById("p-telefone").value = dados.telefone || "";
  document.getElementById("p-cidade").value = dados.cidade || "";
  document.getElementById("p-bio").value = dados.bio || "";
  document.getElementById("p-motorista").checked = !!dados.motorista;
  document.getElementById("p-nota").textContent = dados.notaMedia ? dados.notaMedia.toFixed(1) : "-";
  document.getElementById("p-total").textContent = dados.totalAvaliacoes || 0;

  // Avaliacoes recebidas
  db.collection(AVALIACOES_COLLECTION)
    .where("avaliadoUid", "==", user.uid)
    .get().then(function (snap) {
      var box = document.getElementById("lista-avaliacoes");
      if (snap.empty) { box.innerHTML = '<p class="vazio">Ainda sem avaliacoes.</p>'; return; }
      var avaliacoes = [];
      snap.forEach(function (d) { var a = d.data(); a._id = d.id; avaliacoes.push(a); });
      function ms(ts) { return ts && typeof ts.toMillis === "function" ? ts.toMillis() : (ts && ts.seconds ? ts.seconds * 1000 : 0); }
      avaliacoes.sort(function (a, b) { return ms(b.criadoEm) - ms(a.criadoEm); });
      var html = "";
      avaliacoes.slice(0, 20).forEach(function (a) {
        var nota = Math.max(0, Math.min(5, Number(a.nota) || 0));
        var estrelas = "\u2605".repeat(nota) + "\u2606".repeat(5 - nota);
        html += "<div style='padding:10px 0;border-bottom:1px solid var(--borda)'>" +
          "<div style='color:#ffc107'>" + estrelas + "</div>" +
          "<div class='meta'>" + escapeHtml(a.comentario || "") + "</div></div>";
      });
      box.innerHTML = html;
    }).catch(function () {
      document.getElementById("lista-avaliacoes").innerHTML = '<p class="vazio">Nao foi possivel carregar.</p>';
    });
});

function salvarPerfil(e) {
  if (e) e.preventDefault();
  var upd = {
    nome: document.getElementById("p-nome").value.trim(),
    telefone: document.getElementById("p-telefone").value.trim(),
    cidade: document.getElementById("p-cidade").value.trim(),
    bio: document.getElementById("p-bio").value.trim(),
    motorista: document.getElementById("p-motorista").checked
  };
  if (!upd.nome) { err("O nome nao pode ficar vazio."); return; }
  db.collection(USUARIOS_COLLECTION).doc(USUARIO_ATUAL.uid).update(upd)
    .then(function () {
      if (auth.currentUser) auth.currentUser.updateProfile({ displayName: upd.nome });
      ok("Perfil atualizado!");
    })
    .catch(function () { err("Nao foi possivel salvar."); });
}

function reenviarReset() {
  auth.sendPasswordResetEmail(auth.currentUser.email)
    .then(function () { ok("Enviamos o link de redefinicao ao seu e-mail."); })
    .catch(function (e) { err(traduzErroAuth(e.code)); });
}


// ==============================================
// FOTO DE PERFIL — Firebase Storage + Firestore
// ==============================================
var arquivoFotoPerfilSelecionado = null;
var previewFotoTemporaria = null;

function atualizarPreviewFoto(url) {
  var img = document.getElementById("p-foto-preview");
  if (!img) return;
  img.src = url || "img/avatar-padrao.svg";
}

function selecionarFotoPerfil(event) {
  var input = event && event.target;
  var arquivo = input && input.files ? input.files[0] : null;
  if (!arquivo) return;

  var tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
  if (tiposPermitidos.indexOf(arquivo.type) === -1) {
    err("Escolha uma imagem JPG, PNG ou WEBP.");
    input.value = "";
    return;
  }
  if (arquivo.size > 5 * 1024 * 1024) {
    err("A foto deve ter no máximo 5 MB.");
    input.value = "";
    return;
  }

  arquivoFotoPerfilSelecionado = arquivo;
  if (previewFotoTemporaria) URL.revokeObjectURL(previewFotoTemporaria);
  previewFotoTemporaria = URL.createObjectURL(arquivo);
  atualizarPreviewFoto(previewFotoTemporaria);
}

function enviarFotoPerfil() {
  if (!auth.currentUser || !USUARIO_ATUAL || !USUARIO_ATUAL.uid) {
    err("Entre na sua conta para enviar uma foto.");
    return;
  }
  if (!arquivoFotoPerfilSelecionado) {
    err("Primeiro escolha uma foto.");
    return;
  }
  if (!firebase.storage) {
    err("O Firebase Storage não foi carregado. Atualize a página e tente novamente.");
    return;
  }

  var botao = document.getElementById("p-foto-enviar");
  var textoOriginal = botao ? botao.textContent : "Enviar foto";
  if (botao) { botao.disabled = true; botao.textContent = "Enviando..."; }

  var uid = auth.currentUser.uid;
  var arquivo = arquivoFotoPerfilSelecionado;
  var ref = firebase.storage().ref().child("profilePhotos/" + uid + "/perfil");
  var metadata = {
    contentType: arquivo.type,
    cacheControl: "public,max-age=3600"
  };

  ref.put(arquivo, metadata).then(function (snapshot) {
    return snapshot.ref.getDownloadURL();
  }).then(function (url) {
    return db.collection(USUARIOS_COLLECTION).doc(uid).update({
      fotoUrl: url,
      fotoAtualizadaEm: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function () {
      return auth.currentUser.updateProfile({ photoURL: url }).catch(function (e) {
        console.warn("Foto salva no banco; não foi possível atualizar o perfil do Auth:", e);
      }).then(function () { return url; });
    });
  }).then(function (url) {
    USUARIO_ATUAL.fotoUrl = url;
    atualizarPreviewFoto(url);
    if (typeof montarMenu === "function") montarMenu(USUARIO_ATUAL);
    arquivoFotoPerfilSelecionado = null;
    var input = document.getElementById("p-foto");
    if (input) input.value = "";
    if (previewFotoTemporaria) URL.revokeObjectURL(previewFotoTemporaria);
    previewFotoTemporaria = null;
    ok("Foto de perfil atualizada!");
  }).catch(function (e) {
    console.error("Erro ao enviar foto de perfil:", e);
    if (e && (e.code === "storage/unauthorized" || e.code === "storage/unauthenticated")) {
      err("O Firebase Storage não autorizou o envio. Confira as regras de Storage no Firebase Console.");
    } else if (e && e.code === "storage/bucket-not-found") {
      err("Ative o Firebase Storage no projeto do Firebase antes de enviar fotos.");
    } else {
      err("Não foi possível enviar a foto. Confira a conexão e as configurações do Firebase Storage.");
    }
  }).finally(function () {
    if (botao) { botao.disabled = false; botao.textContent = textoOriginal; }
  });
}

// Solicitação segura de exclusão: não remove registros operacionais no navegador.
// O administrador deve processar a solicitação, inclusive os dados do Auth.
// Encerra o acesso da conta; conserva registros operacionais e financeiros no Firestore.
// Não constitui apagamento integral de dados pessoais: consulte a política de retenção.
async function solicitarExclusaoConta() {
  var user = auth.currentUser;
  if (!user || !user.email) { err("Entre na sua conta novamente."); return; }
  var btn = document.getElementById("btn-excluir-conta");
  if (btn) btn.disabled = true;
  try {
    var perfilRef = db.collection(USUARIOS_COLLECTION).doc(user.uid);
    var snap = await perfilRef.get();
    if (!snap.exists) throw new Error("Perfil não encontrado. Contate o suporte.");
    if (snap.data().admin === true) throw new Error("A conta administrativa não pode ser excluída por esta página.");
    if (!confirm("Deseja encerrar permanentemente seu acesso ao VaiComigo? Seu login será excluído, mas registros de viagens, solicitações e pagamentos permanecerão no Firestore. Dados associados podem ser retidos conforme obrigações legais. Continue somente se não houver viagens ou pagamentos pendentes.")) return;
    var senha = prompt("Digite sua senha para confirmar a exclusão do acesso:");
    if (!senha) return;
    await user.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(user.email, senha));
    // Não excluir viagens nem pagamentos. Marcar o perfil e retirar os dados básicos.
    // Esta operação é deliberadamente restrita pelas regras do Firestore.
    await perfilRef.update({
      nome: "Usuário desativado", telefone: "", cidade: "", bio: "",
      fotoUrl: "", motorista: false, contaEncerrada: true,
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });
    // Se a exclusão do Auth falhar, a conta ainda existe e o suporte deve finalizar.
    await user.delete();
    alert("Seu acesso ao VaiComigo foi excluído. Os registros de viagens e pagamentos foram preservados. Para solicitar o tratamento dos dados remanescentes, escreva para caronavaicomigo@gmail.com.");
    window.location.href = "index.html";
  } catch (e) {
    console.error("Erro ao encerrar conta:", e);
    if (e && e.code === "permission-denied") err("O Firestore bloqueou a alteração. Publique as regras deste ZIP.");
    else if (e && e.code === "auth/wrong-password") err("Senha incorreta.");
    else err("Não foi possível concluir a exclusão do acesso: " + (e.message || "Contate o suporte."));
  } finally { if (btn) btn.disabled = false; }
}
