// Reabre o rastreamento a partir de Minhas solicitações, após validar a titularidade.
(function () {
  var id = new URLSearchParams(location.search).get('acompanhar');
  if (!id || !window.auth || !window.db) return;
  auth.onAuthStateChanged(function (usuario) {
    if (!usuario) return;
    db.collection('solicitacoes').where('passageiroUid', '==', usuario.uid).get().then(function (snap) {
      var autorizado = false;
      snap.forEach(function (d) {
        var s = d.data();
        if (s.viagemId === id && ['aceita', 'aceito'].includes(s.status)) autorizado = true;
      });
      if (!autorizado) throw new Error('Não há solicitação aceita para esta viagem.');
      return db.collection('viagens').doc(id).get();
    }).then(function (doc) {
      if (!doc || !doc.exists || ['concluida', 'concluída', 'cancelada'].includes(doc.data().status))
        throw new Error('O acompanhamento desta viagem não está mais disponível.');
      var area = document.getElementById('rastreamento-passageiro');
      var secao = document.getElementById('area-acompanhamento-viagem');
      if (secao) secao.style.display = 'block';
      acompanharViagem(id);
      if (area) setTimeout(function () { area.scrollIntoView({behavior:'smooth', block:'start'}); if (typeof mapaPassageiro !== 'undefined' && mapaPassageiro) mapaPassageiro.invalidateSize(); }, 450);
    }).catch(function (e) { alert(e.message || 'Não foi possível reabrir o acompanhamento.'); });
  });
})();
