/* Shared commerce UI: product card renderer, wishlist, slide-over mini-cart */
const FIN={'Gold':'#D4AF37','Rose Gold':'#D9A58F','Silver':'#C9CCD1'};
const FIN_NAME={'Gold':'18k Gold','Rose Gold':'Rose Gold','Silver':'Sterling Silver'};
const FREE_SHIP=250;
function sizeSpec(p){
  if(p.category==='Rings')return{label:'Ring size',vals:['5','6','7','8','9'],def:'7'};
  if(p.category==='Necklaces')return{label:'Length',vals:['40 cm','45 cm','50 cm'],def:'45 cm'};
  if(p.category==='Bracelets'||p.category==='Bangles')return{label:'Size',vals:['S','M','L'],def:'M'};
  return null;
}
function statusTag(p){
  if(p.status==='soldout')return['SOLD OUT','tag--out'];
  if(p.status==='preorder')return['PRE-ORDER','tag--pre'];
  if(p.isNew)return['NEW',''];
  if(p.isBest)return['BEST SELLER','tag--best'];
  return null;
}
function eyebrowFor(p){
  if(p.status==='soldout')return 'Sold out';
  if(p.status==='preorder')return 'Pre-order';
  if(p.isNew)return 'New';
  if(p.isBest)return 'Best seller';
  return p.metal;
}
function renderCard(p,i=0){
  const wished=Commerce.isWished(p.id),out=p.status==='soldout';
  const addLabel=out?'Sold out':p.status==='preorder'?'Pre-order':'Add to Bag';
  return `<article class="pcard${out?' pcard--out':''}" data-id="${p.id}" style="--i:${Math.min(i,12)}">
    <div class="pcard__img">
      <img src="${PX(p.imgs[0],800)}" alt="${p.name}" loading="lazy" draggable="false"><img src="${PX(p.imgs[1],800)}" alt="" loading="lazy" draggable="false">
      <div class="pcard__tools">
        <button type="button" class="pcard__tool pcard__tool--eye" data-pid="${p.id}" aria-label="Quick view ${p.name}" title="Quick view"><i data-lucide="eye"></i></button>
        <button type="button" class="pcard__tool pcard__tool--heart" data-wish="${p.id}" aria-pressed="${wished}" aria-label="${wished?'Remove from wishlist':'Add to wishlist'}" title="Wishlist"><i data-lucide="heart"></i></button>
      </div>
      <div class="pcard__bar"><button type="button" class="pcard__addbar" data-add="${p.id}" ${out?'disabled':''} aria-label="${addLabel} ${p.name}">${out?'':'<i data-lucide="shopping-bag"></i>'}${addLabel}</button></div>
    </div>
    <div class="pcard__meta">
      <span class="pcard__eyebrow">${eyebrowFor(p)}</span>
      <h3>${p.name}</h3>
      <p class="price"><span class="price__now">$${p.price}</span><s class="price__was" aria-label="Original price $${p.was}">$${p.was}</s></p>
    </div></article>`;
}

