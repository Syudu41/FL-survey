# FL Fieldnotes — visual prototype

A local MkDocs prototype for the comprehensive FL survey website. Select one of five cylinder layers, open a concept, then move through its reading sections. The text is deliberately placeholder content, not a completed survey.

## Run

From the repository root:

```sh
python3 -m venv website/.venv
website/.venv/bin/pip install -r website/requirements.txt
website/.venv/bin/mkdocs serve -f website/mkdocs.yml
```

Open the URL printed by MkDocs (normally http://127.0.0.1:8000).

## Edit the content

Edit [docs/index.md](docs/index.md). MkDocs converts Markdown to HTML; the custom theme turns that rendered content into the interactive atlas. Concept text is not embedded in the template or JavaScript.

- `## Dimension {#stable-id}` creates a cylinder layer.
- `### Concept {#stable-id}` creates an item in that layer's concept panel.
- `#### Section title` creates a reading step. Each concept needs at least one section.
- Paragraphs immediately after a dimension or concept heading provide its description.
- Normal Markdown supports paragraphs, lists, links, tables, and blockquotes inside steps.

For this short prototype all content lives in one Markdown file. As the survey grows, separate concept pages can replace this initial structure.

## Build for GitHub Pages

Published URL: https://syudu41.github.io/FL-survey/

The workflow in `.github/workflows/pages.yml` builds and publishes `website/site/` when website files change on `main`. It can also be run manually from GitHub Actions. GitHub Pages uses GitHub Actions as its publishing source.

```sh
website/.venv/bin/mkdocs build --strict -f website/mkdocs.yml
```

The generated static website is in `website/site/`. Relative asset paths support the GitHub Pages repository subpath. The generated `site/` folder and local virtual environment are ignored; GitHub Actions builds from the source files.

## Implementation

The custom MkDocs theme lives in `theme/main.html`. Styles and interactions live in `docs/assets/`. The cylinder uses CSS surfaces rather than a WebGL dependency. Feature transitions, staggered concept reveals, and the concept reader run in the browser. Native buttons and dialogs provide keyboard interaction; reduced-motion preferences disable animation. Typography uses Arial with Helvetica Neue, Helvetica, and sans-serif fallbacks; no fonts are downloaded.

The repository-root `index.html` redirects directly to `website/site/index.html` after a local build. On GitHub Pages, publish the built MkDocs output as described above; its own index is the website entry point.
