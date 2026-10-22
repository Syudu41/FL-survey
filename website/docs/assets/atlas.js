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
  carouselIndex = 0;
  rotor.replaceChildren();
  conceptLinks.forEach((link, i) => {
    link.className = 'rotating-concept';
    link.title = link.textContent;
    rotor.append(link);
  });
  viewer.showModal();
  document.body.classList.add('dimension-open');
  world.style.setProperty('--radius', `${world.clientWidth / 2}px`);
  [...cylinder.children].forEach((button, i) => button.setAttribute('aria-expanded', String(i === index)));
  updateConcept();
  if (!reducedMotion.matches) {
    zoomAnimation?.cancel();
    const target = document.querySelector('.drum-shell').getBoundingClientRect();
    const x = origin.left + origin.width / 2 - target.left - target.width / 2;
    const y = origin.top + origin.height / 2 - target.top - target.height / 2;
    zoomAnimation = world.animate([
      { transform: `translate(${x}px, ${y}px) scale(${origin.width / target.width}, ${origin.height / target.height}) rotate(-8deg)` },
      { transform: 'translate(0, 0) scale(1) rotate(0)' }
    ], { duration: 850, easing: 'cubic-bezier(.16,1,.3,1)' });
    rotor.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 500, fill: 'backwards' });
  }
}
function updateConcept(direction = 0) {
  const count = Math.min(visibleLimit, conceptLinks.length);
  const rowHeight = innerWidth <= 760 ? 58 : 68;
  conceptLinks.forEach((link, i) => {
    link.getAnimations().forEach(animation => animation.cancel());
    const previousSlot = link.dataset.slot === undefined ? null : Number(link.dataset.slot);
    const slot = i - carouselIndex;
    const visible = slot >= 0 && slot < count;
    link.hidden = !visible;
    link.classList.toggle('visible', visible);
    link.tabIndex = visible ? 0 : -1;
    link.setAttribute('aria-hidden', String(!visible));
    if (!visible) {
      delete link.dataset.slot;
      return;
    }
    const offset = slot - (count - 1) / 2;
    const y = offset * rowHeight;
    const x = -Math.pow(offset, 2) * 5;
    const scale = 1 - Math.abs(offset) * .035;
    const target = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`;
    link.style.transform = target;
    link.dataset.slot = slot;
    if (direction && !reducedMotion.matches) {
      const start = previousSlot === null
        ? `translate(-50%, -50%) translate(${direction * 130}px, ${y + direction * rowHeight}px) rotateY(${direction * 65}deg) scale(.8)`
        : `translate(-50%, -50%) translate(${x}px, ${y + direction * rowHeight}px) scale(${scale})`;
      link.animate([
        { transform: start, opacity: previousSlot === null ? 0 : 1 },
        { transform: target, opacity: 1 }
      ], { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
  });
  document.querySelector('#rotation-position').textContent = conceptLinks.length
    ? `${carouselIndex + 1}–${carouselIndex + count} of ${conceptLinks.length}`
    : 'No concepts yet';
  document.querySelector('#rotate-previous').disabled = carouselIndex === 0;
  document.querySelector('#rotate-next').disabled = carouselIndex + count >= conceptLinks.length;
  if (direction && !reducedMotion.matches) {
    rotor.getAnimations().forEach(animation => animation.cancel());
    rotor.animate([
      { transform: `rotateY(${direction * -12}deg)` },
      { transform: 'rotateY(0deg)' }
    ], { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)' });
    document.querySelector('.drum-shell').animate([
      { backgroundPosition: `${direction * 50}px 0, 0 0, 0 0` },
      { backgroundPosition: '0 0, 0 0, 0 0' }
    ], { duration: 600, easing: 'ease-out' });
  }
}
function rotateConcept(direction) {
  const next = Math.max(0, Math.min(carouselIndex + direction, conceptLinks.length - visibleLimit));
  if (next === carouselIndex) return;
  carouselIndex = next;
  updateConcept(direction);
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
    world.style.setProperty('--radius', `${world.clientWidth / 2}px`);
    updateConcept();
  }
}).observe(world);
const selected = dimensions.findIndex(item => `#${item.id}` === location.hash);
selectDimension(selected < 0 ? 0 : selected, false);
