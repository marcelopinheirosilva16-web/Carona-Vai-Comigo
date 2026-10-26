/* VaiComigo - avisos financeiros para administradores (ambiente de testes). */
(function () {
  'use strict';
  var sec = document.getElementById('vc-admin-alertas');
  if (!sec || !window.firebase || !window.db) return;
  var botao = sec.querySelector('[data-sino]');
  var contador = sec.querySelector('[data-contador]');
  var lista = sec.querySelector('[data-lista]');
  var cancelar = null, uid = null, itens = [], aberto = false;
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function chave(id) { return 'vc_admin_taxa_lida_'+uid+'_'+id; }
  function versao(i) { var d=i.data; return d.status+'_'+(d.comprovanteEnviadoEm && d.comprovanteEnviadoEm.seconds || 'pendente'); }
  function data(t) { try { return t && t.toDate ? t.toDate().toLocaleString('pt-BR') : 'Data não informada'; } catch (_) { return 'Data não informada'; } }
  function desenhar() {
    var novos = itens.filter(function(i){try{return localStorage.getItem(chave(i.id)) !== versao(i);}catch(_){return true;}});
    contador.hidden = novos.length === 0;
    contador.textContent = String(novos.length);
    botao.setAttribute('aria-label','Notificações financeiras: '+novos.length+' não lidas');
    if (!itens.length) { lista.innerHTML = '<p>Nenhuma taxa pendente ou comprovante aguardando conferência.</p>'; return; }
    lista.innerHTML = itens.map(function(i){
      var novo = novos.some(function(n){return n.id===i.id;});
      return '<div style="padding:12px;border-bottom:1px solid #ddd;'+(novo?'font-weight:600;':'')+'">'+
        '<div>💳 '+(i.data.status==='comprovante_enviado'?'Comprovante enviado para conferência':'Taxa de 2% aguardando pagamento')+' '+(novo?'• Novo':'• Visualizado')+'</div>'+ 
        '<div>Viagem: '+esc(i.id)+'</div><div data-detalhe-alerta="'+esc(i.id)+'">Carregando dados da viagem...</div>'+
        '<div>Referência: '+esc(i.data.comprovanteReferencia || 'Não informada')+'</div>'+
        '<div style="font-size:.85rem">Registrado: '+esc(data(i.data.comprovanteEnviadoEm))+'</div>'+
        '<button type="button" class="btn sm" data-ver="'+esc(i.id)+'">Ver no financeiro</button> '+
        '<button type="button" class="btn sm" data-ler="'+esc(i.id)+'">Marcar como lida</button></div>';
    }).join('');
    itens.forEach(function(i){var slot=Array.from(lista.querySelectorAll('[data-detalhe-alerta]')).find(function(n){return n.getAttribute('data-detalhe-alerta')===i.id;});if(!slot)return;window.vcDetalhesFinanceiros.get(i.data.viagemId||i.id,i.data.motoristaUid).then(function(d){if(!slot.isConnected)return;slot.innerHTML='<div>Motorista: '+esc(d.motorista)+'</div><div>Origem: '+esc(d.origem)+' → Destino: '+esc(d.destino)+'</div><div>Conclusão: '+esc(d.conclusao)+'</div>';});});
    lista.querySelectorAll('[data-ler]').forEach(function(b){b.onclick=function(){marcar(b.getAttribute('data-ler'));};});
    lista.querySelectorAll('[data-ver]').forEach(function(b){b.onclick=function(){marcar(b.getAttribute('data-ver'));var alvo=document.getElementById('vc-financeiro-admin');if(alvo)alvo.scrollIntoView({behavior:'smooth',block:'start'});};});
  }
  function marcar(id){var item=itens.find(function(i){return i.id===id;});if(!item)return;try{localStorage.setItem(chave(id),versao(item));}catch(_){}desenhar();}
  botao.addEventListener('click',function(){aberto=!aberto;lista.hidden=!aberto;botao.setAttribute('aria-expanded',String(aberto));desenhar();});
  firebase.auth().onAuthStateChanged(function(u){
    if(cancelar){cancelar();cancelar=null;}
    sec.hidden=true;uid=null;itens=[];lista.hidden=true;aberto=false;
    if(!u)return;
    db.collection('usuarios').doc(u.uid).get().then(function(doc){
      if(firebase.auth().currentUser?.uid!==u.uid || !doc.exists || doc.data().admin!==true)return;
      uid=u.uid;sec.hidden=false;
      cancelar=db.collection('taxasPlataforma').onSnapshot(function(s){
        itens=[];s.forEach(function(d){var x=d.data();if(x.status==='pendente'||x.status==='comprovante_enviado')itens.push({id:d.id,data:x});});
        itens.sort(function(a,b){var x=a.data.comprovanteEnviadoEm,y=b.data.comprovanteEnviadoEm;return (y&&y.seconds||0)-(x&&x.seconds||0);});
        desenhar();
      },function(e){console.error('Notificações financeiras:',e);lista.hidden=false;lista.textContent='Não foi possível consultar as notificações. Confira as regras do Firestore.';});
    }).catch(function(e){console.error('Validação administrativa:',e);});
  });
})();
