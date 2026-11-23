/* Quick View slide-over drawer. Exposes openQuickView(product, openerEl); also handles [data-qv] (home) and [data-pid] (collection) triggers */
(function(){
  const FINISH={'Gold':'#D4AF37','Rose Gold':'#D9A58F','Silver':'#C9CCD1'};
  const root=document.documentElement;
  const scrim=document.createElement('div');scrim.className='qv-scrim';
  const dr=document.createElement('aside');dr.className='qv';dr.setAttribute('role','dialog');dr.setAttribute('aria-modal','true');dr.setAttribute('aria-hidden','true');dr.setAttribute('aria-labelledby','qvTitle');
  document.body.append(scrim,dr);
  let opener=null,state={};

  function sizeOpts(p){
    const c=p.category||'',n=p.name;
    if(c==='Rings'||/ring/i.test(n)&&!c)return{label:'Ring size',vals:['5','6','7','8','9']};
    if(c==='Necklaces'||/necklace|pendant/i.test(n)&&!c)return{label:'Length',vals:['40 cm','45 cm','50 cm']};
    if(c==='Bracelets'||c==='Bangles'||/bracelet|cuff|bangle/i.test(n)&&!c)return{label:'Size',vals:['S','M','L']};
    return null;
  }
  const money=v=>typeof v==='number'?'$'+v:v;
  function open(p,from){
    const gal=p.imgs.filter((v,k,arr)=>arr.indexOf(v)===k);
    let h=0;for(const ch of p.name)h=(h*31+ch.charCodeAt(0))>>>0;
    const rating=(4.6+(h%5)/10).toFixed(1),reviews=40+h%180,so=sizeOpts(p);
    state={n:p.name,finish:'Gold',size:null,so};opener=from;
    const eyebrow=p.flag==='new'?'New arrival':p.flag==='best'?'Best seller':(p.category||'Fine jewelry');
    dr.innerHTML=`
      <button class="qv__close" id="qvClose" aria-label="Close quick view"><i data-lucide="x"></i></button>
      <div class="qv__gallery">
        <div class="qv__main"><img id="qvMain" src="${PX(gal[0],1200)}" alt="${p.name} — view 1"></div>
        <div class="qv__thumbs" role="group" aria-label="Product views">${gal.map((g,k)=>`<button type="button" class="${k?'':'is-active'}" data-k="${k}" aria-label="View ${k+1}"><img src="${PX(g,200)}" alt=""></button>`).join('')}</div>
      </div>
      <div class="qv__info">
        <span class="qv__eyebrow">${eyebrow}</span>
        <h2 class="qv__title" id="qvTitle">${p.name}</h2>
        <div class="qv__rating" aria-label="Rated ${rating} out of 5"><span class="stars" style="--p:${rating/5*100}%" aria-hidden="true">★★★★★</span><span>${rating} · ${reviews} reviews</span></div>
        <div class="qv__price">${money(p.price)}</div>
        <p class="qv__blurb">Cast by hand in small batches and finished to a warm mirror polish. Made to layer, stack and be worn every day.</p>
        <div class="qv__label">Finish <em id="qvFinish">Gold</em></div>
        <div class="qv__opts" id="qvFinishOpts" role="group" aria-label="Finish">${Object.entries(FINISH).map(([f,col],k)=>`<button type="button" data-f="${f}" aria-pressed="${k===0}"><span class="qv__sw" style="background:${col}"></span>${f}</button>`).join('')}</div>
        ${so?`<div class="qv__label">${so.label}</div><div class="qv__opts" id="qvSizeOpts" role="group" aria-label="${so.label}">${so.vals.map(v=>`<button type="button" data-s="${v}" aria-pressed="false">${v}</button>`).join('')}</div>`:''}
        <ul class="qv__details"><li><b>Material</b>${p.metal||'Recycled brass with 18k gold vermeil'}</li>${p.edit?`<li><b>Edit</b>${p.edit}</li>`:''}<li><b>Craft</b>Hand-cast and polished in Athens, hallmarked for authenticity</li><li><b>Care</b>Wipe with a soft cloth and keep away from perfume</li></ul>
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
  window.openQuickView=open;
  scrim.addEventListener('click',close);
  document.addEventListener('click',e=>{
    const t=e.target.closest('[data-qv],[data-pid]');if(!t)return;
    e.preventDefault();e.stopPropagation();
    if(t.dataset.pid){                                              // collection page
      const idx=CATALOG.findIndex(x=>x.id===t.dataset.pid),p=CATALOG[idx];
      open({name:p.name,price:p.price,category:p.category,metal:p.metal,edit:p.edit,flag:p.isNew?'new':p.isBest?'best':'',
        imgs:[p.imgs[0],p.imgs[1],POOL[(idx*2+3)%12],POOL[(idx*3+7)%12]]},t);
    }else{                                                          // home page carousels
      const set=t.dataset.set,i=+t.dataset.i,[n,price,a,b]=(set==='new'?NEWP:BEST)[i];
      open({name:n,price,flag:set==='new'?'new':'best',imgs:[a,b,POOL[(i*2+3)%12],POOL[(i*3+7)%12]]},t);
    }
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
