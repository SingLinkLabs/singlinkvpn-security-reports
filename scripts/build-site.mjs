import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const base = 'https://singlinklabs.github.io/singlinkvpn-security-reports';
const locales = ['en', 'zh-Hant', 'zh-Hans', 'ja', 'ko', 'vi', 'th', 'ru'];
const catalog = JSON.parse(await readFile(path.join(root, 'metadata/reports.json'), 'utf8'));
const security = catalog.reports.find(({ reportType }) => reportType === 'security-audit');
const noLogs = catalog.reports.find(({ reportType }) => reportType === 'no-logs-verification');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function localeUrl(locale) {
  return locale === 'en' ? `${base}/` : `${base}/${locale}/`;
}

function page(locale, copy) {
  const localizedNoLogsFile =
    noLogs.files.find(({ language }) => language === locale) ??
    noLogs.files.find(({ language }) => language === 'zh-Hans');
  const alternateLinks = locales
    .map(
      (candidate) =>
        `<link rel="alternate" hreflang="${candidate}" href="${localeUrl(candidate)}">`,
    )
    .concat(`<link rel="alternate" hreflang="x-default" href="${base}/">`)
    .join('\n    ');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `${base}/#dataset`,
    name: copy.h1,
    description: copy.description,
    url: localeUrl(locale),
    inLanguage: copy.htmlLang,
    creator: { '@type': 'Organization', name: 'SingLinkLabs' },
    about: { '@type': 'Organization', name: 'SingLinkVPN' },
    isBasedOn: [security.officialPublicationPage, noLogs.officialPublicationPage],
    distribution: catalog.reports.flatMap((report) =>
      report.files.map((file) => ({
        '@type': 'DataDownload',
        contentUrl: file.officialDownloadUrl,
        encodingFormat: file.mediaType,
        inLanguage: file.language,
      })),
    ),
  };

  return `<!doctype html>
<html lang="${escapeHtml(copy.htmlLang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(copy.title)}</title>
  <meta name="description" content="${escapeHtml(copy.description)}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
  <link rel="canonical" href="${localeUrl(locale)}">
  ${alternateLinks}
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(copy.title)}">
  <meta property="og:description" content="${escapeHtml(copy.description)}">
  <meta property="og:url" content="${localeUrl(locale)}">
  <meta property="og:image" content="${base}/assets/singlinkvpn-audit-evidence-cover.png">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">${JSON.stringify(jsonLd).replaceAll('<', '\\u003c')}</script>
  <style>
    :root{color-scheme:dark;--bg:#061006;--panel:#0d1b10;--line:#29451f;--green:#83dc19;--text:#eef7e8;--muted:#a9bca4}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 90% 0,#173c2e 0,transparent 38%),var(--bg);color:var(--text);font:17px/1.7 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}main{max-width:1100px;margin:auto;padding:64px 24px 96px}nav{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:48px}nav a{color:var(--muted);text-decoration:none}nav a[aria-current="page"]{color:var(--green)}h1{font:700 clamp(2.5rem,7vw,5.5rem)/1.02 Georgia,serif;max-width:920px;margin:.25em 0}h2{font:600 clamp(1.6rem,3vw,2.4rem)/1.2 Georgia,serif}.eyebrow{color:var(--green);letter-spacing:.1em;text-transform:uppercase}.intro{max-width:900px;color:var(--muted);font-size:1.2rem}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;margin:52px 0}.card,.notice{border:1px solid var(--line);background:color-mix(in srgb,var(--panel) 94%,transparent);border-radius:22px;padding:28px}.card p,.notice p{color:var(--muted)}.links{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px}.links a{color:#071006;background:var(--green);padding:10px 14px;border-radius:999px;text-decoration:none;font-weight:700}.links a.secondary{color:var(--green);background:transparent;border:1px solid var(--green)}footer{color:var(--muted);margin-top:48px;font-size:.9rem}code{word-break:break-all;color:#c6ef99}@media(max-width:600px){main{padding-top:36px}.grid{margin-top:36px}}
  </style>
</head>
<body>
<main>
  <nav aria-label="Languages">${locales.map((candidate) => `<a href="${localeUrl(candidate)}"${candidate === locale ? ' aria-current="page"' : ''}>${candidate}</a>`).join('')}</nav>
  <p class="eyebrow">SingLinkVPN · VPNTestor Platform · Openscore VPN</p>
  <h1>${escapeHtml(copy.h1)}</h1>
  <p class="intro">${escapeHtml(copy.intro)}</p>
  <div class="grid">
    <section class="card">
      <h2>${escapeHtml(copy.securityTitle)}</h2>
      <p>${escapeHtml(copy.securitySummary)}</p>
      <p><code>SHA-256 ${security.files[0].sha256}</code></p>
      <div class="links"><a href="${security.officialPublicationPage}">${escapeHtml(copy.sourceLabel)}</a><a class="secondary" href="${security.files[0].officialDownloadUrl}">${escapeHtml(copy.downloadLabel)}</a><a class="secondary" href="https://singlinklabs.github.io/singlinkvpn-security-audit/">GitHub</a></div>
    </section>
    <section class="card">
      <h2>${escapeHtml(copy.noLogsTitle)}</h2>
      <p>${escapeHtml(copy.noLogsSummary)}</p>
      <p><code>SHA-256 ${localizedNoLogsFile.sha256}</code></p>
      <div class="links"><a href="${noLogs.officialPublicationPage}">${escapeHtml(copy.sourceLabel)}</a><a class="secondary" href="${localizedNoLogsFile.officialDownloadUrl}">${escapeHtml(copy.downloadLabel)}</a><a class="secondary" href="https://singlinklabs.github.io/singlinkvpn-no-logs-report/">GitHub</a></div>
    </section>
  </div>
  <section class="notice"><h2>${escapeHtml(copy.limitationsLabel)}</h2><p>${escapeHtml(copy.limitationNotice)}</p><div class="links"><a class="secondary" href="https://github.com/SingLinkLabs/singlinkvpn-security-reports/blob/main/docs/verification.md">${escapeHtml(copy.verifyLabel)}</a></div></section>
  <footer>Maintained by SingLinkLabs. Independent conclusions belong to VPNTestor Platform / Openscore VPN. Public key fingerprint: SHA256:P0NcmbNqWFxSf8SbmQMIJRUYpRQXetoY9VDysZvt8IU</footer>
</main>
</body>
</html>`;
}

