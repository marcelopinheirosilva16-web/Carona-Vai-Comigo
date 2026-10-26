/* VaiComigo — Financeiro motorista. Firebase Compat. */
(function(){
  'use strict';
  var el=document.getElementById('vc-taxas-motorista'); if(!el)return;

  var uid=null, pix='', whats='', unsub=null;
  function codigoViagem(id){return 'VC-'+String(id||'').slice(0,10).toUpperCase();}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function brl(c){return (Number(c||0)/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
  function erro(e){console.error(e);el.textContent='Erro no financeiro: '+(e.message||e);}
  function taxa(v){return Math.round(Math.round(Number(v||0)*100)*.02);}
  function carregar(){
    db.collection('configFinanceira').doc('pix').onSnapshot(function(d){var x=d.data()||{};pix=x.chavePix||'';whats=x.whatsapp||'';},erro);
    db.collection('viagens').where('motoristaUid','==',uid).onSnapshot(function(s){
      var concluidas=[];s.forEach(function(d){if(d.data().status==='concluida')concluidas.push({id:d.id,data:d.data()});});
      Promise.all(concluidas.map(function(v){
        var ref=db.collection('taxasPlataforma').doc(v.id);
        return ref.get().then(function(d){
          if(d.exists)return;
          return db.collection('solicitacoes').where('viagemId','==',v.id).get().then(function(sol){var temAceito=false;sol.forEach(function(x){if(['aceita','aceito'].includes(x.data().status))temAceito=true;});if(!temAceito)return;return ref.set({viagemId:v.id,motoristaUid:uid,valorViagemCentavos:Math.round(Number(v.data.valor||0)*100),taxaCentavos:taxa(v.data.valor),status:'pendente',criadoEm:firebase.firestore.FieldValue.serverTimestamp()});}).catch(function(e){console.warn('Taxa não gerada, verifique as regras:',e);});
        });
      })).then(function(){
        if(unsub)unsub();
        unsub=db.collection('taxasPlataforma').where('motoristaUid','==',uid).onSnapshot(function(t){
          var items=[];t.forEach(function(d){items.push({id:d.id,x:d.data()});});
          items.sort(function(a,b){return a.id.localeCompare(b.id);});
          el.innerHTML=items.length?items.map(function(i){var x=i.x;var pend=x.status!=='paga';return '<div class="card" style="margin:10px 0"><strong>Viagem '+esc(i.id)+'</strong><p>Valor: '+brl(x.valorViagemCentavos)+' · Taxa 2%: <strong>'+brl(x.taxaCentavos)+'</strong></p><p>Status: '+esc(x.status)+'</p>'+(pend?'<p>Pix do administrador: <strong>'+esc(pix||'Aguardando configuração')+'</strong></p><button class="btn" data-copy="'+esc(i.id)+'">Copiar chave Pix</button> <button class="btn" data-send="'+esc(i.id)+'">Registrar referência do comprovante</button> '+(whats?'<a target="_blank" rel="noopener" href="https://wa.me/'+encodeURIComponent(whats)+'?text='+encodeURIComponent('VaiComigo TESTE - taxa da viagem '+codigoViagem(i.id)+' - '+brl(x.taxaCentavos))+'">Enviar comprovante no WhatsApp</a>':''): '<p>Recebimento confirmado pelo administrador.</p>')+'</div>';}).join(''):'<p>Nenhuma taxa registrada. As taxas são geradas após a conclusão das viagens.</p>';
          el.querySelectorAll('[data-copy]').forEach(function(b){b.onclick=function(){if(!pix)return alert('Administrador ainda não configurou a chave Pix.');if(navigator.clipboard)navigator.clipboard.writeText(pix).then(function(){alert('Chave Pix copiada.');}).catch(function(){prompt('Copie a chave Pix:',pix);});else prompt('Copie a chave Pix:',pix);};});
          el.querySelectorAll('[data-send]').forEach(function(b){b.onclick=function(){var id=b.getAttribute('data-send');var item=items.find(function(z){return z.id===id;});if(!item||item.x.status==='paga')return;var ref=prompt('Informe o identificador da transação Pix ou uma referência do comprovante. Envie a imagem ao WhatsApp do administrador separadamente.');if(!ref)return;ref=ref.trim();if(ref.length<3||ref.length>250)return alert('Informe de 3 a 250 caracteres.');db.collection('taxasPlataforma').doc(id).update({status:'comprovante_enviado',comprovanteReferencia:ref,comprovanteEnviadoEm:firebase.firestore.FieldValue.serverTimestamp()}).then(function(){alert('Referência registrada. Aguardando conferência do administrador.');}).catch(erro);};});
        },erro);
      }).catch(erro);
    },erro);
  }
  firebase.auth().onAuthStateChanged(function(u){if(unsub){unsub();unsub=null;}uid=u&&u.uid;if(!uid){el.textContent='Entre na sua conta para ver as taxas.';return;}carregar();});
})();
