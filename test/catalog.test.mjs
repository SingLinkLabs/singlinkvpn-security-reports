import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const catalog = JSON.parse(
  await readFile(new URL('../metadata/reports.json', import.meta.url), 'utf8'),
);

test('catalog attributes third-party reports to the auditor, not the repository maintainer', () => {
  assert.equal(catalog.maintainer, 'SingLinkLabs');
  for (const report of catalog.reports) {
    assert.equal(report.publisher, 'VPNTestor Platform');
    assert.equal(report.auditTeam, 'Openscore VPN');
    assert.equal(report.leadAuditor, 'James Robert Smith');
  }
});

test('catalog preserves scope limitations for every report', () => {
  for (const report of catalog.reports) {
    assert.ok(report.scope.length > 0);
    assert.ok(report.limitations.length > 0);
    assert.doesNotMatch(report.limitations.join(' '), /guaranteed permanently safe/i);
  }
});

test('catalog does not claim that third-party report files are MIT licensed', async () => {
  const rights = await readFile(new URL('../RIGHTS.md', import.meta.url), 'utf8');
  assert.match(rights, /does \*\*not\*\* mirror the full third-party report text/);
  assert.match(rights, /not relicensed under MIT/);
});
