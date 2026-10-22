# A Comprehensive Federated Learning Survey Website

This project is a website for a comprehensive survey of Federated Learning (FL). It aims to bring together visual explanations, detailed concept notes, paper summaries, and source references in a research knowledge bank supporting PhD research in FL, secure FL, and its applications.

The website will explain the major dimensions of FL, including aggregation methods, data and client heterogeneity, training procedures, communication, privacy, security, evaluation, and applications. Explanations will connect to the papers from which they were developed.

## Immediate goal

Build a visual prototype, beginning with a detailed study of aggregation and FedAvg. Develop each concept through intuition, mathematical definitions, worked examples, assumptions, limitations, and references before moving to the next topic.

The initial prototype targets one fully developed concept. Comprehensive coverage is the long-term objective.

## Long-term goal

Extend the source bank into an interactive tool where users can select aggregation methods, datasets, client counts, and training settings, then run reproducible simulations and compare outcomes.

## Research approach

- Use surveys to map the field and original papers to establish algorithm details and research claims.
- Distinguish published findings, interpretations, illustrative examples, and results from our own experiments.
- Attach sources and relevant sections or pages to substantive explanations.
- Record assumptions, experimental configurations, and limitations alongside results.

## Reference library

The [ref-papers](ref-papers/) folder contains downloaded reading copies. Its [reference index](ref-papers/README.md) records source links, versions, and reading guidance.

## Current status

Research planning and reference collection are underway. A Markdown-based visual prototype is available in [website/](website/README.md), built with MkDocs and a custom interactive cylinder interface. It uses placeholder text while the survey content is developed. The simulator has not yet been implemented.
