'use strict';

document.querySelectorAll('img[data-fallback]').forEach(image => {
  const fallback = () => {
    if (!image.dataset.fallback) return;
    image.src = image.dataset.fallback;
    delete image.dataset.fallback;
  };
  image.addEventListener('error', fallback, {once:true});
  if (image.complete && !image.naturalWidth) fallback();
});

const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const main = document.querySelector('main');
const footer = document.querySelector('footer');
function setMenu(open, restoreFocus = false) {
  if (!mobileMenu || !menuToggle) return;
  mobileMenu.classList.toggle('open', open);
  mobileMenu.inert = !open;
  mobileMenu.setAttribute('aria-hidden', String(!open));
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.classList.toggle('menu-open', open);
  if (main) main.inert = open;
  if (footer) footer.inert = open;
  if (open) mobileMenu.querySelector('a').focus();
  else if (restoreFocus) menuToggle.focus();
}
menuToggle?.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open'), true));
mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  setMenu(false);
  const destination = new URL(link.href);
  if (destination.pathname === location.pathname && destination.hash) {
    const target = document.getElementById(destination.hash.slice(1));
    if (target) { target.tabIndex = -1; target.focus({preventScroll:true}); }
  }
}));
document.addEventListener('keydown', event => {
  if (!mobileMenu?.classList.contains('open')) return;
  if (event.key === 'Escape') setMenu(false, true);
  if (event.key === 'Tab') {
    const lastLink = mobileMenu.querySelector('a:last-of-type');
    if (event.shiftKey && document.activeElement === menuToggle) {
      event.preventDefault(); lastLink.focus();
    } else if (!event.shiftKey && document.activeElement === lastLink) {
      event.preventDefault(); menuToggle.focus();
    }
  }
});
matchMedia('(min-width: 861px)').addEventListener('change', event => {
  if (event.matches) setMenu(false);
});

