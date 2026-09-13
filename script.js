'use strict';

// Keep content visible when scripting or motion is unavailable.
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('reveal-pending');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => {
    if (element.getBoundingClientRect().top >= innerHeight) {
      element.classList.add('reveal-pending');
      observer.observe(element);
    }
  });
}

const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const pageSections = [document.querySelector('main'), document.querySelector('footer')];
function setMenu(open, restoreFocus = false) {
  mobileMenu.classList.toggle('open', open);
  mobileMenu.inert = !open;
  mobileMenu.setAttribute('aria-hidden', String(!open));
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.classList.toggle('menu-open', open);
  pageSections.forEach(section => { section.inert = open; });
  if (open) mobileMenu.querySelector('a').focus();
  else if (restoreFocus) menuToggle.focus();
}
menuToggle.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open'), true));
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  setMenu(false);
  const target = document.querySelector(link.getAttribute('href'));
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}));
document.addEventListener('keydown', event => {
  if (!mobileMenu.classList.contains('open')) return;
  if (event.key === 'Escape') setMenu(false, true);
  if (event.key === 'Tab') {
    const lastLink = mobileMenu.querySelector('a:last-child');
    if (event.shiftKey && document.activeElement === menuToggle) {
      event.preventDefault(); lastLink.focus();
    } else if (!event.shiftKey && document.activeElement === lastLink) {
      event.preventDefault(); menuToggle.focus();
    }
  }
});
matchMedia('(min-width: 951px)').addEventListener('change', event => {
  if (event.matches) setMenu(false);
});

const filters = [...document.querySelectorAll('.filter')];
const projects = [...document.querySelectorAll('.project')];
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(filter => {
    const selected = filter === button;
    filter.classList.toggle('active', selected);
    filter.setAttribute('aria-pressed', String(selected));
  });
  projects.forEach(project => {
    project.hidden = button.dataset.filter !== 'all' && project.dataset.category !== button.dataset.filter;
    if (!project.hidden) project.classList.remove('reveal-pending');
  });
}));

const contentDetails = {
  realestate: {
    description: 'Property films and advisor-led content that help people understand the space, the location and the person behind the listing.',
    steps: [
      ['THE BRIEF', 'Start with the property.', 'We align on the property, audience, key selling points and the assets you need.'],
      ['THE DIRECTION', 'Give the story a point of view.', 'A shot list and clear talking points keep the film focused and your delivery natural.'],
      ['THE SHOOT', 'Make every frame count.', 'Interior details, movement and on-camera guidance bring the property to life.'],
      ['THE DELIVERY', 'Ready for your channels.', 'Property films, reels and photography are delivered to the formats agreed in your brief.']
    ],
    service: 'Content Production'
  },
  founder: {
    description: 'Put your expertise in front of the camera with clear ideas, a natural voice and direction that helps you feel comfortable on screen.',
    steps: [
      ['THE BRIEF', 'Find what you want to say.', 'We agree on the subjects, audience and purpose of the content.'],
      ['THE DIRECTION', 'Keep it in your voice.', 'Talking points and on-camera coaching help you communicate clearly.'],
      ['THE SHOOT', 'Build confidence on camera.', 'We guide pacing, delivery and framing throughout the session.'],
      ['THE DELIVERY', 'A consistent visual presence.', 'Edited reels or longer videos with captions, sound and graphics within the agreed scope.']
    ],
    service: 'Monthly Content'
  },
  food: {
    description: 'Food, atmosphere and the people behind the experience. Reels and photography for restaurants, cafés and hospitality brands.',
    steps: [
      ['THE BRIEF', 'Choose the experience.', 'A new menu, a launch or a content session starts with a clear list of priorities.'],
      ['THE DIRECTION', 'Set the mood.', 'We plan the food, details and moments that tell the story of your venue.'],
      ['THE SHOOT', 'Capture the atmosphere.', 'Food close-ups, preparation and the space itself give the content its character.'],
      ['THE DELIVERY', 'Built around your brief.', 'Reels, stills and campaign formats are delivered according to the agreed plan.']
    ],
    service: 'Creative Campaign'
  },
  brand: {
    description: 'Product photography and brand films shaped around the details, materials and character that make your product distinctive.',
    steps: [
      ['THE BRIEF', 'Understand the product.', 'We align on the audience, intended channels and what the visuals need to communicate.'],
      ['THE DIRECTION', 'Create a visual language.', 'References, styling and lighting give the shoot a coherent direction.'],
      ['THE SHOOT', 'Focus on the details.', 'Still photography, close-ups and motion bring texture and character into the frame.'],
      ['THE DELIVERY', 'One clear set of assets.', 'Final images and films are prepared for the placements and formats in the agreed scope.']
    ],
    service: 'Photography / Brand Visuals'
  }
};
const modal = document.querySelector('.case-modal');
let activeProject;
function openProject(project) {
  activeProject = project;
  const details = contentDetails[project.dataset.category];
  modal.querySelector('.modal-title').textContent = project.dataset.project;
  modal.querySelector('.lead').textContent = details.description;
  const steps = modal.querySelector('.modal-steps');
  steps.replaceChildren();
  details.steps.forEach(([label, title, description], index) => {
    const article = document.createElement('article');
    [['b', `${String(index + 1).padStart(2, '0')} · ${label}`], ['h3', title], ['p', description]].forEach(([tag, text]) => {
      const element = document.createElement(tag);
      element.textContent = text;
      article.append(element);
    });
    steps.append(article);
  });
  modal.showModal();
  modal.scrollTop = 0;
  document.body.classList.add('modal-open');
}
projects.forEach(project => {
  project.addEventListener('click', () => openProject(project));
  project.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); openProject(project);
    }
  });
});
modal.querySelector('.modal-close').addEventListener('click', () => modal.close());
modal.addEventListener('close', () => document.body.classList.remove('modal-open'));
modal.querySelector('.modal-cta').addEventListener('click', () => {
  document.querySelector('[name="service"]').value = contentDetails[activeProject.dataset.category].service;
  modal.close();
  document.querySelector('[name="name"]').focus({ preventScroll: true });
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
  panels.forEach(panel => { panel.classList.toggle('active', panel.id === tab.dataset.panel); });
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
const submitButton = form.querySelector('[type="submit"]');
const formStatus = form.querySelector('.form-status');
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (submitButton.disabled) return;
  formStatus.hidden = true;
  submitButton.disabled = true;
  submitButton.textContent = 'Sending your brief…';
  form.setAttribute('aria-busy', 'true');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString(),
      signal: controller.signal
    });
    if (!response.ok) throw new Error('Submission failed');
    window.location.assign(form.action);
  } catch (error) {
    formStatus.textContent = error.name === 'AbortError'
      ? 'We could not confirm your submission. Please try again or email thesocialbuzz@gmail.com.'
      : 'Your brief could not be sent. Please try again or email thesocialbuzz@gmail.com.';
    formStatus.hidden = false;
  } finally {
    clearTimeout(timeout);
    submitButton.disabled = false;
    submitButton.textContent = 'Send project brief ↗';
    form.removeAttribute('aria-busy');
  }
});
