---
layout: concept
order: 10
math: true
description: Understand sample-weighted model averaging through an equation and a two-client example.
dimension: Aggregation
dimension_url: dimensions/aggregation/index.html
---

# FedAvg

An introductory study of local training followed by sample-weighted model averaging. This is a starting point for our survey, not a completed reproduction of the paper.

## One training round

The server sends the same model to clients. Each client trains on its own data, then returns model parameters. The server averages them and begins another round. FedAvg combines local optimization with aggregation; the averaging equation alone does not describe the entire procedure. **Source:** McMahan et al., Section 2 and Algorithm 1, PDF pages 4–5. [Read the paper](https://proceedings.mlr.press/v54/mcmahan17a/mcmahan17a.pdf#page=4).

## The averaging equation

Assume all $K$ clients participate in this round:

$$
w_{t+1} = \sum_{k=1}^{K} \frac{n_k}{n}\,w_{t+1}^{(k)},
\qquad n = \sum_{j=1}^{K} n_j.
$$

| Symbol | Meaning |
| --- | --- |
| $t$ | Current communication round |
| $K$ | Number of participating clients, here the entire federation |
| $n_k$ | Training samples held by client $k$ |
| $n$ | Total training samples across those clients |
| $w_{t+1}^{(k)}$ | Client $k$'s parameter vector after local training |
| $w_{t+1}$ | Aggregated parameter vector for the next round |

The coefficient $n_k/n$ is the client's aggregation weight. These weights sum to one. Use compatible parameter vectors trained from the same starting model. **Source:** Section 2 and Algorithm 1 of the paper linked above.

This introductory equation uses **full participation**. Partial participation, unavailable clients, and the corresponding weighting convention need a separate treatment before implementation.

## A numerical example

Consider one scalar parameter, with these illustrative values:

| Client | Samples | Parameter after local training | Aggregation weight |
| --- | ---: | ---: | ---: |
| A | 100 | 2 | 0.25 |
| B | 300 | 6 | 0.75 |

$$
w_{t+1} = \frac{100}{400}\times 2 + \frac{300}{400}\times 6 = 5.
$$

Equal client weights would instead give $(2+6)/2=4$. Sample weighting gives the client with more samples a larger coefficient. Whether sample weighting fits the intended research objective is a question to examine, rather than a reason to assume larger clients are more trustworthy.

**This is our arithmetic illustration, not a reported experiment or evidence that accuracy improves.** For a vector, apply the same weighted sum to each coordinate.

## What still needs investigation

The paper explores local epochs, batch size, and client participation. Its results depend on experimental conditions; they do not establish that arbitrary model averaging always succeeds. See Section 2 and Figure 1 for the shared-initialization discussion.

Local data storage alone does not establish privacy: model updates can leak information. The paper itself notes this in Section 1, Privacy, PDF page 2. FedAvg's averaging rule also supplies no malicious-client filtering.

Before expanding this note, work through: the learning objective; local SGD; one complete round by hand; non-IID data; participation; communication costs; and a small reproducible experiment. Record claims with their source sections and keep our experiments distinct from published findings.

## Source

McMahan, Moore, Ramage, Hampson, and Agüera y Arcas. **Communication-Efficient Learning of Deep Networks from Decentralized Data.** AISTATS 2017, PMLR 54, 1273–1282. [Official publication](https://proceedings.mlr.press/v54/mcmahan17a.html). Reading copy: `ref-papers/mcmahan-2017-fedavg.pdf` in the repository. PDF page numbers above count from the first page of the PDF.