const projects = JSON.parse(document.getElementById('portfolio-data')?.textContent || '[]');
const categories = {realestate:'Real estate',lifestyle:'Lifestyle',fashion:'Fashion & brands',recruitment:'Recruitment'};
const projectMap = new Map(projects.map(project => [project.id, project]));
const cards = [...document.querySelectorAll('.work-card')];
const filters = [...document.querySelectorAll('.filter')];
const filterResult = document.querySelector('.filter-result');
function filterWork(value, updateUrl = true) {
  filters.forEach(button => {
    const active = button.dataset.filter === value;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  cards.forEach(card => { card.hidden = value !== 'all' && card.dataset.category !== value; });
  document.querySelectorAll('.work-collection').forEach(collection => {
    collection.hidden = !collection.querySelector('.work-card:not([hidden])');
  });
  const count = cards.filter(card => !card.hidden).length;
  if (filterResult) filterResult.textContent = value === 'all' ? `Showing all ${count} projects` : `${count} ${count === 1 ? 'project' : 'projects'} · ${categories[value]}`;
  if (updateUrl && filters.length) {
    const url = new URL(location.href);
    if (value === 'all') url.searchParams.delete('category'); else url.searchParams.set('category', value);
    history.replaceState(null, '', url);
  }
}
filters.forEach(button => button.addEventListener('click', () => filterWork(button.dataset.filter)));
const initialCategory = new URLSearchParams(location.search).get('category');
if (filters.length && initialCategory && categories[initialCategory]) filterWork(initialCategory, false);

const viewer = document.querySelector('.project-viewer');
let currentId;
let galleryIds = [];
let opener;
function stopVideo() { viewer?.querySelector('iframe')?.remove(); }
function renderProject(id) {
  const project = projectMap.get(id);
  if (!viewer || !project) return;
  currentId = id;
  stopVideo();
  const media = viewer.querySelector('.viewer-media');
  const image = viewer.querySelector('#viewer-image');
  const play = viewer.querySelector('.viewer-play');
  const source = viewer.querySelector('.viewer-original');
  const roles = viewer.querySelector('.viewer-roles');
  media.classList.toggle('is-reel', project.format === 'reel');
  image.onerror = project.thumbnailFallback ? () => {
    image.onerror = null;
    image.src = project.thumbnailFallback;
  } : null;
  image.src = project.image;
  image.alt = `${project.title} — frame from Ammer Afaq’s portfolio`;
  image.hidden = false;
  viewer.querySelector('#viewer-title').textContent = project.title;
  viewer.querySelector('#viewer-category').textContent = `${categories[project.category]} / ${project.url ? project.format : 'Portfolio still'}`;
  viewer.querySelector('#viewer-description').textContent = project.description;
  roles.replaceChildren(...project.roles.map(role => {
    const label = document.createElement('span'); label.textContent = role; return label;
  }));
  source.hidden = !project.url;
  if (project.url) {
    source.href = project.url;
    source.replaceChildren(document.createTextNode(`Watch on ${project.platform} `));
    const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden','true'); source.append(arrow);
  } else source.removeAttribute('href');
  play.hidden = project.platform !== 'YouTube' || !project.url;
  viewer.querySelector('.viewer-count').textContent = `${String(galleryIds.indexOf(id) + 1).padStart(2, '0')} / ${String(galleryIds.length).padStart(2, '0')}`;
  viewer.scrollTop = 0;
}
function openProject(id, trigger) {
  galleryIds = cards.filter(card => !card.hidden).map(card => card.dataset.id);
  opener = trigger;
  renderProject(id);
  viewer.showModal();
  document.body.classList.add('modal-open');
  viewer.querySelector('.viewer-close').focus();
}
document.querySelectorAll('.project-open').forEach(button => {
  button.addEventListener('click', () => openProject(button.dataset.project, button));
});
viewer?.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
viewer?.addEventListener('close', () => {
  stopVideo(); document.body.classList.remove('modal-open');
  if (opener?.isConnected) opener.focus({preventScroll:true});
});
function advanceProject(delta) {
  const nextIndex = (galleryIds.indexOf(currentId) + delta + galleryIds.length) % galleryIds.length;
  renderProject(galleryIds[nextIndex]);
}
viewer?.querySelector('.viewer-prev').addEventListener('click', () => advanceProject(-1));
viewer?.querySelector('.viewer-next').addEventListener('click', () => advanceProject(1));
viewer?.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault(); advanceProject(event.key === 'ArrowRight' ? 1 : -1);
  }
});
viewer?.querySelector('.viewer-play').addEventListener('click', () => {
  const project = projectMap.get(currentId);
  const url = new URL(project.url);
  const id = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v');
  if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return;
  const iframe = document.createElement('iframe');
  iframe.title = project.title;
  iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.allowFullscreen = true;
  viewer.querySelector('#viewer-image').hidden = true;
  viewer.querySelector('.viewer-play').hidden = true;
  viewer.querySelector('.viewer-media').append(iframe);
});

const tabs = [...document.querySelectorAll('.workspace-tab')];
const panels = [...document.querySelectorAll('.workspace-panel')];
function selectTab(tab) {
  tabs.forEach(item => {
    const selected = item === tab;
    item.classList.toggle('active', selected);
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  panels.forEach(panel => panel.classList.toggle('active', panel.id === tab.dataset.panel));
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault(); selectTab(tabs[next]); tabs[next].focus();
  });
});

const form = document.querySelector('.project-form');
form?.addEventListener('submit', async event => {
  event.preventDefault();
  const submitButton = form.querySelector('[type="submit"]');
  const status = form.querySelector('.form-status');
  if (submitButton.disabled) return;
  submitButton.disabled = true; submitButton.textContent = 'Sending your brief…'; status.hidden = true;
  form.setAttribute('aria-busy','true');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch('/', {method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(form)).toString(),signal:controller.signal});
    if (!response.ok) throw new Error('Submission failed');
    location.assign(form.action);
  } catch (error) {
    status.textContent = error.name === 'AbortError' ? 'We could not confirm your submission. Please try again or email thesocialbuzz@gmail.com.' : 'Your brief could not be sent. Please try again or email thesocialbuzz@gmail.com.';
    status.hidden = false;
  } finally {
    clearTimeout(timeout); submitButton.disabled = false; submitButton.textContent = 'Send project brief ↗'; form.removeAttribute('aria-busy');
  }
});