const Commerce=(()=>{
  const KEY='velora_state_v1',root=document.documentElement,$=id=>document.getElementById(id);
  let st={cart:[],wish:[]};
  try{const s=JSON.parse(localStorage.getItem(KEY)||'null');
    if(s&&Array.isArray(s.cart)&&Array.isArray(s.wish))st={cart:s.cart.filter(c=>CATALOG.some(p=>p.id===c.id)),wish:s.wish.filter(id=>CATALOG.some(p=>p.id===id))}}catch(e){}
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}};
  const prod=id=>CATALOG.find(p=>p.id===id);
  const count=()=>st.cart.reduce((a,c)=>a+c.qty,0);
  const subtotal=()=>st.cart.reduce((a,c)=>a+prod(c.id).price*c.qty,0);

  const scrim=document.createElement('div');scrim.className='mc-scrim';
  const mc=document.createElement('aside');mc.className='mc';mc.id='miniCart';mc.setAttribute('role','dialog');mc.setAttribute('aria-modal','true');mc.setAttribute('aria-hidden','true');mc.setAttribute('aria-label','Shopping bag and wishlist');
  mc.innerHTML=`
    <div class="mc__head">
      <div class="mc__tabs" role="tablist">
        <button type="button" role="tab" data-tab="bag" aria-selected="true">Bag <span id="mcBagN">0</span></button>
        <button type="button" role="tab" data-tab="wish" aria-selected="false">Wishlist <span id="mcWishN">0</span></button>
      </div>
      <button type="button" class="mc__close" id="mcClose" aria-label="Close"><i data-lucide="x"></i></button>
    </div>
    <section class="mc__pane" id="mcBag">
      <div class="mc__ship"><p id="mcShipTxt"></p><div class="mc__bar"><span id="mcBarFill"></span></div></div>
      <ul class="mc__list" id="mcList"></ul>
      <div class="mc__foot" id="mcFoot">
        <label class="mc__gift"><span>Add a gift note (optional)</span><textarea id="mcNote" rows="2" maxlength="140" placeholder="Write a short message for the recipient"></textarea></label>
        <div class="mc__sub"><span>Subtotal</span><strong id="mcSub">$0</strong></div>
        <p class="mc__tax">Shipping and taxes calculated at checkout.</p>
        <button type="button" class="mc__checkout" id="mcCheckout">Proceed to Checkout</button>
      </div>
    </section>
    <section class="mc__pane" id="mcWish" hidden><ul class="mc__list" id="mcWishList"></ul></section>`;
  document.body.append(scrim,mc);

  const variant=c=>{const p=prod(c.id);return FIN_NAME[c.finish]+(c.size?' · '+c.size:'')+(p.status==='preorder'?' · Pre-order':'')};
  function render(){
    const n=count(),sub=subtotal(),w=st.wish.length,rem=FREE_SHIP-sub;
    const bc=$('bagCount'),wc=$('wishCount');if(bc)bc.textContent=n;if(wc)wc.textContent=w;
    $('mcBagN').textContent=n;$('mcWishN').textContent=w;
    $('mcShipTxt').innerHTML=rem>0?`Add <strong>$${rem}</strong> more to unlock complimentary shipping`:`You've unlocked <strong>complimentary shipping</strong>`;
    $('mcBarFill').style.transform=`scaleX(${Math.min(1,sub/FREE_SHIP).toFixed(3)})`;
    $('mcSub').textContent='$'+sub;$('mcFoot').hidden=!n;
    $('mcList').innerHTML=n?st.cart.map(c=>{const p=prod(c.id);return `<li class="mc__item"><img src="${PX(p.imgs[0],200)}" alt="">
      <div><h4>${p.name}</h4><p class="mc__var">${variant(c)}</p>
      <div class="mc__row"><div class="mc__qty"><button type="button" data-qty="-1" data-key="${c.key}" aria-label="Decrease quantity">−</button><span aria-live="polite">${c.qty}</span><button type="button" data-qty="1" data-key="${c.key}" aria-label="Increase quantity">+</button></div><span class="mc__price">$${p.price*c.qty}</span></div></div>
      <button type="button" class="mc__rm" data-rm="${c.key}" aria-label="Remove ${p.name}"><i data-lucide="trash-2"></i></button></li>`}).join('')
      :'<li class="mc__empty"><p>Your bag is empty.</p><a href="collection.html">Continue shopping</a></li>';
    $('mcWishList').innerHTML=w?st.wish.map(id=>{const p=prod(id),out=p.status==='soldout';return `<li class="mc__item"><img src="${PX(p.imgs[0],200)}" alt="">
      <div><h4>${p.name}</h4><p class="mc__var">${out?'Sold out':'$'+p.price}</p>
      <div class="mc__row"><button type="button" class="mc__small" data-wadd="${id}" ${out?'disabled':''}>${out?'Sold out':'Add to bag'}</button></div></div>
      <button type="button" class="mc__rm" data-wrm="${id}" aria-label="Remove ${p.name} from wishlist"><i data-lucide="x"></i></button></li>`}).join('')
      :'<li class="mc__empty"><p>Your wishlist is empty. Tap the heart on any piece to save it.</p><a href="collection.html">Browse the collection</a></li>';
    if(window.lucide)lucide.createIcons();
  }
  function syncWishButtons(){
    document.querySelectorAll('[data-wish]').forEach(b=>{const on=st.wish.includes(b.dataset.wish);b.setAttribute('aria-pressed',on);b.setAttribute('aria-label',on?'Remove from wishlist':'Add to wishlist')});
  }
  function setTab(t){
    mc.querySelectorAll('[role=tab]').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===t));
    $('mcBag').hidden=t!=='bag';$('mcWish').hidden=t!=='wish';
  }
  function add(p,{finish,size}){
    const key=[p.id,finish,size].join('|'),ex=st.cart.find(c=>c.key===key);
    ex?ex.qty++:st.cart.push({key,id:p.id,finish,size,qty:1});
    save();render();
    const b=document.querySelector('.bag');if(b){b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump')}
  }
  function toggleWish(id){
    const i=st.wish.indexOf(id),on=i<0;on?st.wish.push(id):st.wish.splice(i,1);
    save();render();syncWishButtons();
    toast(on?`${prod(id).name} saved to your wishlist`:`${prod(id).name} removed from your wishlist`);
  }
  function open(tab){
    setTab(tab||'bag');render();
    mc.classList.add('is-open');scrim.classList.add('is-on');mc.setAttribute('aria-hidden','false');root.classList.add('no-scroll');
    setTimeout(()=>$('mcClose').focus({preventScroll:true}),80);
  }
  function close(){
    if(!mc.classList.contains('is-open'))return;
    mc.classList.remove('is-open');scrim.classList.remove('is-on');mc.setAttribute('aria-hidden','true');
    if(!document.querySelector('.qv.is-open,.drawer.is-open,.fpanel.is-open'))root.classList.remove('no-scroll');
  }

  mc.addEventListener('click',e=>{
    const t=e.target.closest('[role=tab]');if(t)return setTab(t.dataset.tab);
    const q=e.target.closest('[data-qty]');
    if(q){const c=st.cart.find(x=>x.key===q.dataset.key);if(c){c.qty+=+q.dataset.qty;if(c.qty<1)st.cart=st.cart.filter(x=>x!==c);save();render()}return}
    const rm=e.target.closest('[data-rm]');if(rm){st.cart=st.cart.filter(x=>x.key!==rm.dataset.rm);save();render();return}
    const wa=e.target.closest('[data-wadd]');
    if(wa){const p=prod(wa.dataset.wadd),sp=sizeSpec(p);add(p,{finish:p.defFinish,size:sp?sp.def:''});setTab('bag');return}
    const wr=e.target.closest('[data-wrm]');if(wr){toggleWish(wr.dataset.wrm);return}
    if(e.target.closest('#mcCheckout'))toast('This demo storefront is not connected to a payment checkout.');
  });
  $('mcClose').onclick=close;scrim.onclick=close;
  document.addEventListener('keydown',e=>{
    if(!mc.classList.contains('is-open'))return;
    if(e.key==='Escape'){e.stopImmediatePropagation();close()}
    if(e.key==='Tab'){
      const f=[...mc.querySelectorAll('button,a[href],textarea')].filter(x=>x.offsetParent!==null&&!x.disabled);if(!f.length)return;
      const a=f[0],z=f[f.length-1];
      if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}
    }
  },true);

  /* delegated handlers for every product card / header trigger on any page */
  document.addEventListener('click',e=>{
    const sw=e.target.closest('.sw');
    if(sw){sw.parentElement.querySelectorAll('.sw').forEach(x=>x.setAttribute('aria-pressed',x===sw));return}
    const w=e.target.closest('[data-wish]');if(w){e.preventDefault();toggleWish(w.dataset.wish);return}
    const a=e.target.closest('[data-add]');
    if(a){
      const p=prod(a.dataset.add);if(!p||p.status==='soldout')return;
      const card=a.closest('.pcard'),on=card&&card.querySelector('.sw[aria-pressed="true"]'),sp=sizeSpec(p);
      add(p,{finish:on?on.dataset.finish:p.defFinish,size:sp?sp.def:''});open('bag');return;
    }
    if(e.target.closest('.bag')){e.preventDefault();open('bag');return}
    if(e.target.closest('#wishBtn')){e.preventDefault();open('wish')}
  });
  render();
  return{add,open,close,toggleWish,isWished:id=>st.wish.includes(id)};
})();
