/* Instagram bento gallery + lightbox */
(function(){
  const POSTS=[
    [2697786,'Layered gold, worn every day','2.4k'],[3912476,'The Adapt cuff in the studio','1.9k'],
    [3641059,'Pearl drops for evening','3.1k'],[3266700,'Chain bracelets, stacked','2.7k'],
    [1721943,'Behind the scenes in Athens — hand-finishing a new capsule','4.2k']];
  const grid=document.getElementById('igrid');
  grid.innerHTML=POSTS.map(([id,cap,likes],i)=>`<button type="button" class="igtile" data-i="${i}" aria-label="Open post: ${cap}">
    <img src="${PX(id,1000)}" alt="" loading="lazy">
    <div class="igtile__cap"><span><i data-lucide="heart"></i>${likes}</span><span>@velorajewelry</span></div></button>`).join('');

  const lb=document.createElement('div');lb.className='lb';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','Instagram preview');
  lb.innerHTML=`<button class="lb__x" aria-label="Close"><i data-lucide="x"></i></button><button class="lb__p" aria-label="Previous"><i data-lucide="chevron-left"></i></button><button class="lb__n" aria-label="Next"><i data-lucide="chevron-right"></i></button>
    <div class="lb__box"><img alt=""><div class="lb__cap"></div></div>`;
  document.body.appendChild(lb);
  const img=lb.querySelector('img'),cap=lb.querySelector('.lb__cap');let cur=0,opener=null;
  function show(i){
    cur=(i+POSTS.length)%POSTS.length;const [id,c,l]=POSTS[cur];
    img.src=PX(id,1600);cap.innerHTML=`${c}<br><small>♥ ${l} · @velorajewelry</small><br><a href="#">View on Instagram</a>`;
  }
  function open(i,from){opener=from;show(i);lb.classList.add('is-open');document.documentElement.classList.add('no-scroll');setTimeout(()=>lb.querySelector('.lb__x').focus({preventScroll:true}),100)}
  function close(){if(!lb.classList.contains('is-open'))return;lb.classList.remove('is-open');document.documentElement.classList.remove('no-scroll');if(opener)opener.focus({preventScroll:true})}
  grid.addEventListener('click',e=>{const t=e.target.closest('.igtile');if(t)open(+t.dataset.i,t)});
  lb.querySelector('.lb__x').onclick=close;lb.querySelector('.lb__p').onclick=()=>show(cur-1);lb.querySelector('.lb__n').onclick=()=>show(cur+1);
  lb.addEventListener('click',e=>{if(e.target===lb)close()});
  document.addEventListener('keydown',e=>{
    if(!lb.classList.contains('is-open'))return;
    if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(cur-1);if(e.key==='ArrowRight')show(cur+1);
  });
})();
