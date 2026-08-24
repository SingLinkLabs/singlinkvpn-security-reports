import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const base = 'https://singlinklabs.github.io/singlinkvpn-security-reports';
const locales = ['en', 'zh-Hant', 'zh-Hans', 'ja', 'ko', 'vi', 'th', 'ru'];
const failures = [];

for (const locale of locales) {
  const file = locale === 'en' ? 'index.html' : `${locale}/index.html`;
  const html = await readFile(path.join(output, file), 'utf8');
  const expectedCanonical = locale === 'en' ? `${base}/` : `${base}/${locale}/`;
  const h1Count = (html.match(/<h1\b/g) ?? []).length;
  if (h1Count !== 1) failures.push(`${locale}: expected one H1, got ${h1Count}`);
  if (!html.includes(`<link rel="canonical" href="${expectedCanonical}">`)) {
    failures.push(`${locale}: missing self-canonical`);
  }
  if (!html.includes('summary_large_image')) failures.push(`${locale}: Twitter card missing`);
  if (!html.includes('application/ld+json')) failures.push(`${locale}: JSON-LD missing`);
  const jsonLdMatch = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/);
  if (!jsonLdMatch) {
    failures.push(`${locale}: JSON-LD block missing`);
  } else {
    try {
      const jsonLd = JSON.parse(jsonLdMatch[1]);
      if (jsonLd['@type'] !== 'Dataset') failures.push(`${locale}: JSON-LD type must be Dataset`);
      if (jsonLd.url !== expectedCanonical) failures.push(`${locale}: JSON-LD URL must match canonical`);
    } catch {
      failures.push(`${locale}: JSON-LD is invalid JSON`);
    }
  }
  for (const candidate of locales) {
    if (!html.includes(`hreflang="${candidate}"`)) {
      failures.push(`${locale}: hreflang ${candidate} missing`);
    }
  }
}

const sitemap = await readFile(path.join(output, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (sitemapUrls.length !== locales.length) failures.push('sitemap must contain eight locale URLs');
if (new Set(sitemapUrls).size !== locales.length) failures.push('sitemap contains duplicate URLs');

const robots = await readFile(path.join(output, 'robots.txt'), 'utf8');
if (!robots.includes('User-agent: OAI-SearchBot\nAllow: /')) failures.push('OAI-SearchBot allow rule missing');
if (!robots.includes(`Sitemap: ${base}/sitemap.xml`)) failures.push('robots sitemap is missing');

if (failures.length) {
  console.error(`Site audit failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Site audit passed: ${locales.length} localized pages, ${sitemapUrls.length} canonical sitemap URLs.`);
