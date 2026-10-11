/* Kisses - shared logic. Client-side only (no backend). */
(function(){
var KEY='kisses_data_v1',CART='kisses_cart_v1',AUTH='kisses_auth_v1';
var K=window.Kisses={KEY:KEY,CART:CART,AUTH:AUTH};
function clone(o){return JSON.parse(JSON.stringify(o))}
function isObj(x){return x&&typeof x==='object'&&!Array.isArray(x)}
function merge(base,over){ // objects merged key by key; arrays/primitives from override
  if(!isObj(base)||!isObj(over))return over===undefined?base:over;
  var r={};Object.keys(base).forEach(function(k){r[k]=base[k]});
  Object.keys(over).forEach(function(k){r[k]=k in base?merge(base[k],over[k]):over[k]});return r}
K.merge=merge;K.seed=function(){return clone(window.KISSES_SEED)};
K.load=function(){var s=K.seed();try{var raw=localStorage.getItem(KEY);if(raw){var o=JSON.parse(raw);if(isObj(o))return merge(s,o)}}catch(e){}return s};
K.save=function(d){localStorage.setItem(KEY,JSON.stringify(d))};
K.reset=function(){localStorage.removeItem(KEY)};
K.esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var esc=K.esc;
K.brl=function(n){n=Number(n)||0;var neg=n<0;n=Math.abs(n);var p=n.toFixed(2).split('.');p[0]=p[0].replace(/\B(?=(\d{3})+(?!\d))/g,'.');return (neg?'-':'')+'R$ '+p[0]+','+p[1]};
K.num=function(n){return Number(n).toLocaleString('pt-BR')};
K.stars=function(r){var f=Math.max(0,Math.min(5,Math.round(Number(r)||0)));return '★★★★★'.slice(0,f)+'☆☆☆☆☆'.slice(0,5-f)};
K.rating=function(r){return String(Number(r)||0).replace('.',',')};
function url(i){return "url('"+String(i||'').replace(/['"()\\\s]/g,function(c){return encodeURIComponent(c)})+"')"}
K.ph=function(img){return '<i class="ph" style="background-image:'+url(img)+'"></i>'};
/* cart */
K.cart=function(){try{var c=JSON.parse(localStorage.getItem(CART));return Array.isArray(c)?c:[]}catch(e){return[]}};
K.saveCart=function(c){localStorage.setItem(CART,JSON.stringify(c));K.updateCart&&K.updateCart()};
K.add=function(id,q){var c=K.cart(),it=c.filter(function(x){return x.id===id})[0];if(it)it.qty+=q||1;else c.push({id:id,qty:q||1});K.saveCart(c)};
K.setQty=function(id,q){var c=K.cart();c.forEach(function(x){if(x.id===id)x.qty=q});K.saveCart(c.filter(function(x){return x.qty>0}))};
K.remove=function(id){K.saveCart(K.cart().filter(function(x){return x.id!==id}))};
K.lines=function(d){var out=[];K.cart().forEach(function(c){var p=d.products.filter(function(p){return p.id===c.id})[0];if(p)out.push({p:p,qty:c.qty,total:p.price*c.qty})});return out};
K.totals=function(d,payId){var l=K.lines(d),sub=l.reduce(function(a,x){return a+x.total},0),co=d.checkout;
  var ship=(sub===0||sub>=co.freeShippingMin)?0:co.shippingFee;
  var pay=co.payments.filter(function(p){return p.id===payId})[0],disc=pay?sub*(pay.discount||0)/100:0;
  return {sub:sub,ship:ship,disc:disc,total:Math.round((sub+ship-disc)*100)/100}};
/* layout */
function layout(d,page){
  var s=d.site,b=d.brand;
  document.title=(page==='home'?s.pageTitle:s.brand+' – '+(document.body.getAttribute('data-title')||s.tagline));
  var nav=[['index.html#sabores','Sabores'],['quem-somos.html',b.storyNavLabel],['mundo.html',b.worldNavLabel],['index.html#depoimentos','Depoimentos'],['index.html#insta','Instagram'],['checkout.html','Comprar']];
  var h='<div class="top">'+esc(s.banner)+'</div><header class="hd"><a href="index.html"><img src="'+esc(s.logo)+'" alt="'+esc(s.brand)+'"></a><nav>'+nav.map(function(n){return '<a href="'+n[0]+'">'+esc(n[1])+'</a>'}).join('')+'</nav><button class="cartbtn" id="cartbtn" aria-label="Abrir carrinho">🛒 Carrinho <b id="cc">0</b></button></header>';
  document.getElementById('top').innerHTML=h;
  document.getElementById('foot').innerHTML='<footer><p>'+esc(s.footer)+' · Instagram <a href="'+esc(d.instagram.url)+'">'+esc(d.instagram.handle)+'</a> · <a href="admin.html">Admin</a></p><small>'+esc(s.disclaimer)+'</small></footer>'+
   '<div id="ov"></div><aside id="drawer"><div class="dh"><b>Seu carrinho</b><button id="cx" aria-label="Fechar">×</button></div><div id="ci"></div><div id="df"></div></aside>';
  var dr=document.getElementById('drawer'),ov=document.getElementById('ov');
  function open(o){dr.classList.toggle('on',o);ov.classList.toggle('on',o)}
  K.openCart=function(){open(true)};
  document.getElementById('cartbtn').onclick=function(){open(true)};document.getElementById('cx').onclick=ov.onclick=function(){open(false)};
  K.updateCart=function(){
    var l=K.lines(d),n=l.reduce(function(a,x){return a+x.qty},0);document.getElementById('cc').textContent=n;
    var ci=document.getElementById('ci'),df=document.getElementById('df');
    if(!l.length){ci.innerHTML='<div class="empty">Seu carrinho está vazio 💋</div>';df.innerHTML='';return}
    ci.innerHTML=l.map(function(x){return '<div class="ci">'+K.ph(x.p.image)+'<div class="nm">'+esc(x.p.name)+'<small>'+K.brl(x.p.price)+'</small></div><div class="qty"><button data-a="dec" data-id="'+esc(x.p.id)+'">−</button><span>'+x.qty+'</span><button data-a="inc" data-id="'+esc(x.p.id)+'">+</button></div><button class="rm" data-a="rm" data-id="'+esc(x.p.id)+'">remover</button></div>'}).join('');
    var t=K.totals(d,'');
    df.innerHTML='<div class="tot sm"><span>Subtotal</span><span>'+K.brl(t.sub)+'</span></div><div class="tot sm"><span>Frete</span><span>'+(t.ship?K.brl(t.ship):'Grátis')+'</span></div><div class="tot"><span>Total</span><span>'+K.brl(t.total)+'</span></div><a class="btn" href="checkout.html">Finalizar compra</a>';
  };
  document.getElementById('ci').onclick=function(e){var a=e.target.getAttribute&&e.target.getAttribute('data-a');if(!a)return;var id=e.target.getAttribute('data-id'),it=K.cart().filter(function(x){return x.id===id})[0];
    if(a==='rm')K.remove(id);else if(a==='inc')K.setQty(id,it.qty+1);else if(a==='dec')K.setQty(id,it.qty-1)};
  K.updateCart();
  document.addEventListener('click',function(e){var t=e.target;if(t.getAttribute&&t.getAttribute('data-add')){K.add(t.getAttribute('data-add'),1);K.openCart()}});
  window.addEventListener('storage',function(){K.updateCart()});
}
function prodCard(p){return '<div class="card">'+(p.badge?'<span class="badge">'+esc(p.badge)+'</span>':'')+'<div class="img" style="background:'+esc(p.bg||'#fff')+'">'+K.ph(p.image)+'</div><h3><a href="produto.html?id='+encodeURIComponent(p.id)+'">'+esc(p.name)+'</a></h3><small>'+esc(p.desc)+'</small><div class="st">'+K.stars(p.rating)+' <em>'+K.rating(p.rating)+' ('+K.num(p.reviews)+' avaliações)</em></div><p>'+K.brl(p.price)+'</p><button class="mini" data-add="'+esc(p.id)+'">Adicionar</button> <a class="mini alt" href="produto.html?id='+encodeURIComponent(p.id)+'">Ver</a></div>'}
function para(t){return String(t==null?'':t).split(/\n+/).map(function(x){return '<p>'+esc(x)+'</p>'}).join('')}
function chapters(b){return '<section><h2>'+esc(b.chaptersTitle)+'</h2><p class="sub">'+esc(b.chaptersIntro)+'</p><div class="chapters">'+b.chapters.map(function(c){return '<div class="chap"><small>'+esc(c.num)+'</small><h3>'+esc(c.title)+'</h3><p>'+esc(c.text)+'</p></div>'}).join('')+'</div></section>'}
function timeline(b){return '<div class="tl">'+b.timeline.map(function(t){return '<div class="tli"><b>'+esc(t.year)+'</b><div><h3>'+esc(t.title)+'</h3><p>'+esc(t.text)+'</p></div></div>'}).join('')+'</div>'}
function flavorBlock(b,p){return '<div class="fb"><h3>'+esc(b.flavorBlockTitle)+'</h3><p>'+esc(b.flavorBlockText)+'</p>'+(p?'<h3 style="margin-top:14px">'+esc(p.storyTitle)+'</h3><p>'+esc(p.story)+'</p><q>“'+esc(p.quote)+'”</q><p><small>— '+esc(p.name)+'</small></p>':'')+'<p><em>'+esc(b.flavorWorldNote)+'</em></p></div>'}
var R={};
R.home=function(d){var s=d.site,b=d.brand;
  return '<div class="hero"><h1>'+esc(s.heroTitle)+' <span>'+esc(s.heroHighlight)+'</span></h1><p>'+esc(s.heroSub)+'</p><a class="btn" href="#sabores">'+esc(s.heroButton)+'</a><div class="rate">'+esc(s.heroRating)+'</div></div>'+
  '<div class="nums">'+s.stats.map(function(x){return '<div><b>'+esc(x.value)+'</b>'+esc(x.label)+'</div>'}).join('')+'</div>'+
  '<section class="story" id="historia"><h2>'+esc(b.homeTitle)+'</h2><p class="sub">'+esc(b.homeSub)+'</p><p class="lead">'+esc(b.homeText)+'</p><a class="btn" href="quem-somos.html">'+esc(b.homeButton)+'</a></section>'+
  '<section id="sabores"><h2>'+esc(s.productsTitle)+'</h2><p class="sub">'+esc(s.productsSub)+'</p><div class="grid">'+d.products.map(prodCard).join('')+'</div></section>'+
  '<section class="dep" id="depoimentos"><h2>'+esc(s.testimonialsTitle)+'</h2><p class="sub">'+esc(s.testimonialsSub)+'</p><div class="deps">'+d.testimonials.map(function(t){return '<blockquote><div class="st">★★★★★</div>“'+esc(t.text)+'”<cite>'+esc(t.name)+'<span>'+esc(t.city)+' · Compra verificada ✔</span></cite></blockquote>'}).join('')+'</div></section>'+
  '<section id="insta"><h2>'+esc(d.instagram.handle)+'</h2><p class="sub">'+esc(s.instaSub)+'</p><div class="insta">'+d.instagram.posts.map(function(p){return '<div class="post" style="background:'+esc(p.bg||'#fff1ec')+'">'+K.ph(p.image)+'<span>♥ '+esc(p.likes)+'</span></div>'}).join('')+'</div></section>'};
R.quem=function(d){var b=d.brand;
  return '<div class="hero"><h1>'+esc(b.storyPageTitle)+'</h1><p>'+esc(b.storyPageSub)+'</p></div>'+
  '<section><h2>'+esc(b.originTitle)+'</h2><p class="sub"> </p><div class="para">'+para(b.origin)+'</div></section>'+chapters(b)+
  '<section class="dep"><h2>'+esc(b.foundersTitle)+'</h2><p class="sub"> </p><div class="two">'+b.founders.map(function(f){return '<div class="tile"><h3>'+esc(f.name)+'</h3><small>'+esc(f.role)+'</small><p style="margin-top:8px">'+esc(f.text)+'</p></div>'}).join('')+'</div></section>'+
  '<section class="story"><h2>'+esc(b.promiseTitle)+'</h2><p class="sub"> </p><div class="para">'+para(b.promise)+'</div></section>'+
  '<section><div class="two"><div class="tile"><h3>'+esc(b.missionTitle)+'</h3>'+esc(b.mission)+'<p style="margin-top:10px"><b>Visão:</b> '+esc(b.vision)+'</p></div><div class="tile"><h3>'+esc(b.leaderTitle)+'</h3>'+esc(b.leader)+'</div></div></section>'+
  '<section class="dep"><h2>'+esc(b.valuesTitle)+'</h2><p class="sub"> </p><div class="two">'+b.values.map(function(v){return '<div class="tile"><h3>'+esc(v.title)+'</h3>'+esc(v.text)+'</div>'}).join('')+'</div></section>'};
R.mundo=function(d){var b=d.brand;
  return '<div class="hero"><h1>'+esc(b.worldPageTitle)+'</h1><p>'+esc(b.worldPageSub)+'</p></div><div class="nums">'+b.worldStats.map(function(x){return '<div><b>'+esc(x.value)+'</b>'+esc(x.label)+'</div>'}).join('')+'</div>'+
  '<section><p class="para">'+esc(b.worldIntro)+'</p></section><section class="dep"><h2>'+esc(b.timelineTitle)+'</h2><p class="sub"> </p>'+timeline(b)+'</section>'+
  '<section><h2>'+esc(b.timelineMarketsTitle)+'</h2><p class="sub"> </p><div class="two">'+b.markets.map(function(m){return '<div class="tile"><div class="big">'+esc(m.flag)+'</div><h3>'+esc(m.country)+'</h3>'+esc(m.text)+'</div>'}).join('')+'</div></section>'};
R.produto=function(d){var id=new URLSearchParams(location.search).get('id'),p=d.products.filter(function(x){return x.id===id})[0]||d.products[0],b=d.brand;
  if(!p)return '<section><h2>Produto não encontrado</h2></section>';
  document.title=d.site.brand+' – '+p.name;
  return '<section><div class="pd"><div class="img" style="background:'+esc(p.bg||'#fff')+'">'+K.ph(p.image)+'</div><div>'+(p.badge?'<span class="badge" style="position:static;display:inline-block">'+esc(p.badge)+'</span>':'')+'<h1>'+esc(p.name)+'</h1><p>'+esc(p.desc)+'</p><div class="st">'+K.stars(p.rating)+' <em>'+K.rating(p.rating)+' ('+K.num(p.reviews)+' avaliações)</em></div><p style="font-size:28px;font-weight:700;color:#f2806b;margin:10px 0">'+K.brl(p.price)+'</p><button class="btn" data-add="'+esc(p.id)+'">Adicionar ao carrinho</button></div></div>'+flavorBlock(b,p)+'<p><a href="index.html#sabores" class="mini">← Todos os sabores</a> <a href="quem-somos.html" class="mini alt">Nossa história</a></p></section>'};
R.checkout=function(d){var co=d.checkout;
  return '<section class="buy"><h2>'+esc(d.site.checkoutTitle)+'</h2><p class="sub" style="color:#5a3a30">'+esc(d.site.checkoutSub)+'</p><div id="cko"></div></section>'};
K.initCheckout=function(d){
  var el=document.getElementById('cko'),co=d.checkout;
  function draw(){
    if(!K.lines(d).length){el.innerHTML='<div class="box"><p class="empty">Seu carrinho está vazio.</p><a class="btn" href="index.html#sabores" style="display:block;text-align:center">Ver sabores</a></div>';return}
    var lines=K.lines(d);
    el.innerHTML='<form class="box" id="f" novalidate><b>Seu pedido</b>'+lines.map(function(x){return '<div class="tot sm"><span>'+x.qty+'× '+esc(x.p.name)+'</span><span>'+K.brl(x.total)+'</span></div>'}).join('')+
    '<label>Nome completo<input name="nome" placeholder="Seu nome"></label><label>E-mail<input name="email" type="email" placeholder="voce@email.com"></label><label>CEP<input name="cep" placeholder="00000-000" maxlength="9"></label><label>Endereço<input name="end" placeholder="Rua, número, cidade"></label>'+
    '<label>Pagamento<select name="pay">'+co.payments.map(function(p){return '<option value="'+esc(p.id)+'">'+esc(p.label)+'</option>'}).join('')+'</select></label><div id="tt"></div><div class="err" id="er"></div><button class="btn" type="submit">Finalizar compra</button></form>';
    var f=document.getElementById('f');
    function tt(){var t=K.totals(d,f.elements.pay.value);document.getElementById('tt').innerHTML='<div class="tot sm"><span>Subtotal</span><span>'+K.brl(t.sub)+'</span></div><div class="tot sm"><span>Frete</span><span>'+(t.ship?K.brl(t.ship):'Grátis')+'</span></div>'+(t.disc?'<div class="tot sm"><span>Desconto</span><span>-'+K.brl(t.disc)+'</span></div>':'')+'<div class="tot"><span>Total</span><span>'+K.brl(t.total)+'</span></div>'}
    tt();f.elements.pay.onchange=tt;
    f.elements.cep.oninput=function(){var v=f.elements.cep.value.replace(/\D/g,'').slice(0,8);f.elements.cep.value=v.length>5?v.slice(0,5)+'-'+v.slice(5):v};
    f.onsubmit=function(e){e.preventDefault();var er=document.getElementById('er');
      if(f.elements.nome.value.trim().length<3)return er.textContent='Informe seu nome completo.';
      if(!/^\S+@\S+\.\S+$/.test(f.elements.email.value.trim()))return er.textContent='Informe um e-mail válido.';
      if(!/^\d{5}-?\d{3}$/.test(f.elements.cep.value.trim()))return er.textContent='Informe um CEP válido (00000-000).';
      if(f.elements.end.value.trim().length<5)return er.textContent='Informe o endereço.';
      var t=K.totals(d,f.elements.pay.value),n='KS-'+(10000+Math.floor(Math.random()*90000)),name=f.elements.nome.value.trim();
      K.saveCart([]);
      el.innerHTML='<div class="conf"><h2>Pedido #'+n+' confirmado! 💋</h2><p>Obrigada, '+esc(name)+'! Total: <b>'+K.brl(t.total)+'</b>.</p><p style="margin:12px 0">Seu beijo, seu brilho. (Simulação: nenhum pagamento foi realizado.)</p><a class="btn" href="index.html">Voltar à loja</a></div>';
      try{window.scrollTo(0,0)}catch(e){}};
  }
  draw();var u=K.updateCart;K.updateCart=function(){u();if(!document.getElementById('f')||true){if(!/confirmado/.test(el.innerHTML))draw()}};
};
K.render=function(){var page=document.body.getAttribute('data-page'),d=K.load();K.data=d;
  layout(d,page);document.getElementById('main').innerHTML=R[page](d);
  if(page==='checkout')K.initCheckout(d)};
K.R=R;
if(typeof document!=='undefined'&&document.body&&document.body.getAttribute('data-page'))K.render();
})();
