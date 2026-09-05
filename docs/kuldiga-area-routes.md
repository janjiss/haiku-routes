# Established walks in Kurzeme — geometry and overlap audit

Updated 2026-09-05. Search expanded to all of Kurzeme at the user’s request. New additions must be established published routes, 3–10 km long, that
add ground absent from the catalog. Do not treat renamed, shortened, or reversed
versions of existing tracks as new routes.

## Corrected earlier additions

The first addition used a name/ID check, which was insufficient. A full geometry
comparison found these redundant variants and they have been removed:

| Removed variant | Existing source route | Candidate path shared |
| --- | --- | ---: |
| Kazdangas parka mazais loks | latvia_kurzeme_109_kazdangas-parka-dabas-taka.gpx | 99.62% (5,278.8 m) |
| Spāres meža pastaiga | latvia_kurzeme_108_olimpiskais-pargajiens-spare.gpx | 100% (5,379.7 m) |

The original Kazdanga and Spāre routes remain. Žibgrava and the Kuldīga Venta
walk were excluded from this discovery pass as obvious/existing choices.

## Current additions and removal

Snēpeles mežu pastaiga was removed at the user's request. Its source GPX and
published route `sn-peles-me-u-pastaiga-turp-un-atpaka_xs34` must be absent.

### Ugāles gravas (TAK-Ugāle) — established trail

- 5.915 km, a loop through wooded ravines with village sections
  and road crossings. Start 57.275189, 22.034265, about 34 km straight-line
  distance from Kuldīga, not driving distance.
