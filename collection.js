/* Collection page: catalog grid, filters, sort, chips, mobile filter drawer */
(function(){
  const $=id=>document.getElementById(id);
  const grid=$('cGrid'),panel=$('filterPanel'),scrim=$('fScrim'),trigger=$('fTrigger'),root=document.documentElement;
  const S={cat:'All',edits:new Set(),metals:new Set(),min:0,max:MAXPRICE,flag:'',type:'',q:'',sort:'featured'};
  const money=v=>'$'+v;

  /* ---------- URL <-> state ---------- */
  (function readURL(){
    const u=new URLSearchParams(location.search),list=k=>(u.get(k)||'').split(',').map(s=>s.trim()).filter(Boolean);
    const cat=u.get('cat');if(cat&&CATEGORIES.includes(cat))S.cat=cat;
    list('edit').filter(e=>EDITS.includes(e)).forEach(e=>S.edits.add(e));
    list('metal').filter(m=>METALS.includes(m)).forEach(m=>S.metals.add(m));
    if(+u.get('min')>0)S.min=Math.min(+u.get('min'),MAXPRICE);
    if(+u.get('max')>0)S.max=Math.min(+u.get('max'),MAXPRICE);
    if(['new','best'].includes(u.get('flag')))S.flag=u.get('flag');
    S.type=u.get('type')||'';S.q=(u.get('q')||'').trim();
    if(['featured','low','high','newest'].includes(u.get('sort')))S.sort=u.get('sort');
  })();
  function writeURL(){
    const p={};
    if(S.cat!=='All')p.cat=S.cat;if(S.edits.size)p.edit=[...S.edits].join(',');if(S.metals.size)p.metal=[...S.metals].join(',');
    if(S.min>0)p.min=S.min;if(S.max<MAXPRICE)p.max=S.max;if(S.flag)p.flag=S.flag;if(S.type)p.type=S.type;if(S.q)p.q=S.q;if(S.sort!=='featured')p.sort=S.sort;
    try{history.replaceState(null,'',collURL(p))}catch(e){}
  }

  /* ---------- filtering ---------- */
  const hay=p=>(p.name+' '+p.category+' '+p.type+' '+p.edit+' '+p.metal).toLowerCase();
  function filtered(){
    const words=S.q.toLowerCase().split(/\s+/).filter(Boolean);
    let r=CATALOG.filter(p=>(S.cat==='All'||p.category===S.cat)&&(!S.edits.size||S.edits.has(p.edit))&&(!S.metals.size||S.metals.has(p.metal))
      &&p.price>=S.min&&p.price<=S.max&&(!S.flag||(S.flag==='new'?p.isNew:p.isBest))&&(!S.type||p.type===S.type)&&words.every(w=>hay(p).includes(w)));
    if(S.sort==='low')r=r.slice().sort((a,b)=>a.price-b.price);
    if(S.sort==='high')r=r.slice().sort((a,b)=>b.price-a.price);
    if(S.sort==='newest')r=r.slice().sort((a,b)=>b.date-a.date);
    return r;
  }
  const priceActive=()=>S.min>0||S.max<MAXPRICE;
  const activeCount=()=>(S.cat!=='All')+S.edits.size+S.metals.size+(priceActive()?1:0)+(S.flag?1:0)+(S.type?1:0)+(S.q?1:0);

  /* ---------- filter panel ---------- */
  const radio=(name,val,text)=>`<label class="fopt"><input type="radio" name="${name}" value="${val}"><span>${text}</span></label>`;
  const check=(name,val,text)=>`<label class="fopt"><input type="checkbox" name="${name}" value="${val}"><span>${text}</span></label>`;
  panel.innerHTML=`
    <div class="fpanel__head"><h2>Filters</h2><button type="button" id="fClose" aria-label="Close filters"><i data-lucide="x"></i></button></div>
    <div class="fpanel__body">
      <fieldset><legend>Category</legend>${['All',...CATEGORIES].map(c=>radio('cat',c,c)).join('')}</fieldset>
      <fieldset><legend>Collection</legend>${EDITS.map(e=>check('edit',e,e)).join('')}</fieldset>
      <fieldset><legend>Material / Finish</legend>${METALS.map(m=>check('metal',m,m)).join('')}</fieldset>
      <fieldset><legend>Price</legend>
        <div class="fprice__vals"><span id="pMinV"></span><span id="pMaxV"></span></div>
        <label class="fprice"><span>Min</span><input type="range" id="pMin" min="0" max="${MAXPRICE}" step="10"></label>
        <label class="fprice"><span>Max</span><input type="range" id="pMax" min="0" max="${MAXPRICE}" step="10"></label>
      </fieldset>
      <fieldset><legend>Show</legend>${radio('flag','','All pieces')}${radio('flag','new','New arrivals')}${radio('flag','best','Best sellers')}</fieldset>
    </div>
    <div class="fpanel__foot"><button type="button" class="btn btn--ghost" id="fReset">Reset</button><button type="button" class="btn btn--gold" id="fApply">Show pieces</button></div>`;
  function syncControls(){
    panel.querySelectorAll('input[name=cat]').forEach(i=>i.checked=i.value===S.cat);
    panel.querySelectorAll('input[name=edit]').forEach(i=>i.checked=S.edits.has(i.value));
    panel.querySelectorAll('input[name=metal]').forEach(i=>i.checked=S.metals.has(i.value));
    panel.querySelectorAll('input[name=flag]').forEach(i=>i.checked=i.value===S.flag);
    $('pMin').value=S.min;$('pMax').value=S.max;
    $('pMinV').textContent=money(S.min);$('pMaxV').textContent=money(S.max)+(S.max>=MAXPRICE?'+':'');
  }
  panel.addEventListener('change',e=>{
    const t=e.target;
    if(t.name==='cat'){S.cat=t.value;S.type=''}
    if(t.name==='edit')t.checked?S.edits.add(t.value):S.edits.delete(t.value);
    if(t.name==='metal')t.checked?S.metals.add(t.value):S.metals.delete(t.value);
    if(t.name==='flag')S.flag=t.value;
    update();
  });
  panel.addEventListener('input',e=>{
    if(e.target.id==='pMin'){S.min=Math.min(+e.target.value,S.max);}
    else if(e.target.id==='pMax'){S.max=Math.max(+e.target.value,S.min);}
    else return;
    update();
  });
  function reset(){S.cat='All';S.edits.clear();S.metals.clear();S.min=0;S.max=MAXPRICE;S.flag='';S.type='';S.q='';update()}
  $('fReset').onclick=reset;$('fApply').onclick=()=>closePanel();$('fClose').onclick=()=>closePanel();
  $('cSort').value=S.sort;$('cSort').addEventListener('change',e=>{S.sort=e.target.value;update()});

  /* ---------- chips ---------- */
  const chipsEl=$('cChips');
  function chips(){
    const c=[];
    if(S.cat!=='All')c.push(['cat','',S.cat]);
    S.edits.forEach(e=>c.push(['edit',e,e]));S.metals.forEach(m=>c.push(['metal',m,m]));
    if(priceActive())c.push(['price','',`${money(S.min)} – ${money(S.max)}${S.max>=MAXPRICE?'+':''}`]);
    if(S.flag)c.push(['flag','',S.flag==='new'?'New arrivals':'Best sellers']);
    if(S.type)c.push(['type','',S.type]);
    if(S.q)c.push(['q','',`“${S.q}”`]);
    chipsEl.innerHTML=c.length?c.map(([k,v,t])=>`<button type="button" class="chip" data-k="${k}" data-v="${v.replace(/"/g,'&quot;')}" aria-label="Remove filter ${t}">${t}<span aria-hidden="true">×</span></button>`).join('')+'<button type="button" class="chip chip--clear" data-k="all">Clear all filters</button>':'';
  }
  chipsEl.addEventListener('click',e=>{
    const b=e.target.closest('.chip');if(!b)return;const k=b.dataset.k,v=b.dataset.v;
    if(k==='all')return reset();
    if(k==='cat'){S.cat='All';S.type=''}if(k==='edit')S.edits.delete(v);if(k==='metal')S.metals.delete(v);
    if(k==='price'){S.min=0;S.max=MAXPRICE}if(k==='flag')S.flag='';if(k==='type')S.type='';if(k==='q')S.q='';
    update();
  });

  /* ---------- render ---------- */
  const PAGE=12;let shown=PAGE,current=[];
  function title(){
    if(S.q)return[`Results for “${S.q}”`,'Search the full VELORA catalog.'];
    if(S.flag==='best'&&S.cat==='All')return['Best Sellers','The pieces our community reaches for most.'];
    if(S.flag==='new'&&S.cat==='All')return['New Arrivals','Fresh from the Athens atelier.'];
    if(S.edits.size===1&&S.cat==='All')return[[...S.edits][0],'A curated edit of handcrafted pieces.'];
    if(S.cat!=='All')return[S.type?`${S.type} ${S.cat}`:S.cat,'Handcrafted pieces designed to complement your daily look.'];
    if(S.metals.size===1)return[[...S.metals][0],'Crafted from certified recycled metals.'];
    return['All Jewelry','Handcrafted pieces designed to complement your daily look.'];
  }
  const batch=(from,to)=>current.slice(from,to).map((p,k)=>renderCard(p,k)).join('');
  function paintMore(){
    const n=current.length,s=Math.min(shown,n);
    $('cMore').hidden=n===0;
    $('cMoreFill').style.transform=`scaleX(${n?(s/n).toFixed(3):0})`;
    $('cMoreTxt').textContent=`Showing ${s} of ${n} pieces`;
    const btn=$('cMoreBtn');btn.hidden=s>=n;btn.textContent=`Load More Pieces (${s} of ${n})`;
  }
  function update(){
    current=filtered();shown=PAGE;
    const n=current.length,ac=activeCount();
    grid.innerHTML=batch(0,shown);
    $('cEmpty').hidden=n>0;
    $('cCount').textContent=`${n} ${n===1?'piece':'pieces'}`;
    $('fApply').textContent=n?`Show ${n} ${n===1?'piece':'pieces'}`:'No pieces — adjust filters';
    const b=$('fBadge');b.textContent=ac;b.hidden=ac===0;
    const [t,s]=title();$('cTitle').textContent=t;$('cSub').textContent=s;document.title=`${t} — VELORA`;
    chips();syncControls();writeURL();paintMore();lucide.createIcons();
  }
  $('cMoreBtn').onclick=()=>{
    const from=shown;shown=Math.min(shown+PAGE,current.length);
    grid.insertAdjacentHTML('beforeend',batch(from,shown));paintMore();lucide.createIcons();
  };
  document.querySelectorAll('.cview button').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('.cview button').forEach(x=>x.setAttribute('aria-pressed',x===b));
    grid.classList.toggle('cgrid--dense',b.dataset.view==='4');
  }));

  /* ---------- filter drawer (<=1024px): bottom sheet on phones, side sheet on tablets ---------- */
  const desktop=matchMedia('(min-width:1025px)');let lastFocus=null;
  function place(){
    if(desktop.matches){$('cLayout').insertBefore(panel,grid);closePanel(false);panel.removeAttribute('role');panel.removeAttribute('aria-modal');panel.removeAttribute('aria-hidden')}
    else{document.body.appendChild(panel);panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Filters');panel.setAttribute('aria-hidden',panel.classList.contains('is-open')?'false':'true')}
  }
  function openPanel(){
    lastFocus=document.activeElement;panel.classList.add('is-open');scrim.classList.add('is-on');panel.setAttribute('aria-hidden','false');
    trigger.setAttribute('aria-expanded','true');root.classList.add('no-scroll');setTimeout(()=>$('fClose').focus({preventScroll:true}),80);
  }
  function closePanel(ret=true){
    if(!panel.classList.contains('is-open'))return;
    panel.classList.remove('is-open');scrim.classList.remove('is-on');trigger.setAttribute('aria-expanded','false');root.classList.remove('no-scroll');
    if(!desktop.matches)panel.setAttribute('aria-hidden','true');
    if(ret&&lastFocus)lastFocus.focus({preventScroll:true});
  }
  trigger.onclick=()=>panel.classList.contains('is-open')?closePanel():openPanel();
  scrim.onclick=()=>closePanel();
  document.addEventListener('keydown',e=>{
    if(!panel.classList.contains('is-open'))return;
    if(e.key==='Escape')closePanel();
    if(e.key==='Tab'){
      const f=[...panel.querySelectorAll('button,input')].filter(x=>x.offsetParent!==null);if(!f.length)return;
      const a=f[0],z=f[f.length-1];
      if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}
    }
  });
  desktop.addEventListener('change',place);
  $('cEmptyReset').onclick=reset;

  place();update();initReveal();scrollEffects();
  lucide.createIcons();
})();
