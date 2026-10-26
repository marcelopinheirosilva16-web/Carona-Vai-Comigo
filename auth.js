// ==========================================
// AUTH.JS - AUTENTICAÇÃO DO VAI COMIGO
// ==========================================


// ==========================================
// CADASTRO
// ==========================================
function fazerCadastro(event) {

  event.preventDefault();


  var nome =
    document.getElementById("cad-nome").value.trim();


  var email =
    document.getElementById("cad-email").value.trim();


  var telefone =
    document.getElementById("cad-telefone").value.trim();


  var senha =
    document.getElementById("cad-senha").value;


  var senha2 =
    document.getElementById("cad-senha2").value;


  /*
   * Perfil escolhido no cadastro.
   *
   * Caso o campo ainda não exista,
   * usamos "ambos" para manter
   * compatibilidade com contas antigas.
   */

  var campoTipo =
    document.getElementById("cad-tipo");


  var tipo =
    campoTipo
      ? campoTipo.value
      : "ambos";


  // ========================================
  // VALIDAÇÕES
  // ========================================

  if (!nome) {

    mostrarToast(
      "Informe seu nome.",
      "err"
    );

    return;
  }


  if (!email) {

    mostrarToast(
      "Informe seu e-mail.",
      "err"
    );

    return;
  }


  if (
    tipo !== "passageiro" &&
    tipo !== "motorista" &&
    tipo !== "ambos"
  ) {

    mostrarToast(
      "Escolha seu tipo de perfil.",
      "err"
    );

    return;
  }


  if (senha.length < 6) {

    mostrarToast(
      "A senha deve ter pelo menos 6 caracteres.",
      "err"
    );

    return;
  }


  if (senha !== senha2) {

    mostrarToast(
      "As senhas não conferem.",
      "err"
    );

    return;
  }


  mostrarToast(
    "Criando sua conta..."
  );


  // ========================================
  // CRIAR CONTA FIREBASE AUTH
  // ========================================

  auth
    .createUserWithEmailAndPassword(
      email,
      senha
    )

    .then(function (credencial) {

      var user =
        credencial.user;


      // ====================================
      // SALVAR PERFIL NO FIRESTORE
      // ====================================

      return db
        .collection(
          USUARIOS_COLLECTION
        )
        .doc(user.uid)
        .set({

          uid:
            user.uid,

          nome:
            nome,

          email:
            email,

          telefone:
            telefone || "",

          /*
           * PERFIL DO USUÁRIO
           *
           * passageiro
           * motorista
           * ambos
           */

          tipo:
            tipo,

          /*
           * Mantemos estes campos
           * para compatibilidade com
           * seu sistema atual.
           */

          passageiro:
            tipo === "passageiro" ||
            tipo === "ambos",

          motorista:
            tipo === "motorista" ||
            tipo === "ambos",

          admin:
            false,

          bloqueado:
            false,

          // Apenas contas criadas após esta atualização exigem verificação.
          exigeConfirmacaoEmail: true,

          criadoEm:
            firebase.firestore
              .FieldValue
              .serverTimestamp(),

          atualizadoEm:
            firebase.firestore
              .FieldValue
              .serverTimestamp()

        });

    })

    .then(function () {
      // Firebase Spark: confirmação por link enviado ao endereço cadastrado.
      return auth.currentUser.sendEmailVerification()
        .then(function () {
          mostrarToast("Cadastro realizado! Confira seu e-mail e confirme sua conta antes de entrar.", "ok");
        })
        .catch(function (erroEmail) {
          console.error("Falha ao enviar confirmação:", erroEmail);
          mostrarToast("Conta criada, mas falhou o envio: " + (erroEmail.code || erroEmail.message) + ". Entre com sua senha para tentar reenviar.", "err");
        })
        .then(function () { return auth.signOut(); });
    })
    .then(function () {

      // A mensagem de envio (sucesso ou falha) já foi mostrada acima.


      // ====================================
      // LIMPAR FORMULÁRIO
      // ====================================

      var campos = [
        "cad-nome",
        "cad-email",
        "cad-telefone",
        "cad-senha",
        "cad-senha2"
      ];


      campos.forEach(function (id) {

        var campo =
          document.getElementById(id);


        if (campo) {
          campo.value = "";
        }

      });


      /*
       * Mantém o perfil selecionado
       * como "passageiro" apenas se
       * o campo existir.
       */

      var campoTipo =
        document.getElementById("cad-tipo");


      if (campoTipo) {
        campoTipo.value = "passageiro";
      }


      mostrarAba(
        "login"
      );

    })

    .catch(function (erro) {

      console.error(
        "Erro no cadastro:",
        erro
      );


      switch (erro.code) {

        case "auth/email-already-in-use":

          mostrarToast(
            "Este e-mail já está cadastrado.",
            "err"
          );

          break;


        case "auth/invalid-email":

          mostrarToast(
            "O e-mail informado é inválido.",
            "err"
          );

          break;


        case "auth/weak-password":

          mostrarToast(
            "A senha deve ter pelo menos 6 caracteres.",
            "err"
          );

          break;


        case "auth/network-request-failed":

          mostrarToast(
            "Erro de conexão com a internet.",
            "err"
          );

          break;


        case "auth/configuration-not-found":

          mostrarToast(
            "Ative o login por E-mail/Senha no Firebase.",
            "err"
          );

          break;


        default:

          mostrarToast(
            "Não foi possível criar a conta.",
            "err"
          );

          console.error(
            erro.message
          );

      }

    });

}



