/**
 * Cloudflare Worker – direct GPX upload endpoint
 *
 * POST /upload
 *   Body: multipart/form-data with a `gpx` file and optional `name` field.
 *   Headers: Authorization: Bearer <UPLOAD_SECRET>
 *
 * Response:
 *   { "ok": true, "prUrl": "https://github.com/.../pull/123" }
 *
 * Env vars:
 *   UPLOAD_SECRET   – shared secret the app sends in Authorization header
 *   GITHUB_TOKEN    – classic PAT with `repo` scope
 *   GITHUB_REPO     – e.g. "janjiss/highkeer-routes"
 *   GITHUB_BRANCH   – target branch, usually "main"
 */

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    const auth = request.headers.get('Authorization') || '';
    const token = auth.replace(/^Bearer\s+/i, '');
    if (token !== env.UPLOAD_SECRET) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const contentType = request.headers.get('Content-Type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return json({ error: 'Expected multipart/form-data' }, 400);
    }

    const form = await request.formData();
    const file = form.get('gpx');
    const name = (form.get('name') || 'submission').toString();

    if (!file || typeof file === 'string') {
      return json({ error: 'Missing gpx file' }, 400);
    }

    const bytes = await file.arrayBuffer();
    const xml = new TextDecoder().decode(bytes);

    if (!xml.includes('<trk>') || !xml.includes('<trkseg>')) {
      return json({ error: 'Invalid GPX: missing track elements' }, 400);
    }

    const safeName = name
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    const fileName = `${safeName || 'route'}.gpx`;
    const path = `source/${fileName}`;

    // 1. Get current commit SHA of target branch
    const refRes = await ghApi(
      env,
      `/repos/${env.GITHUB_REPO}/git/ref/heads/${env.GITHUB_BRANCH}`
    );
    const currentSha = refRes.object.sha;

    // 2. Get current tree
    const commitRes = await ghApi(env, `/repos/${env.GITHUB_REPO}/git/commits/${currentSha}`);
    const treeSha = commitRes.tree.sha;

    // 3. Create blob for the GPX file
    const blobRes = await ghApi(env, `/repos/${env.GITHUB_REPO}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({
        encoding: 'utf-8',
        content: xml,
      }),
    });

    // 4. Create new tree with the file
    const newTreeRes = await ghApi(env, `/repos/${env.GITHUB_REPO}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({
        base_tree: treeSha,
        tree: [
          {
            path,
            mode: '100644',
            type: 'blob',
            sha: blobRes.sha,
          },
        ],
      }),
    });

    // 5. Create commit
    const newCommitRes = await ghApi(env, `/repos/${env.GITHUB_REPO}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({
        message: `feat: add route "${name}" via upload`,
        tree: newTreeRes.sha,
        parents: [currentSha],
      }),
    });

    // 6. Create branch
    const branchName = `upload/${Date.now()}-${safeName}`;
    await ghApi(env, `/repos/${env.GITHUB_REPO}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: newCommitRes.sha,
      }),
    });

    // 7. Open PR
    const prRes = await ghApi(env, `/repos/${env.GITHUB_REPO}/pulls`, {
      method: 'POST',
      body: JSON.stringify({
        title: `Route submission: ${name}`,
        head: branchName,
        base: env.GITHUB_BRANCH,
        body: `Uploaded route \`${fileName}\`. Please review generated tiles before merging.`,
      }),
    });

    return json({ ok: true, prUrl: prRes.html_url });
  },
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function ghApi(env, path, init = {}) {
  const url = `https://api.github.com${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      'User-Agent': 'highkeer-worker',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text}`);
  }
  return res.json();
}
