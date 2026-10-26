/* VaiComigo: leitura de detalhes financeiros, sem alterar valores ou pagamentos. */
(function(){'use strict';
function get(col,id){return id?db.collection(col).doc(String(id)).get().then(function(d){return d.exists?d.data()||{}:{};}).catch(function(e){console.warn('Detalhes:',col,e);return {};}):Promise.resolve({});}
function format(t){try{if(t&&t.toDate)return t.toDate().toLocaleString('pt-BR');if(t&&t.seconds)return new Date(t.seconds*1000).toLocaleString('pt-BR');if(t instanceof Date)return t.toLocaleString('pt-BR');if(typeof t==='string'&&t){var d=new Date(t);if(!isNaN(d.getTime()))return d.toLocaleString('pt-BR');}}catch(e){}return 'Não informada';}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function first(){for(var i=0;i<arguments.length;i++){var v=arguments[i];if(v!==undefined&&v!==null&&String(v).trim()!=='')return v;}return '';}
function solicitation(id,p){return get('solicitacoes',first(p.solicitacaoId,id));}
function detalhes(viagemId,motoristaUid,pagamentoId){
 return Promise.all([get('viagens',viagemId),get('usuarios',motoristaUid),get('pagamentosPassageiro',pagamentoId)]).then(function(a){
 var v=a[0],m=a[1],p=a[2];return solicitation(pagamentoId,p).then(function(s){
 var uid=first(p.passageiroUid,s.passageiroUid);
 return get('usuarios',uid).then(function(u){
 var nome=first(p.passageiroNome,s.passageiroNome,u.nome);
 return {codigo:'VC-'+String(viagemId||'').slice(0,10).toUpperCase(),motorista:first(v.motoristaNome,m.nome,'Nome indisponível'),passageiro:nome||'Nome indisponível',origem:first(v.origem,p.origem,s.origem,'Não informada'),destino:first(v.destino,p.destino,s.destino,'Não informado'),conclusao:format(first(v.encerradoEm,v.concluidoEm,v.finalizadoEm,v.dataConclusao,p.concluidoEm)),dataViagem:format(v.dataHora),_hasViagem:Object.keys(v).length>0};
 });});});}
window.vcDetalhesFinanceiros={get:detalhes,esc:esc};
})();
