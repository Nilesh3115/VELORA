/* Quick View slide-over drawer (any [data-pid] trigger). Uses CATALOG, sizeSpec, Commerce, FIN from commerce.js */
(function(){
  const root=document.documentElement;
  const scrim=document.createElement('div');scrim.className='qv-scrim';
  const dr=document.createElement('aside');dr.className='qv';dr.setAttribute('role','dialog');dr.setAttribute('aria-modal','true');dr.setAttribute('aria-hidden','true');dr.setAttribute('aria-labelledby','qvTitle');
  document.body.append(scrim,dr);
  let opener=null,state={};

  function dims(p,i){
    switch(p.category){
      case 'Earrings':return `Drop length ${18+i%5*4} mm · weight ${(3+i%6*.7).toFixed(1)} g per earring. Lightweight for all-day wear.`;
      case 'Necklaces':return `Chain 45 cm + 5 cm extender · pendant ${14+i%4*3} mm. Sits just below the collarbone.`;
      case 'Bracelets':return `Length 17 cm + 3 cm extender · width ${4+i%4} mm. Fits wrists up to 19 cm.`;
      case 'Rings':return `Band width ${2+i%4} mm · US sizes 5–9 · true to size. Size up for a looser, stacked fit.`;
      default:return `Inner diameter 60 mm · width ${6+i%4*2} mm · fits wrists up to 17 cm.`;
    }
  }
  const care=p=>`${p.metal}. Hand-finished and hallmarked. Wipe with a soft dry cloth, store in the pouch provided and keep away from perfume, water and chlorine.`+(p.metal==='Sterling Silver'?' Polish gently with a silver cloth to restore shine.':'');

  function open(p,idx,from){
    const gal=[p.imgs[0],p.imgs[1],POOL[(idx*2+3)%12],POOL[(idx*3+7)%12]].filter((v,k,arr)=>arr.indexOf(v)===k);
    const so=sizeSpec(p),t=statusTag(p),out=p.status==='soldout';
    state={p,finish:p.defFinish,size:null,so};opener=from;
    const addText=out?'Sold out':p.status==='preorder'?'Pre-order':'Add to Bag';
    const wished=Commerce.isWished(p.id);
    dr.innerHTML=`
      <button class="qv__close" id="qvClose" aria-label="Close quick view"><i data-lucide="x"></i></button>
      <div class="qv__gallery">
        <div class="qv__main"><img id="qvMain" src="${PX(gal[0],1200)}" alt="${p.name} — view 1"></div>
        <div class="qv__thumbs" role="group" aria-label="Product views">${gal.map((g,k)=>`<button type="button" class="${k?'':'is-active'}" data-k="${k}" aria-label="View ${k+1}"><img src="${PX(g,200)}" alt=""></button>`).join('')}</div>
      </div>
      <div class="qv__info">
        <div class="qv__top"><span class="qv__eyebrow">${t?t[0].replace('-',' '):p.category}</span>
          <button type="button" class="qv__wish" data-wish="${p.id}" aria-pressed="${wished}" aria-label="${wished?'Remove from wishlist':'Add to wishlist'}"><i data-lucide="heart"></i></button></div>
        <h2 class="qv__title" id="qvTitle">${p.name}</h2>
        <div class="qv__rating" aria-label="Rated ${p.rating} out of 5"><span class="stars" style="--p:${p.rating/5*100}%" aria-hidden="true">★★★★★</span><span>${p.rating} · ${p.reviews} reviews</span></div>
        <div class="qv__price">$${p.price}</div>
        <p class="qv__blurb">Cast by hand in small batches and finished to a warm mirror polish. Made to layer, stack and be worn every day.</p>
        <div class="qv__label">Finish <em id="qvFinish">${FIN_NAME[p.defFinish]}</em></div>
        <div class="qv__opts" id="qvFinishOpts" role="group" aria-label="Finish">${Object.entries(FIN).map(([f,col])=>`<button type="button" data-f="${f}" aria-pressed="${f===p.defFinish}"><span class="qv__sw" style="background:${col}"></span>${FIN_NAME[f]}</button>`).join('')}</div>
        ${so?`<div class="qv__label">${so.label}</div><div class="qv__opts" id="qvSizeOpts" role="group" aria-label="${so.label}">${so.vals.map(v=>`<button type="button" data-s="${v}" aria-pressed="false">${v}</button>`).join('')}</div>`:''}
        <div class="qv__specs">
          <details open><summary>Materials &amp; Care</summary><p>${care(p)}</p></details>
          <details><summary>Dimensions &amp; Fit</summary><p>${dims(p,idx)}</p></details>
          <details><summary>Shipping &amp; Returns</summary><p>Complimentary shipping on orders over $250, dispatched in 2–3 business days. Easy 30-day returns on unworn pieces. <a href="#">View full policy</a></p></details>
        </div>
        <div class="qv__cta"><div class="qv__err" id="qvErr" role="alert"></div><button type="button" class="qv__add" id="qvAdd" ${out?'disabled':''}>${addText}</button><p class="qv__note">Free worldwide shipping · 2-year warranty</p></div>
      </div>`;
    lucide.createIcons();wire(gal);
    dr.classList.add('is-open');scrim.classList.add('is-on');dr.setAttribute('aria-hidden','false');root.classList.add('no-scroll');
    setTimeout(()=>document.getElementById('qvClose').focus({preventScroll:true}),120);
  }
  function wire(gal){
    const main=document.getElementById('qvMain');
    dr.querySelector('.qv__thumbs').addEventListener('click',e=>{
      const t=e.target.closest('button');if(!t)return;
      dr.querySelectorAll('.qv__thumbs button').forEach(x=>x.classList.toggle('is-active',x===t));
      const k=+t.dataset.k;main.style.opacity=0;const show=()=>{main.style.opacity=1};
      setTimeout(()=>{main.onload=show;main.onerror=show;main.src=PX(gal[k],1200);main.alt=`${state.p.name} — view ${k+1}`;setTimeout(show,700)},200);
    });
    const pick=(box,attr,cb)=>box&&box.addEventListener('click',e=>{
      const t=e.target.closest('button');if(!t)return;
      box.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===t));cb(t.dataset[attr]);
    });
    pick(document.getElementById('qvFinishOpts'),'f',v=>{state.finish=v;document.getElementById('qvFinish').textContent=FIN_NAME[v]});
    pick(document.getElementById('qvSizeOpts'),'s',v=>{state.size=v;document.getElementById('qvErr').textContent=''});
    const add=document.getElementById('qvAdd'),err=document.getElementById('qvErr');
    add.addEventListener('click',()=>{
      if(state.p.status==='soldout')return;
      if(state.so&&!state.size){err.textContent=`Please select a ${state.so.label.toLowerCase()}.`;return}
      Commerce.add(state.p,{finish:state.finish,size:state.size||''});
      const t=add.textContent;add.textContent='Added to bag ✓';add.classList.add('is-added');
      setTimeout(()=>{add.textContent=t;add.classList.remove('is-added')},1800);
      Commerce.open('bag');
    });
    document.getElementById('qvClose').onclick=close;
  }
  function close(){
    if(!dr.classList.contains('is-open'))return;
    dr.classList.remove('is-open');scrim.classList.remove('is-on');dr.setAttribute('aria-hidden','true');
    if(!document.querySelector('.mc.is-open,.drawer.is-open,.fpanel.is-open'))root.classList.remove('no-scroll');
    if(opener)opener.focus({preventScroll:true});
  }
  scrim.addEventListener('click',close);
  document.addEventListener('click',e=>{
    const t=e.target.closest('[data-pid]');if(!t)return;
    e.preventDefault();e.stopPropagation();
    const idx=CATALOG.findIndex(x=>x.id===t.dataset.pid);if(idx<0)return;
    open(CATALOG[idx],idx,t);
  });
  document.addEventListener('keydown',e=>{
    if(!dr.classList.contains('is-open'))return;
    if(e.key==='Escape'){e.stopPropagation();close()}
    if(e.key==='Tab'){
      const f=[...dr.querySelectorAll('button,a[href],summary')].filter(x=>x.offsetParent!==null&&!x.disabled);
      if(!f.length)return;const first=f[0],last=f[f.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }
  },true);
})();
