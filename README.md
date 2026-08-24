# SingLinkVPN Security Reports — Umbrella Index

[简体中文](./README.zh-Hans.md) · [Evidence website](https://singlinklabs.github.io/singlinkvpn-security-reports/) · [SingLinkNews technical analysis](https://singlinknews.com/zh-Hans/singlinkvpn-v25-security-no-logs)

This repository is the umbrella index for two independently published SingLinkVPN reports. Each report now has its own public evidence repository and multilingual evidence website:

- [Desktop 2.5 security audit repository](https://github.com/SingLinkLabs/singlinkvpn-security-audit) · [evidence website](https://singlinklabs.github.io/singlinkvpn-security-audit/)
- [2026 no-logs verification repository](https://github.com/SingLinkLabs/singlinkvpn-no-logs-report) · [evidence website](https://singlinklabs.github.io/singlinkvpn-no-logs-report/)

This umbrella index covers:

1. the current-version security audit, version 2.0, dated 2026-08-24; and
2. the independent no-logs verification, version 1.0, with a 2026-07-29 reference date.

VPNTestor Platform / Openscore VPN published the reports and their conclusions. James Robert Smith is the named lead auditor and signer. SingLinkLabs maintains this index, the verification automation, and the explanatory metadata; it did not perform the independent audit.

## Current reports

| Report | Audited scope | Result reported by the auditor | Primary source | Official download |
| --- | --- | --- | --- | --- |
| SingLinkVPN current-version security audit v2.0 | macOS 2.5.7 build 3065; Windows 2.5.8 build 3077; listed protocol checks | 100/100, passed | [VPNTestor record](https://vpntestor.com/zh-Hans/news/singlink-vpn-v25-security-audit-2026) | [Signed Markdown report](https://vpntestor.com/downloads/security-audits/singlinkvpn-v2.5-2026/SingLinkVPN-Current-Versions-Security-Audit-Final-Report-2026-v2.0-zh-Hans.md) |
| SingLinkVPN independent no-logs verification v1.0 | Production read-only review with a 2026-07-29 reference date | Passed within the documented scope | [VPNTestor record](https://vpntestor.com/zh-Hans/news/singlinkvpn-no-logs-verification-2026) | [Chinese report](https://vpntestor.com/downloads/no-logs/SingLinkVPN-NoLogs-Independent-Verification-Report-2026-v1.0-zh-Hans.md) · [English report](https://vpntestor.com/downloads/no-logs/SingLinkVPN-NoLogs-Independent-Verification-Report-2026-v1.0-en.md) |

## What is stored here

- exact upstream SHA-256 manifests, Ed25519 signatures, and the auditor's public key;
- provenance, report scope, limitations, and canonical source URLs;
- JSON and JSON-LD records intended for reproducible research and citation;
- an automated verifier that checks the signed manifests and can re-download the official reports to validate their hashes.

The full third-party report text is not mirrored because the published report files do not include a redistribution licence. Official downloads remain linked above. If written redistribution permission is confirmed, frozen verbatim copies can be added without changing their content or licensing them as SingLinkLabs material. See [RIGHTS.md](./RIGHTS.md).

## Verify in one command

```sh
npm test
npm run verify:remote
```

`npm test` verifies the repository metadata and both Ed25519-signed upstream manifests without network access. `npm run verify:remote` additionally downloads the official report files and compares their SHA-256 values.

## Interpretation boundary

The reports apply only to the versions, dates, systems, evidence, and test scope that they identify. A passing result or 100/100 score does not prove that every past or future version is permanently free of vulnerabilities. A valid signature proves that a signed file has not changed since signing; it does not independently prove every factual statement inside the file.

This repository improves public access, provenance, and machine readability. It does not guarantee Google indexing, search rankings, backlinks, or citation by any AI system.

## Citation

Use GitHub's “Cite this repository” entry for this evidence catalog, or copy the report-specific citations in [docs/citation-guide.md](./docs/citation-guide.md). Cite VPNTestor Platform / Openscore VPN as the report publisher, not SingLinkLabs.

## Corrections and security

Factual or provenance corrections may be submitted as an issue. Do not disclose product vulnerabilities or sensitive infrastructure in a public issue; follow [SECURITY.md](./SECURITY.md).