// ==========================================
// LOGIN
// ==========================================
function fazerLogin(event) {
  event.preventDefault();

  var campoEmail = document.getElementById("log-email");
  var campoSenha = document.getElementById("log-senha");
  var email = campoEmail ? campoEmail.value.trim() : "";
  var senha = campoSenha ? campoSenha.value : "";

  if (!email || !senha) {
    mostrarToast("Informe e-mail e senha.", "err");
    return;
  }

  if (typeof firebase === "undefined" || typeof auth === "undefined" || !auth) {
    console.error("Firebase Authentication não foi inicializado. Confira js/firebase-config.js e os scripts Firebase do index.html.");
    mostrarToast("O serviço de login não foi carregado. Atualize a página e tente novamente.", "err");
    return;
  }

  mostrarToast("Verificando seus dados...");

  // Autentica a conta; falhas do Firestore são tratadas separadamente.
  auth.signInWithEmailAndPassword(email, senha)
    .then(function (credencial) {
      var user = credencial.user;
      console.log("Autenticação realizada. UID:", user.uid);

      return db.collection(USUARIOS_COLLECTION).doc(user.uid).get()
        .then(function (doc) {
          if (!doc.exists) {
            console.error("Conta autenticada, mas não existe documento usuarios/" + user.uid);
            mostrarToast("Sua conta foi autenticada, mas o perfil não foi encontrado no Firestore. Não faça outro cadastro ainda; precisamos verificar o documento usuarios.", "err");
            return;
          }

          var dados = doc.data() || {};
          if (dados.bloqueado === true) {
            return auth.signOut().then(function () {
              mostrarToast("Esta conta está bloqueada. Entre em contato com o administrador.", "err");
            });
          }

          if (dados.exigeConfirmacaoEmail === true && !user.emailVerified) {
            return user.reload().then(function () {
              if (auth.currentUser && auth.currentUser.emailVerified) return;
              var reenviar = window.confirm("Confirme seu e-mail para entrar no VaiComigo. Deseja reenviar o link de confirmação?");
              return (reenviar ? user.sendEmailVerification() : Promise.resolve())
                .then(function () { return auth.signOut(); })
                .then(function () { mostrarToast("Confirme seu e-mail e depois faça login novamente.", "err"); });
            });
          }

          var tipo = dados.tipo || "ambos";
          mostrarToast("Login realizado com sucesso!", "ok");
          window.setTimeout(function () {
            if (tipo === "passageiro") {
              window.location.href = "passageiro.html";
            } else if (tipo === "motorista") {
              window.location.href = "motorista.html";
            } else {
              window.location.href = "painel.html";
            }
          }, 500);
        })
        .catch(function (erroPerfil) {
          console.error("Falha ao consultar o perfil no Firestore:", erroPerfil);
          if (erroPerfil && (erroPerfil.code === "permission-denied" || erroPerfil.code === "firestore/permission-denied")) {
            mostrarToast("Sua senha foi aceita, mas o Firestore bloqueou a leitura do perfil. Verifique as regras da coleção usuarios.", "err");
          } else {
            mostrarToast("Sua senha foi aceita, mas não foi possível carregar seu perfil. Confira a conexão e o Firestore.", "err");
          }
        });
    })
    .catch(function (erro) {
      console.error("Falha na autenticação Firebase:", erro && erro.code, erro && erro.message, erro);
      var mensagens = {
        "auth/invalid-email": "O e-mail informado é inválido.",
        "auth/invalid-credential": "E-mail ou senha incorretos.",
        "auth/wrong-password": "E-mail ou senha incorretos.",
        "auth/user-not-found": "Não existe uma conta com esse e-mail neste projeto Firebase.",
        "auth/user-disabled": "Esta conta está desativada.",
        "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco e tente novamente.",
        "auth/network-request-failed": "Falha de conexão. Verifique a internet e tente novamente.",
        "auth/configuration-not-found": "O login por E-mail/Senha não está ativado no Firebase.",
        "auth/operation-not-allowed": "Ative o provedor E-mail/Senha em Firebase Authentication.",
        "auth/api-key-not-valid": "A chave de API do Firebase foi rejeitada. Confira js/firebase-config.js."
      };
      mostrarToast(mensagens[erro && erro.code] || ("Falha no login (" + ((erro && erro.code) || "erro desconhecido") + "). Consulte o Console do navegador (F12)."), "err");
    });
}


// ==========================================
// RECUPERAÇÃO DE SENHA
// ==========================================
function recuperarAcesso(event) {

  event.preventDefault();


  var email =
    document.getElementById(
      "rec-email"
    ).value.trim();


  if (!email) {

    mostrarToast(
      "Informe seu e-mail.",
      "err"
    );

    return;
  }


  mostrarToast(
    "Enviando link..."
  );


  auth
    .sendPasswordResetEmail(
      email
    )

    .then(function () {

      mostrarToast(
        "Link de recuperação enviado para seu e-mail.",
        "ok"
      );


      document.getElementById(
        "rec-email"
      ).value = "";


      mostrarAba(
        "login"
      );

    })

    .catch(function (erro) {

      console.error(
        "Erro na recuperação:",
        erro
      );


      switch (erro.code) {

        case "auth/invalid-email":

          mostrarToast(
            "E-mail inválido.",
            "err"
          );

          break;


        case "auth/user-not-found":

          mostrarToast(
            "Não encontramos uma conta com esse e-mail.",
            "err"
          );

          break;


        case "auth/network-request-failed":

          mostrarToast(
            "Erro de conexão com a internet.",
            "err"
          );

          break;


        default:

          mostrarToast(
            "Não foi possível enviar o link.",
            "err"
          );

          console.error(
            erro.message
          );

      }

    });

}



// ==========================================
// OBSERVAR USUÁRIO LOGADO
// ==========================================

auth.onAuthStateChanged(
  function (user) {

    if (user) {

      console.log(
        "Usuário autenticado:",
        user.uid
      );

    }

    else {

      console.log(
        "Nenhum usuário autenticado."
      );

    }

  }
);