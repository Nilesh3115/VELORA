/* Shared: media fallbacks, cart, toast, newsletter, wordmark fit */
document.addEventListener('error',e=>{
  const t=e.target;
  if(t.tagName==='IMG'){t.classList.add('img-fail');t.removeAttribute('alt')}
  if(t.tagName==='SOURCE'){const v=t.closest('video');if(v&&v.poster){const im=document.createElement('img');im.src=v.poster;im.alt='';v.replaceWith(im)}}
},true);

let bag=0,toastT;
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2200)}
function addToBag(name,detail){
  bag++;document.getElementById('bagCount').textContent=bag;
  const c=document.querySelector('.bag');c.classList.remove('bump');void c.offsetWidth;c.classList.add('bump');
  toast(`${name}${detail?' ('+detail+')':''} added to your bag`);
}
document.addEventListener('click',e=>{
  const b=e.target.closest('.pcard__add,[data-add]');if(!b)return;
  addToBag(b.dataset.name);
  if(b.hasAttribute('data-add')&&!b.classList.contains('is-added')){
    const t=b.textContent;b.textContent='Added ✓';b.classList.add('is-added');
    setTimeout(()=>{b.textContent=t;b.classList.remove('is-added')},1500);
  }
});

const newsForm=document.getElementById('newsForm');
if(newsForm)newsForm.addEventListener('submit',e=>{
  e.preventDefault();
  const v=document.getElementById('newsEmail').value.trim(),m=document.getElementById('newsMsg');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){m.className='newsletter__msg err';m.textContent='Enter a valid email address.';return}
  m.className='newsletter__msg ok';m.textContent='You are subscribed. Welcome to Velora.';e.target.reset();
});

(document.fonts?document.fonts.ready:Promise.resolve()).then(fitWordmark);
addEventListener('resize',fitWordmark);fitWordmark();
