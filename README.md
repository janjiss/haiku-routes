# Haiku Routes Data

Static route tileset designed for GitHub Pages (or any static CDN).

## Folder layout

```
out/
  meta.json              # catalog: bbox, routeCount, zoomRange
  routes/
    {route_id}.geojson   # full-resolution LineString
  idx/
    z6/                  # low-zoom sparse index
    z8/                  # regional index
    z10/                 # local index
    z12/                 # dense local index
      {morton_code}.json # [{id, name, bbox, lenM, eleM}]
```

## Why Morton codes?

- **Flat directories**: GitHub web UI and many tools struggle with 65k sub-folders (`x/y`). A flat folder of Morton-coded files is easier to browse.
- **Spatial locality**: Nearby tiles have similar codes, which plays nicely with CDN edge caching and disk read-ahead.
- **Single lookup**: No need to traverse `z/x/y.json`; one filename per tile.

## Build

```bash
npm install
npm run build
```

Set env vars if needed:

```bash
SRC_DIR=./source OUT_DIR=./out npm run build
```

## Host on GitHub Pages

1. Create a repo (e.g. `your-org/haiku-routes`).
2. Push the `out/` folder to the `gh-pages` branch (or enable Pages on `main`).
3. Tiles are then available at:
   ```
   https://janjiss.github.io/haiku-routes/routes/{id}.geojson
   https://janjiss.github.io/haiku-routes/idx/z10/004213.json
   ```

## Client fetching strategy

1. Read viewport bbox + current zoom.
2. Pick nearest index zoom (e.g. z10).
3. Compute Morton codes for all tiles inside viewport.
4. `Promise.all()` fetch index tiles; collect route IDs.
5. Deduplicate IDs; filter out already-cached routes.
6. Fetch missing `.geojson` route files.
7. Render as a single GeoJSON `FeatureCollection`.

## Adding new routes

### Manual (maintainer)

Drop `.gpx` files into `source/` and re-run `npm run build`. The script is deterministic, so diffs are minimal.

### Via GitHub Issues (community)

1. Enable GitHub Issues on this repo.
2. Users open an issue using the **"Submit a route"** template.
3. They attach a `.gpx` file and fill in metadata.
4. Labeling the issue `route-submission` triggers the ingest workflow:
   - Downloads and validates the GPX
   - Copies it to `source/`
   - Runs `npm run build`
   - Opens a pull request automatically
   - Comments on the issue with the PR link

### Via the Haiku Routes app

The app can open a pre-filled issue form:

```ts
import { openRouteSubmissionForm } from '@/services/submit-route';
await openRouteSubmissionForm(route);
```

Users then attach the GPX file in the browser and submit.

### Via direct upload (advanced)

For a fully headless experience, deploy `worker.js` to Cloudflare Workers (or any serverless platform) and set `UPLOAD_SECRET` + `GITHUB_TOKEN` env vars. The app can then `POST` the GPX directly and receive a PR URL.
