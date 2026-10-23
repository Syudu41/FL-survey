# Website status and architecture

Updated: **2026-10-23**. Source reviewed from base commit **`136a77f`** and updated for the introductory FedAvg, mathematics, and FL introduction implementation. This is a session handoff snapshot; check the working tree and latest commits before continuing.

## Purpose and priorities

Sudarshan Balaji's PhD resource bank for a comprehensive survey of Federated Learning, secure FL, and applications. The website connects visual navigation, concept explanations, and research sources. It will be shown to the advisor, so presentation quality matters.

- Immediate research focus: understand aggregation methods thoroughly, beginning with FedAvg. Cover intuition, equations, examples, assumptions, limitations, and original sources before advancing.
- Current product: a visual prototype with a sourced FL introduction and introductory FedAvg note; other concept notes remain placeholders.
- Long-term plan: a reproducible simulator with selectable methods, datasets, client counts, and training settings. **No simulator or model training is implemented.**
- Communication preference: concise responses unless detail is requested.

## Repository and publishing

| Item | Value |
| --- | --- |
| Repository | https://github.com/Syudu41/FL-survey |
| Main branch | `main` |
| Public website | https://syudu41.github.io/FL-survey/ |
| Website source | `website/` |
| Build configuration | `website/mkdocs.yml` |
| Generated output | `website/site/` — ignored by Git |
| Deployment workflow | `.github/workflows/pages.yml` |

The previous glass-layer redesign was deployed and verified on 2026-10-22. The 2026-10-23 update adds the matching light backdrop, math rendering, FedAvg note, and FL introduction; check the latest GitHub Actions run for its release status.

GitHub Actions builds and deploys on pushes to `main` affecting `website/**` or the workflow file. It also supports manual dispatch. Changes only to this root status file do not trigger deployment. The workflow installs Python 3.12 and the requirements, runs a strict MkDocs build, uploads `website/site/`, and deploys to the `github-pages` environment.

The repository-root `index.html` redirects to `website/site/index.html` for local use after a build. Public hosting serves the generated site directly. This is a project Pages site, separate from the owner's personal Pages site.

## Current experience

1. **Homepage:** project introduction on the left; a cylinder of selectable dimensions on the right. Header reads only **Federated Learning**. Footer credits Sudarshan and MkDocs/HTML/CSS/JavaScript.
2. **Dimension click:** updates its description and Explore all destination, then magnifies the layer into a full-screen native HTML dialog.
3. **Concept carousel:** names arranged horizontally around an outlined 3D cylinder. Up to five are visible; additional concepts enable Previous/Next and keyboard arrows. Navigation loops through the concepts. A name opens its detail page. All dimensions or Escape closes the dialog.
4. **Introduction:** a section below the homepage cylinder links to `about.html`, covering participants, a training round, and privacy limitations with sources.
5. **Explore all:** opens a separate dimension page listing all concepts with brief descriptions. Each entry opens a separate detail page with breadcrumbs.

There is deliberately **no “5 visible · 6 concepts” label**. Do not restore it. Smaller dimensions display their available names and disable the rotation arrows.

| Dimension folder | Current concepts |
| --- | --- |
| `aggregation` | FedAvg; Robust aggregation; Coordinate-wise median; Trimmed mean; Krum; Geometric median |
| `data` | IID & non-IID; Sample imbalance |
| `participation` | Client selection; Availability |
| `privacy` | Differential privacy; Secure aggregation |
| `security` | Poisoning; Threat models |

The added aggregation documents demonstrate overflow navigation. Their presence does not mean the methods have been studied or their summaries completed. All concept pages except FedAvg still contain placeholder notes. FedAvg now includes a sourced introductory explanation, full-participation equation, symbol table, and worked arithmetic example; it is not a completed survey or reproduction.

## Architecture

**Static MkDocs 1.6.1 + custom Jinja theme + plain CSS and JavaScript + Arithmatex/MathJax for equations.** No backend, database, accounts, React, Three.js, WebGL, or runtime Markdown fetch is used. Fonts are Arial, with Helvetica Neue/Helvetica/sans-serif fallbacks. Rendering and animation run in the browser.

