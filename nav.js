// ==========================================
// NAV.JS - NAVEGAÇÃO DO VAI COMIGO
// ==========================================

var USUARIO_ATUAL = null;


// ==========================================
// MONTAR MENU CONFORME O TIPO DE USUÁRIO
// ==========================================

function montarMenu(dados) {

  var menu = document.getElementById("menu");

  if (!menu) return;


  var itens = [];

  // ------------------------------------------
  // INÍCIO
  // ------------------------------------------

  itens.push({
    href: "painel.html",
    txt: "Inicio"
  });


  // ------------------------------------------
  // TIPO DO USUÁRIO
  // ------------------------------------------

  var tipo = dados && dados.tipo ? dados.tipo : "ambos";


  // ------------------------------------------
  // PASSAGEIRO
  // ------------------------------------------

  if (tipo === "passageiro" || tipo === "ambos") {

    itens.push({
      href: "passageiro.html",
      txt: "Buscar carona"
    });

  }


  // ------------------------------------------
  // MOTORISTA
  // ------------------------------------------

  if (tipo === "motorista" || tipo === "ambos") {

    itens.push({
      href: "motorista.html",
      txt: "Oferecer carona"
    });

  }


  // ------------------------------------------
  // PERFIL
  // ------------------------------------------

  itens.push({
    href: "perfil.html",
    txt: "Perfil"
  });


  // ------------------------------------------
  // AVALIAR O APLICATIVO
  // ------------------------------------------

  itens.push({
    href: "avaliar-app.html",
    txt: "Avaliar o app"
  });


  // ------------------------------------------
  // SEGURANÇA
  // ------------------------------------------

  itens.push({
    href: "seguranca.html",
    txt: "Segurança"
  });


  // ------------------------------------------
  // ADMIN
  // ------------------------------------------

  if (dados && dados.admin === true) {

    itens.push({
      href: "admin.html",
      txt: "Admin"
    });

  }


  // ------------------------------------------
  // PÁGINA ATUAL
  // ------------------------------------------

  var atual = window.location.pathname
    .split("/")
    .pop();


  // ------------------------------------------
  // GERAR HTML
  // ------------------------------------------

  var html = itens.map(function (item) {

    var classe = "";

    if (item.href === atual) {
      classe = "ativo";
    }

    if (item.href === "perfil.html") {
      var foto = dados && typeof dados.fotoUrl === "string" && /^https:\/\//i.test(dados.fotoUrl)
        ? escapeHtml(dados.fotoUrl)
        : "img/avatar-padrao.svg";
      return `
        <a class="${classe} nav-perfil-link" href="perfil.html">
          <img class="nav-avatar" src="${foto}" alt="" onerror="this.onerror=null;this.src='img/avatar-padrao.svg'">
          <span>Perfil</span>
        </a>
      `;
    }

    return `
      <a class="${classe}" href="${item.href}">
        ${item.txt}
      </a>
    `;

  }).join("");


  // ------------------------------------------
  // BOTÃO SAIR
  // ------------------------------------------

  html += `
    <a
      href="#"
      onclick="logout(); return false;"
    >
      Sair
    </a>
  `;


  // ------------------------------------------
  // INSERIR MENU
  // ------------------------------------------

  menu.innerHTML = html;
}


// ==========================================
// INICIAR PÁGINA
// ==========================================

function iniciarPagina(callback) {

  exigirLogin(function (user) {

    carregarUsuario(user.uid)

      .then(function (dados) {

        // ------------------------------------
        // USUÁRIO BLOQUEADO
        // ------------------------------------

        if (dados && dados.bloqueado) {

          auth.signOut();

          window.location.href = "index.html";

          return;
        }


        // ------------------------------------
        // DADOS DO USUÁRIO
        // ------------------------------------

        USUARIO_ATUAL = dados || {};


        USUARIO_ATUAL.uid = user.uid;


        // ------------------------------------
        // COMPATIBILIDADE COM CONTAS ANTIGAS
        // ------------------------------------

        if (!USUARIO_ATUAL.tipo) {

          USUARIO_ATUAL.tipo = "ambos";

        }


        // ------------------------------------
        // MONTAR MENU
        // ------------------------------------

        montarMenu(USUARIO_ATUAL);


        // ------------------------------------
        // EXECUTAR CALLBACK DA PÁGINA
        // ------------------------------------

        if (typeof callback === "function") {

          callback(user, USUARIO_ATUAL);

        }

      })

      .catch(function (erro) {

        console.error(
          "Erro ao carregar usuário:",
          erro
        );

        mostrarToast(
          "Não foi possível carregar seus dados.",
          "err"
        );

      });

  });

}