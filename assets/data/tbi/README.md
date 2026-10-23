# TBI series data

Data files used by the three-part traumatic brain injury series. Each section describes one group of files.

## Comorbidity networks (Part 3)

Files: `networks.json`, `cohort.json`, `pairs.json`, `phi-matrix-mild-y5.json`.

**Source.** TBIMS National Database public-use files (Form 1 and Form 2, release dated 2021-10-06), Traumatic Brain Injury Model Systems
Program, used by Kaustav Mehta under the TBIMS data-use agreement. The original analysis code was a 2022 Jupyter notebook
(`CoMorb_Updated.ipynb`). For these files every network was rebuilt from the raw public-use files in Python (pandas, networkx 3.x). The
rebuild matches the author's 2022 precomputed matrices exactly.

**Privacy.** These files hold aggregates only: correlation and test statistics, network measures, and counts. There is no row-level data, no
identifiers and no dates. Any count below 11 is replaced by `null`, and the percentage and confidence interval that would reveal it are left
out. Where a count is shown, its complement is also at least 11. Example contingency tables are only exported for pairs whose four cells
are all at least 11. The raw files, notebooks and Gephi exports are not in this repository.

**Cohort.**

- Form 1 records with `AGEnoPHI >= 16`. The age codes 777 and 999 are dropped.
- `GCSTot` from 14 to 15. The code sets mild as `13 < GCS <= 15`, so GCS 13 counts as moderate, although the thesis and papers describe mild
  as 13-15. Non-score GCS codes (77, 88, 99) are excluded.
- These rules give n = 4,775. The Form 2 record at `FollowUpPeriod == 5` holds 2,856 rows.
- Only 225 of those people answered the NHANES-style comorbidity module, because it was only asked in interviews from 2017 to 2019. Pairwise
  tables use the people who answered both questions, so N ranges from 126 to 220.

**Network construction.** Each of the 25 or 26 comorbidities is a node. For each pair of comorbidities:

- A 2x2 table counts "yes" answers only when the reported onset code is 2 or 3 (at the time of or after the injury). "No" answers are not
  filtered by onset.
- phi is calculated from that table.
- `thesis-mild-y5` (2023 thesis): t = phi·sqrt(2N−2)/sqrt(1−phi²). The notebook adds up all four margins, which gives 2N rather than the N
  in the thesis equation. An edge is drawn if t ≥ 2.920, and its weight is phi. This reproduces thesis Table 3: 25 nodes, 69 edges, average
  degree 5.52, average weighted degree 1.43, assortativity 0.38 (reported as 0.37), average path length 2.31, diameter 5, density 0.23.
  The average clustering of 0.42 is the mean over nodes with degree ≥ 2 (`avgClusteringDeg2`). The networkx mean over all nodes is 0.38.
- `bmc-*-y5` (Mehta & Sudhakar 2025, _BMC Neurology_): 26 comorbidities, adding "other heart conditions". t = |phi|·sqrt(N−2)/sqrt(1−phi²),
  and an edge is drawn when t exceeds the one-tailed critical t at p < 0.01 with N−2 degrees of freedom. The weight is |phi|. No negative
  association reaches significance.
- The young/old split uses **age at injury** (Form 1 `AGEnoPHI` ≤ 50 / > 50). The paper's supplement says age at follow-up, but only the
  split by age at injury reproduces the published clusters.
- The published removed-node lists (Table S1) and all 19 published clusters (Figs 4, 6 and 8) are reproduced exactly.
- `supp-*` networks are exploratory and go beyond the papers. They cover mild, moderate and severe TBI at follow-up years 1, 2, 5, 10 and
  15, built with the thesis method. `edgesWithBmcMethod` gives the edge count under the BMC rule. In the notebook's bands, moderate is GCS
  9-13 and severe is GCS 3-8.

**Vertex-betweenness clustering** (Camarillo-Ramirez 2020, thesis Algorithm 1). The steps are:

1. Drop isolated nodes.
2. Repeatedly remove the node with the highest normalised betweenness, recalculating betweenness after every removal, while that maximum is
   above a threshold.
3. Take the connected components of what is left.
4. Re-attach each removed node to every component it had an edge to.

A threshold between 0.0458 and 0.0468 reproduces all four published removal lists at once (thesis, all, old, young). Thesis Table 4
publishes something different. For each of the six removed nodes, it lists that node and all its neighbours (its ego network). The
`clusters` field of `thesis-mild-y5` reproduces Table 4, and `algorithmClusters` holds what the algorithm itself returns.

**Measures** (networkx):

| Measure                     | How it is calculated                                                   |
| --------------------------- | ---------------------------------------------------------------------- |
| `betweenness`               | normalised betweenness centrality, on the graph without isolated nodes |
| `eigenvector`               | unweighted eigenvector centrality, on the graph without isolated nodes |
| `degreeCentrality`          | degree / (n − 1), on the graph without isolated nodes                  |
| `clustering`                | local clustering coefficient                                           |
| `triangles`                 | number of triangles through the node                                   |
| `weightedDegree`            | sum of edge weights                                                    |
| `avgPathLength`, `diameter` | over reachable pairs                                                   |

`randomReference` gives the mean clustering and mean path length of 500 random graphs with the same numbers of nodes and edges, as a
small-world comparison. The layout (`x`, `y` in [0, 1], y pointing down) is a Kamada-Kawai layout of the union of the four published
networks, relaxed slightly (20%) for each network, so that nodes stay in place when the reader switches networks. Isolated nodes keep their
shared position.

**Prevalence** (`cohort.json`, node `prevalence`):

- Node prevalence is yes / (yes + no) with any onset.
- `cohort.json` also gives "after injury" prevalence (onset at or after the injury, over all respondents), which is the definition used by
  Sudhakar et al. 2023 (_Frontiers in Human Neuroscience_). It also gives "before injury" prevalence.
- Both carry 95% Wilson intervals, for the whole cohort and by age (at injury and at follow-up), and by sex.
- The Frontiers paper keeps the two age codes, which gives n = 228. On that cohort, all 26 "same time or after" counts and all 26 "before"
  counts in its Table 1 are reproduced exactly.
- Sex code 1 is female and 2 is male.
- Cause-of-injury codes are grouped as follows:

  | Codes         | Group            |
  | ------------- | ---------------- |
  | 1-5           | vehicle          |
  | 21            | pedestrian       |
  | 19            | fall             |
  | 10-12         | violence         |
  | 13-18         | sports           |
  | 20            | struck by object |
  | anything else | other/unknown    |

**Caveats.**

- The study has no control group, which is why the papers stress association, not causation.
- The sample is small: 225 people overall, with 91 young and 134 old.
- The cohort is people who were hospitalised and then had inpatient rehabilitation.
- There are 325 tests per network with no multiple-comparison correction.
- The onset rule makes N differ from pair to pair.
