
import { createHash, createHmac } from "node:crypto";

export interface R2ClientConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

export interface R2Object {
  key: string;
  size: number;
  lastModified: string | null;
}

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

const REGION = "auto";
const SERVICE = "s3";

function sha256Hex(data: string | Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac("sha256", key).update(data).digest();
}

function encodeRfc3986(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function encodeKeyPath(key: string): string {
  return key.split("/").map(encodeRfc3986).join("/");
}

function canonicalQuery(params: Record<string, string | undefined>): string {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => [encodeRfc3986(k), encodeRfc3986(String(v))] as const)
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
}

function signingKey(secretAccessKey: string, dateStamp: string): Buffer {
  const kDate = hmac(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = hmac(kDate, REGION);
  const kService = hmac(kRegion, SERVICE);
  return hmac(kService, "aws4_request");
}

function decodeXml(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCharCode(Number(d)))
    .replace(/&amp;/g, "&");
}

function xmlTag(block: string, tag: string): string | null {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return match ? decodeXml(match[1]) : null;
}

export function createR2Client(config: R2ClientConfig, fetchImpl: FetchLike = fetch) {
  const host = `${config.accountId}.r2.cloudflarestorage.com`;
  const baseUrl = `https://${host}`;

  async function send(opts: {
    method: "GET" | "PUT" | "HEAD" | "DELETE";
    key?: string;
    query?: Record<string, string | undefined>;
    body?: Uint8Array;
    contentType?: string;
  }): Promise<Response> {
    const { method, key, query = {}, body, contentType } = opts;
    const path = key ? `/${encodeRfc3986(config.bucket)}/${encodeKeyPath(key)}` : `/${encodeRfc3986(config.bucket)}`;
    const qs = canonicalQuery(query);
    const url = `${baseUrl}${path}${qs ? `?${qs}` : ""}`;

    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);

    const payload = body ?? new Uint8Array(0);
    const payloadHash = sha256Hex(payload);

    const headers: Record<string, string> = {
      host,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
    };
    if (contentType) headers["content-type"] = contentType;

    const signedHeaderNames = Object.keys(headers).sort();
    const canonicalHeaders = signedHeaderNames.map((h) => `${h}:${headers[h].trim()}\n`).join("");
    const signedHeaders = signedHeaderNames.join(";");

    const canonicalRequest = [
      method,
      path,
      qs,
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join("\n");

    const scope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      scope,
      sha256Hex(canonicalRequest),
    ].join("\n");

    const signature = createHmac("sha256", signingKey(config.secretAccessKey, dateStamp))
      .update(stringToSign)
      .digest("hex");

    const authorization =
      `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${scope}, ` +
      `SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const sendHeaders: Record<string, string> = {
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      authorization,
    };
    if (contentType) sendHeaders["content-type"] = contentType;

    const requestBody =
      method === "GET" || method === "HEAD" || method === "DELETE"
        ? undefined
        : (payload as unknown as BodyInit);

    return fetchImpl(url, {
      method,
      headers: sendHeaders,
      body: requestBody,
    });
  }

  return {
    host,
    bucket: config.bucket,

    async putObject(key: string, body: Uint8Array, contentType = "application/octet-stream") {
      return send({ method: "PUT", key, body, contentType });
    },

    async deleteObject(key: string) {
      return send({ method: "DELETE", key });
    },

    async headObject(key: string) {
      return send({ method: "HEAD", key });
    },

    async listObjects(prefix?: string): Promise<R2Object[]> {
      const out: R2Object[] = [];
      let token: string | undefined;
      for (let page = 0; page < 1000; page++) {
        const res = await send({
          method: "GET",
          query: {
            "list-type": "2",
            "max-keys": "1000",
            prefix,
            "continuation-token": token,
          },
        });
        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          throw new Error(`R2 list failed: HTTP ${res.status} ${detail.slice(0, 200)}`);
        }
        const xml = await res.text();
        for (const match of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
          const block = match[1];
          const key = xmlTag(block, "Key");
          if (key === null) continue;
          out.push({
            key,
            size: Number(xmlTag(block, "Size") ?? 0),
            lastModified: xmlTag(block, "LastModified"),
          });
        }
        const truncated = xmlTag(xml, "IsTruncated") === "true";
        const next = xmlTag(xml, "NextContinuationToken");
        if (!truncated || !next) break;
        token = next;
      }
      return out;
    },
  };
}

export type R2Client = ReturnType<typeof createR2Client>;
