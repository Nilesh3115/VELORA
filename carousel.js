/* Data + product carousels + showcase */
const BEST = [
  ['Sculpted Hoop Earrings','$185',1191531,1458867],['Signet Chain Ring','$142',248077,265906],
  ['Rope Chain Necklace','$260',1454171,1721943],['Link Bracelet','$198',2735970,3266700],
  ['Pearl Drop Earrings','$164',2697786,3641059],['Coin Pendant','$230',994234,1413420]];
const NEWP = [
  ['Spiral Dome Ring','$210',3266700,248077],['Braided Ring Pendant','$275',1413420,1454171],
  ['Lace Flower Studs','$160',1458867,1191531],['Molten Earrings','$240',265906,2735970],
  ['Wave Cuff','$320',3641059,2697786],['Organic Hoop','$190',1721943,994234]];
const CATS = [['Hoops',1191531,1458867],['Necklaces',1454171,1721943],['Bracelets',2735970,3266700],['Rings',248077,265906],['Earrings',2697786,3641059],['Pendants',994234,1413420]];

function cardImgs(a,b){return `<img src="${PX(a)}" alt="" loading="lazy" draggable="false"><img src="${PX(b)}" alt="" loading="lazy" draggable="false">`}

function buildProducts(){
  document.querySelectorAll('[data-products]').forEach(track=>{
    const isNew = track.dataset.products==='new';
    track.innerHTML = (isNew?NEWP:BEST).map(([n,p,a,b],i)=>`
      <article class="pcard"><div class="pcard__img">${isNew?'<span class="tag">NEW</span>':''}${cardImgs(a,b)}
      <button type="button" class="pcard__qv" data-qv data-set="${isNew?'new':'best'}" data-i="${i}">Quick view</button>
      <button type="button" class="pcard__add" aria-label="Add ${n} to bag" data-name="${n}"><i data-lucide="shopping-bag"></i></button></div>
      <h3>${n}</h3><p>${p}</p></article>`).join('');
    const sec = track.closest('.products');
    const [prev,next] = sec.querySelectorAll('.arrows button');
    const step = ()=> track.querySelector('.pcard').offsetWidth;
    const upd = ()=>{prev.disabled = track.scrollLeft<4; next.disabled = track.scrollLeft+track.clientWidth>=track.scrollWidth-4};
    prev.onclick=()=>track.scrollBy({left:-step()});
    next.onclick=()=>track.scrollBy({left:step()});
    track.addEventListener('scroll',upd,{passive:true}); window.addEventListener('resize',upd); upd();
  });
}

function buildShowcase(){
  const t=document.getElementById('showcase'),area=t.closest('.category-scroll-area');
  t.innerHTML = CATS.map(([n,a,b])=>`<div class="ccard">${cardImgs(a,b)}<span>${n}</span></div>`).join('');
  const cur=document.getElementById('dragCursor');
  let down=false,sx=0,sl=0,x=0,y=0,cx=0,cy=0,cs=0,inside=false,seen=false;
  const hide=()=>{inside=false;cur.style.opacity=0};
  function check(){
    if(!seen){hide();return}
    const el=document.elementFromPoint(x,y);            // header, other sections etc. are not inside the area
    inside=!!(el&&el.closest('.category-scroll-area'));
    cur.style.opacity=inside?1:0;
  }
  window.addEventListener('mousemove',e=>{x=e.clientX;y=e.clientY;if(!seen){seen=true;cx=x;cy=y}check()},{passive:true});
  window.addEventListener('scroll',check,{passive:true});
  window.addEventListener('resize',check);
  window.addEventListener('blur',()=>{seen=false;down=false;hide()});
  document.documentElement.addEventListener('mouseleave',()=>{seen=false;down=false;hide()});
  area.addEventListener('mouseleave',()=>{down=false;hide()});
  (function loop(){
    cx+=(x-cx)*.2;cy+=(y-cy)*.2;
    const target=inside?(down?.85:1):0;
    cs+=(target-cs)*(inside?.2:.6);if(!inside&&cs<.03)cs=0;
    cur.style.transform=`translate(${cx}px,${cy}px) translate(-50%,-50%) scale(${cs})`;
    requestAnimationFrame(loop);
  })();
  t.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;down=true;sx=e.clientX;sl=t.scrollLeft});
  window.addEventListener('pointerup',()=>down=false);
  t.addEventListener('pointermove',e=>{if(!down)return;t.scrollLeft=sl-(e.clientX-sx)});
}
