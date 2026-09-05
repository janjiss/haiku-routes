# Walks outside Kuldīga — geometry and overlap audit

Updated 2026-09-05. Prioritize less obvious countryside walks near 5 km that
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

## Accepted countryside itineraries

These are short **out-and-back itineraries along official Mežtaka tracks**,
not separately named official trails. Each covers approximately 2.5 km of
unique path and returns over exactly the same path (50% retracing by distance).
The turnaround is selected for a roughly 5 km walk, not a claimed landmark.
No added coordinates, interpolated geometry, guessed connectors, or elevation
estimates are used. Starts are trail coordinates; parking is not verified.
Distances from Kuldīga are straight-line distances, not driving distances.

### Snēpeles mežu pastaiga (turp un atpakaļ)

- Total: 5.001 km; start 14.3 km from Kuldīga.
- Start/end: 56.840325, 21.944804.
- Turnaround: 56.856062, 21.963688.
- 145 points; maximum segment 98.34 m; p90 58.61 m.
- Overlap with every other current source GPX, including the other candidate: **0 m / 0%** within 25 m.

### Riežupes meža pastaiga (turp un atpakaļ)

- Total: 4.969 km; start 4.6 km from Kuldīga.
- Start/end: 57.008984, 21.980134.
- Turnaround: 57.021881, 22.007186.
- 151 points; maximum segment 124.86 m; p90 44.36 m.
- Overlap with every other current source GPX, including the other candidate: **0 m / 0%** within 25 m.

## Sources and exact derivation

Official publisher: Baltic Trails / Lauku ceļotājs. Downloaded using each page's
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

Both new source tracks pass the stricter 150 m segment review threshold and
the Kurzeme >300 m / >3×p90 outlier test. Each has one track and one segment;
start and end match exactly. The build preserves every coordinate. Riežupe is
under 5,000 m, so it intentionally appears at z8/z10/z12, not z6. Snēpele appears
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
- Suitu/Alsunga tracks: municipality QR-linked files return HTTP 403;
  Žibgrava already exists and is not a discovery priority.

## Publishing

main is the durable source. No publish-routes.yml exists in this checkout;
GitHub Pages currently deploys the generated gh-pages branch. Build into a
fresh output directory so removed variants cannot survive as stale files.
Publish generated indexes and routes, remove the two redundant variant files
from gh-pages, and retain unrelated legacy aliases used by older clients.
The final catalog has 414 routes (two redundant variants replaced by two
non-overlapping countryside itineraries).
