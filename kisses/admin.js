/* Kisses admin. CLIENT-SIDE ONLY: not real security. Anyone can read this code / localStorage. */
(function(){
var K=window.Kisses,esc=K.esc,AK='kisses_admin_v1',D,app=document.getElementById('app');
function sha256(s){var r=function(n,x){return(x>>>n)|(x<<(32-n))},m=Math.pow,mx=m(2,32),i,j,w=[],h=[],k=[],pc=0,c={},a;
  for(var cand=2;pc<64;cand++)if(!c[cand]){for(i=0;i<313;i+=cand)c[i]=cand;h[pc]=(m(cand,.5)*mx)|0;k[pc++]=(m(cand,1/3)*mx)|0}
  var b=unescape(encodeURIComponent(s))+'\x80';while(b.length%64-56)b+='\0';
  for(i=0;i<b.length;i++){j=b.charCodeAt(i);w[i>>2]|=j<<((3-i)%4)*8}
  var l=((s=unescape(encodeURIComponent(arguments[0]))).length)*8;w[w.length]=(l/mx)|0;w[w.length]=l|0;
  var H=h.slice(0,8);
  for(j=0;j<w.length;){var W=w.slice(j,j+=16),o=H.slice(0);
    for(i=0;i<64;i++){var w15=W[i-15],w2=W[i-2],a0=o[0],e0=o[4];
      var t1=o[7]+(r(6,e0)^r(11,e0)^r(25,e0))+((e0&o[5])^(~e0&o[6]))+k[i]+(W[i]=i<16?W[i]:(W[i-16]+(r(7,w15)^r(18,w15)^(w15>>>3))+W[i-7]+(r(17,w2)^r(19,w2)^(w2>>>10)))|0);
      var t2=(r(2,a0)^r(13,a0)^r(22,a0))+((a0&o[1])^(a0&o[2])^(o[1]&o[2]));
      o=[(t1+t2)|0].concat(o);o[4]=(o[4]+t1)|0;o.pop()}
    for(i=0;i<8;i++)H[i]=(H[i]+o[i])|0}
  var out='';for(i=0;i<8;i++)for(j=3;j+1;j--){var bb=(H[i]>>(j*8))&255;out+=(bb<16?'0':'')+bb.toString(16)}return out}
K.sha256=sha256;
function creds(){try{var c=JSON.parse(localStorage.getItem(AK));if(c&&c.user&&c.hash)return c}catch(e){}return{user:'admin',hash:sha256('kisses')}}
function toast(m){var t=document.getElementById('toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(function(){t.classList.remove('on')},2000)}
function authed(){return sessionStorage.getItem(K.AUTH)==='1'}
function loginView(){app.innerHTML='<form class="login" id="lf"><h2>Admin Kisses</h2><label class="f">Usuário<input name="u" autocomplete="username"></label><label class="f">Senha<input name="p" type="password" autocomplete="current-password"></label><div class="err" id="le"></div><button class="btn">Entrar</button><p class="note">Login apenas no navegador (client-side): não é segurança real. <a href="index.html">Ver loja</a></p></form>';
  document.getElementById('lf').onsubmit=function(e){e.preventDefault();var f=e.target,c=creds();
    if(f.elements.u.value.trim()===c.user&&sha256(f.elements.p.value)===c.hash){sessionStorage.setItem(K.AUTH,'1');start()}else document.getElementById('le').textContent='Usuário ou senha incorretos.'}}
/* path helpers */
function get(p){return p.split('.').reduce(function(o,k){return o==null?o:o[k]},D)}
function set(p,v){var ks=p.split('.'),o=D;for(var i=0;i<ks.length-1;i++)o=o[ks[i]];o[ks[ks.length-1]]=v}
function persist(){K.save(D)}
function F(p,label,o){o=o||{};var v=get(p),t=o.type||'text',a=' data-p="'+p+'"'+(o.num?' data-num="1"':'');
  if(t==='area')return '<label class="f">'+label+'<textarea'+a+'>'+esc(v)+'</textarea></label>';
  return '<label class="f">'+label+'<input type="'+(o.num?'number':t)+'"'+(o.step?' step="'+o.step+'"':'')+' value="'+esc(v)+'"'+a+'></label>'}
function IMG(p,label){return '<div class="f">'+label+'<div class="th" style="background-image:url(\''+esc(get(p))+'\')"></div><input type="file" accept="image/*" data-img="'+p+'"></div>'}
function LIST(p,title,tpl,item){var L=get(p);return L.map(function(x,i){return '<div class="it">'+item(p+'.'+i,x,i)+'<button type="button" class="mini2 dg" style="margin-top:10px" data-del="'+p+'" data-i="'+i+'">Remover</button></div>'}).join('')+'<button type="button" class="mini2" style="margin-top:12px" data-add="'+p+'" data-tpl="'+tpl+'">+ Adicionar '+title+'</button>'}
var TPL={
 product:function(){return{id:'p'+Date.now().toString(36),name:'Novo produto',desc:'',price:10,badge:'',rating:4.9,reviews:0,bg:'#ffe0e8',image:D.products[0]?D.products[0].image:'',storyTitle:'',story:'',quote:''}},
 testi:function(){return{name:'Nome',city:'Cidade, UF',text:'Depoimento'}},
 post:function(){return{image:D.products[0]?D.products[0].image:'',likes:'0',bg:'#fff1ec'}},
 stat:function(){return{value:'0',label:'rótulo'}},
 pay:function(){return{id:'pg'+Date.now().toString(36),label:'Novo pagamento',discount:0}},
 chap:function(){return{num:'Capítulo',title:'Título',text:''}},
 tl:function(){return{year:'2026',title:'Marco',text:''}},
 val:function(){return{title:'Valor',text:''}},
 founder:function(){return{name:'Nome',role:'Cargo',text:''}},
 market:function(){return{country:'País',flag:'🏳️',text:''}}};
var SECT=[
['Textos do site, banner e rodapé',function(){var s='';[['site.brand','Nome da marca'],['site.tagline','Slogan'],['site.pageTitle','Título da página (aba)'],['site.banner','Banner do topo'],['site.heroTitle','Hero: título'],['site.heroHighlight','Hero: destaque (coral)'],['site.heroButton','Hero: texto do botão'],['site.heroRating','Hero: avaliação'],['site.productsTitle','Título dos sabores'],['site.productsSub','Subtítulo dos sabores'],['site.testimonialsTitle','Título dos depoimentos'],['site.testimonialsSub','Subtítulo dos depoimentos'],['site.instaSub','Subtítulo do Instagram'],['site.checkoutTitle','Título do checkout'],['site.checkoutSub','Subtítulo do checkout'],['site.footer','Rodapé'],['site.disclaimer','Aviso de demonstração (rodapé)']].forEach(function(x){s+=F(x[0],x[1])});
  s+=F('site.heroSub','Hero: subtítulo',{type:'area'})+IMG('site.logo','Logo');return s}],
['Estatísticas',function(){return LIST('site.stats','estatística','stat',function(p){return '<div class="row">'+F(p+'.value','Valor')+F(p+'.label','Rótulo')+'</div>'})}],
['Produtos / sabores',function(){return LIST('products','produto','product',function(p){return '<div class="row">'+F(p+'.name','Nome')+F(p+'.price','Preço (R$)',{num:1,step:'0.01'})+F(p+'.badge','Selo')+F(p+'.rating','Nota (0-5)',{num:1,step:'0.1'})+F(p+'.reviews','Nº de avaliações',{num:1})+F(p+'.bg','Cor de fundo (ex: #ffc2d1)')+'</div>'+F(p+'.desc','Descrição')+IMG(p+'.image','Foto (será redimensionada para 440px)')+F(p+'.storyTitle','História do sabor: título')+F(p+'.story','História do sabor: texto',{type:'area'})+F(p+'.quote','Frase do sabor')})}],
['Depoimentos',function(){return LIST('testimonials','depoimento','testi',function(p){return '<div class="row">'+F(p+'.name','Nome')+F(p+'.city','Cidade')+'</div>'+F(p+'.text','Texto',{type:'area'})})}],
['Instagram',function(){return F('instagram.handle','Usuário (@...)')+F('instagram.url','Link do perfil')+LIST('instagram.posts','post','post',function(p){return IMG(p+'.image','Imagem')+'<div class="row">'+F(p+'.likes','Curtidas (texto, ex: 18,4 mil)')+F(p+'.bg','Cor de fundo')+'</div>'})}],
['Checkout e pagamento',function(){return F('checkout.freeShippingMin','Frete grátis acima de (R$)',{num:1,step:'0.01'})+F('checkout.shippingFee','Taxa de frete (R$)',{num:1,step:'0.01'})+LIST('checkout.payments','forma de pagamento','pay',function(p){return '<div class="row">'+F(p+'.label','Rótulo')+F(p+'.discount','Desconto (%)',{num:1,step:'0.5'})+'</div>'})}],
['História: home e Quem somos',function(){var s='';[['brand.storyNavLabel','Menu: Quem somos'],['brand.worldNavLabel','Menu: Kisses pelo mundo'],['brand.homeTitle','Home: título'],['brand.homeSub','Home: subtítulo'],['brand.homeButton','Home: botão'],['brand.storyPageTitle','Quem somos: título'],['brand.storyPageSub','Quem somos: subtítulo'],['brand.originTitle','Origem: título'],['brand.chaptersTitle','Capítulos: título'],['brand.chaptersIntro','Capítulos: introdução'],['brand.foundersTitle','Fundadoras: título'],['brand.promiseTitle','Promessa: título'],['brand.missionTitle','Missão: título'],['brand.leaderTitle','Liderança: título'],['brand.valuesTitle','Valores: título']].forEach(function(x){s+=F(x[0],x[1])});
  [['brand.homeText','Home: texto da história'],['brand.origin','Origem: texto'],['brand.promise','Promessa: texto'],['brand.mission','Missão'],['brand.vision','Visão'],['brand.leader','Liderança mundial: texto']].forEach(function(x){s+=F(x[0],x[1],{type:'area'})});
  s+='<h3 style="margin-top:18px">Capítulos</h3>'+LIST('brand.chapters','capítulo','chap',function(p){return '<div class="row">'+F(p+'.num','Número')+F(p+'.title','Título')+'</div>'+F(p+'.text','Texto',{type:'area'})});
  s+='<h3 style="margin-top:18px">Fundadoras</h3>'+LIST('brand.founders','fundadora','founder',function(p){return '<div class="row">'+F(p+'.name','Nome')+F(p+'.role','Papel')+'</div>'+F(p+'.text','Texto',{type:'area'})});
  s+='<h3 style="margin-top:18px">Valores</h3>'+LIST('brand.values','valor','val',function(p){return F(p+'.title','Título')+F(p+'.text','Texto',{type:'area'})});return s}],
['Kisses pelo mundo e blocos dos sabores',function(){var s='';[['brand.worldPageTitle','Título da página'],['brand.worldPageSub','Subtítulo'],['brand.timelineTitle','Linha do tempo: título'],['brand.timelineMarketsTitle','Mercados: título'],['brand.flavorBlockTitle','Bloco nos sabores: título']].forEach(function(x){s+=F(x[0],x[1])});
  [['brand.worldIntro','Introdução'],['brand.flavorBlockText','Bloco nos sabores: texto'],['brand.flavorWorldNote','Bloco nos sabores: nota mundial']].forEach(function(x){s+=F(x[0],x[1],{type:'area'})});
  s+='<h3 style="margin-top:18px">Estatísticas mundiais</h3>'+LIST('brand.worldStats','estatística','stat',function(p){return '<div class="row">'+F(p+'.value','Valor')+F(p+'.label','Rótulo')+'</div>'});
  s+='<h3 style="margin-top:18px">Linha do tempo</h3>'+LIST('brand.timeline','marco','tl',function(p){return '<div class="row">'+F(p+'.year','Ano')+F(p+'.title','Título')+'</div>'+F(p+'.text','Texto',{type:'area'})});
  s+='<h3 style="margin-top:18px">Mercados</h3>'+LIST('brand.markets','mercado','market',function(p){return '<div class="row">'+F(p+'.country','País')+F(p+'.flag','Bandeira (emoji)')+'</div>'+F(p+'.text','Texto',{type:'area'})});return s}],
['Conta do admin',function(){return '<p class="note">Altere a senha (e usuário). Fica salva só neste navegador; não é segurança real.</p><label class="f">Usuário<input id="nu" value="'+esc(creds().user)+'"></label><label class="f">Nova senha<input id="np" type="password" autocomplete="new-password"></label><button type="button" class="mini2" style="margin-top:10px" id="chpw">Alterar credenciais</button>'}]];
var openSet={};
function view(){var keep=window.scrollY;
  app.innerHTML='<div class="bar"><b>💋 Admin Kisses</b><a href="index.html" target="_blank" rel="noopener">Ver loja</a><button class="pr" id="bs">Salvar</button><button class="alt" id="bx">Exportar dados</button><button class="alt" id="bi">Importar dados</button><button class="alt" id="br">Restaurar padrão</button><button id="bo">Sair</button><input type="file" id="fi" accept="application/json" hidden></div><div class="adm"><p class="note">As alterações são salvas automaticamente neste navegador (localStorage). Painel client-side: não é segurança real.</p>'+
   SECT.map(function(s,i){return '<details data-s="'+i+'"'+(openSet[i]?' open':'')+'><summary>'+s[0]+'</summary><div>'+s[1]()+'</div></details>'}).join('')+'</div>';
  window.scrollTo(0,keep)}
function resize(file,cb){var fr=new FileReader();fr.onload=function(){var im=new Image();im.onload=function(){var S=440,c=document.createElement('canvas');c.width=c.height=S;var x=c.getContext('2d'),m=Math.min(im.width,im.height),sx=(im.width-m)/2,sy=(im.height-m)/2;x.fillStyle='#fff';x.fillRect(0,0,S,S);x.drawImage(im,sx,sy,m,m,0,0,S,S);cb(c.toDataURL('image/jpeg',.85))};im.onerror=function(){toast('Imagem inválida')};im.src=fr.result};fr.readAsDataURL(file)}
K.resize=resize;
function bind(){
  app.addEventListener('toggle',function(e){var s=e.target.getAttribute&&e.target.getAttribute('data-s');if(s!=null)openSet[s]=e.target.open},true);
  app.addEventListener('input',function(e){var t=e.target,p=t.getAttribute('data-p');if(!p)return;var v=t.value;if(t.getAttribute('data-num'))v=v===''?0:parseFloat(v);set(p,v);persist()});
  app.addEventListener('change',function(e){var t=e.target,p=t.getAttribute('data-img');if(p&&t.files[0]){resize(t.files[0],function(u){set(p,u);persist();view();toast('Imagem salva')})}
    if(t.id==='fi'&&t.files[0]){var fr=new FileReader();fr.onload=function(){try{var o=JSON.parse(fr.result);if(!o||typeof o!=='object'||!o.products||!o.site)throw 0;D=K.merge?K.merge(K.seed(),o):o;persist();view();toast('Dados importados')}catch(x){toast('Arquivo JSON inválido')}};fr.readAsText(t.files[0])}});
  app.addEventListener('click',function(e){var t=e.target,id=t.id;
    if(t.getAttribute('data-add')){var p=t.getAttribute('data-add');get(p).push(TPL[t.getAttribute('data-tpl')]());persist();view();return}
    if(t.getAttribute('data-del')){if(confirm('Remover este item?')){get(t.getAttribute('data-del')).splice(+t.getAttribute('data-i'),1);persist();view()}return}
    if(id==='bs'){persist();toast('Salvo!')}
    if(id==='bo'){sessionStorage.removeItem(K.AUTH);loginView()}
    if(id==='br'&&confirm('Restaurar todo o conteúdo padrão? Suas edições serão perdidas.')){K.reset();D=K.load();view();toast('Padrão restaurado')}
    if(id==='bx'){var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(D,null,2)],{type:'application/json'}));a.download='kisses-dados.json';document.body.appendChild(a);a.click();a.remove()}
    if(id==='bi')document.getElementById('fi').click();
    if(id==='chpw'){var u=document.getElementById('nu').value.trim(),pw=document.getElementById('np').value;if(!u||pw.length<4)return toast('Usuário e senha (mín. 4 caracteres)');localStorage.setItem(AK,JSON.stringify({user:u,hash:sha256(pw)}));document.getElementById('np').value='';toast('Credenciais alteradas')}});
}
var bound=false;
function start(){D=K.load();view();if(!bound){bind();bound=true}}
K.admin={start:start};
if(authed())start();else loginView();
})();
