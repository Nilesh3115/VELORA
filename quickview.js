/* Quick View slide-over drawer (uses BEST / NEWP / PX from carousel.js, addToBag from main.js) */
(function(){
  const POOL=[1191531,1458867,248077,265906,1454171,1721943,2735970,3266700,2697786,3641059,994234,1413420];
  const FINISH={'Gold':'#D4AF37','Rose Gold':'#D9A58F','Silver':'#C9CCD1'};
  const root=document.documentElement;
  const scrim=document.createElement('div');scrim.className='qv-scrim';
  const dr=document.createElement('aside');dr.className='qv';dr.setAttribute('role','dialog');dr.setAttribute('aria-modal','true');dr.setAttribute('aria-hidden','true');dr.setAttribute('aria-labelledby','qvTitle');
  document.body.append(scrim,dr);
  let opener=null,state={};

  function sizeOpts(n){
    if(/ring/i.test(n))return{label:'Ring size',vals:['5','6','7','8','9']};
    if(/necklace|pendant/i.test(n))return{label:'Length',vals:['40 cm','45 cm','50 cm']};
    if(/bracelet|cuff|bangle/i.test(n))return{label:'Size',vals:['S','M','L']};
    return null;
  }
  function open(set,i,from){
    const list=set==='new'?NEWP:BEST,[n,price,a,b]=list[i];
    const gal=[a,b,POOL[(i*2+3)%POOL.length],POOL[(i*3+7)%POOL.length]].filter((v,k,arr)=>arr.indexOf(v)===k);
    const rating=(4.6+((i*7)%5)/10).toFixed(1),reviews=(set==='new'?36:96)+i*23;
    const so=sizeOpts(n);
    state={n,finish:'Gold',size:null,so};
    opener=from;
    dr.innerHTML=`
      <button class="qv__close" id="qvClose" aria-label="Close quick view"><i data-lucide="x"></i></button>
      <div class="qv__gallery">
        <div class="qv__main"><img id="qvMain" src="${PX(gal[0],1200)}" alt="${n} — view 1"></div>
        <div class="qv__thumbs" role="group" aria-label="Product views">${gal.map((g,k)=>`<button type="button" class="${k?'':'is-active'}" data-k="${k}" aria-label="View ${k+1}"><img src="${PX(g,200)}" alt=""></button>`).join('')}</div>
      </div>
      <div class="qv__info">
        <span class="qv__eyebrow">${set==='new'?'New arrival':'Best seller'}</span>
        <h2 class="qv__title" id="qvTitle">${n}</h2>
        <div class="qv__rating" aria-label="Rated ${rating} out of 5"><span class="stars" style="--p:${rating/5*100}%" aria-hidden="true">★★★★★</span><span>${rating} · ${reviews} reviews</span></div>
        <div class="qv__price">${price}</div>
        <p class="qv__blurb">Cast by hand in small batches and finished to a warm mirror polish. Made to layer, stack and be worn every day.</p>
        <div class="qv__label">Finish <em id="qvFinish">Gold</em></div>
        <div class="qv__opts" id="qvFinishOpts" role="group" aria-label="Finish">${Object.entries(FINISH).map(([f,col],k)=>`<button type="button" data-f="${f}" aria-pressed="${k===0}"><span class="qv__sw" style="background:${col}"></span>${f}</button>`).join('')}</div>
        ${so?`<div class="qv__label">${so.label}</div><div class="qv__opts" id="qvSizeOpts" role="group" aria-label="${so.label}">${so.vals.map(v=>`<button type="button" data-s="${v}" aria-pressed="false">${v}</button>`).join('')}</div>`:''}
        <ul class="qv__details"><li><b>Material</b>Recycled brass with 18k gold vermeil</li><li><b>Craft</b>Hand-cast and polished in Athens, hallmarked for authenticity</li><li><b>Care</b>Wipe with a soft cloth and keep away from perfume</li></ul>
        <div class="qv__cta"><div class="qv__err" id="qvErr" role="alert"></div><button type="button" class="qv__add" id="qvAdd">Add to Bag</button><p class="qv__note">Free worldwide shipping · 2-year warranty</p></div>
      </div>`;
    lucide.createIcons();
    wire(gal);
    dr.classList.add('is-open');scrim.classList.add('is-on');dr.setAttribute('aria-hidden','false');root.classList.add('no-scroll');
    setTimeout(()=>document.getElementById('qvClose').focus({preventScroll:true}),120);
  }
  function wire(gal){
    const main=document.getElementById('qvMain');
    dr.querySelector('.qv__thumbs').addEventListener('click',e=>{
      const t=e.target.closest('button');if(!t)return;
      dr.querySelectorAll('.qv__thumbs button').forEach(x=>x.classList.toggle('is-active',x===t));
      const k=+t.dataset.k;main.style.opacity=0;
      const show=()=>{main.style.opacity=1};
      setTimeout(()=>{main.onload=show;main.onerror=show;main.src=PX(gal[k],1200);main.alt=`${state.n} — view ${k+1}`;setTimeout(show,700)},200);
    });
    const pick=(box,attr,cb)=>box&&box.addEventListener('click',e=>{
      const t=e.target.closest('button');if(!t)return;
      box.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===t));cb(t.dataset[attr]);
    });
    pick(document.getElementById('qvFinishOpts'),'f',v=>{state.finish=v;document.getElementById('qvFinish').textContent=v});
    pick(document.getElementById('qvSizeOpts'),'s',v=>{state.size=v;document.getElementById('qvErr').textContent=''});
    const add=document.getElementById('qvAdd'),err=document.getElementById('qvErr');
    add.addEventListener('click',()=>{
      if(state.so&&!state.size){err.textContent=`Please select a ${state.so.label.toLowerCase()}.`;return}
      addToBag(state.n,state.finish+(state.size?', '+state.size:''));
      add.textContent='Added to bag ✓';add.classList.add('is-added');
      setTimeout(()=>{add.textContent='Add to Bag';add.classList.remove('is-added')},1800);
    });
    document.getElementById('qvClose').onclick=close;
  }
  function close(){
    if(!dr.classList.contains('is-open'))return;
    dr.classList.remove('is-open');scrim.classList.remove('is-on');dr.setAttribute('aria-hidden','true');root.classList.remove('no-scroll');
    if(opener)opener.focus({preventScroll:true});
  }
  scrim.addEventListener('click',close);
  document.addEventListener('click',e=>{
    const t=e.target.closest('[data-qv]');if(!t)return;
    e.preventDefault();e.stopPropagation();open(t.dataset.set,+t.dataset.i,t);
  });
  document.addEventListener('keydown',e=>{
    if(!dr.classList.contains('is-open'))return;
    if(e.key==='Escape'){e.stopPropagation();close()}
    if(e.key==='Tab'){
      const f=[...dr.querySelectorAll('button,a[href]')].filter(x=>x.offsetParent!==null);
      if(!f.length)return;const first=f[0],last=f[f.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }
  },true);
})();
