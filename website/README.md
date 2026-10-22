# FL Fieldnotes — survey website

A MkDocs website for a comprehensive federated learning survey. The homepage explains the project beside an interactive cylinder. Selecting a dimension shows its description and swings out a panel of concept names linking directly to detail pages. An **Explore all** link also opens the full listing. That link opens a concept listing; every concept has its own detail page and URL.

Concept details are still placeholder text. The homepage and dimension descriptions explain the intended scope.

## Run locally

From the repository root:

```sh
python3 -m venv website/.venv
website/.venv/bin/pip install -r website/requirements.txt
website/.venv/bin/mkdocs serve -f website/mkdocs.yml
```

Open the URL printed by MkDocs, normally http://127.0.0.1:8000.

## Edit Markdown content

- `docs/index.md`: the homepage introduction and cylinder dimensions. Each `## Dimension {#stable-id}` has a description and an `Explore all` Markdown link to its listing.
- `docs/dimensions/<dimension>/index.md`: concept links with brief descriptions.
- `docs/dimensions/<dimension>/<concept>.md`: the concept's detailed notes.

Front matter selects the page layout: `home`, `dimension`, or `concept`. Concept front matter specifies `dimension` and `dimension_url` for breadcrumb navigation. MkDocs converts all Markdown links to HTML links. Concept pages work without JavaScript; only the cylinder needs JavaScript.

The build hook `hooks.py` reads the concept links from dimension listing Markdown and supplies the homepage panels, so names and destinations have one source. The template is `theme/main.html`. Styles and cylinder interactions are in `docs/assets/`. Fonts use Arial with Helvetica Neue and Helvetica fallbacks. The cylinder is drawn in CSS, with keyboard-accessible buttons and reduced-motion support.

## Publishing

Live URL: https://syudu41.github.io/FL-survey/

The workflow in `.github/workflows/pages.yml` builds and publishes the site when website files change on `main`. It can also run manually from GitHub Actions.

```sh
website/.venv/bin/mkdocs build --strict -f website/mkdocs.yml
```

The generated website is in `website/site/`, which is ignored by Git. The repository-root `index.html` redirects to this folder for local use after building. GitHub Pages publishes the built output directly, so the public homepage opens without this local redirect.
