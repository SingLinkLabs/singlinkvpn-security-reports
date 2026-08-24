import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(await readFile(path.join(root, 'metadata/reports.json'), 'utf8'));
const failures = [];

async function fetchBytes(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': 'SingLinkAuditEvidenceVerifier/1.0' },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

for (const report of catalog.reports) {
  try {
    const source = await fetch(report.officialPublicationPage, {
      redirect: 'follow',
      headers: { 'user-agent': 'SingLinkAuditEvidenceVerifier/1.0' },
      signal: AbortSignal.timeout(20_000),
    });
    if (!source.ok) failures.push(`${report.id}: publication page returned HTTP ${source.status}`);
  } catch (error) {
    failures.push(`${report.id}: publication page failed (${error.message})`);
  }

  for (const file of report.files) {
    try {
      const bytes = await fetchBytes(file.officialDownloadUrl);
      const digest = createHash('sha256').update(bytes).digest('hex');
      if (digest !== file.sha256) {
        failures.push(`${report.id}/${file.language}: SHA-256 mismatch (${digest})`);
      } else {
        console.log(`${report.id}/${file.language}: ${bytes.length} bytes, SHA-256 verified`);
      }
    } catch (error) {
      failures.push(`${report.id}/${file.language}: download failed (${error.message})`);
    }
  }
}

if (failures.length) {
  console.error(`Remote verification failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Remote verification passed for every catalogued official report file.');
