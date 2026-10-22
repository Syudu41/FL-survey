"""Supply homepage concept links from the dimension listing Markdown files."""
import re
from pathlib import Path


def on_config(config):
    docs = Path(config.docs_dir)
    dimensions = {}
    for listing in sorted((docs / 'dimensions').glob('*/index.md')):
        concepts = []
        for title, target in re.findall(
            r'^## \[([^\]]+)\]\(([^)]+\.md)\)\s*$',
            listing.read_text(),
            flags=re.MULTILINE,
        ):
            destination = listing.parent / target
            if not destination.is_file():
                raise ValueError(f'Missing concept page: {destination}')
            concepts.append({
                'title': title,
                'url': destination.relative_to(docs).with_suffix('.html').as_posix(),
            })
        dimensions[listing.parent.name] = concepts
    config.extra['dimension_concepts'] = dimensions
    return config
