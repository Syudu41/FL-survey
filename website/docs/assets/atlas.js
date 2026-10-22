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
let popoverAnimation;
let lastSelected;
const popover = document.querySelector('#concept-popover');
const cylinder = document.querySelector('#cylinder');
for (const [index, item] of dimensions.entries()) {
  const button = document.createElement('button');
  button.className = 'layer';
  button.innerHTML = `<span class="layer-number">${String(index + 1).padStart(2, '0')}</span><span class="layer-name"></span><span class="layer-arrow" aria-hidden="true">↗</span>`;
  button.querySelector('.layer-name').textContent = item.title;
  button.setAttribute('aria-controls', 'concept-popover');
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
  const entries = document.querySelector(`#concept-source [data-dimension="${item.id}"]`);
  document.querySelector('#concept-heading').textContent = item.title;
  document.querySelector('#concept-links').replaceChildren(...[...entries.children].map(link => link.cloneNode(true)));
  popover.hidden = false;
  document.querySelector('.object-area').classList.add('expanded');
  [...cylinder.children].forEach((button, i) => button.setAttribute('aria-expanded', String(i === index)));
  if (!reducedMotion.matches) {
    popoverAnimation?.cancel();
    popoverAnimation = popover.animate([
      { opacity: 0, transform: 'perspective(900px) rotateY(-75deg) translateX(-35px)' },
      { opacity: 1, transform: 'perspective(900px) rotateY(0) translateX(0)' }
    ], { duration: 650, easing: 'cubic-bezier(.16,1,.3,1)' });
    document.querySelectorAll('#concept-links a').forEach((link, i) => link.animate([
      { opacity: 0, transform: 'translateX(-15px)' },
      { opacity: 1, transform: 'translateX(0)' }
    ], { duration: 400, delay: 130 + i * 80, fill: 'backwards', easing: 'ease-out' }));
  }
}
function closeConcepts() {
  popover.hidden = true;
  document.querySelector('.object-area').classList.remove('expanded');
  [...cylinder.children].forEach(button => button.setAttribute('aria-expanded', 'false'));
  lastSelected?.focus();
}
document.querySelector('#close-concepts').addEventListener('click', closeConcepts);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !popover.hidden) closeConcepts();
});
const selected = dimensions.findIndex(item => `#${item.id}` === location.hash);
selectDimension(selected < 0 ? 0 : selected, false);
