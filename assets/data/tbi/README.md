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

## Diffusion MRI tracts (Part 1, `data-mode="dti"`)

Files: `brain/tracts.json` (manifest), `brain/tracts.bin` (base level, 3,031 streamlines, 146k points, ~454 kB, fetched for every DTI
figure) and `brain/tracts-hi.bin` (another 3,031 streamlines, ~452 kB, desktops only). Used by `assets/js/posts/tbi-brain-dti.js`, which
`tbi-brain-core.js` imports only for an element with `data-mode="dti"`.

**Source and licence.** "Advanced Atlas of 80 Bundles in MNI space", E. Garyfallidis, figshare, doi
[10.6084/m9.figshare.7375883.v2](https://doi.org/10.6084/m9.figshare.7375883.v2) (file `Atlas_80_Bundles.zip`, `bundles/*.trk`), licensed
**CC BY 4.0** (stated on the figshare record and in the archive's `LICENSE`). It is curated from the population-averaged HCP-842 tractography
atlas: Yeh F-C et al. 2018, "Population-averaged atlas of the macroscale human structural connectome and its network topology",
NeuroImage 178:57-68, doi 10.1016/j.neuroimage.2018.05.027 (diffusion MRI of 842 Human Connectome Project adults averaged into a template,
tracked, and labelled by neuroanatomists). Please cite Yeh et al. 2018 and Garyfallidis et al. 2018 (NeuroImage 170:283-295, doi
10.1016/j.neuroimage.2017.07.015) as the dataset asks. The streamlines are in MNI ICBM 2009a space (RAS mm; identity voxel-to-RAS in the .trk
header), the same space as the MNI152 2009 template and fsaverage surface used for the brain mesh above, so no registration was needed:
99.9% of the kept streamline points fall inside the MNI152 2009 brain mask, and screenshots show the tracts inside the cortex.

**What was kept.** Twelve displayed tracts (id: atlas files): 1-3 corpus callosum genu / body / splenium (`CC.trk`, split by where each
streamline crosses the midline: anterior 25% of the callosal extent = genu, posterior 20% = splenium, the rest = body; streamlines that do
not come within 3 mm of the midline dropped; an approximate geometric split, not the JHU labels); 4 corticospinal (`CST_L/R`); 5 corona
radiata and internal capsule, drawn with the fronto- and parieto-pontine tracts (`FPT_L/R`, `PPT_L/R`); 6 cingulum (`C_L/R`); 7 fornix
(`F_L_R`); 8 uncinate (`UF_L/R`); 9 inferior longitudinal (`ILF_L/R`); 10 inferior fronto-occipital (`IFOF_L/R`; the duplicate `IF0F_R` was
ignored); 11 superior longitudinal and arcuate (`SLF_L/R`, `AF_L/R`); 12 cerebellar peduncles (`MCP`, `ICP_L/R`, `SCP`).

**How it was built** (Python 3.13, nibabel 5.4, numpy, nilearn 0.14.1 for the mask check; script `build_tracts.py`, kept outside the repo):

1. Load each bundle with `nibabel.streamlines`; resample every streamline to a 2.4 mm step (4-255 points).
2. Drop streamlines shorter than 25 mm, those whose midpoint lies beyond the 95th percentile distance from the bundle's median midpoint,
   and those whose end points lie beyond the 97th percentile from the bundle's median end points (either orientation).
3. Randomly subsample (seed 1065) per file: e.g. 1,000 callosal streamlines (300 genu / 400 body / 300 splenium), 170 per corticospinal
   tract, 60-150 for the others; an equal, disjoint second sample forms `tracts-hi.bin`.
4. Convert MNI RAS to three.js axes (x, z, -y), as for `brain.bin`. Store per streamline: point count (uint8), tract id (uint8), first point
   (int16, 1/256 mm); then each later point as an int8 x3 delta in 1/32 mm, quantised with error feedback (max error 0.016 mm). The browser
   subtracts `brain.json`'s `centre`.

**What is literature-derived, and what is a toy.** The "Mild TBI findings" colours are not data from these tracts. Each tract is given one of
four levels by the author of the figure from published group studies: the number of publications reporting an anisotropy abnormality in the
matching ICBM-DTI-81 region in Eierud et al. 2014 (NeuroImage: Clinical 4:283-294, Table 2), Aoki et al. 2012's meta-analysis of the
corpus callosum (J Neurol Neurosurg Psychiatry 83:870-876) and Niogi et al. 2008 (AJNR 29:967-973). Most consistent: splenium (Aoki
significant; Eierud 5). Often reported: genu (Eierud 6; Aoki n.s.), corona radiata / internal capsule (anterior corona radiata 6, posterior
limb of internal capsule 5), uncinate (4), cingulum (4). Occasionally: callosal body (1; Aoki marginal), corticospinal (1), fornix (1 + 1),
ILF/IFOF (sagittal stratum 2), SLF (2). Rarely: cerebellar peduncles (MCP 1, SCP 1, ICP 0). The "Rotational strain (toy)" view colours
tracts with the same toy model as the `impact`/`shear` figures (`tbi-brain-sim.js`); per-point sensitivity follows the toy's ordering
(grey-white junction x lever arm, scaled down with depth; corpus callosum within 22 mm of the midline; brainstem), with a per-streamline
random tolerance. It is an illustration, not a measurement. The FA explainer uses illustrative eigenvalues (1.7 and 0.3 x 10^-3 mm^2/s for
healthy white matter) and the standard FA formula (Pierpaoli & Basser 1996, Magn Reson Med 36:893-906).

Not used: FSL's JHU ICBM-DTI-81 and JHU tractography atlases and the FMRIB58_FA template (FSL's licence restricts commercial use and their
redistribution terms were not needed once a CC BY source was available); no FA map is shipped.
