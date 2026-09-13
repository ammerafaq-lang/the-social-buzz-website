const revealObserver = new IntersectionObserver((entries)=>{entries.forEach((entry)=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}})},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

const menuToggle=document.querySelector('.menu-toggle');
const mobileMenu=document.querySelector('.mobile-menu');
menuToggle.addEventListener('click',()=>{const open=!mobileMenu.classList.contains('open');mobileMenu.classList.toggle('open',open);document.body.classList.toggle('menu-open',open);menuToggle.setAttribute('aria-expanded',open);mobileMenu.setAttribute('aria-hidden',!open)});
mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobileMenu.classList.remove('open');document.body.classList.remove('menu-open');menuToggle.setAttribute('aria-expanded','false');mobileMenu.setAttribute('aria-hidden','true')}));

const filters=[...document.querySelectorAll('.filter')];
const projects=[...document.querySelectorAll('.project')];
filters.forEach(btn=>btn.addEventListener('click',()=>{filters.forEach(b=>b.classList.remove('active'));btn.classList.add('active');const filter=btn.dataset.filter;projects.forEach((p)=>{p.hidden=filter!=='all'&&p.dataset.category!==filter;})}));

const modal=document.querySelector('.case-modal');
const modalTitle=document.querySelector('.modal-title');
const closeModal=()=>{modal.classList.remove('open');document.body.classList.remove('modal-open');modal.setAttribute('aria-hidden','true')};
const openModal=(project)=>{modalTitle.textContent=project.dataset.project;modal.classList.add('open');document.body.classList.add('modal-open');modal.setAttribute('aria-hidden','false');document.querySelector('.modal-close').focus()};
projects.forEach(p=>{p.addEventListener('click',()=>openModal(p));p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openModal(p)}})});
document.querySelector('.modal-close').addEventListener('click',closeModal);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal()}});

const tabs=[...document.querySelectorAll('.workspace-tab')];
const panels=[...document.querySelectorAll('.workspace-panel')];
tabs.forEach(tab=>tab.addEventListener('click',()=>{tabs.forEach(t=>t.classList.remove('active'));panels.forEach(p=>p.classList.remove('active'));tab.classList.add('active');document.getElementById(tab.dataset.panel).classList.add('active')}));

const orb=document.querySelector('.cursor-orb');
window.addEventListener('pointermove',(e)=>{orb.style.left=e.clientX+'px';orb.style.top=e.clientY+'px'});
