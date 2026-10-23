# FL Fieldnotes — survey website

A MkDocs website for a comprehensive federated learning survey. Selecting a dimension magnifies its layer into a cylinder showing up to five clickable concept names. With more than five concepts, arrow controls rotate the horizontal 3D ring by one face, looping through all names. A wireframe border outlines the cylinder. All dimensions or Escape returns to the stack. Explore all opens the generated full listing.

The FL introduction and FedAvg page contain introductory, sourced content. Other concept pages remain placeholders. FedAvg includes a full-participation averaging equation and an arithmetic example; it is not yet a complete literature review or experiment.

## Run locally

From the repository root:

```sh
python3 -m venv website/.venv
website/.venv/bin/pip install -r website/requirements.txt
website/.venv/bin/mkdocs serve -f website/mkdocs.yml
```

Open the URL printed by MkDocs, normally http://127.0.0.1:8000.

## Add concepts automatically

Create a Markdown file under `docs/dimensions/<dimension>/`. You can also create a nested folder with a `README.md`. No navigation edits or front matter are required:

```markdown
# My new concept

A brief description for the concept listing.

## Details

Write the explanation and cite the sources here.
```

On the next MkDocs rebuild, the document appears in both the cylinder and Explore all. GitHub Actions rebuilds when the change is pushed. Each page gets its dimension breadcrumb automatically.

Optional YAML front matter supports `title`, `description`, and numeric `order`. The title otherwise comes from the first `# Heading` (or filename); the description comes from its first ordinary paragraph. Concepts sort by `order`, then title. `draft: true` keeps a concept out of the cylinder and listing. README documents are published at `readme-note.html` within their folder so they can coexist with an index page.

- `docs/index.md` contains the homepage and dimension descriptions.
- `docs/dimensions/<dimension>/index.md` contains the dimension introduction. Its concept listing is generated automatically; do not manually add concept links.
- All other `.md` files in that dimension, including nested files, are discovered as concepts.

`hooks.py` discovers documents and supplies both navigation views. `theme/main.html` controls the page structure. Styles and interactions are in `docs/assets/`. Fonts use Arial with Helvetica Neue and Helvetica fallbacks. The cylinder is drawn in CSS; keyboard arrows and reduced-motion preferences are supported.

## Mathematics

LaTeX math is preserved by `pymdownx.arithmatex` and rendered by MathJax 3.2.2. Use `$w_t$` for inline notation and a separate `$$` block for an equation:

```text
$$
w_{t+1} = \sum_{k=1}^{K} \frac{n_k}{n} w_{t+1}^{(k)}
$$
```

MathJax loads automatically on pages containing math (or with `math: true` in front matter). The renderer is loaded from jsDelivr, so rendered equations require a network connection. Markdown content stays local. After a requirements change, reinstall with `website/.venv/bin/pip install -r website/requirements.txt` from the repository root.

## Publishing

Live URL: https://syudu41.github.io/FL-survey/

The workflow in `.github/workflows/pages.yml` builds and publishes the site when website files change on `main`. It can also run manually from GitHub Actions.

```sh
website/.venv/bin/mkdocs build --strict -f website/mkdocs.yml
```

The generated website is in `website/site/`, which is ignored by Git. The repository-root `index.html` redirects to this folder for local use after building. GitHub Pages publishes the built output directly, so the public homepage opens without this local redirect.

Motion reference: [David DeSandro’s horizontal 3D carousel](https://3dtransforms.desandro.com/carousel). Concept names replace image panels.

Homepage visual reference: [Database Loading by Reijo](https://dribbble.com/shots/26897580-Database-Loading). Its glass edges and internal lighting are adapted to the dimension cylinder; the original artwork is not embedded.