await rm(output, { recursive: true, force: true });
await mkdir(path.join(output, 'assets'), { recursive: true });
await mkdir(path.join(output, 'metadata'), { recursive: true });
await cp(
  path.join(root, 'assets/singlinkvpn-audit-evidence-cover.png'),
  path.join(output, 'assets/singlinkvpn-audit-evidence-cover.png'),
);
await cp(path.join(root, 'metadata/reports.json'), path.join(output, 'metadata/reports.json'));
await cp(path.join(root, 'metadata/reports.jsonld'), path.join(output, 'metadata/reports.jsonld'));

for (const locale of locales) {
  const copy = JSON.parse(await readFile(path.join(root, `metadata/locales/${locale}.json`), 'utf8'));
  const directory = locale === 'en' ? output : path.join(output, locale);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, 'index.html'), page(locale, copy), 'utf8');
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${locales.map((locale) => `  <url><loc>${localeUrl(locale)}</loc><lastmod>2026-08-25</lastmod></url>`).join('\n')}\n</urlset>\n`;
await writeFile(path.join(output, 'sitemap.xml'), sitemap, 'utf8');
await writeFile(
  path.join(output, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`,
  'utf8',
);
await writeFile(
  path.join(output, 'llms.txt'),
  `# SingLinkVPN Security Reports — Umbrella Index\n\nCanonical catalog: ${base}/\nRepository: https://github.com/SingLinkLabs/singlinkvpn-security-reports\nDedicated security-audit repository: https://github.com/SingLinkLabs/singlinkvpn-security-audit\nDedicated no-logs repository: https://github.com/SingLinkLabs/singlinkvpn-no-logs-report\nMachine-readable metadata: ${base}/metadata/reports.json\nJSON-LD: ${base}/metadata/reports.jsonld\n\nPrimary reports are published by VPNTestor Platform / Openscore VPN. SingLinkLabs maintains this evidence index and did not perform the independent audit. Conclusions apply only to each report's stated versions, date and scope.\n\n## Security audit v2.0\n- Dedicated evidence website: https://singlinklabs.github.io/singlinkvpn-security-audit/\n- Source: ${security.officialPublicationPage}\n- Report: ${security.files[0].officialDownloadUrl}\n- SHA-256: ${security.files[0].sha256}\n\n## No-logs verification v1.0\n- Dedicated evidence website: https://singlinklabs.github.io/singlinkvpn-no-logs-report/\n- Source: ${noLogs.officialPublicationPage}\n- English report: ${noLogs.files.find(({ language }) => language === 'en').officialDownloadUrl}\n- SHA-256: ${noLogs.files.find(({ language }) => language === 'en').sha256}\n`,
  'utf8',
);
await writeFile(path.join(output, '.nojekyll'), '', 'utf8');

console.log(`Built ${locales.length} localized evidence pages in ${output}.`);