- Trail existence, marking and approximately 6 km length confirmed by
  [Ventspils municipality](https://ventspilsnovads.lv/aktualitates/ugale-atklata-labiekartota-pastaigu-taka/).
- Geometry: all 267 coordinates of the public GeoShape `line` on
  [Zaiga Kaire's published Outdooractive track](https://www.outdooractive.com/en/route/hiking-trail/ventspils-novads/ugales-gravas-ugales-taka/227161290/),
  retrieved 2026-09-05. This is the page's public track representation, not
  the login-gated full GPX export. No added coordinates, interpolation,
  map-matched substitutions, guessed joins or elevation estimates.
- Maximum segment 113.88 m (p90 45.54 m); no >150 m segment or strict outlier.
  Visual comparison with public OSM roads and streams shows a coherent loop.
  Original small spurs and the 26.0 m start/end gap are preserved.
  GPX SHA-256: `ecd39aa0c68714ec4115eefeaaa85e2c6cf90b27898ecd80261918954b1eb724`.
- Full geometry comparison with all 413 other source GPXs: **0 m / 0%**
  overlap within 25 m. Audit includes Riežupe and every regional filename prefix.
- This was the first qualifying addition toward the requested ten. Six further
  additions are documented below.

### Riežupes meža pastaiga (turp un atpakaļ) — retained earlier itinerary

- Total: 4.969 km; start 4.6 km from Kuldīga.
- Start/end: 57.008984, 21.980134.
- Turnaround: 57.021881, 22.007186.
- 151 points; maximum segment 124.86 m; p90 44.36 m.
- Overlap with every other current source GPX: **0 m / 0%** within 25 m.
- An earlier selected out-and-back on official Mežtaka, not a separately named
  established trail. It retraces its path (50% of total distance). Retained,
  but not counted toward the ten new established routes.

## Sources and exact derivation

Earlier Riežupe and removed Snēpele sources: Baltic Trails / Lauku ceļotājs.
Downloaded using each page's
public GPX export form, without waypoints, on 2026-09-05.

- [Mežtaka section 92: Snēpele–Kuldīga](https://baltictrails.eu/en/forest/day/119).
  Original has 601 points. Use zero-based points 0–72 inclusive, then points
  71–0 to return. Original download SHA-256:
  `7bd381bea2b35cb2ec700b4379f28e743ccae6463a610f933624e1d6993f3ca0`.
- [Mežtaka section 93: Kuldīga–Renda](https://baltictrails.eu/en/forest/day/120).
  Use zero-based points 118–193 inclusive, then points 192–118 to return.
  Start is near the Riežupe/Venta picnic area, already outside Kuldīga.
  Original download SHA-256:
  `729de2af85c7c81e64d78956a7aec400e937ed8e0e59000cbca6552dc30b320e`.

## Overlap method and validation

`python3 scripts/check-route-overlap.py source/kuldiga_area_*.gpx`

Compares against every GPX in source/ except the candidate itself. Uses a local
metric projection, length-weighted midpoint samples no more than 10 m apart,
and distance to existing line segments within 25 m. Reports both directional
percentages and total overlap with the union of the catalog. This tolerates
GPS noise, reversed traversal and different sampling densities. GPX segment
boundaries are respected. A 25 m corridor can include nearby parallel paths;
material matches require inspection, not automatic deletion.

`python3 scripts/test-route-overlap.py` checks reversed/subset routes, GPS
offsets, disjoint paths, crossings, GPX segment gaps, sampling density, and
out-and-back containment (six tests).

The retained Riežupe and new Ugāle tracks pass the stricter 150 m segment review threshold and
the Kurzeme >300 m / >3×p90 outlier test. Each has one track and one segment. Riežupe starts and ends at the same
coordinate; Ugāle preserves the source recording endpoints. The build preserves every coordinate. Riežupe is
under 5,000 m, so it intentionally appears at z8/z10/z12, not z6. Ugāle appears
at all four zooms. Geometry verification does not certify current trail access
or on-ground conditions.

## Promising candidates not published

- [Dzilonis and Mežmuižas lakes near Renda](https://visitkuldiga.com/en/activity-objects/pastaigu-takas-un-pargajienu-marsruti/apkart-dzilonezeram/):
  official listing describes 2.5 km plus a 3.7 km extension, about 6.2 km total.
  The migrated route offers a coarse public map, but the full GPX download
  requires login. Available OSM paths could not reproduce the second lake
  loop reliably, so no guessed connecting geometry was imported.
- [Padure forest / Dzelzavots](https://visitkuldiga.com/en/activity-objects/pastaigu-takas-un-pargajienu-marsruti/padures-mezu-mazais-loks/):
  official route is 11 km. Could not verify a complete shorter countryside
  circuit from accessible source data; held back rather than guessing joins.
- [Suitu/Alsunga tracks](https://alsunga.lv/alsungas-pagasts/alsungas-apskates-vietas/):
  municipality QR-linked Lielais akmens and ZOOvilciens GPX files return
  HTTP 403; Žibgrava already exists and is not a discovery priority.
- Sabiles mežainās takas, approximately 6.27 km: a published recording is
  indexed, but the municipality's former route page returns 404. No reliable
  complete accessible track obtained.
- [Imulas Vītiņi–Villa Taka route](https://visitkandava.lv/dabas_takas/imulas_dabas_taka_no_vitiniem_lidz_villa_takai_dabas_taka):
  the official 4.4 km listing links to an AllTrails recording, not a direct
  GPX. Full track and overlap are still unverified.
- Kalnansu bog, Īvande mill lake and Māras kambari are established short
  trails but below the requested 3 km minimum. Do not invent extensions.
- Pinku, Zvirgzdu and Nabas lakes are worthwhile places, but a lake or
  mapped forest path does not establish a named 3–10 km hiking route.

## Publishing

main is the durable source. No publish-routes.yml exists in this checkout;
GitHub Pages currently deploys the generated gh-pages branch. Build into a
fresh output directory so removed variants cannot survive as stale files.
Publish generated indexes and routes, remove the rejected Snēpele and two redundant variant files
from gh-pages, and retain unrelated legacy aliases used by older clients.
The catalog has 420 routes. Seven qualifying established additions are now included;
the request for ten remains incomplete. Snēpele remains removed.

## Wider Kurzeme additions

Full provenance, source URLs, coordinate derivations, hashes and geometry overlap
results are in [kurzeme-established-audit.json](kurzeme-established-audit.json).
The first four were initially compared against all 417 other source GPXs, including
one another, with 0% overlap. The final audit compares all six against all 419
other routes. Adding the separate Saldus circuit creates the shared section
documented below; the other four routes retain 0% overlap.

| Route | Measured distance | Type | Points | Maximum segment |
| --- | ---: | --- | ---: | ---: |
| Sātiņu dīķi | 3.675 km | Out and back, as published in the original GPX | 639 | 9.05 m |
| Cieceres dabas taka Saldū | 5.094 km | Full established trail, out and back | 701 | 111.97 m |
| Baltā vilka ceļš mājup | 4.669 km | One way, mainly roads and village lanes | 32 | 453.19 m |
| Mazbānīša taka: Mazirbe–Sīkrags | 6.378 km | One way, old railway trail | 912 | 12.92 m |

The Ciecere original contains two tracks that begin 1.65 m apart. Reversing the
first joins them in trail order; blindly concatenating them would create a
593 m false jump. The resulting complete 2.547 km river trail is retraced for
the return walk. This is a full established trail, not an arbitrary extension.

The Mazbānīša source contains the longer loop with a western extension and
coastal return. The imported named Mazirbe–Sīkrags outward section runs from
the official trailhead to the village road junction; its measured length is
6.378 km versus the approximately 7 km tourism description. The western
extension contains coarse geometry and is not included.

Baltā vilka ceļš mājup uses all official map coordinates. Its longer segments
are straight road stretches, not coordinate jumps: all length-weighted 10 m
samples lie within 25 m of OpenStreetMap roads, also visually inspected.
Its p90 is 381.31 m and it has no strict outliers. No artificial densification
or invented coordinates were used. The other three also have no strict
outliers. Every addition has one track and one segment.

Sātiņi: the publisher recommends coordinating access with the landowner using
the notice at the trail entrance. Zīlītes: do not enter the buildings. Both
one-way routes require onward transport or additional return walking. These
limitations are included in GPX metadata and track descriptions.

Additional rejected/held leads from the wider search:

- Official Orhideju GPX: 99.39% overlap with the existing Orhideju route.
- Remtes muižas parks: original complete loop is 2.325 km.
- Virsaišu waterfall: original complete return track is 2.806 km.
- Baltā vilka zaļais ceļš: 7.802 km; 14.22% overlaps Mežtaka, and about
  1.09 km of coarse map geometry could not be corroborated with mapped paths.
- Melnezers–Sveikuļi and several other official Tukums circuits exceed 10 km.
- Misiņkalns has a published 3.2 km marked loop, but its complete track is
  not yet verified. Do not infer a track from the park’s general paths.

### Further complete published tracks

- **Priekules Priediens:** 4.309 km; all 246 public track coordinates by
  Roberts Greitāns. Maximum segment 110.19 m, p90 35.89 m, no strict
  outliers; 0% overlap with all 419 other routes. Park existence is also
  confirmed by the Dienvidkurzeme tourism authority.
- **Saldus: Kalnsētas parks un Cieceres taka:** 9.860 km; all 391 public
  track coordinates by Roberts Greitāns. Maximum segment 120 m, p90
  50.51 m, no strict outliers. This is a separate complete town/park
  circuit, not a renamed Ciecere return walk: 1,827.2 m / 18.53% overlaps
  Ciecere, while approximately 8,032.9 m adds new ground. In the other
  direction, 67.4% of the Ciecere return itinerary lies within its corridor.
  This material shared section is intentional and must not be described
  as zero overlap. Neither track is wholly contained in the other.

Seven of the ten requested additions have verified source geometry. Further
leads have not met the full source, distance and overlap requirements.
