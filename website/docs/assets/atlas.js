/* MkDocs renders the dimension descriptions and destinations from Markdown. */
const source = document.querySelector('#markdown-source');
const dimensions = [];
let dimension;
for (const node of source.children) {
  if (node.tagName === 'H2') {
    dimension = { id: node.id, title: node.textContent, description: '', href: '' };
    dimensions.push(dimension);
  } else if (dimension) {
    const link = node.querySelector('a');
    if (link) dimension.href = link.getAttribute('href');
    else dimension.description += node.outerHTML;
  }
}
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let panelAnimation;
let zoomAnimation;
let carouselIndex = 0;
let carouselTurn = 0;
const visibleLimit = 5;
let conceptLinks = [];
let lastSelected;
const viewer = document.querySelector('#dimension-view');
const world = document.querySelector('.drum-world');
const rotor = document.querySelector('#concept-rotor');
const cylinder = document.querySelector('#cylinder');
for (const [index, item] of dimensions.entries()) {
  const button = document.createElement('button');
  button.className = 'layer';
  button.innerHTML = `<span class="layer-number">${String(index + 1).padStart(2, '0')}</span><span class="layer-name"></span><span class="layer-arrow" aria-hidden="true">↗</span>`;
  button.querySelector('.layer-name').textContent = item.title;
  button.setAttribute('aria-controls', 'dimension-view');
  button.setAttribute('aria-expanded', 'false');
  button.addEventListener('click', () => selectDimension(index));
  cylinder.append(button);
}
function selectDimension(index, animate = true) {
  const item = dimensions[index];
  [...cylinder.children].forEach((button, i) => {
    button.classList.toggle('active', i === index);
    button.setAttribute('aria-pressed', String(i === index));
  });
  document.querySelector('#dimension-number').textContent = `DIMENSION ${String(index + 1).padStart(2, '0')} / ${String(dimensions.length).padStart(2, '0')}`;
  document.querySelector('#feature-title').textContent = item.title;
  document.querySelector('#feature-description').innerHTML = item.description;
  document.querySelector('#explore-all').setAttribute('href', item.href);
  history.replaceState(null, '', `#${item.id}`);
  if (animate) openConcepts(item, index);
  if (animate && !reducedMotion.matches) {
    panelAnimation?.cancel();
    panelAnimation = document.querySelector('#feature-panel').animate([
      { opacity: 0, transform: 'translateY(12px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 400, easing: 'cubic-bezier(.16,1,.3,1)' });
  }
}
function openConcepts(item, index) {
  lastSelected = cylinder.children[index];
  const origin = lastSelected.getBoundingClientRect();
  const entries = document.querySelector(`#concept-source [data-dimension="${item.id}"]`);
  document.querySelector('#concept-heading').textContent = item.title;
  conceptLinks = [...entries.children].map(link => link.cloneNode(true));
  carouselIndex = conceptLinks.length > visibleLimit ? 2 : 0;
  carouselTurn = 0;
  rotor.style.transition = 'none';
  rotor.replaceChildren();
  conceptLinks.forEach((link, i) => {
    link.className = 'rotating-concept';
    link.title = link.textContent;
    rotor.append(link);
  });
  viewer.showModal();
  document.body.classList.add('dimension-open');
  sizeCarousel();
  [...cylinder.children].forEach((button, i) => button.setAttribute('aria-expanded', String(i === index)));
  updateConcept();
  rotor.getBoundingClientRect();
  rotor.style.transition = '';
  if (!reducedMotion.matches) {
    zoomAnimation?.cancel();
    const target = world.getBoundingClientRect();
    const x = origin.left + origin.width / 2 - target.left - target.width / 2;
    const y = origin.top + origin.height / 2 - target.top - target.height / 2;
    zoomAnimation = world.animate([
      { transform: `translate(${x}px, ${y}px) scale(${origin.width / target.width}, ${origin.height / target.height}) rotate(-8deg)` },
      { transform: 'rotateX(-12deg)' }
    ], { duration: 850, easing: 'cubic-bezier(.16,1,.3,1)' });
    rotor.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 500, fill: 'backwards' });
  }
}
function sizeCarousel() {
  const radius = Math.round(world.clientWidth * .36);
  world.style.setProperty('--radius', `${radius}px`);
  world.style.setProperty('--diameter', `${radius * 2}px`);
  world.style.setProperty('--cell-width', `${Math.round(2 * radius * Math.tan(Math.PI / 12) * .91)}px`);
}
function updateConcept() {
  const total = conceptLinks.length;
  conceptLinks.forEach((link, i) => {
    // Keep five adjacent faces at the front of a twelve-sided cylinder.
    // Hidden faces recycle behind it as the ring turns, without moving rows.
    const offset = total <= visibleLimit
      ? i - (total - 1) / 2
      : ((i - carouselIndex + total + Math.floor(total / 2)) % total) - Math.floor(total / 2);
    const visible = total <= visibleLimit || Math.abs(offset) <= 2;
    link.hidden = false;
    link.classList.toggle('visible', visible);
    link.classList.toggle('front', Math.abs(offset) < .6);
    link.style.setProperty('--angle', `${(carouselTurn + offset) * 30}deg`);
    link.tabIndex = visible ? 0 : -1;
    link.setAttribute('aria-hidden', String(!visible));
  });
  rotor.style.transform = `translateZ(calc(-1 * var(--radius))) rotateY(${-carouselTurn * 30}deg)`;
  document.querySelectorAll('.rotation-controls button').forEach(button => button.disabled = total <= visibleLimit);
}
function rotateConcept(direction) {
  if (conceptLinks.length <= visibleLimit) return;
  carouselTurn += direction;
  carouselIndex = (carouselIndex + direction + conceptLinks.length) % conceptLinks.length;
  updateConcept();
}
document.querySelector('#close-concepts').addEventListener('click', () => viewer.close());
viewer.addEventListener('close', () => {
  zoomAnimation?.cancel();
  document.body.classList.remove('dimension-open');
  [...cylinder.children].forEach(button => button.setAttribute('aria-expanded', 'false'));
  lastSelected?.focus();
});
document.querySelector('#rotate-previous').addEventListener('click', () => rotateConcept(-1));
document.querySelector('#rotate-next').addEventListener('click', () => rotateConcept(1));
viewer.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    rotateConcept(event.key === 'ArrowRight' ? 1 : -1);
  }
});
new ResizeObserver(() => {
  if (viewer.open) {
    sizeCarousel();
    updateConcept();
  }
}).observe(world);
const selected = dimensions.findIndex(item => `#${item.id}` === location.hash);
selectDimension(selected < 0 ? 0 : selected, false);
