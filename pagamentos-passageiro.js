/* VaiComigo — pagamento manual somente após viagem concluída. */
(function(){'use strict';
var el=document.getElementById('vc-pagamentos-passageiro');if(!el)return;

function codigoViagem(id){return 'VC-'+String(id||'').slice(0,10).toUpperCase();}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function aviso(t){el.textContent=t;}
function erro(e){console.error('Pagamento passageiro:',e);aviso('Erro ao consultar pagamentos: '+(e.message||e));}
function moeda(n){return Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
function copiar(t){if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(t).then(function(){alert('Chave Pix copiada.');}).catch(function(){prompt('Copie a chave:',t);});else prompt('Copie a chave:',t);}
if(typeof firebase==='undefined'||typeof db==='undefined'){aviso('Firebase não inicializado.');return;}
var unsub=null,sequencia=0, usuarioUid='';
function chaveOcultos(){return 'vaicomigo_historico_oculto_'+usuarioUid;}
function ocultos(){try{return JSON.parse(localStorage.getItem(chaveOcultos())||'[]');}catch(e){return [];}}
function estaOculto(id){return ocultos().includes(id);}
function ocultarLocal(id){var a=ocultos();if(!a.includes(id)){a.push(id);localStorage.setItem(chaveOcultos(),JSON.stringify(a));}}
function reexibirLocal(id){var a=ocultos().filter(function(x){return x!==id;});localStorage.setItem(chaveOcultos(),JSON.stringify(a));}
firebase.auth().onAuthStateChanged(function(u){if(unsub){unsub();unsub=null;}if(!u){usuarioUid='';aviso('Faça login para consultar pagamentos.');return;}
usuarioUid=u.uid;
unsub=db.collection('solicitacoes').where('passageiroUid','==',u.uid).onSnapshot(function(s){var versao=++sequencia,sol=[];
s.forEach(function(d){var x=d.data();if(['aceita','aceito'].includes(x.status)&&x.viagemId&&!x.ocultadaPassageiro&&!estaOculto(d.id))sol.push({id:d.id,x:x});});
if(!sol.length){aviso('Nenhuma solicitação aceita. As formas de pagamento aparecem após o encerramento da viagem.');return;}
Promise.all(sol.map(function(i){return db.collection('viagens').doc(i.x.viagemId).get().then(function(v){if(!v.exists||v.data().status!=='concluida')return null;return Promise.all([db.collection('pagamentosPassageiro').doc(i.id).get(),db.collection('pixMotoristas').doc(i.x.motoristaUid).get().catch(function(e){console.warn('Pix do motorista indisponível:',e);return {exists:false,data:function(){return {};}};})]).then(function(a){return {id:i.id,x:i.x,v:v.data(),pag:a[0].exists?a[0].data():null,pix:a[1].exists?a[1].data():{}};});});})).then(function(a){if(versao!==sequencia)return;var items=a.filter(function(i){return i&&!estaOculto(i.id);});if(!items.length){aviso('Aguardando o motorista encerrar a viagem. O pagamento só será liberado após a conclusão.');return;}
// Não consultar solicitações de outros passageiros: as regras restringem a leitura.
// A ocupação é mantida no documento da viagem pelo fluxo de aceite do motorista.
Promise.all(items.map(function(i){
  var v=i.v, quantidade=Math.max(1,Math.floor(Number(i.x.vagasSolicitadas||1)));
  var ocupadas=Number(v.vagasOcupadas);
  if(!Number.isInteger(ocupadas)||ocupadas<quantidade){
    var totais=Number(v.vagasTotais), livres=Number(v.vagasDisponiveis);
    if(Number.isInteger(totais)&&Number.isInteger(livres)&&totais-livres>=quantidade){
      ocupadas=totais-livres;
    }else{
      throw Error('Não foi possível determinar as vagas ocupadas desta viagem. Solicite ao motorista a conferência do registro.');
    }
  }
  var centavos=Math.round(Number(v.valor||0)*100);
  if(!Number.isFinite(centavos)||centavos<0)throw Error('Valor da viagem inválido.');
  // Valor exibido estimado em centavos; rateio definitivo requer congelar os valores por solicitação.
  i.valorCentavos=Math.round(centavos*quantidade/ocupadas);
  i.totalVagas=ocupadas;
  return Promise.resolve(i);
})).then(function(items){if(versao!==sequencia)return;el.innerHTML=items.map(function(i){var quantidade=Math.max(1,Number(i.x.vagasSolicitadas||1)),valor=i.valorCentavos/100,precoUnitario=(Math.round(Number(i.v.valor||0)*100)/i.totalVagas),forma=i.pag&&i.pag.forma,recebido=i.pag&&i.pag.status==='recebido',telefone=String(i.pix.whatsapp||'').replace(/\D/g,''),texto='Olá! Sou passageiro do VaiComigo. Viagem '+i.x.viagemId+'. Pagamento '+moeda(valor)+' por Pix. Vou anexar o comprovante nesta conversa.';
var link=telefone&&/^\d{12,15}$/.test(telefone)?'https://wa.me/'+telefone+'?text='+encodeURIComponent(texto):'';
return '<div class="card" style="margin:12px 0;border:1px solid #d6e2f4">'+'<a class="btn" style="display:inline-block;margin-bottom:10px" href="chat.html?solicitacao='+encodeURIComponent(i.id)+'">💬 Conversar com motorista</a>'+'<h3>'+esc(i.v.origem)+' → '+esc(i.v.destino)+'</h3><p>Preço por pessoa: <strong>'+moeda(precoUnitario)+'</strong> · Vagas solicitadas: <strong>'+quantidade+'</strong></p><p>Pagamento individual desta solicitação: <strong>'+moeda(valor)+'</strong></p>'+(forma?'<p>Forma escolhida: <strong>'+esc(forma)+'</strong></p><p>Status: <strong>'+(recebido?'Pagamento finalizado — confirmado pelo motorista':'Aguardando confirmação do motorista')+'</strong></p>':'<label>Como deseja pagar? <select class="input" id="vc-forma-'+esc(i.id)+'"><option value="pix">Pix</option><option value="dinheiro">Dinheiro</option><option value="maquininha">Maquininha</option></select></label> <button type="button" class="btn" data-save="'+esc(i.id)+'">Registrar forma de pagamento</button>')+(forma==='pix'?'<p>Chave Pix do motorista: <strong>'+esc(i.pix.chavePix||'Não cadastrada')+'</strong></p>'+(i.pix.chavePix?'<button type="button" class="btn" data-copy="'+esc(i.id)+'">Copiar chave Pix</button> ':'')+(link?'<a class="btn" target="_blank" rel="noopener noreferrer" href="'+esc(link)+'">Abrir WhatsApp para enviar comprovante</a>':'<p>WhatsApp do motorista ainda não cadastrado.</p>')+'<p>O comprovante deve ser anexado manualmente no WhatsApp. O envio não confirma o recebimento.</p>':forma?'<p>Combine o pagamento diretamente com o motorista. Ele confirmará o recebimento.</p>':'')+(recebido?'<p><strong>Viagem concluída e pagamento finalizado.</strong></p>':'')+(recebido?'<button type="button" class="btn" data-ocultar="'+esc(i.id)+'">Remover do meu histórico</button>':'<p style="color:#8a5700;font-weight:600">A opção de remover será liberada somente após o motorista confirmar o recebimento do pagamento.</p>')+'</div>';}).join('');
el.querySelectorAll('[data-ocultar]').forEach(function(b){b.onclick=async function(){if(!confirm('Remover esta viagem concluída da sua lista? Os dados e pagamentos serão preservados no Firebase.'))return;var i=items.find(function(z){return z.id===b.dataset.ocultar;});if(!i)return;try{b.disabled=true;var pagamentoAtual=await db.collection('pagamentosPassageiro').doc(i.id).get();if(!pagamentoAtual.exists||pagamentoAtual.data().status!=='recebido'){alert('Não é possível remover: o pagamento ainda não foi confirmado pelo motorista.');b.disabled=false;return;}ocultarLocal(i.id);sequencia++;var card=b.closest('.card');if(card)card.remove();if(!el.querySelector('.card'))aviso('Nenhuma viagem concluída visível no seu histórico.');await db.collection('solicitacoes').doc(i.id).update({ocultadaPassageiro:true});}catch(e){console.error('Falha ao salvar remoção no Firebase:',e);alert('A viagem foi ocultada neste navegador, mas o Firebase não confirmou a remoção. Verifique as regras do Firestore. Detalhes: '+(e.message||e));}};});
el.querySelectorAll('[data-copy]').forEach(function(b){b.onclick=function(){var i=items.find(function(z){return z.id===b.dataset.copy;});if(i&&i.pix.chavePix)copiar(i.pix.chavePix);};});
el.querySelectorAll('[data-save]').forEach(function(b){b.onclick=function(){var i=items.find(function(z){return z.id===b.dataset.save;}),sel=document.getElementById('vc-forma-'+b.dataset.save);if(!i||!sel)return;b.disabled=true;db.collection('pagamentosPassageiro').doc(i.id).set({passageiroUid:u.uid,motoristaUid:i.x.motoristaUid,viagemId:i.x.viagemId,forma:sel.value,status:'informado',criadoEm:firebase.firestore.FieldValue.serverTimestamp()}).then(function(){alert('Forma de pagamento registrada.');return db.collection('pagamentosPassageiro').doc(i.id).get();}).then(function(){sequencia++;return db.collection('solicitacoes').where('passageiroUid','==',u.uid).get();}).then(function(){location.reload();}).catch(erro).finally(function(){b.disabled=false;});};});
}).catch(function(e){console.error('Falha ao calcular rateio:',e);erro(e);});
}).catch(function(e){console.error('Falha ao consultar pagamentos:',e);erro(e);});
},erro);
});
})();
