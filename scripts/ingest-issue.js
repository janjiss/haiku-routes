/**
 * Ingest GPX route submissions from GitHub Issues.
 *
 * Expects env vars:
 *   GITHUB_TOKEN  – for API calls
 *   ISSUE_NUMBER  – the issue to process
 *   REPO          – owner/repo
 *
 * Flow:
 * 1. Fetch issue body via GitHub REST API.
 * 2. Extract markdown links ending in .gpx.
 * 3. Download each attachment.
 * 4. Validate basic GPX structure.
 * 5. Write to source/ with sanitized filename.
 * 6. Run `npm run build`.
 * 7. Set GHA output `created=true` so caller opens a PR.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.GITHUB_TOKEN;
const ISSUE = process.env.ISSUE_NUMBER;
const REPO = process.env.REPO;

if (!TOKEN || !ISSUE || !REPO) {
  console.error('Missing required env vars: GITHUB_TOKEN, ISSUE_NUMBER, REPO');
  process.exit(1);
}

/* ------------------------------------------------------------------ */
/* HTTP helpers                                                       */
/* ------------------------------------------------------------------ */

function githubApi(path) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.github.com',
        path,
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'User-Agent': 'highkeer-ingest',
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`GitHub API ${res.statusCode}: ${data}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, { headers: { 'User-Agent': 'highkeer-ingest' } }, (res) => {
        if (res.statusCode === 302 || res.statusCode === 301) {
          // follow redirect
          download(res.headers.location, dest).then(resolve).catch(reject);
          file.destroy();
          return;
        }
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      })
      .on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

/* ------------------------------------------------------------------ */
/* Validation                                                         */
/* ------------------------------------------------------------------ */

function isValidGpx(xml) {
  return (
    xml.includes('<trk>') &&
    xml.includes('<trkseg>') &&
    xml.includes('<trkpt')
  );
}

function sanitizeFileName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/* ------------------------------------------------------------------ */
/* Main                                                               */
/* ------------------------------------------------------------------ */

async function run() {
  const issue = await githubApi(`/repos/${REPO}/issues/${ISSUE}`);
  const body = issue.body || '';

  // Extract markdown links to .gpx files
  const regex = /\[([^\]]+\.gpx)\]\((https?:\/\/[^\)]+)\)/gi;
  const matches = [...body.matchAll(regex)];

  if (matches.length === 0) {
    console.log('No .gpx attachments found in issue body.');
    await postComment(issue, 'No GPX attachment found. Please edit the issue and attach a `.gpx` file.');
    process.exit(0);
  }

  const sourceDir = path.resolve('source');
  fs.mkdirSync(sourceDir, { recursive: true });

  let added = 0;
  for (const [, rawName, url] of matches) {
    const name = sanitizeFileName(rawName);
    if (!name.endsWith('.gpx')) continue;

    const tmpPath = path.join(sourceDir, `.tmp_${Date.now()}_${name}`);
    try {
      await download(url, tmpPath);
      const xml = fs.readFileSync(tmpPath, 'utf-8');
      if (!isValidGpx(xml)) {
        console.warn(`Skipping invalid GPX: ${name}`);
        fs.unlinkSync(tmpPath);
        continue;
      }

      const dest = path.join(sourceDir, name);
      fs.renameSync(tmpPath, dest);
      console.log(`Added: ${dest}`);
      added++;
    } catch (err) {
      console.error(`Failed to process ${name}:`, err.message);
      try { fs.unlinkSync(tmpPath); } catch {}
    }
  }

  if (added === 0) {
    await postComment(issue, 'Could not validate any attached GPX files. Please ensure they contain `<trk>` and `<trkseg>` elements.');
    process.exit(0);
  }

  // Build tiles
  console.log('Running build...');
  const { execSync } = require('child_process');
  execSync('npm run build', { stdio: 'inherit' });

  // Signal that a PR should be created
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, 'created=true\n');
  }

  await postComment(
    issue,
    `✅ Ingested **${added}** route file(s) and rebuilt tiles.\n\nA pull request has been opened with the changes.`
  );
}

async function postComment(issue, text) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ body: text });
    const req = https.request(
      {
        hostname: 'api.github.com',
        path: `/repos/${REPO}/issues/${ISSUE}/comments`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'User-Agent': 'highkeer-ingest',
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`Comment API ${res.statusCode}: ${d}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
