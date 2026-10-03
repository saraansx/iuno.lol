import assert from "node:assert/strict";
import { base32Decode, base32Encode, decryptSecret, encryptSecret, totpCode, verifyTotp } from "./totp";

const seed = base32Encode(Buffer.from("12345678901234567890"));
assert.equal(seed, "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ");
assert.deepEqual(base32Decode(seed), Buffer.from("12345678901234567890"));

const vectors: [number, string][] = [
  [59, "287082"],
  [1111111109, "081804"],
  [1111111111, "050471"],
  [1234567890, "005924"],
  [2000000000, "279037"],
];
for (const [t, code] of vectors) assert.equal(totpCode(seed, t * 1000), code, `t=${t}`);

const t = 1234567890 * 1000;
assert.ok(verifyTotp(seed, totpCode(seed, t - 30_000), t) !== null);
assert.ok(verifyTotp(seed, totpCode(seed, t + 30_000), t) !== null);
assert.equal(verifyTotp(seed, totpCode(seed, t - 60_000), t), null);
assert.equal(verifyTotp(seed, "12345", t), null);
assert.equal(verifyTotp(seed, "abcdef", t), null);

process.env.TWO_FACTOR_ENCRYPTION_KEY = "test-key-test-key-test-key-test-key";
const enc = encryptSecret(seed);
assert.equal(decryptSecret(enc), seed);
assert.notEqual(encryptSecret(seed), enc, "fresh IV each time");
const parts = enc.split(".");
parts[3] = Buffer.from("tampered").toString("base64");
assert.throws(() => decryptSecret(parts.join(".")));

console.log("totp: all checks passed");
