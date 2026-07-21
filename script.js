const introLoader = document.querySelector('.intro-loader');
const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-button');
const menu = document.querySelector('.nav-links');
const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = [...document.querySelectorAll('[role="tabpanel"]')];
const highlight = document.querySelector('.tab-highlight');
let previousScroll = window.scrollY;

const easing = 'cubic-bezier(.76, 0, .24, 1)';
const delay = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));
const finishIntro = () => {
  document.body.classList.remove('loading');
  introLoader.remove();
};

const playIntro = async () => {
  const logo = introLoader.querySelector('.intro-loader-logo');
  const outline = introLoader.querySelector('.intro-loader-outline');
  const letter = introLoader.querySelector('.intro-loader-letter');
  const pathLength = outline.getTotalLength();
  outline.style.strokeDasharray = String(pathLength);
  outline.style.strokeDashoffset = String(pathLength);
  window.setTimeout(() => logo.classList.add('mounted'), 10);

  if (!Element.prototype.animate) {
    await delay(3500);
    finishIntro();
    return;
  }

  await delay(300);
  await outline.animate({ strokeDashoffset: [pathLength, 0] }, { duration: 1500, easing, fill: 'forwards' }).finished;
  await letter.animate({ opacity: [0, 1] }, { duration: 700, easing, fill: 'forwards' }).finished;
  await delay(500);
  await logo.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.1)' }], { duration: 300, easing, fill: 'forwards' }).finished;
  await introLoader.animate({ opacity: [1, 0] }, { duration: 200, easing, fill: 'forwards' }).finished;
  finishIntro();
};

playIntro().catch(finishIntro);

document.querySelector('#year').textContent = new Date().getFullYear();

const closeMenu = () => {
  menu.classList.remove('open');
  menuButton.classList.remove('active');
  menuButton.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
};
menuButton.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuButton.classList.toggle('active', open);
  menuButton.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
});
menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

window.addEventListener('scroll', () => {
  const current = window.scrollY;
  header.classList.toggle('scrolled', current > 20);
  header.classList.toggle('hidden', current > previousScroll && current > 120 && !menu.classList.contains('open'));
  previousScroll = Math.max(current, 0);
}, { passive: true });

const activateTab = (tab, focus = false) => {
  tabs.forEach((item, index) => {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    panels[index].hidden = !active;
  });
  const index = tabs.indexOf(tab);
  highlight.style.transform = window.innerWidth <= 600 ? `translateX(${index * 120}px)` : `translateY(${index * 48}px)`;
  if (focus) tab.focus();
};
tabs.forEach((tab) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
    activateTab(tabs[(tabs.indexOf(tab) + direction + tabs.length) % tabs.length], true);
  });
});

const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
}), { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
