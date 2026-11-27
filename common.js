/* Shared: preloader, media fallbacks, toast, newsletter, wordmark fit */
(function(){
  const p=document.getElementById('velora-preloader'),root=document.documentElement;
  if(!p){root.classList.add('is-ready');return}
  setTimeout(()=>root.classList.add('is-ready'),4600);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,minShow=reduced?350:1900,t0=performance.now();
  let gone=false;
  function hide(){
    if(gone)return;gone=true;
    const wait=Math.max(0,minShow-(performance.now()-t0));          // let the A settle first
    setTimeout(()=>{p.classList.add('is-done');root.classList.add('is-ready');setTimeout(()=>p.remove(),1300)},wait);
  }
  if(document.readyState==='complete')hide();else addEventListener('load',hide);
  setTimeout(hide,3200);                                             // safe maximum if external media is slow
})();

document.addEventListener('error',e=>{
  const t=e.target;
  if(t.tagName==='IMG'){t.classList.add('img-fail');t.removeAttribute('alt')}
  if(t.tagName==='SOURCE'){const v=t.closest('video');if(v&&v.poster&&window.posterSwap)posterSwap(v)}
},true);

let toastT;
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2400)}

const newsForm=document.getElementById('newsForm');
if(newsForm)newsForm.addEventListener('submit',e=>{
  e.preventDefault();
  const v=document.getElementById('newsEmail').value.trim(),m=document.getElementById('newsMsg');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){m.className='newsletter__msg err';m.textContent='Enter a valid email address.';return}
  m.className='newsletter__msg ok';m.textContent='You are subscribed. Welcome to Velora.';e.target.reset();
});

(document.fonts?document.fonts.ready:Promise.resolve()).then(fitWordmark);
addEventListener('resize',fitWordmark);fitWordmark();
