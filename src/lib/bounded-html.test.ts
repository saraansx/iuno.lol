import assert from "node:assert/strict";
import { readBoundedText, MAX_HTML_BYTES } from "./bounded-html";

function resFrom(body: string, headers: Record<string, string> = {}): Response {
  return new Response(body, { headers });
}

async function main() {
  const small = "<html><body>" + "x".repeat(1000) + "</body></html>";
  assert.equal(await readBoundedText(resFrom(small)), small, "small body returned intact");

  const exact = "y".repeat(100);
  assert.equal(await readBoundedText(resFrom(exact), 100), exact, "body exactly at the cap is kept");

  const tooBig = "z".repeat(5_000);
  assert.equal(
    await readBoundedText(resFrom(tooBig, { "content-length": "5000" }), 1_000),
    null,
    "oversized declared length refused"
  );

  const chunked = "q".repeat(4_000);
  assert.equal(await readBoundedText(resFrom(chunked), 1_000), null, "unbounded stream is cut off");

  const emoji = "🎉".repeat(500);
  assert.equal(await readBoundedText(resFrom(emoji), 10_000), emoji, "multibyte text decodes intact");

  const splitBody = "a".repeat(3) + "🎉" + "b".repeat(3);
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const bytes = new TextEncoder().encode(splitBody);
      controller.enqueue(bytes.slice(0, 5));
      controller.enqueue(bytes.slice(5));
      controller.close();
    },
  });
  const splitOut = await readBoundedText(new Response(stream));
  assert.ok(splitOut && splitOut.includes("🎉"), `emoji split across chunks survived: ${splitOut}`);

  assert.equal(await readBoundedText(new Response(null)), "", "null body yields empty string");

  assert.equal(MAX_HTML_BYTES, 2 * 1024 * 1024, "cap is 2MB");
  assert.ok(MAX_HTML_BYTES > 400 * 1024, "cap has headroom over a ~350KB real page");

  console.log("bounded-html: all assertions passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});