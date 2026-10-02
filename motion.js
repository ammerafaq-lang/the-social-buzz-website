'use strict';
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const toggle=document.querySelector('.motion-control');
 let paused=false;
 try { paused=localStorage.getItem('tsb-motion')==='paused'; } catch {}
 function apply(){
  document.body.classList.toggle('motion-paused',paused||reduced.matches);
  if(toggle){toggle.textContent=paused?'Play motion':'Pause motion';toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?'Play animation':'Pause animation');}
 }
 toggle?.addEventListener('click',()=>{paused=!paused;try{localStorage.setItem('tsb-motion',paused?'paused':'active');}catch{}apply();});
 reduced.addEventListener('change',apply);apply();
 // Nothing starts hidden: failed or disabled JavaScript cannot obscure content.
 if(!reduced.matches && 'IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(entry.isIntersecting){entry.target.classList.add('reveal-in');observer.unobserve(entry.target);}
  }),{threshold:.1});
  document.querySelectorAll('.section-head,.service-detail,.process-note,.founder-feature-image').forEach(el=>observer.observe(el));
 }
})();