```text
Markdown files + optional YAML metadata
                │
                ▼
hooks.py: discover concepts, infer metadata, generate listings
                │
                ▼
MkDocs Markdown renderer + theme/main.html
                │
                ▼
website/site/: HTML + CSS + JavaScript
                │
                ▼
GitHub Pages → browser cylinder and concept navigation
```

| File/path | Responsibility |
| --- | --- |
| `website/docs/about.md` | Sourced introduction to FL |
| `website/docs/assets/math-config.js` | MathJax configuration for normalized Arithmatex delimiters |
| `website/docs/index.md` | Homepage introduction; dimension headings, descriptions, IDs, and listing links |
| `website/docs/dimensions/<slug>/index.md` | Dimension introduction; concept list appended during build |
| Other `.md` files below that dimension | Concept content, including nested documents and READMEs |
| `website/hooks.py` | File discovery, metadata defaults, README aliases, automatic listings |
| `website/theme/main.html` | Shared shell; home, dimension, and concept layouts; full-screen carousel dialog |
| `website/docs/assets/atlas.js` | Homepage dimension parsing, layer buttons, zoom, carousel rotation, keyboard handling |
| `website/docs/assets/atlas.css` | Responsive layouts; homepage glass layers; carousel faces and cylinder outline |
| `website/requirements.txt` | Pins `mkdocs==1.6.1` and `pymdown-extensions==10.16.1`; transitive packages are not separately pinned |
| `website/assets/workflow.svg` | Workflow image embedded in the root README; outside the MkDocs content directory |
| `website/preview-desktop.png` | Saved preview image, not a runtime dependency |
| `ref-papers/` | Local paper library and reference index; outside the generated website |

### Build hooks and browser data

- `on_config` scans dimension folders containing a root `index.md`, then recursively discovers their other `*.md` files. It extracts title, summary, and optional metadata into `config.extra.dimension_concepts`.
- `on_files` publishes READMEs through generated `readme-note.md` aliases, avoiding MkDocs' normal README/index collision. Their output URL is `readme-note.html` in the same folder. That alias name must not already exist.
- `on_page_markdown` supplies default concept layout and breadcrumbs and appends concept links/descriptions to dimension indexes.
- The homepage template embeds rendered Markdown and concept links in hidden DOM containers. JavaScript uses these to construct the cylinder. Detail/listing pages render normally without JavaScript; the homepage has a no-JavaScript content fallback.
- `use_directory_urls: false` produces `.html` URLs. Templates use MkDocs' URL filter for the `/FL-survey/` project subpath.
- Carousel geometry uses CSS `rotateY`/`translateZ`, 30-degree steps, and a five-face front window. It is separate from the homepage's CSS glass-disc stack. Reduced-motion handling, focus restoration, native dialog dismissal, and responsive resizing are implemented.

## Content workflow

### Update or add a concept

Edit or create `website/docs/dimensions/<slug>/<concept>.md`, or a nested folder with a `README.md`:

```markdown
# Concept title

A brief description for the listing.

## Explanation

Notes, examples, equations, and source links.
```

No manual concept navigation entry is required. The next rebuild populates both the carousel and Explore all. Optional front matter:

```yaml
---
title: Optional title override
description: Optional summary override
order: 30
draft: false
---
```

Concepts sort by numeric `order` (default 1000), then title. `draft: true` omits the document from discovery/navigation; it is **not an access-control or unpublishing mechanism**. Title otherwise comes from the first H1 or filename; summary from the first ordinary paragraph. Layout and dimension breadcrumbs are inferred unless explicitly supplied.

### Add a dimension

New dimensions are **not fully automatic**. Create `website/docs/dimensions/communication/index.md` with its H1 and introduction, add concept documents, and register it in `website/docs/index.md`:

```markdown
## Communication {#communication}

How communication affects FL.

[Explore all](dimensions/communication/index.md)
```

The heading ID must match the folder slug. Homepage section order determines layer order. The new dimension inherits the common controls, styling, and automatic concept discovery. Do not manually duplicate concept lists in dimension indexes.

### Preview, build, and publish

From the repository root, create the environment once if missing:

