/* Content is parsed from MkDocs-rendered Markdown; this file owns interaction only. */
const $ = (selector) => document.querySelector(selector);
const dimensions = [];
let dimension, concept, step;
for (const node of $('#markdown-source').children) {
  if (node.tagName === 'H2') {
    dimension = { id: node.id, title: node.textContent, description: '', concepts: [] };
    dimensions.push(dimension); concept = null; step = null;
  } else if (dimension && node.tagName === 'H3') {
    concept = { id: node.id, title: node.textContent, description: '', steps: [] };
    dimension.concepts.push(concept); step = null;
  } else if (concept && node.tagName === 'H4') {
    step = { title: node.textContent, html: '' }; concept.steps.push(step);
  } else if (step) step.html += node.outerHTML;
  else if (concept) concept.description += node.outerHTML;
  else if (dimension) dimension.description += node.outerHTML;
}

let activeDimension = 0;
let activeConcept = 0;
let activeStep = 0;
let panelAnimation;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const dialog = $('#reader');

dimensions.forEach((item, index) => {
  const button = document.createElement('button');
  button.className = 'layer';
  button.style.setProperty('--layer-index', index);
  button.innerHTML = `<span class="layer-number">${String(index + 1).padStart(2, '0')}</span><span class="layer-name"></span><span class="layer-arrow">↗</span>`;
  button.querySelector('.layer-name').textContent = item.title;
  button.addEventListener('click', () => selectDimension(index));
  $('#cylinder').append(button);
});

function selectDimension(index, animate = true) {
  activeDimension = index;
  const item = dimensions[index];
  document.querySelectorAll('.layer').forEach((button, i) => {
    button.classList.toggle('active', i === index);
    button.setAttribute('aria-pressed', String(i === index));
  });
  $('#dimension-number').textContent = `DIMENSION ${String(index + 1).padStart(2, '0')} / ${String(dimensions.length).padStart(2, '0')}`;
  $('#feature-title').textContent = item.title;
  $('#feature-description').innerHTML = item.description;
  $('#concept-count').textContent = String(item.concepts.length).padStart(2, '0');
  $('#concepts').replaceChildren();
  item.concepts.forEach((entry, i) => {
    const button = document.createElement('button');
    button.className = 'concept';
    button.style.setProperty('--concept-index', i);
    button.innerHTML = `<span class="concept-index">${String(i + 1).padStart(2, '0')}</span><span class="concept-copy"><strong></strong><span class="concept-description"></span></span><span class="concept-arrow">↗</span>`;
    button.querySelector('strong').textContent = entry.title;
    button.querySelector('.concept-description').innerHTML = entry.description;
    button.addEventListener('click', () => openConcept(i));
    $('#concepts').append(button);
  });
  if (animate && !reducedMotion.matches) {
    panelAnimation?.cancel();
    panelAnimation = $('#feature-panel').animate([
      { opacity: 0, transform: 'translateX(24px) scale(.98)', filter: 'blur(5px)' },
      { opacity: 1, transform: 'translateX(0) scale(1)', filter: 'blur(0)' }
    ], { duration: 550, easing: 'cubic-bezier(.16,1,.3,1)' });
  }
}

function openConcept(index) {
  activeConcept = index;
  const item = dimensions[activeDimension];
  const entry = item.concepts[index];
  $('#reader-breadcrumb').textContent = `${item.title} / ${entry.title}`;
  $('#reader-title').textContent = entry.title;
  $('#step-tabs').replaceChildren();
  entry.steps.forEach((section, i) => {
    const button = document.createElement('button');
    button.textContent = `${String(i + 1).padStart(2, '0')} ${section.title}`;
    button.addEventListener('click', () => selectStep(i));
    $('#step-tabs').append(button);
  });
  selectStep(0);
  dialog.showModal();
  document.body.classList.add('reading');
  if (!reducedMotion.matches) $('.reader-shell').animate([
    { opacity: 0, transform: 'translateY(35px) scale(.96)' },
    { opacity: 1, transform: 'translateY(0) scale(1)' }
  ], { duration: 550, easing: 'cubic-bezier(.16,1,.3,1)' });
}

function selectStep(index) {
  const sections = dimensions[activeDimension].concepts[activeConcept].steps;
  activeStep = index;
  $('#step-content').innerHTML = `<h3></h3>${sections[index].html}`;
  $('#step-content h3').textContent = sections[index].title;
  $('#step-counter').textContent = `FIELDNOTE ${String(index + 1).padStart(2, '0')} / ${String(sections.length).padStart(2, '0')}`;
  [...$('#step-tabs').children].forEach((button, i) => {
    button.classList.toggle('active', i === index);
    if (i === index) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  $('#previous').disabled = index === 0;
  $('#next').disabled = index === sections.length - 1;
  if (!reducedMotion.matches) $('#step-content').animate([
    { opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }
  ], { duration: 350, easing: 'ease-out' });
  $('#step-content').scrollTop = 0;
}

$('.close-reader').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => document.body.classList.remove('reading'));
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
$('#previous').addEventListener('click', () => selectStep(activeStep - 1));
$('#next').addEventListener('click', () => selectStep(activeStep + 1));
selectDimension(0, false);
