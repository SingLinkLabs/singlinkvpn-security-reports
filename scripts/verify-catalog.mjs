import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(await readFile(path.join(root, 'metadata/reports.json'), 'utf8'));
const expectedLocales = ['en', 'zh-Hans', 'zh-Hant', 'ja', 'ko', 'vi', 'th', 'ru'];
const shaPattern = /^[a-f0-9]{64}$/;
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

check(catalog.schemaVersion === 1, 'schemaVersion must be 1');
check(catalog.reports?.length === 2, 'catalog must contain exactly two report records');
check(new Set(catalog.reports.map(({ id }) => id)).size === 2, 'report IDs must be unique');

for (const locale of expectedLocales) {
  const record = JSON.parse(
    await readFile(path.join(root, `metadata/locales/${locale}.json`), 'utf8'),
  );
  for (const key of [
    'htmlLang',
    'title',
    'description',
    'h1',
    'intro',
    'securityTitle',
    'securitySummary',
    'noLogsTitle',
    'noLogsSummary',
    'limitationNotice',
  ]) {
    check(typeof record[key] === 'string' && record[key].trim(), `${locale}: missing ${key}`);
  }
}

for (const report of catalog.reports) {
  check(
    report.officialPublicationPage.startsWith('https://vpntestor.com/'),
    `${report.id}: primary source must use HTTPS on vpntestor.com`,
  );
  check(report.scope.length > 0, `${report.id}: scope is empty`);
  check(report.limitations.length > 0, `${report.id}: limitations are empty`);

  const manifestPath = path.join(root, report.signedManifest);
  const signaturePath = path.join(root, report.signature);
  const publicKeyPath = path.join(root, report.publicKey);
  const manifest = await readFile(manifestPath, 'utf8');
  const publicKey = (await readFile(publicKeyPath, 'utf8')).trim();

  for (const file of report.files) {
    check(shaPattern.test(file.sha256), `${report.id}/${file.language}: invalid SHA-256`);
    check(
      file.officialDownloadUrl.startsWith('https://vpntestor.com/'),
      `${report.id}/${file.language}: invalid download URL`,
    );
    check(
      manifest.includes(`${file.sha256}  ${file.filename}`),
      `${report.id}/${file.language}: signed manifest does not contain the expected file`,
    );
  }

  const fingerprint = execFileSync('ssh-keygen', ['-lf', publicKeyPath, '-E', 'sha256'], {
    encoding: 'utf8',
  });
  check(
    fingerprint.includes(report.publicKeyFingerprint),
    `${report.id}: public-key fingerprint mismatch`,
  );

  const temporaryDirectory = await mkdtemp(path.join(tmpdir(), 'singlink-audit-verify-'));
  try {
    const allowedSigners = path.join(temporaryDirectory, 'allowed_signers');
    const [keyType, keyValue] = publicKey.split(/\s+/);
    await writeFile(allowedSigners, `james-robert-smith ${keyType} ${keyValue}\n`, 'utf8');
    execFileSync(
      'ssh-keygen',
      [
        '-Y',
        'verify',
        '-f',
        allowedSigners,
        '-I',
        'james-robert-smith',
        '-n',
        'file',
        '-s',
        signaturePath,
      ],
      { input: manifest, stdio: ['pipe', 'pipe', 'pipe'] },
    );
  } catch (error) {
    failures.push(`${report.id}: Ed25519 signature verification failed (${error.message})`);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

if (failures.length) {
  console.error(`Catalog verification failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const fileCount = catalog.reports.reduce((total, report) => total + report.files.length, 0);
console.log(
  `Catalog verification passed: ${catalog.reports.length} signed manifests, ${fileCount} report files, ${expectedLocales.length} locale records.`,
);