```sh
python3 -m venv website/.venv
website/.venv/bin/pip install -r website/requirements.txt
```

Then:

```sh
source website/.venv/bin/activate
cd website
mkdocs serve                 # Builds and previews at http://127.0.0.1:8000
# Or: mkdocs build --strict   # Static output in website/site/
```

`serve` builds automatically; no separate build is needed before preview. From the repository root, publishing content changes means:

```sh
git add website
git commit -m "Update survey content"
git push origin main
```

Pushing, not committing alone, triggers deployment. Check the GitHub Actions result before calling a change live. Do not edit generated files. Do not depend on `/tmp` environments, browser scripts, or previous session processes surviving.

## Research direction and remaining design work

The priority is now real survey content. A proposed progression is a short overview of every dimension, followed by a detailed aggregation study beginning with FedAvg. This is a recommendation for discussion, not approval to populate all dimensions with unreviewed summaries. The initial FedAvg equation assumes full participation; sampling/dropout and their weighting convention need separate treatment.

The user requested removal of the black cylinder backdrop. It now matches the light page background, and layer text/edges have been recolored for contrast. The broader question of the cylinder's visual quality is not declared finished.

- Homepage visual reference: [Database Loading by Reijo](https://dribbble.com/shots/26897580-Database-Loading). Its inspected preview is a luminous glass-block composition, not a literal cylinder. The current CSS layers are an adaptation, not a reproduction.
- Concept-carousel reference: [David DeSandro's horizontal carousel](https://3dtransforms.desandro.com/carousel). Preserve horizontal arrangement, the outer cylinder outline, clickable names, automatic discovery, and the absence of a concept-count label. Earlier vertical lists and side pop-up panels were rejected.
- Other preferences: no green theme; Arial/system typography; no extra middle header title, Home header link, or “About the atlas” link; concise interface copy.

### Writing equations

Use `$...$` inline and a separate `$$...$$` block in Markdown. `pymdownx.arithmatex` preserves the notation; MathJax 3.2.2 renders SVG math in the browser. The theme loads it automatically for rendered math or `math: true` metadata. The JavaScript renderer comes from jsDelivr, so typeset equations currently require network access. This is math notation support, not a server-side LaTeX compiler.

## Limitations and validation

- The homepage copy says five dimensions and the template displays a fixed `01 — 05`. Additional dimensions require updating those labels. The fixed-height, clipped showcase also needs checking as layers are added; automatic discovery does not guarantee the expanded stack fits.
- Metadata parsing is intentionally simple, not a full semantic Markdown parser. Complex formatting may need explicit `title`/`description` values.
- Content is trusted repository Markdown rendered as HTML. There is no upload/editor API or untrusted-content sanitization pipeline.
- Source attribution is an intended editorial practice, not an automated claim-to-paper database. Local PDFs are not automatically copied into the website. Four PDFs are currently present; the Mahmud survey has a recorded source link but its download failed. See `ref-papers/README.md`.
- Configured extensions: `attr_list`, `tables`, and `pymdownx.arithmatex` in generic mode. A bibliography engine and automated claim-to-paper database are not implemented.
- Previous sessions passed strict MkDocs builds and ad hoc Chrome checks covering selections, horizontal rotation/looping, links, mobile bounds, and reduced motion. Automatic root/nested README discovery was also checked. There is no committed browser test suite. Those checks establish operation, not advisor-ready visual quality.
- The 2026-10-23 update passed a strict MkDocs build and Chrome checks for matching backgrounds, the below-cylinder introduction, introduction-to-FedAvg links, two display equations and multiple inline equations rendered to SVG, absence of math errors, and mobile overflow. These are ad hoc checks, not a committed test suite.

## Start a future session

1. Read this file, `website/README.md`, and the latest user instructions; inspect `git status` and recent commits.
2. Identify whether the task concerns homepage visuals, the concept carousel, research content, or discovery hooks. They are distinct parts.
3. Preserve existing user edits. Validate changes with a strict build and relevant browser checks; inspect actual screenshots for visual work.
4. When publishing is requested or within the ongoing authorized publishing scope, push the intended files and verify deployment. Refresh this status file after material architecture or status changes.
