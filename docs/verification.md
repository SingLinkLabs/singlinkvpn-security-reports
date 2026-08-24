# Verify the signed manifests

The two `upstream.sha256` files are signed using an OpenSSH Ed25519 signature with namespace `file`.

```sh
npm test
```

The verifier:

1. checks the expected public-key fingerprint;
2. verifies the signature over each upstream SHA-256 manifest;
3. confirms that every report record has an HTTPS primary source and a valid SHA-256 value; and
4. confirms that the signed manifest contains the expected report filename and digest.

To fetch the official report downloads and compare their bytes with the signed manifest:

```sh
npm run verify:remote
```

A valid signature establishes file integrity since signing. It does not, by itself, independently reproduce the audit procedure or prove every claim in a report.
