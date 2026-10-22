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
const cylinder = document.querySelector('#cylinder');
for (const [index, item] of dimensions.entries()) {
  const button = document.createElement('button');
  button.className = 'layer';
  button.innerHTML = `<span class="layer-number">${String(index + 1).padStart(2, '0')}</span><span class="layer-name"></span><span class="layer-arrow" aria-hidden="true">↗</span>`;
  button.querySelector('.layer-name').textContent = item.title;
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
  if (animate && !reducedMotion.matches) {
    panelAnimation?.cancel();
    panelAnimation = document.querySelector('#feature-panel').animate([
      { opacity: 0, transform: 'translateY(12px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 400, easing: 'cubic-bezier(.16,1,.3,1)' });
  }
}
const selected = dimensions.findIndex(item => `#${item.id}` === location.hash);
selectDimension(selected < 0 ? 0 : selected, false);
