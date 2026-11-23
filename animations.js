/* Reveals, parallax, marquee, wordmark */
function initReveal(){
  const els=document.querySelectorAll('.quote p,.showcase__head,.products__head,.tcard,.split__panel,.footer__grid');
  els.forEach(e=>e.classList.add('reveal'));
  const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}}),{threshold:.15});
  els.forEach(e=>io.observe(e));
}
function initMarquees(){
  document.querySelectorAll('.marquee').forEach(m=>{
    const g=m.querySelector('.marquee__group');
    // repeat content so one group always exceeds viewport, then clone for seamless loop
    const base=g.innerHTML; let n=0; while(g.scrollWidth<window.innerWidth*1.2&&n++<6) g.innerHTML+=base;
    const c=g.cloneNode(true); c.setAttribute('aria-hidden','true'); m.appendChild(c);
  });
}
function fitWordmark(){
  const box=document.getElementById('wordmark'),s=document.getElementById('wordmarkText'),stage=document.getElementById('curtainStage');
  if(!box||!s)return;
  const cs=getComputedStyle(box),pad=parseFloat(cs.paddingLeft)+parseFloat(cs.paddingRight);
  const vw=document.documentElement.clientWidth||innerWidth;
  const availW=(Math.min(vw,stage?stage.clientWidth||vw:vw)-pad)*.98;      // never wider than the viewport
  s.style.fontSize='100px';
  const w=s.getBoundingClientRect().width||1;
  let fs=100*availW/w;
  const maxH=((stage&&stage.clientHeight)||innerHeight*.78)*.42;           // keeps it inside short landscape screens
  fs=Math.max(24,Math.min(fs,maxH/.95));
  s.style.fontSize=Math.floor(fs)+'px';
}
addEventListener('orientationchange',()=>setTimeout(fitWordmark,250));
if('ResizeObserver' in window){const st=document.getElementById('curtainStage');if(st)new ResizeObserver(()=>fitWordmark()).observe(st)}
function scrollEffects(){
  const hero=document.getElementById('hero'),slides=hero?hero.querySelectorAll('.hero__slide'):[],dots=hero?hero.querySelectorAll('.hero__dots button'):[];
  const par=document.getElementById('parallax'),pbs=par?par.querySelectorAll('.pbanner__bg'):[];
  const cu=document.getElementById('curtain');
  let cur=-1;
  const clamp=v=>Math.max(0,Math.min(1,v));
  function tick(){
    const vh=innerHeight;
    if(cu){const cr=cu.getBoundingClientRect(),rv=clamp((vh-cr.top)/cr.height);cu.style.setProperty('--rv',rv.toFixed(3));cu.classList.toggle('is-live',rv>0)}
    if(hero){
      const r=hero.getBoundingClientRect(), p=clamp(-r.top/(hero.offsetHeight-vh));
      const idx=p<.34?0:p<.67?1:2;
      if(idx!==cur){cur=idx;slides.forEach((s,i)=>{const v=s.querySelector('video');if(!v)return;if(i===idx){const pr=v.play();if(pr&&pr.catch)pr.catch(()=>{})}else v.pause()});slides.forEach((s,i)=>s.classList.toggle('is-active',i===idx));dots.forEach((d,i)=>d.classList.toggle('is-active',i===idx))}
      const start=[0,.34,.67][idx], lp=clamp((p-start)/.33);
      const card=slides[idx].querySelector('.hero__card');
      card.style.setProperty('--s',(.82+lp*.28).toFixed(3));
    }
    if(par){const pr=par.getBoundingClientRect(), pp=clamp(-pr.top/(par.offsetHeight-vh));pbs.forEach(b=>b.style.setProperty('--ps',(1+pp*.28).toFixed(3)))}
  }
  addEventListener('scroll',()=>requestAnimationFrame(tick),{passive:true});addEventListener('resize',tick);tick();
  if(hero)dots.forEach((d,i)=>d.onclick=()=>scrollTo({top:hero.offsetTop+(hero.offsetHeight-innerHeight)*[.1,.5,.9][i]}));
}
