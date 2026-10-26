/* Links para conversas de solicitações aceitas — não altera o fluxo de viagens. */
(function(){'use strict';
var root=document.getElementById('vc-chat-links');if(!root||typeof firebase==='undefined')return;
var stop=null;
function esc(t){return String(t||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
firebase.auth().onAuthStateChanged(function(u){if(stop){stop();stop=null;}root.textContent='';if(!u)return;
stop=firebase.firestore().collection('solicitacoes').where('passageiroUid','==',u.uid).onSnapshot(function(s){var arr=[];s.forEach(function(d){var x=d.data();if(x.status==='aceita'||x.status==='aceito')arr.push({id:d.id,nome:x.motoristaNome||'motorista'});});root.innerHTML=arr.length?arr.map(function(x){return '<a class="btn" style="display:inline-block;margin:5px" href="chat.html?solicitacao='+encodeURIComponent(x.id)+'">💬 Conversar com '+esc(x.nome)+'</a>';}).join(''):'<p class="meta">As conversas ficam disponíveis após o motorista aceitar a solicitação.</p>';},function(e){root.textContent='Não foi possível carregar conversas: '+e.message;});});
window.addEventListener('pagehide',function(){if(stop)stop();});
})();
