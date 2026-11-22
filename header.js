/* Announcement bar, desktop mega menus, mobile drawer, search, smart sticky header */
(function(){
  const $=id=>document.getElementById(id);
  const header=$('header'),host=$('megaHost'),scrim=$('scrim'),root=document.documentElement;
  const btns=[...document.querySelectorAll('.nav button[data-menu]')];
  const IMG=(id,w=1400)=>`https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
  const single=(links,img,cap,cta)=>({type:1,links,img,cap,cta});
  const MENUS={
    collections:{type:3,cols:[
      {links:['All Jewelry','Best Sellers','New Arrivals','Gold','Silver'],caps:true},
      {title:'Featured',links:['Limited Edition','The Coastal Edit','Gift Edit','Bridal Edit','Adapt','Poise','Resort']},
      {title:'Editor Selects',links:['Droplets Earrings','Batis Ring','Theos Earrings','Cassius Ring','Arith Bracelet','Logos Earrings','Lebedus Earrings']}],
      img:3762800,cap:'The Coastal Edit',cta:'Explore now'},
    earrings:single(['All Earrings','Hoops','Studs','Dangle','Earcuff','Statement Earrings'],3361481,'Liano Earrings','Shop now'),
    rings:single(['All Rings','Stackable','Signet','Statement','Bands','Midi'],248077,'Batis Ring','Shop now'),
    bracelets:single(['All Bracelets','Chain','Cuffs','Bangles','Charm'],3266700,'Arith Bracelet','Shop now'),
    necklaces:single(['All Necklaces','Pendants','Chains','Chokers','Layering','Statement'],1454171,'Coin Pendant','Shop now')
  };
  const label=k=>k[0].toUpperCase()+k.slice(1);

  /* ---------- desktop mega menus ---------- */
  const link=(t,caps,soft)=>`<a href="#best" class="mega__link${caps?' caps':''}${soft?' soft':''}">${t}</a>`;
  const imgBlock=d=>`<div class="mega__img"><img src="${IMG(d.img)}" alt="" loading="lazy"><div class="mega__cap"><h3>${d.cap}</h3><a class="btn" href="#best">${d.cta}</a></div></div>`;
  Object.entries(MENUS).forEach(([k,d])=>{
    const el=document.createElement('div');el.className='mega mega--'+d.type;el.id='menu-'+k;
    el.innerHTML=d.type===3
      ?d.cols.map(c=>`<div class="mega__col">${c.title?`<h5>${c.title}</h5>`:''}${c.links.map(l=>link(l,c.caps,!!c.title)).join('')}</div>`).join('')+imgBlock(d)
      :`<div class="mega__col">${d.links.map(l=>link(l,true)).join('')}</div>${imgBlock(d)}`;
    host.appendChild(el);
  });
  let openKey=null,closeT;
  function openMega(k){
    clearTimeout(closeT);if(openKey===k)return;closeSearch();openKey=k;
    btns.forEach(b=>{const on=b.dataset.menu===k;b.classList.toggle('is-open',on);b.setAttribute('aria-expanded',on)});
    host.querySelectorAll('.mega').forEach(m=>m.classList.toggle('is-open',m.id==='menu-'+k));
    scrim.classList.add('is-on');
  }
  function closeMega(){
    openKey=null;clearTimeout(closeT);
    btns.forEach(b=>{b.classList.remove('is-open');b.setAttribute('aria-expanded','false')});
    host.querySelectorAll('.mega').forEach(m=>m.classList.remove('is-open'));
    if(!searchOpen)scrim.classList.remove('is-on');
  }
  const canHover=matchMedia('(hover:hover) and (min-width:1025px)').matches;
  btns.forEach(b=>{
    b.addEventListener('click',()=>openKey===b.dataset.menu?closeMega():openMega(b.dataset.menu));
    if(canHover)b.addEventListener('mouseenter',()=>openMega(b.dataset.menu));
  });
  if(canHover){
    header.addEventListener('mouseleave',()=>{closeT=setTimeout(closeMega,160)});
    header.addEventListener('mouseenter',()=>clearTimeout(closeT));
    document.querySelector('.nav__link').addEventListener('mouseenter',()=>{closeT=setTimeout(closeMega,100)});
  }
  host.addEventListener('click',e=>{if(e.target.closest('a'))closeMega()});

  /* ---------- search (top panel + drawer) ---------- */
  const PRODUCTS=[...BEST.map(p=>({n:p[0],p:p[1],i:p[2],s:'#best'})),...NEWP.map(p=>({n:p[0],p:p[1],i:p[2],s:'#new'}))];
  function results(box,q){
    q=q.trim().toLowerCase();
    if(!q){box.innerHTML='';return}
    const hits=PRODUCTS.filter(p=>p.n.toLowerCase().includes(q)).slice(0,6);
    box.innerHTML=hits.length
      ?hits.map(p=>`<a href="${p.s}"><img src="${PX(p.i,160)}" alt=""><span>${p.n}</span><em>${p.p}</em></a>`).join('')
      :`<p>No matches for “${q.replace(/[<>&"]/g,'')}”. Try “hoop”, “ring” or “pendant”.</p>`;
  }
  const panel=$('searchPanel'),sIn=$('searchInput'),sBox=$('searchResults');let searchOpen=false;
  function openSearch(){closeMega();searchOpen=true;panel.classList.add('is-open');$('searchBtn').setAttribute('aria-expanded','true');scrim.classList.add('is-on');setTimeout(()=>sIn.focus(),60)}
  function closeSearch(){if(!searchOpen)return;searchOpen=false;panel.classList.remove('is-open');$('searchBtn').setAttribute('aria-expanded','false');if(!openKey)scrim.classList.remove('is-on')}
  $('searchBtn').onclick=()=>searchOpen?closeSearch():openSearch();
  $('searchClose').onclick=closeSearch;
  sIn.addEventListener('input',()=>results(sBox,sIn.value));
  $('searchForm').addEventListener('submit',e=>{e.preventDefault();results(sBox,sIn.value)});
  sBox.addEventListener('click',e=>{if(e.target.closest('a'))closeSearch()});
  scrim.addEventListener('click',()=>{closeMega();closeSearch()});

  /* ---------- mobile drawer ---------- */
  const drawer=$('drawer'),dScrim=$('drawerScrim'),burger=$('burger'),dClose=$('drawerClose'),acc=$('acc');
  const sub=(t)=>`<a class="sub" href="#best">${t}</a>`;
  acc.innerHTML=Object.entries(MENUS).map(([k,d])=>{
    const body=d.type===3
      ?d.cols.map(c=>(c.title?`<h5>${c.title}</h5>`:'')+c.links.map(sub).join('')).join('')
      :d.links.map(sub).join('');
    return `<div class="acc__item"><button class="acc__btn" aria-expanded="false" aria-controls="acc-${k}">${label(k)}<i data-lucide="chevron-down"></i></button>
      <div class="acc__panel" id="acc-${k}"><div class="acc__inner"><div>${body}
      <a class="acc__card" href="#best"><img src="${IMG(d.img,800)}" alt="" loading="lazy"><div><strong>${d.cap}</strong><span>${d.cta}</span></div></a></div></div></div></div>`;
  }).join('')+'<a class="acc__link" href="#new">Lookbook</a>';
  acc.addEventListener('click',e=>{
    const b=e.target.closest('.acc__btn');
    if(b){
      const item=b.parentElement,on=!item.classList.contains('is-open');
      acc.querySelectorAll('.acc__item').forEach(i=>{i.classList.remove('is-open');i.querySelector('.acc__btn').setAttribute('aria-expanded','false')});
      if(on){item.classList.add('is-open');b.setAttribute('aria-expanded','true')}
      return;
    }
    if(e.target.closest('a'))closeDrawer(false);
  });
  const dIn=$('drawerInput'),dBox=$('drawerResults');
  dIn.addEventListener('input',()=>results(dBox,dIn.value));
  $('drawerSearch').addEventListener('submit',e=>{e.preventDefault();results(dBox,dIn.value)});
  dBox.addEventListener('click',e=>{if(e.target.closest('a'))closeDrawer(false)});
  drawer.querySelector('.drawer__foot').addEventListener('click',e=>{if(e.target.closest('a'))closeDrawer(false)});

  function openDrawer(){
    closeMega();closeSearch();
    drawer.classList.add('is-open');dScrim.classList.add('is-on');drawer.setAttribute('aria-hidden','false');
    burger.setAttribute('aria-expanded','true');root.classList.add('no-scroll');
    setTimeout(()=>dClose.focus({preventScroll:true}),80);
  }
  function closeDrawer(returnFocus=true){
    if(!drawer.classList.contains('is-open'))return;
    drawer.classList.remove('is-open');dScrim.classList.remove('is-on');drawer.setAttribute('aria-hidden','true');
    burger.setAttribute('aria-expanded','false');root.classList.remove('no-scroll');
    if(returnFocus)burger.focus({preventScroll:true});
  }
  burger.onclick=openDrawer;dClose.onclick=()=>closeDrawer();dScrim.onclick=()=>closeDrawer();

  /* ---------- global keys / outside click / resize ---------- */
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){closeDrawer();closeMega();closeSearch()}
    if(e.key==='Tab'&&drawer.classList.contains('is-open')){
      const f=[...drawer.querySelectorAll('a[href],button,input')].filter(x=>x.offsetParent!==null&&!x.closest('.acc__panel:not(:is(.acc__item.is-open .acc__panel))'));
      if(!f.length)return;const a=f[0],z=f[f.length-1];
      if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}
      else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}
    }
  });
  document.addEventListener('click',e=>{if((openKey||searchOpen)&&!e.target.closest('.header'))closeMega(),closeSearch()});
  addEventListener('resize',()=>{if(innerWidth>1024)closeDrawer(false);else closeMega()});

  /* ---------- announcement bar ---------- */
  const MSG=['Save 15% on your first order with code: <strong>WELCOME15</strong>','Complimentary shipping on orders over $250','Every piece hallmarked for authenticity'];
  let ai=0;const at=$('annText');
  function ann(d){ai=(ai+d+MSG.length)%MSG.length;at.style.opacity=0;setTimeout(()=>{at.innerHTML=MSG[ai];at.style.opacity=1},250)}
  $('annPrev').onclick=()=>ann(-1);$('annNext').onclick=()=>ann(1);
  setInterval(()=>{if(!openKey&&!searchOpen)ann(1)},6000);

  /* ---------- smart sticky ---------- */
  let last=0;
  function onScroll(){
    const y=scrollY;
    header.classList.toggle('is-scrolled',y>10);
    if(y<=10){header.classList.remove('is-hidden')}
    else if(y>last+4){header.classList.add('is-hidden');closeMega();closeSearch()}
    else if(y<last-4){header.classList.remove('is-hidden')}
    last=y;
  }
  addEventListener('scroll',onScroll,{passive:true});onScroll();
})();
