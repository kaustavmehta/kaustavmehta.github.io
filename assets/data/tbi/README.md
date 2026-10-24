# TBI series data

Data files used by the three-part traumatic brain injury series. Each section describes one group of files.

## Comorbidity networks (Part 3)

Files: `networks.json`, `cohort.json`, `pairs.json`, `phi-matrix-mild-y5.json`.

**Source.** TBIMS National Database public-use files (Form 1 and Form 2, release dated 2021-10-06), Traumatic Brain Injury Model Systems
Program, used by Kaustav Mehta under the TBIMS data-use agreement. Networks follow the methods of the 2023 undergraduate thesis and of
Mehta & Sudhakar 2025 (_BMC Neurology_), and were computed in Python (pandas, networkx 3.x).

**Privacy.** These files hold aggregates only: correlation and test statistics, network measures, and counts. There is no row-level data, no
identifiers and no dates. Any count below 11 is replaced by `null`, and the percentage and confidence interval that would reveal it are left
out. Where a count is shown, its complement is also at least 11. Example contingency tables are only exported for pairs whose four cells
are all at least 11. The raw files and analysis notebooks are not in this repository.

**Contents.**

- `networks.json`: the thesis network (`thesis-mild-y5`), the three published networks (`bmc-all-y5`, `bmc-old-y5`, `bmc-young-y5`) and a
  set of exploratory networks across severity and follow-up year (`supp-*`, beyond the papers). Each has nodes with network measures, edges
  with phi and t, global measures, clusters from vertex-betweenness clustering, and a shared layout (`x`, `y` in [0, 1]) so nodes stay in
  place when switching networks. `randomReference` gives the mean clustering and path length of 500 random graphs with the same numbers of
  nodes and edges.
- `cohort.json`: aggregated descriptives of the mild-TBI cohort (age, sex, cause of injury, follow-up) and condition prevalences with 95%
  Wilson intervals.
- `pairs.json`: example 2x2 tables for the phi explainer in Part 3.
- `phi-matrix-mild-y5.json`: phi and t for every pair of conditions in the five-year mild-TBI network.

**Measures** (networkx): normalised betweenness and unweighted eigenvector centrality (on the graph without isolated nodes), degree, local
clustering, triangles, weighted degree (sum of edge weights), and average path length and diameter over reachable pairs.

**Caveats.** Associations, not causation; self-reported conditions; a small sample of people who were hospitalised and had inpatient
rehabilitation; many pairs are tested, so some edges may be chance findings.

## 3D brain and skull (Part 1)

Files: `brain/brain.json` (manifest), `brain/brain.bin` (base geometry, ~1.08 MB), `brain/brain-hi.bin` (optional fsaverage6 refinement, ~430 kB,
fetched on desktops only). Used by `assets/js/posts/tbi-brain*.js`.

**Contents.** Quantised (int16, 1/256 mm) vertex positions in three.js coordinates (x = MNI x, y = MNI z, z = -MNI y), triangle indices, and
per-vertex attributes: region id (uint8), sulcal depth (uint8), distance and direction to the inner skull (uint8 in 0.1 mm, int8 x3), and
skull-base roughness (uint8). Meshes: left and right pial cortex (fsaverage5, 10,242 vertices each), hippocampus, amygdala, thalamus, basal
ganglia (caudate + putamen), corpus callosum, brainstem, cerebellum, lateral ventricles, the inner and outer surfaces of the skull, and 364
stylised fibre polylines. `brain-hi.bin` holds the 30,720 extra vertices per hemisphere of fsaverage6 (positions and sulcal depth only); the
browser rebuilds the triangles by subdividing fsaverage5 in a fixed edge order, because the fsaverage icosahedra are nested.

**Sources and licences.**

- Cortical surfaces and sulcal depth: FreeSurfer `fsaverage5` / `fsaverage6` (Fischl et al. 1999, Hum Brain Mapp 8:272-284), as distributed with
  nilearn 0.14 (`load_fsaverage`, `fetch_surf_fsaverage`). FreeSurfer licence (free to use and redistribute with attribution).
- Cortical regions: Destrieux atlas on fsaverage5 (Destrieux et al. 2010, NeuroImage 53:1-15), via `nilearn.datasets.fetch_atlas_surf_destrieux`;
  its 74 labels were grouped into 13 functional regions (see the mapping in the prep script below).
- Brain mask and template space: MNI ICBM152 2009a nonlinear symmetric template (Fonov et al. 2009 NeuroImage 47:S102; Fonov et al. 2011
  NeuroImage 54:313-327), bundled with nilearn. Copyright McConnell Brain Imaging Centre; free use with attribution.
- Deep structures: Harvard-Oxford subcortical atlas, max-prob thr25 1 mm (Frazier et al. 2005; Desikan et al. 2006; Makris et al. 2006;
  Goldstein et al. 2007), distributed with FSL (FSL licence, free for non-commercial use with attribution).
- Corpus callosum and corticospinal tract (used to route stylised fibres): Juelich histological atlas, max-prob thr25 1 mm (Eickhoff et al.
  2005 NeuroImage 25:1325-1335; Bürgel et al. 2006 NeuroImage 29:1092-1105), distributed with FSL.
- Cerebellum: voxels of the MNI152 brain mask below and behind the cerebrum that Harvard-Oxford leaves unlabelled (derived, approximate).

**What is derived or stylised.** The skull is not a skull segmentation. The inner table is the voxelised pial surface (plus cerebellum and
brainstem), closed with an 8 mm ball so it bridges sulci, then dilated 2.6 mm to leave a CSF gap; the sphenoid ridge is put back where the
closing filled the gap between frontal and temporal lobes (a rule-based, stylised placement). The outer table is a smoothed ~7 mm offset. The
foramen magnum is a cut where the brainstem exits. Skull-base "roughness" is a rule over position and orientation (floors of the anterior and
middle cranial fossae, sphenoid ridge). The fibre bundles are procedurally generated curves between atlas points (callosal fibres through the
Juelich corpus callosum, corticospinal fibres from motor cortex down the Juelich tract centreline into the brainstem, short U-fibres under the
cortex); they show where bundles run, not real tractography.

**How it was built.** Python 3.13 with nilearn 0.14.1, nibabel, scipy, scikit-image (marching cubes), trimesh (Taubin smoothing,
voxelisation) and fast-simplification (decimation), in a virtual environment outside the repo:

1. Load fsaverage5 pial and white surfaces, sulcal depth and the Destrieux labels; map labels to regions (temporal gyri anterior to MNI
   y = -12 become "anterior temporal"; prefrontal vertices anterior to y = 54 become "frontal pole").
2. Resample Harvard-Oxford and Juelich maps onto the MNI152 2009a 1 mm grid (nearest neighbour); build masks for each deep structure;
   Gaussian-smooth (sigma 1-1.2 mm), marching cubes, keep the largest component, decimate to 1.4-9k faces, Taubin-smooth.
3. Build the inner and outer skull masks as described above; marching cubes; decimate; cut the foramen.
4. For every brain surface vertex, find the nearest point on a dense sampling of the inner skull: store distance, direction and roughness.
5. Generate fibre polylines (Catmull-Rom curves resampled to 20-36 points).
6. For fsaverage6, subdivide each fsaverage5 triangle (edges in first-seen order a-b, b-c, c-a), match each edge midpoint to its fsaverage6
   vertex on the sphere (exact one-to-one match), and store those vertices' pial positions and sulcal depth.
7. Write everything as aligned little-endian typed arrays into the two `.bin` files, with offsets in `brain.json`.
