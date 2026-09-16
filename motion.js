'use strict';

(() => {
  const body = document.body;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let userPaused = false;
  try { userPaused = localStorage.getItem('tsb-motion') === 'paused'; } catch {}
  let enabled = !reduced.matches && !userPaused;
  let observer;
  let stageTimer;
  let frame = 0;
  let navigationTimer;
  let recoveryTimer;
  let navigating = false;
  const stage = document.querySelector('.creative-stage');
  let stageVisible = Boolean(stage);
  let phase = 0;
  const phrases = ['It starts with a different perspective.', 'Then we turn the idea into something felt.', 'A story made to find its people.'];
  const toggle = document.createElement('button');
  toggle.type = 'button'; toggle.className = 'motion-toggle';
  toggle.innerHTML = '<i aria-hidden="true"><b></b><b></b><b></b></i><span></span>';
  body.append(toggle);
  const shutter = document.createElement('div');
  shutter.className = 'page-shutter'; shutter.setAttribute('aria-hidden','true');
  shutter.innerHTML = '<i style="--panel:0"></i><i style="--panel:1"></i><i style="--panel:2"></i><i style="--panel:3"></i>';
  body.append(shutter);
  const progress = document.createElement('div');
  progress.className = 'reading-progress'; progress.setAttribute('aria-hidden','true'); body.append(progress);

  function selectPhase(value, manual = false) {
    if (!stage) return;
    phase = value; stage.dataset.phase = String(value);
    stage.querySelectorAll('[data-step]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.step) === value)));
    stage.querySelector('.stage-count').textContent = `0${value + 1} / 03`;
    const phrase = stage.querySelector('.stage-phrase');
    phrase.textContent = phrases[value];
    if (enabled) phrase.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:450,easing:'cubic-bezier(.16,1,.3,1)'});
    if (manual) restartStage();
  }
  function restartStage() {
    clearInterval(stageTimer);
    // Do not auto-change a control while someone is exploring it by keyboard or pointer.
    if (stage && enabled && stageVisible && !document.hidden && !stage.matches(':hover') && !stage.contains(document.activeElement)) {
      stageTimer = setInterval(() => selectPhase((phase + 1) % 3), 6500);
    }
  }
  stage?.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => selectPhase(Number(button.dataset.step), true)));
  stage?.addEventListener('pointerenter', () => clearInterval(stageTimer));
  stage?.addEventListener('pointerleave', restartStage);
  stage?.addEventListener('focusin', () => clearInterval(stageTimer));
  stage?.addEventListener('focusout', () => setTimeout(restartStage, 0));

  const headings = [...document.querySelectorAll('main h1,main h2')].filter(h => h.textContent.trim());
  headings.forEach(heading => {
    const label = heading.innerText.replace(/\s+/g,' ').trim();
    heading.setAttribute('aria-label',label);
    const walker = document.createTreeWalker(heading,NodeFilter.SHOW_TEXT);
    const nodes = []; while(walker.nextNode()) nodes.push(walker.currentNode);
    let index = 0;
    nodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(word => {
        if (!word.trim()) { fragment.append(document.createTextNode(word)); return; }
        const clip = document.createElement('span'); clip.className = 'word-clip'; clip.setAttribute('aria-hidden','true');
        const inner = document.createElement('span'); inner.className = 'motion-word'; inner.textContent = word;
        inner.style.setProperty('--word-delay',`${Math.min(index++ * 40,440)}ms`);
        clip.append(inner); fragment.append(clip);
      });
      node.replaceWith(fragment);
    });
  });
  const objects = [...document.querySelectorAll('.work-card,.press-card,.founder-photo,.portfolio-cover,.skills-grid article,.process li,.partnership-grid>a,.intro-layout>div,.service-list details,.workflow,.stats,.contact-grid>div')];
  objects.forEach((element,index) => {
    element.classList.add('reveal-object');
    element.style.setProperty('--reveal-delay',`${Math.min((index % 4)*60,180)}ms`);
  });
  document.querySelectorAll('.process li,.mobile-menu>a').forEach((element,index) => element.style.setProperty('--step',index % 6));
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('heading-pending','reveal-pending');
        observer.unobserve(entry.target);
      });
    },{threshold:.08,rootMargin:'0px 0px -24px 0px'});
    [...headings,...objects].forEach(element => {
      if (enabled) element.classList.add(headings.includes(element)?'heading-pending':'reveal-pending');
      observer.observe(element);
    });
    if (stage) new IntersectionObserver(entries => {
      stageVisible = entries[0].isIntersecting;
      stage.classList.toggle('stage-offscreen',!stageVisible); restartStage();
    },{threshold:0}).observe(stage);
  }
  // Keyboard focus must never land in an unrevealed section.
  document.addEventListener('focusin', event => {
    const element = event.target.closest('.reveal-pending');
    element?.classList.remove('reveal-pending');
  });

  const cursor = document.createElement('div'); cursor.className = 'buzz-cursor'; cursor.setAttribute('aria-hidden','true');
  cursor.innerHTML = '<span></span>'; body.append(cursor);
  const dots = Array.from({length:4},() => {
    const dot = document.createElement('i'); dot.className = 'cursor-point'; dot.setAttribute('aria-hidden','true'); body.append(dot); return {element:dot,x:0,y:0};
  });
  let targetX = 0, targetY = 0, cursorX = 0, cursorY = 0, pointerSeen = false, magnet;
  function stopPointer() {
    cancelAnimationFrame(frame); frame = 0; pointerSeen = false;
    cursor.classList.remove('is-visible'); dots.forEach(dot => dot.element.style.opacity = '0');
    if (magnet) { magnet.style.removeProperty('--magnet-x'); magnet.style.removeProperty('--magnet-y'); magnet = null; }
  }
  function drawPointer() {
    frame = 0;
    if (!enabled || document.hidden || !finePointer.matches || !pointerSeen) return;
    cursorX += (targetX-cursorX)*.2; cursorY += (targetY-cursorY)*.2;
    cursor.style.transform = `translate3d(${cursorX}px,${cursorY}px,0) translate(-50%,-50%)`;
    let x = cursorX, y = cursorY;
    let moving = Math.abs(targetX-cursorX)+Math.abs(targetY-cursorY) > .2;
    dots.forEach((dot,index) => {
      dot.x += (x-dot.x)*.25; dot.y += (y-dot.y)*.25;
      const distance = Math.abs(dot.x-targetX)+Math.abs(dot.y-targetY);
      moving ||= distance > .5;
      dot.element.style.transform = `translate3d(${dot.x}px,${dot.y}px,0)`;
      dot.element.style.opacity = distance > 3 ? String(.45-index*.09) : '0';
      x = dot.x; y = dot.y;
    });
    if (moving) frame = requestAnimationFrame(drawPointer);
  }
  document.addEventListener('pointermove', event => {
    if (!enabled || !finePointer.matches || event.pointerType === 'touch') return;
    targetX = event.clientX; targetY = event.clientY;
    if (!pointerSeen) { cursorX=targetX;cursorY=targetY;dots.forEach(dot=>{dot.x=targetX;dot.y=targetY});pointerSeen=true; }
    const interactive = event.target.closest('a,button,summary,input,select,textarea');
    const project = event.target.closest('.project-open');
    cursor.classList.toggle('is-visible',!event.target.closest('input,select,textarea,dialog'));
    cursor.classList.toggle('is-link',Boolean(interactive)); cursor.classList.toggle('is-project',Boolean(project));
    cursor.querySelector('span').textContent = project?'VIEW':'';
    const nextMagnet = event.target.closest('.btn,.source-link');
    if (magnet && magnet !== nextMagnet) { magnet.style.removeProperty('--magnet-x');magnet.style.removeProperty('--magnet-y'); }
    magnet = nextMagnet;
    if (magnet) {
      const rect = magnet.getBoundingClientRect();
      magnet.style.setProperty('--magnet-x',`${(targetX-rect.left-rect.width/2)*.08}px`);
      magnet.style.setProperty('--magnet-y',`${(targetY-rect.top-rect.height/2)*.13}px`);
    }
    if (stage && stageVisible) {
      const rect = stage.getBoundingClientRect();
      const x = Math.max(-1,Math.min(1,(targetX-rect.left)/rect.width*2-1));
      const y = Math.max(-1,Math.min(1,(targetY-rect.top)/rect.height*2-1));
      stage.style.setProperty('--stage-x',`${x*5}deg`);stage.style.setProperty('--stage-y',`${-y*4}deg`);
      stage.style.setProperty('--light-x',`${50+x*25}%`);stage.style.setProperty('--light-y',`${50+y*25}%`);
    }
    if (!frame) frame=requestAnimationFrame(drawPointer);
  },{passive:true});
  document.documentElement.addEventListener('pointerleave',stopPointer);
  window.addEventListener('blur',stopPointer);
  finePointer.addEventListener('change',stopPointer);

  function applyPreference() {
    enabled = !reduced.matches && !userPaused;
    body.classList.toggle('motion-active',enabled);body.classList.toggle('motion-paused',!enabled);
    toggle.disabled = reduced.matches;
    toggle.setAttribute('aria-pressed',String(enabled));
    toggle.setAttribute('aria-label',reduced.matches?'Animations reduced by your device settings':enabled?'Pause animations':'Enable animations');
    toggle.querySelector('span').textContent = reduced.matches?'Reduced motion':enabled?'Motion on':'Motion off';
    if (!enabled) {
      document.querySelectorAll('.heading-pending,.reveal-pending').forEach(element=>element.classList.remove('heading-pending','reveal-pending'));
      document.getAnimations().filter(animation=>animation.effect?.target?.closest?.('.stage-story')).forEach(animation=>animation.finish());
      stopPointer();
    }
    restartStage();
  }
  toggle.addEventListener('click', () => {
    userPaused=!userPaused;try{localStorage.setItem('tsb-motion',userPaused?'paused':'running')}catch{}
    applyPreference();
  });
  reduced.addEventListener('change',applyPreference);
  document.addEventListener('visibilitychange', () => {
    body.classList.toggle('motion-sleep',document.hidden);
    if (document.hidden) stopPointer(); restartStage();
  });
  applyPreference();

  let scrollFrame = 0;
  function updateProgress() {
    scrollFrame=0; const available=document.documentElement.scrollHeight-innerHeight;
    progress.style.transform=`scaleX(${available>0?Math.min(1,Math.max(0,scrollY/available)):0})`;
  }
  window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateProgress)},{passive:true});
  window.addEventListener('resize',updateProgress,{passive:true});updateProgress();

  function clearNavigation() {
    clearTimeout(navigationTimer);clearTimeout(recoveryTimer);navigating=false;shutter.classList.remove('leaving');
  }
  document.addEventListener('click', event => {
    if (!enabled || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link=event.target.closest('a[href]');
    if (!link || link.target || link.hasAttribute('download') || link.closest('dialog')) return;
    const url=new URL(link.href,location.href);
    if (url.origin !== location.origin || !['http:','https:'].includes(url.protocol) || url.pathname===location.pathname) return;
    event.preventDefault(); if(navigating)return; navigating=true;
    shutter.classList.add('leaving');stopPointer();
    try{sessionStorage.setItem('tsb-arrival','1')}catch{}
    navigationTimer=setTimeout(()=>{location.assign(url.href)},560);
    recoveryTimer=setTimeout(clearNavigation,3500);
  });
  try {
    if(sessionStorage.getItem('tsb-arrival')) {sessionStorage.removeItem('tsb-arrival');if(enabled)body.classList.add('page-arrival');}
  }catch{}
  window.addEventListener('pageshow',clearNavigation);
  window.addEventListener('pagehide',()=>{clearNavigation();clearInterval(stageTimer);stopPointer();});
  window.addEventListener('pageshow',restartStage);
})();
