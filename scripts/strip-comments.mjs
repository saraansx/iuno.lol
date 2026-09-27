#!/usr/bin/env node
/**
 * scripts/strip-comments.mjs
 *
 * Removes `//` line comments and block comments from source files, safely.
 *
 * It parses each file with the TypeScript compiler and only removes real
 * comment tokens, so `//` inside strings/URLs, template literals and regexes
 * is never touched. Load-bearing directive comments (@ts-*, eslint-disable,
 * prettier-ignore, triple-slash, source maps, bundler magic comments) are kept
 * unless you pass --all.
 *
 * Usage:
 *   node scripts/strip-comments.mjs                 # dry run over ./src
 *   node scripts/strip-comments.mjs --write         # apply to ./src
 *   node scripts/strip-comments.mjs src scripts      # dry run over given paths
 *   node scripts/strip-comments.mjs --write --all    # also strip directives
 */
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const argv = process.argv.slice(2);
const WRITE = argv.includes("--write");
const ALL = argv.includes("--all");
const TARGETS = argv.filter((a) => !a.startsWith("--"));
if (TARGETS.length === 0) TARGETS.push("src");

const EXCLUDE_DIRS = new Set([
  "node_modules", ".next", ".git", "dist", "build",
  "out", "coverage", "graphify-out", "drizzle", ".vercel", ".turbo",
]);
const EXTS = new Set([".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"]);

// Load-bearing comments (compiler / linter / bundler directives). Kept unless
// --all is passed, because deleting them changes build or lint behaviour.
const PRESERVE = [
  /^\/\/\/\s*<reference/,
  /@ts-(ignore|expect-error|nocheck|check)\b/,
  /\beslint-(disable|enable)/,
  /\bprettier-ignore\b/,
  /\bstylelint-/,
  /\b(istanbul|c8|v8)\s+ignore\b/,
  /@(license|preserve|jsx|jsxRuntime|jsxImportSource|jsxFrag)\b/,
  /webpack[A-Z]\w+/,
  /^\/[*/]!/,
  /sourceMappingURL=/,
];

const isDirective = (t) => PRESERVE.some((re) => re.test(t));

/**
 * Every comment range in the file. We ask the compiler for the leading and
 * trailing comment ranges of each token: every comment is trivia belonging to
 * some token, so walking all tokens (and de-duping) yields all comments — and
 * because the parser has already resolved strings/regexes/templates, a `//`
 * inside them is not a token boundary and can't be mistaken for a comment.
 */
function collectCommentRanges(sourceFile) {
  const text = sourceFile.getFullText();
  const ranges = [];
  const seen = new Set();
  const add = (r) => {
    const key = `${r.pos}:${r.end}`;
    if (!seen.has(key)) {
      seen.add(key);
      ranges.push(r);
    }
  };
  const visit = (node) => {
    ts.getLeadingCommentRanges(text, node.getFullStart())?.forEach(add);
    ts.getTrailingCommentRanges(text, node.getEnd())?.forEach(add);
    node.getChildren(sourceFile).forEach(visit);
  };
  visit(sourceFile);
  return ranges.sort((a, b) => a.pos - b.pos);
}

/**
 * Grow a comment's [pos, end) into the span to actually delete:
 *  - alone on its line  -> the whole line, including its newline
 *  - trailing code      -> the comment plus the spaces/tabs before it
 *  - block then code     -> just the comment itself
 */
function expandRange(text, pos, end) {
  let lineStart = pos;
  while (lineStart > 0 && text[lineStart - 1] !== "\n") lineStart--;
  let nl = end;
  while (nl < text.length && text[nl] !== "\n") nl++;

  const beforeBlank = text.slice(lineStart, pos).trim() === "";
  const afterBlank = text.slice(end, nl).trim() === "";

  if (beforeBlank && afterBlank) {
    return { start: lineStart, end: nl < text.length ? nl + 1 : nl };
  }
  if (!beforeBlank) {
    let s = pos;
    while (s > lineStart && (text[s - 1] === " " || text[s - 1] === "\t")) s--;
    return { start: s, end };
  }
  return { start: pos, end };
}

function scriptKindFor(file) {
  if (file.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (file.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (/\.(mjs|cjs|js)$/.test(file)) return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

/** Strip a single file's text. Returns the new text and how many comments went. */
function stripFile(text, file) {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, scriptKindFor(file));
  let ranges = collectCommentRanges(sf);
  if (!ALL) ranges = ranges.filter((r) => !isDirective(text.slice(r.pos, r.end)));
  if (ranges.length === 0) return { out: text, removed: 0 };

  const spans = ranges.map((r) => expandRange(text, r.pos, r.end)).sort((a, b) => a.start - b.start);
  const merged = [];
  for (const cur of spans) {
    const last = merged[merged.length - 1];
    if (last && cur.start <= last.end) last.end = Math.max(last.end, cur.end);
    else merged.push({ ...cur });
  }

  let out = text;
  for (let i = merged.length - 1; i >= 0; i--) {
    out = out.slice(0, merged[i].start) + out.slice(merged[i].end);
  }
  out = out.replace(/\n{3,}/g, "\n\n");
  return { out, removed: ranges.length };
}

function walk(dir, acc) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith(".") || EXCLUDE_DIRS.has(entry.name)) continue;
      walk(full, acc);
    } else if (EXTS.has(path.extname(entry.name)) && !entry.name.endsWith(".d.ts")) {
      acc.push(full);
    }
  }
  return acc;
}

const files = [];
for (const t of TARGETS) {
  const p = path.resolve(ROOT, t);
  if (!fs.existsSync(p)) {
    console.warn(`skip (not found): ${t}`);
    continue;
  }
  if (fs.statSync(p).isDirectory()) walk(p, files);
  else if (EXTS.has(path.extname(p)) && !p.endsWith(".d.ts")) files.push(p);
}

let totalRemoved = 0;
let changedFiles = 0;
for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  let result;
  try {
    result = stripFile(src, file);
  } catch (e) {
    console.warn(`skip (parse error): ${path.relative(ROOT, file)} — ${e.message}`);
    continue;
  }
  if (result.removed > 0 && result.out !== src) {
    totalRemoved += result.removed;
    changedFiles++;
    if (WRITE) fs.writeFileSync(file, result.out, "utf8");
    console.log(`${WRITE ? "stripped" : "would strip"} ${String(result.removed).padStart(4)}  ${path.relative(ROOT, file)}`);
  }
}

console.log("");
console.log(`${WRITE ? "Removed" : "Would remove"} ${totalRemoved} comments across ${changedFiles} file(s) — ${files.length} scanned.`);
if (!WRITE) {
  console.log("Dry run — nothing written. Re-run with --write to apply.");
  console.log("Directive comments were kept; add --all to strip those too.");
}

