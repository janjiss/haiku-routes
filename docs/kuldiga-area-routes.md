# Walks outside Kuldīga

Added 2026-09-05. These are short walking **variants** of existing published
tracks/paths, not newly surveyed trails or claims of official named routes.
Distances from Kuldīga below are straight-line distances; driving is longer.
The existing Venta route in Kuldīga is unchanged.

## Kazdangas parka mazais loks — 5.299 km

- Location: Kazdanga, 30.6 km south of Kuldīga.
- Start/end: 56.72485, 21.73560 (original source trailhead).
- Format: southern park loop with a shared access path.
- Source publisher: Kurzeme Planning Region.
- [Trail description](https://www.kurzemesregions.lv/projekti/turisms/unigreen/dabas-takas/kazdangas-parka-dabas-taka/)
- [Original GPX](https://kurzemesregions.lv/wp-content/uploads/2019/04/Kazdanga_Park_Nature_Trail.gpx)
- Derivation from the 1,446-point original: zero-based points 1445 down to
  1387, followed by points 658 through 1445. This follows the original
  approach in reverse, then the southern loop and recorded return to the
  trailhead. Points 1387 and 658 are two recordings of the same junction,
  1.3 m apart. No smoothing or interpolated geometry was added.
- Preserves source elevations where supplied.

## Spāres meža pastaiga (turp un atpakaļ) — 5.380 km

- Location: forest near Spāre/Gulbju lake, 31.3 km northeast of Kuldīga.
- Start/end: 57.2143385, 22.2190232.
- Format: out-and-back; turn around at 57.2183725, 22.2476380.
- Source: [OpenStreetMap relation 15609772](https://www.openstreetmap.org/relation/15609772),
  “Olimpiskais pārgājiens Spārē”, attributed there to Latvijas valsts meži.
- Derived variant follows the relation's southern forest paths and northeast
  access spur, then retraces those same paths. It does not claim to be the
  complete Olympic loop or a route to the viewing tower.
- Connected OSM ways in outbound order: 1154796063, 1154796049,
  1154796051 (reversed), 1154796061, 800135175 (reversed),
  1154796054 (reversed), 148883394, 1154796057, 1154796073.
  Every join uses an identical OSM node. Return uses the exact reverse path.
- Excludes the original loop's sparsely mapped 488 m straight shortcut;
  no invented intermediate points or cross-country joins.
- Map data © OpenStreetMap contributors, [ODbL 1.0](https://www.openstreetmap.org/copyright).
  Elevation is unknown, not zero.

## Verification

Both source files contain one track and one segment, with identical start/end
coordinates, valid finite coordinates, unique catalog IDs, and no duplicates
in the existing catalog. Build preserves every new source coordinate (both
are below the decimation limit). Both appear in all four index zoom levels.

| Variant | Points | Maximum segment | 90th percentile segment |
| --- | ---: | ---: | ---: |
| Kazdanga | 847 | 9.19 m | 7.92 m |
| Spāre | 119 | 130.53 m | 82.64 m |

Neither meets the Kurzeme outlier condition (>300 m and >3× p90), and
neither has a segment above the stricter 150 m review threshold.
This verifies geometry, not current on-ground trail conditions.

## Candidates not imported

The municipality lists Suitu tracks around Alsunga at approximately 5–6 km,
but its QR-linked GPX files return HTTP 403. Wikiloc mirrors require login
for file downloads. These were not imported or reconstructed from previews.

## Publishing

At the time of this addition, main has no publish-routes.yml workflow;
the existing site deploys from gh-pages. Build with npm ci and npm run build,
commit source GPX and these notes to main, then publish the generated output
to gh-pages. Preserve the existing legacy route aliases during this additive
publish; they are still used by older app versions.

Original download SHA-256 (kazdanga.gpx): `4660a3aecacad97ab3cce2e696ab720caef56b1bcf1d91b04914836f7170e6ac`.

Original download SHA-256 (spare.osm): `723689aacd22feaf5ba457862cd94340c6247a131a12c1ee947e71baf3fc3977`.
