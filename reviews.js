/* Sticky scroll-reveal reviews + back-to-top */
(function(){
  const track=document.getElementById('reviewsTrack');
  const cards=track?[...track.querySelectorAll('.rcard')]:[];
  const mq=matchMedia('(max-width:900px)');
  const clamp=v=>Math.max(0,Math.min(1,v)),ease=t=>1-Math.pow(1-t,3);
  const top=document.getElementById('toTop');
  function update(){
    const vh=innerHeight;
    if(track){
      if(mq.matches){
        // mobile / tablet: cards slide in from alternating sides as they enter the viewport
        cards.forEach(c=>c.style.setProperty('--t',ease(clamp((vh*.94-c.getBoundingClientRect().top)/(vh*.38))).toFixed(3)));
      }else{
        // desktop: progress through the pinned track (starts as the section enters, finishes before it releases)
        const r=track.getBoundingClientRect();
        const q=clamp((vh*.6-r.top)/(r.height-vh+vh*.6));
        cards.forEach(c=>{const s=+c.dataset.s,e=+c.dataset.e;c.style.setProperty('--t',ease(clamp((q-s)/(e-s))).toFixed(3))});
      }
    }
    const max=document.documentElement.scrollHeight-vh;
    top.style.setProperty('--sp',(max>0?scrollY/max*100:0).toFixed(1));
    top.classList.toggle('is-on',scrollY>700);
  }
  let tick=false;
  addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(()=>{tick=false;update()})}},{passive:true});
  addEventListener('resize',update);update();
  top.onclick=()=>scrollTo({top:0,behavior:'smooth'});
})();
