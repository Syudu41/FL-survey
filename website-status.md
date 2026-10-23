# Website status and architecture

Updated: **2026-10-23**. Source reviewed at commit **`136a77f`** (`Restyle homepage cylinder with illuminated glass layers`). This is a session handoff snapshot; check the working tree and latest commits before continuing.

## Purpose and priorities

Sudarshan Balaji's PhD resource bank for a comprehensive survey of Federated Learning, secure FL, and applications. The website connects visual navigation, concept explanations, and research sources. It will be shown to the advisor, so presentation quality matters.

- Immediate research focus: understand aggregation methods thoroughly, beginning with FedAvg. Cover intuition, equations, examples, assumptions, limitations, and original sources before advancing.
- Current product: a published visual prototype with placeholder concept notes.
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

The latest redesign was deployed and its public homepage verified in the previous session on 2026-10-22. This documentation update inspected local sources; it did not recheck the live deployment.

GitHub Actions builds and deploys on pushes to `main` affecting `website/**` or the workflow file. It also supports manual dispatch. Changes only to this root status file do not trigger deployment. The workflow installs Python 3.12 and the requirements, runs a strict MkDocs build, uploads `website/site/`, and deploys to the `github-pages` environment.

The repository-root `index.html` redirects to `website/site/index.html` for local use after a build. Public hosting serves the generated site directly. This is a project Pages site, separate from the owner's personal Pages site.

## Current experience

1. **Homepage:** project introduction on the left; a cylinder of selectable dimensions on the right. Header reads only **Federated Learning**. Footer credits Sudarshan and MkDocs/HTML/CSS/JavaScript.
2. **Dimension click:** updates its description and Explore all destination, then magnifies the layer into a full-screen native HTML dialog.
3. **Concept carousel:** names arranged horizontally around an outlined 3D cylinder. Up to five are visible; additional concepts enable Previous/Next and keyboard arrows. Navigation loops through the concepts. A name opens its detail page. All dimensions or Escape closes the dialog.
4. **Explore all:** opens a separate dimension page listing all concepts with brief descriptions. Each entry opens a separate detail page with breadcrumbs.

There is deliberately **no “5 visible · 6 concepts” label**. Do not restore it. Smaller dimensions display their available names and disable the rotation arrows.

| Dimension folder | Current concepts |
| --- | --- |
| `aggregation` | FedAvg; Robust aggregation; Coordinate-wise median; Trimmed mean; Krum; Geometric median |
| `data` | IID & non-IID; Sample imbalance |
| `participation` | Client selection; Availability |
| `privacy` | Differential privacy; Secure aggregation |
| `security` | Poisoning; Threat models |

The added aggregation documents demonstrate overflow navigation. Their presence does not mean the methods have been studied or their summaries completed. Concept pages still contain lorem ipsum and explicit placeholder notices.

## Architecture

**Static MkDocs 1.6.1 + custom Jinja theme + plain CSS and JavaScript.** No backend, database, accounts, React, Three.js, WebGL, or runtime Markdown fetch is used. Fonts are Arial, with Helvetica Neue/Helvetica/sans-serif fallbacks. Rendering and animation run in the browser.

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
| `website/docs/index.md` | Homepage introduction; dimension headings, descriptions, IDs, and listing links |
| `website/docs/dimensions/<slug>/index.md` | Dimension introduction; concept list appended during build |
| Other `.md` files below that dimension | Concept content, including nested documents and READMEs |
| `website/hooks.py` | File discovery, metadata defaults, README aliases, automatic listings |
| `website/theme/main.html` | Shared shell; home, dimension, and concept layouts; full-screen carousel dialog |
| `website/docs/assets/atlas.js` | Homepage dimension parsing, layer buttons, zoom, carousel rotation, keyboard handling |
| `website/docs/assets/atlas.css` | Responsive layouts; homepage glass layers; carousel faces and cylinder outline |
| `website/requirements.txt` | Pins `mkdocs==1.6.1`; transitive packages are not separately pinned |
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

## Open design issue — next work

**The latest homepage design is not accepted as finished.** The user identified a mismatch between its background and cylinder. The agreed assessment was that the dark rectangular panel feels pasted onto the light page and the object still resembles thin floating discs rather than a substantial glass structure. This was acknowledged but has not been fixed.

- Selected homepage reference: [Database Loading by Reijo](https://dribbble.com/shots/26897580-Database-Loading). Its inspected preview is a luminous glass-block composition, not a literal cylinder. Earlier recommendations incorrectly described it as a cylinder. The current homepage only approximates its glass edges and internal light.
- The next redesign needs a coherent scene, geometry, and lighting. Do not describe the current approximation as a faithful reproduction or a completed redesign.
- The separately selected concept-carousel reference is [David DeSandro's horizontal carousel](https://3dtransforms.desandro.com/carousel). Preserve the horizontal arrangement, outer cylinder outline, clickable names, and automatic content discovery. Earlier vertical lists and side pop-up panels were explicitly rejected.
- Other established preferences: no green theme; simple Arial/system typography; no extra middle header title, Home header link, or “About the atlas” link; concise interface copy.

## Limitations and validation

- The homepage copy says five dimensions and the template displays a fixed `01 — 05`. Additional dimensions require updating those labels. The fixed-height, clipped showcase also needs checking as layers are added; automatic discovery does not guarantee the expanded stack fits.
- Metadata parsing is intentionally simple, not a full semantic Markdown parser. Complex formatting may need explicit `title`/`description` values.
- Content is trusted repository Markdown rendered as HTML. There is no upload/editor API or untrusted-content sanitization pipeline.
- Source attribution is an intended editorial practice, not an automated claim-to-paper database. Local PDFs are not automatically copied into the website. Four PDFs are currently present; the Mahmud survey has a recorded source link but its download failed. See `ref-papers/README.md`.
- The only configured Markdown extensions are `attr_list` and `tables`. No dedicated equation renderer or bibliography engine is configured yet.
- Previous sessions passed strict MkDocs builds and ad hoc Chrome checks covering selections, horizontal rotation/looping, links, mobile bounds, and reduced motion. Automatic root/nested README discovery was also checked. There is no committed browser test suite. Those checks establish operation, not advisor-ready visual quality.
- No new build/browser checks were run for this documentation-only update. At inspection, the working tree was clean.

## Start a future session

1. Read this file, `website/README.md`, and the latest user instructions; inspect `git status` and recent commits.
2. Identify whether the task concerns homepage visuals, the concept carousel, research content, or discovery hooks. They are distinct parts.
3. Preserve existing user edits. Validate changes with a strict build and relevant browser checks; inspect actual screenshots for visual work.
4. When publishing is requested or within the ongoing authorized publishing scope, push the intended files and verify deployment. Refresh this status file after material architecture or status changes.
